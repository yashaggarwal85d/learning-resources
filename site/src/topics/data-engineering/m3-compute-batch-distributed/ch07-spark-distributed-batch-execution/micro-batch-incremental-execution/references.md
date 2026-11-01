Last verified: 31 October 2026. All three claims -- the offset-log/commit-log pairing, the
real latency floor under a zero-second trigger, and a fixed trigger's own wait for its
interval boundary -- are measured directly against real local Structured Streaming queries on
Apache Spark 4.0.1 (PySpark), reading the checkpoint directory's own files and the query's own
`recentProgress` timings.

- Apache Spark documentation, "Structured Streaming: APIs on DataFrames and Datasets": [spark.apache.org](https://spark.apache.org/docs/4.0.0/streaming/apis-on-dataframes-and-datasets.html).
- Apache Spark source (GitHub), `MicroBatchExecution.scala`: [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/streaming/MicroBatchExecution.scala) (tag v4.0.0).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=micro-batch-incremental-execution:%20).
