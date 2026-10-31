"""A disclosed, structural simulation of Terraform/OpenTofu's own documented state, locking,
plan/apply, drift-detection, import and policy-gate mechanics (SOURCES.md), run against an
in-memory 'remote system' standing in for a real cloud account. No real Terraform or OpenTofu
binary runs in this sandbox: downloading and executing an external compiled binary is blocked by
this session's own safety controls, so this file reproduces the documented *mechanism* itself in
pure Python rather than shelling out to a real CLI.
"""
import json


class RemoteSystem:
    """Stands in for the real cloud account. A resource here can change independently of the
    IaC tool, which is exactly what 'drift' means."""

    def __init__(self):
        self.resources = {}

    def put(self, resource_id, attrs):
        self.resources[resource_id] = dict(attrs)

    def get(self, resource_id):
        return self.resources.get(resource_id)


class StateStore:
    """Terraform's own documented purpose: 'store bindings between objects in a remote system
    and resource instances declared in your configuration' (SOURCES.md). The state is NOT the
    live cloud — it's the tool's last-known record, which is exactly what makes it diffable."""

    def __init__(self):
        self.bindings = {}
        self.locked_by = None

    def acquire_lock(self, who):
        if self.locked_by is not None and self.locked_by != who:
            return False
        self.locked_by = who
        return True

    def release_lock(self, who):
        if self.locked_by == who:
            self.locked_by = None

    def record(self, resource_id, attrs):
        self.bindings[resource_id] = dict(attrs)

    def read(self, resource_id):
        return self.bindings.get(resource_id)


def plan(state, remote, resource_id, desired_attrs):
    """A plan is a diff between the DESIRED config and the state's own last-known record — not
    the live remote system. SOURCES.md: 'the plan command alone does not actually carry out the
    proposed changes... a description of the effect of the plan but without any intent to
    actually apply it.'"""
    known = state.read(resource_id) or {}
    changes = {k: v for k, v in desired_attrs.items() if known.get(k) != v}
    return {"resource_id": resource_id, "based_on_state": known, "changes": changes}


def apply(state, remote, a_plan):
    """Applying a plan writes to the remote system AND updates state to match."""
    resource_id = a_plan["resource_id"]
    known = dict(a_plan["based_on_state"])
    known.update(a_plan["changes"])
    remote.put(resource_id, known)
    state.record(resource_id, known)
    return known


def two_applies_race_unlocked():
    """The hook, reproduced: two operators plan against the same stale state, and the second
    apply overwrites the first's change with no error, because nothing held the lock."""
    state = StateStore()
    remote = RemoteSystem()
    state.record("bucket_policy", {"public": False})
    remote.put("bucket_policy", {"public": False})

    plan_a = plan(state, remote, "bucket_policy", {"public": False, "versioning": True})
    plan_b = plan(state, remote, "bucket_policy", {"public": True})

    apply(state, remote, plan_a)
    apply(state, remote, plan_b)  # computed against the SAME stale state as plan_a

    final = remote.get("bucket_policy")
    assert final == {"public": True}
    return {"final_bucket_policy": final, "versioning_silently_lost": "versioning" not in final}


def two_applies_with_locking():
    """The same race, with locking: the second operator's lock acquisition fails until the
    first releases it, so the second plan is computed against the UPDATED state."""
    state = StateStore()
    remote = RemoteSystem()
    state.record("bucket_policy", {"public": False})
    remote.put("bucket_policy", {"public": False})

    assert state.acquire_lock("operator_a") is True
    assert state.acquire_lock("operator_b") is False  # blocked, exactly as documented

    plan_a = plan(state, remote, "bucket_policy", {"public": False, "versioning": True})
    apply(state, remote, plan_a)
    state.release_lock("operator_a")

    assert state.acquire_lock("operator_b") is True
    plan_b = plan(state, remote, "bucket_policy", {"public": True})
    apply(state, remote, plan_b)
    state.release_lock("operator_b")

    final = remote.get("bucket_policy")
    assert final == {"public": True, "versioning": True}
    return {"final_bucket_policy": final, "versioning_preserved": "versioning" in final}


def detect_drift(state, remote, resource_id):
    """Drift: the next plan sees a difference between state's record and the live remote
    system, caused by a change the tool never made."""
    known = state.read(resource_id) or {}
    live = remote.get(resource_id) or {}
    return {k: (known.get(k), live.get(k)) for k in set(known) | set(live) if known.get(k) != live.get(k)}


def drift_then_import():
    """A console click changes a resource outside the tool; the next plan shows drift. Import
    then brings an EXISTING, already-changed resource under management without recreating it —
    SOURCES.md: 'The terraform import CLI command can only import resources into the state.'"""
    state = StateStore()
    remote = RemoteSystem()
    state.record("firewall_rule", {"port": 443})
    remote.put("firewall_rule", {"port": 443})

    remote.put("firewall_rule", {"port": 8080})  # a console click, outside the tool entirely

    drift = detect_drift(state, remote, "firewall_rule")
    assert drift == {"port": (443, 8080)}

    state.record("firewall_rule", remote.get("firewall_rule"))  # import: adopt it, don't recreate it
    assert state.read("firewall_rule") == remote.get("firewall_rule")
    return {"drift_detected": drift, "after_import_matches_live": state.read("firewall_rule") == remote.get("firewall_rule")}


FORBIDDEN_RESOURCE_TYPES = {"public_bucket_policy"}


def policy_gate(a_plan, resource_type):
    """A minimal policy-as-code check: block a plan containing a forbidden resource type before
    it can be applied — SOURCES.md: Sentinel/OPA both let a policy decide, separate from the
    tool itself, whether a plan is allowed through."""
    if resource_type in FORBIDDEN_RESOURCE_TYPES and a_plan["changes"]:
        return {"allowed": False, "reason": f"{resource_type} is forbidden by policy"}
    return {"allowed": True, "reason": None}


def policy_gate_blocks_a_bad_plan():
    state = StateStore()
    remote = RemoteSystem()
    state.record("bucket_policy", {"public": False})

    bad_plan = plan(state, remote, "bucket_policy", {"public": True})
    verdict = policy_gate(bad_plan, "public_bucket_policy")
    assert verdict == {"allowed": False, "reason": "public_bucket_policy is forbidden by policy"}

    good_plan = plan(state, remote, "bucket_policy", {"public": False, "versioning": True})
    verdict_good = policy_gate(good_plan, "bucket_policy")
    assert verdict_good == {"allowed": True, "reason": None}
    return {"bad_plan_blocked": not verdict["allowed"], "good_plan_allowed": verdict_good["allowed"]}


def main():
    print(json.dumps(two_applies_race_unlocked(), indent=2))
    print(json.dumps(two_applies_with_locking(), indent=2))
    print(json.dumps(drift_then_import(), indent=2))
    print(json.dumps(policy_gate_blocks_a_bad_plan(), indent=2))


if __name__ == "__main__":
    main()
