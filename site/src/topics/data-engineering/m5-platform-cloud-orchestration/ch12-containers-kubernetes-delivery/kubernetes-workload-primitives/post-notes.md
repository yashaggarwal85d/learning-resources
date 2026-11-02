<section data-section="outcomes">

## After this refresher you can

- Name what each primitive is for and pick the right one for a stateless service, a stateful broker and a configuration file.
- Describe the reconciliation loop and say what drift is.
- Say why a Secret is not secure by default (stored unencrypted unless encryption at rest is configured).

</section>

<section data-section="internals">

## A little deeper

### The control loop, everywhere

Kubernetes' own Controllers page states it plainly: "In Kubernetes, controllers are control loops that watch the state of your cluster, then make or request changes where needed," and "Each controller tries to move the current cluster state closer to the desired state." A controller tracks at least one resource type whose spec field "represents the desired state," and is responsible for "making the current state come closer to that desired state." This is why deleting a pod managed by a Deployment doesn't need a person to notice and fix it: the deleted pod was never special, it was just drift, and the Deployment's controller (via the ReplicaSet it manages) closes that gap on its own schedule, not on request.

### Secrets aren't encryption

The Secrets page is explicit, under its own "Caution" heading: "Kubernetes Secrets are, by default, stored unencrypted in the API server's underlying data store (etcd). Anyone with API access can retrieve or modify a Secret, and so can anyone with access to etcd," and further, anyone authorized to create a Pod in a namespace "can use that access to read any Secret in that namespace." The same page calls base64 encoding exactly what it is in one of its own examples: "The auth value there is base64 encoded; it is obscured but not secret." Encryption at rest, RBAC scoping, and an external secret store are the documented mitigations — none of them is the Secret object itself.

### Node pools and restart policies

A node pool is simply a set of nodes with the same shape (machine type, labels, taints) that the cluster treats as one unit to scale or taint together — this refresher's taint-and-toleration mechanism is exactly what a node pool uses to keep one workload off another pool's nodes. A pod's `restartPolicy` (`Always`, `OnFailure`, `Never`) decides whether the kubelet restarts a finished container on that same node at all; it is a narrower decision than a Deployment's own replacement of a whole missing pod, which is the reconciliation loop acting one level up.

### Taints repel, tolerations allow, affinity prefers

These are two separate mechanisms that look similar. A taint, in the documentation's own words, lets "a node repel a set of pods"; a toleration "allow[s] the scheduler to schedule pods with matching taints," but "don't guarantee scheduling: the scheduler also evaluates other parameters." Affinity is the opposite direction and a separate axis: "a property of Pods that attracts them to a set of nodes (either as a preference or a hard requirement)." A pod can tolerate a taint and still not land on that node if affinity (or anything else the scheduler weighs) says otherwise.

</section>

<section data-section="lab">

## Try it

No local Kubernetes cluster exists on this build machine (no `kubectl`, no `kind`/`k3s`), so every object's live behaviour here is sourced from Kubernetes' own documentation, not demonstrated against a running API server. What *is* run for real, with asserts on every claim this reel makes about mechanism: `examples.py`'s reconciliation-loop model (a controller tick that only ever adds what's missing, never removes extra, and converges in repeated ticks) and its taint/toleration-matching model (a pod without a matching toleration is repelled; one with a matching toleration may schedule; an untainted node accepts any pod).

```
$ python3 examples.py
ok  test_a_pod_tolerating_only_one_of_two_taints_is_still_repelled
ok  test_a_pod_with_the_matching_toleration_may_schedule
ok  test_a_pod_without_the_matching_toleration_is_repelled
ok  test_an_untainted_node_accepts_any_pod_regardless_of_tolerations
ok  test_deleting_one_of_three_replicas_is_replaced_by_the_next_tick
ok  test_reconciliation_is_idempotent_across_repeated_ticks
ok  test_reconciliation_only_adds_what_is_missing_never_extra

7 checks passed.
```

</section>

<section data-section="production">

## In code review

- **A Secret committed or exposed as plain environment output.** Treat a Secret object the same as any other unencrypted-at-rest data until encryption at rest, RBAC scoping, or an external secret store (External Secrets Operator, Vault) is actually configured — the object's name is not a guarantee.
- **A StatefulSet used where a Deployment would do, or the reverse.** If the pods are truly interchangeable and nothing needs to survive a reschedule by name, a Deployment is simpler; reach for a StatefulSet only when identity or per-pod storage genuinely matters.
- **A toleration added to "fix" a scheduling problem without checking affinity and other constraints.** A matching toleration only removes the taint's veto; it doesn't force a placement the way affinity or scheduling pressure can still prevent.

</section>

<section data-section="next">

## Where this goes next

These objects say what to run and roughly where, not how much to reserve or who gets evicted first under pressure. The next topic is requests, limits, quality-of-service classes and eviction order — topic 2's kernel-level `memory.max`/`cpu.max` seen from the scheduler's side.

</section>
