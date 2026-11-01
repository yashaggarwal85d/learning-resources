Last verified: 1 November 2026. All three measured claims -- the complete-mode-on-join
rejection, unbounded join-state growth with no watermark, and a plateau once a watermark and
time-range condition are added -- are measured directly against real local Structured Streaming
queries on Apache Spark 4.0.1 (PySpark), via a real `AnalysisException` and the query's own
`recentProgress` state-operator metrics.

- Apache Spark documentation, "Structured Streaming: APIs on DataFrames and Datasets": [spark.apache.org](https://spark.apache.org/docs/4.0.0/streaming/apis-on-dataframes-and-datasets.html).
- Apache Spark source (GitHub), `StreamingSymmetricHashJoinExec.scala`: [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/streaming/StreamingSymmetricHashJoinExec.scala) (tag v4.0.0).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=stateful-operators-output-modes:%20).
