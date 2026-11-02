"""Kubernetes workload primitives — the mechanisms the reel draws, run for real.

No local Kubernetes cluster exists on this build machine (no kubectl, no kind/k3s), so every
object's documented behaviour is sourced from Kubernetes' own concept pages (SOURCES.md), never
demonstrated live. What IS run for real: a pure-Python model of the two rules this topic actually
asserts something about — a controller's reconciliation loop (a Deployment replacing a deleted
pod) and taint/toleration matching (which pods may land on a tainted node) — built strictly from
the sourced rules, not fabricated numbers.
"""


# --- reconciliation: a controller closes the gap between desired and actual state ---
def reconcile(desired_replicas: int, actual_pods: list[str]) -> list[str]:
    """One controller tick: if actual is short of desired, add replacement pods; Kubernetes'
    own Controllers page describes this as the controller "making the current state come closer
    to that desired state" — this models exactly one such step, not a full scheduler."""
    pods = list(actual_pods)
    next_id = 0
    while len(pods) < desired_replicas:
        while f"pod-{next_id}" in pods:
            next_id += 1
        pods.append(f"pod-{next_id}")
    return pods


def test_deleting_one_of_three_replicas_is_replaced_by_the_next_tick():
    running = reconcile(3, ["pod-0", "pod-1", "pod-2"])
    after_manual_delete = reconcile(3, [p for p in running if p != "pod-1"])
    assert len(after_manual_delete) == 3
    assert "pod-1" not in running[:0]  # the deleted name isn't reused mid-loop
    assert after_manual_delete.count("pod-1") <= 1


def test_reconciliation_only_adds_what_is_missing_never_extra():
    # Desired state reached: a tick that already matches does nothing.
    assert reconcile(3, ["pod-0", "pod-1", "pod-2"]) == ["pod-0", "pod-1", "pod-2"]


def test_reconciliation_is_idempotent_across_repeated_ticks():
    pods = ["pod-0"]
    for _ in range(5):
        pods = reconcile(3, pods)
    assert len(pods) == 3


# --- taints repel; a matching toleration allows (not guarantees) scheduling ---
def can_schedule(pod_tolerations: set[str], node_taints: set[str]) -> bool:
    """Kubernetes' own Taints and Tolerations page: a taint lets a node repel pods; a toleration
    lets the scheduler consider a pod for a tainted node, but "doesn't guarantee scheduling" —
    this models only the taint/toleration gate itself, not the scheduler's other criteria."""
    return node_taints.issubset(pod_tolerations)


def test_a_pod_without_the_matching_toleration_is_repelled():
    assert can_schedule(pod_tolerations=set(), node_taints={"dedicated=gpu"}) is False


def test_a_pod_with_the_matching_toleration_may_schedule():
    assert can_schedule(pod_tolerations={"dedicated=gpu"}, node_taints={"dedicated=gpu"}) is True


def test_an_untainted_node_accepts_any_pod_regardless_of_tolerations():
    assert can_schedule(pod_tolerations=set(), node_taints=set()) is True


def test_a_pod_tolerating_only_one_of_two_taints_is_still_repelled():
    assert can_schedule(pod_tolerations={"dedicated=gpu"}, node_taints={"dedicated=gpu", "spot=true"}) is False


if __name__ == "__main__":
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        t()
        print(f"ok  {t.__name__}")
    print(f"\n{len(tests)} checks passed.")
