Last verified: 1 November 2026. Both measured claims -- climbing GC time on the default
provider against a growing key count, and the collapse in checkpoint bytes once changelog
checkpointing is enabled -- are measured directly against real local Structured Streaming
queries on Apache Spark 4.0.1 (PySpark), via the Spark UI's own REST API and the checkpoint
directory's own written files.

- Apache Spark documentation, "Structured Streaming: APIs on DataFrames and Datasets": [spark.apache.org](https://spark.apache.org/docs/4.0.0/streaming/apis-on-dataframes-and-datasets.html).
- Apache Spark JIRA, "SPARK-49374: RocksDB State Store Checkpoint Structure V2": [issues.apache.org](https://issues.apache.org/jira/browse/SPARK-49374).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=rocksdb-state-store-checkpointing:%20).
