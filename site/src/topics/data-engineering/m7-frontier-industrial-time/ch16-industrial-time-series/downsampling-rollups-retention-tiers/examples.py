"""Rollups that stay mergeable, a continuous aggregate's late-data
invalidation, and a raw-to-rollup retention plan with tier-spanning query
routing."""

from __future__ import annotations

from dataclasses import dataclass

import duckdb
import pandas as pd

HOURS = 24
NORMAL_COUNT = 60
RESTART_HOUR = 3
RESTART_COUNT = 3
NORMAL_MEAN = 208.0
RESTART_MEAN = 280.0  # a restart's few readings run hot before the loop stabilizes


def build_raw_samples() -> pd.DataFrame:
    """One day of readings, one row per sample, with a genuine restart hour
    that has far fewer samples than every other hour."""
    rows = []
    for h in range(HOURS):
        count = RESTART_COUNT if h == RESTART_HOUR else NORMAL_COUNT
        mean = RESTART_MEAN if h == RESTART_HOUR else NORMAL_MEAN
        for i in range(count):
            # a small, deterministic spread around the hour's mean
            offset = (i % 5) - 2
            rows.append({"hour": h, "value": mean + offset})
    return pd.DataFrame(rows)


@dataclass
class HourlyRollup:
    hour: int
    min: float
    max: float
    sum: float
    count: int

    @property
    def mean(self) -> float:
        return self.sum / self.count


def build_hourly_rollups(raw: pd.DataFrame) -> list[HourlyRollup]:
    out = []
    for h in range(HOURS):
        bucket = raw[raw["hour"] == h]["value"]
        out.append(HourlyRollup(h, float(bucket.min()), float(bucket.max()), float(bucket.sum()), len(bucket)))
    return out


def naive_average_of_averages(rollups: list[HourlyRollup]) -> float:
    """The bug: averaging the 24 hourly means, giving every hour equal
    weight regardless of how many samples it actually had."""
    return sum(r.mean for r in rollups) / len(rollups)


def merge_rollups(rollups: list[HourlyRollup]) -> HourlyRollup:
    """min, max, sum and count all merge correctly into a single rollup of
    the union; average is never stored, only derived as sum / count."""
    return HourlyRollup(
        hour=-1,
        min=min(r.min for r in rollups),
        max=max(r.max for r in rollups),
        sum=sum(r.sum for r in rollups),
        count=sum(r.count for r in rollups),
    )


class SimpleMergeableDigest:
    """A deliberately simplified mergeable quantile summary: at this lab's
    scale it keeps every raw value, so merging two digests and querying a
    quantile is exact. A production sketch (t-digest, KLL) keeps a bounded
    approximation instead — that internal structure is out of scope here
    (see OUTLINE.md); only the *mergeability property* is being shown."""

    def __init__(self, values: list[float]):
        self.values = sorted(values)

    def merge(self, other: "SimpleMergeableDigest") -> "SimpleMergeableDigest":
        return SimpleMergeableDigest(self.values + other.values)

    def quantile(self, p: float) -> float:
        idx = min(len(self.values) - 1, max(0, round(p * (len(self.values) - 1))))
        return self.values[idx]


def late_data_invalidation(rollup: HourlyRollup, late_value: float) -> HourlyRollup:
    """A reading that arrives after its bucket was materialized forces that
    one bucket to be recomputed, not the whole continuous aggregate."""
    return HourlyRollup(
        hour=rollup.hour,
        min=min(rollup.min, late_value),
        max=max(rollup.max, late_value),
        sum=rollup.sum + late_value,
        count=rollup.count + 1,
    )


BYTES_PER_RAW_POINT = 16  # timestamp + value, uncompressed
BYTES_PER_ROLLUP_POINT = 32  # min, max, sum, count


def retention_tier_storage_bytes(raw_days: int, rollup_minute_days: int, rollup_hour_days: int, points_per_day_raw: int) -> dict[str, int]:
    points_per_minute_rollup_day = 24 * 60
    points_per_hour_rollup_day = 24
    return {
        "raw": raw_days * points_per_day_raw * BYTES_PER_RAW_POINT,
        "minute_rollup": rollup_minute_days * points_per_minute_rollup_day * BYTES_PER_ROLLUP_POINT,
        "hour_rollup": rollup_hour_days * points_per_hour_rollup_day * BYTES_PER_ROLLUP_POINT,
    }


def route_query(range_days: float, raw_retention_days: int, minute_retention_days: int) -> list[str]:
    """A query over a short, recent range reads raw; a long range reads the
    coarsest rollup that covers it; a range spanning tiers stitches both."""
    if range_days <= raw_retention_days:
        return ["raw"]
    if range_days <= minute_retention_days:
        return ["minute_rollup"]
    if range_days > minute_retention_days:
        return ["minute_rollup", "hour_rollup"] if range_days <= minute_retention_days * 10 else ["hour_rollup"]
    return ["hour_rollup"]


def main() -> None:
    raw = build_raw_samples()
    rollups = build_hourly_rollups(raw)

    naive_mean = naive_average_of_averages(rollups)
    true_mean = float(raw["value"].mean())
    assert abs(naive_mean - true_mean) > 1.0, "the restart hour's disproportionate weight in a naive average must produce a visible error"
    assert naive_mean > true_mean, "equal-weighting the hot restart hour pulls the naive average above the true mean"

    daily_merged = merge_rollups(rollups)
    assert abs(daily_merged.sum - raw["value"].sum()) < 1e-9
    assert daily_merged.count == len(raw)
    assert abs(daily_merged.mean - true_mean) < 1e-9, "sum / count from the merged rollup must equal the raw computation exactly"

    hour0_digest = SimpleMergeableDigest(raw[raw["hour"] == 0]["value"].tolist())
    hour1_digest = SimpleMergeableDigest(raw[raw["hour"] == 1]["value"].tolist())
    merged_digest = hour0_digest.merge(hour1_digest)
    direct_digest = SimpleMergeableDigest(raw[raw["hour"].isin([0, 1])]["value"].tolist())
    assert merged_digest.quantile(0.5) == direct_digest.quantile(0.5), "merging two digests and querying must equal building one digest from the union"

    restart_rollup = rollups[RESTART_HOUR]
    late_value = 500.0  # an anomalous late reading for the restart hour
    recomputed = late_data_invalidation(restart_rollup, late_value)
    assert recomputed.count == restart_rollup.count + 1
    assert recomputed.max == late_value, "the late reading changes the bucket's max"
    assert recomputed.mean != restart_rollup.mean, "a late reading must change the materialized bucket, not be silently dropped"

    POINTS_PER_DAY_AT_ONE_SECOND = 24 * 60 * 60
    storage = retention_tier_storage_bytes(raw_days=7, rollup_minute_days=90, rollup_hour_days=730, points_per_day_raw=POINTS_PER_DAY_AT_ONE_SECOND)
    per_day_raw = storage["raw"] / 7
    per_day_minute = storage["minute_rollup"] / 90
    assert per_day_minute < per_day_raw, "a minute rollup must cost less per retained day than raw storage"

    assert route_query(range_days=0.5, raw_retention_days=7, minute_retention_days=90) == ["raw"]
    assert route_query(range_days=30, raw_retention_days=7, minute_retention_days=90) == ["minute_rollup"]
    spanning = route_query(range_days=200, raw_retention_days=7, minute_retention_days=90)
    assert spanning == ["minute_rollup", "hour_rollup"], "a range spanning two tiers must read and stitch both, not silently pick one"

    spike_hour = raw.copy()
    spike_hour.loc[(spike_hour["hour"] == 10) & (spike_hour.index % 20 == 0), "value"] = 600.0
    spike_rollup = build_hourly_rollups(spike_hour)[10]
    assert abs(spike_rollup.mean - NORMAL_MEAN) < 20.0, "the mean rollup smooths the spike nearly away"
    assert spike_rollup.max == 600.0, "the max rollup keeps the spike exactly"

    con = duckdb.connect()
    con.register("raw_points", raw.assign(hour_float=raw["hour"].astype(float)))
    rollup_df = pd.DataFrame([{"hour": r.hour, "mean": r.mean} for r in rollups])
    con.register("rollup_points", rollup_df)
    raw_range_rows = con.execute("SELECT count(*) FROM raw_points WHERE hour_float BETWEEN 0 AND 5").fetchone()[0]
    rollup_range_rows = con.execute("SELECT count(*) FROM rollup_points WHERE hour BETWEEN 0 AND 5").fetchone()[0]
    con.close()
    assert raw_range_rows > rollup_range_rows, "the same time range must scan far fewer rows from the rollup than from raw"

    print("all rollup, continuous-aggregate and retention-tier assertions passed")


if __name__ == "__main__":
    main()
