"""Resampling a mixed set of continuous, step and counter signals to a common
grid with the right aggregate per signal type, and the two ways a gap fill can lie."""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

RNG_SEED = 7


def build_continuous_series() -> pd.Series:
    """An oven temperature, sampled every 10 seconds, that rises during a real
    excursion hidden inside a later outage window."""
    idx = pd.date_range("2026-06-01 00:00:00", "2026-06-01 06:00:00", freq="10s")
    base = 210.0
    values = [base] * len(idx)
    excursion_start = idx.get_loc(pd.Timestamp("2026-06-01 02:15:00"))
    excursion_end = idx.get_loc(pd.Timestamp("2026-06-01 02:45:00"))
    for i in range(excursion_start, excursion_end):
        values[i] = base + 30.0
    return pd.Series(values, index=idx, name="temperature_c")


def build_step_series() -> pd.Series:
    """A machine-state code (0=idle, 1=running, 2=fault), event-driven: a row
    only when the state changes, not on a fixed interval."""
    changes = [
        ("2026-06-01 00:00:00", 1),
        ("2026-06-01 01:40:00", 2),
        ("2026-06-01 01:55:00", 1),
        ("2026-06-01 04:10:00", 0),
        ("2026-06-01 04:30:00", 1),
    ]
    idx = pd.to_datetime([c[0] for c in changes])
    return pd.Series([c[1] for c in changes], index=idx, name="state_code")


def build_counter_series() -> pd.Series:
    """A cumulative energy counter (kWh), reported every 5 minutes, that only
    ever goes up (topic 5's `cumulative-counter-to-interval-consumption`)."""
    idx = pd.date_range("2026-06-01 00:00:00", "2026-06-01 06:00:00", freq="5min")
    return pd.Series([100.0 + 0.4 * i for i in range(len(idx))], index=idx, name="energy_kwh")


GRID = "1min"


def resample_continuous(series: pd.Series) -> pd.Series:
    """A continuous signal gets a mean per bucket."""
    return series.resample(GRID).mean()


def resample_step(series: pd.Series) -> pd.Series:
    """A step/state signal gets the last known value carried into each bucket
    (reindex to the grid, then forward-fill), never a mean of the codes."""
    grid = pd.date_range(series.index.min().floor(GRID), series.index.max().ceil(GRID), freq=GRID)
    return series.reindex(series.index.union(grid)).ffill().reindex(grid)


def resample_counter(series: pd.Series) -> pd.Series:
    """A counter gets the difference of the end values per bucket, not a mean
    or a last-value (topic 5's `cumulative-counter-to-interval-consumption`)."""
    grid_values = series.resample(GRID).last().ffill()
    return grid_values.diff().fillna(0.0)


def wrong_aggregate_state_mean(series: pd.Series) -> float:
    """The bug: averaging machine-state codes. A bucket that straddles a
    state change and gets a mean of state 1 and state 2 (two event rows
    landing in the same bucket) comes back 1.5, a state that never existed."""
    bucket = series.loc["2026-06-01 01:40:00":"2026-06-01 01:55:00"]
    assert len(bucket) == 2 and set(bucket.tolist()) == {1, 2}
    return float(bucket.mean())


MAX_GAP = pd.Timedelta("30min")


@dataclass
class FilledPoint:
    value: float
    flag: str  # 'observed', 'filled', 'missing'


def locf_fill(series: pd.Series, grid: pd.DatetimeIndex) -> pd.Series:
    return series.reindex(series.index.union(grid)).ffill().reindex(grid)


def linear_interpolate_fill(series: pd.Series, grid: pd.DatetimeIndex) -> pd.Series:
    return series.reindex(series.index.union(grid)).interpolate(method="time").reindex(grid)


def honest_fill_with_flag(series: pd.Series, grid: pd.DatetimeIndex, max_gap: pd.Timedelta) -> list[FilledPoint]:
    """Fill up to max_gap with LOCF and flag every point observed / filled /
    missing. A filled value is a claim, so points beyond max_gap stay missing
    rather than being invented (the InfluxDB gapfill plugin's own rule:
    "gaps longer than max_fill_gap are never invented, only reported")."""
    observed_times = set(series.index)
    out: list[FilledPoint] = []
    last_observed_time = None
    last_observed_value = None
    for t in grid:
        if t in observed_times:
            out.append(FilledPoint(float(series[t]), "observed"))
            last_observed_time = t
            last_observed_value = float(series[t])
            continue
        before = series.index[series.index <= t]
        if len(before) == 0:
            out.append(FilledPoint(float("nan"), "missing"))
            continue
        last_t = before[-1]
        if t - last_t <= max_gap:
            out.append(FilledPoint(float(series[last_t]), "filled"))
        else:
            out.append(FilledPoint(float("nan"), "missing"))
    return out


def honest_mean_over_bucket(points: list[FilledPoint]) -> tuple[float, int, int]:
    """An honest aggregate over a partially filled bucket counts only observed
    and filled points, and reports how many of each — never averages in a
    `missing` point as if it were zero or the last value."""
    usable = [p.value for p in points if p.flag in ("observed", "filled")]
    n_observed = sum(1 for p in points if p.flag == "observed")
    n_filled = sum(1 for p in points if p.flag == "filled")
    return (sum(usable) / len(usable) if usable else float("nan")), n_observed, n_filled


SIGNAL_TYPE_METADATA = {
    "temperature_c": "continuous",
    "state_code": "step",
    "energy_kwh": "counter",
}


def main() -> None:
    temperature = build_continuous_series()
    state = build_step_series()
    energy = build_counter_series()

    continuous_grid = resample_continuous(temperature)
    assert abs(continuous_grid["2026-06-01 00:30:00"] - 210.0) < 0.01
    assert abs(continuous_grid["2026-06-01 02:20:00"] - 240.0) < 0.01, "excursion must survive the mean"

    step_grid = resample_step(state)
    assert step_grid["2026-06-01 01:50:00"] == 2
    assert step_grid["2026-06-01 00:00:00"] == 1

    counter_grid = resample_counter(energy)
    assert abs(counter_grid.sum() - (energy.iloc[-1] - energy.iloc[0])) < 0.01, "interval sums must equal total rise"
    assert counter_grid.min() >= -1e-9, "a counter's per-bucket consumption is never negative"

    wrong_mean = wrong_aggregate_state_mean(state)
    assert wrong_mean == 1.5, "averaging state codes produces a state that never existed"
    assert wrong_mean not in (0, 1, 2), "1.5 is not a valid machine state"

    grid = pd.date_range("2026-06-01 00:00:00", "2026-06-01 06:00:00", freq=GRID)

    outage = temperature.drop(
        temperature.loc["2026-06-01 01:00:00":"2026-06-01 05:00:00"].index
    )

    locf = locf_fill(outage, grid)
    excursion_bucket = locf["2026-06-01 02:30:00"]
    assert abs(excursion_bucket - 210.0) < 0.01, "LOCF across the four-hour outage shows the pre-outage value, hiding the excursion"

    interp = linear_interpolate_fill(outage, grid)
    mid_outage = interp["2026-06-01 02:30:00"]
    assert abs(mid_outage - 210.0) < 0.01, "a straight interpolation across the outage also smooths the excursion away to the flat pre-outage line"

    points = honest_fill_with_flag(outage, grid, MAX_GAP)
    outage_points = points[grid.get_loc(pd.Timestamp("2026-06-01 02:05:00")):grid.get_loc(pd.Timestamp("2026-06-01 02:55:00")) + 1]
    assert all(p.flag == "missing" for p in outage_points), "a gap past max_gap is reported missing, not filled"

    short_gap_points = honest_fill_with_flag(
        temperature.drop(temperature.loc["2026-06-01 00:10:10":"2026-06-01 00:19:50"].index),
        grid,
        MAX_GAP,
    )
    short_gap_window = short_gap_points[grid.get_loc(pd.Timestamp("2026-06-01 00:11:00")):grid.get_loc(pd.Timestamp("2026-06-01 00:19:00")) + 1]
    assert all(p.flag == "filled" for p in short_gap_window), "a gap within max_gap is filled and flagged, not left missing"

    mean_value, n_observed, n_filled = honest_mean_over_bucket(outage_points)
    assert n_observed == 0 and n_filled == 0, "the fully-missing outage window contributes nothing to an honest aggregate"
    import math
    assert math.isnan(mean_value), "an aggregate with no usable points is NaN, not a silently invented number"

    mean_value2, n_observed2, n_filled2 = honest_mean_over_bucket(short_gap_window)
    assert n_filled2 > 0 and n_observed2 == 0
    assert abs(mean_value2 - 210.0) < 0.01

    assert SIGNAL_TYPE_METADATA["temperature_c"] == "continuous"
    assert SIGNAL_TYPE_METADATA["state_code"] == "step"
    assert SIGNAL_TYPE_METADATA["energy_kwh"] == "counter"

    print("all resampling and gap-fill assertions passed")


if __name__ == "__main__":
    main()
