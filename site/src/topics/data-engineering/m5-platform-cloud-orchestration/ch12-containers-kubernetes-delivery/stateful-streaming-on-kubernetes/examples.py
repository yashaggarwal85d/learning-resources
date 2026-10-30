"""Stateful-streaming-on-Kubernetes mechanics, run for real.

No local Kubernetes cluster is reachable on this build machine (confirmed across earlier topics in
this chapter: no Docker daemon socket, no kubectl/kind/k3s), so a live multi-broker Kafka roll, a
real Strimzi reconciliation, and a live Flink Kubernetes Operator upgrade cannot be run. What IS run
for real: the ISR-safe rolling-restart decision (modeled directly on KafkaAvailability's own logic,
SOURCES.md), the StatefulSet PVC-retention-policy resolution, and the Flink upgrade-mode state-carry
and savepoint-fallback decisions (modeled directly on the Flink Kubernetes Operator's documented
upgrade-mode table, SOURCES.md).
"""

from dataclasses import dataclass, field


# --- ISR-safe rolling restart: KafkaAvailability's own decision, run directly ---
@dataclass
class Topic:
    name: str
    min_insync_replicas: int | None  # None: topic has no min.insync.replicas configured
    isr: set[int]  # broker ids currently in the in-sync replica set


def would_affect_availability(broker_id: int, topics_on_broker: list[Topic]) -> bool:
    """SOURCES.md (KafkaAvailability.java): a topic with no min.insync.replicas configured never
    blocks a roll. A topic with it configured blocks the roll only if removing this broker from the
    ISR would take the ISR size below that minimum."""
    for t in topics_on_broker:
        if t.min_insync_replicas is None:
            continue
        if broker_id in t.isr and len(t.isr) - 1 < t.min_insync_replicas:
            return True
    return False


def can_roll(broker_id: int, topics_on_broker: list[Topic]) -> bool:
    return not would_affect_availability(broker_id, topics_on_broker)


def test_a_broker_with_no_min_insync_replicas_configured_can_always_roll():
    t = Topic("no-min-isr", min_insync_replicas=None, isr={1, 2, 3})
    assert can_roll(1, [t]) is True


def test_rolling_a_broker_that_would_drop_isr_below_min_insync_replicas_is_refused():
    # RF 3, min.insync.replicas 2, ISR currently {1, 2}: broker 3 already out of sync.
    t = Topic("acks-all-topic", min_insync_replicas=2, isr={1, 2})
    assert can_roll(1, [t]) is False
    assert can_roll(2, [t]) is False


def test_rolling_a_broker_that_leaves_min_insync_replicas_satisfied_is_allowed():
    # ISR {1, 2, 3}, min.insync.replicas 2: losing any one broker still leaves 2 in sync.
    t = Topic("healthy-topic", min_insync_replicas=2, isr={1, 2, 3})
    assert can_roll(1, [t]) is True
    assert can_roll(3, [t]) is True


def test_a_broker_not_in_the_isr_at_all_never_blocks_its_own_roll():
    t = Topic("already-out", min_insync_replicas=2, isr={2, 3})
    assert can_roll(1, [t]) is True


def test_a_broker_hosting_several_topics_is_blocked_if_any_one_topic_would_be_hurt():
    safe = Topic("safe", min_insync_replicas=1, isr={1, 2, 3})
    unsafe = Topic("unsafe", min_insync_replicas=2, isr={1, 2})
    assert can_roll(1, [safe, unsafe]) is False


# --- The hook, resolved: does the drain of two of three brokers (RF 3, min.insync.replicas 2) stall producers? ---
def test_hook_evicting_two_of_three_brokers_at_once_would_stall_acks_all_producers():
    t = Topic("hook-topic", min_insync_replicas=2, isr={1, 2, 3})
    # Evict broker 1 first: ISR would drop to {2, 3}, still >= 2 -- allowed.
    assert can_roll(1, [t]) is True
    # Now broker 1 is down, ISR is really {2, 3}. Rolling broker 2 next would drop it to just {3} < 2.
    t_after_first_eviction = Topic("hook-topic", min_insync_replicas=2, isr={2, 3})
    assert can_roll(2, [t_after_first_eviction]) is False
    # The roller's own rule (SOURCES.md) is exactly this: it declines the second restart, so the
    # drain that tries to take both at once stalls on the second broker rather than losing data.


# --- StatefulSet PVC retention: whenDeleted / whenScaled, each Delete or Retain ---
@dataclass
class RetentionPolicy:
    when_deleted: str  # "Delete" or "Retain"
    when_scaled: str  # "Delete" or "Retain"


def pvc_survives(policy: RetentionPolicy, event: str) -> bool:
    """SOURCES.md: each policy is independently Delete or Retain, and each applies only to its own
    event (the StatefulSet being deleted, or scaled down) -- not to a Pod replaced after node failure,
    which always keeps its PVC regardless of either policy."""
    if event == "node_failure_replacement":
        return True
    choice = policy.when_deleted if event == "statefulset_deleted" else policy.when_scaled
    return choice == "Retain"


def test_default_policy_retains_the_pvc_on_statefulset_deletion():
    default = RetentionPolicy(when_deleted="Retain", when_scaled="Retain")
    assert pvc_survives(default, "statefulset_deleted") is True


def test_whenscaled_delete_removes_only_the_scaled_down_pod_pvc_not_on_node_failure():
    policy = RetentionPolicy(when_deleted="Retain", when_scaled="Delete")
    assert pvc_survives(policy, "statefulset_scaled_down") is False
    assert pvc_survives(policy, "node_failure_replacement") is True


def test_whendeleted_and_whenscaled_are_independent():
    policy = RetentionPolicy(when_deleted="Delete", when_scaled="Retain")
    assert pvc_survives(policy, "statefulset_deleted") is False
    assert pvc_survives(policy, "statefulset_scaled_down") is True


# --- Flink upgrade modes: what each mode needs, and the savepoint-mode fallback ---
def upgrade_requires_healthy_job(mode: str) -> bool:
    """SOURCES.md: savepoint mode needs the job running to take the savepoint; last-state and
    stateless do not require a healthy job."""
    return mode == "savepoint"


def savepoint_upgrade_outcome(job_healthy: bool, checkpoint_available: bool) -> str:
    """SOURCES.md: savepoint mode takes a savepoint if the job is healthy. If unhealthy, it falls
    back to the last checkpoint -- and fails the upgrade entirely if no checkpoint exists either."""
    if job_healthy:
        return "savepoint_taken"
    if checkpoint_available:
        return "fell_back_to_last_checkpoint"
    return "upgrade_failed"


def test_savepoint_mode_is_the_only_mode_requiring_a_healthy_job():
    assert upgrade_requires_healthy_job("savepoint") is True
    assert upgrade_requires_healthy_job("last-state") is False
    assert upgrade_requires_healthy_job("stateless") is False


def test_a_healthy_job_in_savepoint_mode_takes_a_savepoint():
    assert savepoint_upgrade_outcome(job_healthy=True, checkpoint_available=True) == "savepoint_taken"


def test_an_unhealthy_job_in_savepoint_mode_falls_back_to_the_last_checkpoint():
    assert savepoint_upgrade_outcome(job_healthy=False, checkpoint_available=True) == "fell_back_to_last_checkpoint"


def test_an_unhealthy_job_with_no_checkpoint_fails_the_savepoint_upgrade():
    assert savepoint_upgrade_outcome(job_healthy=False, checkpoint_available=False) == "upgrade_failed"


# --- Checkpoint vs savepoint lifecycle ownership: who deletes it, and when ---
def is_deleted_on_job_termination(kind: str, retention_configured: bool) -> bool:
    """SOURCES.md: a checkpoint is deleted automatically on termination unless explicitly configured
    to be retained. A savepoint is never auto-deleted by Flink -- its lifecycle belongs to the user."""
    if kind == "savepoint":
        return False
    return not retention_configured


def test_a_default_checkpoint_is_deleted_when_the_job_terminates():
    assert is_deleted_on_job_termination("checkpoint", retention_configured=False) is True


def test_a_checkpoint_configured_to_be_retained_survives_termination():
    assert is_deleted_on_job_termination("checkpoint", retention_configured=True) is False


def test_a_savepoint_is_never_auto_deleted_regardless_of_retention_config():
    assert is_deleted_on_job_termination("savepoint", retention_configured=False) is False
    assert is_deleted_on_job_termination("savepoint", retention_configured=True) is False


if __name__ == "__main__":
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        t()
        print(f"ok  {t.__name__}")
    print(f"\n{len(tests)} checks passed.")
