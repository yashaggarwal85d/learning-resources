"""A minimal local IAM policy evaluator, not a real cloud account, reproducing the PassRole-style
escalation path and the two mechanisms (a Resource-scoped PassRole statement, a permission
boundary, an SCP) that close it or cap it — exactly as AWS's own documentation describes the
mechanism, scoped to a local simulation per this chapter's engine-of-record note.
"""

import fnmatch


def _matches_any(value, patterns):
    return any(fnmatch.fnmatch(value, p) for p in patterns)


def can_pass_role(pass_role_resource_patterns, role_arn):
    """iam:PassRole, scoped by the Resources element of the policy statement (AWS's own
    documented way to limit which roles a user may pass)."""
    return _matches_any(role_arn, pass_role_resource_patterns)


def _allowed_by(action, allow_patterns):
    return _matches_any(action, allow_patterns)


def effective_permissions(identity_allow, boundary_allow=None, scp_allow=None):
    """Effective permissions are the intersection of identity-based policy, permission boundary
    and SCP allow-sets — AWS's own stated evaluation rule, not a deny-list simulation. Each
    allow-set may use a wildcard action pattern (e.g. 's3:*'), matched the same way IAM matches
    an action against a policy statement."""
    eff = set()
    for action in identity_allow:
        if boundary_allow is not None and not _allowed_by(action, boundary_allow):
            continue
        if scp_allow is not None and not _allowed_by(action, scp_allow):
            continue
        eff.add(action)
    return eff


def passrole_wildcard_resource_allows_escalation():
    """Alice can pass any role (Resource: '*') and can launch EC2 instances. She has no S3
    permissions of her own, but passes an over-permissioned role with s3:* to the instance.
    Once the instance assumes that role, it can perform S3 actions on Alice's behalf — the exact
    escalation AWS's own PassRole documentation names."""
    alice_identity_permissions = {"ec2:RunInstances", "iam:PassRole"}
    admin_role_arn = "arn:aws:iam::111111111111:role/admin-role"
    admin_role_permissions = {"s3:*", "ec2:*", "iam:*"}

    pass_role_resource_patterns = ["*"]
    passed = can_pass_role(pass_role_resource_patterns, admin_role_arn)
    assert passed is True

    instance_effective_permissions = admin_role_permissions if passed else set()
    escalated = "s3:*" in instance_effective_permissions and "s3:*" not in alice_identity_permissions
    assert escalated is True
    return {"passed": passed, "escalated": escalated, "instance_effective_permissions": instance_effective_permissions}


def passrole_scoped_resource_blocks_escalation():
    """The documented fix: scope the PassRole statement's Resource element to only an approved
    naming pattern. Alice can still pass a role matching 'role/limited-*', but the same
    admin-role ARN from the previous scenario no longer matches, so the pass is denied and the
    escalation never happens."""
    admin_role_arn = "arn:aws:iam::111111111111:role/admin-role"
    limited_role_arn = "arn:aws:iam::111111111111:role/limited-reader"
    pass_role_resource_patterns = ["arn:aws:iam::111111111111:role/limited-*"]

    can_pass_admin = can_pass_role(pass_role_resource_patterns, admin_role_arn)
    can_pass_limited = can_pass_role(pass_role_resource_patterns, limited_role_arn)
    assert can_pass_admin is False
    assert can_pass_limited is True
    return {"can_pass_admin": can_pass_admin, "can_pass_limited": can_pass_limited}


def permission_boundary_caps_effective_permissions():
    """AWS's own worked example, reproduced: an identity-based policy grants iam:CreateUser, but
    a permissions boundary that only covers s3/cloudwatch/ec2 caps the user below it. Effective
    permissions are the intersection, so iam:CreateUser is not in the result even though the
    identity policy alone would have allowed it."""
    identity_allow = {"iam:CreateUser", "s3:GetObject"}
    boundary_allow = {"s3:*", "cloudwatch:*", "ec2:*"}

    effective = effective_permissions(identity_allow, boundary_allow=boundary_allow)
    assert "iam:CreateUser" not in effective
    assert "s3:GetObject" in effective
    return {"effective": effective}


def scp_caps_account_even_with_full_identity_policy():
    """An SCP restricts even the member account's root user, per AWS's own documentation. A role
    with a full-access identity policy (modeled here as every permission in the account's
    catalog) still only ends up with what the SCP's allow-set intersects down to."""
    account_permission_catalog = {"s3:*", "ec2:*", "iam:*", "rds:DeleteDBInstance"}
    identity_allow_full_access = set(account_permission_catalog)
    scp_allow = {"s3:*", "ec2:*"}

    effective = effective_permissions(identity_allow_full_access, scp_allow=scp_allow)
    assert "iam:*" not in effective
    assert "rds:DeleteDBInstance" not in effective
    assert effective == scp_allow
    return {"effective": effective}


def raw_vs_curated_role_separation():
    """Two roles scoped to disjoint layers: a breach of the raw-layer credential never grants
    access to the curated layer, because the two roles' permission sets don't intersect."""
    raw_role_permissions = {"s3:GetObject:raw/*", "s3:PutObject:raw/*"}
    curated_role_permissions = {"s3:GetObject:curated/*"}

    breached_role_permissions = raw_role_permissions
    curated_exposed = bool(breached_role_permissions & curated_role_permissions)
    assert curated_exposed is False
    return {"curated_exposed": curated_exposed}


def main():
    results = {}
    results["passrole_wildcard_resource_allows_escalation"] = passrole_wildcard_resource_allows_escalation()
    results["passrole_scoped_resource_blocks_escalation"] = passrole_scoped_resource_blocks_escalation()
    results["permission_boundary_caps_effective_permissions"] = permission_boundary_caps_effective_permissions()
    results["scp_caps_account_even_with_full_identity_policy"] = scp_caps_account_even_with_full_identity_policy()
    results["raw_vs_curated_role_separation"] = raw_vs_curated_role_separation()
    for name, value in results.items():
        print(f"{name}: {value}")
    print("\nAll examples passed.")


if __name__ == "__main__":
    main()
