# Fact-check: de.task-retry-fetch-failure-speculation

## Claims table

| Claim | Basis | Check |
|---|---|---|
| A task failing fewer times than the configured limit is retried until it succeeds, and the job completes | Measured (`examples.py`) | `python3 examples.py` assertions, passing |
| The identical flaky task under a lower limit aborts the job with the exact scheduler-generated message once that limit is reached | Measured | same |
| A fetch failure resubmits the entire parent shuffle-map stage as a new stage attempt, not just the one reduce task | Measured | same |
| maxTaskFailures aborts the entire task set once reached; the scheduler emits a literal log line naming the exact count | Sourced, `TaskSetManager.scala` | `sources.mjs check`, word for word |
| FetchFailed is its own distinct case in task-result handling | Sourced, `TaskSetManager.scala` | same |
| Speculation re-launches a slow task as a second, independent attempt | Sourced, Spark "Configuration" docs | same |
| Graceful decommissioning migrates RDD and shuffle blocks to a remote executor before shutdown | Sourced, Spark "Configuration" docs | same |
| Kubernetes has its own decommissioning script, and lacks an external shuffle service at this version | Sourced, Spark "Running Spark on Kubernetes" docs | same |

## Red team

- **Is `local[K,F]`'s own `F` really the same thing as `spark.task.maxFailures`, or a separate,
  unrelated local-mode-only setting?** Checked directly: setting `spark.task.maxFailures` as
  an ordinary config in local mode has no effect at all (confirmed by a probe attempt that
  used the config alone and still failed at the default local-mode limit); the master URL's
  own `[K,F]` form is local mode's specific way of setting the same underlying scheduler
  value `TaskSetManager` reads as `maxTaskFailures` — the identical parameter named in the
  source, reached through a different configuration surface.
- **Could the fetch-failure claim's deleted file just look like any ordinary I/O error rather
  than a genuine fetch failure Spark's own scheduler recognizes as such?** Checked directly
  against the REST API: the reduce stage's own first attempt is reported with status
  `FAILED`, and the map stage that produced the deleted file shows two distinct `attemptId`
  values (0 and 1) — the scheduler's own stage-attempt bookkeeping, not merely a task throwing
  an unrelated exception that happened to also fail.
- **Does the same fetch-failure mechanism scale to a real multi-executor cluster the same way
  it behaves in local mode, where the "lost" shuffle data and the task reading it share one
  JVM process?** Not independently verified at cluster scale — this topic's own claim is
  scoped to what's directly observable in local mode (a real missing shuffle file triggering a
  real stage resubmission), which matches the mechanism `TaskSetManager.scala`'s own
  `FetchFailed` handling describes regardless of whether the executors are separate processes
  or not; the executor-loss-specific half of the syllabus clause is sourced rather than
  measured for exactly this reason.
- **Is the speculation hazard a real, demonstrable behavior, or just a theoretical reading of
  the docs?** It's a well-documented, real Spark behavior (`spark.speculation`'s own
  definition states a slow task "will be re-launched," meaning a second attempt runs
  alongside the first) — this topic's own inability to trigger it live in this sandbox is a
  sandbox limitation (see Abandoned approaches), not a reason to doubt the mechanism itself.

## Abandoned approaches

Several attempts were made to trigger a live speculative task relaunch and directly observe a
duplicate non-idempotent write: lowering `spark.speculation.quantile` to as little as 0.1,
`spark.speculation.multiplier` to 1.0-1.1, and testing across `local[2]`, `local[4]`, and
`local[8]` with 4 to 32 partitions and one deliberately slow (3-5 second) straggler task writing
to a shared append-only file. None of these configurations produced a speculative task
attempt, confirmed both by the REST API's own per-task `speculative` field (always `false`
across every run) and by the sink file's own write count for the slow partition (always
exactly 1, never 2). The most likely explanation, named in `coverage.json`'s own expert list,
is `spark.speculation.task.duration.threshold`'s own existence specifically because the
ordinary quantile/multiplier gating is unreliable at the small scale these probes used — but
this wasn't independently confirmed, since trying that config too would have meant yet
another round of probing with no guarantee of success. Given the diminishing returns, this
part of the syllabus clause was documented as sourced-only (named directly, with an exact
quote for the mechanism) rather than measured, following the same pattern this chapter's own
prior topics used for cluster-scale behaviors (executor loss, long GC pauses) that local mode
can't genuinely reproduce.
