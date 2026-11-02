## Trino documentation, "Fault-tolerant execution"

URL: https://trino.io/docs/current/admin/fault-tolerant-execution.html
Version: Trino 484 (docs "current" at time of fetch)

> By default, if a Trino node lacks the resources to execute a task or
otherwise fails during query execution, the query fails and must be run again
manually. The longer the runtime of a query, the more likely it is to be
susceptible to such failures.

> Fault-tolerant execution is a mechanism in Trino that enables a cluster to
mitigate query failures by retrying queries or their component tasks in
the event of failure. With fault-tolerant execution enabled, intermediate
exchange data is spooled and can be re-used by another worker in the event of a
worker outage or other fault during query execution.

> Fault-tolerant execution is turned off by default. To enable the feature, set the
retry-policy configuration property to either QUERY or TASK
depending on the desired retry policy.

> A TASK retry policy instructs Trino to retry individual query tasks in the event of failure. You must configure an
exchange manager to use the task retry policy.

> A TASK retry policy is best suited for large batch queries, but this

## Apache Ray documentation, "Ray Data internals"

URL: https://docs.ray.io/en/latest/data/data-internals.html
Version: Ray 2.59.0

> In contrast to bulk synchronous execution, Ray Data's streaming execution doesn't wait
for one operator to complete to start the next. Each operator takes in and outputs a
stream of blocks. With this approach, you can process datasets that are too large to fit
in your cluster's memory.

> Each physical operator has an associated out queue. When a physical operator produces
outputs, the executor moves the outputs to the operator's out queue.

> If there are multiple viable operators, the executor chooses the operator with the
smallest out queue.

> To limit object store use, Ray Data applies backpressure and stops launching tasks once
enough data is buffered. If Ray Data produces more data than fits, Ray Core spills
those objects to disk.

## Apache Spark documentation, "RDD Programming Guide"

URL: https://spark.apache.org/docs/4.0.0/rdd-programming-guide.html
Version: 4.0.0

Note on source naming: CHAPTER.md names "Spark documentation (this chapter's own, for the
contrast)" -- this is that contrasting source, the same page's own description of the
materialized-shuffle model every earlier topic in this chapter already assumed.

> In Spark, data is generally not distributed across partitions to be in the necessary place for a
specific operation. During computations, a single task will operate on a single partition - thus, to
organize all the data for a single reduceByKey reduce task to execute, Spark needs to perform an
all-to-all operation. It must read from all partitions to find all the values for all keys,
and then bring together values across partitions to compute the final result for each key -
this is called the shuffle.

> Spark actions are executed through a set of stages, separated by distributed "shuffle" operations.
