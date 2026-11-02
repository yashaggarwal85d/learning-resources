Last verified: 31 October 2026. The files/partitions-read counts, the `dynamicpruningexpression`
and `Subqueries`/`ReusedExchange` plan text, and the unpartitioned-fact negative case are all
measured directly (`examples.py`) against a real local Apache Spark 4.0.1 (PySpark) session. The
rule's own fallback-to-subquery-duplicate path and the `onlyInBroadcast` bailout are sourced and
quoted directly from Spark's source rather than independently re-measured.

- Apache Spark source (GitHub), `PlanDynamicPruningFilters.scala`: [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/dynamicpruning/PlanDynamicPruningFilters.scala) (tag v4.0.0).
- Apache Spark documentation, "Configuration": [spark.apache.org](https://spark.apache.org/docs/latest/configuration.html).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=dynamic-partition-pruning:%20).
