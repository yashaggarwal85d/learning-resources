Last verified: 31 October 2026. Plan-text facts (the zero-Exchange matched-bucket join, the
mismatched-bucket Exchange and the disabled-bucketing tag on the still-matching side) are measured
directly (`examples.py`) against a real local Apache Spark 4.0.1 (PySpark) session. Storage-
partitioned join and `KeyGroupedPartitioning` are sourced and quoted; no real DSv2/Iceberg table
runs locally.

- Apache Spark documentation, "Generic Load/Save Functions": [spark.apache.org](https://spark.apache.org/docs/latest/sql-data-sources-load-save-functions.html) (fetched at docs version 4.3.0; `bucketBy`'s own behaviour unchanged since 4.0).
- Apache Spark documentation, "Performance Tuning" (Storage Partition Join section): [spark.apache.org](https://spark.apache.org/docs/latest/sql-performance-tuning.html) (fetched at docs version 4.3.0; SPJ shipped in 3.3-3.4, stable through 4.0).
- Apache Spark source (GitHub), `partitioning.scala`: [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/catalyst/src/main/scala/org/apache/spark/sql/catalyst/plans/physical/partitioning.scala) (tag v4.0.0).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=bucketing-storage-partitioned-joins:%20).
