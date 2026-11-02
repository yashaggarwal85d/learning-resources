"""Lab for de.lambda-vs-kappa-one.

The two-path simulation on a synthetic stream with a planted edge-case
difference, the reprocessing-cost crossover, and the threshold
calculations are this topic's executable evidence.
"""


REFUND_EVENTS = [
    {"product": "p1", "amount": 10.0, "after_midnight": False},
    {"product": "p1", "amount": 5.0, "after_midnight": True},
    {"product": "p2", "amount": 20.0, "after_midnight": False},
]


def kappa_revenue(events):
    """The streaming path applies every refund the moment it's seen,
    regardless of when it landed.
    """
    totals = {}
    for e in events:
        totals[e["product"]] = totals.get(e["product"], 0) - e["amount"]
    return totals


def lambda_batch_revenue(events):
    """The planted edge case: the batch job's own rule treats a
    post-midnight refund as belonging to the next day's batch, so it's
    excluded from this run's totals.
    """
    totals = {}
    for e in events:
        if e["after_midnight"]:
            continue
        totals[e["product"]] = totals.get(e["product"], 0) - e["amount"]
    return totals


def dual_logic_discrepancy(kappa_totals, lambda_totals):
    """The measured gap between the two paths, per product."""
    products = set(kappa_totals) | set(lambda_totals)
    return {p: kappa_totals.get(p, 0) - lambda_totals.get(p, 0) for p in products if kappa_totals.get(p, 0) != lambda_totals.get(p, 0)}


def kappa_reprocessing_cost(retention_days, replay_throughput_cost_per_day):
    """Kappa replays the retained log through the streaming engine; cost
    grows with how much of the log must replay.
    """
    return retention_days * replay_throughput_cost_per_day


def lambda_reprocessing_cost(bulk_compute_cost_flat):
    """Lambda re-runs the cheap batch layer over the lake — a flat cost
    independent of how much of the stream's own log is retained.
    """
    return bulk_compute_cost_flat


def reprocessing_crossover_days(replay_throughput_cost_per_day, bulk_compute_cost_flat):
    """The retention length at which Kappa's replay cost equals Lambda's
    flat batch cost.
    """
    if replay_throughput_cost_per_day <= 0:
        return None
    return bulk_compute_cost_flat / replay_throughput_cost_per_day


BATCH_LAYER_THRESHOLDS = {
    "billing_grade_late_data_days": 7,
    "reprocessing_volume_days": 90,
    "huge_dimension_join": True,
    "compliance_restatement": True,
}


def batch_layer_earns_its_place(late_data_tail_days, reprocessing_volume_days, needs_huge_dimension_join, is_compliance_restatement):
    """Any one of the four named conditions, met against the shop's own
    thresholds, justifies keeping the batch layer.
    """
    if late_data_tail_days > BATCH_LAYER_THRESHOLDS["billing_grade_late_data_days"]:
        return True
    if reprocessing_volume_days > BATCH_LAYER_THRESHOLDS["reprocessing_volume_days"]:
        return True
    if needs_huge_dimension_join:
        return True
    if is_compliance_restatement:
        return True
    return False


def check():
    kappa_totals = kappa_revenue(REFUND_EVENTS)
    lambda_totals = lambda_batch_revenue(REFUND_EVENTS)
    assert kappa_totals["p1"] == -15.0
    assert lambda_totals["p1"] == -10.0  # the batch job excluded the after-midnight refund

    discrepancy = dual_logic_discrepancy(kappa_totals, lambda_totals)
    assert discrepancy == {"p1": -5.0}  # exactly the planted edge case, nothing else diverges

    short_retention_cost = kappa_reprocessing_cost(retention_days=7, replay_throughput_cost_per_day=50.0)
    long_retention_cost = kappa_reprocessing_cost(retention_days=365, replay_throughput_cost_per_day=50.0)
    batch_cost = lambda_reprocessing_cost(bulk_compute_cost_flat=2_000.0)
    assert short_retention_cost < batch_cost
    assert long_retention_cost > batch_cost

    crossover = reprocessing_crossover_days(replay_throughput_cost_per_day=50.0, bulk_compute_cost_flat=2_000.0)
    assert crossover == 40  # below 40 days of retention, Kappa's replay is cheaper

    stays_for_late_data = batch_layer_earns_its_place(late_data_tail_days=10, reprocessing_volume_days=5, needs_huge_dimension_join=False, is_compliance_restatement=False)
    stays_for_dimension_join = batch_layer_earns_its_place(late_data_tail_days=1, reprocessing_volume_days=5, needs_huge_dimension_join=True, is_compliance_restatement=False)
    goes_pure_kappa = batch_layer_earns_its_place(late_data_tail_days=1, reprocessing_volume_days=5, needs_huge_dimension_join=False, is_compliance_restatement=False)
    assert stays_for_late_data is True
    assert stays_for_dimension_join is True
    assert goes_pure_kappa is False  # none of the four conditions are met


if __name__ == "__main__":
    check()
    print("de.lambda-vs-kappa-one: all checks passed")
