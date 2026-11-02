# OUTLINE: de.catalyst-unresolved-physical-plan

Full topic, chapter 7's fifth. Syllabus line in full (§7.1, builds on §2.3): "parse → analysis
(resolution against the catalog) → rule-based logical optimisation (predicate/projection pushdown,
constant folding, subquery rewrites) → physical planning with join/aggregate strategy selection →
cost-based reordering only when statistics exist; reading `EXPLAIN FORMATTED` and `Exchange` nodes
(builds on §2.3)."

## Learning outcomes
1. Name the four Catalyst stages (parse, analysis, optimisation, physical) from a plan's own textual signals.
2. State what "unresolved" literally means in a parsed plan (the tick marker) and how analysis removes it.
3. Predict and confirm predicate pushdown's effect on operator order, and constant folding's effect on literal expressions.
4. Predict and confirm join strategy selection (broadcast vs. shuffle) as a cost-based choice, not a fixed rule.
5. Say what cost-based reordering additionally requires (ANALYZE TABLE statistics) that strategy selection alone doesn't.

## Reel steps (final, matches reel.tsx) — 10 steps, 3 predicts (full topic requires ≥2), first at step 3 (index 2, within the first four)
1. Hook — one query, four plans underneath: what changes?
2. Reveal: parse (unresolved, tick-marked) → analysis (resolved, ids) — measured.
3. Predict 1 — filter written after select: kept in that order, or moved?
4. Reveal: predicate pushdown confirmed (measured).
5. Reveal: constant folding, same optimization pass (measured).
6. Predict 2 — huge table joins a tiny one: shuffles like every wide op so far, or not?
7. Reveal: BroadcastHashJoin chosen, zero shuffle on the huge side (measured).
8. Predict 3 — same join, broadcasting disabled: strategy changes, or Spark finds another way?
9. Reveal: SortMergeJoin, real Exchange on both sides now (measured).
10. Recap — full four-stage pipeline, EXPLAIN FORMATTED, cost-based reordering named as sourced-only.

## Engagement arc
- Hook: genuine ambiguity about what actually changes across four versions of the same query.
- Predict 1 (step 3, index 2 ≤ 3): tempting wrong answer ("the optimizer keeps the written order").
- Predict 2 (step 6): tempting wrong answer ("every wide op shuffles, so this one does too") — a
  deliberate pattern-match trap against topics 2 and 3's own established rule.
- Predict 3 (step 8): tempting wrong answer ("the data hasn't changed, so there's another trick").
- Surprising numbers/facts: the tick-marker's literal disappearance; the written order not
  surviving optimisation; zero shuffle on a huge table; the SAME join shape producing two entirely
  different physical plans depending on one config flag.
- Takeaways (3 explicit `takeaway` fields): step 4 (pushdown moves filters regardless of written
  order), step 7 (broadcasting beats shuffling below a threshold), step 9 (the same shape plans
  two ways, cost-based).
- Recap restates the four-stage pipeline and names the EXPLAIN FORMATTED / ANALYZE TABLE skills.

## Narrator's line of thought (beyond description)
- Step 2: states the measured textual fact (tick marker) before naming what analysis does to it.
- Step 3: frames the predict around what the optimizer "actually cares about," not convention.
- Step 4: states both plan orders side by side as direct confirmation.
- Step 5: introduces the second rule as "the same pass, a different trick."
- Step 6: explicitly tells the listener to resist pattern-matching on the chapter's prior examples.
- Step 7: states the two concrete facts (strategy, zero shuffle) plainly.
- Step 8: frames the predict as "the cleanest test of whether this choice is actually a choice."
- Step 9: states the forced fallback and where the new Exchange nodes appear.
- Step 10: names the full pipeline, then the one further lever (ANALYZE TABLE) past it.

## Post-notes layers
- Outcomes: four-stage pipeline; Exchange-node attribution to a specific operator.
- Internals: reading EXPLAIN FORMATTED's two sections; cost-based reordering's ANALYZE TABLE
  requirement, distinct from strategy selection's default size-estimate behaviour.
- Production: reading query cost from written clause order (wrong); assuming every join shuffles
  (wrong, per this topic's own broadcast measurement).
- Frontier: AQE's own runtime strategy conversion (SortMergeJoin → broadcast) named as this
  chapter's own later topic, the mirror case to this topic's forced-SortMergeJoin demonstration.
- Where this goes next: Tungsten, whole-stage codegen (next topic).

## Examples to execute (examples.py) and assertions
- `local[4]` session, AQE disabled: a `select("a","b").filter(col("a")>10)` query's parsed plan
  contains `'Filter` (unresolved tick); analyzed plan does not, and contains a resolved `#` id.
- Analyzed plan: `Filter` index < `Project` index (filter on top, as written). Optimized plan:
  `Project` index < `Filter` index (filter pushed below).
- `lit(1)+lit(2)` expression: analyzed plan contains `(1 + 2)`; optimized plan does not, and
  contains `3 AS` instead.
- A 100,000-row table joined against a 10-row one (default `autoBroadcastJoinThreshold`): physical
  plan contains `BroadcastHashJoin`, not `SortMergeJoin`.
- The same join shape with `autoBroadcastJoinThreshold` set to `-1`: physical plan contains
  `SortMergeJoin`, not `BroadcastHashJoin`, with exactly 2 occurrences of `Exchange hashpartitioning`.
All assertions pass against real PySpark 4.0.1, Java 21, local mode (verified; terminal output in
session log).

## Bridge and handoff
- Bridge: "Every topic so far watched the plan Catalyst already produced run. This topic opens
  Catalyst itself, the planner Chapter 2's query-optimiser topic already introduced in the
  single-node case, now choosing join and aggregate strategies across a cluster."
- Handoff: "Catalyst decides the physical plan's shape. Tungsten, next, decides how fast the
  chosen shape actually runs — a different layer, planning versus execution."

## Concept ledger
- Introduces: `spark-catalyst-pipeline`, `spark-explain-formatted`.
- Uses: `sql-query-optimizer-plans` (§2.3), `spark-stage-boundary` (topic 2).
- Declared: none.

## Claims list (claim → source)
1. EXPLAIN EXTENDED names the four-stage pipeline (parsed, analyzed, optimized, physical) →
   Spark SQL Reference, EXPLAIN.
2. The parsed plan is unresolved; analysis resolves attributes/relations against the catalog →
   same source.
3. EXPLAIN FORMATTED generates a physical plan outline plus per-node detail → same source.
4. `spark.sql.autoBroadcastJoinThreshold` configures the broadcast size limit (default 10MB);
   setting it to -1 disables broadcasting → Spark SQL Performance Tuning docs.
5. ANALYZE TABLE collects statistics the optimizer uses for a better plan, stored in the catalog →
   Spark SQL Reference, ANALYZE TABLE.
6. The tick marker's disappearance, predicate pushdown's reordering, constant folding's literal
   collapse, and join strategy's dependence on the broadcast threshold → measured directly,
   `examples.py`.

## Progress
Research, OUTLINE, fact-check, coverage map and every file built; checks run and green (build,
narration-teaches, reel test). Status: built, ready to ship as `status: 'held'`, narration queued
via `renarration.json` (no GPU in this cloud session). Next topic: 6/30,
de.tungsten-whole-stage-codegen.
