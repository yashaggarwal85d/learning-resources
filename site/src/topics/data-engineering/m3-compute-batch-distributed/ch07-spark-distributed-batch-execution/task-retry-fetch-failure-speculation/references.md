Last verified: 31 October 2026. Task retry up to a configured failure limit, and a fetch
failure's own stage resubmission, are both measured directly (`examples.py`) against a real
local Apache Spark 4.0.1 (PySpark) session. Speculative execution's non-idempotent-sink
hazard and executor-loss/block-migration behavior are sourced and named only, since this
sandbox's own scheduler did not reliably trigger a live speculative relaunch, and executor
loss itself needs a real cluster to demonstrate.

- Apache Spark source (GitHub), `TaskSetManager.scala`: [github.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/core/src/main/scala/org/apache/spark/scheduler/TaskSetManager.scala) (tag v4.0.0).
- Apache Spark documentation, "Configuration": [spark.apache.org](https://spark.apache.org/docs/4.0.0/configuration.html).
- Apache Spark documentation, "Running Spark on Kubernetes": [spark.apache.org](https://spark.apache.org/docs/4.0.0/running-on-kubernetes.html).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=task-retry-fetch-failure-speculation:%20).
