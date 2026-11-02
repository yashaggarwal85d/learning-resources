# Before you watch

- **Execution memory.** The part of the unified pool used for computation — shuffles, joins,
  sorts, and aggregations. Where you meet it: the exact resource this topic's spill is a
  response to running short of.
- **External merge sort.** Sorting data too large for memory by writing already-sorted chunks
  ("runs") to disk, then merging those runs back together. Where you meet it: the algorithm
  behind every sort spill this topic measures — taught in full in *Data Structures &
  Algorithms* Chapter 6.
- **Task.** One unit of parallel work a stage runs. Where you meet it: the unit this topic's
  spill metrics are reported per, and the thing that is or isn't short on memory.
- **Skew.** One partition holding far more data than the others after a shuffle. Where you
  meet it: the condition this topic's whole worked example is built around.
- **Shuffle partitions.** The number of pieces a shuffle splits its output into. Where you
  meet it: fixed at four for this topic's own measurements, with one of the four skewed.
