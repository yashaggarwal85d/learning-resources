# Fact-check: de.micro-batch-incremental-execution

## Claims table

| Claim | Basis | Check |
|---|---|---|
| Every batch writes one offset-log entry and one commit-log entry, in lockstep (commit never ahead of offset) | Measured (`examples.py`) | `python3 examples.py` assertions, passing |
| Both logs are plain, versioned, human-readable files | Measured | same |
| Steady-state batch duration never drops below roughly a hundred-plus milliseconds, even at a zero-second trigger interval and almost no data | Measured | same |
| A fixed processingTime trigger spaces consecutive batch starts at the configured interval, even though each batch's own execution time is far shorter | Measured | same |
| The offset log is checkpointed before the microbatch runs; the commit log is written only after it completes | Sourced, `MicroBatchExecution.scala` | `sources.mjs check`, word for word |
| The one-time trigger is deprecated in favor of available-now | Sourced, Spark streaming docs | same |
| Available-now processes all currently available data, across possibly multiple batches, then stops the query on its own | Sourced, Spark streaming docs | same |

## Red team

- **Could the measured latency floor just be this sandbox's own slowness, not a real property
  of micro-batch execution?** The claim doesn't depend on an absolute number holding across
  machines -- it depends on the floor being far above zero and not shrinking as the batch's own
  data shrinks toward nothing, which is exactly what was measured: batch 0 (JIT/driver warmup)
  is excluded, and steady-state batches with essentially one row each still average well over a
  hundred milliseconds, not single digits.
- **Is the trigger-interval spacing claim just measuring Python's own `time.sleep` imprecision
  rather than Spark's actual scheduling?** No -- the gaps are computed from `recentProgress`'s
  own `timestamp` field, which Spark itself stamps at batch start, not from anything the probe
  script times externally; the test tolerates a small margin (`INTERVAL_S - 0.5`) specifically
  to allow for real scheduling jitter without weakening the claim that the gap tracks the
  configured interval, not zero.
- **Does "commit never ahead of offset" actually test anything, since a commit naturally can't
  exist before its matching offset in normal operation?** The assertion is deliberately
  checking the invariant as observed across every batch in a live run, not asserting something
  impossible to violate: a real bug (e.g. a race writing the commit log first) would show up
  exactly as a commit batch ID with no matching offset entry, which this check would catch.
- **Is the claim about trigger types (available-now vs. fixed interval) itself measured, or
  only sourced?** Only sourced here. This topic's own `examples.py` measures the offset/commit
  log pairing, the latency floor, and fixed-interval spacing directly, but doesn't run an
  available-now query to completion and confirm it stops on its own -- that behavior is named
  and quoted from the docs rather than independently reproduced, since the first three claims
  already establish the checkpoint and timing mechanics available-now itself relies on.

## Abandoned approaches

An early version of the latency-floor probe used `Trigger.ProcessingTime("0 seconds")` and
looked at every batch including batch 0, which includes one-time driver/JVM warmup costs
(class loading, initial query planning) far larger than the steady-state floor -- this
inflated the measured "floor" to over a second and made the claim look far weaker than the
real, steady-state behavior. Fixed by excluding the first batch from every latency and timing
assertion and measuring only the batches that follow it, which is also why the trigger-spacing
probe (claim 3) skips the first two batches rather than just the first one, since the first
interval boundary after startup can still be partly absorbed by residual warmup.
