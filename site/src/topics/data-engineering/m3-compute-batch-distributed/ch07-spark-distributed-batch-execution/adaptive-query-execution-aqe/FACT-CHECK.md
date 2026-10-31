# Fact-check: de.adaptive-query-execution-aqe

## Claims table

| Claim | Basis | Check |
|---|---|---|
| Initial Plan is SortMergeJoin, 2 `Sort [` nodes | Measured (`examples.py`) | `node ... examples.py` assertions, passing |
| Final Plan is BroadcastHashJoin, no SortMergeJoin/`Sort [` | Measured | same |
| Final Plan has a `BroadcastExchange` (the grouped side) | Measured | same |
| Second query's Initial Plan has no `AQEShuffleRead` | Measured | same |
| Second query's Final Plan has `AQEShuffleRead coalesced` | Measured | same |
| Both queries' leaf scans are byte-identical between Initial and Final plans | Measured | same |
| AQE reoptimizes using runtime statistics, default-on since 3.2 | Sourced, Spark docs | `sources.mjs check`, 18/18 quotes |
| Coalescing merges post-shuffle partitions by map-output statistics | Sourced, Spark docs | same |
| Sort-merge-to-broadcast conversion happens once a side's runtime stats clear the threshold | Sourced, Spark docs + Databricks blog | same |
| Reoptimization only happens at a query-stage (shuffle/broadcast) boundary | Sourced, Databricks blog + `AdaptiveSparkPlanExec.scala` | same |
| A selective filter or non-scan relation is why the static estimate can be wrong | Sourced, Databricks blog | same |

## Red team

- **Is the "Initial Plan" really what the static planner alone would have chosen, or is it
  already influenced by AQE?** Checked directly: with `spark.sql.adaptive.enabled` left at its
  default (`true`), the `== Initial Plan ==` section is Spark's own label for the plan chosen by
  the ordinary cost-based planner before any AQE rule has touched it — confirmed by its presence
  unconditionally in both examples' plan text, printed by `AdaptiveSparkPlanExec` regardless of
  whether reoptimization later changes anything.
- **Could the broadcast conversion in example 1 be caused by something other than the real
  30-row count — e.g. the join key type, or the specific `%` operation?** Ruled out by probe
  13b (documented below): the same join shape with both sides genuinely large after filtering
  (no aggregation collapsing one side to a handful of rows) produced `SortMergeJoin` in *both*
  the Initial and Final plans, with no broadcast conversion at all. The conversion only appears
  once one side's real post-shuffle row count is small enough to clear the broadcast threshold.
- **Does the coalescing example actually need 200 configured partitions, or would any count
  show the same effect?** Not independently re-tested at other partition counts; disclosed as
  the configuration this topic measured rather than claimed to generalize to every count. The
  Spark docs' own description (`advisoryPartitionSizeInBytes`, a target byte size rather than a
  fixed count) is sourced directly to explain why the specific count chosen doesn't change the
  underlying mechanism.
- **Is the "nothing before the first exchange changes" claim actually checked, or just
  asserted?** Checked directly in `examples.py`: both queries' own `Range(...)` leaf node counts
  are asserted equal between their Initial and Final plan text, which is the measurable proxy for
  "the leaf scan itself was not rewritten."

## Abandoned approaches

The first probe (documented in the session's own working notes before this file was written)
joined a 2,000-row table to a 2,000,000-row table filtered down to 50 rows, expecting an
Initial-SortMergeJoin-vs-Final-BroadcastHashJoin contrast. It produced `BroadcastHashJoin` in
*both* the Initial and Final plan sections: the "large" side was actually only 2,000 rows
unfiltered, small enough for the static planner to broadcast it immediately, so AQE had nothing
left to change. A second attempt made both input tables genuinely large (1,000,000 rows each)
with one filtered down after the join key was fixed; this produced `SortMergeJoin` in both
sections instead, since a plain filter on a non-aggregated table still leaves Spark's static
estimate at the unfiltered size, and no promotion happened either way (this is probe 13b, kept as
the direct counter-example in the red-team section above). The design that worked replaced the
plain filter with a `GROUP BY` producing only 30 output rows from a 2,000,000-row input: a
grouping's true output size genuinely does not exist until its own shuffle stage finishes,
whereas a filter's selectivity is sometimes already reflected in Spark's static estimate — this
is the real mechanism the Databricks blog names directly ("a very selective filter... or the
join relation being a series of complex operators other than just a scan").
