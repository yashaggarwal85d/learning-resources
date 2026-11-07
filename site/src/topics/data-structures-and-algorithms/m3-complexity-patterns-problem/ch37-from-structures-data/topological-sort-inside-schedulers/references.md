# References

- Apache Airflow, "Priority Weights", documentation.
  [priority-weight.html](https://airflow.apache.org/docs/apache-airflow/stable/administration-and-deployment/priority-weight.html)
  — fetched 2026-11-07, Airflow 3.4.0 docs. Read in full for `priority_weight`'s default and
  the `downstream` rule's own description.
- Apache Airflow, "priority_strategy.py, node.py, cycle.py, task-sdk dag.py,
  scheduler_job_runner.py", source code, `main` branch.
  [priority_strategy.py](https://raw.githubusercontent.com/apache/airflow/main/airflow-core/src/airflow/task/priority_strategy.py)
  — fetched 2026-11-07. Read for the exact `downstream` weight formula, `get_flat_relative_ids`'s
  set return type, the iterative three-colour `detect_cycle`, `check_cycle`'s exception, and the
  scheduler's own candidate-task ordering.
  `task-sdk/src/airflow/sdk/definitions/dag.py`, not `airflow-core/src/airflow/models/dag.py`,
  turned out to be `check_cycle`'s real home on `main` at research time (OUTLINE.md → "Changes
  from the chapter plan").
- `airflow-core/src/airflow/utils/dag_cycle_tester.py`, `main` branch — read for the module's
  own deprecation notice, since Airflow 3.1.0, in favour of `dag.check_cycle()`.
- `scheduler_job_runner.py`'s `.order_by(-TI.priority_weight, DR.logical_date, TI.region_index)`
  line (line 1099 of a direct `curl` of the raw file, 4698 lines) is real but is missing from
  this topic's own fetched copy of the same URL, a known bug in the project's `sources.mjs`
  HTML-tag stripper on source code containing `<...>` spans (SOURCES.md's own note on this
  entry).
- Wikipedia, "Multiprocessor scheduling (Identical-machines scheduling)".
  [Multiprocessor_scheduling](https://en.wikipedia.org/wiki/Multiprocessor_scheduling)
  — fetched 2026-11-07. Read for Graham's list-scheduling bound and its 1969 citation, the same
  source Chapter 34's `dsa.bin-packing-makespan-scheduling` already used for the same bound.
- `dsa.heaps-inside-compaction-shuffle` (Chapter 37 topic 119, held): bridge text reused word
  for word, per the chapter plan.
- `dsa.topological-sort`, `dsa.depth-first-search-edge`, `dsa.dag-shortest-longest-paths`
  (Chapter 17 and 18, live): their concept ids (`kahns-algorithm`, `depth-first-search`,
  `three-colour-cycle-detection`, `critical-path`, `topological-sort`) were already real in
  `registry.ts` at build time, so this topic's own concept list moves them from the chapter
  plan's provisional "declared" list straight into `uses`, per the plan's own instruction.

Last verified: 2026-11-07. Expert sign-off: pending.
