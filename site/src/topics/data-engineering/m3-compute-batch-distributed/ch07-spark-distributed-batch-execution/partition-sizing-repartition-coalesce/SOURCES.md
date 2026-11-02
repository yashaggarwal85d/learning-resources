## Spark SQL Performance Tuning docs — Tuning Partitions (Apache Spark documentation)

URL: https://spark.apache.org/docs/latest/sql-performance-tuning.html
Version: 4.3.0 (current "latest" docs at fetch time; config names and defaults unchanged since 4.0)

> The maximum number of bytes to pack into a single partition when reading files.

> The estimated cost to open a file, measured by the number of bytes that could be scanned in the same

> time.

> Configures the number of partitions to use when shuffling data for joins or aggregations.

Contents (item by item):
1. `spark.sql.files.maxPartitionBytes` is a direct, named cap on input-split size, measured by this topic's own partition-count behaviour at read time.
2. `spark.sql.files.openCostInBytes` is the per-file open-cost padding this topic's own Scope line names — a small file is treated as costing more than its byte size alone, to avoid bunching too many small files into one partition.
3. `spark.sql.shuffle.partitions` configures the output partition count for a shuffle directly — the exact config this topic's own `examples.py` measures controlling a `groupBy`'s output partition count one-to-one.

## FilePartition.scala (Apache Spark source, GitHub)

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/datasources/FilePartition.scala
Version: v4.0.0 tag

> maxSplitBytes: Long,

> openCostInBytes: Long): Seq[FilePartition] = {

Contents (item by item):
1. The partition-splitting function's own parameter list names both levers directly together — the max split size and the open-cost padding — confirming both are inputs to the same single packing decision this topic's own Scope line describes.
