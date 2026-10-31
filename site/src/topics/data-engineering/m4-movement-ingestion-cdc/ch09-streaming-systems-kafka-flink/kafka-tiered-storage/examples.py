"""Toy models for de.kafka-tiered-storage: which segments sit where, and why a cold read costs
more. No real broker or object store runs in this sandbox; these are standalone, deterministic
simulations of the rules Kafka's own docs state (SOURCES.md), not a port of Kafka's RLM code."""


def segment_placement(segments, now_ms, local_retention_ms, total_retention_ms):
    """A segment is: active (not yet rolled, stays local only), local_and_remote (rolled and
    copied to the remote tier immediately, per KIP-405's RLM leader task, but still within
    local.retention.ms so the local copy hasn't been deleted yet), remote_only (past local
    retention, deleted locally, only the remote copy remains), or expired (past total retention,
    deleted everywhere). `segments` is a list of {"id", "rolled_at_ms", "active"}.
    """
    placement = {}
    for seg in segments:
        if seg["active"]:
            placement[seg["id"]] = "active"
            continue
        age = now_ms - seg["rolled_at_ms"]
        if age > total_retention_ms:
            placement[seg["id"]] = "expired"
        elif age > local_retention_ms:
            placement[seg["id"]] = "remote_only"
        else:
            placement[seg["id"]] = "local_and_remote"
    return placement


def read_path(offset, remote_only_offsets):
    """A consumer's read never names "local" or "remote" explicitly — it just asks for an
    offset. The broker decides the path. Returns the path and a toy relative-latency cost."""
    if offset in remote_only_offsets:
        return "remote", 1.0
    return "local", 0.02


def cleanup_policy_allowed(remote_storage_enabled, cleanup_policy):
    """remote.storage.enable=true topics cannot use cleanup.policy=compact (KIP-405's own
    stated non-goal, and the GA operations doc's "No support for compacted topics" limitation)."""
    if remote_storage_enabled and "compact" in cleanup_policy:
        return False
    return True


def run():
    # Six segments, three already rolled long enough ago to have left local disk, two still
    # local+remote, one still active.
    segments = [
        {"id": "seg-0", "rolled_at_ms": 0, "active": False},
        {"id": "seg-1", "rolled_at_ms": 100_000, "active": False},
        {"id": "seg-2", "rolled_at_ms": 500_000, "active": False},
        {"id": "seg-3", "rolled_at_ms": 900_000, "active": False},
        {"id": "seg-4", "rolled_at_ms": 980_000, "active": False},
        {"id": "seg-5", "rolled_at_ms": 0, "active": True},
    ]
    now_ms = 1_000_000
    local_retention_ms = 200_000
    total_retention_ms = 950_000

    placement = segment_placement(segments, now_ms, local_retention_ms, total_retention_ms)
    assert placement["seg-0"] == "expired"
    assert placement["seg-1"] == "remote_only"
    assert placement["seg-2"] == "remote_only"
    assert placement["seg-3"] == "local_and_remote"
    assert placement["seg-4"] == "local_and_remote"
    assert placement["seg-5"] == "active"

    remote_only_ids = {k for k, v in placement.items() if v == "remote_only"}
    assert remote_only_ids == {"seg-1", "seg-2"}

    # A read against a remote-only segment's offset range costs far more than a local one.
    path_hot, cost_hot = read_path("seg-4", remote_only_ids)
    path_cold, cost_cold = read_path("seg-1", remote_only_ids)
    assert path_hot == "local" and path_cold == "remote"
    assert cost_cold > cost_hot * 10

    assert cleanup_policy_allowed(remote_storage_enabled=False, cleanup_policy=["compact"]) is True
    assert cleanup_policy_allowed(remote_storage_enabled=True, cleanup_policy=["delete"]) is True
    assert cleanup_policy_allowed(remote_storage_enabled=True, cleanup_policy=["compact"]) is False

    print("segment placement:", placement)
    print(f"remote-only segments: {sorted(remote_only_ids)}")
    print(f"read cost, local segment (seg-4): {cost_hot}")
    print(f"read cost, remote-only segment (seg-1): {cost_cold}")
    print("compacted topic + tiered storage allowed:",
          cleanup_policy_allowed(remote_storage_enabled=True, cleanup_policy=["compact"]))


if __name__ == "__main__":
    run()
