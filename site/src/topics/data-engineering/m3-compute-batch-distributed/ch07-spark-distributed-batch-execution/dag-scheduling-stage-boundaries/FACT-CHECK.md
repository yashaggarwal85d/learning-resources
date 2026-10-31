# Fact-check: de.dag-scheduling-stage-boundaries

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Narrow dependency: each parent partition used by at most one child partition | Confirmed | `sources/rdd-paper.txt`, quoted verbatim in `SOURCES.md` (§4, dependency classification); `scripts/sources.mjs check` passes. |
| 2 | Wide dependency: a child partition may depend on multiple parent partitions | Confirmed | Same paragraph, quoted exactly. |
| 3 | The scheduler cuts stage boundaries at wide/shuffle dependencies, pipelines narrow ones | Confirmed | Paper's scheduler description, quoted exactly ("Whenever a user runs an action…"). |
| 4 | Wide-dependency shuffle outputs are materialized for fault recovery, like MapReduce | Confirmed | Paper, quoted exactly ("For wide dependencies…"). |
| 5 | Current Spark's "shuffle" terminology is the modern name for the paper's "wide dependency" | Confirmed | RDD Programming Guide, "Shuffle operations" section, quoted exactly. |
| 6 | A narrow chain (filter→select→filter) costs exactly one stage, regardless of chain length, with no Exchange in the plan | Confirmed | Measured directly: `examples.py`, stage count 1, `"Exchange" not in queryExecution().toString()`. |
| 7 | A single groupBy adds exactly one stage (two total) and introduces an Exchange | Confirmed | Measured directly: `examples.py`, stage count 2, `"Exchange" in queryExecution().toString()`. |
| 8 | A second, independent groupBy chained after the first adds exactly one more stage (three total) | Confirmed | Measured directly: `examples.py`, stage count 3. |

## Red team

- **Could the narrow chain's "one stage" result be an artifact of AQE coalescing something, rather than a genuine absence of any shuffle?** Checked both ways: the stage *count* is 1, and independently the plan *text* contains no `"Exchange"` substring at all — two independent signals agreeing, not one inferred from the other.
- **Is `count()` a safe action to use for comparing narrow vs. wide stage counts?** No — found during drafting (not left as a silent assumption): `count()` on even a purely narrow chain produced 2 stages in an early draft of this script, because Spark's `count()` aggregate always adds a final single-partition merge stage regardless of what came before it. Switched every action in `examples.py` to `collect()`, which has no such built-in aggregation step, and re-verified the narrow case drops back to 1 stage with no Exchange. This is disclosed in `OUTLINE.md` and in the script's own comment, not hidden.
- **Does "one wide dependency equals one more stage" hold for every kind of wide operation, or only `groupBy`?** This topic measures only `groupBy`; `join` (against non-co-partitioned inputs) and `repartition` are asserted as wide by the cited paper's own examples (Figure 4, "join leads to... wide dependencies") but not separately measured here — the join case's co-partitioned exception is explicitly deferred to §7.2 (bucketing), both in `OUTLINE.md` and `coverage.json`'s `expert` list, rather than silently assumed identical.
- **Is the RDD paper (2012) still an accurate description of DataFrame-level (Catalyst) scheduling in Spark 4.x?** The DAGScheduler's stage-cut algorithm operates on the RDD lineage graph underneath DataFrames unchanged since the paper; Catalyst adds planning on top (chosen physical operators, Exchange nodes) but does not change what a shuffle dependency is or when a stage boundary is cut. The RDD Programming Guide source (current docs) cross-confirms the "shuffle" vocabulary is unchanged.

No corrections were needed to `OUTLINE.md` beyond the `count()`-vs-`collect()` methodology fix made during drafting itself.
