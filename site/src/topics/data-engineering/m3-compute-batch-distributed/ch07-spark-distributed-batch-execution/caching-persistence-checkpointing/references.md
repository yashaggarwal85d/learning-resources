Last verified: 31 October 2026. Caching's avoidance of recomputation, the memory-only-vs-disk
eviction contrast, and the non-deterministic-freeze behavior are all measured directly
(`examples.py`) against a real local Apache Spark 4.0.1 (PySpark) session. Checkpoint's own
lineage-truncating behavior is sourced and named only, per the syllabus clause's own
`checkpoint`/`localCheckpoint` mention.

- Apache Spark documentation, "RDD Programming Guide": [spark.apache.org](https://spark.apache.org/docs/4.0.0/rdd-programming-guide.html).
- Apache Spark source (GitHub), `StorageLevel.scala`: [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/common/utils/src/main/scala/org/apache/spark/storage/StorageLevel.scala) (tag v4.0.0).
- Apache Spark source (GitHub), `ReliableCheckpointRDD.scala`: [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/core/src/main/scala/org/apache/spark/rdd/ReliableCheckpointRDD.scala) (tag v4.0.0).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=caching-persistence-checkpointing:%20).
