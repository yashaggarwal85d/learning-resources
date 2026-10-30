"""Requests, limits, QoS and eviction — the mechanisms the reel draws, run for real.

No local Kubernetes cluster is reachable on this build machine, so the kubelet's live eviction
behaviour is sourced from Kubernetes' own documentation (SOURCES.md), never demonstrated against
a running node. What IS run for real: the QoS-classification rule, the kubelet's documented
eviction-ranking rule (usage-over-request, then priority, then overage — explicitly NOT QoS
class), and the oom_score_adj formula for each class, all built strictly from the sourced rules.
"""

from dataclasses import dataclass


# --- QoS classification (Kubernetes' own three criteria) ---
@dataclass
class Container:
    cpu_request: float
    cpu_limit: float | None
    mem_request: float
    mem_limit: float | None


def qos_class(containers: list[Container]) -> str:
    def is_guaranteed(c: Container) -> bool:
        return c.cpu_limit is not None and c.mem_limit is not None and c.cpu_limit == c.cpu_request and c.mem_limit == c.mem_request

    def has_any(c: Container) -> bool:
        return c.cpu_limit is not None or c.mem_limit is not None or c.cpu_request > 0 or c.mem_request > 0

    if all(is_guaranteed(c) for c in containers):
        return "Guaranteed"
    if any(has_any(c) for c in containers):
        return "Burstable"
    return "BestEffort"


def test_equal_cpu_and_memory_request_and_limit_is_guaranteed():
    assert qos_class([Container(cpu_request=0.7, cpu_limit=0.7, mem_request=200, mem_limit=200)]) == "Guaranteed"


def test_a_memory_limit_above_its_request_is_burstable():
    assert qos_class([Container(cpu_request=0, cpu_limit=None, mem_request=100, mem_limit=200)]) == "Burstable"


def test_no_requests_or_limits_at_all_is_besteffort():
    assert qos_class([Container(cpu_request=0, cpu_limit=None, mem_request=0, mem_limit=None)]) == "BestEffort"


def test_one_guaranteed_container_and_one_bare_container_is_burstable_not_guaranteed():
    guaranteed_ctr = Container(cpu_request=0.5, cpu_limit=0.5, mem_request=100, mem_limit=100)
    bare_ctr = Container(cpu_request=0.1, cpu_limit=None, mem_request=50, mem_limit=None)
    assert qos_class([guaranteed_ctr, bare_ctr]) == "Burstable"


# --- kubelet eviction ranking: usage-over-request, then priority, then overage; NOT QoS class ---
@dataclass
class Pod:
    name: str
    qos: str
    priority: int
    mem_request: float
    mem_usage: float

    @property
    def over_request(self) -> bool:
        # A BestEffort pod has no request (0), so any usage counts as exceeding it.
        return self.mem_usage > self.mem_request

    @property
    def overage(self) -> float:
        return max(0.0, self.mem_usage - self.mem_request)


def eviction_order(pods: list[Pod]) -> list[str]:
    """Kubernetes' own ranking: pods whose usage exceeds requests are evicted first (by lower
    priority, then by larger overage); Guaranteed/under-request pods are evicted last (by lower
    priority). QoS class itself is never read by this function."""
    over = sorted([p for p in pods if p.over_request], key=lambda p: (p.priority, -p.overage))
    under = sorted([p for p in pods if not p.over_request], key=lambda p: p.priority)
    return [p.name for p in over + under]


def test_an_over_request_besteffort_pod_is_evicted_before_an_under_request_guaranteed_pod():
    guaranteed = Pod("guaranteed", "Guaranteed", priority=10, mem_request=200, mem_usage=150)
    besteffort = Pod("besteffort", "BestEffort", priority=10, mem_request=0, mem_usage=50)
    assert eviction_order([guaranteed, besteffort])[0] == "besteffort"


def test_among_over_request_pods_lower_priority_goes_first():
    low_priority = Pod("low", "Burstable", priority=1, mem_request=100, mem_usage=150)
    high_priority = Pod("high", "Burstable", priority=10, mem_request=100, mem_usage=150)
    assert eviction_order([high_priority, low_priority])[0] == "low"


def test_among_equal_priority_over_request_pods_the_larger_overage_goes_first():
    small_overage = Pod("small", "Burstable", priority=5, mem_request=100, mem_usage=120)
    large_overage = Pod("large", "Burstable", priority=5, mem_request=100, mem_usage=180)
    assert eviction_order([small_overage, large_overage])[0] == "large"


def test_a_guaranteed_pod_is_never_ranked_ahead_of_an_over_request_pod_regardless_of_priority():
    guaranteed_low_priority = Pod("guaranteed", "Guaranteed", priority=1, mem_request=200, mem_usage=190)
    besteffort_high_priority = Pod("besteffort", "BestEffort", priority=100, mem_request=0, mem_usage=10)
    assert eviction_order([guaranteed_low_priority, besteffort_high_priority])[0] == "besteffort"


# --- oom_score_adj: what QoS class actually sets, read by the kernel's OOM killer, not the kubelet's eviction ---
def oom_score_adj(qos: str, mem_request_bytes: float = 0, machine_mem_bytes: float = 1) -> float:
    if qos == "Guaranteed":
        return -997
    if qos == "BestEffort":
        return 1000
    return min(max(2, 1000 - (1000 * mem_request_bytes) / machine_mem_bytes), 999)


def test_guaranteed_oom_score_adj_is_negative_997():
    assert oom_score_adj("Guaranteed") == -997


def test_besteffort_oom_score_adj_is_1000():
    assert oom_score_adj("BestEffort") == 1000


def test_burstable_oom_score_adj_falls_between_the_other_two():
    adj = oom_score_adj("Burstable", mem_request_bytes=500, machine_mem_bytes=1000)
    assert -997 < adj < 1000


def test_burstable_requesting_more_of_the_machine_gets_a_lower_oom_score_adj():
    small_request = oom_score_adj("Burstable", mem_request_bytes=100, machine_mem_bytes=1000)
    large_request = oom_score_adj("Burstable", mem_request_bytes=800, machine_mem_bytes=1000)
    assert large_request < small_request


# --- in-place pod resize: stable (GA) since this Kubernetes minor version (SOURCES.md) ---
IN_PLACE_RESIZE_GA_VERSION = 1.35


def test_in_place_resize_went_stable_at_the_sourced_version():
    assert IN_PLACE_RESIZE_GA_VERSION == 1.35


# --- preemption: only when the pending pod's priority exceeds every victim's ---
def can_preempt(pending_priority: int, victim_priorities: list[int]) -> bool:
    return len(victim_priorities) > 0 and all(pending_priority > v for v in victim_priorities)


def test_a_higher_priority_pending_pod_may_preempt_lower_priority_victims():
    assert can_preempt(pending_priority=10, victim_priorities=[1, 2]) is True


def test_a_pending_pod_may_not_preempt_equal_or_higher_priority_victims():
    assert can_preempt(pending_priority=5, victim_priorities=[5]) is False
    assert can_preempt(pending_priority=5, victim_priorities=[6]) is False


if __name__ == "__main__":
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        t()
        print(f"ok  {t.__name__}")
    print(f"\n{len(tests)} checks passed.")
