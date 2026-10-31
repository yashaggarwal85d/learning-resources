# OUTLINE: de.bucketing-storage-partitioned-joins

Full topic, chapter 7's tenth. Syllabus line in full (§7.2): "pre-shuffling tables on the
join/aggregation key at write time so later joins skip the exchange; bucket-count-must-match and
stale-bucketing pitfalls; storage-partitioned join (SPJ) over DSv2 sources such as Iceberg, which
reuses the table's own partitioning instead of Hive bucketing."

## Learning outcomes
1. Predict and confirm that two tables bucketed the same way join with zero shuffle.
2. Predict and confirm that mismatched bucket counts force a real shuffle again.
3. Explain why bucketing has to match exactly, bucket count included, or Spark falls back
   completely rather than partially.
4. Distinguish classic Hive bucketing from SPJ's DSv2, table-format-driven equivalent.

## Reel steps (final, matches reel.tsx) — 7 steps, 2 predicts (full topic requires ≥2), first at
step 3 (index 2, within the first four)
1. Hook — two tables already split by the same key at write time: does the join skip the shuffle entirely?
2. Reveal: measured — matching bucket counts, zero Exchange, the scan itself tagged a bucketed read.
3. Predict 1 — the two tables don't agree on bucket count: still free?
4. Reveal: measured — one real Exchange, and the matching side's own scan shows bucketing disabled too.
5. Predict 2 — a DSv2 table (e.g. Iceberg) partitioned the same way: the same bucketing mechanism, or something else?
6. Reveal: sourced — storage-partitioned join reuses the table's own reported partitioning, not Hive bucketBy at all.
7. Recap.

## Engagement arc
- Hook: genuine ambiguity about whether pre-splitting both tables actually pays off.
- Predict 1 (step 3, index 2 ≤ 3): tempting wrong answer ("buckets are buckets, Spark just matches
  them up regardless of count").
- Predict 2 (step 5): tempting wrong answer ("Iceberg just uses the same bucketBy mechanism under
  a different name").
- Surprising numbers/facts: zero Exchange nodes at all when buckets agree; the side whose own
  bucket count still matches on its own still loses its bucketed read the moment the OTHER side
  disagrees; SPJ needs no `bucketBy` call anywhere, only the table's own catalog-reported
  partitioning.
- Takeaways (3 explicit `takeaway` fields): step 2 (bucketing by the join key at write time can
  remove the shuffle completely), step 4 (the match has to be exact or the whole optimisation is
  withdrawn, not partially kept), step 6 (SPJ is bucketing's own idea generalised to a DSv2
  source's own partitioning, not the same underlying mechanism).
- Recap restates both mechanisms together.

## Narrator's line of thought (beyond description)
- Step 2: states the measured zero-Exchange result and names why (requirement already satisfied
  by both sides' own storage layout).
- Step 3: frames the predict around whether "bucketed" alone is enough, or whether the count has
  to agree too.
- Step 4: states the measured contrast plainly, naming that the match failing on one side
  disables the whole optimisation, not just half of it.
- Step 5: frames the predict around whether a table format's own partitioning needs Spark's own
  bucketBy mechanism to get the same benefit.
- Step 6: states the sourced contrast plainly: a different partitioning representation, a
  generalisation of the same goal.
- Step 7: names both mechanisms together, then hands off to the next topic.

## Post-notes layers
- Outcomes: predicting and confirming when a join skips its shuffle from storage layout alone.
- Internals: `KeyGroupedPartitioning`'s own scaladoc, sourced-only (no real Iceberg table here).
- Production: a bucket-count change on only one side of a long-lived table silently reintroducing
  a shuffle nobody notices until a job's wall time regresses.
- Frontier: the SQL configs that extend SPJ further (partially-clustered skew handling, compatible
  but non-identical transforms), named and sourced only.
- Where this goes next: the two join strategies Spark falls back to when no agreement exists at
  all — broadcast, next, then the two shuffle join strategies against each other.

## Examples to execute (examples.py) and assertions
- `local[4]` session, AQE disabled, autobroadcast threshold forced off, `spark.sql.shuffle.partitions`
  at 4: two tables bucketed by the same key with the SAME bucket count (4) join with the combined
  plan's own `Exchange` count at exactly 0, and both sides' own `FileScan` lines tagged
  `Bucketed: true`.
- The identical left table joined against the same data written with a DIFFERENT bucket count (6):
  the combined plan's own `Exchange` count is exactly 1, and the LEFT table's own scan — still 4
  buckets on its own, unchanged — now shows `Bucketed: false (disabled by query planner)`.
All assertions pass against real PySpark 4.0.1, Java 21, local mode (verified; terminal output in
session log).

## Bridge and handoff
- Bridge: "Partition pruning skips reading data that can't match. This topic is the write-time
  version of the same idea applied to joins: if both tables are already partitioned the same way,
  the join's own shuffle never has to happen."
- Handoff: "Bucketing avoids a shuffle by agreement at write time. The next three topics are about
  the shuffle when it does happen — the actual join strategies and how Spark picks one."

## Concept ledger
- Introduces: `spark-bucketing`, `spark-storage-partitioned-join`.
- Uses: `spark-hash-range-partitioner`.
- Declared: none.

## Claims list (claim → source)
1. Bucketing and sorting apply only to persistent tables, written with `saveAsTable` → Generic
   Load/Save Functions docs.
2. `bucketBy` splits rows across a fixed number of buckets, usable when the column's unique-value
   count is unbounded → same source.
3. Storage Partition Join avoids the shuffle phase using the existing storage layout, generalising
   bucket joins to DSv2 sources with their own reported partitioning function → Performance Tuning
   docs, Storage Partition Join section.
4. A successful SPJ leaves no Exchange node before the join in the plan → same source.
5. `KeyGroupedPartitioning` is keyed on a data source's own reported partition transform
   expressions, not a hash Spark itself computes → `partitioning.scala` (Apache Spark source,
   GitHub).
6. Matching bucket counts join with zero Exchange; a bucket-count mismatch forces a real Exchange
   and disables the bucketed read on the still-matching side too → measured directly, `examples.py`.

## Progress
Research, OUTLINE, fact-check, coverage map and every file built; checks run and green (build,
narration-teaches, reel test). Status: built, ready to ship as `status: 'held'`, narration queued
via `renarration.json` (no GPU in this cloud session). Next topic: 11/30, de.broadcast-hash-join.
