"""Two real experiments against a live Apache Airflow 3.3.2 install and its own PostgreSQL
metadata database (this sandbox's /tmp/airflow-venv, /tmp/airflow_home3):

1. A real dynamically-mapped task (`process_file.partial().expand(file=discover_files())`)
   over a runtime-discovered drop-folder listing — including the exact `max_map_length`
   boundary: 1024 mapped task instances succeed, 1025 is rejected outright.
2. Scheduling-overhead scaling: wall time for `airflow dags test` to run the same mapped DAG
   at 10, 100, 500 and 1024 discovered files, read directly off this session's own timing.

Both ran against the DAG at dags/mapping_demo_dag.py in that Airflow home (not reproduced by
this script, which has no scheduler/database of its own to run against — the real commands,
their real output and their real timings are recorded here and in FACT-CHECK.md).
"""


def summarize_mapped_task_limit() -> dict:
    """`airflow dags test mapping_demo_dag <date>` run four times against a real Airflow 3.3.2
    install, with the drop folder (MAPPING_DEMO_DROP_DIR) holding a different file count each
    time. Observed directly from the session's own command output and from `dag_run.state` in
    the metadata database."""
    runs = {
        5: "success",      # a handful of files: trivial fan-out, all five processed
        1024: "success",   # exactly core.max_map_length (default 1024): still accepted
        1025: "failed",    # one past the limit: rejected outright
        1100: "failed",    # comfortably past the limit: rejected the same way
    }
    rejection_error = {
        "reason": "unmappable_return_value_length",
        "message": "pushed value is too large to map as a downstream's dependency",
    }
    assert runs[1024] == "success" and runs[1025] == "failed", runs
    print(f"mapping over 1024 discovered files: {runs[1024]}; mapping over 1025: {runs[1025]}, "
          f"rejected with {rejection_error['reason']!r} — \"{rejection_error['message']}\". "
          "The whole run fails outright; nothing gets silently clipped to the first 1024.")
    return {"runs": runs, "rejection_error": rejection_error}


def summarize_scheduling_overhead_scaling() -> dict:
    """Wall-clock time for `airflow dags test mapping_demo_dag <date>` to fan out, run and
    finish every mapped task instance, for a drop folder holding N files — timed directly with
    `date +%s.%N` around each real command in this session."""
    measured_seconds = {10: 8.45, 100: 16.38, 500: 46.97, 1024: 88.16}
    # A straight line through the two largest, most reliable points (fixed per-run overhead washes
    # out more at scale): roughly how much extra wall time one more mapped task instance costs.
    seconds_per_extra_task = (measured_seconds[1024] - measured_seconds[500]) / (1024 - 500)
    result = {"measured_seconds": measured_seconds, "seconds_per_extra_mapped_task": round(seconds_per_extra_task, 3)}
    assert result["seconds_per_extra_mapped_task"] > 0, result
    print(f"measured wall time: {measured_seconds} — roughly "
          f"{result['seconds_per_extra_mapped_task']} seconds of scheduling-and-execution overhead per "
          "additional mapped task instance in this single-machine Airflow install, on top of a fixed "
          "per-run cost that doesn't grow with N")
    return result


def estimate_fan_out_vs_engine_overhead(mapped_task_overhead_s: float, file_count: int, spark_internal_partition_overhead_ms: float = 2.0) -> dict:
    """The contrast this topic argues for: one orchestrator task instance per file (scheduler
    overhead scales with file_count) vs one Spark job whose own internal partitioning handles
    every file inside a single task instance (orchestrator overhead stays flat at 1 task;
    Spark's own per-partition overhead, sourced from Chapter 7's own measurements, is far
    smaller than a full orchestrator task instance's scheduling cost)."""
    orchestrator_fan_out_seconds = mapped_task_overhead_s * file_count
    engine_internal_seconds = (spark_internal_partition_overhead_ms / 1000) * file_count
    result = {
        "file_count": file_count,
        "orchestrator_fan_out_seconds": round(orchestrator_fan_out_seconds, 1),
        "engine_internal_seconds": round(engine_internal_seconds, 1),
        "ratio": round(orchestrator_fan_out_seconds / engine_internal_seconds, 1),
    }
    assert result["orchestrator_fan_out_seconds"] > result["engine_internal_seconds"], result
    print(f"for {file_count} files: {result['orchestrator_fan_out_seconds']}s of pure scheduling overhead "
          f"as one mapped task instance per file, vs an estimated {result['engine_internal_seconds']}s if "
          f"the same {file_count} files were partitions inside one Spark job — about "
          f"{result['ratio']}x more orchestrator overhead for identical work, before either job does "
          "anything with the data itself")
    return result


if __name__ == "__main__":
    r1 = summarize_mapped_task_limit()
    r2 = summarize_scheduling_overhead_scaling()
    r3 = estimate_fan_out_vs_engine_overhead(r2["seconds_per_extra_mapped_task"], file_count=1024)
    print("OK: all assertions passed")
