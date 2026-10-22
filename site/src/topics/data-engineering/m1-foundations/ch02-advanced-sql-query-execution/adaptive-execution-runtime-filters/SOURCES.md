Fetched: 2026-10-22.

## Apache Spark 3.5.9 documentation, "Performance Tuning" (Adaptive Query Execution)
URL: https://spark.apache.org/docs/3.5.9/sql-performance-tuning.html
> Adaptive Query Execution (AQE) is an optimization technique in Spark SQL that makes use of the runtime statistics to choose the most efficient query execution plan, which is enabled by default since Apache Spark 3.2.0.

> As of Spark 3.0, there are three major features in AQE: including coalescing post-shuffle partitions, converting sort-merge join to broadcast join, and skew join optimization.

> This feature coalesces the post shuffle partitions based on the map output statistics when both spark.sql.adaptive.enabled and spark.sql.adaptive.coalescePartitions.enabled configurations are true. This feature simplifies the tuning of shuffle partition number when running queries.

> Data skew can severely downgrade the performance of join queries. This feature dynamically handles skew in sort-merge join by splitting (and replicating if needed) skewed tasks into roughly evenly sized tasks.

> A partition is considered as skewed if its size is larger than this factor multiplying the median partition size and also larger than spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes.

## Apache Spark 3.5.9 source, `InjectRuntimeFilter.scala` (Catalyst optimizer)
URL: https://raw.githubusercontent.com/apache/spark/v3.5.9/sql/catalyst/src/main/scala/org/apache/spark/sql/catalyst/optimizer/InjectRuntimeFilter.scala
> Insert a filter on one side of the join if the other side has a selective predicate.

> The filter could be an IN subquery (converted to a semi join), a bloom filter, or something

> // Skip if the filter creation side is too big

## Trino documentation, "Dynamic filtering"
URL: https://trino.io/docs/current/admin/dynamic-filtering.html
> When dynamic filtering is enabled, Trino collects candidate values for join condition from the processed dimension table on the right side of join.

> For example, in the case of the Hive connector, dynamic filters are used to skip loading of partitions which don't match the join criteria. This is known as dynamic partition pruning.

> "simplifiedDomain" : "[ SortedRangeSet[type=bigint, ranges=3, {[2451546], ..., [2451905]}] ]",

## PostgreSQL 18 documentation, §5.12.4 "Partition Pruning"
URL: https://www.postgresql.org/docs/18/ddl-partitioning.html
> Partition pruning can be performed not only during the planning of a given query, but also during its execution. This is useful as it can allow more partitions to be pruned when clauses contain expressions whose values are not known at query planning time, for example, parameters defined in a PREPARE statement

> During initialization of the query plan. Partition pruning can be performed here for parameter values which are known during the initialization phase of execution.

> It is possible to determine the number of partitions which were removed during this phase by observing the "Subplans Removed" property in the EXPLAIN output.

## Measured directly
URL: n/a — executed locally, not a web source.

**Spark 3.5.9 local[4], Python 3.11 venv (`pyspark==3.5.9`), `spark.sql.shuffle.partitions=200`.** `spark.range(0, 2_000_000, 1, 8).withColumn("k", id % 50).groupBy("k").count()`: with AQE/coalescing off, the shuffle read side keeps all 200 configured partitions (`post_shuffle_partitions=200`). With `spark.sql.adaptive.coalescePartitions.enabled=true`, the same query's shuffle read collapses to 1 partition, since the real post-shuffle data (50 tiny groups) never needed 200.

**Skew join, local[4].** A 20,000,000-row fact table where 95% of rows share one join key, joined to a 20-row dimension table, `spark.sql.shuffle.partitions=8`, `skewedPartitionThresholdInBytes=1048576`, `skewedPartitionFactor=2`, `autoBroadcastJoinThreshold=-1` (broadcast disabled so the join must go through a sort-merge join). With `skewJoin.enabled=true`, `df.explain()` after the action shows the Final Plan as `SortMergeJoin(skew=true)` reading from an `AQEShuffleRead skewed` node; with it disabled, the plan stays a plain `SortMergeJoin` over an ordinary shuffle read. Repeated wall-clock runs on this sandbox's 4 CPU cores did not show a clean, repeatable speedup from the split (9.2s vs. 8.6-11.1s across runs) - the mechanism is real and plan-visible, but exploiting the split into faster wall-clock time needs spare executor capacity beyond the number of straggler partitions, which this 4-core sandbox doesn't have.

**Join-strategy switch, local[4].** A 2,000,000-row fact table joined to a dimension table whose true post-filter, post-aggregation size (10 rows) is only known once its own `HashAggregate` stage has finished running - the planner's static estimate alone doesn't learn this. With `spark.sql.adaptive.enabled=true` and `autoBroadcastJoinThreshold=1048576` (1 MB), `j.explain()` shows `== Initial Plan ==` as a `SortMergeJoin` (both sides shuffled) and `== Final Plan ==` as a `BroadcastHashJoin` - AQE replanned the join once the dimension side's real, tiny size was known from its completed stage.

**PostgreSQL 16.15, `pw_orders` (8,000,000 rows, 4 range partitions on `region`, from topic 25's own schema).** `PREPARE pw_q(int) AS SELECT count(*) FROM pw_orders WHERE region = $1;` under `plan_cache_mode = force_generic_plan` (so the plan keeps `$1` as a real runtime parameter, not a literal substituted at plan time). `EXPLAIN (ANALYZE, BUFFERS) EXECUTE pw_q(2)` three times with `enable_partition_pruning = on`: `Subplans Removed: 3`, one partition scanned, `Execution Time` 90.854 / 69.630 / 77.556 ms, `Buffers read` 14217-14345. With `enable_partition_pruning = off`, same generic plan, three EXECUTEs: all 4 partitions scanned, no `Subplans Removed` line, `Execution Time` 237.522 / 212.775 / 303.576 ms (first run cold-cache), `Buffers read` 56991-57631.
