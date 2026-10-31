# Outline: Dynamic task mapping and fan-out

## Reel steps (9)

1. **Hook.** An engineer maps a task over "one file." The partner's drop folder happens to hold eleven thousand small files that day. The metadata database that was comfortable scheduling a few hundred task instances an hour now has to schedule eleven thousand in one run, and every other Dag sharing that cluster slows to a crawl.
2. **Reveal: expand/partial, run for real.** A task mapped with `.partial().expand(file=discover_files())` over a runtime-discovered list of five files — Airflow decides the fan-out count when the Dag runs, not when it's written. All five process; none existed as a plan until the Dag actually ran.
3. **Predict: what happens past the limit?** Does mapping over more files than Airflow allows truncate silently to the first N, or does the whole run fail?
4. **Reveal: the exact boundary, measured.** 1024 mapped task instances: success. 1025: the whole run fails outright, with Airflow's own real rejection error — nothing gets clipped.
5. **Reveal: scheduling overhead, measured at four scales.** The same mapped Dag, timed end to end at 10, 100, 500 and 1024 discovered files: wall time climbs with every extra mapped task instance, roughly linearly.
6. **Reveal: the same work, pushed into the engine instead.** The same file count as partitions inside one Spark job instead of one task instance per file: the orchestrator's own overhead for identical work.
7. **Recap.** Fan-out count is decided at runtime, not write time. A mapped-task limit exists and rejects outright past it. Thousands of orchestrator task instances cost orders of magnitude more scheduling overhead than the same work done inside one engine task.
8. **Prove it.** A `discover_files` task returns zero files this run — the partner's drop folder is empty today. What happens to `process_file.expand(file=discover_files())`?
9. **Takeaway beat / handoff setup.** Fan-out can make thousands of task instances want to run at once — something has to decide how many actually do.

Note: with 9 total slots and two predicts needed (one within the first 4), steps are consolidated to: Hook, Reveal expand/partial, Predict limit, Reveal boundary measured, Reveal overhead scaling, Reveal engine contrast, Recap, Predict zero-length, Prove it / handoff. (Final numbering settled in reel.tsx.)

## Learning outcomes

Write a mapped task with `expand`/`partial` over a runtime-discovered list; predict and show what happens at the mapped-task limit; measure the scheduler overhead of a large fan-out against pushing the same parallelism into a compute engine, and state the rule for choosing between them.

## Claims (for FACT-CHECK.md)

1. Dynamic task mapping defers task creation until runtime; the scheduler determines the exact task-instance count from upstream output, not at Dag-parse time (Dynamic Task Mapping doc).
2. `expand()` maps arguments that vary per task instance; `partial()` fixes arguments shared across all of them (Dynamic Task Mapping doc).
3. `core.max_map_length` defaults to 1024 — the maximum number of task instances `expand()` can create (Dynamic Task Mapping doc).
4. Exceeding `max_map_length` fails the source task outright; it does not silently create only the first 1024 (Dynamic Task Mapping doc, confirmed live).
5. This topic's own real demo: mapping over exactly 1024 discovered files succeeds; 1025 fails with Airflow's actual rejection error (`unmappable_return_value_length`) (measured).
6. This topic's own real demo: wall time to fan out, run and finish a mapped Dag climbs from the real timings taken at 10/100/500/1024 discovered files (measured).
7. A zero-length `expand()` input creates no task instances at all; the mapped task is marked `SKIPPED`, not run zero times silently or failed (Dynamic Task Mapping doc).
8. The fan-out-vs-engine-overhead comparison (examples.py) is a reasoned estimate built from this topic's own measured per-task overhead and Chapter 7's stated Spark per-partition overhead figure, not two production systems measured side by side — disclosed as such.

## Concept ledger

**Introduces:** `dynamic-task-mapping`, `fan-out-vs-engine-parallelism`.
**Uses:** `de.orchestrator-architecture-scheduler` (topic 1), `ch8.file-ingestion-landing-zones`, `ch7.engine-internal-parallelism`.
**Declared:** none beyond topic 3.

## Bridge / handoff

**Bridge:** "A backfill re-runs a fixed set of tasks many times. This topic is the other way a Dag multiplies: the same run deciding, at execution time, exactly how many tasks it needs, one per file or per partition it discovers."

**Handoff:** "Fan-out can make thousands of task instances want to run at once. Something has to decide how many actually do, and in what order, without starving anything else sharing the cluster. That is the next topic."
