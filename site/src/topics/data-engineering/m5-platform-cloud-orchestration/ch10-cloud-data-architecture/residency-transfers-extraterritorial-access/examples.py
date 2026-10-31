"""A disclosed, structural reproduction of four documented mechanisms: classifying a legal
requirement as residency, sovereignty or localisation; the CLOUD Act's possession-custody-control
test; the EDPB's own stated limit on encryption as a supplementary measure; and the chapter's
10.5 lab — an Art. 30 record generated from lineage (reusing topic 17's mechanism) plus a real,
runnable CI policy test that fails a deployment writing EU-tagged data to a non-EU target or
granting a non-EU principal read access to it. No real cloud account, CJEU docket or production
deployment pipeline runs in this sandbox; this is a minimal, disclosed simulation.
"""
import json


def classify_requirement(requirement):
    """Residency: where bytes physically rest. Sovereignty: who can be legally compelled to
    produce them regardless of location (the CLOUD Act's own framing). Localisation: a law that
    requires residency as a precondition. Kept as three separate questions (SOURCES.md)."""
    rules = {
        "eu_region_only_storage": "residency",
        "us_cloud_act_possession_custody_control": "sovereignty",
        "national_law_forbids_data_leaving_country": "localisation",
    }
    return rules[requirement]


def classification_worked_examples():
    result = {
        "eu_region_only_storage": classify_requirement("eu_region_only_storage"),
        "us_cloud_act_possession_custody_control": classify_requirement("us_cloud_act_possession_custody_control"),
        "national_law_forbids_data_leaving_country": classify_requirement("national_law_forbids_data_leaving_country"),
    }
    assert result == {
        "eu_region_only_storage": "residency",
        "us_cloud_act_possession_custody_control": "sovereignty",
        "national_law_forbids_data_leaving_country": "localisation",
    }
    return result


def cloud_act_possession_custody_control(provider_subject_to_us_jurisdiction, data_location):
    """SOURCES.md: a provider subject to US jurisdiction must disclose data within its
    possession, custody or control 'regardless of whether' it is located within or outside the
    United States — residency of the bytes is irrelevant to whether this test applies."""
    return {"must_disclose_if_lawfully_ordered": provider_subject_to_us_jurisdiction, "data_location": data_location, "location_is_relevant": False}


def cloud_act_worked_examples():
    eu_hosted = cloud_act_possession_custody_control(provider_subject_to_us_jurisdiction=True, data_location="eu-west-1")
    us_hosted = cloud_act_possession_custody_control(provider_subject_to_us_jurisdiction=True, data_location="us-east-1")
    result = {"eu_hosted": eu_hosted, "us_hosted": us_hosted}
    assert result["eu_hosted"]["must_disclose_if_lawfully_ordered"] == result["us_hosted"]["must_disclose_if_lawfully_ordered"] is True
    assert result["eu_hosted"]["location_is_relevant"] is False
    return result


def encryption_supplementary_measure(importer_needs_cleartext, key_held_by, importer_jurisdiction_problematic):
    """EDPB Use Case 1 vs Use Case 6: encryption is an effective supplementary measure only when
    the importer never needs the data in the clear and the decryption key stays outside the
    importer's custody. Where the importer needs cleartext access, the EDPB states it cannot
    envision an effective technical measure at all."""
    if importer_needs_cleartext:
        return {"effective": False, "reason": "processor needs access to the data in the clear; no technical measure prevents that access"}
    if key_held_by == "importer" and importer_jurisdiction_problematic:
        return {"effective": False, "reason": "importer holds the decryption key in a jurisdiction with problematic access powers"}
    return {"effective": True, "reason": "key held outside the importer's custody, and the importer never needs cleartext"}


def encryption_worked_examples():
    cloud_support_needs_cleartext = encryption_supplementary_measure(importer_needs_cleartext=True, key_held_by="exporter", importer_jurisdiction_problematic=True)
    key_in_wrong_hands = encryption_supplementary_measure(importer_needs_cleartext=False, key_held_by="importer", importer_jurisdiction_problematic=True)
    effective = encryption_supplementary_measure(importer_needs_cleartext=False, key_held_by="exporter", importer_jurisdiction_problematic=True)
    result = {"cloud_support_needs_cleartext": cloud_support_needs_cleartext, "key_in_wrong_hands": key_in_wrong_hands, "effective": effective}
    assert result["cloud_support_needs_cleartext"]["effective"] is False
    assert result["key_in_wrong_hands"]["effective"] is False
    assert result["effective"]["effective"] is True
    return result


# --- 10.5 chapter lab: Art. 30 record from a small OpenLineage-shaped event log (reusing
# topic 17's mechanism), plus a real CI policy test over a proposed deployment.

def art30_record_from_lineage(jobs, datasets, purpose_tags):
    record = []
    for job in jobs:
        record.append({
            "job": job["name"],
            "purposes": sorted({purpose_tags[d] for d in job["outputs"] if d in purpose_tags}),
            "categories_of_data": sorted({datasets[d]["category"] for d in job["outputs"] if d in datasets}),
        })
    return record


def art30_lab_worked_example():
    jobs = [{"name": "sync_eu_customers", "outputs": ["eu_customers"]}]
    datasets = {"eu_customers": {"category": "contact_details"}}
    purpose_tags = {"eu_customers": "support_ticket"}
    result = art30_record_from_lineage(jobs, datasets, purpose_tags)
    assert result == [{"job": "sync_eu_customers", "purposes": ["support_ticket"], "categories_of_data": ["contact_details"]}]
    return result


def residency_policy_gate(deployment):
    """A real, runnable CI policy test: fails any deployment plan that writes EU-tagged data to
    a non-EU-tagged target, or grants a non-EU principal read access to EU-tagged data."""
    violations = []
    for write in deployment.get("writes", []):
        if write["source_region_tag"] == "EU" and write["target_region_tag"] != "EU":
            violations.append(f"write of EU-tagged dataset '{write['dataset']}' to non-EU target '{write['target']}'")
    for grant in deployment.get("grants", []):
        if grant["dataset_region_tag"] == "EU" and grant["principal_region"] != "EU":
            violations.append(f"read grant on EU-tagged dataset '{grant['dataset']}' to non-EU principal '{grant['principal']}'")
    return {"passes": not violations, "violations": violations}


def residency_policy_gate_worked_examples():
    bad_write = residency_policy_gate({
        "writes": [{"dataset": "eu_customers", "source_region_tag": "EU", "target": "us_replica", "target_region_tag": "US"}],
        "grants": [],
    })
    bad_grant = residency_policy_gate({
        "writes": [],
        "grants": [{"dataset": "eu_customers", "dataset_region_tag": "EU", "principal": "support-us", "principal_region": "US"}],
    })
    clean = residency_policy_gate({
        "writes": [{"dataset": "eu_customers", "source_region_tag": "EU", "target": "eu_backup", "target_region_tag": "EU"}],
        "grants": [{"dataset": "eu_customers", "dataset_region_tag": "EU", "principal": "support-eu", "principal_region": "EU"}],
    })
    result = {"bad_write": bad_write, "bad_grant": bad_grant, "clean": clean}
    assert result["bad_write"]["passes"] is False and len(result["bad_write"]["violations"]) == 1
    assert result["bad_grant"]["passes"] is False and len(result["bad_grant"]["violations"]) == 1
    assert result["clean"] == {"passes": True, "violations": []}
    return result


def main():
    print(json.dumps(classification_worked_examples(), indent=2))
    print(json.dumps(cloud_act_worked_examples(), indent=2))
    print(json.dumps(encryption_worked_examples(), indent=2))
    print(json.dumps(art30_lab_worked_example(), indent=2))
    print(json.dumps(residency_policy_gate_worked_examples(), indent=2))


if __name__ == "__main__":
    main()
