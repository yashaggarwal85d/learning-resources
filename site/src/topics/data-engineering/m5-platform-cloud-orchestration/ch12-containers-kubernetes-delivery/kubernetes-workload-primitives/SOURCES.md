# Sources — `de.kubernetes-workload-primitives`

Fetched 2026-10-30.

## Kubernetes documentation, Controllers

URL: https://kubernetes.io/docs/concepts/architecture/controller/

> In Kubernetes, controllers are control loops that watch the state of your
> cluster, then make or request
> changes where needed.

> Each controller tries to move the current cluster state closer to the desired
> state.

> A controller tracks at least one Kubernetes resource type.
> These objects
> have a spec field that represents the desired state. The
> controller(s) for that resource are responsible for making the current
> state come closer to that desired state.

## Kubernetes documentation, StatefulSets

URL: https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/

> A StatefulSet runs a group of Pods, and maintains a sticky identity for each of those Pods. This is useful for managing applications that need persistent storage or a stable, unique network identity.

> Like a Deployment, a StatefulSet manages Pods that are based on an identical container spec. Unlike a Deployment, a StatefulSet maintains a sticky identity for each of its Pods. These pods are created from the same spec, but are not interchangeable: each has a persistent identifier that it maintains across any rescheduling.

> StatefulSet Pods have a unique identity that consists of an ordinal, a
> stable network identity, and stable storage. The identity sticks to the Pod,

## Kubernetes documentation, Service

URL: https://kubernetes.io/docs/concepts/services-networking/service/

> When looking up the host my-service.prod.svc.cluster.local, the cluster DNS Service
> returns a CNAME record with the value my.database.example.com. Accessing
> my-service works in the same way as other Services but with the crucial
> difference that redirection happens at the DNS level rather than via proxying or
> forwarding.

## Kubernetes documentation, Secrets

URL: https://kubernetes.io/docs/concepts/configuration/secret/

> Kubernetes Secrets are, by default, stored unencrypted in the API server's underlying data store
> (etcd). Anyone with API access can retrieve or modify a Secret, and so can anyone with access to etcd.
> Additionally, anyone who is authorized to create a Pod in a namespace can use that access to read
> any Secret in that namespace; this includes indirect access such as the ability to create a
> Deployment.

> The auth value there is base64 encoded; it is obscured but not secret.

## Kubernetes documentation, Persistent Volumes

URL: https://kubernetes.io/docs/concepts/storage/persistent-volumes/

> A PersistentVolume (PV) is a piece of storage in the cluster that has been
> provisioned by an administrator or dynamically provisioned using
> Storage Classes.

> A PersistentVolumeClaim (PVC) is a request for storage by a user. It is similar
> to a Pod. Pods consume node resources and PVCs consume PV resources.

> This provisioning is based on StorageClasses: the PVC must request a
> storage class and
> the administrator must have created and configured that class for dynamic
> provisioning to occur.

## Kubernetes documentation, Taints and Tolerations

URL: https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/

> Node affinity
> is a property of Pods that attracts them to
> a set of nodes (either as a preference or a
> hard requirement). Taints are the opposite -- they allow a node to repel a set of pods.

> Tolerations are applied to pods. Tolerations allow the scheduler to schedule pods with matching
> taints. Tolerations allow scheduling but don't guarantee scheduling: the scheduler also
> evaluates other parameters
> as part of its function.

## Kubernetes documentation, Assigning Pods to Nodes

URL: https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/

> nodeSelector is the simplest recommended form of node selection constraint.

## etcd documentation, etcd versus other key-value stores

URL: https://etcd.io/docs/v3.6/learning/why/

> etcd replicates all data within a single consistent replication group. For storing up to a few GB of data with consistent ordering, this is the most efficient approach. Each modification of cluster state, which may change multiple keys, is assigned a global unique ID, called a revision in etcd, from a monotonically increasing counter for reasoning over ordering. Since there's only a single replication group, the modification request only needs to go through the raft protocol to commit. By limiting consensus to one replication group, etcd gets distributed consistency with a simple protocol while achieving low latency and high throughput.
