## RDD Programming Guide — Shuffle operations (Apache Spark documentation)

URL: https://spark.apache.org/docs/latest/rdd-programming-guide.html#shuffle-operations
Version: 4.3.0 (current "latest" docs at fetch time; the shuffle mechanism described is unchanged since 4.0)

> Certain operations within Spark trigger an event known as the shuffle. The shuffle is Spark's mechanism for re-distributing data so that it's grouped differently across partitions. This typically involves copying data across executors and machines, making the shuffle a complex and costly operation.

> In Spark, data is generally not distributed across partitions to be in the necessary place for a specific operation. During computations, a single task will operate on a single partition - thus, to organize all the data for a single reduceByKey reduce task to execute, Spark needs to perform an all-to-all operation. It must read from all partitions to find all the values for all keys, and then bring together values across partitions to compute the final result for each key

> The Shuffle is an expensive operation since it involves disk I/O, data serialization, and network I/O. To organize data for the shuffle, Spark generates sets of tasks - map tasks to organize the data, and a set of reduce tasks to aggregate it. This nomenclature comes from MapReduce and does not directly relate to Spark's map and reduce operations.

> Internally, results from individual map tasks are kept in memory until they can't fit. Then, these are sorted based on the target partition and written to a single file. On the reduce side, tasks read the relevant sorted blocks.

> Certain shuffle operations can consume significant amounts of heap memory since they employ in-memory data structures to organize records before or after transferring them. Specifically, reduceByKey and aggregateByKey create these structures on the map side, and 'ByKey operations generate these on the reduce side. When data does not fit in memory Spark will spill these tables to disk, incurring the additional overhead of disk I/O and increased garbage collection.

> Shuffle also generates a large number of intermediate files on disk. As of Spark 1.3, these files are preserved until the corresponding RDDs are no longer used and are garbage collected. This is done so the shuffle files don't need to be re-created if the lineage is re-computed.

Contents (item by item):
1. The shuffle as an all-to-all operation: every reduce task must read from every map partition to assemble one key's values.
2. Map tasks organize data; reduce tasks aggregate it — borrowed MapReduce vocabulary, not Spark's own `map`/`reduce` operators.
3. Map-task results are buffered in memory, sorted by target partition, then written to a single file per map task (the sort-based shuffle writer's exact behaviour).
4. Reduce-side tasks read the relevant sorted blocks from those files.
5. Shuffle cost sources named explicitly: disk I/O, serialization, network I/O.
6. Spill to disk when in-memory shuffle structures don't fit, with added GC overhead.
7. Shuffle files persist on disk until their RDDs are garbage collected, so long-running jobs can accumulate large amounts of shuffle disk usage.

## Spark source: `IndexShuffleBlockResolver.scala` (Apache Spark project, GitHub)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/core/src/main/scala/org/apache/spark/shuffle/IndexShuffleBlockResolver.scala
Version: tag v4.0.0

> Data of shuffle blocks from the same map task are stored in a single consolidated data file.

> The offsets of the data blocks in the data file are stored in a separate index file.

> We use the name of the shuffle data's shuffleBlockId with reduce ID set to 0 and add ".data"

Contents (item by item):
1. One data file per map task, holding every reduce partition's data consolidated together.
2. One separate index file per map task, holding the byte offsets into the data file for each reduce partition's block.
3. The on-disk filename convention: `.data` and `.index` suffixes per map task's shuffle block.

The MapOutputTracker's own role (telling reducers which executor holds which map task's output) and the reducer's bounded-in-flight-request fetch behaviour are verified empirically in `examples.py` (inspecting real shuffle files Spark writes to its local temp directory, and Spark's own shuffle-read metrics) rather than quoted from `MapOutputTracker.scala` or `ShuffleBlockFetcherIterator.scala` directly — cross-confirmed against the RDD Programming Guide's description above ("Internally, results from individual map tasks are kept in memory... written to a single file. On the reduce side, tasks read the relevant sorted blocks").
