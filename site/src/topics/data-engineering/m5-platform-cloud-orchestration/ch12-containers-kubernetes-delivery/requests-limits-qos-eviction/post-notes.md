<section data-section="outcomes">

## After this topic you can

- Classify any pod's QoS from its resource block.
- Predict, for a pressured node, which pod the kubelet evicts first and which the kernel OOM killer takes instead, and say why those are two rankings, not one.
- Explain why a PodDisruptionBudget does not protect against node-pressure eviction.
- Decide whether a batch executor should carry a CPU limit and defend the choice.
- State what in-place resize can and cannot change.

</section>

<section data-section="internals">

## A little deeper

### Two rankings, not one

Kubernetes' own node-pressure eviction page gives the kubelet's ranking in its own words: pods are ranked and evicted "BestEffort or Burstable pods where the usage exceeds requests... based on their Priority and then by how much their usage level exceeds the request," with "Guaranteed pods and Burstable pods where the usage is less than requests... evicted last, based on their Priority" — and explicitly, "the kubelet does not use the pod's QoS class to determine the eviction order." QoS class instead sets something else entirely: the kernel's `oom_score_adj` (-997 for Guaranteed, 1000 for BestEffort, a formula scaled by request size for Burstable), which only matters if the kernel's own OOM killer fires before the kubelet's eviction loop gets there. The two usually agree, but the documentation never promises they will.

Even a Guaranteed pod isn't completely safe: it "will never be evicted because of another pod's resource consumption," but if a system daemon like `kubelet` or `journald` consumes more than its own `system-reserved`/`kube-reserved` allocation, "the kubelet must choose to evict one of these pods to preserve node stability," picking the lowest-priority one.

### The CPU-limit debate

A CPU limit (topic 2's `cpu.max`) throttles a pod the instant it exceeds its own quota, on an idle node or a busy one — that part isn't in dispute. What is debated is whether to set one at all. One widely cited practitioner position (Robusta's "Stop Using CPU Limits" post) argues the opposite of the obvious intuition: "Disable your CPU limits! If you give all your K8s pods accurate CPU requests, then no-one can throttle them because CPU is reserved for them if they need it." That's a stated opinion, not a Kubernetes guarantee — the counter-mechanism, directly from how `cpu.max` works, is that a limit caps what any single pod can burst to, which is exactly what makes a node's spare capacity predictable for anyone else sharing it.

### Why a resize can't cross a QoS boundary

In-place pod resize has been stable since Kubernetes v1.35. It lets requests and limits change on a running pod without a restart, but the resize task page is explicit that a pod's QoS class "is determined at creation and cannot be changed by a resize" — a Guaranteed pod's resized limit must still equal its resized request, or the resize is rejected rather than silently reclassifying the pod. A memory *decrease* is also only best-effort: the kubelet tries to avoid an OOM-kill while shrinking a limit, but doesn't guarantee it.

</section>

<section data-section="lab">

## Try it

This topic hosts no lab of its own (per CHAPTER.md's lab table, its predictions are checked against the pod and node events of topic 6's Spark-on-Kubernetes lab). What *is* run for real here: `examples.py`'s QoS-classification function (the exact Guaranteed/Burstable/BestEffort rule), its eviction-ranking function (usage-over-request, then priority, then overage — never QoS class itself), its `oom_score_adj` formula for each class, and a preemption-eligibility check.

```
$ python3 examples.py
ok  test_a_guaranteed_pod_is_never_ranked_ahead_of_an_over_request_pod_regardless_of_priority
ok  test_a_higher_priority_pending_pod_may_preempt_lower_priority_victims
ok  test_a_memory_limit_above_its_request_is_burstable
ok  test_a_pending_pod_may_not_preempt_equal_or_higher_priority_victims
ok  test_among_equal_priority_over_request_pods_the_larger_overage_goes_first
ok  test_among_over_request_pods_lower_priority_goes_first
ok  test_an_over_request_besteffort_pod_is_evicted_before_an_under_request_guaranteed_pod
ok  test_besteffort_oom_score_adj_is_1000
ok  test_burstable_oom_score_adj_falls_between_the_other_two
ok  test_burstable_requesting_more_of_the_machine_gets_a_lower_oom_score_adj
ok  test_equal_cpu_and_memory_request_and_limit_is_guaranteed
ok  test_guaranteed_oom_score_adj_is_negative_997
ok  test_in_place_resize_went_stable_at_the_sourced_version
ok  test_no_requests_or_limits_at_all_is_besteffort
ok  test_one_guaranteed_container_and_one_bare_container_is_burstable_not_guaranteed

15 checks passed.
```

</section>

<section data-section="production">

## In code review

- **A missing or wildly inaccurate memory request.** Everything in this topic's eviction ranking is relative to the request; a request that's too low makes a pod "over request" almost immediately, moving it to the front of the eviction line regardless of how little memory it's actually using.
- **A PodDisruptionBudget assumed to protect against an OOM-driven node drain.** It doesn't — PDBs bind the Eviction API (drains, voluntary disruption), never node-pressure eviction, which the kubelet runs with a zero-second grace period under a hard threshold.
- **Relying on in-place resize to "promote" a pod to Guaranteed.** A resize that would change a pod's QoS class is rejected outright; reclassifying a pod means recreating it.

</section>

<section data-section="next">

## Where this goes next

A pod with the right resources still has to be a pod that is meant to end. A nightly pipeline is not a service: it runs, finishes, and must be retried with care. The next topic is the Kubernetes objects built for exactly that: Jobs, per-index retries, failure policy, and the CronJob that starts them.

</section>
