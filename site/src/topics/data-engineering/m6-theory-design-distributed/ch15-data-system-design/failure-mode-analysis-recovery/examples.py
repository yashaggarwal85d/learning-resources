"""Lab for de.failure-mode-analysis-recovery.

Two simulations: a failure table filled in for a five-partition pipeline, and
a poison-record crash loop with and without a dead-letter path.
"""

PARTITIONS = 5


def averaged_dashboard_reading(stuck_partitions, total_partitions=PARTITIONS):
    """What a dashboard averaged across every partition reports, even while
    one partition is stuck.
    """
    healthy = total_partitions - stuck_partitions
    return healthy / total_partitions


def per_partition_lag_reading(stuck_partition_id, crash_loop_restarts):
    """What the one stuck partition's own lag metric reports: a real,
    growing number, not hidden by the average.
    """
    return {"partition": stuck_partition_id, "unprocessed_restarts": crash_loop_restarts}


def failure_table_row(name, blast_radius, detection, recovery, data_lost, time_to_recover):
    return {
        "failure": name,
        "blast_radius": blast_radius,
        "detection": detection,
        "recovery": recovery,
        "data_lost": data_lost,
        "time_to_recover": time_to_recover,
    }


def failure_table_without_dead_letter_queue():
    """The poison-record row as it stands with no dead-letter path: every
    column fills in except recovery, which stays empty.
    """
    return failure_table_row(
        name="poison record crash-loops one partition",
        blast_radius="one partition's worth of orders",
        detection="per-partition lag metric only; the averaged dashboard never shows it",
        recovery=None,
        data_lost="none yet, but growing the longer it sits undetected",
        time_to_recover="unbounded — stops only when a human happens to notice",
    )


def failure_table_with_dead_letter_queue():
    """The same failure, this time with a dead-letter queue: the recovery
    column is no longer empty.
    """
    return failure_table_row(
        name="poison record crash-loops one partition",
        blast_radius="one partition's worth of orders",
        detection="per-partition lag metric, and a dead-letter queue depth alert",
        recovery="record routed to the dead-letter queue; partition resumes on the next record",
        data_lost="none — the poisoned record is held, not dropped",
        time_to_recover="one processing cycle",
    )


def rows_with_empty_recovery(table_rows):
    """Find every failure-table row with no recovery path — the finding a
    failure table is built to surface.
    """
    return [row for row in table_rows if row["recovery"] is None]


DATA_CLASSES = {
    "orders": {"rpo_seconds": 0, "rto_seconds": 300},
    "clickstream": {"rpo_seconds": 3600, "rto_seconds": 3600},
    "audit_log": {"rpo_seconds": 0, "rto_seconds": 60},
}

COST_PER_RPO_SECOND_SAVED = 4.0
COST_PER_RTO_SECOND_SAVED = 1.0
LOOSEST_RPO_SECONDS = 3600
LOOSEST_RTO_SECONDS = 3600


def price_data_class(data_class):
    budget = DATA_CLASSES[data_class]
    rpo_seconds_saved = LOOSEST_RPO_SECONDS - budget["rpo_seconds"]
    rto_seconds_saved = LOOSEST_RTO_SECONDS - budget["rto_seconds"]
    return {
        "data_class": data_class,
        "rpo_cost": rpo_seconds_saved * COST_PER_RPO_SECOND_SAVED,
        "rto_cost": rto_seconds_saved * COST_PER_RTO_SECOND_SAVED,
    }


def degraded_mode_dead_letter_queue():
    """Keeps every record; gives up immediate processing of the poisoned
    ones.
    """
    return {"mode": "dead_letter_queue", "keeps": "every record", "gives_up": "immediate processing of poisoned records"}


def degraded_mode_freshness_flag():
    """Keeps serving; gives up strict freshness."""
    return {"mode": "freshness_flag", "keeps": "serving under overload", "gives_up": "strict freshness"}


def check():
    dashboard = averaged_dashboard_reading(stuck_partitions=1)
    assert dashboard == 0.8  # 4 of 5 partitions healthy, but one is stuck

    lag = per_partition_lag_reading(stuck_partition_id=3, crash_loop_restarts=40)
    assert lag["unprocessed_restarts"] > 0

    without_dlq = failure_table_without_dead_letter_queue()
    with_dlq = failure_table_with_dead_letter_queue()
    gaps = rows_with_empty_recovery([without_dlq, with_dlq])
    assert len(gaps) == 1
    assert gaps[0]["failure"] == without_dlq["failure"]

    orders_price = price_data_class("orders")
    audit_price = price_data_class("audit_log")
    clickstream_price = price_data_class("clickstream")
    assert orders_price["rpo_cost"] > clickstream_price["rpo_cost"]
    assert audit_price["rto_cost"] > clickstream_price["rto_cost"]

    dlq_mode = degraded_mode_dead_letter_queue()
    freshness_mode = degraded_mode_freshness_flag()
    assert dlq_mode["gives_up"] != freshness_mode["gives_up"]


if __name__ == "__main__":
    check()
    print("de.failure-mode-analysis-recovery: all checks passed")
