# Fact-check: de.rocksdb-state-store-checkpointing

## Claims table

| Claim | Basis | Check |
|---|---|---|
| A growing-key-count aggregation on the default (HDFS-backed) state store provider produces real, nonzero JVM GC time | Measured (`examples.py`) | `python3 examples.py` assertions, passing |
| The identical workload on the RocksDB provider produces meaningfully less GC time (under 60% of the default provider's) | Measured | same |
| Changelog checkpointing writes meaningfully fewer total bytes (under 50%) than snapshot checkpointing for the identical RocksDB workload | Measured | same |
| The HDFS-backed provider stores all data in a memory map first, backed by files in an HDFS-compatible file system | Sourced, Spark streaming docs | `sources.mjs check`, word for word |
| Maintaining millions of keys on the default provider can cause large JVM GC pauses and high variance in micro-batch times | Sourced, Spark streaming docs | same |
| Changelog checkpointing uploads only the changes since the last checkpoint, not the full RocksDB data files | Sourced, Spark streaming docs | same |
| Checkpoint structure v2 (SPARK-49374) guarantees a linear version lineage via globally unique, never-overwritten checkpoint IDs | Sourced, Apache Spark JIRA | same |

## Red team

- **Could the measured GC-time difference just reflect the two SparkSessions having different
  warm-up costs, rather than a real provider difference?** Both runs use the identical
  workload (same rate, same key-generation logic, same run duration) and the same `local[2]`
  configuration, differing only in `spark.sql.streaming.stateStore.providerClass`; GC time is
  read from the REST API's own `totalGCTime`, which accumulates only time actually spent
  collecting, not session startup overhead.
- **Is the 60%-of-default threshold for the GC comparison arbitrary, or does it reflect a real
  gap?** The threshold is deliberately loose (not near-zero) precisely to avoid a flaky
  assertion in a shared, noisy sandbox; the real measured gap in practice runs well under that
  threshold, but the assertion itself only needs to confirm a meaningful difference exists, not
  pin an exact ratio that could vary run to run.
- **Could the checkpoint-byte-count difference just reflect fewer total rows being written
  under changelog checkpointing, rather than a cheaper encoding of the same state?** Both runs
  use the identical rate, key-generation logic, and run duration, so both accumulate the
  same state; the only configuration difference is `rocksdb.changelogCheckpointing.enabled`,
  which the docs describe as changing what gets uploaded per commit, not the underlying
  aggregation's own row count.
- **Is checkpoint structure v2 actually measurable, or only sourced?** Only sourced, and
  explicitly so: the JIRA epic was still Open and Unresolved with no fix version at the time of
  this research, meaning it isn't present in Spark 4.0.1, the version pinned for every measured
  claim in this chapter. Measuring it would require a different, unreleased Spark build.

## Abandoned approaches

An initial attempt measured key-count growth using the `rate-micro-batch` source with
`query.processAllAvailable()` called in a loop, intending to control batch count precisely --
but `rate-micro-batch` behaves as an unbounded source whose "available" offset keeps advancing
whenever polled, so `processAllAvailable()` never actually returned. Switched to the plain
`rate` source with a fixed `processingTime` trigger and a wall-clock `time.sleep()`, the same
timing-control pattern used in this chapter's earlier streaming topics, which ran deterministically
and let both probes finish in a bounded amount of time.
