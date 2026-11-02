"""Lab for de.choosing-data-flow-shape.

The decision card: four data-flow shapes, each with a latency floor (the
fastest it can ever deliver a fresh result) and a relative cost rank (1 =
cheapest to run, 4 = most expensive). A shape "clears" a freshness SLO when
its floor is at or below the SLO. Among the shapes that clear, the cheapest
one wins — unless a reprocessing-cost question flips it (topic's own
narrative point, not modeled numerically here).

Floors are illustrative, not vendor-measured figures: they model only the
*shape* of the decision (batch is slow and cheap, streaming is fast and
costly, hybrid pays a coordination tax on top of streaming's own cost).
"""

DECISION_CARD = {
    "batch": {"latency_floor_minutes": 60.0, "cost_rank": 1},
    "micro_batch": {"latency_floor_minutes": 5.0, "cost_rank": 2},
    "streaming": {"latency_floor_minutes": 0.05, "cost_rank": 3},
    "hybrid": {"latency_floor_minutes": 1.0, "cost_rank": 4},
}


def shapes_clearing_slo(slo_minutes):
    """Names of shapes whose latency floor is at or below the given SLO."""
    return sorted(
        name
        for name, shape in DECISION_CARD.items()
        if shape["latency_floor_minutes"] <= slo_minutes
    )


def cheapest_clearing_shape(slo_minutes):
    """Of the shapes that clear the SLO, the one with the lowest cost rank."""
    survivors = shapes_clearing_slo(slo_minutes)
    if not survivors:
        return None
    return min(survivors, key=lambda name: DECISION_CARD[name]["cost_rank"])


def tighten_slo_to_fraud_review():
    """The chapter's 'prove it' scenario: the shop's freshness SLO tightens
    from fifteen minutes to thirty seconds for a new fraud-review ask.
    Returns the surviving shapes and the cheapest among them.
    """
    original_slo_minutes = 15.0
    tightened_slo_minutes = 0.5  # thirty seconds

    before = shapes_clearing_slo(original_slo_minutes)
    after = shapes_clearing_slo(tightened_slo_minutes)
    return {
        "before_slo_minutes": original_slo_minutes,
        "before_survivors": before,
        "before_cheapest": cheapest_clearing_shape(original_slo_minutes),
        "after_slo_minutes": tightened_slo_minutes,
        "after_survivors": after,
        "after_cheapest": cheapest_clearing_shape(tightened_slo_minutes),
    }


def pulled_source_silence_is_indistinguishable_from_idle(rows_pulled_today):
    """A pulled source that goes silent returns zero rows today — exactly
    the same shape of result as a genuinely quiet business day. Only a
    freshness alert (elapsed time since last successful pull), not the pull
    job's own exit code, can tell the two apart.
    """
    pull_succeeded = True  # the job itself reports success either way
    return {
        "rows_pulled": rows_pulled_today,
        "pull_job_reported_success": pull_succeeded,
        "looks_like_an_error": False,
    }


def check():
    fifteen_min_survivors = shapes_clearing_slo(15.0)
    assert fifteen_min_survivors == ["hybrid", "micro_batch", "streaming"]
    assert cheapest_clearing_shape(15.0) == "micro_batch"
    assert shapes_clearing_slo(60.0) == [
        "batch",
        "hybrid",
        "micro_batch",
        "streaming",
    ]

    prove_it = tighten_slo_to_fraud_review()
    assert prove_it["before_cheapest"] == "micro_batch"
    assert prove_it["after_survivors"] == ["streaming"]
    assert prove_it["after_cheapest"] == "streaming"

    silent_pull = pulled_source_silence_is_indistinguishable_from_idle(0)
    quiet_day = pulled_source_silence_is_indistinguishable_from_idle(0)
    assert silent_pull == quiet_day


if __name__ == "__main__":
    check()
    print("de.choosing-data-flow-shape: all checks passed")
