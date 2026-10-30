Last verified: 30 October 2026. Every stage count and plan-text check is measured directly
(`examples.py`) against a real local Apache Spark 4.0.1 (PySpark) session.

- Zaharia et al., "Resilient Distributed Datasets: A Fault-Tolerant Abstraction for In-Memory Cluster Computing" (NSDI 2012): [usenix.org](https://www.usenix.org/system/files/conference/nsdi12/nsdi12-final138.pdf). The original narrow/wide dependency distinction and the DAGScheduler's own stage-cut rule.
- Apache Spark documentation, "RDD Programming Guide — Shuffle operations": [spark.apache.org](https://spark.apache.org/docs/latest/rdd-programming-guide.html#shuffle-operations). Current Spark's own definition of a shuffle (fetched at docs version 4.2.0; the mechanism is unchanged since 4.0).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=dag-scheduling-stage-boundaries:%20).
