# OUTLINE: Resumable multi-TB historical backfill (`de.resumable-multi-tb-historical`)

## Learning outcomes
1. Design a five-year backfill of the shop's orders history with the production SLOs it must
   protect, a chunk size and checkpoint scheme from the estimate, and a throttle with its
   back-off signal.
2. Design a shadow-and-swap plan and a data-diff acceptance rule.
3. Simulate a mid-run crash and show resume from the checkpoint with no duplicates.
4. Estimate duration, cost and the storage overhead of the shadow; state the next bottleneck at
   ten times.

## Engagement arc
- Hook: step 1 (a revenue-logic bug live for fourteen months needs five years reprocessed; the
  first attempt is one job that runs long, takes the shared warehouse down for finance on day
  two, and dies near the end with nothing saved).
- Predict: step 2, within the first four steps (the four decisions, among chunking, idempotence,
  a checkpoint, a throttle and a shadow table, that would have turned this into a boring week).
- Takeaways: step 4 (a checkpoint resumes at the first incomplete chunk, never the start), step 6
  (a throttle's signal is production's own latency, not a fixed concurrency number), step 8 (the
  diff must show only the intended change, or the swap doesn't happen).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** a single backfill job runs for most of a day, takes the shared warehouse's
  concurrency down for finance on day two, and dies near the end with nothing saved.
- **On screen:** one long job; a concurrency drop for finance; a crash with nothing checkpointed.

### 2. Predict
- **fig:** what four decisions, made before the first chunk ran, turn this into a boring week?
- **Options:** (a) just a bigger machine and a longer timeout, since the job only needed more
  resources and more patience [wrong — a bigger single job still dies as one unit and still
  contends with production the same way, just for longer]; (b) chunking, idempotence, a
  checkpoint, a throttle, and a shadow table, each addressing a specific failure the single job
  hit [correct].

### 3. Reveal — chunk the history into independent pieces
- **fig:** five years of history cut into a grid of chunk cells, each one a day or a partition,
  each independent of its neighbors.
- **Moves:** the grid lays out; the backfill begins advancing across the cells left to right.

### 4. Reveal — idempotent chunks and a durable checkpoint
- **fig:** a crash mid-run stops the backfill at one cell; the checkpoint bar shows every
  completed chunk, and the resume picks up at the first incomplete one, not cell one.
- **takeaway:** "A checkpoint resumes at the first incomplete chunk, never the start — that's the entire point of making every chunk idempotent."

### 5. Reveal — throttle against shared resources
- **fig:** a concurrency gauge and a rate limit on source reads, both capped to leave headroom;
  a production-latency line that, when it rises, pulls the gauge down automatically.
- **Narrator's line of thought:** she treats "what signal tells the backfill to slow down" as
  the actual design question, not "how many workers can we afford to run."

### 6. Reveal — the throttle responds to production, not a fixed number
- **fig:** the production-latency line rising; the concurrency gauge dropping in direct response,
  then recovering once the line falls back.
- **takeaway:** "A throttle's signal is production's own latency, not a fixed concurrency number chosen once and left alone."

### 7. Reveal — write to a shadow, then one atomic swap
- **fig:** the backfill's output fills a shadow table beside the live one; readers of the live
  table see nothing until a single atomic operation promotes the shadow in one step.
- **Narrator's line of thought:** she treats a failed run as something to discard, not repair —
  the shadow just gets dropped, and the live table was never touched.

### 8. Reveal — validate with a data diff before the swap
- **fig:** a diff panel comparing the shadow against the live table on the overlap, and against
  an independent recomputation on a sample; the panel shows only the intended change.
- **takeaway:** "The diff must show only the intended change, or the swap doesn't happen — a bug fix is supposed to change some numbers, not all of them."

### 9. Recap
- **fig:** the chunk grid, the checkpoint-and-resume mechanism, the production-aware throttle,
  the shadow-and-swap plan, and the data-diff gate, side by side.

### 10. Prove it
- **fig:** a second backfill, already running, whose throttle has been disabled by an engineer
  "to make it finish faster," with production latency already climbing.
- **predict options:** (a) let it keep running at full speed, since a backfill that's already
  partway through shouldn't be slowed down now [wrong — the throttle's whole job is to react to
  production latency as it happens, not to apply only before a run starts]; (b) re-enable the
  throttle immediately and let the latency signal govern concurrency from this point on
  [correct].

## Post-notes headings
- **Internals:** none claimed independently — the orchestrator's backfill mechanics, partition
  backfills and catch-up (Chapter 11 §11.1), write-audit-publish and data-diff internals
  (Chapter 11 §11.4), and the table-format branch-and-swap mechanics (Chapter 6 §6.3) are each
  named only as a choice pointing to its home chapter; idempotent writes are topic 6's and
  Chapter 14 topic 13's; concurrent-writer conflicts with live ingest are topic 15's.
- **Lab:** none of its own; the crash-and-resume simulation (no duplicate chunk output after a
  mid-run kill), the throttle simulation against a production-latency signal, and the
  duration-and-cost estimate are this topic's executable evidence.
- **Production:** the hook's own single-job-dies-with-nothing-saved scenario as the concrete
  shape "four decisions, taken once, prevent this" takes in practice.
- **Frontier:** none claimed — chunked idempotent backfills and shadow-then-swap validation are
  established practice (Dagster and Iceberg both ship the mechanisms), not an emerging technique.
- **Where this goes next:** the backfill replays history through today's logic. A related
  question is whether you needed two pieces of logic in the first place: one for the stream and
  one for the batch correction. The next design builds the same pipeline both ways, as a
  streaming-only Kappa design and a Lambda design with a batch layer, and argues which earns its
  complexity.

## Concept ledger
- **Introduces:** `backfill-design-protect-production`, `chunk-idempotent-checkpoint`,
  `throttle-backoff-signal`, `shadow-swap-diff-validation`.
- **Uses:** the method concepts as in topic 12 (`ask-to-slo-translation`,
  `capacity-estimate-chain`, `littles-law-inflight-sizing`, `data-flow-shape-decision`,
  `layout-from-dominant-access-path`, `engine-choice-by-state-latency-skill`,
  `correction-window-late-data`, `replay-backfill-as-first-class-path`,
  `failure-table-blast-radius`, `cost-waterfall-dominant-lever`, `three-alternatives-with-costs`,
  `ten-x-next-bottleneck`), plus `deterministic-transform-requirement`, `versioned-outputs`,
  `idempotent-merge-load` and `bounded-reprocessing-window` (Chapter 3), `resilient-client-patterns`
  and `connection-pool-sizing` (Chapter 4), `multi-writer-lakehouse-design` and
  `partition-writers-to-avoid-conflicts` (topic 15), `source-interrogation-checklist` — all
  confirmed live via `grep` on `introduces` arrays across `registry.ts`.
- **Declared:** `at-least-once-plus-idempotence` (Chapter 14, not yet planned or built — same
  placeholder id topics 10–15 already introduced for that gap).

## Changes from the chapter plan
`CHAPTER.md` names Chapter 3, 4, 11, 12 and 6 ids for `uses`, plus Chapter 14's
`at-least-once-plus-idempotence`. Checked each via `grep` on `introduces` arrays: every named
Chapter 3 and Chapter 4 id, plus topic 15's own two introduced ids, are confirmed live.
`at-least-once-plus-idempotence` is confirmed not live (Chapter 14 remains entirely unplanned),
so it moves to `declared`, reusing the same placeholder id every prior topic this chapter has
already used for the identical gap. Chapter 11 §11.1 and §11.4 and Chapter 12 are referenced by
`CHAPTER.md` only as named concepts the throttle and shadow-swap reveals point at, not pulled
into `uses`, since this topic's own scope line treats them as choices "sized with topic 2's
arithmetic" and conventions this topic applies rather than mechanics it builds on directly;
Chapter 11 and Chapter 12 are themselves confirmed unplanned in `registry.ts` for
data-engineering, so no new placeholder was introduced for either since no step's claim depends
on a specific id either chapter would introduce. No scope cut — this topic still leaves out the
orchestrator's backfill mechanics, write-audit-publish and data-diff internals, the table-format
branch-and-swap mechanics, idempotent writes, and concurrent-writer conflicts with live ingest,
per `CHAPTER.md`'s own "Leaves out" line.

## Claims list (for fact-check)
1. A backfill is naturally structured as running partitions independently, for each partition
   or a subset of partitions, rather than as one undifferentiated job. — SOURCES.md (Dagster).
2. The default backfill behavior launches one separate run per partition covered, which is the
   concrete shape this topic's "independent chunks" decision takes. — SOURCES.md (Dagster).
3. A backfill's writes can be performed on a separate branch, independent from the main table's
   history, before anything is promoted. — SOURCES.md (Iceberg).
4. Promoting a validated branch to the live table is one atomic fast-forward operation, not a
   repair applied to the live table after the fact. — SOURCES.md (Iceberg).
5. The checkpoint-and-resume mechanism, the production-latency-driven throttle, and the
   data-diff acceptance rule are this chapter's own established method and this topic's own
   derived design, not an independent citation beyond claims 1–4.
