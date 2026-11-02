"""
Real contract-enforcement experiments against an ODCS-conformant data contract for the shop's
own fct_orders: a producer-side CI gate that classifies a proposed schema change and blocks it
when there's no migration path (reusing topic 14's expand/migrate/contract logic, now automated),
a runtime enforcement check that catches a violation the CI gate never saw (an out-of-band write),
and automated downstream-owner notification driven by a real lineage graph.
"""
from __future__ import annotations

from pathlib import Path

SOURCES_DIR = Path(__file__).parent / "sources"


# ---- A real ODCS-conformant contract for the shop's own fct_orders ----

CONTRACT = {
    "apiVersion": "v3.1.0",
    "kind": "DataContract",
    "id": "shop-fct-orders-v1",
    "name": "fct_orders",
    "version": "1.2.0",
    "status": "active",
    "schema": [
        {"name": "order_id", "logicalType": "integer", "required": True},
        {"name": "customer_id", "logicalType": "integer", "required": True},
        {"name": "amount", "logicalType": "number", "required": True},
        {"name": "order_ts", "logicalType": "date", "required": True},
    ],
    "quality": [
        {"id": "amount_non_negative", "type": "sql", "rule": "amount >= 0"},
        {"id": "order_id_present", "type": "library", "rule": "notNull(order_id)"},
    ],
    "slaProperties": [
        {"id": "freshness_slo", "property": "latency", "value": 1, "unit": "d"},
        {"id": "availability_slo", "property": "generalAvailability", "value": "2025-01-01"},
    ],
    "team": [
        {"username": "finance-platform-team", "role": "Owner"},
        {"username": "data-platform-team", "role": "Data Steward"},
    ],
}


def validate_contract_structure(contract: dict) -> dict:
    """A contract is ODCS-conformant only if every one of the standard's required top-level
    sections -- schema, quality rules, SLAs and ownership -- is actually present."""
    required_top = ["apiVersion", "kind", "id", "schema", "quality", "slaProperties", "team"]
    missing = [k for k in required_top if k not in contract]
    return {"conformant": not missing, "missing": missing, "sections_present": [k for k in required_top if k in contract]}


# ---- Breaking-change classification: topic 14's expand/migrate/contract logic, automated ----

def classify_change(old_schema: list[dict], new_schema: list[dict]) -> str:
    old_names = {c["name"] for c in old_schema}
    new_by_name = {c["name"]: c for c in new_schema}
    new_names = set(new_by_name)
    removed = old_names - new_names
    added = new_names - old_names

    if not removed:
        return "non_breaking"  # purely additive, nothing an existing consumer reads disappears

    has_migration_path = any(new_by_name[n].get("deprecates") in removed for n in added)
    if has_migration_path:
        return "breaking_with_migration_path"
    return "breaking_no_path"


# ---- Producer-side CI gate: classify the proposed change, block on no migration path ----

def producer_ci_gate(contract: dict, proposed_schema: list[dict]) -> dict:
    classification = classify_change(contract["schema"], proposed_schema)
    merge_blocked = classification == "breaking_no_path"
    return {"classification": classification, "merge_blocked": merge_blocked}


def run_premature_rename_blocked() -> dict:
    """A straight rename with no deprecation mapping: the exact premature-contract mistake
    topic 14 warned about by hand, now caught automatically before the merge."""
    proposed = [
        {"name": "order_id", "logicalType": "integer", "required": True},
        {"name": "cust_id", "logicalType": "integer", "required": True},  # customer_id renamed, no path
        {"name": "amount", "logicalType": "number", "required": True},
        {"name": "order_ts", "logicalType": "date", "required": True},
    ]
    gate = producer_ci_gate(CONTRACT, proposed)
    assert gate["classification"] == "breaking_no_path"
    assert gate["merge_blocked"] is True
    return gate


def run_expand_first_rename_allowed() -> dict:
    """The identical rename, proposed only once the expand phase already shipped and consumers
    had real time to move: customer_id is finally dropped, but cust_id names exactly what it
    deprecates, giving the classifier a real migration path instead of a silent disappearance."""
    proposed = [
        {"name": "order_id", "logicalType": "integer", "required": True},
        {"name": "cust_id", "logicalType": "integer", "required": True, "deprecates": "customer_id"},
        {"name": "amount", "logicalType": "number", "required": True},
        {"name": "order_ts", "logicalType": "date", "required": True},
    ]
    gate = producer_ci_gate(CONTRACT, proposed)
    assert gate["classification"] == "breaking_with_migration_path"
    assert gate["merge_blocked"] is False
    return gate


def run_purely_additive_change_allowed() -> dict:
    """Adding a brand-new column drops nothing an existing consumer reads, so it's non-breaking."""
    proposed = CONTRACT["schema"] + [{"name": "discount_code", "logicalType": "string", "required": False}]
    gate = producer_ci_gate(CONTRACT, proposed)
    assert gate["classification"] == "non_breaking"
    assert gate["merge_blocked"] is False
    return gate


# ---- Runtime enforcement: catching a violation the CI gate never had a chance to see ----

def runtime_enforcement_check(contract: dict, rows: list[dict]) -> dict:
    required_fields = {c["name"] for c in contract["schema"] if c.get("required")}
    violations = []
    for i, row in enumerate(rows):
        missing = sorted(required_fields - set(row))
        if missing:
            violations.append({"row": i, "reason": f"missing required field(s): {missing}"})
        if "amount" in row and row["amount"] is not None and row["amount"] < 0:
            violations.append({"row": i, "reason": "amount < 0, violates quality rule amount_non_negative"})
    return {"violations": violations, "passed": not violations}


def run_runtime_catches_out_of_band_write() -> dict:
    """A legacy nightly job writes straight to the table, outside the pipeline's own CI entirely
    -- no pull request, no CI gate ever ran against it. The runtime check, evaluated against the
    same contract, is the only thing that ever sees this write at all."""
    good_rows = [
        {"order_id": 1, "customer_id": 10, "amount": 42.0, "order_ts": "2026-10-30"},
        {"order_id": 2, "customer_id": 11, "amount": 15.5, "order_ts": "2026-10-30"},
    ]
    out_of_band_rows = [
        {"order_id": 3, "customer_id": 12, "amount": 30.0, "order_ts": "2026-10-31"},
        {"order_id": 4, "amount": -5.0, "order_ts": "2026-10-31"},  # customer_id missing, amount negative
    ]
    good_check = runtime_enforcement_check(CONTRACT, good_rows)
    bad_check = runtime_enforcement_check(CONTRACT, out_of_band_rows)
    assert good_check["passed"] is True
    assert bad_check["passed"] is False
    assert len(bad_check["violations"]) == 2
    return {"ci_never_ran_against_this_write": True, "good_write_result": good_check, "out_of_band_write_result": bad_check}


# ---- Automated downstream-owner notification, driven by a real lineage graph ----

LINEAGE_GRAPH: dict[str, list[str]] = {
    "fct_orders": ["rpt_revenue_daily", "dim_customer_ltv", "finance_dashboard"],
}

TABLE_OWNERS: dict[str, str] = {
    "rpt_revenue_daily": "data-platform-team",
    "dim_customer_ltv": "analytics-team",
    "finance_dashboard": "finance-reporting-team",
}


def notify_downstream_owners(table: str, lineage_graph: dict[str, list[str]], owners: dict[str, str]) -> dict:
    downstream_tables = lineage_graph.get(table, [])
    owners_notified = sorted({owners[t] for t in downstream_tables})
    return {"downstream_tables": downstream_tables, "owners_notified": owners_notified}


def run_approved_change_notifies_every_downstream_owner() -> dict:
    """An approved, non-breaking change to fct_orders still touches three real downstream tables
    owned by three different teams; the lineage graph finds every one of them automatically,
    rather than relying on the producer to remember who reads the table."""
    notification = notify_downstream_owners("fct_orders", LINEAGE_GRAPH, TABLE_OWNERS)
    assert len(notification["downstream_tables"]) == 3
    assert notification["owners_notified"] == ["analytics-team", "data-platform-team", "finance-reporting-team"]
    return notification


def verify_odcs_overview_source() -> dict:
    text = " ".join((SOURCES_DIR / "odcs-fundamentals-overview.txt").read_text().split())
    quote = "This document describes the keys and values expected in a YAML data contract, per the Open Data Contract Standard."
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "ODCS defines the keys and values expected in a YAML data contract", "quote": quote}


def verify_odcs_schema_source() -> dict:
    text = " ".join((SOURCES_DIR / "odcs-schema.txt").read_text().split())
    quote = "Schema supports both a business representation of your data and a physical implementation."
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "ODCS's schema section ties a business representation of the data to its physical implementation", "quote": quote}


def verify_odcs_data_quality_source() -> dict:
    text = " ".join((SOURCES_DIR / "odcs-data-quality.txt").read_text().split())
    quote = "This section describes data quality rules & parameters. They are tightly linked to the schema described in the previous section."
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "ODCS's data quality rules are tightly linked to the contract's schema section", "quote": quote}


def verify_odcs_sla_source() -> dict:
    text = " ".join((SOURCES_DIR / "odcs-sla.txt").read_text().split())
    quote = "This section describes the service-level agreements (SLA)."
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "ODCS has a dedicated service-level-agreement section", "quote": quote}


def verify_odcs_team_source() -> dict:
    text = " ".join((SOURCES_DIR / "odcs-team.txt").read_text().split())
    quote = "This section lists team members and the history of their relation with this data contract."
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "ODCS's team section records ownership and the history of who owns the contract", "quote": quote}


def verify_paypal_source() -> dict:
    text = " ".join((SOURCES_DIR / "paypal-data-contract-template.txt").read_text().split())
    quote = "A data contract defines the agreement between a data producer and consumer."
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "PayPal's own open-sourced template (the direct predecessor of ODCS) defines a data contract as the producer-consumer agreement", "quote": quote}


def verify_gocardless_source() -> dict:
    text = " ".join((SOURCES_DIR / "gocardless-data-contracts.txt").read_text().split())
    quote = ("breaking changes and data migrations will be a regular part of the applications evolution and will be "
             "done without knowledge of how it has been used downstream, leading to breaking changes affecting key "
             "reports and data-driven products.")
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "GoCardless's own account names exactly the problem this topic's hook demonstrates: a producer change breaking downstream reports with no warning", "quote": quote}


if __name__ == "__main__":
    structure = validate_contract_structure(CONTRACT)
    print(f"Contract structure: {structure}")

    rename_blocked = run_premature_rename_blocked()
    print(f"\nPremature rename blocked by CI gate: {rename_blocked}")

    expand_allowed = run_expand_first_rename_allowed()
    print(f"\nExpand-first rename allowed by CI gate: {expand_allowed}")

    additive_allowed = run_purely_additive_change_allowed()
    print(f"\nPurely additive change allowed by CI gate: {additive_allowed}")

    runtime = run_runtime_catches_out_of_band_write()
    print(f"\nRuntime enforcement catches an out-of-band write: {runtime}")

    notification = run_approved_change_notifies_every_downstream_owner()
    print(f"\nApproved change notifies every downstream owner: {notification}")

    print()
    for fn in (
        verify_odcs_overview_source,
        verify_odcs_schema_source,
        verify_odcs_data_quality_source,
        verify_odcs_sla_source,
        verify_odcs_team_source,
        verify_paypal_source,
        verify_gocardless_source,
    ):
        r = fn()
        print(f"Sourced: {r['claim']}")

    print()
    print("OK: an ODCS-conformant contract holds schema, quality rules, SLAs and ownership together; "
          "a producer-side CI gate blocks a premature rename with no migration path while allowing the "
          "identical change done through expand first and any purely additive change; a runtime check "
          "catches a violation from an out-of-band write the CI gate never saw; and an approved change "
          "automatically notifies every real downstream owner found in the lineage graph.")
