# Outline — `de.jobs-cronjobs-batch-pipelines` (full, §12.2)

Bridge (from topic 4): "A pod with the right resources still has to be a pod that is meant to end.
A nightly pipeline is not a service: it runs, finishes, and must be retried with care."

## Steps

1. **Hook.** The shop's `orders-rollup` Job has 200 partitions; partition 137 contains a
   malformed record and crashes every time. With one shared retry budget, the whole Job dies
   after 6 failures, with 199 partitions possibly unfinished.
2. **Predict.** Which setting makes exactly partition 137 fail alone while the other 199 finish,
   and what is the Job's final status? (Options: a higher shared `backoffLimit`; per-index backoff;
   nothing — a Job can't isolate one partition.)
3. **Indexed Jobs: no work queue.** `completionMode: Indexed` gives each pod a completion index
   (0 to completions-1) via the `batch.kubernetes.io/job-completion-index` annotation/label,
   `JOB_COMPLETION_INDEX`, and the pod's own hostname — index *i* always processes partition *i*,
   with no external queue to coordinate. Deliberately takeaway-free (the test's "from" step).
4. **More than one pod per index.** The Job controller can start a replacement before the old one
   is confirmed terminal — the same index may briefly have two pods running. Each index's work
   must therefore be idempotent (names Chapter 11's idempotent-tasks topic). — takeaway
5. **Per-index backoff, GA in 1.33.** `backoffLimitPerIndex` counts retries per index; a failing
   index lands in `failedIndexes`, doesn't stop the others, but still fails the overall Job unless...
6. **...capped by `maxFailedIndexes`.** More than this many failed indexes and the Job terminates
   every remaining pod and fails as a whole — otherwise all 200 indexes run to completion even with
   failures scattered among them. — takeaway
7. **Pod failure policy: classify, don't just count.** `onExitCodes`/`onPodConditions` rules with
   `Ignore` / `FailJob` / `FailIndex` / `Count` — an eviction (`DisruptionTarget`) shouldn't burn
   the retry budget, exit code 42 should fail the whole Job immediately instead of retrying 6 times.
8. **Predict 2.** A node drain evicts a running pod. Does that count against `backoffLimitPerIndex`
   if the Job's pod failure policy marks `DisruptionTarget` as `Ignore`? (Options: yes always; no,
   because Ignore means it was never counted; depends on which exit code the kubelet reports.)
9. **Success policy: finish on partial completion.** `successPolicy` (succeededIndexes /
   succeededCount) ends a Job the moment the chosen indexes succeed and kills the lingering pods —
   a GA-in-1.33 answer to "only the leader's success matters" workloads. — takeaway
10. **TTL cleanup.** `ttlSecondsAfterFinished` deletes a finished Job and its pods together — after
    which its logs are gone unless shipped elsewhere first.
11. **CronJob: three concurrency policies, one overrun.** `Allow` (default, may overlap), `Forbid`
    (skip the new run), `Replace` (kill the old, start the new) — shown against the same overrunning
    run.
12. **Missed schedules and the 100-miss rule.** `startingDeadlineSeconds` bounds how late a missed
    run may still start; with no deadline set, a controller outage longer than 100 missed intervals
    means Kubernetes gives up and logs an error rather than catching up forever. — takeaway
13. **The boundary: CronJob vs orchestrator.** A CronJob creates a Job "approximately once" per
    schedule — so Jobs must be idempotent — and has no dependency graph, no data intervals, no
    backfill, no cross-job retries or alerts; that's Chapter 11's subject, named as a boundary, not
    retaught.
14. **Recap.**

## Notes

- CHAPTER.md's `uses` list names Chapter 11 §11.1 ids ("Idempotent tasks and failure semantics",
  "Data intervals, catchup and backfills") to look up in `registry.ts`. Checking now: a sibling
  thread's chapter-11 work had landed `de.idempotent-tasks-failure-semantics` and
  `de.data-intervals-catchup-backfills` on `main` (pulled in by earlier merges in this thread) —
  their `introduces` ids are used directly, no gap.
- `pdb-priority-preemption` (topic 4) is used for the disruption-as-pod-condition link in step 7-8.
- Lab: none of its own (per CHAPTER.md); examples run as pure-Python models of the documented
  controller behavior (per-index backoff ranking, concurrency-policy resolution, missed-schedule
  counting), since no local cluster is reachable on this build machine — disclosed in REVIEW.md.
