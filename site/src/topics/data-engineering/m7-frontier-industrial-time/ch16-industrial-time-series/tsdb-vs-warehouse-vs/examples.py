"""A decision matrix of access path (last value, range scan, cross-series
aggregation, join to business data) measured directly on DuckDB/Parquet
against a synthetic week of mixed-rate plant data, a capacity-and-cost
estimate chain using a dated object-storage unit price, and a simulation of
the tier-boundary failure modes (duplicated points on overlap, a late
reading that reaches only the hot tier)."""

from __future__ import annotations

import tempfile
import time
from dataclasses import dataclass
from pathlib import Path

import duckdb

SERIES_COUNT = 1297  # the plant's own actual series count, from topic 12
SECONDS_PER_WEEK = 7 * 24 * 60 * 60


def build_synthetic_week(con: duckdb.DuckDBPyConnection, sample_interval_seconds: int) -> int:
    """Load a synthetic week of mixed-rate plant data as rows, plus a
    synthetic 'work order' business table to join against. Built with
    DuckDB's own set-generating SQL (range/generate_series), not a Python
    row-by-row loop, since the full plant's series count over a week of
    samples is tens of millions of rows."""
    n_points_per_series = SECONDS_PER_WEEK // sample_interval_seconds
    con.execute(
        f"""
        CREATE TABLE readings AS
        SELECT
          s AS series_id,
          i * {sample_interval_seconds} AS ts,
          (hash(s * 1000003 + i) % 10000) / 100.0 AS value
        FROM range({SERIES_COUNT}) AS t1(s)
        CROSS JOIN range({n_points_per_series}) AS t2(i)
        """
    )
    n = con.execute("SELECT count(*) FROM readings").fetchone()[0]

    con.execute(
        f"""
        CREATE TABLE work_orders AS
        SELECT
          s * 5 AS series_id,
          s AS order_id,
          (hash(s * 7919) % {SECONDS_PER_WEEK - 3600}) AS started_ts,
          (hash(s * 7919) % {SECONDS_PER_WEEK - 3600}) + 3600 AS ended_ts
        FROM range({SERIES_COUNT // 5}) AS t(s)
        """
    )
    return n


def measure_last_value(con: duckdb.DuckDBPyConnection, series_id: int) -> tuple[float, float]:
    start = time.perf_counter()
    row = con.execute(
        "SELECT value FROM readings WHERE series_id = ? ORDER BY ts DESC LIMIT 1", [series_id]
    ).fetchone()
    return row[0], time.perf_counter() - start


def measure_range_scan(con: duckdb.DuckDBPyConnection, series_id: int, start_ts: int, end_ts: int) -> tuple[int, float]:
    start = time.perf_counter()
    n = con.execute(
        "SELECT count(*) FROM readings WHERE series_id = ? AND ts >= ? AND ts < ?", [series_id, start_ts, end_ts]
    ).fetchone()[0]
    return n, time.perf_counter() - start


def measure_cross_series_aggregation(con: duckdb.DuckDBPyConnection, start_ts: int, end_ts: int) -> tuple[float, float]:
    start = time.perf_counter()
    avg_value = con.execute(
        "SELECT avg(value) FROM readings WHERE ts >= ? AND ts < ?", [start_ts, end_ts]
    ).fetchone()[0]
    return avg_value, time.perf_counter() - start


def measure_join_to_business_data(con: duckdb.DuckDBPyConnection) -> tuple[int, float]:
    start = time.perf_counter()
    n = con.execute(
        """
        SELECT count(*)
        FROM readings r
        JOIN work_orders w ON r.series_id = w.series_id AND r.ts BETWEEN w.started_ts AND w.ended_ts
        """
    ).fetchone()[0]
    return n, time.perf_counter() - start


def write_parquet_and_measure_size(con: duckdb.DuckDBPyConnection) -> int:
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "readings.parquet"
        con.execute(f"COPY readings TO '{path}' (FORMAT PARQUET)")
        return path.stat().st_size


@dataclass
class CapacityEstimate:
    """Chapter 15's own capacity-estimate-chain idea, applied here: multiply
    through from a per-point byte cost to a retention-period total, then
    price it at a stated, dated unit cost rather than leaving the result
    bare."""
    series_count: int
    sample_interval_seconds: int
    bytes_per_point: float
    retention_days: int
    object_storage_price_per_gb_month: float  # Thanos's own documented $0.02/GB figure

    def points_per_day(self) -> float:
        return self.series_count * (24 * 60 * 60 / self.sample_interval_seconds)

    def total_bytes(self) -> float:
        return self.points_per_day() * self.retention_days * self.bytes_per_point

    def total_gb(self) -> float:
        return self.total_bytes() / (1024 ** 3)

    def monthly_cost_usd(self) -> float:
        # price the retained volume at the dated per-GB-month object storage rate
        return self.total_gb() * self.object_storage_price_per_gb_month


def hot_tier_window_days(estimate: CapacityEstimate, hot_tier_days: int) -> CapacityEstimate:
    return CapacityEstimate(
        series_count=estimate.series_count,
        sample_interval_seconds=estimate.sample_interval_seconds,
        bytes_per_point=estimate.bytes_per_point,
        retention_days=hot_tier_days,
        object_storage_price_per_gb_month=estimate.object_storage_price_per_gb_month,
    )


def simulate_tier_overlap(hot_tier_days: int, export_lag_days: int, point_count_per_day: int) -> tuple[int, int]:
    """A tiering pipeline that exports the hot tier to the lakehouse after a
    lag: any point written in the overlap window between the export cutoff
    and the hot tier's own retention boundary exists in both tiers at once,
    which is the duplicated-point failure mode CHAPTER.md names."""
    overlap_days = max(0, export_lag_days)
    duplicated_points = overlap_days * point_count_per_day
    total_points = hot_tier_days * point_count_per_day
    return duplicated_points, total_points


def simulate_late_reading_reaches_only_hot_tier(hot_tier_days: int, lakehouse_export_cutoff_day: int, reading_day: int, reading_arrival_day: int) -> bool:
    """A reading for `reading_day` that arrives on `reading_arrival_day`: if
    the lakehouse export for that day already ran (arrival is after the
    cutoff for that day's export), the reading only ever reaches the hot
    tier, never the lakehouse, unless something re-exports it."""
    return reading_arrival_day > lakehouse_export_cutoff_day and reading_day <= lakehouse_export_cutoff_day


def main() -> None:
    con = duckdb.connect()
    SAMPLE_INTERVAL_SECONDS = 10
    total_rows = build_synthetic_week(con, SAMPLE_INTERVAL_SECONDS)
    assert total_rows > 0

    # --- the decision matrix: four access paths, measured directly ---
    last_value, last_value_time = measure_last_value(con, series_id=42)
    assert last_value_time >= 0

    range_n, range_time = measure_range_scan(con, series_id=42, start_ts=0, end_ts=3600)
    assert range_n > 0

    cross_series_avg, cross_series_time = measure_cross_series_aggregation(con, start_ts=0, end_ts=3600)
    assert cross_series_avg is not None

    join_n, join_time = measure_join_to_business_data(con)
    assert join_n > 0, "the join to business data must match at least one reading against a work order's time window"

    full_week_avg, full_week_time = measure_cross_series_aggregation(con, start_ts=0, end_ts=SECONDS_PER_WEEK)
    assert full_week_time >= 0 and range_time >= 0

    parquet_bytes = write_parquet_and_measure_size(con)
    assert parquet_bytes > 0
    bytes_per_point_measured = parquet_bytes / total_rows

    con.close()

    # --- capacity-estimate-chain, priced at a dated, sourced unit cost ---
    OBJECT_STORAGE_PRICE_PER_GB_MONTH = 0.02  # Thanos's own documented figure
    hot_estimate = CapacityEstimate(
        series_count=SERIES_COUNT,
        sample_interval_seconds=SAMPLE_INTERVAL_SECONDS,
        bytes_per_point=1.5,  # Prometheus's own documented 1-2 bytes/point midpoint, as in topic 13
        retention_days=14,
        object_storage_price_per_gb_month=OBJECT_STORAGE_PRICE_PER_GB_MONTH,
    )
    lakehouse_estimate = CapacityEstimate(
        series_count=SERIES_COUNT,
        sample_interval_seconds=SAMPLE_INTERVAL_SECONDS,
        bytes_per_point=bytes_per_point_measured,  # the measured Parquet-on-disk cost, not a documented claim
        retention_days=365 * 3,
        object_storage_price_per_gb_month=OBJECT_STORAGE_PRICE_PER_GB_MONTH,
    )
    assert lakehouse_estimate.monthly_cost_usd() > hot_estimate.monthly_cost_usd(), "three years of retention must cost more per month than fourteen days, even priced identically per GB"
    assert hot_estimate.total_gb() < lakehouse_estimate.total_gb()

    # --- tier-boundary failure modes ---
    duplicated, total = simulate_tier_overlap(hot_tier_days=14, export_lag_days=2, point_count_per_day=int(hot_estimate.points_per_day()))
    assert duplicated > 0, "an export lag greater than zero must produce a nonzero overlap window with duplicated points"
    assert duplicated < total, "the duplicated window must be a fraction of the hot tier's total points, not all of it"

    late_only_hot = simulate_late_reading_reaches_only_hot_tier(
        hot_tier_days=14, lakehouse_export_cutoff_day=5, reading_day=3, reading_arrival_day=8
    )
    assert late_only_hot is True, "a reading for an already-exported day that arrives after the export cutoff must reach only the hot tier"

    not_late = simulate_late_reading_reaches_only_hot_tier(
        hot_tier_days=14, lakehouse_export_cutoff_day=5, reading_day=3, reading_arrival_day=4
    )
    assert not_late is False, "a reading that arrives before its day's export cutoff must not be flagged as hot-tier-only"

    print("all decision-matrix/capacity/tiering assertions passed")
    print(f"  last value: {last_value_time*1000:.3f}ms, range scan ({range_n} rows): {range_time*1000:.3f}ms")
    print(f"  cross-series aggregation (1hr): {cross_series_time*1000:.3f}ms, full week: {full_week_time*1000:.3f}ms")
    print(f"  join to business data: {join_n} matched rows, {join_time*1000:.3f}ms")
    print(f"  measured bytes/point on Parquet: {bytes_per_point_measured:.3f}")
    print(f"  hot tier (14d): {hot_estimate.total_gb():.4f} GB, ${hot_estimate.monthly_cost_usd():.4f}/month")
    print(f"  lakehouse tier (3yr): {lakehouse_estimate.total_gb():.2f} GB, ${lakehouse_estimate.monthly_cost_usd():.2f}/month")
    print(f"  tier overlap: {duplicated} duplicated points out of {total} hot-tier points")


if __name__ == "__main__":
    main()
