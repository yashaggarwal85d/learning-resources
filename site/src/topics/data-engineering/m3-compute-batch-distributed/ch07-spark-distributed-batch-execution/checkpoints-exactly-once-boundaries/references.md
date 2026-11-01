Last verified: 1 November 2026. All three measured claims -- the clean restart baseline, the
duplicate through a non-idempotent sink, the zero duplicates through a batchId-deduplicating
sink, and the failed restart after changed grouping keys -- are measured directly against real
local Structured Streaming queries on Apache Spark 4.0.1 (PySpark), by removing a commit-log
entry by hand to simulate a crash and restarting from the same checkpoint.

- Apache Spark documentation, "Structured Streaming: APIs on DataFrames and Datasets": [spark.apache.org](https://spark.apache.org/docs/4.0.0/streaming/apis-on-dataframes-and-datasets.html).
- Apache Spark release notes, "Spark Release 4.2.0": [spark.apache.org](https://spark.apache.org/releases/spark-release-4-2-0.html).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=checkpoints-exactly-once-boundaries:%20).
