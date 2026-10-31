Last verified: 31 October 2026. Plan-text facts (the zero-shuffle broadcast under threshold, the
full shuffle-join fallback over it, and the broadcast-nested-loop contrast for a non-equi
condition) are measured directly (`examples.py`) against a real local Apache Spark 4.0.1
(PySpark) session. The join-hint mechanism and the driver-memory risk behind stale statistics are
sourced and quoted; no broadcast is deliberately driven toward failure here.

- Apache Spark documentation, "Performance Tuning" (Automatically Broadcasting Joins / Join Strategy Hints sections): [spark.apache.org](https://spark.apache.org/docs/latest/sql-performance-tuning.html) (fetched at docs version 4.3.0; the threshold and hint mechanism unchanged since 4.0).
- Apache Spark source (GitHub), `BroadcastHashJoinExec.scala`: [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/joins/BroadcastHashJoinExec.scala) (tag v4.0.0).
- Apache Spark source (GitHub), `BroadcastExchangeExec.scala`: [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/exchange/BroadcastExchangeExec.scala) (tag v4.0.0).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=broadcast-hash-join:%20).
