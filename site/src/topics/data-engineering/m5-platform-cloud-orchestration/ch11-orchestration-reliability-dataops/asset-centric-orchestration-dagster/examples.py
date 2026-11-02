"""
Three real experiments against a live Dagster 1.13.28 install.

Experiment 1: the shop's three-stage orders pipeline as a real software-defined
asset graph, with an asset check attached directly to the middle asset,
materialized for real -- once with a bad row present (check fails), once
clean (check passes).

Experiment 2: lineage, asked for rather than hand-maintained -- Dagster's own
asset graph answers "what does this asset transitively depend on" with no
extra lineage tooling.

Experiment 3: the same pipeline expressed as an Airflow TaskFlow DAG instead
(see this topic's own written comparison file), with the explicit
dependency-wiring lines each version actually needs counted directly from
both files.
"""
from __future__ import annotations

import dagster as dg


@dg.asset
def raw_orders() -> list[dict]:
    return [
        {"order_id": 1, "amount": 100},
        {"order_id": 2, "amount": -50},
        {"order_id": 3, "amount": 75},
    ]


@dg.asset(deps=[raw_orders])
def stg_orders(raw_orders: list[dict]) -> list[dict]:
    return list(raw_orders)


@dg.asset_check(asset=stg_orders)
def no_negative_amounts(stg_orders: list[dict]) -> dg.AssetCheckResult:
    bad = [r for r in stg_orders if r["amount"] < 0]
    return dg.AssetCheckResult(passed=len(bad) == 0, metadata={"bad_rows": len(bad)})


@dg.asset(deps=[stg_orders])
def fct_orders(stg_orders: list[dict]) -> list[dict]:
    return [r for r in stg_orders if r["amount"] >= 0]


def materialize_with_a_bad_row() -> dict:
    """The pipeline above, run for real, with the planted bad row intact."""
    result = dg.materialize([raw_orders, stg_orders, fct_orders, no_negative_amounts])
    evaluations = {ev.check_name: ev for ev in result.get_asset_check_evaluations()}
    check = evaluations["no_negative_amounts"]
    out = {
        "run_succeeded": result.success,
        "check_passed": check.passed,
        "bad_rows": check.metadata["bad_rows"].value,
    }
    # Materializing still succeeds -- the check reports a failure, it doesn't
    # stop fct_orders from being computed in this minimal demo.
    assert out["run_succeeded"] is True, out
    assert out["check_passed"] is False, out
    assert out["bad_rows"] == 1, out
    return out


def materialize_with_the_row_fixed() -> dict:
    """The same three assets, same check, with the bad row's sign corrected."""

    @dg.asset
    def raw_orders_fixed() -> list[dict]:
        return [
            {"order_id": 1, "amount": 100},
            {"order_id": 2, "amount": 50},
            {"order_id": 3, "amount": 75},
        ]

    @dg.asset(deps=[raw_orders_fixed])
    def stg_orders_fixed(raw_orders_fixed: list[dict]) -> list[dict]:
        return list(raw_orders_fixed)

    @dg.asset_check(asset=stg_orders_fixed)
    def no_negative_amounts_fixed(stg_orders_fixed: list[dict]) -> dg.AssetCheckResult:
        bad = [r for r in stg_orders_fixed if r["amount"] < 0]
        return dg.AssetCheckResult(passed=len(bad) == 0, metadata={"bad_rows": len(bad)})

    result = dg.materialize([raw_orders_fixed, stg_orders_fixed, no_negative_amounts_fixed])
    evaluations = {ev.check_name: ev for ev in result.get_asset_check_evaluations()}
    check = evaluations["no_negative_amounts_fixed"]
    out = {"run_succeeded": result.success, "check_passed": check.passed}
    assert out["check_passed"] is True, out
    return out


def derive_lineage_with_no_extra_tooling() -> dict:
    """Ask the asset graph for fct_orders's own transitive upstream -- the
    declared dependencies are the lineage; nothing else computes it."""
    defs = dg.Definitions(
        assets=[raw_orders, stg_orders, fct_orders], asset_checks=[no_negative_amounts]
    )
    graph = defs.resolve_asset_graph()
    ancestors = graph.get_ancestor_asset_keys(dg.AssetKey("fct_orders"))
    result = {"fct_orders_transitive_upstream": sorted(k.to_user_string() for k in ancestors)}
    assert result["fct_orders_transitive_upstream"] == ["raw_orders", "stg_orders"], result
    return result


def count_dependency_wiring_lines() -> dict:
    """The same orders pipeline, expressed as a Dagster asset graph in this
    file's own code above vs. as an Airflow TaskFlow DAG in
    airflow_equivalent.py (this topic's folder). Counting the lines that
    actually wire one stage's output to the next stage's input."""
    import re
    from pathlib import Path

    this_file = Path(__file__)
    asset_graph_lines = this_file.read_text().splitlines()
    asset_wiring = [
        ln for ln in asset_graph_lines
        if re.search(r"^@dg\.(asset\(deps=\[|asset_check\(asset=)", ln)
    ]

    airflow_file = this_file.with_name("airflow_equivalent.py")
    airflow_lines = airflow_file.read_text().splitlines()
    airflow_wiring = [
        ln for ln in airflow_lines
        if re.search(r"^\s*(raw|staged|checked)\s*=|load_fact_orders\(staged,\s*checked\)", ln)
    ]

    result = {
        "asset_graph_wiring_lines": len(asset_wiring),
        "airflow_taskflow_wiring_lines": len(airflow_wiring),
    }
    assert result["asset_graph_wiring_lines"] == 3, result
    assert result["airflow_taskflow_wiring_lines"] == 4, result
    return result


if __name__ == "__main__":
    bad = materialize_with_a_bad_row()
    print(
        f"With the bad row: run succeeded ({bad['run_succeeded']}), but the "
        f"asset check failed, catching {bad['bad_rows']} bad row."
    )

    fixed = materialize_with_the_row_fixed()
    print(f"With the row fixed: the same check passed ({fixed['check_passed']}).")

    lineage = derive_lineage_with_no_extra_tooling()
    print()
    print(
        f"fct_orders's own transitive upstream, asked for directly: "
        f"{lineage['fct_orders_transitive_upstream']}"
    )

    wiring = count_dependency_wiring_lines()
    print()
    print(
        f"Explicit dependency-wiring lines: {wiring['asset_graph_wiring_lines']} "
        f"for the asset graph vs. {wiring['airflow_taskflow_wiring_lines']} for "
        f"the equivalent Airflow TaskFlow DAG (one of which exists only to "
        f"force the check into the run order -- the asset graph needed no "
        f"equivalent, because the check attaches to the asset directly)."
    )
    print("OK: all assertions passed.")
