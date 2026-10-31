Last verified: 31 October 2026. All five failure modes -- skew, spill, GC, small files, and a
driver bottleneck -- are measured directly against a real local Apache Spark 4.0.1 (PySpark)
session, read back through the same REST API the Spark UI itself renders from. The SQL tab's
own per-operator plan metrics and the History Server's event-log replay are sourced and named
only.

- Apache Spark documentation, "Web UI": [spark.apache.org](https://spark.apache.org/docs/4.0.0/web-ui.html).
- Apache Spark documentation, "Monitoring and Instrumentation": [spark.apache.org](https://spark.apache.org/docs/4.0.0/monitoring.html).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=diagnosing-jobs-spark-ui:%20).
