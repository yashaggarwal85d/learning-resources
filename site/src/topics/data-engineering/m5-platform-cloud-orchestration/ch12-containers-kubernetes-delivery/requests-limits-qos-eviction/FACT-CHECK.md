# Fact-check, currency and red team — `de.requests-limits-qos-eviction`

Self-review; no independent reviewer.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Guaranteed requires every container's CPU and memory limit to equal its request | Confirmed | Kubernetes QoS docs, verbatim |
| 2 | Burstable/BestEffort criteria as the "not Guaranteed, has some vs. has none" split | Confirmed | Kubernetes QoS docs, verbatim |
| 3 | Kubelet eviction ranks by usage-over-request then priority then overage, explicitly not by QoS class | Confirmed | Kubernetes node-pressure eviction docs, verbatim |
| 4 | A Guaranteed pod is never evicted for another pod's usage, but can be for a system daemon's own need | Confirmed | Kubernetes node-pressure eviction docs, verbatim |
| 5 | `oom_score_adj`: -997 Guaranteed, 1000 BestEffort, a formula for Burstable | Confirmed | Kubernetes node-pressure eviction docs, verbatim |
| 6 | The kubelet may not observe memory pressure fast enough; `--kernel-memcg-notification` mitigates | Confirmed | Kubernetes node-pressure eviction docs, verbatim |
| 7 | Default hard memory eviction threshold is `memory.available<100Mi` on Linux | Confirmed | Kubernetes node-pressure eviction docs, verbatim |
| 8 | The kubelet ignores PDBs and `terminationGracePeriodSeconds` for node-pressure eviction; hard thresholds use 0s grace | Confirmed | Kubernetes node-pressure eviction docs, verbatim |
| 9 | Node-pressure eviction is an involuntary disruption; involuntary disruptions can't be prevented by a PDB, only counted against it | Confirmed | Kubernetes disruptions docs, verbatim |
| 10 | Preemption needs the pending pod's priority to exceed the victims'; victims keep their normal termination grace period | Confirmed | Kubernetes pod priority and preemption docs, verbatim |
| 11 | In-place pod resize has been GA (stable) since v1.35 | Confirmed, version-checked | Kubernetes autoscaling workloads docs, verbatim |
| 12 | A resize cannot change QoS class; a memory decrease is best-effort | Confirmed | Kubernetes resize-container-resources docs, verbatim |
| 13 | A practitioner argument against CPU limits exists and is widely cited | Confirmed as opinion, labeled as such in the reel | Robusta blog, verbatim, explicitly attributed and framed as one practitioner's position |

## Red team

- The step-2 predict scenario (three pods: Guaranteed, Burstable-over-request, BestEffort — which is evicted first) needed care: the sourced ranking is "usage exceeds requests first (ranked by priority then overage), then Guaranteed/under-request pods last (by priority)." A BestEffort pod has no request at all, so by definition its usage always "exceeds" its (zero) request — it is always in the first-ranked group alongside any over-request Burstable pod, and between the two the tie-break is priority then overage amount. The reel's explain text states this precisely rather than oversimplifying to "BestEffort always dies first," which the documentation doesn't quite say in those words (it's a consequence of the ranking rule, not a separate rule).
- Checked that "two rankings, not one" doesn't overstate the kubelet's own caution: the docs explicitly say QoS class is only used "to estimate the most likely pod eviction order," not that it's unrelated — `oom_score_adj` (what QoS actually sets) and the kubelet's usage/priority/overage ranking usually agree in practice, but the documentation itself declines to guarantee they do, which is the reel's precise claim.
- The CPU-limit debate step is red-teamed for balance: Robusta's position is explicitly introduced as "one practitioner argument (labeled as opinion)," not as settled fact, per CHAPTER.md's instruction that "any practitioner opinion" must be labeled; the counter-mechanism (a limit caps a single pod's burst, aiding node capacity planning) is stated as the documented behavior of `cpu.max` (topic 2's own sourced mechanism), not as a competing opinion needing its own citation.
- Verified the in-place resize claim doesn't overreach: the resize page's "Limitations" section (current at research time, Kubernetes 1.37 docs) is quoted for the memory-decrease and QoS-class-boundary claims specifically, not generalized to every resize scenario.
