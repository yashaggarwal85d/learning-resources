Last verified: 31 October 2026. The GC-cost-vs-object-count contrast between RDD and
DataFrame code, and the GC-time-against-total-time reading, are both measured directly
(`examples.py`) against a real local Apache Spark 4.0.1 (PySpark) session. The long-G1-pause
and lost-executor failure mode is sourced and named only, since local mode has no separate
executor process to lose.

- Apache Spark documentation, "Tuning Spark": [spark.apache.org](https://spark.apache.org/docs/4.0.0/tuning.html).
- Apache Spark release notes, "Spark Release 4.0.0": [spark.apache.org](https://spark.apache.org/releases/spark-release-4-0-0.html).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=jvm-garbage-collection-symptoms:%20).
