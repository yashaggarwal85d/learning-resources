"""Lab for de.e-commerce-warehouse-incremental.

The full-versus-incremental cost crossover, computed from the shop's
constants and a measured merge cost, is this topic's executable evidence,
alongside the three silent-failure guards: a deleted source row, a
late-arriving dimension, and an unmerged duplicate.
"""


def full_refresh_cost(table_size, cost_per_row_scanned):
    """A full refresh costs scan and compute proportional to the table's
    entire size, every run.
    """
    return table_size * cost_per_row_scanned


def incremental_refresh_cost(table_size, daily_change_rate, cost_per_row_merged, fixed_overhead):
    """An incremental refresh costs proportional to the change, plus a
    fixed overhead the full refresh doesn't pay.
    """
    changed_rows = table_size * daily_change_rate
    return changed_rows * cost_per_row_merged + fixed_overhead


def crossover_table_size(daily_change_rate, cost_per_row_scanned, cost_per_row_merged, fixed_overhead):
    """The table size at which incremental and full-refresh cost the same —
    below it, the fixed overhead makes full refresh cheaper; above it,
    incremental wins.
    """
    denominator = cost_per_row_scanned - (daily_change_rate * cost_per_row_merged)
    if denominator <= 0:
        return None  # incremental never wins at this change rate
    return fixed_overhead / denominator


def which_wins(table_size, daily_change_rate, cost_per_row_scanned, cost_per_row_merged, fixed_overhead):
    full = full_refresh_cost(table_size, cost_per_row_scanned)
    incr = incremental_refresh_cost(table_size, daily_change_rate, cost_per_row_merged, fixed_overhead)
    return "incremental" if incr < full else "full"


SOURCE_ORDERS = {"ord_1", "ord_2", "ord_3", "ord_4"}


def incremental_extract(source_rows, changed_since_watermark):
    """A plain incremental extract pulls only changed-or-new rows — it
    never asks what's missing from the source.
    """
    return {row for row in source_rows if row in changed_since_watermark}


def deleted_source_row_gap(warehouse_rows, current_source_rows):
    """A deleted source row is invisible to a plain incremental extract
    unless the design is told to look for one (MERGE's own WHEN NOT
    MATCHED BY SOURCE clause).
    """
    return warehouse_rows - current_source_rows


def merge_with_delete_guard(warehouse_rows, current_source_rows, changed_rows):
    """The guard: delete any warehouse row with no matching source row,
    exactly WHEN NOT MATCHED BY SOURCE.
    """
    kept = warehouse_rows & current_source_rows
    return kept | changed_rows


def land_fact_with_inferred_dimension(fact, known_dimension_keys, inferred_key="unknown"):
    """A fact arriving before its dimension gets an inferred placeholder
    key rather than being dropped or blocked.
    """
    fact = dict(fact)
    if fact["customer_key"] not in known_dimension_keys:
        fact["customer_key"] = inferred_key
        fact["dimension_inferred"] = True
    else:
        fact["dimension_inferred"] = False
    return fact


def merge_by_unique_key(existing_rows, incoming_rows, unique_key):
    """Without a unique key, an incremental load degrades to append-only
    and silently duplicates; with one, a changed row replaces its old
    version instead.
    """
    by_key = {row[unique_key]: row for row in existing_rows}
    for row in incoming_rows:
        by_key[row[unique_key]] = row
    return list(by_key.values())


def check():
    assert crossover_table_size(daily_change_rate=0.05, cost_per_row_scanned=1.0, cost_per_row_merged=3.0, fixed_overhead=10_000) == 10_000 / (1.0 - 0.15)

    small_table = which_wins(table_size=1_000, daily_change_rate=0.05, cost_per_row_scanned=1.0, cost_per_row_merged=3.0, fixed_overhead=10_000)
    large_table = which_wins(table_size=1_000_000, daily_change_rate=0.05, cost_per_row_scanned=1.0, cost_per_row_merged=3.0, fixed_overhead=10_000)
    assert small_table == "full"
    assert large_table == "incremental"

    extract = incremental_extract(SOURCE_ORDERS, changed_since_watermark={"ord_2", "ord_4"})
    assert extract == {"ord_2", "ord_4"}

    warehouse = {"ord_1", "ord_2", "ord_3", "ord_4"}
    current_source = {"ord_1", "ord_2", "ord_4"}  # ord_3 was cancelled and removed at the source
    gap = deleted_source_row_gap(warehouse, current_source)
    assert gap == {"ord_3"}  # invisible to a plain incremental extract

    repaired = merge_with_delete_guard(warehouse, current_source, changed_rows={"ord_2", "ord_4"})
    assert "ord_3" not in repaired  # the guard closes the gap

    late_fact = {"order_id": "ord_5", "customer_key": "cust_99"}
    landed = land_fact_with_inferred_dimension(late_fact, known_dimension_keys={"cust_1", "cust_2"})
    assert landed["customer_key"] == "unknown"
    assert landed["dimension_inferred"] is True

    on_time_fact = {"order_id": "ord_6", "customer_key": "cust_1"}
    landed_on_time = land_fact_with_inferred_dimension(on_time_fact, known_dimension_keys={"cust_1", "cust_2"})
    assert landed_on_time["dimension_inferred"] is False

    existing = [{"id": "cust_1", "phone": "555-0100"}]
    incoming = [{"id": "cust_1", "phone": "555-0101"}]  # same customer, corrected phone
    merged = merge_by_unique_key(existing, incoming, unique_key="id")
    assert len(merged) == 1  # replaced, not duplicated
    assert merged[0]["phone"] == "555-0101"


if __name__ == "__main__":
    check()
    print("de.e-commerce-warehouse-incremental: all checks passed")
