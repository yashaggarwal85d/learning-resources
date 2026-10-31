"""Lab for de.multi-region-analytical-platform.

The egress estimate for replicating rows versus aggregates (with AWS's
own dated per-GB price) and the failover completeness checklist are
this topic's executable evidence.
"""


# AWS's own stated price, Europe (Ireland) data transfer out to internet,
# fetched 2026-10-31 — see SOURCES.md. Used here as a representative,
# dated per-GB egress rate; the shop's own volumes below are illustrative.
EGRESS_PRICE_PER_GB = 0.09

SHOP_EVENTS_GB_PER_DAY = 400.0
SHOP_AGGREGATES_GB_PER_DAY = 2.0


def daily_egress_cost(gb_per_day, price_per_gb=EGRESS_PRICE_PER_GB):
    """Replicating a dataset every day costs its size times the egress
    rate, every day, for as long as replication runs.
    """
    return gb_per_day * price_per_gb


def federated_query_cost(queries_per_day, gb_scanned_per_query, price_per_gb=EGRESS_PRICE_PER_GB):
    """Federation moves no standing data, but every query still returns
    its own result set across the border.
    """
    return queries_per_day * gb_scanned_per_query * price_per_gb


def replicate_vs_federate(gb_per_day, queries_per_day, gb_scanned_per_query):
    """The decision card: replication's daily recurring cost against
    federation's per-query cost, for the same dataset.
    """
    replicate_cost = daily_egress_cost(gb_per_day)
    federate_cost = federated_query_cost(queries_per_day, gb_scanned_per_query)
    return {
        "replicate_daily_cost": replicate_cost,
        "federate_daily_cost": federate_cost,
        "cheaper": "federate" if federate_cost < replicate_cost else "replicate",
    }


FAILOVER_COMPONENTS = [
    "pipeline_offsets_checkpoints",
    "catalog_metadata_backup",
    "encryption_keys",
    "rpo_rto_per_class",
]


def failover_plan_is_complete(covered_components):
    """Bucket replication alone covers none of these four; a real
    failover plan must name all four by component, not assume the
    bucket covers them.
    """
    missing = [c for c in FAILOVER_COMPONENTS if c not in covered_components]
    return len(missing) == 0, missing


def global_metric_freshness(regional_last_updated):
    """A global figure carries the freshness of its stalest region —
    the minimum, never the average, of the regions' own freshness.
    """
    return min(regional_last_updated.values())


def check():
    events_replication_cost = daily_egress_cost(SHOP_EVENTS_GB_PER_DAY)
    aggregates_replication_cost = daily_egress_cost(SHOP_AGGREGATES_GB_PER_DAY)
    assert round(events_replication_cost, 2) == 36.0
    assert round(aggregates_replication_cost, 2) == 0.18
    assert aggregates_replication_cost < events_replication_cost  # replicating only the aggregate is far cheaper

    events_decision = replicate_vs_federate(SHOP_EVENTS_GB_PER_DAY, queries_per_day=20, gb_scanned_per_query=5.0)
    assert events_decision["cheaper"] == "federate"  # a few queries a day beats replicating the whole events table

    aggregates_decision = replicate_vs_federate(SHOP_AGGREGATES_GB_PER_DAY, queries_per_day=500, gb_scanned_per_query=0.5)
    assert aggregates_decision["cheaper"] == "replicate"  # heavy, frequent reads of a tiny aggregate beat per-query egress

    complete, missing = failover_plan_is_complete(["catalog_metadata_backup", "encryption_keys", "rpo_rto_per_class", "pipeline_offsets_checkpoints"])
    assert complete is True
    assert missing == []

    bucket_only, missing_from_bucket_only = failover_plan_is_complete([])
    assert bucket_only is False
    assert set(missing_from_bucket_only) == set(FAILOVER_COMPONENTS)  # bucket replication alone covers none of them

    global_freshness = global_metric_freshness({"eu": "2026-10-31T09:00:00Z", "us": "2026-10-31T08:40:00Z"})
    assert global_freshness == "2026-10-31T08:40:00Z"  # the stalest region's timestamp, not the newest


if __name__ == "__main__":
    check()
    print("de.multi-region-analytical-platform: all checks passed")
