Last verified: 1 November 2026. Both measured claims -- the hand-computed watermark matching
Spark's own reported value one trigger behind, and a late event's drop depending on window
eviction rather than raw lateness -- are measured directly against a real local Structured
Streaming query on Apache Spark 4.0.1 (PySpark), via the query's own `recentProgress` and the
contents of its memory sink table.

- Apache Spark documentation, "Structured Streaming: APIs on DataFrames and Datasets": [spark.apache.org](https://spark.apache.org/docs/4.0.0/streaming/apis-on-dataframes-and-datasets.html).
- Apache Spark source (GitHub), `EventTimeWatermarkExec.scala`: [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/streaming/EventTimeWatermarkExec.scala) (tag v4.0.0).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=event-time-watermarks-late-data:%20).
