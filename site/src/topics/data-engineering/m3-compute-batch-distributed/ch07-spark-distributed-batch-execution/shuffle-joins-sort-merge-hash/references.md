Last verified: 31 October 2026. Plan-text facts (the unhinted sort-merge default with a Sort node
per side, and the hinted shuffled hash join with zero Sort nodes) are measured directly
(`examples.py`) against a real local Apache Spark 4.0.1 (PySpark) session. The planner's own
hint-priority order and the shuffled hash join's named OOM risk are sourced and quoted; no build
side is deliberately driven toward OOM here.

- Apache Spark source (GitHub), `SparkStrategies.scala`: [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/SparkStrategies.scala) (tag v4.0.0).
- Apache Spark source (GitHub), `SortMergeJoinExec.scala`: [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/joins/SortMergeJoinExec.scala) (tag v4.0.0).
- Apache Spark source (GitHub), `ShuffledHashJoinExec.scala`: [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/joins/ShuffledHashJoinExec.scala) (tag v4.0.0).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=shuffle-joins-sort-merge-hash:%20).
