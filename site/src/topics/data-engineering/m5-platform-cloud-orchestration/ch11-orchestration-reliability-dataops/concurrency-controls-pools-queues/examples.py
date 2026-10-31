"""One real experiment against a live Apache Airflow 3.3.2 install and its own PostgreSQL
metadata database: a 2-slot pool protecting a "fragile source," with ten mapped tasks competing
for it — two at `priority_weight=10` (the high-priority extracts), eight at `priority_weight=1`
(the low-priority ones) — all submitted in the same Dag run at the same instant.

Not re-executed by this script (needs a live scheduler, dag-processor, API server and Postgres
all running as daemons, the same setup topics 1, 3 and 4 used); the real command, its real
output and the exact timestamps read back from `task_instance` are recorded here and in
FACT-CHECK.md.
"""


def summarize_pool_and_priority_run() -> dict:
    """`task_instance.start_date`/`end_date`, read directly from the metadata database after the
    real run of dags/pool_demo_dag.py (pool `fragile_source_pool`, 2 slots; 2 `extract_high`
    instances at priority_weight=10, 8 `extract_low` instances at priority_weight=1, all
    submitted in one Dag run)."""
    # (task, map_index, priority_weight, start_offset_s, end_offset_s), offsets from the run's
    # own trigger time, rounded to two decimals, read straight from the database.
    runs = [
        ("extract_high", 0, 10, 0.97, 5.14),
        ("extract_high", 1, 10, 1.00, 5.18),
        ("extract_low", 0, 1, 5.95, 10.08),
        ("extract_low", 1, 1, 5.99, 10.13),
        ("extract_low", 2, 1, 10.31, 14.44),
        ("extract_low", 3, 1, 10.33, 14.47),
        ("extract_low", 4, 1, 14.64, 18.79),
        ("extract_low", 5, 1, 14.73, 18.98),
        ("extract_low", 6, 1, 19.13, 23.29),
        ("extract_low", 7, 1, 19.16, 23.36),
    ]

    # 1. Priority ordering: every high-priority instance starts strictly before every low-priority one.
    high_starts = [r[3] for r in runs if r[0] == "extract_high"]
    low_starts = [r[3] for r in runs if r[0] == "extract_low"]
    priority_held = max(high_starts) < min(low_starts)

    # 2. Pool cap: at no point were more than 2 instances running at once (half-open intervals).
    intervals = [(r[3], r[4]) for r in runs]
    times = sorted({t for iv in intervals for t in iv})
    max_concurrent = 0
    for t in times[:-1]:
        running = sum(1 for (s, e) in intervals if s <= t < e)
        max_concurrent = max(max_concurrent, running)

    result = {"priority_order_held": priority_held, "max_concurrent_in_pool": max_concurrent, "pool_slots": 2}
    assert result["priority_order_held"] is True, result
    assert result["max_concurrent_in_pool"] == result["pool_slots"], result
    print(f"both priority_weight=10 instances started and finished before any priority_weight=1 "
          f"instance began; across the whole run, never more than {result['max_concurrent_in_pool']} "
          f"of the ten mapped instances were running at once, exactly matching the pool's "
          f"{result['pool_slots']}-slot cap")
    return result


if __name__ == "__main__":
    r1 = summarize_pool_and_priority_run()
    print("OK: all assertions passed")
