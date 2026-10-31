# Fact-check: de.shuffle-joins-sort-merge-hash

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Shuffled hash join builds a per-partition hash table, a memory-intensive operation that can OOM when the build side is big | Confirmed | `sources/spark-strategies.txt`, quoted verbatim in `SOURCES.md`; `scripts/sources.mjs check` passes. |
| 2 | The planner only picks shuffled hash when one side is small enough and `spark.sql.join.preferSortMergeJoin` is false | Confirmed | Same source, quoted exactly. |
| 3 | `SortMergeJoinExec` performs a sort merge join of two child relations | Confirmed | `sources/sort-merge-join-exec.txt`, quoted verbatim. |
| 4 | `ShuffledHashJoinExec` performs a hash join by first shuffling the data on the join keys | Confirmed | `sources/shuffled-hash-join-exec.txt`, quoted verbatim. |
| 5 | Two large tables, equi-joined with no hint, plan as a `SortMergeJoin`, never a `ShuffledHashJoin`, with exactly 2 `Sort [` nodes | Confirmed | Measured directly: `examples.py`, string/count checks on `default_plan`. |
| 6 | The identical join with a `SHUFFLE_HASH` hint on one side plans as a `ShuffledHashJoin`, never a `SortMergeJoin`, with zero `Sort [` nodes anywhere | Confirmed | Measured directly: `examples.py`, string checks on `hinted_plan`. |

## Red team

- **Could AQE, not the planner's own static choice, be the real reason the default case picks
  sort-merge?** No — `spark.sql.adaptive.enabled` is explicitly `false` for the whole session;
  the static planner alone decides both plans here.
- **Could broadcasting, not the sort-merge-vs-shuffled-hash choice, be the real reason either
  plan looks the way it does?** No — `spark.sql.autoBroadcastJoinThreshold` is forced to `-1` for
  the whole session specifically to keep both tables large enough that neither could broadcast,
  isolating the shuffle-join strategy choice as the only variable.
- **Is "zero `Sort [` nodes anywhere" strong enough to prove the hash-based strategy never sorts,
  or could a differently-named sort node exist that the substring check misses?** The assertion
  checks for the literal `Sort [` text Spark's own plan-printer emits for every sort operator in
  this engine version; combined with the positive confirmation of exactly 2 such nodes in the
  sort-merge case using the identical substring, the check is internally consistent against the
  same plan-text format in both cases.
- **Is applying the `SHUFFLE_HASH` hint to only one side (rather than both) a fair way to
  "switch the strategy," given the planner's own source names a tie-break rule for when both
  sides are hinted?** Yes — hinting one side is sufficient on its own to pick the strategy per the
  planner's own documented rule ("pick shuffle hash join if the join type is supported"); the
  both-sides tie-break is a separate, additional rule this topic's own `coverage.json` names but
  does not need to construct to demonstrate the basic mechanism.

No corrections were needed to `OUTLINE.md` beyond settling on the planner's own source comment,
rather than a constructed OOM reproduction, as the safe and honest way to cover the syllabus's own
"OOM-prone if the build side is skewed" clause.
