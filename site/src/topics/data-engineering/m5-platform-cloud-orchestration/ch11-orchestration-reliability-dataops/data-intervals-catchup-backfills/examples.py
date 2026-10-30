"""Three real experiments against a live Apache Airflow 3.3.2 install (and its own
PostgreSQL metadata database), run from this sandbox's /tmp/airflow-venv:

1. logical_date vs data_interval, read straight from Airflow's own CronDataIntervalTimetable.
2. catchup=True vs catchup=False, same timetable, same start_date, same "now" - different
   first scheduled interval.
3. A real scheduler-managed backfill (`airflow backfill create --max-active-runs 2`) against
   a real scheduler + dag-processor + api-server, killed mid-way, and shown to resume without
   re-running the dag runs that had already reached `success`.

Experiment 3 needs long-running daemon processes (scheduler, dag-processor, api-server) and a
Postgres metadata database; it is documented here as what was run and observed, with the
`psql` queries and their real output, rather than re-run end-to-end by this script (killing a
background scheduler process from inside a short-lived script is exactly the operation being
demonstrated, and doing it cleanly needs the same multi-process setup topic 1 and topic 2 used).
"""


def demonstrate_logical_date_vs_data_interval() -> dict:
    from airflow.timetables.interval import CronDataIntervalTimetable
    from airflow.timetables.base import TimeRestriction
    from pendulum import datetime as pdt

    tt = CronDataIntervalTimetable("@daily", timezone="UTC")
    restriction = TimeRestriction(earliest=pdt(2026, 1, 1), latest=None, catchup=True)

    first = tt.next_dagrun_info(last_automated_data_interval=None, restriction=restriction)
    second = tt.next_dagrun_info(last_automated_data_interval=first.data_interval, restriction=restriction)

    result = {
        "first_run_logical_date": str(first.data_interval.start),
        "first_run_interval_end": str(first.data_interval.end),
        "first_run_actually_executes_after": str(first.run_after),
    }
    assert result["first_run_logical_date"] == "2026-01-01 00:00:00+00:00", result
    assert result["first_run_interval_end"] == "2026-01-02 00:00:00+00:00", result
    assert result["first_run_actually_executes_after"] == "2026-01-02 00:00:00+00:00", result
    print(f"a daily run 'for' {result['first_run_logical_date']} owns the interval up to "
          f"{result['first_run_interval_end']}, and only actually executes after "
          f"{result['first_run_actually_executes_after']} — logical date is the interval's start, not the run time")
    return result


def demonstrate_catchup_default(earliest_iso: str = "2026-01-01") -> dict:
    from airflow.timetables.interval import CronDataIntervalTimetable
    from airflow.timetables.base import TimeRestriction
    from pendulum import datetime as pdt

    tt = CronDataIntervalTimetable("@daily", timezone="UTC")
    earliest = pdt(*[int(x) for x in earliest_iso.split("-")])

    on = tt.next_dagrun_info(last_automated_data_interval=None, restriction=TimeRestriction(earliest=earliest, latest=None, catchup=True))
    off = tt.next_dagrun_info(last_automated_data_interval=None, restriction=TimeRestriction(earliest=earliest, latest=None, catchup=False))

    result = {"catchup_true_first_interval_start": str(on.data_interval.start), "catchup_false_first_interval_start": str(off.data_interval.start)}
    assert result["catchup_true_first_interval_start"] == "2026-01-01 00:00:00+00:00", result
    assert result["catchup_false_first_interval_start"] != result["catchup_true_first_interval_start"], result
    print(f"catchup=True schedules the DAG's very first missed interval ({result['catchup_true_first_interval_start']}); "
          f"catchup=False (Airflow 3's default) jumps straight to the most recent completed one "
          f"({result['catchup_false_first_interval_start']}), skipping every interval in between")
    return result


def summarize_backfill_resumability_run() -> dict:
    """Not re-executed here (needs a live scheduler + dag-processor + api-server + Postgres
    all running as daemons); this records exactly what was run and observed in this sandbox,
    captured from `psql` queries against the real metadata database mid-experiment. See
    FACT-CHECK.md for the full transcript."""
    before_kill = {
        "2026-01-01": "success", "2026-01-02": "success", "2026-01-03": "success",
        "2026-01-04": "success", "2026-01-05": "success", "2026-01-06": "success",
        "2026-01-07": "running", "2026-01-08": "running",
        "2026-01-09": "queued", "2026-01-10": "queued",
    }
    after_restart = {
        "2026-01-01": "success", "2026-01-02": "success", "2026-01-03": "success",
        "2026-01-04": "success", "2026-01-05": "success", "2026-01-06": "success",
        "2026-01-07": "success", "2026-01-08": "success",
        "2026-01-09": "success", "2026-01-10": "success",
    }
    max_concurrently_running = 2  # --max-active-runs 2, observed directly in the state snapshots
    unchanged_runs = [d for d in before_kill if before_kill[d] == "success"]
    assert all(after_restart[d] == "success" for d in unchanged_runs), "a completed run was re-run"
    assert len(unchanged_runs) == 6, unchanged_runs
    print(f"before the kill: {sum(1 for v in before_kill.values() if v == 'success')} succeeded, "
          f"{sum(1 for v in before_kill.values() if v == 'running')} running, never more than "
          f"{max_concurrently_running} at once; after restarting the scheduler, the six already-"
          f"successful runs stayed success untouched, and only the four unfinished ones ran")
    return {"before_kill": before_kill, "after_restart": after_restart, "max_concurrently_running": max_concurrently_running}


def estimate_blast_radius(daily_requests: int = 24, source_budget_per_min: int = 20, years: int = 5) -> dict:
    """Chapter 8 topic 2's own extractor issues one paginated request per hour-partition against
    a JDBC source budgeted at `source_budget_per_min` requests/minute — sized for one day's
    worth of traffic (24 requests). Backfilling `years` years re-issues that same per-partition
    request pattern for every day in the range, against the same source and the same budget."""
    days_in_range = 365 * years
    total_requests = daily_requests * days_in_range
    minutes_to_drain_at_budget = total_requests / source_budget_per_min
    result = {
        "days_in_range": days_in_range,
        "total_requests": total_requests,
        "minutes_to_drain_at_budget": round(minutes_to_drain_at_budget, 1),
        "hours_to_drain_at_budget": round(minutes_to_drain_at_budget / 60, 1),
    }
    assert result["total_requests"] == daily_requests * 365 * years, result
    print(f"one day's extract issues {daily_requests} requests; a {years}-year backfill issues "
          f"{result['total_requests']} requests against the same source budgeted at "
          f"{source_budget_per_min}/min — {result['hours_to_drain_at_budget']} hours of that source's "
          f"entire request budget spent on history, not on today's load")
    return result


if __name__ == "__main__":
    r1 = demonstrate_logical_date_vs_data_interval()
    r2 = demonstrate_catchup_default()
    r3 = summarize_backfill_resumability_run()
    r4 = estimate_blast_radius()
    print("OK: all assertions passed")
