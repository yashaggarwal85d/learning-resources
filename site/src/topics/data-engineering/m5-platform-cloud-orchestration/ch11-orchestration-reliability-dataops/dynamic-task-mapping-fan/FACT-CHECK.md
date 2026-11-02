# Fact-check: Dynamic task mapping and fan-out

1. **Dynamic task mapping defers task creation until runtime; the scheduler determines the exact task-instance count from upstream output, not at Dag-parse time.**
   Confirmed. Dynamic Task Mapping doc: "Dynamic Task Mapping allows a way for a workflow to create a number of tasks at runtime based upon current data... Unlike a Python for-loop executed at DAG parse time, dynamic task mapping defers task creation until runtime, allowing the scheduler to determine the exact number of task instances based on upstream task outputs." Demonstrated live: `discover_files()` listed a real directory at run time and `process_file.partial().expand(file=discover_files())` created exactly one task instance per discovered file.

2. **`expand()` maps arguments that vary per task instance; `partial()` fixes arguments shared across all of them.**
   Confirmed. Dynamic Task Mapping doc: "it is possible to pass arguments that don't change — in order to clearly differentiate between the two kinds we use different functions, expand() for mapped arguments, and partial() for unmapped ones."

3. **`core.max_map_length` defaults to 1024 — the maximum number of task instances `expand()` can create.**
   Confirmed. Dynamic Task Mapping doc: "The [core] max_map_length config option is the maximum number of tasks that expand can create – the default value is 1024." Confirmed directly against a live Airflow 3.3.2 install (`airflow.configuration.conf.get('core', 'max_map_length')` returned `1024`).

4. **Exceeding `max_map_length` fails the source task outright; it does not silently create only the first 1024.**
   Confirmed, independently reproduced live. Dynamic Task Mapping doc: "If a source task... returns a list longer than this it will result in that task failing." Ran `airflow dags test mapping_demo_dag <date>` against a drop folder of exactly 1024 files: the run succeeded, `dag_run.state` = `success`. With 1025 files: the run failed, with the real error surfaced in the task log: `airflow.sdk.api.client.ServerResponseError: Server returned error` — `{'reason': 'unmappable_return_value_length', 'message': "pushed value is too large to map as a downstream's dependency"}`. Nothing was clipped to the first 1024; `dag_run.state` was `failed`, and no `task_instance` rows for `process_file` existed for that run at all.

5. **This topic's own real demo confirms the exact boundary and the exact rejection error, which the quoted doc describes only as "that task failing."**
   Confirmed, measured live (see claim 4). The doc doesn't publish the specific error payload; this topic's own run against a live install surfaced it directly.

6. **Wall time to fan out, run and finish a mapped Dag climbs with the number of discovered files.**
   Confirmed, measured live. `airflow dags test mapping_demo_dag <date>` timed end to end with a drop folder holding 10, 100, 500 and 1024 files respectively: 8.45s, 16.38s, 46.97s and 88.16s (wall clock, via `date +%s.%N` around each real command, this session's own `/tmp/airflow_home3` install). The relationship is not perfectly linear (fixed per-run overhead — Dag parsing, DB setup — dominates at small N), but overhead clearly climbs with file count: the derived per-task figure in `examples.py` (~0.079s per additional mapped task instance, from the two largest, most reliable points) is this session's own estimate from these four real measurements, not a documented Airflow constant.

7. **A zero-length `expand()` input creates no task instances at all; the mapped task is marked `SKIPPED`.**
   Confirmed, sourced and quoted, not independently reproduced live in this session (this topic's live demo always had at least one discovered file; testing the exact zero-file case was judged lower-value than the boundary and overhead experiments actually run, given session time). Dynamic Task Mapping doc: "If the input is empty (zero length), no new tasks will be created and the mapped task will be marked as SKIPPED."

8. **The fan-out-vs-engine-overhead comparison is a reasoned estimate, not two production systems measured side by side.**
   Disclosed, not a live measurement. `examples.py: estimate_fan_out_vs_engine_overhead` multiplies this topic's own measured per-task scheduling overhead by a file count, and compares it against a stated Spark-internal-partition overhead figure sourced from Chapter 7's own established measurements (not re-measured here) — a calculation anyone can redo with their own install's numbers, not a reproduction of a real side-by-side benchmark.
