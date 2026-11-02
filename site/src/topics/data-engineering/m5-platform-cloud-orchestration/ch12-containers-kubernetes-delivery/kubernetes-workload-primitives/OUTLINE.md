# OUTLINE: Kubernetes workload primitives (`de.kubernetes-workload-primitives`)

Refresher, §12.2, ~5 min. Folder: `kubernetes-workload-primitives`.

## Progress

Research done, SOURCES.md checked (16 quotes). No local Kubernetes cluster on this build machine (no `kubectl`, no `kind`/`k3s`), so every object's behaviour is sourced from Kubernetes' own concept pages, not demonstrated live. What runs for real in `examples.py`: a pure-Python reconciliation-loop simulation (a declared replica count vs. an actual one, closing the gap exactly the way a Deployment controller does) and a taint/toleration matching simulation (which of a set of pods may schedule onto a tainted node), both built from the sourced rules, not fabricated numbers.

## Outcomes

1. Name what each primitive is for and pick the right one for a stateless service, a stateful broker and a configuration file.
2. Describe the reconciliation loop and say what drift is.
3. Say why a Secret is not secure by default (stored unencrypted unless encryption at rest is configured).

## Reel steps (storyboard)

1. **Hook** — you delete a pod by hand; a replacement appears seconds later. You edit a running pod's field by hand; it's quietly set back. What keeps doing that?
2. **Predict** (step 2, within first four) — "A Deployment with three replicas; you delete one pod by hand. One minute later, how many pods are running, and who made the replacement?" Options: two, nobody refills it / three, the Deployment's controller / three, but only after you run `kubectl apply` again / four, the deleted one restarts plus a new one. Correct: three, the Deployment's controller.
3. **The control loop, named** — spec above, status below, a controller that continuously narrows the gap; the pod you deleted was status drifting from spec, and the controller closed it without being asked twice.
4. **Pod, Deployment, StatefulSet** — a Pod is the schedulable unit (one or more containers sharing network and storage); a Deployment gives it interchangeable, stateless replicas; a StatefulSet gives each pod a sticky, ordinal identity and its own volume that follows it across restarts — not interchangeable. Takeaway.
5. **Service and DNS** — a stable name and address in front of a changing set of pods; a lookup on a Service's DNS name resolves the same way regardless of which pod answers.
6. **ConfigMaps and Secrets** — the cluster-side counterpart of "environment and mounted files" from topic 1. A Secret is not encryption: by default it sits unencrypted in the same data store a ConfigMap does, readable by anyone with API access to the namespace. Takeaway.
7. **PersistentVolumes, Claims, StorageClasses** — a PV is storage the cluster knows about; a PVC is a pod's request for some; a StorageClass is what lets the cluster provision one on demand instead of an administrator pre-creating every PV by hand.
8. **Taints, tolerations, affinity** — a taint repels; only a matching toleration lets a pod land anyway; affinity pulls a pod toward (or away from) a set of nodes as a preference or a hard requirement. Takeaway.
9. **Restart policies and the reconciliation idea, restated** — every object in this refresher is a declared spec a controller works to match; the chapter's whole second half is this loop seen from different angles (requests/limits, Jobs, Spark, stateful sets, GitOps).
10. **Recap.**

Engagement: hook step 1, one predict (step 2, within first four — a refresher needs one), ≥3 takeaways (steps 4, 6, 8).

## Claims list

| Claim | Source |
|---|---|
| A controller is a control loop that watches cluster state and acts to narrow the gap between actual and desired | Kubernetes Controllers docs |
| A StatefulSet gives each pod a sticky, non-interchangeable identity (ordinal, network, storage) across rescheduling | Kubernetes StatefulSets docs |
| A Service's DNS name resolves consistently regardless of which pod answers | Kubernetes Service docs |
| A Secret is, by default, stored unencrypted in the API server's own data store (etcd); anyone with API access to the namespace can read it | Kubernetes Secrets docs |
| base64 in a Secret obscures but does not secure a value | Kubernetes Secrets docs |
| A PersistentVolume is storage the cluster knows about; a PersistentVolumeClaim is a pod's request for some; a StorageClass lets the cluster provision one dynamically | Kubernetes Persistent Volumes docs |
| A taint repels a set of pods from a node; a toleration allows (not guarantees) scheduling onto it anyway | Kubernetes Taints and Tolerations docs |
| `nodeSelector` is the simplest node-selection constraint; affinity is the richer, preference-or-requirement version | Kubernetes Assigning Pods to Nodes docs |
| The declared cluster state is replicated through Raft in etcd, a single consistent replication group | etcd documentation |

## Post-notes headings

`outcomes`, `internals` ("A little deeper": the control loop; Secrets aren't encryption; taints vs affinity), `lab` ("Try it": the reconciliation-loop and taint-matching simulations — no local cluster on this machine), `production` ("In code review": Secret handling, StatefulSet vs Deployment choice), `next` ("Where this goes next": requests/limits/QoS is the next topic).

## Bridge / handoff

Per CHAPTER.md topic 3 entry.

## Concept ledger

Introduces: `k8s-workload-objects`, `k8s-reconciliation-loop`, `k8s-placement-and-storage`.
Uses: `container-config-injection` (topic 1), `cgroup-memory-cpu-limits` (topic 2 — the kubelet is what writes the limit file).
Declared: the etcd/Raft claim about the replicated store behind the API server. CHAPTER.md names this as building on "Chapter 5" (Database Internals and Distributed Storage), but no topic there currently introduces a consensus/Raft/Paxos concept id — checked `registry.ts` directly (its replication topics are `de.synchronous-asynchronous-semi-synchronous` and `de.physical-vs-logical-replication`, neither of which introduces a consensus id). Per CHAPTER.md's own cross-chapter-id rule, this is declared rather than guessed; a seam pass should add it to `uses` once such an id exists.
