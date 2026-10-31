Last verified: 31 October 2026. Plan-text facts (unresolved markers, pushdown, folding, join
strategy) are measured directly (`examples.py`) against a real local Apache Spark 4.0.1 (PySpark)
session; cost-based reordering from `ANALYZE TABLE` statistics is sourced and quoted, disclosed as
such.

- Apache Spark documentation, "SQL Reference — EXPLAIN": [spark.apache.org](https://spark.apache.org/docs/latest/sql-ref-syntax-qry-explain.html) (fetched at docs version 4.3.0; unchanged since 4.0).
- Apache Spark documentation, "Performance Tuning — spark.sql.autoBroadcastJoinThreshold": [spark.apache.org](https://spark.apache.org/docs/latest/sql-performance-tuning.html) (fetched at docs version 4.3.0; unchanged since 4.0).
- Apache Spark documentation, "SQL Reference — ANALYZE TABLE": [spark.apache.org](https://spark.apache.org/docs/latest/sql-ref-syntax-aux-analyze-table.html) (fetched at docs version 4.3.0; unchanged since 4.0).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=catalyst-unresolved-physical-plan:%20).
