# Fact-check: de.spark-output-file-layout

## Claims table

| Claim | Basis | Check |
|---|---|---|
| 2, 4, 8 tasks produce exactly 8, 16, 32 files (tasks × partitions touched) | Measured (`examples.py`) | `node ... examples.py` assertions, passing |
| `maxRecordsPerFile=50000` with 2 tasks produces 24 files instead of 8, every file ≤ cap | Measured | same |
| `REBALANCE` with AQE off leaves a 32-task write's 128 files unchanged | Measured | same |
| AQE on by itself (no hint) also leaves the write at 128 files | Measured | same |
| `REBALANCE` with AQE on cuts the same write to 16 files | Measured | same |
| `REBALANCE(k)` with AQE on cuts it to exactly 4 files (one per partition value) | Measured | same |
| `RebalancePartitions` rebalances by partition expressions, splits skewed partitions, only meaningful with AQE on | Sourced, `basicLogicalOperators.scala` | `sources.mjs check`, 8/8 quotes |
| The `REBALANCE` hint can take column names and is ignored outright without AQE | Sourced, Spark SQL "Hints" docs | same |
| `spark.sql.files.maxRecordsPerFile` defaults to `0` (no limit), capping rows per written file | Sourced, Spark configuration docs | same |

## Red team

- **Is the tasks-times-partitions rule actually about task count, or could `repartition(n)`
  itself be producing fewer than `n` real tasks for small data?** Checked directly: the file
  counts at each task count (8, 16, 32) scale in exact lockstep with the `repartition` argument
  (2, 4, 8), confirming the task count requested is the task count that actually ran and wrote.
- **Does `maxRecordsPerFile` cap bytes or rows, and could a run with different row widths give
  a different file count for the same cap?** Checked against the source: the config's own
  description names "records," not bytes; `examples.py` reads every output file back and
  measures row counts directly (not file sizes) to confirm the cap is a row count, observing the
  exact cap value (50,000) as the maximum across all 24 files, not an approximation.
- **Is the `REBALANCE` no-op with AQE off a real engine behavior, or could the hint have simply
  been dropped by a parser error that silently no-ops any malformed hint?** Ruled out: the exact
  same hint (`/*+ REBALANCE */`) produces a real, different file count once AQE is turned on in
  a separate run with no other change — the hint parses and does something; it simply requires
  AQE to act on.
- **Does `REBALANCE(k)` actually align output to the partition column, or could landing on
  exactly 4 files be a coincidence of the chosen `coalescePartitions.minPartitionSize`?** Checked
  by comparing against plain `REBALANCE` in the same run (same AQE config, same
  `minPartitionSize`): plain `REBALANCE` lands on 16 files, not 4, under the identical advisory
  size — the additional drop to 4 under `REBALANCE(k)` is specifically attributable to naming
  the partition column, not the size threshold.

## Abandoned approaches

None. All three claims the syllabus clause names (the tasks-times-partitions rule,
`maxRecordsPerFile`, and `REBALANCE` under AQE) were measured directly on the first working
probe design, once the `REBALANCE` probe's initial run (AQE left on its session default of
disabled) was corrected to explicitly enable AQE and `coalescePartitions` for that specific
measurement — not a design abandonment, just the config needed to observe the hint's own stated
precondition in effect. Table-format write-distribution modes are disclosed as sourced-only in
`post-notes.md`, matching the syllabus clause's own explicit scoping to the storage chapters.
