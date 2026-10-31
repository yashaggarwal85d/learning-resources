# OUTLINE: de.partition-sizing-repartition-coalesce

Full topic, chapter 7's eighth, opening §7.2. Syllabus line in full: "input splits
(spark.sql.files.maxPartitionBytes, open-cost padding), shuffle partition counts, per-task
overhead vs spill risk (target ~100–200 MB per task); repartition (full shuffle, even sizes) vs
coalesce (narrow merge, no shuffle) and the trap where coalesce(1) collapses the parallelism of
the whole upstream stage."

## Learning outcomes
1. State that a shuffle's own output partition count is a direct config, not derived from data volume.
2. Predict and confirm whether `repartition` introduces a real shuffle (it always does).
3. Predict and confirm whether `coalesce` introduces a shuffle (it never does) and that it can only shrink.
4. Predict and confirm the `coalesce(1)` trap: the whole upstream stage collapses into one task too.
5. Size a shuffle-partition count for a given data volume against the ~100-200 MB per-task guideline (sourced).

## Reel steps (final, matches reel.tsx) — 9 steps, 3 predicts (full topic requires ≥2), first at step 3 (index 2, within the first four)
1. Hook — the shuffle's own biggest lever: how many pieces?
2. Reveal: one config sets the count directly (4, then 17) — measured.
3. Predict 1 — does repartition introduce a real shuffle?
4. Reveal: repartition shuffles, confirmed by a real Exchange — measured.
5. Predict 2 — does coalesce shuffle the same way?
6. Reveal: coalesce has no Exchange, and can't grow past the start — measured.
7. Predict 3 — the coalesce(1) trap: just the output, or more?
8. Reveal: the whole upstream read collapses into one task — measured.
9. Recap — config sets the count; repartition shuffles; coalesce merges, carefully.

## Engagement arc
- Hook: genuine ambiguity about what actually decides the piece count.
- Predict 1 (step 3, index 2 ≤ 3): tempting wrong answer ("it's just a relabeling, nothing moves").
- Predict 2 (step 5): tempting wrong answer ("fewer pieces is fewer pieces, same cost either way").
- Predict 3 (step 7): tempting wrong answer ("the earlier work still runs in parallel as before").
- Surprising numbers/facts: the exact partition count tracking a config with no estimation at
  all; a call that reaches the same number with zero shuffle cost; coalescing to one quietly
  pulling an entire eight-partition read into a single task.
- Takeaways (3 explicit `takeaway` fields): step 4 (repartition pays for even sizes), step 6
  (coalesce is free but only shrinks), step 8 (coalesce(1)'s upstream collapse).
- Recap restates all three mechanisms together without repeating a takeaway verbatim.

## Narrator's line of thought (beyond description)
- Step 2: states the measured fact plainly, then names that it's a direct setting, not derived.
- Step 3: frames the predict around what guaranteeing even sizes actually demands.
- Step 4: states the plan-text confirmation and the even-size outcome together.
- Step 5: frames the predict around whether every path to fewer pieces costs the same.
- Step 6: states both measured facts (no shuffle, can't grow) back to back.
- Step 7: frames the predict around whether a merge adds a new boundary or folds into one.
- Step 8: states the reach-backward collapse as the measured confirmation.
- Step 9: names all three mechanisms together, then hands off to the next topic.

## Post-notes layers
- Outcomes: sizing a shuffle-partition count; predicting repartition/coalesce shuffle behaviour.
- Internals: maxPartitionBytes/openCostInBytes and the ~100-200 MB target, sourced-only.
- Production: `coalesce(1)` "just reducing output files"; treating repartition/coalesce as interchangeable.
- Frontier: AQE's own automatic `coalescePartitions`, disabled throughout this topic's measurement.
- Where this goes next: which partitioner decides which row lands where (next topic).

## Examples to execute (examples.py) and assertions
- `local[4]` session, AQE disabled: `spark.sql.shuffle.partitions` set to 4, then 17; a
  `groupBy` on the same 1,000,000-row `range()` produces exactly that many output partitions
  each time (`getNumPartitions()`).
- An 8-partition, Exchange-free base (`spark.range(..., numPartitions=8)`, confirmed no
  `Exchange` in its own plan): `repartition(3)` produces 3 partitions with `Exchange` present in
  its plan; `coalesce(3)` produces 3 partitions with no `Exchange`; `coalesce(20)` from that same
  8-partition base stays at 8 (coalesce never grows).
- A separate 8-partition, 2,000,000-row dataset, `coalesce(1)`: `getNumPartitions() == 1`, and
  `mapPartitions` confirms all 2,000,000 rows sit inside that one partition.
All assertions pass against real PySpark 4.0.1, Java 21, local mode (verified; terminal output in
session log).

## Bridge and handoff
- Bridge: "Section 7.1 ended on the one path that escapes Spark's own execution machinery. This
  section returns to that machinery's biggest single cost, the shuffle, starting at its lowest
  lever: how many pieces the work is cut into in the first place."
- Handoff: "Sizing says how many partitions and how big. It says nothing about which partitioner
  decided which row lands in which one — the next topic's own question."

## Concept ledger
- Introduces: `spark-partition-sizing`, `spark-repartition-vs-coalesce`.
- Uses: `spark-shuffle-partitions-config`, `spark-shuffle-mechanics`.
- Declared: none.

## Claims list (claim → source)
1. `spark.sql.files.maxPartitionBytes` caps bytes packed into one input partition when reading
   files → Spark SQL Performance Tuning docs.
2. `spark.sql.files.openCostInBytes` pads each file's estimated cost so small files don't
   over-crowd one partition → same source.
3. `spark.sql.shuffle.partitions` configures the shuffle output partition count directly → same
   source.
4. `FilePartition.scala`'s own packing function takes `maxSplitBytes` and `openCostInBytes`
   together as inputs to one decision → `FilePartition.scala` (Apache Spark source, GitHub).
5. The shuffle.partitions-to-output-count equality, the repartition/coalesce Exchange
   distinction, coalesce's can't-grow behaviour, and the coalesce(1) upstream collapse → measured
   directly, `examples.py`.

## Progress
Research, OUTLINE, fact-check, coverage map and every file built; checks run and green (build,
narration-teaches, reel test). Status: built, ready to ship as `status: 'held'`, narration queued
via `renarration.json` (no GPU in this cloud session). Next topic: 9/30,
de.hash-range-partitioning-pruning.
