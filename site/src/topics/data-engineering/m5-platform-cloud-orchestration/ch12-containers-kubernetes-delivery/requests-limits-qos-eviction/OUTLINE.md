# OUTLINE: Requests, limits, QoS and eviction (`de.requests-limits-qos-eviction`)

Full, §12.2, ~15 min. Folder: `requests-limits-qos-eviction`.

## Progress

Research done, SOURCES.md checked (24 quotes). No local Kubernetes cluster on this build machine, so the kubelet's live eviction behaviour is sourced from Kubernetes' own documentation, not demonstrated against a running node. What runs for real in `examples.py`: the QoS-classification rule (Guaranteed/Burstable/BestEffort from a pod's own requests/limits), the kubelet's documented eviction-ranking rule (usage-over-request first, then priority, then overage — explicitly NOT QoS class), and the `oom_score_adj` formula for each class, all built from the sourced rules.

## Outcomes

1. Classify any pod's QoS from its resource block.
2. Predict, for a pressured node, which pod the kubelet evicts first (by usage over requests, then priority) and which the kernel OOM killer takes instead (by `oom_score_adj`), and say why those are two rankings, not one.
3. Explain why a PodDisruptionBudget does not protect against node-pressure eviction.
4. Decide whether a batch executor should carry a CPU limit and defend the choice.
5. State what in-place resize can and cannot change.

## Reel steps (storyboard)

1. **Hook** — a node runs low on memory; three pods on it carry the same limit. Which does the kubelet evict first, and which does the kernel kill if the kubelet is too slow — are they the same pod?
2. **Predict** (step 2, within first four) — three pods: Guaranteed, Burstable over its request, BestEffort. Which does the kubelet evict first? Options: the BestEffort pod / the Burstable pod, since it's over its request / whichever has used the most memory in absolute terms / they're evicted together. Correct: the logic is "usage over request first, then priority" — with no other BestEffort/over-request pod present it's whichever pod is over its request, ranked by priority then overage (framed so the BestEffort pod, having no request at all, counts as maximally over).
3. **Request vs limit, the two different jobs** — the scheduler places a pod by its request (what must fit); the kubelet (and ultimately the kernel) enforces its limit (what may never be exceeded). The gap between the two, summed across a node, is overcommit.
4. **Three QoS classes, from one rule** — Guaranteed (every container's limit equals its request, for both CPU and memory), Burstable (at least one request or limit set, but not Guaranteed), BestEffort (none at all). Takeaway.
5. **Two rankings, not one** — the kubelet's own eviction order ignores QoS class entirely (usage-over-request, then priority, then overage); the kernel's OOM killer uses `oom_score_adj`, which QoS class does set directly (-997 Guaranteed, a formula for Burstable, 1000 BestEffort). QoS is only a rough estimate of the kubelet's actual ranking. Takeaway.
6. **The exception: a Guaranteed pod can still be evicted** — not by another pod's usage, but if a system daemon itself needs memory the reservations didn't account for; then the kubelet evicts the lowest-priority Guaranteed/under-request pod to protect the node.
7. **Predict 2 — who wins the race** — the kubelet polls for memory pressure at an interval; a memory spike that outruns that poll reaches the kernel's own OOM killer before the kubelet's eviction loop ever acts. Which one kills the pod in that case? Options: the kubelet's eviction, always / the kernel's OOM killer, if the spike is fast enough / neither — Kubernetes always wins the race / it's random. Correct: the kernel's OOM killer, if the spike outruns the kubelet's polling interval — which is exactly why the two rankings can disagree about which pod actually dies.
8. **The CPU-limit debate, named honestly** — with a limit, a pod is throttled even on an idle node the moment it exceeds its own quota (topic 2's mechanism); one practitioner argument (labeled as opinion) says this makes limits actively harmful and recommends requests alone; the counter-mechanism is that a limit caps what any single pod can burst to, which is what makes node capacity planning predictable. Builder states both, labels the opinion.
9. **PodDisruptionBudgets don't reach node pressure** — a PDB governs the Eviction API (a drain, a node upgrade); node-pressure eviction is documented as an involuntary disruption, which a PDB cannot prevent, only count against; the kubelet uses a zero grace period under a hard threshold regardless. Takeaway.
10. **Priority, preemption, and in-place resize** — a pending higher-priority pod can preempt lower-priority ones (never the reverse, never without a real resource shortfall); in-place resize (stable since 1.35) lets requests/limits change without a restart, but never changes a pod's QoS class — a resize that would cross a class boundary is rejected.
11. **Recap.**

Engagement: hook step 1, two predicts (step 2 within first four; a second predict folded into step 7's "which ranking wins" framing — see reel.tsx for exact placement), ≥3 takeaways (steps 4, 5, 9).

## Claims list

| Claim | Source |
|---|---|
| Guaranteed requires every container's CPU and memory limit to equal its request | Kubernetes QoS docs |
| Burstable is "not Guaranteed, but at least one request or limit set"; BestEffort is none at all | Kubernetes QoS docs |
| The kubelet's eviction ranking: usage-over-request first (by priority, then overage), then Guaranteed/under-request pods last (by priority); QoS class is NOT used to rank | Kubernetes node-pressure eviction docs |
| A Guaranteed pod is never evicted for another pod's consumption, but can be evicted if a system daemon needs memory the reservations didn't account for | Kubernetes node-pressure eviction docs |
| `oom_score_adj`: Guaranteed -997, BestEffort 1000, Burstable a formula scaled by request vs. machine memory | Kubernetes node-pressure eviction docs |
| The kubelet may not observe memory pressure fast enough; `--kernel-memcg-notification` is the documented mitigation | Kubernetes node-pressure eviction docs |
| Default hard eviction threshold for memory is `memory.available<100Mi` on Linux | Kubernetes node-pressure eviction docs |
| The kubelet ignores a pod's PodDisruptionBudget and `terminationGracePeriodSeconds` for node-pressure eviction; hard thresholds use a 0s grace period | Kubernetes node-pressure eviction docs |
| Node-pressure eviction is listed as an involuntary disruption; involuntary disruptions cannot be prevented by a PDB, only counted against it | Kubernetes disruptions docs |
| A PDB limits how many replicas may be down from voluntary disruption at once (the Eviction API enforces it) | Kubernetes disruptions docs |
| Preemption happens only when the pending pod's priority is higher than the victims'; victims get their normal termination grace period first | Kubernetes pod priority and preemption docs |
| In-place pod resize has been stable (GA) since Kubernetes v1.35 | Kubernetes autoscaling workloads docs |
| A resize cannot change a pod's QoS class; a memory decrease is best-effort, not guaranteed | Kubernetes resize-container-resources docs |
| "Disable your CPU limits... because CPU is reserved for them if they need it" — a stated practitioner opinion against CPU limits | Robusta blog, labeled as opinion |

## Post-notes headings

`outcomes`, `internals` ("A little deeper": two rankings, not one; the CPU-limit debate; in-place resize's QoS-class boundary), `lab` ("Try it": the QoS-classification and eviction-ranking simulations — checked against topic 6's lab events, per CHAPTER.md's lab table, since this topic hosts none of its own), `production` ("In code review": setting requests accurately, PDB scope, the CPU-limit decision), `next` ("Where this goes next": Jobs and CronJobs, the next workload shape).

## Bridge / handoff

Per CHAPTER.md topic 4 entry.

## Concept ledger

Introduces: `requests-vs-limits`, `qos-classes-eviction`, `pdb-priority-preemption`, `in-place-pod-resize`.
Uses: `cgroup-memory-cpu-limits`, `oom-kill-vs-runtime-oom` (topic 2), `k8s-workload-objects`, `k8s-reconciliation-loop`, `k8s-placement-and-storage` (topic 3).
Declared: none.
