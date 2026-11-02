# Sources: de.data-skew-diagnosis-remedies

## Databricks engineering blog — "Adaptive Query Execution: Speeding Up Spark SQL at Runtime"

URL: https://www.databricks.com/blog/2020/05/29/adaptive-query-execution-speeding-up-spark-sql-at-runtime.html
Version: fetched 2026-10-31 (published 2020, introducing AQE ahead of Spark 3.0; its own description of skew-join handling is unchanged through 4.0.1)

> Data skew occurs when data is unevenly distributed among partitions in the cluster. Severe skew can significantly downgrade query performance, especially with joins. AQE skew join optimization detects such skew automatically from shuffle file statistics. It then splits the skewed partitions into smaller subpartitions, which will be joined to the corresponding partition from the other side respectively.

> When the query starts, the Adaptive Query Execution framework first kicks off all the leaf stages — the stages that do not depend on any other stages. As soon as one or more of these stages finish materialization, the framework marks them complete in the physical query plan and updates the logical query plan accordingly, with the runtime statistics retrieved from completed stages. Based on these new statistics, the framework then runs the optimizer (with a selected list of logical optimization rules), the physical planner, as well as the physical optimization rules, which include the regular physical rules and the adaptive-execution-specific rules, such as coalescing partitions, skew join handling, etc. Now that we've got a newly optimized query plan with some completed stages, the adaptive execution framework will search for and execute new query stages whose child stages have all been materialized, and repeat the above execute-reoptimize-execute process until the entire query is done.

### Contents (item by item):

1. The definition of skew itself — uneven distribution across partitions, worst for joins — and the exact mechanism AQE's skew-join feature uses: detect from shuffle file statistics, split skewed partitions, join each split against the matching partition on the other side. This is the mechanism measured directly in `examples.py`'s AQE-split remedy.
2. The stage-by-stage reoptimization loop, naming "skew join handling" explicitly as one of the adaptive-execution-specific physical rules that only runs once a shuffle stage has materialized — the reason skew can only be detected and fixed after a real shuffle has already happened once.

## Spark source, `OptimizeSkewedJoin.scala`

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/adaptive/OptimizeSkewedJoin.scala
Version: GitHub tag v4.0.0

> A rule to optimize skewed joins to avoid straggler tasks whose share of data are significantly

> larger than those of the rest of the tasks.

> The general idea is to divide each skew partition into smaller partitions and replicate its

> matching partition on the other side of the join so that they can run in parallel tasks.

> A partition is considered as a skewed partition if its size is larger than the median

> partition size * SKEW_JOIN_SKEWED_PARTITION_FACTOR and also larger than

> case class OptimizeSkewedJoin(ensureRequirements: EnsureRequirements)

> case smj @ SortMergeJoinExec(_, _, joinType, _,

> case shj @ ShuffledHashJoinExec(_, _, joinType, _, _,

### Contents (item by item):

3. The rule's own doc comment naming its purpose: avoiding straggler tasks whose data share is "significantly larger than those of the rest" — the exact definition of a skewed partition this topic measures as a max/median ratio.
4. The split-and-replicate mechanism in the rule's own words, matching the measured AQE-split remedy exactly.
5. The threshold calculation — median partition size times a skew factor, or an absolute threshold, whichever is larger — the source-level reason the default threshold (256MB) didn't trigger a split at this topic's data scale until lowered, as measured and disclosed in `FACT-CHECK.md`.
6. The threshold constant's other half, confirmed directly in source.
7. The rule's own class declaration, confirming it is a distinct, named rewrite rule, not a general-purpose mechanism.
8. The exact pattern match on `SortMergeJoinExec` — proof the rule only ever rewrites a join operator.
9. The exact pattern match on `ShuffledHashJoinExec` — the only other case this rule matches. No aggregation, outer-join-preserved-side, or window-function case appears anywhere in this rule, which is the source-level basis for this topic's claim that AQE's skew-join handling does not apply to them.

## Spark SQL Performance Tuning docs — Adaptive Query Execution

URL: https://spark.apache.org/docs/latest/sql-performance-tuning.html#adaptive-query-execution
Version: Spark 4.3.0 documentation (fetched 2026-10-31; AQE's own skew-join config keys are unchanged from 4.0.1, the version measured against)

> Data skew can severely downgrade the performance of join queries. This feature dynamically handles skew in sort-merge join by splitting (and replicating if needed) skewed tasks into roughly evenly sized tasks.

### Contents (item by item):

10. The docs' own restatement of the skew-join feature, naming it specifically for sort-merge join — the same join-only scope confirmed at the source level.
