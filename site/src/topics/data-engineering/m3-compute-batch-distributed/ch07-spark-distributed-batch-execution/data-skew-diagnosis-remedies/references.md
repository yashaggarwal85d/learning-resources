Last verified: 31 October 2026. The evidence ratios, the AQE-split, broadcast, salting, and
two-phase-aggregation remedies, and the combinable-vs-non-combinable aggregation contrast are all
measured directly (`examples.py`) against a real local Apache Spark 4.0.1 (PySpark) session.
Isolating hot keys, the preserved side of an outer join, and window functions are sourced and
quoted directly from Spark's own engineering blog, documentation, and source, rather than
independently re-measured.

- Databricks engineering blog, "Adaptive Query Execution: Speeding Up Spark SQL at Runtime": [databricks.com](https://www.databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html).
- Apache Spark source (GitHub), `OptimizeSkewedJoin.scala`: [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/adaptive/OptimizeSkewedJoin.scala) (tag v4.0.0).
- Apache Spark documentation, "Performance Tuning — Adaptive Query Execution": [spark.apache.org](https://spark.apache.org/docs/latest/sql-performance-tuning.html#adaptive-query-execution).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=data-skew-diagnosis-remedies:%20).
