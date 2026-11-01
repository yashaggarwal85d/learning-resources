# Fact-check: de.pipelined-mpp-staged-batch

## Claims table

| Claim | Basis | Check |
|---|---|---|
| A batched, vectorised computation over the same per-row workload runs meaningfully faster per row than the identical computation done one row at a time | Measured (`examples.py`) | `python3 examples.py` assertions, passing |
| A streaming pipeline that discards each row's result immediately keeps peak memory essentially flat across a hundredfold row-count increase | Measured | same |
| A pipeline that materialises the full intermediate result into a list has peak memory that grows proportionally with row count | Measured | same |
| Trino's default behavior fails the whole query if a node lacks resources or otherwise fails mid-execution | Sourced, Trino "Fault-tolerant execution" docs | `sources.mjs check`, word for word |
| Fault-tolerant execution spools intermediate exchange data so it can be re-used by another worker after a fault; `TASK` retry policy retries individual tasks and requires a configured exchange manager | Sourced, same | same |
| Ray Data's streaming execution doesn't wait for one operator to finish before starting the next; each operator reads/writes a stream of blocks through its own out queue | Sourced, Ray "Ray Data internals" docs | same |
| Spark needs an all-to-all shuffle to bring together values across partitions for operations like `reduceByKey`; Spark actions run through stages separated by shuffles | Sourced, Spark "RDD Programming Guide" | same |

## Red team

- **Does the batch-vs-row speed gap just reflect NumPy import/warmup cost, not a real
  per-element difference?** The comparison runs the full generator for both the row-at-a-time
  and vectorised-batch functions over the same two hundred thousand elements in the same
  process, after NumPy is already imported; the assertion requires the vectorised run to be at
  least three times faster, not a marginal difference that warmup noise could produce.
- **Is the memory-growth claim just measuring Python/tracemalloc's own fixed overhead rather
  than the pipelines' real memory use?** The streaming pipeline's own peak memory is checked to
  stay within five times its small-N value across a hundredfold row-count increase, while the
  materialising pipeline's peak at the same large N is required to be both fifty times its own
  small-N value and fifty times the streaming pipeline's large-N value -- a gap far wider than
  any plausible tracemalloc bookkeeping noise.
- **Is "fault-tolerant execution" actually a different execution model from Spark's, rather than
  the same idea under a new name?** No -- that is the topic's own elaborate step: it's the same
  pipelined engine, choosing on purpose to spool data the way Spark always does, only where it
  decides the recoverability is worth the cost. The claims table above treats this as sourced,
  not measured, since it names Trino's documented behavior rather than a result from running a
  live Trino cluster.

## Abandoned approaches

An initial attempt tried to demonstrate Spark's own stage-recovery granularity directly, by
building a two-shuffle-boundary RDD pipeline and deleting one shuffle file mid-job to see
whether only the downstream stage recomputed. This produced a full driver/job crash
(`RpcEndpointNotFoundException`, a dead `BlockManagerMasterEndpoint`) rather than a clean,
isolated stage retry -- too fragile and non-deterministic to turn into a reliable automated
assertion. Settled on two independently pre-verified, simpler claims (vectorised-batch-vs-row
throughput; streaming-vs-materialising memory growth) instead, matching this chapter's own
established precedent (topic 21, `de.task-retry-fetch-failure-speculation`) for using a
narrower, more reliable measurement over a more ambitious but brittle one.
