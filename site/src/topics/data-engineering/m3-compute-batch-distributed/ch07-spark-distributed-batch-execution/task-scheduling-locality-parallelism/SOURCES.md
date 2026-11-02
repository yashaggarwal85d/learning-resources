## Spark configuration docs — `spark.default.parallelism` (Apache Spark documentation)

URL: https://spark.apache.org/docs/latest/configuration.html
Version: 4.3.0 (current "latest" docs at fetch time; the setting's local-mode behaviour is unchanged since 4.0)

> For distributed shuffle operations like reduceByKey and join, the largest number of partitions in a parent RDD. For operations like parallelize with no parent RDDs, it depends on the cluster manager:

> Local mode: number of cores on the local machine

> Default number of partitions in RDDs returned by transformations like join, reduceByKey, and parallelize when not set by user.

Contents (item by item):
1. In local mode, with no parent RDD and no explicit partition count, the default partition count is the number of cores given to `local[N]`.
2. This is the exact claim this topic's `examples.py` measures directly against a real `local[4]` session.

## Spark SQL Performance Tuning docs — `spark.sql.shuffle.partitions` (Apache Spark documentation)

URL: https://spark.apache.org/docs/latest/sql-performance-tuning.html
Version: 4.3.0 (current "latest" docs at fetch time; unchanged since 4.0)

> Configures the number of partitions to use when shuffling data for joins or aggregations.

Default value (from the same table row): `200`.

Contents (item by item):
1. `spark.sql.shuffle.partitions` is a separate, SQL/DataFrame-layer config governing exactly one thing: shuffle output partition count, defaulting to 200 regardless of core count.
2. This is the setting this topic's `examples.py` measures as independent of `spark.default.parallelism`.

## Spark Job Scheduling docs — FIFO and FAIR pools (Apache Spark documentation)

URL: https://spark.apache.org/docs/latest/job-scheduling.html
Version: 4.3.0 (current "latest" docs at fetch time; unchanged since 4.0)

> By default, Spark’s scheduler runs jobs in FIFO fashion. Each job is divided into “stages” (e.g. map and reduce phases), and the first job gets priority on all available resources while its stages have tasks to launch, then the second job gets priority, etc.

> To enable the fair scheduler, simply set the spark.scheduler.mode property to FAIR when configuring a SparkContext:

Contents (item by item):
1. FIFO is Spark's own scheduler default: the first job submitted to a `SparkContext` gets priority on all available resources until its stages run out of tasks to launch.
2. FAIR scheduling is opt-in, set via `spark.scheduler.mode`, and shares resources across concurrently running jobs instead of queueing them strictly behind one another.
3. Named and quoted directly; not independently measured in `examples.py` (disclosed in FACT-CHECK.md — reliably demonstrating FIFO-vs-FAIR task interleaving needs real concurrent multi-second jobs and wall-clock timing noise this chapter's own local-mode methodology note already flags as unreliable for absolute numbers).

## Spark source: `TaskSchedulerImpl.scala` (Apache Spark project, GitHub, tag v4.0.0) — delay scheduling

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/core/src/main/scala/org/apache/spark/scheduler/TaskSchedulerImpl.scala
Version: tag v4.0.0

> Delay scheduling is an optimization that sacrifices job fairness for data locality in order to

> improve cluster and workload throughput. One useful definition of "delay" is how much time

Contents (item by item):
1. Delay scheduling is named in Spark's own source as a deliberate trade: a task set gives up its immediate fair share of resources for a short time, betting that waiting briefly buys a better (more local) placement.
2. This is the mechanism CHAPTER.md's own hook names ("a task waiting a few milliseconds for a better locality level"); disclosed as sourced-only rather than measured, since local mode's driver JVM is the only "executor" there is — every task is already at the best possible locality the instant it's offered, so no real wait is ever observable here (see FACT-CHECK.md).
