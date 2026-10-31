# OUTLINE: de.task-scheduling-locality-parallelism

Full topic, chapter 7's fourth. Syllabus line in full (§7.1): "locality levels (PROCESS/NODE/
RACK/ANY) and delay scheduling; `spark.default.parallelism` vs `spark.sql.shuffle.partitions`;
dynamic allocation and the shuffle-tracking requirement; FIFO vs FAIR pools for concurrent jobs in
one application."

## Learning outcomes
1. Explain delay scheduling's mechanism: trading immediate placement for a better locality level.
2. State why local mode can't demonstrate a real locality wait (one JVM, one executor).
3. Distinguish `spark.default.parallelism` (core-count-driven) from `spark.sql.shuffle.partitions` (its own SQL-layer default, 200).
4. Predict which setting a given stage obeys, and confirm the two never interact in either direction.
5. Name dynamic allocation's shuffle-tracking requirement and FIFO vs FAIR pools as real, sourced mechanisms this topic's local run cannot measure.

## Reel steps (final, matches reel.tsx) — 9 steps, 3 predicts (full topic requires ≥2), first at step 3 (index 2, within the first four)
1. Hook — a task and its data: run in place, or wait for better?
2. Reveal: locality is trivial in local mode (measured: every task PROCESS_LOCAL; delay scheduling named/quoted).
3. Predict 1 — a bare RDD, no hints: how many partitions?
4. Reveal: default parallelism = core count (measured).
5. Predict 2 — same data, now a groupBy shuffle: same 4 partitions, or different?
6. Reveal: shuffle output = 200, independent of cores (measured).
7. Predict 3 — set shuffle.partitions=8 by hand: does a fresh bare RDD move too?
8. Reveal: independent, confirmed both ways (measured).
9. Recap — full syllabus list, including the sourced-only dynamic allocation and FIFO/FAIR pieces.

## Engagement arc
- Hook: genuine ambiguity about scheduler behaviour on a real cluster.
- Predict 1 (step 3, index 2 ≤ 3): tempting wrong answer ("a fixed small number").
- Predict 2 (step 5): tempting wrong answer ("the shuffle just keeps the same 4").
- Predict 3 (step 7): tempting wrong answer ("they share one dial").
- Surprising numbers: 4 (cores) vs 200 (SQL default) vs 8 (set by hand), each confirmed not to leak
  into the other setting.
- Takeaways (3 explicit `takeaway` fields): step 4 (default parallelism = core count, not a fixed
  number), step 6 (shuffle partitions never from core count), step 8 (independence confirmed both
  ways).
- Recap restates the two-knob rule and names the sourced-only placement/sharing mechanisms.

## Narrator's line of thought (beyond description)
- Step 2: states the measured fact plainly, then the mechanism reason (one JVM) before any claim
  about what a real cluster would show.
- Step 3: pushes the predict on "what could Spark possibly base this on."
- Step 4: states the number, then generalizes ("change the core count, the number moves with it").
- Step 5: explicitly flags the trap ("resist the pull of the last answer").
- Step 6: puts both numbers side by side explicitly.
- Step 7: frames it as "the sharpest test of all" — would reveal a shared dial if one existed.
- Step 8: states both outcomes together as the confirmation.
- Step 9: names the full syllabus list, explicit about what's measured vs. sourced.

## Post-notes layers
- Outcomes: delay-scheduling mechanism explained; the two parallelism settings distinguished.
- Internals: dynamic allocation + shuffle tracking requirement; FIFO/FAIR pools; delay scheduling
  quoted from TaskSchedulerImpl.scala.
- Production: scaling cores expecting shuffle-partition relief (doesn't happen); FIFO starving a
  shared notebook server by default.
- Frontier: AQE's coalescePartitions (disabled in this topic's own methodology) and skew-join
  splitting named as this chapter's own later topic.
- Where this goes next: Catalyst, unresolved to physical plan (next topic).

## Examples to execute (examples.py) and assertions
- `local[4]` session, AQE disabled (`spark.sql.adaptive.enabled=false`, methodology disclosure):
  a bare `sc.parallelize` RDD gets 4 partitions; `sparkContext.defaultParallelism == 4`.
- A 4-partition DataFrame's `groupBy(...).count()`, no override: output partitions == 200
  (`spark.conf.get("spark.sql.shuffle.partitions")` also asserted == 200).
- Set `spark.sql.shuffle.partitions` to 8, re-run the same groupBy: output partitions == 8.
- A fresh bare RDD created after that change: still 4 partitions, `defaultParallelism` still 4.
All assertions pass against real PySpark 4.0.1, Java 21, local mode (verified; terminal output in
session log). AQE's `coalescePartitions` (on by default in 4.x) was found during drafting to shrink
the groupBy's actual runtime partition count to 1 for this small dataset — disabled explicitly so
the measured count reflects the configured setting itself, documented in the script's own comment
and in FACT-CHECK.md.

## Bridge and handoff
- Bridge: "The shuffle produces blocks sitting on specific executors. This topic is about the
  scheduler's own choice of which executor runs the next task, given where its input actually
  lives."
- Handoff: "Locality and parallelism are about placing and sizing the tasks the planner already
  decided to run. The next two topics go one level up, into the planner itself: how Catalyst
  decided what to run in the first place."

## Concept ledger
- Introduces: `spark-locality-levels`, `spark-shuffle-partitions-config`.
- Uses: `spark-shuffle-mechanics` (topic 3).
- Declared: none.

## Claims list (claim → source)
1. In local mode, default parallelism with no parent RDD equals the core count → Spark
   configuration docs, `spark.default.parallelism`.
2. `spark.sql.shuffle.partitions` configures shuffle output partitions for joins/aggregations,
   default 200 → Spark SQL Performance Tuning docs.
3. Spark's scheduler runs jobs FIFO by default; FAIR is opt-in via `spark.scheduler.mode` → Spark
   Job Scheduling docs.
4. Delay scheduling sacrifices job fairness for data locality to improve throughput →
   `TaskSchedulerImpl.scala`, v4.0.0.
5. A bare RDD gets exactly the core count's partitions; a groupBy shuffle gets exactly
   `spark.sql.shuffle.partitions`'s value, independent of core count in both directions →
   measured directly, `examples.py`.

## Progress
Research, OUTLINE, fact-check, coverage map and every file built; checks run and green (build,
narration-teaches, reel test). Status: built, ready to ship as `status: 'held'`, narration queued
via `renarration.json` (no GPU in this cloud session). Next topic: 5/30,
de.catalyst-unresolved-physical-plan.
