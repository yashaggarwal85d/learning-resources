# Outline: de.adaptive-query-execution-aqe

## Syllabus line (verbatim, `syllabus/data-engineering.md:425`)

> **Adaptive Query Execution (AQE)** — re-optimising at query-stage boundaries using real shuffle statistics: coalescing small post-shuffle partitions, demoting sort-merge to broadcast or shuffled hash join, splitting skewed partitions; default-on since 3.2; why AQE cannot fix what happens before the first exchange.

## Learning outcomes

- Read a plan's `AdaptiveSparkPlan (isFinalPlan=true)` section and point to a concrete decision
  AQE made differently from the Initial Plan.
- Explain, with an example, a cost AQE cannot fix (anything before the first shuffle boundary).

## Reel steps (9, kind: full)

1. Hook — a join against a 30-row grouped result; which strategy does Spark commit to first?
2. Reveal: Initial Plan is a sort-merge join, sorting both sides. (No takeaway — this is the reel
   test's own "from" step, and a takeaway there squeezes the phone caption layout and fails the
   swipe check per [[learning-resources-scenes-reel-gotchas]]; shortening/rewording the text does
   not fix it, only removing the takeaway does.)
3. Predict (index 2, within first 4) — does the join get revisited once the grouping's real size
   is known?
4. Reveal: Final Plan is a broadcast hash join, zero sorts. (No takeaway — immediately after a
   predict step, the other disallowed position.)
5. Elaborate: why that conversion only became possible once the real size existed. **Takeaway 1.**
   (Safe position: not the "from" step, not immediately after a predict.)
6. Predict (index 5) — does AQE touch a configured-but-oversized shuffle-partition count?
7. Reveal: Final Plan coalesces the shuffle read; Initial Plan never does. (No takeaway —
   immediately after a predict.)
8. Elaborate: why the configured count was never the real answer. **Takeaway 2.**
9. Recap. **Takeaway 3.**

Engagement arc: two predicts (≥2 required for a full topic), the first at index 2 (≤4 required);
three takeaways total, each placed on a step that is neither the reel test's "from" step (the
first non-predict step at dot index ≥1) nor the step immediately following a predict step — both
positions reliably fail the phone caption-swipe check regardless of text length or wording. The
original 7-step shape (predict → reveal → predict → reveal → recap) left only the recap step
safe, one short of the required three; adding one "elaborate" beat after each predict's reveal
gives two more safe, narratively-earned positions without changing any measured claim.

## Narrator's line of thought per step

1. Pose the ambiguity: a plan hasn't run yet, so what does the planner even know.
2. The planner's own default, and the specific number it doesn't have (the grouped side's real
   size) before anything executes.
3. The shuffle boundary as the one moment a real number exists — invite the guess before revealing.
4. The concrete change: broadcast instead of sort-merge, with the mechanical reason (the number
   now exists and clears the threshold).
5. A second, independently useful case of the same reoptimization: partition count, not strategy.
6. The concrete change, Initial vs Final, side by side.
7. Both measurements share one mechanism and one hard edge: nothing before the first shuffle.

## Post-notes layers

- `outcomes`: how to read the `AdaptiveSparkPlan` plan-text split itself.
- `why a reoptimization needs a shuffle boundary, the sourced-only half`: the pipelining argument
  for why a shuffle/broadcast exchange is the only place a reoptimization can happen.
- `production failures`: the threshold still applies at runtime, and anything before the first
  shuffle stays exactly as costly as the static plan made it.
- `frontier`: skew-join splitting and AQE's own blind spots, handed off to the next topic.

## `examples.py` claims (all measured against real PySpark 4.0.1, local[4])

1. A 5,000,000-row table joined to a `GROUP BY` of a 2,000,000-row table (30 groups): Initial
   Plan is `SortMergeJoin` with 2 `Sort [` nodes; Final Plan is `BroadcastHashJoin` with a
   `BroadcastExchange` and no `SortMergeJoin`/`Sort [` anywhere.
2. Two 1,000,000-row tables, one filtered to 20 rows, 200 configured shuffle partitions: Initial
   Plan has no `AQEShuffleRead` at all; Final Plan has `AQEShuffleRead coalesced`.
3. Both queries' leaf `Range`/`Filter`/`Project` steps are byte-identical between their own
   Initial and Final plans — the measured basis for "nothing before the first exchange changes."

## Bridge / handoff (copied exactly from CHAPTER.md)

- Bridge: "The previous two topics were the planner's static choices. This topic is Spark
  revisiting those choices mid-job, once the first shuffle's real statistics exist to revisit them
  with."
- Handoff: "AQE fixes some skew after the fact. The next topic is skew itself — how to recognise
  it as the cause in the first place, and the remedies in the order they're worth trying, AQE
  being only the first."

## Concept ledger

- Introduces: `spark-aqe`.
- Uses: `spark-sort-merge-join`, `spark-shuffled-hash-join`, `spark-shuffle-partitions-config`.
- Declared: none.

## Claims list

| Claim | Source |
|---|---|
| AQE reoptimizes mid-execution using runtime statistics | Spark SQL Performance Tuning docs |
| Coalescing merges small post-shuffle partitions | Spark SQL Performance Tuning docs |
| AQE converts sort-merge to broadcast hash join once a side's real size clears the threshold | Spark SQL Performance Tuning docs; Databricks engineering blog |
| Reoptimization only happens at a query-stage (shuffle/broadcast) boundary | Databricks engineering blog; `AdaptiveSparkPlanExec.scala` |
| A selective filter or a multi-operator relation is exactly why the static estimate can be wrong | Databricks engineering blog |
| Stage-by-stage bottom-up traversal and re-plan-on-materialization | `AdaptiveSparkPlanExec.scala` |

## Progress

Next topic: 14. `de.data-skew-diagnosis-remedies`.
