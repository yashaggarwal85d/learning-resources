"""
Toy consumer-group rebalance simulations for de.consumer-groups-rebalance-protocols.

No real multi-broker Kafka cluster is available in this sandbox. Each function below is a small,
independent, directly-asserted reimplementation of one mechanism this topic teaches, built from
the sourced behaviour in SOURCES.md (KIP-848, Kafka's own rebalance-protocol and static-membership
docs), not a port of Kafka's real group coordinator or assignor code.

1. round_robin_assignment / members_affected_by_scale_up: a real (if simplified) round-robin
   partition assignment, recomputed after a group grows by one member, used to find which members'
   assignments actually changed.
2. eager_rebalance_pause: the classic eager protocol pauses every member in the new group, not
   just the ones whose assignment changed.
3. cooperative_sticky_pause: only the members whose assignment actually changed are paused;
   everyone else keeps consuming.
4. static_membership_rebalance: a member rejoining within its session timeout under a configured
   group.instance.id does not trigger a rebalance; a member without one, or one that misses the
   timeout, does.
"""


def round_robin_assignment(n_partitions, n_members):
    return {p: p % n_members for p in range(n_partitions)}


def sticky_assignment_after_scale_up(n_partitions, n_members_before):
    """Move only as many partitions as needed to give a new member its fair share, each taken
    from a different existing member in turn, leaving every other assignment untouched — the
    "sticky" reassignment a real cooperative/incremental assignor approximates, unlike a bare
    mod-based round robin which reshuffles almost everything on every membership change."""
    before = round_robin_assignment(n_partitions, n_members_before)
    new_member = n_members_before
    n_members_after = n_members_before + 1
    fair_share = n_partitions // n_members_after
    after = dict(before)
    moved = 0
    donor = 0
    while moved < fair_share:
        for p in range(n_partitions):
            if after[p] == donor:
                after[p] = new_member
                moved += 1
                break
        donor = (donor + 1) % n_members_before
    return before, after


def members_affected_by_scale_up(n_partitions, n_members_before):
    before, after = sticky_assignment_after_scale_up(n_partitions, n_members_before)
    affected = set()
    for p in range(n_partitions):
        if before[p] != after[p]:
            affected.add(before[p])
            affected.add(after[p])
    return {
        "before": before,
        "after": after,
        "affected_members": affected,
        "n_members_after": n_members_before + 1,
    }


def eager_rebalance_pause(n_members_after):
    # The classic eager protocol revokes every member's partitions before reassigning, so the
    # whole group pauses regardless of how many partitions actually moved.
    return {"paused_members": n_members_after}


def cooperative_sticky_pause(affected_members):
    # Cooperative-sticky (and KIP-848's incremental reconciliation) only revokes/reassigns the
    # specific partitions that must move, so only the affected members ever pause.
    return {"paused_members": len(affected_members)}


def static_membership_rebalance(has_group_instance_id, restart_ms, session_timeout_ms):
    if not has_group_instance_id:
        # No persistent identity: the coordinator allocates a fresh, ephemeral member id on
        # rejoin, which always triggers a rebalance.
        return {"rebalance_triggered": True}
    return {"rebalance_triggered": restart_ms > session_timeout_ms}


def run():
    scale_up = members_affected_by_scale_up(n_partitions=24, n_members_before=8)
    assert scale_up["n_members_after"] == 9
    assert len(scale_up["affected_members"]) < scale_up["n_members_after"]

    eager = eager_rebalance_pause(scale_up["n_members_after"])
    assert eager["paused_members"] == 9

    cooperative = cooperative_sticky_pause(scale_up["affected_members"])
    assert cooperative["paused_members"] < eager["paused_members"]
    assert cooperative["paused_members"] == len(scale_up["affected_members"])

    no_id_case = static_membership_rebalance(has_group_instance_id=False, restart_ms=500, session_timeout_ms=10_000)
    assert no_id_case["rebalance_triggered"] is True

    fast_restart = static_membership_rebalance(has_group_instance_id=True, restart_ms=500, session_timeout_ms=10_000)
    assert fast_restart["rebalance_triggered"] is False

    slow_restart = static_membership_rebalance(has_group_instance_id=True, restart_ms=15_000, session_timeout_ms=10_000)
    assert slow_restart["rebalance_triggered"] is True

    return {
        "scale_up": {"affected_members": sorted(scale_up["affected_members"]), "n_members_after": scale_up["n_members_after"]},
        "eager": eager,
        "cooperative": cooperative,
        "static_membership": {"no_id": no_id_case, "fast_restart": fast_restart, "slow_restart": slow_restart},
    }


if __name__ == "__main__":
    import json

    print(json.dumps(run(), indent=2))
