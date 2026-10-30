# OUTLINE: de.driver-executors-task-hierarchy

Refresher, chapter 7's first topic. Syllabus line in full (§7.1): "application → job (one per
action) → stage → task (one per partition); the driver as the single planner and single point of
failure; executors as slot pools (cores × executors); cluster managers in Spark 4.x (YARN,
Kubernetes, standalone; Mesos removed in 4.0)."

## Learning outcomes
1. Name which of application/job/stage/task a given Spark UI screen or log line is describing.
2. Predict, from code alone, how many jobs a sequence of actions spawns.
3. Explain why a stage's task count tracks its partition count, never the row count.
4. State precisely what the driver and an executor each are, and why losing one is recoverable and losing the other is not.

## Reel steps (final, matches reel.tsx)
1. Hook — the four words, no fixed scope assigned yet.
2. Reveal: one action, one job — count() on 4 partitions: 1 job, 1 stage, 4 tasks.
3. Predict (within first 4 steps) — same DataFrame, second count(): same job or new?
4. Reveal: a new job id — confirmed via statusTracker; a job is scoped to the action.
5. Reveal: task count tracks partitions — repartition(8) → 8 tasks, same data.
6. Reveal: driver and executor — Spark's own glossary, quoted exactly.
7. Recap — the four-level hierarchy restated as fixed scopes.

## Engagement arc
- Hook (step 1): everyone has used the four words; few can say what each one fixes.
- Predict (step 3, within first 4): genuinely counter-intuitive (a job tracks the action, not the data) — wrong option is the natural "nothing changed" instinct.
- Surprising number: the second count() gets a different job id despite identical data (step 4).
- Takeaways (≥3): step 4 ("a job is scoped to one action, never to the data"), step 5 ("a task count is about partitions, never data size"), step 6 ("lose the driver and the whole application is gone; lose one executor and only its tasks are gone").
- Recap (step 7) ties all four words to one fixed scope each.

## Narrator's line of thought (beyond the description)
- Step 1: plant the test ("pick one word, say what fixes its count") rather than defining terms.
- Step 2: the real measurement, not an assumed number — stresses "measured, not assumed."
- Step 3: asks the learner to actually commit before revealing, names why the wrong answer feels right (data unchanged).
- Step 4: corrects the "job tracks data" intuition directly with the measured counter-example.
- Step 5: explicitly rules out the row-count/data-size explanation.
- Step 6: reads Spark's own glossary as authority, then draws the practical consequence (what losing each one costs).
- Step 7: restates the chain as a formula, not a list.

## Post-notes layers
- Outcomes: the four terms' precise scopes, restated.
- Internals: local mode's one-JVM collapse of driver+executor; cluster managers and the cores×executors slot formula; Mesos removal.
- Production: job-id-as-data-tracking mistake; more-partitions-isn't-free trade-off, handed to the next topic.
- Frontier: Spark Connect, named and sourced, not built.
- Where this goes next: the DAG scheduler's precise stage-cut rule (next topic).

## Examples to execute (examples.py) and assertions
- `spark.range(0, 1_000_000, numPartitions=4).count()`: 1 job (newest job id), its busiest stage has 4 tasks.
- A second `df.count()`: newest job id strictly greater than the first's.
- `df.repartition(8).count()`: the job's new stage (not seen before) has 8 tasks.
- `spark.master` config equals `local[4]`, grounding the cores×executors claim for this run.
All assertions pass against real PySpark 4.0.1, Java 21, local mode (verified; see terminal output in session log).

## Bridge and handoff
- Bridge (from Milestone 2's close, Chapter 6 unpublished — see CHAPTER.md's stated assumption): "Milestone 2 ended with data that sits in files and tables, durable and queryable. The moment that data is too big for one query to touch on one machine, someone has to decide how the work is cut up, and this chapter's one running system, Apache Spark, makes every one of those decisions something you can watch rather than take on faith."
- Handoff: "Four levels of hierarchy says how big a computation is. It says nothing yet about where the DAG scheduler decides to cut a job into stages in the first place — the next topic's own rule, and the one that turns 'job' into 'stage' for real."

## Concept ledger
- Introduces: `spark.task-hierarchy`, `spark.driver-executor-model`.
- Uses: none (chapter's first topic).
- Declared: none.

## Claims list (claim → source)
1. Application → job → stage → task hierarchy, exact definitions → Cluster Mode Overview glossary (SOURCES.md).
2. Driver runs `main()`, owns `SparkContext` → Cluster Mode Overview, "Driver program" glossary entry.
3. Executors are per-application processes that run tasks → Cluster Mode Overview, "Executor" glossary entry.
4. Cluster managers in Spark 4.x: standalone, YARN, Kubernetes → Cluster Mode Overview, "Cluster Manager Types".
5. Mesos removed in Spark 4.0 → Spark Release 4.0.0 notes, SPARK-44442.
6. A job is spawned per action, not per DataFrame; task count equals partition count → measured directly, `examples.py`.

## Progress
Research, OUTLINE, fact-check, coverage map and every file built; checks not yet run in this
session. Status: built, not yet shipped. Next: section 8 (content review) and section 9 (checks),
then ship as `status: 'held'` with narration queued via `renarration.json` (no GPU in this cloud
session).
