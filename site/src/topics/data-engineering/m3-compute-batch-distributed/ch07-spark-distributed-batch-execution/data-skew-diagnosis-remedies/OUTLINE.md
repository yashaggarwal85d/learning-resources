# Outline: de.data-skew-diagnosis-remedies

## Syllabus line (verbatim, `syllabus/data-engineering.md:426`)

> **Data skew: diagnosis and remedies** — evidence (max vs median task duration and shuffle-read bytes, one straggler per stage); remedies in order: AQE skew-join splitting, broadcasting, isolating hot keys, salting with replicated small side, two-phase (partial then final) aggregation; where AQE's skew handling does not apply (aggregations, preserved side of outer joins, window functions).

## Learning outcomes

- Diagnose skew from a task-duration/shuffle-bytes histogram alone (max vs median, one straggler
  per stage) without looking at the data.
- Choose and apply the right remedy for a skewed join (AQE split, broadcast, isolate, salt) versus
  a skewed aggregation (two-phase), and explain why AQE's own skew-join rule cannot help the
  aggregation case.

## Reel steps (13, kind: full)

1. Hook — one key holds 2x the rows of the other 999 combined; what does that do to one task.
2. Reveal: the baseline evidence — max/median task duration 3.28x, max/median shuffle-read bytes
   11.8x, one straggler task in the join's reduce stage. (No takeaway — reel test's own "from"
   step, per [[learning-resources-takeaway-position-gotcha]].)
3. Predict (index 2, within first 4) — does turning AQE's skew-join handling on, with its
   defaults, fix this?
4. Reveal: no — the default skew threshold (256MB) is larger than the skewed partition itself
   (~155MB) at this data scale; bytes ratio unchanged. (No takeaway — immediately after a predict.)
5. Elaborate: lowering the skew threshold and the advisory partition size to the data's own scale
   triggers the split; bytes ratio drops to 1.0002x. **Takeaway 1.**
6. Predict (index 5) — does broadcasting the small side fix it too, without touching any AQE
   config?
7. Reveal: yes — broadcasting the dimension table removes the shuffle on the fact table
   outright; no shuffle, no skew. (No takeaway — immediately after a predict.)
8. Elaborate: when the small side itself is too big to broadcast whole, isolate just the rows
   matching the hot keys and broadcast only those, shuffle-joining the rest normally (sourced
   remedy; not independently re-measured past the broadcast case already shown). **Takeaway 2.**
9. Reveal: salting works too, but at a real cost — bytes ratio 2.53x (worse than AQE's 1.0002x)
   and duration ratio 1.56x, because replicating the small side across every salt bucket adds
   shuffle bytes nowhere else in the ladder.
10. Reveal: a `GROUP BY` with a combinable aggregate (`sum`) isn't skewed at the shuffle at all —
    per-task shuffle-write bytes for the hot key's partition (59 bytes) versus a diverse-key
    partition (~12.6 KB), because map-side partial aggregation already collapsed the hot key to
    one row per task before any shuffle ran.
11. Reveal: a non-combinable aggregate (`collect_list`) has nowhere to hide the same way — one
    reduce task gets the whole hot key's list, 12.0x the median task duration, and AQE's
    skew-join rule cannot touch it (sourced: `OptimizeSkewedJoin.scala` only pattern-matches
    `SortMergeJoinExec`/`ShuffledHashJoinExec`, never an aggregate node).
12. Elaborate: the two-phase remedy — salt the group key, aggregate partially per salted key,
    then re-aggregate by the real key alone — drops that reduce stage's duration ratio from
    12.0x to 2.14x by spreading the hot key's own work across tasks instead of one.
13. Recap — evidence first, then the ladder in order, then the one thing no step on the ladder
    touches: anything that was never a join. **Takeaway 3.**

Engagement arc: two predicts (≥2 required), the first at index 2 (≤4 required); three takeaways,
each on a step that is neither the reel test's "from" step (first non-predict step at dot index
≥1, here step 2) nor immediately after a predict (here steps 4 and 7) — see
[[learning-resources-takeaway-position-gotcha]]. Steps 9-12 carry the heaviest new content
(salting's cost, why aggregations differ, the two-phase fix) without needing a takeaway field on
every one of them; three is the required minimum and the recap's own restatement covers the rest.

## Narrator's line of thought per step

1. One key, twice the rows of everything else combined — what happens to the one task unlucky
   enough to get it.
2. Name the two numbers that prove it without ever looking at the raw data: a duration ratio and
   a bytes ratio, both pointing at the same single task.
3. Invite a guess: AQE already fixes some reoptimization automatically — is this one of those.
4. The number AQE compares against: its own default notion of "big," which this partition simply
   doesn't clear.
5. The same rule, retuned to the data's own scale, now does clear it — the partition splits and
   the ratio collapses to basically 1.
6. A second guess, independent of AQE entirely: a much blunter tool.
7. Broadcasting removes the shuffle, not just rebalances it — there's nothing left to be skewed.
8. The broadcast trick only works if the whole small side fits; the fallback keeps the idea
   (skip the shuffle for the hot rows) without needing the whole table to fit.
9. Salting is the oldest trick in the book, and it is not free — spell out exactly what it costs
   and why that number is worse than AQE's own fix, not just different.
10. A turn: not every skew story is a join. Show the one case that already quietly isn't a
    problem, and why — the aggregation combined the hot key down before the shuffle ever ran.
11. The case that is a problem anyway — a list grows however long its key had rows, and nothing
    about combining helps that. Name exactly why AQE's own join-only rule can't reach this.
12. The fix borrows the earlier trick for a different reason: not to avoid a big partition, but
    to avoid one task holding the whole key's data at all.
13. Pull the thread: diagnose first, then reach for the ladder in order, and remember the one
    category the whole ladder was built around — joins — doesn't cover everything.

## Post-notes layers

- `outcomes`: reading a Spark UI stage's task-duration/shuffle-bytes distribution as the
  diagnosis itself, without re-deriving it from the data.
- `the remedy ladder, the sourced-only half`: isolating hot keys in full (worked example), plus
  the preserved side of an outer join and window functions as further cases AQE's skew-join rule
  cannot reach, sourced from `OptimizeSkewedJoin.scala`'s own pattern match.
- `production failures`: salting's real byte cost at scale; picking the wrong remedy for an
  aggregation (reaching for AQE config when the rule never touches aggregate nodes at all).
- `frontier`: dynamic partition pruning next — a lever that removes work before any shuffle,
  instead of rearranging a shuffle that already has to happen.

## `examples.py` claims (all measured against real PySpark 4.0.1, local[4], unless marked sourced)

1. Baseline join skew: one hot key (20,000,000 rows) among 999 other keys (10,000,000 rows total),
   joined to a 1,000-row dimension table, `adaptive.enabled=false`, `shuffle.partitions=8`:
   max/median task duration 3.28x, max/median shuffle-read bytes 11.8x, in the join's reduce
   stage.
2. AQE skew-join with default thresholds: no change (confirmed unchanged bytes ratio) because the
   default `skewedPartitionThresholdInBytes` (256MB) exceeds the skewed partition's real size.
3. AQE skew-join with `skewedPartitionThresholdInBytes`/`advisoryPartitionSizeInBytes` lowered to
   the data's own scale (`16m`): max/median bytes ratio drops to 1.0002x.
4. Broadcasting the dimension table: no `Exchange (shuffle)` on the fact side at all in the plan;
   wall time drops from the unfixed baseline.
5. Salting (8 buckets, dimension replicated 8x): max/median bytes ratio 2.53x, max/median duration
   ratio 1.56x — real improvement over the baseline, but worse than AQE's split on both axes, and
   total shuffled bytes increase due to the replicated dimension (disclosed, not hidden).
6. A combinable `groupBy("k").agg(sum("v"))` over the same skewed key: per-task shuffle-write
   bytes for the hot key's own partition (59 bytes) versus a diverse-key partition (~12.6 KB) —
   map-side partial aggregation already collapsed the hot key before any shuffle ran.
7. A non-combinable `groupBy("k").agg(collect_list("v"))` over the same skewed key: one reduce
   task's duration is 12.0x the median.
8. The same `collect_list` aggregation, two-phase (salt the key, partially aggregate, then
   re-aggregate by the real key): the comparable reduce stage's duration ratio drops to 2.14x.
9. Sourced only: `OptimizeSkewedJoin.scala`'s `optimizeSkewJoin` pattern-matches exactly
   `SortMergeJoinExec` and `ShuffledHashJoinExec` and nothing else — the source-level reason
   claims 6-8's aggregation cases, the preserved side of an outer join, and window functions are
   all outside what AQE's skew-join rule can ever rewrite.

## Bridge / handoff (copied exactly from CHAPTER.md)

- Bridge: "AQE fixes skew for the one case (joins) it was built for. This topic generalises: how
  you actually know it's skew rather than something else, and the full remedy ladder, including
  the cases — aggregations, outer joins, windows — AQE cannot touch at all."
- Handoff: "Skew is a shuffle problem solved by rearranging work across the network. Dynamic
  partition pruning, next, is the opposite kind of lever: removing work before the shuffle by
  never reading it."

## Concept ledger

- Introduces: `spark-skew-diagnosis`, `spark-salting-remedy`.
- Uses: `spark-aqe`, `spark-broadcast-hash-join`.
- Declared: none.

## Claims list

| Claim | Source |
|---|---|
| Skew is detected from shuffle file statistics and fixed by splitting skewed partitions | Databricks engineering blog |
| Skew-join handling is one of the adaptive-execution-specific physical rules, run only once a shuffle stage has materialized | Databricks engineering blog |
| A skewed partition's threshold is median size times a factor, or an absolute floor, whichever is larger | `OptimizeSkewedJoin.scala` |
| The skew-join rule's purpose is avoiding straggler tasks with a disproportionate data share | `OptimizeSkewedJoin.scala` |
| The skew-join rule only ever rewrites `SortMergeJoinExec`/`ShuffledHashJoinExec` | `OptimizeSkewedJoin.scala` |
| The docs restate the skew-join feature as scoped to sort-merge join | Spark SQL Performance Tuning docs |

## Progress

Next topic: 15. `de.dynamic-partition-pruning`.
