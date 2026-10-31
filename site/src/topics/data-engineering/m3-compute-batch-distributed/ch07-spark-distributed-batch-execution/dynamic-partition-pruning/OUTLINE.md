# Outline: de.dynamic-partition-pruning

## Syllabus line (verbatim, `syllabus/data-engineering.md:427`)

> **Dynamic partition pruning (DPP)** — using the dimension-side filter result at runtime as a subquery/broadcast filter to prune fact-table partitions in a star join; preconditions (partitioned fact table, selective dimension filter) and how to see it in the plan.

## Learning outcomes

- Predict whether a given star-schema query qualifies for DPP from its filter and partitioning
  alone, before running it.
- Find DPP's subquery-duplicate filter directly in `EXPLAIN FORMATTED` output.

## Reel steps (10, kind: full)

1. Hook — a 1,000,000-row fact table, partitioned by region; a dimension table filtered to just
   a few regions. How many of the fact table's partitions does the join actually have to read?
2. Reveal: the baseline — files/partitions read with DPP forced off. (No takeaway — reel test's
   own "from" step, per [[learning-resources-takeaway-position-gotcha]].)
3. Predict (index 2, within first 4) — does partitioning the fact table by the join column alone
   guarantee pruning, with no further condition?
4. Reveal: no — DPP only fires once the dimension side becomes a broadcast join's build side.
   (No takeaway — immediately after a predict.)
5. Elaborate: the plan reuses that same broadcast, rather than scanning the dimension table
   twice. **Takeaway 1.**
6. Predict (index 5) — if the fact table isn't partitioned by the join column at all, does DPP
   still cut down what's scanned?
7. Reveal: no — without a partitioned fact table there is nothing for a pruning filter to prune.
   (No takeaway — immediately after a predict.)
8. Elaborate: `EXPLAIN FORMATTED`'s own `Subqueries` section names the exact mechanism — the
   dimension-side filter, planned and run a second time, independently of the join itself.
   **Takeaway 2.**
9. Reveal: the two preconditions together, confirmed side by side — partitioned fact table,
   broadcastable dimension side, both required; files read drops by over 30x.
10. Recap. **Takeaway 3.**

Engagement arc: two predicts (≥2 required), the first at index 2 (≤4 required); three takeaways,
each on a step that is neither the reel test's "from" step (here step 2) nor immediately after a
predict (here steps 4 and 7) — same pattern as topic 13's own fix.

## Narrator's line of thought per step

1. Pose the concrete question: a million rows, partitioned by region, and a filter that only
   wants three regions out of a hundred. What does Spark actually have to touch.
2. Name the two numbers that prove the baseline without reading a row of the fact table's data.
3. Invite a guess: is partitioning alone enough, since the column lines up.
4. The missing condition: a broadcast join has to actually be the plan Spark chose.
5. The mechanism, stated plainly: nothing gets scanned twice — the join's own broadcast is reused.
6. A second guess, in the other direction: what if the fact table was never partitioned at all.
7. No partitions to prune means no filter can do anything, however selective it is.
8. Where to actually see it: the plan's own subqueries section, naming the duplicate filter by
   name.
9. Put both conditions back together, with the real numbers next to each other.
10. Pull the thread: two conditions, one mechanism, a direct way to check it from the plan text.

## Post-notes layers

- `outcomes`: reading `EXPLAIN FORMATTED`'s `PartitionFilters` and `Subqueries` sections as the
  check itself.
- `when DPP falls back instead of firing, the sourced-only half`: the `onlyInBroadcast` bailout
  and the plain subquery-duplicate fallback for a join that isn't a broadcast hash join.
- `production failures`: a fact table partitioned by the wrong column, or a dimension filter not
  selective enough to be worth a second scan.
- `frontier`: the chapter's own close — what Spark writes, not reads, handed off next.

## `examples.py` claims (all measured against real PySpark 4.0.1, local[4])

1. A fact table partitioned by `region_id` (100 partitions, 1,000,000 rows), joined to a
   dimension table filtered to 3 of 100 regions on a non-key column (`tier = 'gold'`, so the
   matching region IDs are only known by reading the dimension table's real rows, not foldable
   at plan time): with DPP on, the plan contains `dynamicpruningexpression`, and the join reads
   12 files / 3 partitions. With DPP forced off, the same query reads 400 files / 100 partitions.
2. `EXPLAIN FORMATTED` on the DPP-on plan has a `Subqueries` section with its own `Scan parquet`
   of the dimension table, independent of the join's own `ReusedExchange` — the literal
   subquery-duplicate filter the learning outcome asks to find.
3. The same join, but with the fact table written unpartitioned: no `dynamicpruningexpression`
   anywhere in the plan — confirming the partitioned-fact-table precondition directly.

## Bridge / handoff (copied exactly from CHAPTER.md)

- Bridge: "Skew remedies rearrange a shuffle that still has to happen. DPP removes files from the
  fact-table scan before any shuffle starts, using the small side's own filter as the pruning
  signal."
- Handoff: "Everything in this section changed what gets shuffled or scanned. The last topic of
  the section changes a different thing entirely: what Spark actually writes out when the job is
  done."

## Concept ledger

- Introduces: `spark-dynamic-partition-pruning`.
- Uses: `spark-partition-pruning`, `spark-broadcast-hash-join`.
- Declared: none.

## Claims list

| Claim | Source |
|---|---|
| DPP's rule rewrites the pruning predicate to reuse an existing broadcast's own results | `PlanDynamicPruningFilters.scala` |
| For a non-broadcast join, DPP falls back to a plain subquery duplicate instead | `PlanDynamicPruningFilters.scala` |
| The config generates a predicate for the partition column specifically when it's the join key | Spark configuration docs |

## Progress

Next topic: 16. `de.spark-output-file-layout`.
