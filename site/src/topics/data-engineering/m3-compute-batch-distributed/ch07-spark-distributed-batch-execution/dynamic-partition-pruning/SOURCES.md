# Sources: de.dynamic-partition-pruning

## Spark source, `PlanDynamicPruningFilters.scala`

URL: https://raw.githubusercontent.com/apache/spark/v4.0.0/sql/core/src/main/scala/org/apache/spark/sql/execution/dynamicpruning/PlanDynamicPruningFilters.scala
Version: GitHub tag v4.0.0

> This planner rule aims at rewriting dynamic pruning predicates in order to reuse the

> results of broadcast. For joins that are not planned as broadcast hash joins we keep

> the fallback mechanism with subquery duplicate.

> place the broadcast adaptor for reusing the broadcast results on the probe side

> it is not worthwhile to execute the query, so we fall-back to a true literal

### Contents (item by item):

1. The rule's own doc comment naming both mechanisms this topic measures: reusing an existing
   broadcast's own results when the join is already a broadcast hash join (the measured case),
   and a separate subquery-duplicate fallback for every other join shape.
2. The exact wording for "reusing the broadcast results on the probe side" — the source-level
   name for what the measured plan shows as a `ReusedExchange` on the fact scan's own side.
3. The rule's own threshold for abandoning the filter entirely (`onlyInBroadcast`) when the
   dimension-side subquery would cost more to execute than it could ever save — named only, not
   independently measured, since this topic's own worked example always clears that bar.

## Spark configuration docs

URL: https://spark.apache.org/docs/latest/configuration.html
Version: Spark 4.3.0 documentation (fetched 2026-10-31; the config's own default and behavior are
unchanged from 4.0.1, the version measured against)

> When true, we will generate predicate for partition column when it's used as join key

### Contents (item by item):

4. The config's own one-line description of `spark.sql.optimizer.dynamicPartitionPruning.enabled`
   — a predicate generated for the partition column specifically because it's the join key,
   exactly the precondition (partitioned fact table, join on the partition column) this topic's
   own `examples.py` measures as required for pruning to trigger at all.
