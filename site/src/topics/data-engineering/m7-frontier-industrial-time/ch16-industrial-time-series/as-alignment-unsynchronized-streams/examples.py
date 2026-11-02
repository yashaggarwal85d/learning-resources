"""As-of joins on telemetry: a dense pressure series matched to a sparse
temperature series by nearest-preceding time, with a tolerance, a
per-equipment partition key, and the look-ahead cost of interpolating."""

from __future__ import annotations

import duckdb
import pandas as pd


def build_pressure() -> pd.DataFrame:
    """A dense pressure series on two pieces of equipment, sampled every 10s."""
    rows = []
    for equipment in ("line4-press", "line7-press"):
        for i in range(40):
            rows.append({"equipment": equipment, "ts": pd.Timestamp("2026-06-01 00:00:00") + pd.Timedelta(seconds=10 * i), "pressure": 100.0 + i})
    return pd.DataFrame(rows)


def build_temperature() -> pd.DataFrame:
    """A sparse temperature series on the same two pieces of equipment,
    sampled every 60s — a continuous ramp, so interpolation error is
    measurable against ground truth."""
    rows = []
    for equipment in ("line4-press", "line7-press"):
        for i in range(8):
            rows.append({"equipment": equipment, "ts": pd.Timestamp("2026-06-01 00:00:00") + pd.Timedelta(seconds=60 * i), "temperature": 200.0 + 5.0 * i})
    return pd.DataFrame(rows)


def asof_join_pandas(pressure: pd.DataFrame, temperature: pd.DataFrame, tolerance: pd.Timedelta | None) -> pd.DataFrame:
    """A backward as-of join, partitioned per equipment ('by'), matching
    pandas' default direction='backward'."""
    left = pressure.sort_values("ts")
    right = temperature.sort_values("ts")
    return pd.merge_asof(left, right, on="ts", by="equipment", direction="backward", tolerance=tolerance)


def asof_join_duckdb(pressure: pd.DataFrame, temperature: pd.DataFrame) -> pd.DataFrame:
    """The same join expressed in DuckDB's ASOF JOIN, with the equality
    condition on equipment and the inequality on timestamp."""
    con = duckdb.connect()
    con.register("pressure", pressure)
    con.register("temperature", temperature)
    result = con.execute(
        """
        SELECT p.equipment, p.ts, p.pressure, t.temperature
        FROM pressure p
        ASOF JOIN temperature t
          ON p.equipment = t.equipment
         AND p.ts >= t.ts
        ORDER BY p.equipment, p.ts
        """
    ).df()
    con.close()
    return result


def null_rate_against_tolerance(pressure: pd.DataFrame, temperature: pd.DataFrame, tolerances_seconds: list[int]) -> dict[int, float]:
    """For a shrinking tolerance, the share of left rows that fail to match
    at all (pandas returns NaN for the right-hand columns beyond tolerance)."""
    out = {}
    for secs in tolerances_seconds:
        joined = asof_join_pandas(pressure, temperature, pd.Timedelta(seconds=secs))
        out[secs] = float(joined["temperature"].isna().mean())
    return out


def backward_step_value(ramp_known: dict[int, float], left_second: int) -> float:
    """A backward as-of match on a continuous ramp gives a step
    approximation: whatever the preceding right-hand sample said, with no
    adjustment for how far past it the left timestamp actually is."""
    preceding_seconds = max(s for s in ramp_known if s <= left_second)
    return ramp_known[preceding_seconds]


def interpolated_value(ramp_known: dict[int, float], left_second: int) -> float:
    """Linear interpolation between the preceding AND following samples —
    only available by looking ahead past the left timestamp, which a
    real-time join cannot do."""
    known_seconds = sorted(ramp_known)
    preceding = max(s for s in known_seconds if s <= left_second)
    following = min((s for s in known_seconds if s >= left_second), default=preceding)
    if preceding == following:
        return ramp_known[preceding]
    frac = (left_second - preceding) / (following - preceding)
    return ramp_known[preceding] + frac * (ramp_known[following] - ramp_known[preceding])


def main() -> None:
    pressure = build_pressure()
    temperature = build_temperature()

    pandas_joined = asof_join_pandas(pressure, temperature, tolerance=None).sort_values(["equipment", "ts"]).reset_index(drop=True)
    duckdb_joined = asof_join_duckdb(pressure, temperature).sort_values(["equipment", "ts"]).reset_index(drop=True)

    assert len(pandas_joined) == len(duckdb_joined) == len(pressure)
    merged = pandas_joined.merge(duckdb_joined, on=["equipment", "ts"], suffixes=("_pd", "_duck"))
    assert (merged["temperature_pd"] == merged["temperature_duck"]).all(), "pandas and DuckDB must agree row for row"
    assert (merged["pressure_pd"] == merged["pressure_duck"]).all()

    no_tolerance = asof_join_pandas(pressure, temperature, tolerance=None)
    assert no_tolerance["temperature"].notna().all(), "with no tolerance, a backward match always finds something (first sample is at t=0)"

    rates = null_rate_against_tolerance(pressure, temperature, [5, 15, 30, 61, 120])
    assert rates[5] > rates[61] >= 0.0, "a tighter tolerance must exclude at least as many matches as a looser one"
    assert rates[61] == 0.0, "a tolerance covering the full 60s report period matches every row"
    assert rates[5] > 0.0, "a 5s tolerance is tighter than the 60s report period and must miss rows"

    CLOCK_OFFSET_SECONDS = 15
    rate_below_offset = null_rate_against_tolerance(pressure, temperature, [CLOCK_OFFSET_SECONDS - 1])[CLOCK_OFFSET_SECONDS - 1]
    rate_at_offset = null_rate_against_tolerance(pressure, temperature, [CLOCK_OFFSET_SECONDS])[CLOCK_OFFSET_SECONDS]
    assert rate_below_offset >= rate_at_offset, "a tolerance set below the clock-offset uncertainty excludes correct matches, not just stale ones"

    ramp_known = {i * 60: 200.0 + 5.0 * i for i in range(8)}
    left_second = 90
    step_value = backward_step_value(ramp_known, left_second)
    interp_value = interpolated_value(ramp_known, left_second)
    true_value_at_90s = 200.0 + 5.0 * (90 / 60)
    assert abs(step_value - 205.0) < 0.01, "the backward step holds the t=60 value flat until the next sample at t=120"
    assert abs(interp_value - true_value_at_90s) < 0.01, "interpolation between t=60 and t=120 recovers the true ramp value at t=90"
    assert abs(interp_value - step_value) > 1.0, "the step approximation and the interpolated value disagree meaningfully on a moving signal"

    partitioned = asof_join_pandas(pressure, temperature, tolerance=None)
    line4 = partitioned[partitioned["equipment"] == "line4-press"]
    line7 = partitioned[partitioned["equipment"] == "line7-press"]
    assert (line4["temperature"].reset_index(drop=True) == line7["temperature"].reset_index(drop=True)).all(), "both equipment's temperature series are identical by construction"
    cross_wired = pd.merge_asof(
        pressure.sort_values("ts"), temperature.sort_values("ts"), on="ts", direction="backward"
    )
    assert len(cross_wired) == len(pressure), "an as-of join with no partition key still returns one row per left row (and silently ignores equipment)"

    print("all as-of alignment assertions passed")


if __name__ == "__main__":
    main()
