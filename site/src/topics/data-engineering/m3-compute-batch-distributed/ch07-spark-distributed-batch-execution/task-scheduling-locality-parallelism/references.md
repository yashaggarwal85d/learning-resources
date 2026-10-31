Last verified: 31 October 2026. Partition counts and config defaults are measured directly
(`examples.py`) against a real local Apache Spark 4.0.1 (PySpark) session; locality levels, delay
scheduling, dynamic allocation and FIFO/FAIR pools are sourced and quoted, disclosed as such.

- Apache Spark documentation, "Configuration — spark.default.parallelism": [spark.apache.org](https://spark.apache.org/docs/latest/configuration.html) (fetched at docs version 4.3.0; unchanged since 4.0).
- Apache Spark documentation, "Performance Tuning — spark.sql.shuffle.partitions": [spark.apache.org](https://spark.apache.org/docs/latest/sql-performance-tuning.html) (fetched at docs version 4.3.0; unchanged since 4.0).
- Apache Spark documentation, "Job Scheduling — FIFO and FAIR pools": [spark.apache.org](https://spark.apache.org/docs/latest/job-scheduling.html) (fetched at docs version 4.3.0; unchanged since 4.0).
- Apache Spark project, `TaskSchedulerImpl.scala` (GitHub, tag v4.0.0): [raw.githubusercontent.com](https://raw.githubusercontent.com/apache/spark/v4.0.0/core/src/main/scala/org/apache/spark/scheduler/TaskSchedulerImpl.scala). The scheduler's own description of delay scheduling, quoted directly.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=task-scheduling-locality-parallelism:%20).
