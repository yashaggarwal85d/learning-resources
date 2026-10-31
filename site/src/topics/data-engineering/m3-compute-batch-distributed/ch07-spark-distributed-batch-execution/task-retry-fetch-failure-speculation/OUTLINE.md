# Outline: de.task-retry-fetch-failure-speculation

## Syllabus line (verbatim, `syllabus/data-engineering.md:436`)

> **Task retry, fetch failure and speculation** — task retry up to `spark.task.maxFailures`; fetch failures that resubmit the parent shuffle-map stage; executor loss taking shuffle files with it (external shuffle service, graceful decommissioning with block migration on Kubernetes); speculative execution and its hazard with non-idempotent sinks.

## Learning outcomes

- Trace, from an event log, why one executor's death resubmitted an entire upstream stage
  rather than one task.
- Explain why speculative execution is unsafe with a non-idempotent sink.

## Reel steps (10, kind: full)

1. Hook — one task in a stage of four keeps failing. Does the whole job die the first time,
   or does Spark give it more chances?
2. Reveal: the baseline — under a high enough failure limit, the flaky task eventually
   succeeds and the job finishes. (No takeaway — reel test's own "from" step.)
3. Predict (index 2, within first 4) — lower that same limit below what the task actually
   needs. Does the job still recover, or does it finally give up?
4. Reveal: it gives up — the exact same task, same failures, now aborts the whole job once
   the lower limit is hit. (No takeaway — immediately after a predict.)
5. Elaborate — why: retry only buys a fixed number of extra chances; run out, and the job
   dies on a task that would have eventually succeeded. **Takeaway 1.**
6. Predict (index 5) — now lose a piece of already-finished work mid-shuffle instead of
   failing a task outright. Does Spark just redo that one missing piece, or more?
7. Reveal: far more — the entire upstream stage that produced the lost piece gets resubmitted
   and rerun in full, not just the one task that noticed it missing. (No takeaway —
   immediately after a predict.)
8. Elaborate — why: once shuffle output is gone, there's no partial fix — the only way back is
   rerunning everything that produced it. **Takeaway 2.**
9. Reveal: both failures side by side — a task retried a bounded number of times, and a lost
   shuffle piece that drags an entire earlier stage back into motion.
10. Recap. **Takeaway 3.**

Engagement arc: two predicts (≥2 required), the first at index 2 (≤4 required); three
takeaways, each on a step that is neither the reel test's "from" step (here step 2) nor
immediately after a predict (here steps 4 and 7) — same pattern as topics 16-20.

## Narrator's line of thought per step

1. Pose the concrete setup: one piece of work in a group of four keeps failing. Does the
   whole thing collapse on the first failure, or does the engine try again.
2. Name the baseline: given enough tries, that one troublesome piece eventually comes
   through, and the whole job finishes normally.
3. Invite a guess: give that same piece far fewer tries than it actually needs. Does the job
   still pull through, or does it finally stop trying.
4. It stops trying. The identical piece, the identical failures, but this time the whole job
   gives up once its chances run out.
5. Why: a retry limit is a fixed number of extra chances, not an unlimited one — spend them
   all, and the job dies on work that might have eventually succeeded anyway.
6. A second guess: this time, instead of a piece failing outright, a piece of already-finished
   work simply goes missing partway through. Does the engine just redo that missing piece
   alone, or does it reach further back.
7. Much further back. The entire earlier stage that produced the missing piece gets rerun in
   full, not just the one downstream piece that noticed it was gone.
8. Why: once that earlier work is gone, there's no partial patch available — the only way to
   get it back is rerunning everything that made it in the first place.
9. Put both kinds of failure side by side: one bounded by a simple retry count, the other
   dragging an entire earlier stage back into motion.
10. Pull the thread: a retry limit only buys a fixed number of extra chances, and losing
    already-finished work can cost you far more than the one piece that noticed it was gone.

## Post-notes layers

- `outcomes`: reading an event log to tell a bounded task retry apart from a fetch failure
  that resubmits an entire earlier stage — the first shows up as the same stage attempt
  retrying one task index; the second shows up as a brand-new stage attempt rerunning every
  task in an earlier stage.
- `speculative execution and non-idempotent sinks`: speculation launches a second, independent
  copy of a slow task alongside the original rather than instead of it — safe for anything
  whose output is naturally overwritten or deduplicated, but a genuine correctness hazard for
  a sink that performs a side effect (an append, an external counter, a non-transactional
  write) every time it runs, since both copies can perform that side effect. Sourced and
  named here rather than measured, since this sandbox's own local-mode scheduler did not
  reliably trigger a speculative relaunch across repeated attempts.
- `production failures`: assuming a task retry and a fetch-failure stage resubmission cost
  the same amount of rework, when the second can silently redo far more upstream work than a
  quick glance at "one more attempt" in the UI suggests.
- `frontier`: this chapter's own closing topic in this section ties every failure mode so far
  — spill, caching cost, GC, and this topic's own retries — back to one place: the Spark UI
  itself, read as a fixed triage order.

## `examples.py` claims (all measured against real PySpark 4.0.1)

1. A task that fails fewer times than the configured failure limit (`local[2,4]`'s own
   `maxFailures`) is retried until it succeeds, and the job completes normally; the identical
   flaky task, run again under a lower limit (`local[2,2]`) that it can't stay under, aborts
   the job with the exact "failed N times; aborting job" message once the limit is reached.
2. A fetch failure on the reduce side — caused by deleting a real shuffle data file after the
   map stage wrote it, before the reduce stage reads it — resubmits the entire parent
   shuffle-map stage as a second stage attempt that reruns every map task, confirmed directly
   against the Spark UI's own REST API (two attempts for the map stage; the reduce stage's own
   first attempt failing before a later attempt completes).

## Bridge / handoff (copied exactly from CHAPTER.md)

- Bridge: "GC can kill an executor. This topic is what Spark does about any executor or task
  death, GC-caused or not: retrying the task, and, when the death took shuffle files with it,
  resubmitting the whole stage that produced them."
- Handoff: "Section 7.3's last topic ties every symptom in this section together: the Spark UI
  itself, the one instrument that actually shows spill, GC, retries and skew as evidence
  rather than theory."

## Concept ledger

- Introduces: `spark.task-retry-fetch-failure`, `spark.speculative-execution`.
- Uses: `spark.shuffle-mechanics`, `spark.task-hierarchy`.

## Claims list

| Claim | Source |
|---|---|
| A task failing `maxTaskFailures` times aborts the entire task set | `TaskSetManager.scala` |
| The scheduler's own literal abort log message, naming the exact failure count | `TaskSetManager.scala` |
| `FetchFailed` is handled as its own distinct failure case, not folded into ordinary task exceptions | `TaskSetManager.scala` |
| Speculation re-launches a slow task as a second, independent attempt | Spark "Configuration" docs |
| Graceful decommissioning migrates both RDD blocks and shuffle blocks to a remote executor before shutdown | Spark "Configuration" docs |
| Kubernetes has its own decommissioning script hook, and does not yet offer an external shuffle service | Spark "Running Spark on Kubernetes" docs |

## Progress

Next topic: 22. `de.diagnosing-jobs-spark-ui` (re-verify exact scope when reached; closes
section 7.3).
