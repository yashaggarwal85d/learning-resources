Last verified: 30 October 2026. Every job/stage/task count is measured directly (`examples.py`)
against a real local Apache Spark 4.0.1 (PySpark) session via `SparkContext.statusTracker()`; the
driver/executor process-isolation claim (killing one leaves the other running) is sourced only,
since local mode runs both in one JVM.

- Apache Spark documentation, "Cluster Mode Overview": [spark.apache.org](https://spark.apache.org/docs/latest/cluster-overview.html). The driver/executor/cluster-manager architecture and the exact glossary this reel quotes (fetched at docs version 4.2.0; the mechanism is unchanged since 4.0).
- Apache Spark project, "Spark Release 4.0.0": [spark.apache.org](https://spark.apache.org/releases/spark-release-4-0-0.html). Confirms Mesos support dropped (SPARK-44442) and Scala 2.13 made the default (SPARK-45314), cited in this chapter's shared engine-of-record note.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=driver-executors-task-hierarchy:%20).
