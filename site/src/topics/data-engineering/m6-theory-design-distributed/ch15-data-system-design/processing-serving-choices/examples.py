"""Lab for de.processing-serving-choices.

The amplification ledger: three fixes for the shop's slow dashboard query,
each compared not by its logical data volume but by how many physical bytes
actually get moved to serve it — replication, compaction and a full
nightly rewrite all count.
"""

BASE_TABLE_LOGICAL_BYTES = 50_000_000  # the order facts the dashboard query reads from
AGGREGATE_LOGICAL_BYTES = 2_000_000  # the small, pre-aggregated table the dashboard could read instead
REPLICATION_FACTOR = 3


def real_time_olap_option():
    """Move the query to a real-time OLAP store: it ingests the base table's
    own data continuously, paying replication and its own compaction.
    """
    compaction_multiplier = 2.0
    physical_bytes = BASE_TABLE_LOGICAL_BYTES * REPLICATION_FACTOR * compaction_multiplier
    served_logical_bytes = BASE_TABLE_LOGICAL_BYTES
    return {
        "physical_bytes": physical_bytes,
        "served_logical_bytes": served_logical_bytes,
        "amplification_factor": physical_bytes / served_logical_bytes,
    }


def clustering_key_option():
    """Leave the query where it is, add a clustering key: a small index
    maintenance overhead on top of the base table's own replication.
    """
    index_maintenance_multiplier = 1.3
    physical_bytes = BASE_TABLE_LOGICAL_BYTES * REPLICATION_FACTOR * index_maintenance_multiplier
    served_logical_bytes = BASE_TABLE_LOGICAL_BYTES
    return {
        "physical_bytes": physical_bytes,
        "served_logical_bytes": served_logical_bytes,
        "amplification_factor": physical_bytes / served_logical_bytes,
    }


def pre_aggregated_table_option():
    """Build a nightly pre-aggregated table: the aggregate itself is tiny,
    but rebuilding it from scratch means scanning the entire base table
    every single night.
    """
    nightly_rewrite_scan_bytes = BASE_TABLE_LOGICAL_BYTES
    physical_bytes = (nightly_rewrite_scan_bytes + AGGREGATE_LOGICAL_BYTES) * REPLICATION_FACTOR
    served_logical_bytes = AGGREGATE_LOGICAL_BYTES  # what the dashboard actually reads
    return {
        "physical_bytes": physical_bytes,
        "served_logical_bytes": served_logical_bytes,
        "amplification_factor": physical_bytes / served_logical_bytes,
    }


def amplification_ledger():
    return {
        "real_time_olap": real_time_olap_option(),
        "clustering_key": clustering_key_option(),
        "pre_aggregated_table": pre_aggregated_table_option(),
    }


def new_breakdown_tomorrow():
    """The 'prove it' scenario: executives ask for a new breakdown tomorrow.
    The clustering-key option computes any breakdown on demand, at the same
    cost structure already in the ledger. The pre-aggregated table's
    grouping key is fixed, so a new breakdown needs the same full-table
    rewrite all over again, from a new grouping key.
    """
    clustering_key_cost_unchanged = clustering_key_option()
    pre_aggregated_table_needs_full_rebuild = pre_aggregated_table_option()
    return {
        "clustering_key_survives_unchanged": clustering_key_cost_unchanged,
        "pre_aggregated_table_must_rebuild": pre_aggregated_table_needs_full_rebuild,
    }


def check():
    ledger = amplification_ledger()
    factors = {name: opt["amplification_factor"] for name, opt in ledger.items()}

    assert factors["pre_aggregated_table"] == max(factors.values())
    assert factors["pre_aggregated_table"] > 10 * factors["clustering_key"]
    assert factors["clustering_key"] < factors["real_time_olap"]

    prove_it = new_breakdown_tomorrow()
    assert prove_it["clustering_key_survives_unchanged"] == clustering_key_option()
    assert prove_it["pre_aggregated_table_must_rebuild"]["physical_bytes"] > 0


if __name__ == "__main__":
    check()
    print("de.processing-serving-choices: all checks passed")
