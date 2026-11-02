"""Lab for de.trade-off-articulation-decision.

Three simulations: a decision card with at least three alternatives and a
chosen one, an ADR chain where a reversed decision is superseded rather than
edited, and the 10x frame finding the first component that overflows.
"""

ALTERNATIVES = {
    "do_nothing": {"cost_per_thousand_orders": 0.0, "meets_slo": False},
    "single_broker_queue": {"cost_per_thousand_orders": 4.0, "meets_slo": True},
    "partitioned_log": {"cost_per_thousand_orders": 9.0, "meets_slo": True},
    "multi_region_log": {"cost_per_thousand_orders": 22.0, "meets_slo": True},
}


def decision_card(alternatives):
    """At least three alternatives, each with a decisive cost, including the
    option you don't like and 'do nothing'.
    """
    if len(alternatives) < 3:
        raise ValueError("a choice with fewer than three alternatives is not a decision")
    feasible = {name: a for name, a in alternatives.items() if a["meets_slo"]}
    chosen = min(feasible, key=lambda name: feasible[name]["cost_per_thousand_orders"])
    return {"alternatives": alternatives, "chosen": chosen, "feasible_count": len(feasible)}


def adr(number, title, context, decision, status, consequences, supersedes=None):
    return {
        "number": number,
        "title": title,
        "context": context,
        "decision": decision,
        "status": status,
        "consequences": consequences,
        "supersedes": supersedes,
        "change_our_mind": None,
    }


def with_change_our_mind(record, observation):
    """The field that turns a decision into a testable claim."""
    record = dict(record)
    record["change_our_mind"] = observation
    return record


def supersede(old_record, new_record):
    """A reversed decision keeps the old record around, marked superseded,
    rather than edited away.
    """
    old_superseded = dict(old_record)
    old_superseded["status"] = "superseded"
    new_record = dict(new_record)
    new_record["supersedes"] = old_record["number"]
    return old_superseded, new_record


COMPONENTS = {
    "ingest_api": {"capacity_units": 1_000},
    "partition_count": {"capacity_units": 2_000},
    "single_partition_consumer": {"capacity_units": 500},
    "warehouse_load": {"capacity_units": 1_500},
}


def ten_x_frame(components, load_multiplier=10):
    """Redraw the pipeline with every arrow ten times thicker; find the
    first component that overflows.
    """
    overflowing = {name: c["capacity_units"] * load_multiplier for name, c in components.items()}
    first_to_overflow = min(components, key=lambda name: components[name]["capacity_units"])
    return {"scaled": overflowing, "first_to_overflow": first_to_overflow}


SESSION_BLOCKS_MINUTES = {
    "requirements": 7,
    "high_level": 10,
    "deep_dives": 20,
    "wrap_up": 5,
}


def session_budget_after_overrun(blocks, overrun_minutes, overrun_block="requirements"):
    """A fixed 45-minute budget forces an early overrun to come out of a
    later block.
    """
    total = sum(blocks.values())
    adjusted = dict(blocks)
    adjusted[overrun_block] += overrun_minutes
    remaining_blocks = [b for b in adjusted if b != overrun_block]
    deficit = overrun_minutes
    for name in reversed(remaining_blocks):
        taken = min(deficit, adjusted[name])
        adjusted[name] -= taken
        deficit -= taken
        if deficit <= 0:
            break
    return {"total": total, "adjusted": adjusted, "sum_adjusted": sum(adjusted.values())}


def check():
    card = decision_card(ALTERNATIVES)
    assert card["feasible_count"] == 3  # do_nothing fails the SLO
    assert card["chosen"] == "single_broker_queue"  # cheapest feasible option

    try:
        decision_card({"a": ALTERNATIVES["do_nothing"], "b": ALTERNATIVES["single_broker_queue"]})
        assert False, "should have rejected fewer than three alternatives"
    except ValueError:
        pass

    record_1 = adr(1, "Use a partitioned log", "late data and replay needs", "We will use a partitioned log.", "accepted", ["higher ops cost", "replay supported"])
    record_1 = with_change_our_mind(record_1, "late data exceeds five percent of volume")
    assert record_1["change_our_mind"] is not None

    record_2 = adr(2, "Use a multi-region log", "region-loss RPO requirement", "We will use a multi-region log.", "proposed", ["higher cost", "lower RPO"])
    old, new = supersede(record_1, record_2)
    assert old["status"] == "superseded"
    assert new["supersedes"] == 1

    frame = ten_x_frame(COMPONENTS)
    assert frame["first_to_overflow"] == "single_partition_consumer"

    budget = session_budget_after_overrun(SESSION_BLOCKS_MINUTES, overrun_minutes=5)
    assert budget["sum_adjusted"] == budget["total"]
    assert budget["adjusted"]["wrap_up"] < SESSION_BLOCKS_MINUTES["wrap_up"]


if __name__ == "__main__":
    check()
    print("de.trade-off-articulation-decision: all checks passed")
