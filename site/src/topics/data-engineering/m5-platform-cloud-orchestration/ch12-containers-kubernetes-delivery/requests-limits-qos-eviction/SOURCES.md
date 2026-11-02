# Sources — `de.requests-limits-qos-eviction`

Fetched 2026-10-30.

## Kubernetes documentation, Configure Quality of Service for Pods

URL: https://kubernetes.io/docs/tasks/configure-pod-container/quality-service-pod/

> For a Pod to be given a QoS class of Guaranteed:
> Every Container in the Pod must have a memory limit and a memory request.
> For every Container in the Pod, the memory limit must equal the memory request.
> Every Container in the Pod must have a CPU limit and a CPU request.
> For every Container in the Pod, the CPU limit must equal the CPU request.

> A Pod is given a QoS class of Burstable if:
> The Pod does not meet the criteria for QoS class Guaranteed.
> At least one Container in the Pod has a memory or CPU request or limit.

> For a Pod to be given a QoS class of BestEffort, the Containers in the Pod must not
> have any memory or CPU limits or requests.

## Kubernetes documentation, Node-pressure Eviction

URL: https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/

> The kubelet uses the following parameters to determine the pod eviction order:
> Whether the pod's resource usage exceeds requests
> Pod Priority
> The pod's resource usage relative to requests
> As a result, kubelet ranks and evicts pods in the following order:
> BestEffort or Burstable pods where the usage exceeds requests. These pods
> are evicted based on their Priority and then by how much their usage level
> exceeds the request.

> Guaranteed pods and Burstable pods where the usage is less than requests
> are evicted last, based on their Priority.

> The kubelet does not use the pod's QoS class to determine the eviction order.
> You can use the QoS class to estimate the most likely pod eviction order when
> reclaiming resources like memory.

> Guaranteed pods are guaranteed only when requests and limits are specified for
> all the containers and they are equal. These pods will never be evicted because
> of another pod's resource consumption. If a system daemon (such as kubelet
> and journald) is consuming more resources than were reserved via
> system-reserved or kube-reserved allocations, and the node only has
> Guaranteed or Burstable pods using less resources than requests left on it,
> then the kubelet must choose to evict one of these pods to preserve node stability
> and to limit the impact of resource starvation on other pods. In this case, it
> will choose to evict pods of lowest Priority first.

> The kubelet does not respect your configured PodDisruptionBudget
> or the pod's
> terminationGracePeriodSeconds. If you use soft eviction thresholds,
> the kubelet respects your configured eviction-max-pod-grace-period. If you use
> hard eviction thresholds, the kubelet uses a 0s grace period (immediate shutdown) for termination.

> The kubelet has the following default hard eviction thresholds:
> memory.available<100Mi (Linux nodes)
> memory.available<500Mi (Windows nodes)
> nodefs.available<10%
> imagefs.available<15%
> nodefs.inodesFree<5% (Linux nodes)
> imagefs.inodesFree<5% (Linux nodes)

> The kubelet sets an oom_score_adj value for each container based on the QoS for the pod.
> Quality of Service
> oom_score_adj
> Guaranteed
> -997
> BestEffort
> 1000
> Burstable
> min(max(2, 1000 - (1000 × memoryRequestBytes) / machineMemoryCapacityBytes), 999)

> The kubelet also sets an oom_score_adj value of -997 for any containers in Pods that have
> system-node-critical Priority.

> If the kubelet can't reclaim memory before a node experiences OOM, the
> oom_killer calculates an oom_score based on the percentage of memory it's
> using on the node, and then adds the oom_score_adj to get an effective oom_score
> for each container. It then kills the container with the highest score.
> This means that containers in low QoS pods that consume a large amount of memory
> relative to their scheduling requests are killed first.

> By default, the kubelet polls cAdvisor to collect memory usage stats at a
> regular interval. If memory usage increases within that window rapidly, the
> kubelet may not observe MemoryPressure fast enough, and the OOM killer
> will still be invoked.
> You can use the --kernel-memcg-notification flag to enable the memcg
> notification API on the kubelet to get notified immediately when a threshold
> is crossed.

## Kubernetes documentation, Disruptions

URL: https://kubernetes.io/docs/concepts/workloads/pods/disruptions/

> We call these unavoidable cases involuntary disruptions to
> an application. Examples are:
> a hardware failure of the physical machine backing the node
> cluster administrator deletes VM (instance) by mistake
> cloud provider or hypervisor failure makes VM disappear
> a kernel panic
> the node disappears from the cluster due to cluster network partition
> eviction of a pod due to the node being out-of-resources.

> Involuntary disruptions cannot be prevented by PDBs; however they
> do count against the budget.

> Cluster managers and hosting providers should use tools which
> respect PodDisruptionBudgets by calling the Eviction API
> instead of directly deleting pods or deployments.

> A PDB specifies the number of replicas that an application can tolerate having, relative to how
> many it is intended to have. For example, a Deployment which has a .spec.replicas: 5 is
> supposed to have 5 pods at any given time. If its PDB allows for there to be 4 at a time,
> then the Eviction API will allow voluntary disruption of one (but not two) pods at a time.

## Kubernetes documentation, Pod Priority and Preemption

URL: https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/

> Preemption should happen only when a cluster does not have enough resources for
> a Pod. In such cases, preemption happens only when the priority of the pending
> Pod (preemptor) is higher than the victim Pods.

> When pods are preempted, they receive their requested graceful termination
> period, which is by default 30 seconds. If the victim Pods do not terminate within
> this period, they are forcibly terminated. Once all the victims go away, the
> preemptor Pod can be scheduled.

## Kubernetes documentation, Autoscaling Workloads

URL: https://kubernetes.io/docs/concepts/workloads/autoscaling/

> Stable since Kubernetes v1.35
> More information about this featureThis is a stable feature in Kubernetes, and has been since version v1.35. It was first available in the v1.27 release.

## Kubernetes documentation, Resize CPU and Memory Resources assigned to Containers

URL: https://kubernetes.io/docs/tasks/configure-pod-container/resize-container-resources/

> Memory Decrease: If the memory resize restart policy is NotRequired (or unspecified), the kubelet will make a
> best-effort attempt to prevent oom-kills when decreasing memory limits, but doesn't provide any guarantees.
> Before decreasing container memory limits, if memory usage exceeds the requested limit, the resize will be skipped
> and the status will remain in an "In Progress" state.

> QoS Class: The Pod's original Quality of Service (QoS) class
> (Guaranteed, Burstable, or BestEffort) is determined at creation and cannot be changed by a resize.
> The resized resource values must still adhere to the rules of the original QoS class:Guaranteed: Requests must continue to equal limits for both CPU and memory after resizing.

## Robusta Blog, "For the Love of God, Stop Using CPU Limits on Kubernetes" (practitioner opinion, labeled as such)

URL: https://home.robusta.dev/blog/stop-using-cpu-limits

> Many people think you need CPU limits on Kubernetes but this isn't true. In most cases, Kubernetes CPU limits do more harm than help. In fact, they're the number one cause of Kubernetes CPU throttling.

> Disable your CPU limits! If you give all your K8s pods accurate CPU requests, then no-one can throttle them because CPU is reserved for them if they need it. This has nothing to do with limits.
