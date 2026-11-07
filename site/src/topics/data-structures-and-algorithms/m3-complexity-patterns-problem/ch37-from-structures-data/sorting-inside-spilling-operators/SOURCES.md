## PostgreSQL tuplesort.c

URL: https://raw.githubusercontent.com/postgres/postgres/master/src/backend/utils/sort/tuplesort.c
Version: `master`, fetched 2026-11-05

> Algorithm 5.4.2D), but with modern hardware, a straightforward balanced

> Historically, we divided the input into sorted runs using replacement

> (essentially Knuth's Algorithm 5.2.3H), but now we always use quicksort

> by prereading from each source tape sequentially, loading about workMem/M

> saves one cycle of writing all the data out to disk and reading it in.

Notes: the file's own header comment gives four departures from Knuth's textbook external sort,
each with its own reason: a balanced k-way merge replaced the polyphase merge once tape drives
stopped being the scarce resource; run generation switched from replacement selection to
quicksort (or radix sort); the merge prereads a fair share of `workMem` from each tape at once
rather than one tuple at a time, to keep the access pattern sequential; and the final merge can
be done on the fly, skipping one full write-and-reread cycle, when the caller does not need
random access to the sorted result.

## PostgreSQL nodeAgg.c

URL: https://raw.githubusercontent.com/postgres/postgres/master/src/backend/executor/nodeAgg.c
Version: `master`, fetched 2026-11-05

> #define HASHAGG_PARTITION_FACTOR 1.50
> #define HASHAGG_MIN_PARTITIONS 4
> #define HASHAGG_MAX_PARTITIONS 1024

Notes: when a hash aggregation's table outgrows its memory budget, the executor spills by
partitioning the overflow by hash into between 4 and 1024 logical tapes, sized at one and a half
times the estimated number of groups still needed, recursively if a partition is still too big.

## Spark SortMergeJoinExec.scala

URL: https://raw.githubusercontent.com/apache/spark/master/sql/core/src/main/scala/org/apache/spark/sql/execution/joins/SortMergeJoinExec.scala
Version: `master`, fetched 2026-11-05

> "spillSize" -> SQLMetrics.createSizeMetric(sparkContext, "spill size"))

> conf.sortMergeJoinExecBufferSpillThreshold

> conf.sortMergeJoinExecBufferSpillSizeThreshold

Notes: a sort-merge join buffers every row on one side that shares the current join key; past a
row-count threshold or a byte-size threshold, that buffer spills to disk, and the operator
reports a "spill size" metric — a key that repeats heavily on both sides of the join is where a
sort-merge join's memory actually goes, not the sort itself.

## Spark TungstenAggregationIterator.scala

URL: https://raw.githubusercontent.com/apache/spark/master/sql/core/src/main/scala/org/apache/spark/sql/execution/aggregate/TungstenAggregationIterator.scala
Version: `master`, fetched 2026-11-05

> together using external sorter, and do sort-based aggregation.

> Then, this iterator works in the way of sort-based aggregation.

Notes: when the hash-based aggregation's map cannot acquire more memory, the iterator sorts the
map's entries by grouping key, spills them, merges the spills with an external sorter, and from
then on behaves as a sort-based aggregation — a hash structure that turns itself into a sort once
memory runs out, a different design from PostgreSQL's hash-partitioned spill of the same problem.

## Spark ExternalSorter.scala

URL: https://raw.githubusercontent.com/apache/spark/master/core/src/main/scala/org/apache/spark/util/collection/ExternalSorter.scala
Version: `master`, fetched 2026-11-05

> private[spark] class ExternalSorter[K, V, C](

Notes: a shuffle read whose dependency carries a key ordering builds one of these to merge the
fetched blocks, so the reduce side of a shuffle is itself an external sort over blocks that
arrive from several map tasks, the same spill-and-merge shape the sort-merge join's own spill
uses.
