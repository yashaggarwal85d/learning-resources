"""Lab for de.correctness-under-replay-late.

Two simulations: a non-deterministic transform that produces a different
output on replay (and its deterministic fix), and a correction window sized
from a stated late-data rate.
"""

ORDERS = [
    {"id": 1, "amount": 100},
    {"id": 2, "amount": 250},
    {"id": 3, "amount": 75},
]


def non_deterministic_revenue_transform(orders, _now_seconds):
    """Bug: a hidden 'now()' nudges the total by a tiny, time-dependent
    amount — the same input produces a different output depending on when
    the job happens to run.
    """
    hidden_time_based_jitter = (_now_seconds % 7) * 0.01
    return sum(o["amount"] for o in orders) + hidden_time_based_jitter


def deterministic_revenue_transform(orders):
    """Fix: the output depends only on the input, never on wall-clock time."""
    return sum(o["amount"] for o in orders)


def idempotent_write(table, key, value):
    """A write keyed so repeating it has no further effect."""
    table[key] = value
    return table


def replay_is_trustworthy(orders):
    """Replay the deterministic transform twice: identical output, identical
    write, each time — a trustworthy re-run.
    """
    run_1 = deterministic_revenue_transform(orders)
    run_2 = deterministic_revenue_transform(orders)

    table = {}
    idempotent_write(table, "last_tuesday_revenue", run_1)
    idempotent_write(table, "last_tuesday_revenue", run_2)

    return {"run_1": run_1, "run_2": run_2, "runs_agree": run_1 == run_2, "final_table": table}


LATE_DATA_RATE = 0.02  # the shop's own measured lab number: 2% of events arrive late
EVENTS_PER_WINDOW_UNIT = 10_000  # events held in state per unit of window width


def size_correction_window(target_captured_fraction=0.95):
    """How wide (in window-width units) the correction window must be to
    capture the target fraction of late events, and what that costs in held
    state.
    """
    width_units = 1
    captured_fraction = 0.0
    while captured_fraction < target_captured_fraction:
        captured_fraction = 1 - (1 - LATE_DATA_RATE) ** width_units
        if captured_fraction < target_captured_fraction:
            width_units += 1

    state_cost_events = width_units * EVENTS_PER_WINDOW_UNIT
    return {
        "width_units": width_units,
        "captured_fraction": captured_fraction,
        "state_cost_events": state_cost_events,
    }


def late_event_without_correction_window():
    """A late event arriving behind the watermark, with no correction
    window at all: it's simply dropped, and the published result is never
    amended.
    """
    published_result_v1 = deterministic_revenue_transform(ORDERS)
    late_event = {"id": 4, "amount": 40}
    # No correction path: the late event never reaches the published result.
    published_result_final = published_result_v1
    return {
        "published_v1": published_result_v1,
        "late_event_amount": late_event["amount"],
        "published_final": published_result_final,
        "late_event_was_dropped": published_result_final == published_result_v1,
    }


def late_event_with_correction_window():
    """The same late event, this time inside a correction window: the
    published result is amended with a new version.
    """
    published_result_v1 = deterministic_revenue_transform(ORDERS)
    late_event = {"id": 4, "amount": 40}
    published_result_v2 = published_result_v1 + late_event["amount"]
    return {
        "published_v1": published_result_v1,
        "published_v2": published_result_v2,
        "amended": published_result_v2 != published_result_v1,
    }


def check():
    r1 = non_deterministic_revenue_transform(ORDERS, _now_seconds=3)
    r2 = non_deterministic_revenue_transform(ORDERS, _now_seconds=9)
    assert r1 != r2  # same input, two different outputs: the bug

    trustworthy = replay_is_trustworthy(ORDERS)
    assert trustworthy["runs_agree"]

    window = size_correction_window()
    assert window["captured_fraction"] >= 0.95
    assert window["state_cost_events"] > 0

    dropped = late_event_without_correction_window()
    assert dropped["late_event_was_dropped"]

    amended = late_event_with_correction_window()
    assert amended["amended"]


if __name__ == "__main__":
    check()
    print("de.correctness-under-replay-late: all checks passed")
