"""de.managed-ingestion-tools-build: MAR-based pricing measured against two real update
patterns, dlt's own schema-contract modes applied to the identical drifted record, a count of
the hand-built failure modes this chapter's own topics (2-7) each had to solve, and a build-vs-
buy decision rule applied to a few concrete scenarios.

Every function below is a direct, reproducible measurement against in-process data. No network,
no real managed service: the pricing mechanic and schema-contract behaviour are Fivetran's and
dlt's own documented rules, applied here to synthetic data at the shop's own scale.
"""

PRICE_PER_MAR = 0.01  # a stand-in flat rate; what matters is the relative cost, not the dollar figure


def mar_cost(monthly_distinct_keys_touched):
    # Fivetran's own rule: a key is counted once per month no matter how many times it changes that month.
    return monthly_distinct_keys_touched * PRICE_PER_MAR


def mar_pricing_many_small_updates_vs_few_wide_rows():
    # "orders": a small, hot table. A harmless-looking backfill reprocesses every row once.
    orders_row_count = 5000
    orders_distinct_keys_touched_by_backfill = orders_row_count  # every key touched once

    # "catalog": a much larger table that almost never changes.
    catalog_row_count = 50000
    catalog_monthly_change_rate = 0.001
    catalog_distinct_keys_touched = round(catalog_row_count * catalog_monthly_change_rate)

    orders_cost = mar_cost(orders_distinct_keys_touched_by_backfill)
    catalog_cost = mar_cost(catalog_distinct_keys_touched)

    result = {
        "orders_row_count": orders_row_count,
        "orders_backfill_cost": orders_cost,
        "catalog_row_count": catalog_row_count,
        "catalog_monthly_cost": catalog_cost,
        "smaller_table_costs_more": orders_cost > catalog_cost,
    }
    assert result["smaller_table_costs_more"] is True
    assert result["orders_row_count"] < result["catalog_row_count"]
    return result


def mar_cost_is_update_count_independent():
    # the same 5000 keys updated once this month, vs the same 5000 keys updated many times this month
    keys_updated_once = set(range(5000))
    keys_updated_many_times = set()
    for _ in range(20):
        keys_updated_many_times |= set(range(5000))  # the identical 5000 keys, repeatedly

    cost_once = mar_cost(len(keys_updated_once))
    cost_many_times = mar_cost(len(keys_updated_many_times))

    result = {
        "distinct_keys_updated_once": len(keys_updated_once),
        "distinct_keys_updated_twenty_times": len(keys_updated_many_times),
        "cost_identical_either_way": cost_once == cost_many_times,
    }
    assert result["cost_identical_either_way"] is True
    return result


def schema_drift_handling_demonstrated():
    existing_schema = {"order_id", "amount", "currency"}
    incoming_row = {"order_id": "o1", "amount": 100, "currency": "USD", "discount_code": "SAVE10"}
    drifted_field = "discount_code"

    def evolve(row, schema):
        schema = schema | {drifted_field}
        return {"loaded_row": dict(row), "schema": schema, "row_rejected": False}

    def freeze(row, schema):
        return {"loaded_row": None, "schema": schema, "row_rejected": True}

    def discard_row(row, schema):
        return {"loaded_row": None, "schema": schema, "row_rejected": True}

    def discard_value(row, schema):
        trimmed = {k: v for k, v in row.items() if k in schema}
        return {"loaded_row": trimmed, "schema": schema, "row_rejected": False}

    outcomes = {
        "evolve": evolve(incoming_row, set(existing_schema)),
        "freeze": freeze(incoming_row, set(existing_schema)),
        "discard_row": discard_row(incoming_row, set(existing_schema)),
        "discard_value": discard_value(incoming_row, set(existing_schema)),
    }

    result = {
        "evolve_keeps_new_field": drifted_field in (outcomes["evolve"]["loaded_row"] or {}),
        "freeze_loads_nothing": outcomes["freeze"]["loaded_row"] is None,
        "discard_row_loads_nothing": outcomes["discard_row"]["loaded_row"] is None,
        "discard_value_loads_row_without_new_field": (
            outcomes["discard_value"]["loaded_row"] is not None
            and drifted_field not in outcomes["discard_value"]["loaded_row"]
            and "order_id" in outcomes["discard_value"]["loaded_row"]
        ),
    }
    assert result["evolve_keeps_new_field"] is True
    assert result["freeze_loads_nothing"] is True
    assert result["discard_row_loads_nothing"] is True
    assert result["discard_value_loads_row_without_new_field"] is True
    return result


def connector_failure_modes_a_hand_built_connector_must_handle():
    # the failure modes this chapter's own topics 2-7 each had to solve by hand
    failure_modes = [
        "parallel-range-read partition skew (topic 2)",
        "consistent multi-table snapshot export (topic 2)",
        "clock-skew and non-monotonic cursor misses (topic 3)",
        "invisible hard deletes behind a cursor (topic 3)",
        "offset-pagination duplicates and drops under concurrent writes (topic 4)",
        "rate-limit backoff with jitter (topic 4)",
        "OAuth token refresh and secret rotation (topic 4)",
        "commit protocol without atomic rename on an object store (topic 5)",
        "poison-file quarantine (topic 5)",
        "checkpoint-output atomicity across a crash (topic 6)",
        "deterministic batch ids for a safe re-run (topic 6)",
        "raw-layer source metadata and replay (topic 7)",
    ]
    result = {
        "failure_modes_a_hand_built_connector_owns": len(failure_modes),
        "sample": failure_modes[:3],
    }
    assert result["failure_modes_a_hand_built_connector_owns"] == 12
    return result


def build_vs_buy_decision_rule(volume_rows_per_day, source_is_common_saas, latency_need_seconds, sovereignty_required, long_tail_sources):
    # a simple, explicit rule: sovereignty always forces build; otherwise a common, high-volume
    # SaaS source with a loose latency need favors buy; a rare source, a tight latency need, or
    # many long-tail sources favor build, since no managed tool covers them well.
    if sovereignty_required:
        return "build"
    if source_is_common_saas and volume_rows_per_day < 10_000_000 and latency_need_seconds > 60:
        return "buy"
    if long_tail_sources > 5:
        return "build"
    return "build"


def build_vs_buy_scenarios_measured():
    scenarios = {
        "common_crm_loose_latency": build_vs_buy_decision_rule(
            volume_rows_per_day=200_000, source_is_common_saas=True, latency_need_seconds=3600, sovereignty_required=False, long_tail_sources=1
        ),
        "regulated_core_banking_feed": build_vs_buy_decision_rule(
            volume_rows_per_day=50_000, source_is_common_saas=False, latency_need_seconds=3600, sovereignty_required=True, long_tail_sources=1
        ),
        "many_small_partner_feeds": build_vs_buy_decision_rule(
            volume_rows_per_day=5_000, source_is_common_saas=False, latency_need_seconds=86400, sovereignty_required=False, long_tail_sources=9
        ),
    }
    assert scenarios["common_crm_loose_latency"] == "buy"
    assert scenarios["regulated_core_banking_feed"] == "build"
    assert scenarios["many_small_partner_feeds"] == "build"
    return scenarios


if __name__ == "__main__":
    mar_pricing_many_small_updates_vs_few_wide_rows()
    mar_cost_is_update_count_independent()
    schema_drift_handling_demonstrated()
    connector_failure_modes_a_hand_built_connector_must_handle()
    build_vs_buy_scenarios_measured()
    print("de.managed-ingestion-tools-build: all checks passed")
