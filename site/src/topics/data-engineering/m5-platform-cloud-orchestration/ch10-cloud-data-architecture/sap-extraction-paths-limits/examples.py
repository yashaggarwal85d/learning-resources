"""A disclosed, structural reproduction of two documented mechanisms: the delta-capability
comparison across SAP's four named extraction mechanisms, and SuccessFactors' effective-dated
record query logic (asOfDate/fromDate/toDate). No real S/4HANA, ECC or SuccessFactors tenant
runs in this sandbox; SOURCES.md documents each mechanism's real, cited behavior. Databricks
announced SAP Databricks, inside SAP Business Data Cloud, on 13 February 2025 (SOURCES.md).
"""
import json


MECHANISM_CAPABILITIES = {
    "odp_delta_queue": {"sees_insert": True, "sees_update": True, "sees_delete": True, "sees_intermediate_state": False, "latency": "near-real-time delta"},
    "slt_trigger_replication": {"sees_insert": True, "sees_update": True, "sees_delete": True, "sees_intermediate_state": True, "latency": "near-real-time, row-level"},
    "odata": {"sees_insert": True, "sees_update": True, "sees_delete": False, "sees_intermediate_state": False, "latency": "pull, request-driven"},
    "database_level_cdc": {"sees_insert": True, "sees_update": True, "sees_delete": True, "sees_intermediate_state": True, "latency": "near-real-time, log-based"},
}


def mechanism_delta_capability(mechanism):
    """SOURCES.md: each mechanism is named for what it actually captures and at what latency —
    OData's own documented limitation is that it cannot reliably surface deletes the way a
    trigger- or log-based mechanism can."""
    return MECHANISM_CAPABILITIES[mechanism]


def mechanism_comparison_worked_example():
    result = {m: mechanism_delta_capability(m) for m in MECHANISM_CAPABILITIES}
    assert result["odata"]["sees_delete"] is False
    assert result["slt_trigger_replication"]["sees_delete"] is True
    assert result["database_level_cdc"]["sees_intermediate_state"] is True
    assert result["odp_delta_queue"]["sees_intermediate_state"] is False
    return result


def odp_rfc_licensing_check(mechanism, is_third_party, moves_data_out_of_sap):
    """SOURCES.md: SAP Note 3255746 restricts third-party use of ODP-RFC specifically — RFC
    itself, and other named mechanisms like table/CDS extraction, remain unaffected. The note's
    own version history: first published 2022, version 4 on 2 February 2024 turned this into an
    outright prohibition, and a 7 July 2024 update pointed customers at SAP Datasphere instead."""
    restricted = {
        "odp_rfc": True,
        "table_or_cds_extraction": False,
        "odata": False,
    }
    if mechanism not in restricted:
        return {"permitted": True, "reason": "mechanism not covered by Note 3255746"}
    if restricted[mechanism] and is_third_party and moves_data_out_of_sap:
        return {"permitted": False, "reason": "ODP-RFC by a third party, moving data out of SAP, is not permitted since Note 3255746 version 4"}
    return {"permitted": True, "reason": "not a restricted combination"}


def licensing_worked_examples():
    old_integration = odp_rfc_licensing_check(mechanism="odp_rfc", is_third_party=True, moves_data_out_of_sap=True)
    cds_extraction = odp_rfc_licensing_check(mechanism="table_or_cds_extraction", is_third_party=True, moves_data_out_of_sap=True)
    internal_sap_to_sap = odp_rfc_licensing_check(mechanism="odp_rfc", is_third_party=True, moves_data_out_of_sap=False)
    result = {"old_integration": old_integration, "cds_extraction": cds_extraction, "internal_sap_to_sap": internal_sap_to_sap}
    assert result["old_integration"]["permitted"] is False
    assert result["cds_extraction"]["permitted"] is True
    assert result["internal_sap_to_sap"]["permitted"] is True
    return result


def effective_dated_query(records, as_of_date):
    """SAP KBA 2853045/3774633: a record is returned only if as_of_date falls within its
    effective start and end date — otherwise it is filtered out entirely, not merely stale."""
    matches = [r for r in records if r["effective_start"] <= as_of_date <= r["effective_end"]]
    return {"as_of_date": as_of_date, "matched_record_ids": sorted(r["id"] for r in matches)}


def effective_dated_worked_example():
    records = [
        {"id": "pos-1-v1", "effective_start": "2026-01-01", "effective_end": "2026-06-30"},
        {"id": "pos-1-v2", "effective_start": "2026-07-01", "effective_end": "9999-12-31"},
    ]
    before_promotion = effective_dated_query(records, as_of_date="2026-03-15")
    after_promotion = effective_dated_query(records, as_of_date="2026-08-01")
    gap_query = effective_dated_query(records, as_of_date="2025-12-31")
    result = {"before_promotion": before_promotion, "after_promotion": after_promotion, "gap_query": gap_query}
    assert result["before_promotion"]["matched_record_ids"] == ["pos-1-v1"]
    assert result["after_promotion"]["matched_record_ids"] == ["pos-1-v2"]
    assert result["gap_query"]["matched_record_ids"] == []
    return result


def main():
    print(json.dumps(mechanism_comparison_worked_example(), indent=2))
    print(json.dumps(licensing_worked_examples(), indent=2))
    print(json.dumps(effective_dated_worked_example(), indent=2))


if __name__ == "__main__":
    main()
