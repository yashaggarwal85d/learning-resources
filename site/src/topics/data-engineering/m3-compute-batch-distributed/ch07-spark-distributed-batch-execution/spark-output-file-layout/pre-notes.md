# Before you watch

- **Partition column (write-side).** The column a `DataFrameWriter` uses to split its output
  into separate directories, one per distinct value. Where you meet it: the fixed, four-valued
  column every write in this topic touches.
- **Task.** One unit of parallel work a stage runs; for a write, one task produces its own
  output per partition value it touches. Where you meet it: the multiplier this topic's own
  rule is built on.
- **AQE (Adaptive Query Execution).** Spark re-optimizing a query mid-run using real shuffle
  statistics, rather than only its static, pre-run plan. Where you meet it: the one condition
  that decides whether this topic's second lever does anything at all.
- **Coalescing post-shuffle partitions.** AQE merging several small shuffle partitions into
  fewer, larger ones once their real sizes are known. Where you meet it: a chapter-earlier
  mechanism this topic's own hint relies on directly.
- **Shuffle.** Redistributing data across workers by a key, the step that happens immediately
  before a write when the data isn't already laid out the way the write needs it. Where you
  meet it: what a `REBALANCE` hint actually changes, one stage before the write itself.
