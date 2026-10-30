# OUTLINE: de.dag-scheduling-stage-boundaries

Full topic, chapter 7's second. Syllabus line in full (§7.1): "narrow vs wide dependencies; the
DAGScheduler cuts the lineage graph at every shuffle dependency, pipelines narrow operators inside
a stage, and orders shuffle-map stages before the result stage; why a stage boundary is a
materialisation point, not a lineage break."

## Learning outcomes
1. Classify any transformation as narrow or wide from its signature alone.
2. Predict a job's stage count from its code: one plus one per wide dependency, regardless of narrow-operator count.
3. State precisely why the cut happens at a wide dependency (it cannot answer until every input partition arrives).
4. Explain why a stage boundary is a materialisation point, not merely a lineage split.

## Reel steps (final, matches reel.tsx) — 8 steps, 2 predicts (full topic requires ≥2)
1. Hook — three chained narrow ops, stage count unknown.
2. Reveal: narrow chain, one stage, no Exchange (measured).
3. Predict 1 (index 2, within first 4) — same data, now grouped: more stages?
4. Reveal: wide dependency, two stages, Exchange present (measured).
5. Reveal: why the cut happens there (mechanism explanation).
6. Predict 2 — group the grouped result again: still two stages, or three?
7. Reveal: second shuffle, third stage (measured).
8. Recap.

## Engagement arc
- Hook: genuine ambiguity (three ops, unknown stage count).
- Predict 1 (step 3, index 2 ≤ 3): tempting wrong answer ("still one stage, it's just another op").
- Predict 2 (step 6): tempting wrong answer ("same op type, so no new cost").
- Surprising numbers: 1→2→3 stages tracking shuffle count exactly, not operator count.
- Takeaways (3 explicit `takeaway` fields): step 4 ("a stage boundary tracks shuffles, never operation count"), step 5 ("a stage boundary is a materialisation point, not a theoretical split"), step 7 ("stage count is one plus the number of shuffles the plan actually contains").
- Recap restates the full rule.

## Narrator's line of thought (beyond description)
- Step 2: stresses "measured directly," names that no Exchange appears anywhere.
- Step 3: names the hard intuition (grouping "feels like just another operation").
- Step 4: states the mechanism reason (any row could belong to any bucket) before revealing the number.
- Step 5: generalizes the mechanism explicitly (filter needs one partition; group needs all).
- Step 6: names the trap in the second predict (same operation type ≠ free the second time).
- Step 7: draws the general rule (one shuffle, one stage, independently).
- Step 8: states the rule as a formula.

## Post-notes layers
- Outcomes: narrow/wide classification, stage-count prediction rule, materialisation-point framing.
- Internals: the DAGScheduler's real backward-lineage-walk algorithm; forward-pointer to Exchange elimination (§7.2).
- Production: long-narrow-chain-is-expensive myth; chained-shuffles-are-not-amortised myth.
- Frontier: Exchange elimination named, not built here (§7.2's own topic).
- Where this goes next: sort-based shuffle mechanics (next topic).

## Examples to execute (examples.py) and assertions
- `filter → select → filter` on a 4-partition range, `.collect()`: 1 stage, no "Exchange" in `queryExecution().toString()`.
- `groupBy(derived key).agg(count)`, `.collect()`: 2 stages, "Exchange" present.
- A second `groupBy` chained on the first's result, `.collect()`: 3 stages.
All assertions pass against real PySpark 4.0.1, Java 21, local mode (verified; terminal output in session log). Action deliberately uses `collect()`, not `count()`, since `count()` always adds its own merge stage even over a purely narrow chain — documented in the script's own comment and in FACT-CHECK.md.

## Bridge and handoff
- Bridge: "Topic 1 gave the hierarchy's names. This topic answers the question it left open: exactly which operators force the scheduler to cut a new stage, and why that cut is where real work — a shuffle — has to happen."
- Handoff: "A stage boundary is a promise that a shuffle happens there. The next topic opens that promise: what a shuffle actually writes to disk and sends over the network to make the next stage's input exist."

## Concept ledger
- Introduces: `spark-narrow-wide-dependency`, `spark-stage-boundary`.
- Uses: `spark-task-hierarchy` (topic 1).
- Declared: none.

## Claims list (claim → source)
1. Narrow dependency definition (each parent partition used by at most one child partition) → RDD paper, §4.
2. Wide dependency definition (a child partition may depend on multiple parent partitions) → RDD paper, §4.
3. The scheduler's cut rule: stage boundaries at wide/shuffle dependencies, narrow pipelined → RDD paper, §5.1 description of the DAGScheduler.
4. Current Spark's own "shuffle" terminology matches the paper's "wide dependency" → RDD Programming Guide, Shuffle operations.
5. Narrow chain costs one stage regardless of operator count; one wide dependency costs exactly one more stage, additive per shuffle → measured directly, `examples.py`.

## Progress
Research, OUTLINE, fact-check, coverage map and every file built; checks run and green (build,
narration-teaches, reel test). Status: built, ready to ship as `status: 'held'`, narration queued
via `renarration.json` (no GPU in this cloud session). Next topic: 3/30,
de.sort-based-shuffle-mechanics.
