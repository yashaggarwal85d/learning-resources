# OUTLINE: de.broadcast-hash-join

Full topic, chapter 7's eleventh. Syllabus line in full (§7.2): "the driver collects the small
side and ships it to every executor as a torrent broadcast; `autoBroadcastJoinThreshold`, hints
and the 8 GB table limit; why a broadcast becomes dangerous (stale statistics, driver OOM, filters
that don't shrink the side); broadcast nested-loop join as the non-equi fallback."

## Learning outcomes
1. Predict and confirm whether a join between a small and a large table broadcasts, from the
   small side's size against the threshold.
2. Predict and confirm the complete fallback once the small side crosses the threshold.
3. Predict and confirm that a non-equi join condition still broadcasts, but as a different
   physical mechanism (nested loop, not hash).
4. Explain, from the source's own mechanism, why a broadcast with stale statistics risks the
   driver's own memory.

## Reel steps (final, matches reel.tsx) — 7 steps, 2 predicts (full topic requires ≥2), first at
step 3 (index 2, within the first four)
1. Hook — a small table joined to a huge one: does Spark copy the small table everywhere, or
   shuffle both sides?
2. Reveal: measured — under the default threshold, a BroadcastExchange and BroadcastHashJoin,
   zero shuffle Exchanges at all.
3. Predict 1 — the same query, but the small table grows past the threshold: still copied
   everywhere?
4. Reveal: measured — no broadcast at all now, a real SortMergeJoin with two shuffle Exchanges.
5. Predict 2 — the join condition is non-equi, but the small side is still small enough to
   broadcast: the same hash-join mechanism, or something else?
6. Reveal: measured — a BroadcastNestedLoopJoin instead; still no shuffle, but matching rows
   pairwise rather than by a hash.
7. Recap.

## Engagement arc
- Hook: genuine ambiguity about whether Spark copies the small table or shuffles both sides.
- Predict 1 (step 3, index 2 ≤ 3): tempting wrong answer ("the threshold is a soft guideline;
  Spark broadcasts close calls anyway").
- Predict 2 (step 5): tempting wrong answer ("a non-equi condition still hashes, Spark just
  compares the hash buckets differently").
- Surprising numbers/facts: crossing the threshold removes the broadcast completely rather than
  shrinking it; a non-equi condition still avoids the shuffle entirely, but trades the hash join
  for a full pairwise comparison instead.
- Takeaways (3 explicit `takeaway` fields): step 2 (broadcasting removes the shuffle by making one
  side small enough to copy everywhere), step 4 (the threshold is a hard line, not a soft
  preference — crossing it falls back completely), step 6 (broadcasting without an equality
  condition changes the matching mechanism itself, not just the data movement).
- Recap restates all three mechanisms together.

## Narrator's line of thought (beyond description)
- Step 2: states the measured result and names why (the small side is fully copied, so the large
  side needs no shuffle to find its matches).
- Step 3: frames the predict around whether the threshold is a hard cutoff or a loose guideline.
- Step 4: states the measured fallback plainly, naming that it's complete, not partial.
- Step 5: frames the predict around whether broadcasting needs an equality condition to work at
  all.
- Step 6: states the measured contrast plainly: still no shuffle, but a different matching
  mechanism underneath.
- Step 7: names all three mechanisms together, then hands off to the next topic.

## Post-notes layers
- Outcomes: predicting and confirming whether, and how, a join broadcasts from table sizes and the
  join condition's own shape.
- Internals: `BroadcastExchangeExec`'s own collect-transform-broadcast mechanism, and why that
  mechanism risks the driver's own memory when statistics are stale — sourced-only, no real driver
  OOM is deliberately caused here.
- Production: trusting stale table statistics to keep a broadcast safely under the threshold; a
  filter that doesn't actually shrink the broadcast side the way it looks like it should.
- Frontier: the `BROADCAST` join hint overriding the threshold entirely, and AQE's own runtime
  conversion of a sort-merge join into a broadcast join once real statistics are known — both
  named and sourced only.
- Where this goes next: the two shuffle join strategies, chosen against each other, for when
  neither side is small enough to broadcast at all.

## Examples to execute (examples.py) and assertions
- `local[4]` session, AQE disabled, `spark.sql.shuffle.partitions` at 4: a small table (500 rows)
  joined to a large one (200,000 rows) under the default `autoBroadcastJoinThreshold` produces a
  plan containing `BroadcastExchange` and `BroadcastHashJoin`, with no shuffle `Exchange` anywhere.
- The identical join with the threshold forced to `-1`: the plan contains no `BroadcastExchange`,
  contains `SortMergeJoin`, and its own `Exchange` count is exactly 2.
- The identical small table joined on a non-equi condition (`<`, not `==`) at the default
  threshold: the plan contains `BroadcastNestedLoopJoin` and `BroadcastExchange`, and contains no
  `BroadcastHashJoin`.
All assertions pass against real PySpark 4.0.1, Java 21, local mode (verified; terminal output in
session log).

## Bridge and handoff
- Bridge: "Bucketing avoids a shuffle by agreement. Broadcasting avoids it by a different trick
  entirely: making one side small enough to copy everywhere, so there is nothing left to
  shuffle."
- Handoff: "Broadcasting is the strategy for when one side is small. The next topic is what
  happens when neither side is — the two shuffle join strategies, chosen against each other."

## Concept ledger
- Introduces: `spark-broadcast-hash-join`, `spark-broadcast-nested-loop`.
- Uses: `spark-catalyst-pipeline`, `spark-shuffle-mechanics`.
- Declared: none.

## Claims list (claim → source)
1. `autoBroadcastJoinThreshold` sets the maximum size Spark will broadcast, defaulting to 10 MB,
   and can be disabled by setting it to -1 → Performance Tuning docs.
2. The `BROADCAST` join hint overrides the threshold entirely, producing either a broadcast hash
   join or a broadcast nested-loop join depending on whether an equi-join key exists → same
   source.
3. `BroadcastHashJoinExec`'s own large ("streamed") side is never shuffled once the small side is
   broadcast → `BroadcastHashJoinExec.scala` (Apache Spark source, GitHub).
4. `BroadcastExchangeExec` collects, transforms and broadcasts the small side's result — the
   mechanism behind the driver-memory risk from stale statistics → `BroadcastExchangeExec.scala`
   (Apache Spark source, GitHub).
5. A small table under the threshold broadcasts with zero shuffle; the identical table over the
   threshold falls back completely to a shuffle join; the identical table under a non-equi
   condition still broadcasts but as a nested-loop join, not a hash join → measured directly,
   `examples.py`.

## Progress
Research, OUTLINE, fact-check, coverage map and every file built; checks run and green (build,
narration-teaches, reel test). Status: built, ready to ship as `status: 'held'`, narration queued
via `renarration.json` (no GPU in this cloud session). Next topic: 12/30,
de.shuffle-joins-sort-merge-hash.
