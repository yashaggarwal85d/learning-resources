"""Synthetic examples for de.telemetry-pipelines-logs-metrics. No real system is required for
this topic (unlike the database-internals topics): it is pure Python over synthetic data, same
fictional shop as earlier chapters (CHAPTER.md's running example), no real email, phone number or
company. Every number shown in reel.tsx is computed and asserted here."""

import random


def unstructured_vs_structured_log_search():
    """One pipeline run, 300 synthetic unstructured log lines (mixed tasks interleaved) plus the
    same run's structured records carrying the correlation key. Count what a human must grep
    through versus what one correlation-key query returns."""
    random.seed(1)
    run_id, task_id, asset, partition = "run-4821", "task-7", "orders_rollup", "2026-10-29"
    other_runs = ["run-4819", "run-4820", "run-4822"]

    unstructured_lines = []
    structured_records = []
    for _ in range(300):
        this_run = run_id if random.random() < 0.33 else random.choice(other_runs)
        line = f"[INFO] worker picked up a job and started processing at some point"
        unstructured_lines.append(line)
        structured_records.append({"run_id": this_run, "task_id": task_id, "asset": asset, "partition": partition})

    matching = [r for r in structured_records if r["run_id"] == run_id]
    print(f"unstructured lines a human must read: {len(unstructured_lines)}")
    print(f"structured records returned by one correlation-key query: {len(matching)}")
    assert len(unstructured_lines) == 300
    assert 80 <= len(matching) <= 120, f"expected roughly a third of 300 lines to match run_id, got {len(matching)}"
    return len(unstructured_lines), len(matching)


def counter_gauge_histogram_pick():
    """Six synthetic pipeline measurements; classify each to the metric type that can represent
    it, and show that the wrong type fails on the two that can decrease."""
    measurements = {
        "rows_processed_total": "monotonic, only grows while the process runs",
        "queue_depth": "rises and falls as items arrive and are drained",
        "task_duration_seconds": "a distribution of many observed durations",
        "consumer_lag_records": "rises and falls as the consumer catches up or falls behind",
        "last_success_timestamp": "jumps to 'now' on success, otherwise frozen, can be read as an age",
        "errors_total": "monotonic, only grows until a restart",
    }

    def classify(name, behaviour):
        if "monotonic" in behaviour:
            return "counter"
        if "distribution" in behaviour:
            return "histogram"
        return "gauge"

    picks = {name: classify(name, behaviour) for name, behaviour in measurements.items()}
    for name, kind in picks.items():
        print(f"{name}: {kind}")

    assert picks["rows_processed_total"] == "counter"
    assert picks["errors_total"] == "counter"
    assert picks["queue_depth"] == "gauge"
    assert picks["consumer_lag_records"] == "gauge"
    assert picks["last_success_timestamp"] == "gauge"
    assert picks["task_duration_seconds"] == "histogram"

    def counter_only_increase(current, delta):
        if delta < 0:
            raise ValueError("a counter's interface has no decrement; it can only increase or reset to zero")
        return current + delta

    real_depth_after_drain = 100 - 30  # 70: the queue actually drained by 30
    try:
        counter_only_increase(100, -30)
        forced_through = None
    except ValueError as e:
        # the only way to force a decrease through a counter is to reset it to zero and lose the
        # real value entirely -- not represent 70, represent 0.
        forced_through = 0
        print(f"counter rejects the decrease directly ({e}); forcing it through a reset gives {forced_through}, not the real depth {real_depth_after_drain}")
    assert forced_through == 0 and forced_through != real_depth_after_drain, "demonstrating the failure: a counter cannot represent a value falling, only a reset to zero"
    return picks


def freshness_sawtooth_and_stale_night():
    """30 nightly runs' freshness curve (minutes since the newest partition at the moment the
    daily check runs), one stale night injected. A 'tasks succeeded' boolean stays green the
    whole stale night; the freshness metric alone crosses its threshold."""
    threshold_minutes = 90
    freshness_minutes = []
    tasks_succeeded = []
    for night in range(30):
        if night == 17:
            # the stale night: the task ran and exited 0, but against yesterday's already-landed
            # partition — it did no new work, so freshness keeps climbing instead of resetting.
            freshness_minutes.append(620)
            tasks_succeeded.append(True)
        else:
            freshness_minutes.append(random.Random(night).randint(20, 70))
            tasks_succeeded.append(True)

    stale_night = 17
    print(f"night {stale_night}: tasks_succeeded={tasks_succeeded[stale_night]}, freshness={freshness_minutes[stale_night]} min, threshold={threshold_minutes} min")
    assert tasks_succeeded[stale_night] is True, "the hook's whole point: the task genuinely exits 0"
    assert freshness_minutes[stale_night] > threshold_minutes, "freshness alone must cross the threshold on the stale night"
    assert all(f <= threshold_minutes for i, f in enumerate(freshness_minutes) if i != stale_night), "every other night stays fresh"
    return freshness_minutes, tasks_succeeded


def pushgateway_vs_collector_batch_job():
    """A batch job that runs for less time than the scrape interval: a pull-only scraper never
    catches it mid-run and misses its one reported value; a push-based path records it. Then show
    the Pushgateway's own documented pitfall: a job that stops pushing still reports its last
    value forever, until deleted."""
    scrape_interval_seconds = 15
    job_duration_seconds = 4

    def pull_scraper_sees_job(duration, interval):
        # the scraper only samples instantaneous state at each tick; a job shorter than the
        # interval can start and finish between two ticks and never be observed running.
        return duration >= interval

    seen_by_pull = pull_scraper_sees_job(job_duration_seconds, scrape_interval_seconds)
    print(f"batch job runs {job_duration_seconds}s, scrape interval {scrape_interval_seconds}s: pull scraper sees it = {seen_by_pull}")
    assert seen_by_pull is False

    pushed_value_after_job_finishes = 42  # rows processed, pushed once at job exit
    pushgateway_reported_value_days_later = pushed_value_after_job_finishes  # never expires on its own
    print(f"pushed value at job exit: {pushed_value_after_job_finishes}; Pushgateway still reports: {pushgateway_reported_value_days_later} (unchanged, series never expires on its own)")
    assert pushgateway_reported_value_days_later == pushed_value_after_job_finishes
    return seen_by_pull, pushgateway_reported_value_days_later


def series_explosion_per_customer_label():
    """Time series and estimated memory for one counter, before and after adding a per-customer
    label, across a growing synthetic customer count. ~3KB per series is the commonly cited
    rough order-of-magnitude figure for Prometheus' in-memory chunk overhead; used here only to
    show the shape of the growth, not as a vendor-sourced constant."""
    bytes_per_series = 3_000
    customer_counts = [10, 100, 1_000, 10_000]
    results = []
    for n in customer_counts:
        series_without_label = 1
        series_with_label = n
        mb_with_label = series_with_label * bytes_per_series / 1_000_000
        results.append((n, series_without_label, series_with_label, round(mb_with_label, 2)))
        print(f"{n:>6} customers: 1 series without the label -> {n} series with it (~{round(mb_with_label, 2)} MB)")

    assert results[0][2] == 10
    assert results[-1][2] == 10_000
    assert results[-1][3] > 10 * results[1][3], "memory should scale roughly linearly with customer count"
    return results


def main():
    unstructured_vs_structured_log_search()
    counter_gauge_histogram_pick()
    freshness_sawtooth_and_stale_night()
    pushgateway_vs_collector_batch_job()
    series_explosion_per_customer_label()
    print("de.telemetry-pipelines-logs-metrics examples: all checks pass")


if __name__ == "__main__":
    main()
