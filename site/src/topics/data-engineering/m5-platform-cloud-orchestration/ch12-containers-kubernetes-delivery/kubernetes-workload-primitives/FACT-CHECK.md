# Fact-check, currency and red team — `de.kubernetes-workload-primitives`

Self-review; no independent reviewer.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | A controller is a control loop narrowing actual state toward desired state | Confirmed | Kubernetes Controllers docs, verbatim |
| 2 | A StatefulSet gives each pod a sticky, non-interchangeable identity across rescheduling | Confirmed | Kubernetes StatefulSets docs, verbatim |
| 3 | A Service's DNS name resolves the same way regardless of which pod answers | Confirmed | Kubernetes Service docs, verbatim (ExternalName example used for the DNS-CNAME mechanism; a ClusterIP Service's own DNS record works the same way per the same page) |
| 4 | A Secret is, by default, stored unencrypted in etcd; anyone with API access to the namespace can read it | Confirmed | Kubernetes Secrets docs, verbatim |
| 5 | base64 obscures, does not secure, a Secret's value | Confirmed | Kubernetes Secrets docs, verbatim |
| 6 | A PersistentVolume/Claim/StorageClass relationship: PV is supply, PVC is a request, StorageClass enables dynamic provisioning | Confirmed | Kubernetes Persistent Volumes docs, verbatim |
| 7 | A taint repels; a toleration allows but doesn't guarantee scheduling | Confirmed | Kubernetes Taints and Tolerations docs, verbatim |
| 8 | `nodeSelector` is the simplest node-selection constraint | Confirmed | Kubernetes Assigning Pods to Nodes docs, verbatim |
| 9 | etcd's declared-state store uses Raft within a single replication group | Confirmed | etcd documentation, verbatim |

| 10 | A pod's `restartPolicy` (`Always`/`OnFailure`/`Never`) decides whether the kubelet restarts a finished container on the same node; a node pool is a set of same-shaped, often same-tainted nodes | Stated from general Kubernetes knowledge, not quoted from a fetched source | Not in SOURCES.md — a brief Deep-dive mention only, kept to the well-established field values and definition, not a claim needing primary-source verbatim backing |

## Red team

- Checked that the DNS quote used (ExternalName's CNAME mechanism) doesn't overclaim: a plain ClusterIP Service's own DNS A/AAAA record works differently in detail (it points at the Service's own cluster IP, not a CNAME to an external name), but the same page states a Service always gets a DNS name resolvable inside the cluster regardless of which pod backs it — the reel's claim is scoped to "a Service's name resolves consistently", not to the CNAME mechanism specifically, so it doesn't overreach past what's sourced.
- The `consensus-raft-paxos-in-systems` concept id named in CHAPTER.md's planning brief does not exist in `registry.ts` under any DE chapter 5 topic at this writing (checked directly: `de.synchronous-asynchronous-semi-synchronous` and `de.physical-vs-logical-replication` are chapter 5's replication topics, neither introduces a consensus id). Declared instead of guessed, per CHAPTER.md's own rule; logged in `OUTLINE.md`.
- Verified the Deployment hook/predict scenario (delete one of three replicas, one minute later three are running again) against the Controllers page's own Job-controller example and the Deployment/ReplicaSet reconciliation model it describes — a deleted pod is drift the ReplicaSet controller (which a Deployment manages) closes by creating a replacement, not a special case.
- Confirmed the taint/toleration-matching simulation in `examples.py` only implements the sourced rule ("a toleration allows scheduling but doesn't guarantee it — the scheduler also evaluates other parameters") loosely: the simulation checks taint-toleration matching only, and is labelled as such, not as a full scheduler model.
