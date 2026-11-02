# OUTLINE: de.hash-range-partitioning-pruning

Full topic, chapter 7's ninth. Syllabus line in full (§7.2): "hash partitioner vs sampled range
partitioner (global sorts); exchange elimination when an existing output partitioning already
satisfies the required distribution; static partition pruning on Hive-style directory layouts and
DSv2 partition-stats filtering."

## Learning outcomes
1. Name which partitioner a given shuffle uses (hash vs. range) from its own plan-text tag.
2. Predict and confirm that a later step reuses an earlier shuffle when its own requirement is already met.
3. Predict and confirm that two steps requiring different partitioning each pay for their own shuffle.
4. Predict and confirm static partition pruning on a Hive-style directory layout, contrasted against a flat layout.

## Reel steps (final, matches reel.tsx) — 9 steps, 3 predicts (full topic requires ≥2), first at step 3 (index 2, within the first four)
1. Hook — a group-by and a sort: same partitioner, or different?
2. Reveal: hash partitioning vs. range partitioning, named in the plan — measured.
3. Predict 1 — two steps, same key: does the second one pay for its own shuffle too?
4. Reveal: one shared shuffle, the second step costs nothing — measured.
5. Predict 2 — the same two steps, different keys: still shared?
6. Reveal: two real shuffles, confirming the sharing was conditional — measured.
7. Predict 3 — a Hive-style layout, filtered: whole directories skipped, or rows filtered after?
8. Reveal: a real PartitionFilters entry vs. an empty one on a flat layout — measured.
9. Recap — which partitioner, when a shuffle is skipped, which directories are pruned.

## Engagement arc
- Hook: genuine ambiguity about whether grouping and sorting shuffle the same way.
- Predict 1 (step 3, index 2 ≤ 3): tempting wrong answer ("each step asks for its own split, so each pays").
- Predict 2 (step 5): tempting wrong answer ("the planner reuses shuffles regardless of key").
- Predict 3 (step 7): tempting wrong answer ("the engine still reads everything, then filters").
- Surprising numbers/facts: two operations tagged with entirely different partitioners; a later
  step costing literally nothing when its requirement is already met; the identical filter
  producing a named directory filter on one layout and nothing at all on another.
- Takeaways (3 explicit `takeaway` fields): step 4 (reuse when satisfied), step 6 (reuse is
  conditional, not automatic), step 8 (pruning needs a layout to prune against).
- Recap restates all three mechanisms together.

## Narrator's line of thought (beyond description)
- Step 2: states both measured tags plainly, framing them as two separate mechanisms.
- Step 3: frames the predict around what the planner actually checks before adding anything.
- Step 4: states the measured sharing and names why (requirement already met).
- Step 5: frames the predict around whether sharing is automatic or conditional.
- Step 6: states the contrast plainly, confirming the earlier sharing was a real decision.
- Step 7: frames the predict around what the directory names themselves already tell the engine.
- Step 8: states the named filter and its absence on the flat layout together.
- Step 9: names all three mechanisms together, then hands off to the next topic.

## Post-notes layers
- Outcomes: naming the partitioner from purpose; recognising and confirming shuffle reuse.
- Internals: DSv2's own SupportsPushDownFilters-based partition-stats filtering, sourced-only.
- Production: assuming sort and group-by shuffle identically; redundant repartition calls.
- Frontier: dynamic partition pruning, the runtime-filter sibling to this topic's static case.
- Where this goes next: bucketing, pre-arranging partitions at write time (next topic).

## Examples to execute (examples.py) and assertions
- `local[4]` session, AQE disabled, `spark.sql.shuffle.partitions` at 4: a `groupBy`'s own plan
  contains `hashpartitioning`; an `orderBy`'s own plan contains `rangepartitioning`.
- Two window steps, `Window.partitionBy("k")` applied twice back to back: the combined plan's
  `Exchange` count is exactly 1. The same two steps, one partitioned by `k` and the other by a
  different column `j`: the combined plan's `Exchange` count is exactly 2.
- A dataset written with `partitionBy("day")` (Hive-style directories) and filtered on `day`:
  the scan's own `FileScan parquet` line contains `PartitionFilters: [isnotnull` and the literal
  equality predicate. The identical dataset written flat (no `partitionBy`) and filtered the same
  way: the scan's own line contains `PartitionFilters: []`.
All assertions pass against real PySpark 4.0.1, Java 21, local mode (verified; terminal output in
session log).

## Bridge and handoff
- Bridge: "Sizing decided how many pieces. This topic decides which row goes in which piece, and
  shows the one case — exchange elimination — where Spark notices it doesn't need to re-decide at
  all."
- Handoff: "Pruning skips reading partitions that can't match. Bucketing, next, goes further:
  pre-arranging the partitions at write time so a later join skips the shuffle entirely, not just
  the read."

## Concept ledger
- Introduces: `spark-hash-range-partitioner`, `spark-partition-pruning`.
- Uses: `spark-partition-sizing`, `spark-catalyst-pipeline`.
- Declared: none.

## Claims list (claim → source)
1. `HashPartitioning` places rows sharing the same hash of its expressions into the same
   partition → `partitioning.scala` (Apache Spark source, GitHub).
2. `RangePartitioning` splits rows by a total ordering, a stronger guarantee than mere grouping
   → same source.
3. Hive-style partitioning stores partitioning column values encoded directly in the directory
   path → Parquet Files — Partition Discovery docs.
4. A DSv2 data source implements `SupportsPushDownFilters` to push filters down and reduce how
   much data a scan reads → `SupportsPushDownFilters.java` (Apache Spark source, GitHub).
5. The hash/range partitioner tags, the shared-vs-separate Exchange counts, and the
   PartitionFilters distinction → measured directly, `examples.py`.

## Progress
Research, OUTLINE, fact-check, coverage map and every file built; checks run and green (build,
narration-teaches, reel test). Status: built, ready to ship as `status: 'held'`, narration queued
via `renarration.json` (no GPU in this cloud session). Next topic: 10/30,
de.bucketing-storage-partitioned-joins.
