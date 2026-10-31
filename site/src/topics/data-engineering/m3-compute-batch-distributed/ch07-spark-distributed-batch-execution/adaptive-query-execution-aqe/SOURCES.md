# Sources: de.adaptive-query-execution-aqe

## Spark SQL Performance Tuning docs — Adaptive Query Execution

URL: https://spark.apache.org/docs/latest/sql-performance-tuning.html#adaptive-query-execution
Version: Spark 4.3.0 documentation (fetched 2026-10-31; AQE's own mechanics are unchanged from 4.0.1, the version measured against)

> Adaptive Query Execution (AQE) is an optimization technique in Spark SQL that makes use of the runtime statistics to choose the most efficient query execution plan, which is enabled by default since Apache Spark 3.2.0.

> When true, enable adaptive query execution, which re-optimizes the query plan in the middle of query execution, based on accurate runtime statistics.

> This feature coalesces the post shuffle partitions based on the map output statistics when both spark.sql.adaptive.enabled and spark.sql.adaptive.coalescePartitions.enabled configurations are true.

> AQE converts sort-merge join to broadcast hash join when the runtime statistics of any join side are smaller than the adaptive broadcast hash join threshold. This is not as efficient as planning a broadcast hash join in the first place, but it's better than continuing the sort-merge join, as we can avoid sorting both join sides and read shuffle files locally to save network traffic (provided spark.sql.adaptive.localShuffleReader.enabled is true).

> Data skew can severely downgrade the performance of join queries. This feature dynamically handles skew in sort-merge join by splitting (and replicating if needed) skewed tasks into roughly evenly sized tasks.

### Contents (item by item):

1. The umbrella definition: AQE revisits the plan mid-execution using statistics that only exist once execution has produced them.
2. The exact wording for `spark.sql.adaptive.enabled` itself, naming "in the middle of query execution" and "accurate runtime statistics" — the two facts the whole topic rests on.
3. The partition-coalescing mechanism, confirmed exactly as measured: the Final Plan's `AQEShuffleRead coalesced` the Initial Plan never shows.
4. The sort-merge-to-broadcast conversion, word for word matching the measured scenario (one join side's runtime statistics turn out small enough to broadcast after the static plan already committed to a shuffle join).
5. The skew-splitting feature, named but not measured (deferred by CHAPTER.md's own handoff to the next topic's lab).

## Databricks engineering blog — "Adaptive Query Execution: Speeding Up Spark SQL at Runtime"

URL: https://www.databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html
Version: fetched 2026-10-31 (published 2020, introducing AQE ahead of Spark 3.0; its own description of the reoptimization mechanism is unchanged through 4.0.1)

> One of the most important questions for Adaptive Query Execution is when to reoptimize. Spark operators are often pipelined and executed in parallel processes. However, a shuffle or broadcast exchange breaks this pipeline. We call them materialization points and use the term "query stages" to denote subsections bounded by these materialization points in a query.

> When the query starts, the Adaptive Query Execution framework first kicks off all the leaf stages — the stages that do not depend on any other stages.

> Now that we've got a newly optimized query plan with some completed stages, the adaptive execution framework will search for and execute new query stages whose child stages have all been materialized, and repeat the above execute-reoptimize-execute process until the entire query is done.

> But a number of things can make this size estimation go wrong — such as the presence of a very selective filter — or the join relation being a series of complex operators other than just a scan.

> To solve this problem, AQE now replans the join strategy at runtime based on the most accurate join relation size. As can be seen in the following example, the right side of the join is found to be way smaller than the estimate and also small enough to be broadcast, so after the AQE reoptimization the statically planned sort merge join is now converted to a broadcast hash join.

### Contents (item by item):

6. The "query stage" vocabulary and the reason AQE can only ever reoptimize at a stage boundary: a shuffle or broadcast exchange is the one point where every partition's real size is known before the next operator runs.
7. The exact "very selective filter" and "series of complex operators other than just a scan" wording — the real reason the static planner could not have known the aggregated side's true size in this topic's own measured example (a `GROUP BY` producing 30 rows out of 2,000,000).
8. The named mechanism — "replans the join strategy at runtime" — stated as exactly the sort-merge-to-broadcast conversion this topic measures, in the same direction (sort-merge statically chosen, broadcast chosen after reoptimization).

## Spark source, `AdaptiveSparkPlanExec.scala`

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/adaptive/AdaptiveSparkPlanExec.scala
Version: GitHub tag v4.0.0

> stages and executes them in order according to their dependencies. The query stage

> materializes its output at the end. When one stage completes, the data statistics of the

> materialized output will be used to optimize the remainder of the query.

> To create query stages, we traverse the query tree bottom up. When we hit an exchange node,

> and if all the child query stages of this exchange node are materialized, we create a new

> query stage for this exchange node. The new stage is then materialized asynchronously once it

> When one query stage finishes materialization, the rest query is re-optimized and planned based

> on the latest statistics provided by all materialized stages. Then we traverse the query plan

### Contents (item by item):

9. The class's own doc comment confirms, directly in the engine's source, the bottom-up stage-by-stage mechanism described in the docs and the blog — the exact code path `joined._jdf.queryExecution().executedPlan().toString()` prints as `AdaptiveSparkPlan isFinalPlan=true` once every stage has materialized.
10. "re-optimized and planned based on the latest statistics provided by all materialized stages" is the source-level statement of exactly what this topic's own `examples.py` demonstrates: the join operator above the aggregation's shuffle is untouched until that shuffle's stage materializes, at which point it is replanned.
