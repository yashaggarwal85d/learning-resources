Last verified: 31 October 2026. Partition-count and plan-text facts (shuffle.partitions, the
repartition/coalesce Exchange distinction, the coalesce(1) collapse) are measured directly
(`examples.py`) against a real local Apache Spark 4.0.1 (PySpark) session. Input-split sizing
(maxPartitionBytes, openCostInBytes) and the per-task target-size guideline are sourced and quoted.

- Apache Spark documentation, "Performance Tuning — Tuning Partitions": [spark.apache.org](https://spark.apache.org/docs/latest/sql-performance-tuning.html) (fetched at docs version 4.3.0; config names and defaults unchanged since 4.0).
- Apache Spark source (GitHub), `FilePartition.scala`: [github.com](https://github.com/apache/spark/blob/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/datasources/FilePartition.scala) (tag v4.0.0).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=partition-sizing-repartition-coalesce:%20).
