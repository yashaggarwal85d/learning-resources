"""Lab for de.feature-platform-point-time.

The label-leakage experiment (a planted future-leaking feature, the
optimistic bias measured against a clean time-split) and the
parity-check simulation are this topic's executable evidence.
"""

import random


def point_in_time_count(order_times, as_of, window):
    """The correct join: count only orders known as of the event's own
    time, within the trailing window ending at that time.
    """
    return sum(1 for t in order_times if as_of - window <= t < as_of)


def leaky_count(order_times, now, window):
    """The leaky join: count orders in the trailing window ending at
    today's "now", regardless of when the event being scored happened.
    Any order placed after the event but before "now" leaks straight in.
    """
    return sum(1 for t in order_times if now - window <= t < now)


def build_dataset(n, window, horizon, rng):
    """Synthetic clicks: each entity's orders are scattered in time, and
    the label is whether an order landed within `horizon` after the
    click. The leaky feature's trailing window, measured from "now"
    (after every click), swallows exactly those post-click orders.
    """
    rows = []
    for _ in range(n):
        click_time = rng.uniform(0, 300)
        order_times = [click_time + rng.uniform(-window, -1) for _ in range(rng.randint(0, 3))]
        if rng.random() < 0.3:
            order_times.append(click_time + rng.uniform(1, horizon))  # the future order that defines the label
        label = 1 if any(click_time < t <= click_time + horizon for t in order_times) else 0
        rows.append((click_time, order_times, label))
    return rows


def accuracy_at_threshold(rows, now, window, use_point_in_time, threshold):
    """A trivial classifier: predict the label from one count feature
    crossing a threshold. Only the join changes between the two calls.
    """
    correct = 0
    for click_time, order_times, label in rows:
        count = point_in_time_count(order_times, click_time, window) if use_point_in_time else leaky_count(order_times, now, window)
        predicted = 1 if count >= threshold else 0
        correct += 1 if predicted == label else 0
    return correct / len(rows)


def parity_mismatch_rate(online_values, offline_values, tolerance):
    """The fraction of a sample where the online store's value and the
    offline computation disagree by more than the tolerance.
    """
    mismatches = sum(1 for o, f in zip(online_values, offline_values) if abs(o - f) > tolerance)
    return mismatches / len(online_values)


def sampling_cost(sample_rate, total_entities, cost_per_check):
    """The parity check's own cost: it scales with how many entities are
    actually checked, not with the full entity count.
    """
    return total_entities * sample_rate * cost_per_check


def backfill_row_cost(rows, cost_per_row):
    """A new feature's backfill cost: reconstructing its point-in-time
    value for every existing training row, once.
    """
    return rows * cost_per_row


def check():
    rng = random.Random(11)
    window = 30.0
    horizon = 5.0
    rows = build_dataset(n=4000, window=window, horizon=horizon, rng=rng)
    now = 300.0 + horizon  # "today," safely after every click and every planted future order

    acc_point_in_time = accuracy_at_threshold(rows, now, window, use_point_in_time=True, threshold=1)
    acc_leaky = accuracy_at_threshold(rows, now, window, use_point_in_time=False, threshold=1)
    assert acc_leaky > acc_point_in_time + 0.1  # the leaky join's accuracy is optimistic by a measured, specific margin

    base_rate = sum(r[2] for r in rows) / len(rows)
    assert acc_point_in_time < acc_leaky  # the point-in-time join never gets to peek at the future order that defines the label
    assert 0.0 < base_rate < 1.0  # the label itself is a real mix, not a degenerate all-one-class dataset

    online_values = [rng.randint(0, 5) for _ in range(500)]
    offline_values = [v if rng.random() > 0.02 else v + rng.choice([-2, 2]) for v in online_values]
    mismatch_rate = parity_mismatch_rate(online_values, offline_values, tolerance=1)
    assert 0.0 < mismatch_rate < 0.1  # skew is rare but real, exactly what a standing parity check exists to catch

    full_cost = sampling_cost(sample_rate=1.0, total_entities=1_000_000, cost_per_check=0.0001)
    sample_cost = sampling_cost(sample_rate=0.01, total_entities=1_000_000, cost_per_check=0.0001)
    assert sample_cost < full_cost  # sampling trades completeness for a cost the platform can actually afford

    ten_x_full_cost = sampling_cost(sample_rate=1.0, total_entities=10_000_000, cost_per_check=0.0001)
    ten_x_sample_cost = sampling_cost(sample_rate=0.01, total_entities=10_000_000, cost_per_check=0.0001)
    assert ten_x_sample_cost < ten_x_full_cost  # the same sampling trade-off holds at ten times the feature count's entity volume
    assert ten_x_sample_cost == sample_cost * 10  # and its own cost still scales linearly with entity count

    assert backfill_row_cost(rows=1_000_000, cost_per_row=0.00005) > 0  # reconstructing history for a new feature is never free


if __name__ == "__main__":
    check()
    print("de.feature-platform-point-time: all checks passed")
