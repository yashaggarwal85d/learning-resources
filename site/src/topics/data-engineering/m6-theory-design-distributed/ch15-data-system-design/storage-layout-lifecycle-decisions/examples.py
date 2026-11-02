"""Lab for de.storage-layout-lifecycle-decisions.

Two layouts of the same events table: partitioned by customer id (one file
per customer, spanning that customer's whole history) and partitioned by
date (one partition per day, several files inside it). The shop's own
dominant access path is a nightly revenue job that scans one day at a time.
"""

NUM_CUSTOMERS = 2_000_000
DAYS_RETAINED = 1000
FILES_PER_DATE_PARTITION = 20
ACTIVE_DAYS_PER_CUSTOMER = 180  # a typical customer's rows span this many distinct days


def customer_partitioned_layout():
    """One file per customer. The nightly revenue job (one day's rows) must
    open every customer's file, since each file spans that customer's whole
    history and might contain a row from today.
    """
    total_files = NUM_CUSTOMERS
    files_touched_by_daily_job = NUM_CUSTOMERS
    pruned_fraction = 1 - (files_touched_by_daily_job / total_files)
    return {
        "total_files": total_files,
        "files_touched_by_daily_job": files_touched_by_daily_job,
        "pruned_fraction": pruned_fraction,
    }


def date_partitioned_layout():
    """One partition per day, a handful of files inside it. The nightly
    revenue job only ever opens one day's partition.
    """
    total_files = DAYS_RETAINED * FILES_PER_DATE_PARTITION
    files_touched_by_daily_job = FILES_PER_DATE_PARTITION
    pruned_fraction = 1 - (files_touched_by_daily_job / total_files)
    return {
        "total_files": total_files,
        "files_touched_by_daily_job": files_touched_by_daily_job,
        "pruned_fraction": pruned_fraction,
    }


def erasure_cost_in_partitions_touched():
    """How many files/partitions a single customer's deletion request must
    touch, under each layout.
    """
    return {
        "customer_partitioned": 1,  # that customer's one file
        "date_partitioned": ACTIVE_DAYS_PER_CUSTOMER,  # scattered across every active day
    }


TIERS = {
    "hot": {"retention_days": 30, "storage": "fast, expensive"},
    "warm": {"retention_days": 180, "storage": "cheaper, slower"},
    "cold": {"retention_days": DAYS_RETAINED, "storage": "archival"},
}


def session_id_layout_access_pattern():
    """The 'prove it' scenario: a session-logs table whose dominant access
    path is a point lookup by session id, not a date range.
    """
    sessions_per_customer = ACTIVE_DAYS_PER_CUSTOMER  # one session-ish per active day, illustratively
    return {
        "dominant_access_path": "point lookup by session id",
        "correct_partition_key": "session id",
        "erasure_still_scattered_if_partitioned_by": "date",
        "sessions_per_customer": sessions_per_customer,
    }


def check():
    customer_layout = customer_partitioned_layout()
    date_layout = date_partitioned_layout()

    assert customer_layout["pruned_fraction"] == 0.0
    assert date_layout["pruned_fraction"] > 0.98

    erasure = erasure_cost_in_partitions_touched()
    assert erasure["customer_partitioned"] < erasure["date_partitioned"]
    assert erasure["date_partitioned"] == ACTIVE_DAYS_PER_CUSTOMER

    assert TIERS["hot"]["retention_days"] < TIERS["warm"]["retention_days"] < TIERS["cold"]["retention_days"]

    prove_it = session_id_layout_access_pattern()
    assert prove_it["correct_partition_key"] == "session id"


if __name__ == "__main__":
    check()
    print("de.storage-layout-lifecycle-decisions: all checks passed")
