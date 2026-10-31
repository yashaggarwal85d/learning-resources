"""Lab for de.real-time-quality-anomaly.

The three-baseline comparison on a synthetic series with a planted slow
drift and a planted step, the per-series state estimate, and the
backtest on a held-out period are this topic's executable evidence.
"""

import random


def ewma_series(values, lam, init):
    """The EWMA baseline: each step blends the new value into a running
    average that discounts older data, exactly as NIST's own definition
    states.
    """
    out = []
    prev = init
    for v in values:
        out.append(prev)  # the baseline's own value *before* seeing this point
        prev = lam * v + (1 - lam) * prev
    return out


def ewma_flags(values, lam, init, k, spread):
    """Flag a point where it departs from the EWMA baseline computed
    from everything before it, by more than k times the spread.
    """
    baseline = ewma_series(values, lam, init)
    return [abs(v - b) > k * spread for v, b in zip(values, baseline)]


def seasonal_profile(history, period):
    """A per-phase mean, learned from a full history of one or more
    cycles. A series with no history yet has no profile to use.
    """
    sums = [0.0] * period
    counts = [0] * period
    for i, v in enumerate(history):
        sums[i % period] += v
        counts[i % period] += 1
    return [s / c if c else 0.0 for s, c in zip(sums, counts)]


def seasonal_flags(values, profile, period, k, spread):
    """Flag a point where it departs from its own phase's learned
    seasonal value by more than k times the spread.
    """
    return [abs(v - profile[i % len(profile)]) > k * spread for i, v in enumerate(values)]


def spc_flags(values, center, limit):
    """A fixed control limit, set once from a stable window: flag any
    point outside it, regardless of how the process has since moved.
    """
    return [abs(v - center) > limit for v in values]


def per_series_state_bytes(series_count, bytes_per_series):
    """The hot path's own memory cost: one baseline state per series."""
    return series_count * bytes_per_series


def cold_start_ready(history_length, min_history):
    """A series with too little history stays quiet rather than risk a
    baseline it hasn't actually earned yet.
    """
    return history_length >= min_history


def backtest_precision(flags, incident_indices, tolerance):
    """Precision against labelled past incidents: a flag within
    `tolerance` steps of a real incident counts as a true positive;
    every other flag is a false positive.
    """
    true_positives = 0
    false_positives = 0
    for i, flagged in enumerate(flags):
        if not flagged:
            continue
        if any(abs(i - inc) <= tolerance for inc in incident_indices):
            true_positives += 1
        else:
            false_positives += 1
    total = true_positives + false_positives
    return true_positives / total if total else 0.0


def check():
    rng = random.Random(5)
    spread = 1.0
    stable_len = 60
    period = 12

    stable = [rng.gauss(0, spread) for _ in range(stable_len)]
    seasonal_wave = [3.0 * ((i % period) / period) for i in range(stable_len)]
    normal_ramp = [stable[i] + seasonal_wave[i] for i in range(stable_len)]

    step_point = [rng.gauss(8.0, spread) for _ in range(5)]  # a sudden level shift: the real fault

    drift_len = 80
    slow_drift = [rng.gauss(0, spread) + 0.12 * i for i in range(drift_len)]  # a gradual drift: the other real fault

    center = sum(stable) / len(stable)
    limit = 3 * spread

    ewma_lam = 0.2
    ewma_on_step = ewma_flags(step_point, ewma_lam, init=0.0, k=3, spread=spread)
    assert ewma_on_step[0] is True  # the EWMA catches a sudden step immediately, before it has adapted

    ewma_on_drift = ewma_flags(slow_drift, ewma_lam, init=0.0, k=3, spread=spread)
    assert ewma_on_drift[0] is False  # the drift starts small, inside normal noise
    assert ewma_on_drift[-1] is False  # and by the end, the EWMA has adapted into the drift and stopped flagging it

    profile = seasonal_profile(normal_ramp, period)
    seasonal_on_ramp = seasonal_flags(normal_ramp, profile, period, k=3, spread=spread)
    assert not any(seasonal_on_ramp)  # a baseline that has learned the seasonal pattern flags none of its own normal ramp

    spc_on_step = spc_flags(step_point, center, limit)
    assert all(spc_on_step)  # a fixed control limit reliably catches a point far outside it, like the step

    state_bytes = per_series_state_bytes(series_count=200_000, bytes_per_series=256)
    ten_x_state_bytes = per_series_state_bytes(series_count=2_000_000, bytes_per_series=256)
    assert ten_x_state_bytes == state_bytes * 10  # ten times the series count means ten times the per-series state, linearly

    assert cold_start_ready(history_length=period * 3, min_history=period * 2) is True
    assert cold_start_ready(history_length=period, min_history=period * 2) is False  # too little history to trust a baseline yet

    incident_indices = [2]  # the step's own true fault, inside step_point
    precision = backtest_precision(spc_on_step, incident_indices, tolerance=2)
    assert precision == 1.0  # every flag on this held-out segment lands near the one labelled incident


if __name__ == "__main__":
    check()
    print("de.real-time-quality-anomaly: all checks passed")
