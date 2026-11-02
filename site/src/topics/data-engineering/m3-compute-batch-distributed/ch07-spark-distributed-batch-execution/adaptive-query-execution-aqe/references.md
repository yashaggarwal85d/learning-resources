Last verified: 31 October 2026. Plan-text facts (the Initial Plan's sort-merge join and the Final
Plan's broadcast hash join; the Initial Plan's uncoalesced shuffle read and the Final Plan's
coalesced one) are measured directly (`examples.py`) against a real local Apache Spark 4.0.1
(PySpark) session. The query-stage mechanism itself and AQE's own configuration defaults are
sourced and quoted directly from Spark's documentation, Databricks' own engineering blog, and
Spark's source.

- Apache Spark documentation, "Performance Tuning — Adaptive Query Execution": [spark.apache.org](https://spark.apache.org/docs/latest/sql-performance-tuning.html#adaptive-query-execution).
- Databricks engineering blog, "Adaptive Query Execution: Speeding Up Spark SQL at Runtime": [databricks.com](https://www.databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html).
- Apache Spark source (GitHub), `AdaptiveSparkPlanExec.scala`: [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/adaptive/AdaptiveSparkPlanExec.scala) (tag v4.0.0).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=adaptive-query-execution-aqe:%20).
