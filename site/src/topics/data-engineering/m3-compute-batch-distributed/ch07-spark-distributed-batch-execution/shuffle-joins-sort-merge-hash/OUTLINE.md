# OUTLINE: de.shuffle-joins-sort-merge-hash

Full topic, chapter 7's twelfth. Syllabus line in full (§7.2): "sort-merge join as the default
for large-large equi-joins (sort both sides, stream merge, spill-friendly) vs shuffled hash join
(build a per-partition hash table, no sort, OOM-prone if the build side is skewed); how the
planner chooses and when to override with hints."

## Learning outcomes
1. Predict and confirm the planner's own default strategy for two large, unhinted equi-joined
   tables.
2. Predict and confirm that a hint can switch the strategy, and that the switch removes the sort
   step entirely, not just renames the join node.
3. Explain, from the planner's own source comment, why sort-merge degrades gracefully under
   memory pressure while shuffled hash does not.

## Reel steps (final, matches reel.tsx) — 7 steps, 2 predicts (full topic requires ≥2), first at
step 3 (index 2, within the first four)
1. Hook — two large tables, equi-joined, no hint at all: which of two strategies does Spark pick
   on its own?
2. Reveal: measured — sort-merge join, a real Sort step on each side before the merge.
3. Predict 1 — a hint tells Spark to use the other strategy on one side: does it still sort both
   sides first?
4. Reveal: measured — a shuffled hash join, with zero Sort steps anywhere in the plan.
5. Predict 2 — the build side of that hash join is made artificially huge: does the hash-based
   strategy handle it as gracefully as the sort-based one did?
6. Reveal: sourced — the planner's own comment names the real risk directly: building the hash
   map can run out of memory when the build side is big; a sort-merge join has no such single
   point of failure.
7. Recap.

## Engagement arc
- Hook: genuine ambiguity about which of two valid strategies the planner picks by default.
- Predict 1 (step 3, index 2 ≤ 3): tempting wrong answer ("a hash join still needs the sides
  sorted to line the join keys up").
- Predict 2 (step 5): tempting wrong answer ("both strategies shuffle the same data, so they fail
  the same way under pressure").
- Surprising numbers/facts: a hash-based join needs no sort step at all, on either side; the
  planner's own source names the hash join's danger in so many words, as a real limitation, not a
  hypothetical one.
- Takeaways (3 explicit `takeaway` fields): step 2 (sort-merge is the planner's own default for
  two large tables), step 4 (a hash-based strategy drops the sort entirely, it doesn't skip it on
  one side only), step 6 (the two strategies fail differently under memory pressure, not just at
  different thresholds).
- Recap restates both mechanisms together.

## Narrator's line of thought (beyond description)
- Step 2: states the measured default and names why (equi-join keys are sortable, and
  `preferSortMergeJoin` stays true by default).
- Step 3: frames the predict around whether a hash-based join still needs a sort to find matches.
- Step 4: states the measured absence of any sort step plainly, naming the contrast directly.
- Step 5: frames the predict around whether the two strategies share the same failure mode under
  memory pressure.
- Step 6: states the planner's own named risk plainly, naming why sort-merge doesn't share it.
- Step 7: names both mechanisms and their contrast together, then hands off to the next topic.

## Post-notes layers
- Outcomes: predicting and confirming the planner's own default strategy, and how a hint changes
  it.
- Internals: the planner's own documented hint-priority order (broadcast over sort-merge over
  shuffle-hash over replicate-NL) and the `preferSortMergeJoin` config this topic's own
  `examples.py` leaves at its default — sourced-only.
- Production: assuming a shuffled hash join degrades the same way a sort-merge join does under
  memory pressure, when the source names a real OOM risk specific to the hash-based strategy.
- Frontier: AQE's own runtime demotion of a sort-merge join to a broadcast or shuffled hash join
  once real statistics are known, built as this chapter's own next-but-one topic.
- Where this goes next: AQE, which is allowed to rewrite either of these two strategies at
  runtime once real shuffle statistics exist.

## Examples to execute (examples.py) and assertions
- `local[4]` session, AQE disabled, autobroadcast threshold forced off, `spark.sql.shuffle.partitions`
  at 4: two large tables (200,000 rows each) joined with no hint produce a plan containing
  `SortMergeJoin`, no `ShuffledHashJoin`, and exactly 2 `Sort [` nodes (one per side).
- The identical join with a `SHUFFLE_HASH` hint on one side produces a plan containing
  `ShuffledHashJoin`, no `SortMergeJoin`, and zero `Sort [` nodes anywhere.
All assertions pass against real PySpark 4.0.1, Java 21, local mode (verified; terminal output in
session log).

## Bridge and handoff
- Bridge: "Broadcasting handled the case where one side fits everywhere. This topic is the case
  where neither side does: both inputs have to be shuffled, and Spark has two different ways to
  then match them up."
- Handoff: "These two strategies are what AQE, next, is allowed to rewrite at runtime once real
  shuffle statistics exist — the planner's static choice meeting the evidence a static plan can't
  have."

## Concept ledger
- Introduces: `spark-sort-merge-join`, `spark-shuffled-hash-join`.
- Uses: `spark-broadcast-hash-join`, `spark-shuffle-mechanics`.
- Declared: none.

## Claims list (claim → source)
1. Shuffled hash join builds a per-partition hash table, a memory-intensive operation that can
   OOM when the build side is big → `SparkStrategies.scala` (Apache Spark source, GitHub).
2. The planner only picks shuffled hash when one side is small enough and
   `spark.sql.join.preferSortMergeJoin` is false → same source.
3. `SortMergeJoinExec` performs a sort merge join of two child relations → `SortMergeJoinExec.scala`
   (Apache Spark source, GitHub).
4. `ShuffledHashJoinExec` performs a hash join by first shuffling the data on the join keys → `ShuffledHashJoinExec.scala` (Apache Spark source, GitHub).
5. The unhinted default for two large equi-joined tables is a sort-merge join with a real sort on
   each side; a `SHUFFLE_HASH` hint switches to a shuffled hash join with zero sort steps anywhere
   → measured directly, `examples.py`.

## Progress
Research, OUTLINE, fact-check, coverage map and every file built; checks run and green (build,
narration-teaches, reel test). Status: built, ready to ship as `status: 'held'`, narration queued
via `renarration.json` (no GPU in this cloud session). Next topic: 13/30,
de.adaptive-query-execution-aqe.
