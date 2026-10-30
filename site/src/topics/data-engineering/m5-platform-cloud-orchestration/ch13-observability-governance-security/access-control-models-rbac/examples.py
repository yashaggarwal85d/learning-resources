"""Synthetic examples for de.access-control-models-rbac. Plain Python functions that count roles
and evaluate a tag-based rule — the mechanism's own arithmetic, never a production policy engine
(OPA/Cedar themselves are named and sourced, not reimplemented here)."""


def rbac_role_count(teams, datasets, environments):
    """'A role per team per dataset per environment' is exactly that product."""
    return teams * datasets * environments


def rbac_roles_for_new_dataset(teams, environments):
    """Adding one dataset that every team needs access to, under RBAC, needs one new role per
    team per environment — not one role total."""
    return teams * environments


def abac_rule_evaluation(requests):
    """One rule: allow if tier is 'confidential' or lower, AND (category != 'PII' OR a purpose
    attribute is present). requests: list of dicts with subject_role, tier, category, purpose."""
    TIER_RANK = {"public": 0, "internal": 1, "confidential": 2, "restricted": 3}
    decisions = []
    for req in requests:
        tier_ok = TIER_RANK[req["tier"]] <= TIER_RANK["confidential"]
        pii_ok = req["category"] != "PII" or req.get("purpose") is not None
        allowed = req["subject_role"] == "analyst" and tier_ok and pii_ok
        decisions.append(allowed)
    return decisions


def abac_edit_count_for_new_dataset():
    """The hook's own claim, made concrete: a new restricted dataset lands in every team's
    hands. How many edits does RBAC need, versus ABAC?"""
    teams, environments = 14, 3

    # RBAC: one new role per team per environment that needs the new dataset.
    rbac_edits = rbac_roles_for_new_dataset(teams, environments)

    # ABAC: one tag applied to the new dataset at classification time. Every existing rule
    # that reads the "tier"/"category" tags already covers it — zero rule edits.
    abac_edits = 1

    assert rbac_edits == 42
    assert abac_edits == 1
    return rbac_edits, abac_edits


def access_review_catches_drift(grants, active_projects):
    """grants: list of dicts {subject, dataset, purpose}. A grant is stale if its stated purpose
    names a project that is no longer active. A correctly-evaluated ABAC rule would still grant
    access every time, since nothing about the rule itself is wrong — only the reason has gone
    stale."""
    stale = [g for g in grants if g["purpose"] not in active_projects]
    return stale


def main():
    role_count = rbac_role_count(teams=14, datasets=60, environments=3)
    print(f"RBAC role count (fourteen teams, sixty datasets, three environments): {role_count}")

    requests = [
        {"subject_role": "analyst", "tier": "confidential", "category": "general", "purpose": None},
        {"subject_role": "analyst", "tier": "restricted", "category": "general", "purpose": None},
        {"subject_role": "analyst", "tier": "internal", "category": "PII", "purpose": None},
        {"subject_role": "analyst", "tier": "internal", "category": "PII", "purpose": "fraud-review"},
        {"subject_role": "engineer", "tier": "public", "category": "general", "purpose": None},
    ]
    decisions = abac_rule_evaluation(requests)
    allowed = sum(decisions)
    print(f"ABAC rule evaluated on {len(requests)} requests: {allowed} allowed, {len(requests) - allowed} denied")
    assert decisions == [True, False, False, True, False]

    rbac_edits, abac_edits = abac_edit_count_for_new_dataset()
    print(f"New restricted dataset, every team needs it: RBAC needs {rbac_edits} edits, ABAC needs {abac_edits}")

    grants = [
        {"subject": "alice", "dataset": "q3_churn", "purpose": "churn-project"},
        {"subject": "bob", "dataset": "q1_pricing", "purpose": "pricing-sunset-2025"},
        {"subject": "carol", "dataset": "q3_churn", "purpose": "churn-project"},
    ]
    active_projects = {"churn-project"}
    stale = access_review_catches_drift(grants, active_projects)
    print(f"Access review over {len(grants)} grants: {len(stale)} stale grant(s) caught")
    assert len(stale) == 1
    assert stale[0]["subject"] == "bob"


if __name__ == "__main__":
    main()
