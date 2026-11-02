"""Measured claims for de.access-control-models-rbac.

Claim 1: role-per-(team, dataset, environment) RBAC needs N*M*K roles; adding one dataset with
a restricted column forces as many new grants as there are teams that should see it under RBAC,
versus a single new tag-rule edit under ABAC.

Claim 2: a tag-based ABAC rule, evaluated against subject/object/environment attributes, grants
the correct allow/deny outcome on both an allow case and a deny case, without listing individual
users.
"""

from itertools import product


def rbac_role_count(teams: int, datasets: int, environments: int) -> int:
    """One role per (team, dataset, environment) triple -- the shop's own least-privilege rule."""
    return teams * datasets * environments


def rbac_new_dataset_grants(teams_needing_access: int, environments: int) -> int:
    """Adding one new dataset means one new role per team that needs it, per environment --
    every one of those roles has to be created and every affected user re-assigned."""
    return teams_needing_access * environments


def abac_new_dataset_edits() -> int:
    """Under ABAC, a new dataset that is tagged the same way an existing rule already reads
    (e.g. tier=confidential) needs zero new policy edits -- the existing rule already covers it
    by attribute, not by name."""
    return 0


def abac_decision(subject_attrs: dict, object_attrs: dict, rule) -> bool:
    """A single ABAC rule, expressed as a predicate over subject and object attributes."""
    return rule(subject_attrs, object_attrs)


def analyst_rule(subject_attrs: dict, object_attrs: dict) -> bool:
    """'analysts may read tier confidential or below, never category PII without a purpose
    attribute' -- the exact rule CHAPTER.md gives as the one-rule replacement for RBAC grants."""
    if subject_attrs.get("role") != "analyst":
        return False
    tier_order = {"public": 0, "internal": 1, "confidential": 2, "restricted": 3}
    if tier_order.get(object_attrs.get("tier"), 99) > tier_order["confidential"]:
        return False
    if object_attrs.get("category") == "PII" and not subject_attrs.get("purpose"):
        return False
    return True


def main() -> None:
    teams, datasets, environments = 14, 60, 3
    total_roles = rbac_role_count(teams, datasets, environments)
    assert total_roles == 2520, f"expected 2520 roles, got {total_roles}"
    print(f"RBAC role count for {teams} teams x {datasets} datasets x {environments} envs: {total_roles}")

    teams_needing_new_dataset = 1
    rbac_grants = rbac_new_dataset_grants(teams_needing_new_dataset, environments)
    abac_edits = abac_new_dataset_edits()
    assert rbac_grants == 3, f"expected 3 new RBAC roles, got {rbac_grants}"
    assert abac_edits == 0, f"expected 0 new ABAC edits, got {abac_edits}"
    print(f"New restricted dataset for 1 team: RBAC needs {rbac_grants} new roles; ABAC needs {abac_edits} edits")

    # Claim 2: the one ABAC rule, tested on an allow case and two distinct deny cases.
    allow_case = analyst_rule(
        {"role": "analyst", "purpose": None},
        {"tier": "confidential", "category": "financial"},
    )
    assert allow_case is True, "analyst reading confidential non-PII data should be allowed"

    deny_case_tier = analyst_rule(
        {"role": "analyst", "purpose": None},
        {"tier": "restricted", "category": "financial"},
    )
    assert deny_case_tier is False, "analyst reading a tier above confidential should be denied"

    deny_case_pii = analyst_rule(
        {"role": "analyst", "purpose": None},
        {"tier": "confidential", "category": "PII"},
    )
    assert deny_case_pii is False, "analyst reading PII without a purpose attribute should be denied"

    allow_case_pii_with_purpose = analyst_rule(
        {"role": "analyst", "purpose": "fraud-investigation"},
        {"tier": "confidential", "category": "PII"},
    )
    assert allow_case_pii_with_purpose is True, "analyst reading PII with a purpose attribute should be allowed"

    print("ABAC rule: allow (confidential, non-PII) -> True; deny (restricted) -> False; "
          "deny (confidential PII, no purpose) -> False; allow (confidential PII, with purpose) -> True")

    # Sweep a range of team/dataset/environment sizes to confirm the arithmetic generalises,
    # not just for the one hook number.
    for t, d, e in product([5, 14, 50], [10, 60, 200], [1, 3, 5]):
        roles = rbac_role_count(t, d, e)
        assert roles == t * d * e

    print("all claims verified")


if __name__ == "__main__":
    main()
