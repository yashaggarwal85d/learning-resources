Last verified: 31 October 2026. The file counts at each task count, the `maxRecordsPerFile`
row-cap behavior, and the `REBALANCE`/`REBALANCE(col)` file-count effects with AQE on and off
are all measured directly (`examples.py`) against a real local Apache Spark 4.0.1 (PySpark)
session. Table-format write-distribution modes are sourced and named only, matching the
syllabus clause's own explicit deferral to the lakehouse storage chapters.

- Apache Spark source (GitHub), `basicLogicalOperators.scala` (`RebalancePartitions`): [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/catalyst/src/main/scala/org/apache/spark/sql/catalyst/plans/logical/basicLogicalOperators.scala) (tag v4.0.0). CHAPTER.md names this source as a standalone `RebalancePartitions.scala`; no such file exists at this tag, so the correct shared-file path was substituted.
- Apache Spark documentation, "Hints": [spark.apache.org](https://spark.apache.org/docs/4.0.0/sql-ref-syntax-qry-select-hints.html).
- Apache Spark documentation, "Configuration": [spark.apache.org](https://spark.apache.org/docs/4.0.0/configuration.html).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=spark-output-file-layout:%20).
