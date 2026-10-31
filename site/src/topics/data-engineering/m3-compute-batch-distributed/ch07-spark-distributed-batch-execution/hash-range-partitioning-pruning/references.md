Last verified: 31 October 2026. Plan-text facts (the hash/range partitioner tags, shuffle
sharing vs. real repetition, the PartitionFilters distinction) are measured directly
(`examples.py`) against a real local Apache Spark 4.0.1 (PySpark) session. The Hive-style
directory layout and the DSv2 filter-pushdown interface are sourced and quoted.

- Apache Spark source (GitHub), `partitioning.scala`: [github.com](https://github.com/apache/spark/blob/v4.0.0/sql/catalyst/src/main/scala/org/apache/spark/sql/catalyst/plans/physical/partitioning.scala) (tag v4.0.0).
- Apache Spark documentation, "Parquet Files — Partition Discovery": [spark.apache.org](https://spark.apache.org/docs/latest/sql-data-sources-parquet.html) (fetched at docs version 4.3.0; Hive-style partition discovery unchanged since 4.0).
- Apache Spark source (GitHub), `SupportsPushDownFilters.java`: [github.com](https://github.com/apache/spark/blob/v4.0.0/sql/catalyst/src/main/java/org/apache/spark/sql/connector/read/SupportsPushDownFilters.java) (tag v4.0.0).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=hash-range-partitioning-pruning:%20).
