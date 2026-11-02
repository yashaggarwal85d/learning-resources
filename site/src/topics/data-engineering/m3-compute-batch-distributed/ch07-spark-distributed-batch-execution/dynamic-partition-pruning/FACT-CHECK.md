# Fact-check: de.dynamic-partition-pruning

## Claims table

| Claim | Basis | Check |
|---|---|---|
| DPP on: plan has `dynamicpruningexpression`, 12 files / 3 partitions read | Measured (`examples.py`) | `node ... examples.py` assertions, passing |
| DPP off: plan has no `dynamicpruningexpression`, 400 files / 100 partitions read | Measured | same |
| Both give the same correct sum | Measured | same |
| `EXPLAIN FORMATTED` has a `Subqueries` section, a `ReusedExchange`, and exactly 2 `Scan parquet` operators | Measured | same |
| Unpartitioned fact table: no `dynamicpruningexpression` anywhere | Measured | same |
| The rule reuses an existing broadcast's results, or falls back to a plain subquery duplicate for a non-broadcast join | Sourced, `PlanDynamicPruningFilters.scala` | `sources.mjs check`, 6/6 quotes |
| The broadcast adaptor is placed to reuse the broadcast results on the probe side | Sourced, `PlanDynamicPruningFilters.scala` | same |
| The config generates a predicate for the partition column specifically when it's the join key | Sourced, Spark configuration docs | same |

## Red team

- **Is the measured pruning actually "dynamic," or could Catalyst have statically folded the
  dimension-side filter at plan time without any runtime mechanism at all?** This was the exact
  failure of the first design attempt (documented below): a dimension filter on a literal,
  range-derived IN-list got constant-folded away by ordinary predicate pushdown, pruning the
  fact table even with the DPP config flag turned off. Fixed by filtering the dimension table on
  a non-key column (`tier`) whose matching `region_id` values are only discoverable by actually
  reading the dimension table's real rows — confirmed by the DPP-off run genuinely reading all
  100 partitions, where the flawed design read only 3 regardless of the flag.
- **Does disabling `dynamicPartitionPruning.enabled` actually disable the mechanism, or just
  hide it from the plan's text while the files-read count stays the same?** Checked directly:
  with the corrected (non-foldable) filter, the DPP-off run's own measured files/partitions-read
  count (400/100) is substantively different from the DPP-on run's (12/3), not just a different
  plan string for the same physical read.
- **Is the `Subqueries` section genuinely a second scan, or just a label on the same scan the
  join already performs?** Checked directly via the `Scan parquet` operator-header count: the
  formatted plan has exactly two, one for the fact table's own scan (operator 1) and one for the
  dimension table's filter, re-scanned as its own subquery (operator 9) — confirmed as a
  genuinely separate operator, not a relabeling of operator 1.
- **Is "no partitions to prune" from the unpartitioned-fact case actually about partitioning, or
  could it be the `tier` filter itself failing to produce a usable broadcast?** Ruled out: the
  partitioned-fact run (claim 1) uses the identical dimension-side query and filter and does
  produce `dynamicpruningexpression`; only the fact table's own storage changed between the two
  cases, isolating partitioning as the variable that matters.

## Abandoned approaches

The first design for claim 1 filtered the dimension table directly on its join key
(`region_id in (5, 42, 77)`), with the dimension table itself built from `spark.range(...)` — a
deterministic, range-derived DataFrame rather than a scan of real external data. This produced
identical partition-pruning behavior (3 partitions read) whether `dynamicPartitionPruning.enabled`
was `true` or `false`: Catalyst's own ordinary constant-folding and predicate-pushdown rules could
already statically determine the exact set of matching `region_id` values at plan time, since
nothing about a literal IN-list filter on a deterministic range needs a runtime broadcast to
resolve. This was a real measurement bug, not a DPP effect at all — it would have "demonstrated"
pruning that had nothing to do with the topic's own mechanism. Fixed by filtering the dimension
table on a column (`tier`) whose selective values only exist as real written rows (read from an
actual Parquet file on disk) rather than something foldable from the filter's own literal — this
is exactly the distinction `PlanDynamicPruningFilters.scala`'s own doc comment implies: the rule
exists specifically for cases where the matching values can only be known by actually broadcasting
the dimension side's real, executed result.
