<section data-section="outcomes">

## Outcomes

By the end of this topic you can: write a mapped task with `expand`/`partial` over a runtime-discovered list; predict and show what happens at the mapped-task limit; measure the scheduler overhead of a large fan-out against pushing the same parallelism into a compute engine, and state the rule for choosing between them.

</section>

<section data-section="internals">

## Internals

Dynamic task mapping is explicitly a runtime decision, not a parse-time one: "Unlike a Python for-loop executed at DAG parse time, dynamic task mapping defers task creation until runtime, allowing the scheduler to determine the exact number of task instances based on upstream task outputs" (Dynamic Task Mapping doc). `expand()` and `partial()` exist specifically to separate the two kinds of argument a mapped task needs — one that varies per instance, one that doesn't.

The mapped-task limit is a hard ceiling with a specific, documented failure mode: "If a source task... returns a list longer than this it will result in that task failing." This topic's own live run confirms the exact shape of that failure: the upstream task's attempt to push a too-long list as a mapped dependency is rejected by Airflow's own execution API with `reason: unmappable_return_value_length`, and the whole Dag run is marked `failed` — not partially successful, not silently truncated.

A zero-length input is treated differently again, by design: "If the input is empty (zero length), no new tasks will be created and the mapped task will be marked as SKIPPED" — distinguishing "nothing to do this run" from "something went wrong."

</section>

<section data-section="lab">

## Lab

Two experiments, both run against a real Apache Airflow 3.3.2 install and its own PostgreSQL metadata database:

1. **The exact mapped-task-limit boundary.** `airflow dags test mapping_demo_dag <date>` with a drop folder holding exactly 1024 files: every file mapped, every task instance succeeded. One more file (1025): the run failed with Airflow's own real rejection error, read directly from the task log.
2. **Scheduling-overhead scaling.** The same command, timed end to end, with the drop folder holding 10, 100, 500 and 1024 files: 8.45s, 16.38s, 46.97s, 88.16s wall clock. `examples.py` derives an approximate per-task overhead figure from these four real measurements and uses it to estimate the gap against pushing the same file count into one Spark job's internal partitioning instead (Chapter 7's own sourced overhead figure for that side).

Reproduce: `pip install "apache-airflow==3.3.2"` with its constraints file; populate a directory with N files; point the Dag at it via an environment variable; `time airflow dags test mapping_demo_dag <date>`.

</section>

<section data-section="production">

## Production

The 1024-mapped-task boundary and the measured overhead curve both point at the same production rule: a mapped task should fan out over a bounded, expected-size list (a day's partitions, a known file set), not over whatever a partner happens to drop. When the true parallelism is in the thousands, the engine processing the data — not the orchestrator scheduling it — should own that parallelism internally, with the orchestrator triggering one job rather than scheduling one task instance per unit of work.

</section>

<section data-section="frontier">

## Frontier

`max_active_tis_per_dag` bounds how many copies of one mapped task can run at once across all of a Dag's active runs — a separate knob from `max_map_length`, controlling concurrency rather than the total count. Named here as the mechanism the next topic (concurrency controls) generalizes into pools, queues and priorities across an entire cluster, not demonstrated step by step in this topic's own lab.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Fan-out can put thousands of task instances in front of the scheduler at once, each one wanting to run immediately. Nothing in dynamic task mapping itself says how many of them actually get to, or in what order, without starving every other Dag sharing the same scheduler and database. That bounding mechanism is the next topic.

</section>
