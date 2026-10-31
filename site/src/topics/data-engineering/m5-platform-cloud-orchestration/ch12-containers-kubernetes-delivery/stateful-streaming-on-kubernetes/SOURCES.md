## Kubernetes documentation, StatefulSets

URL: https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/
Version: fetched 2026-10-30

> A StatefulSet runs a group of Pods, and maintains a sticky identity for each of those Pods. This is useful for managing applications that need persistent storage or a stable, unique network identity.

> Like a Deployment, a StatefulSet manages Pods that are based on an identical container spec. Unlike a Deployment, a StatefulSet maintains a sticky identity for each of its Pods. These pods are created from the same spec, but are not interchangeable: each has a persistent identifier that it maintains across any rescheduling.

> StatefulSet Pods have a unique identity that consists of an ordinal, a stable network identity, and stable storage. The identity sticks to the Pod, regardless of which node it's (re)scheduled on.

> You can set the .spec.volumeClaimTemplates field to create a PersistentVolumeClaim.

> The optional .spec.persistentVolumeClaimRetentionPolicy field controls if and how PVCs are deleted during the lifecycle of a StatefulSet.

> whenDeleted

> Configures the volume retention behavior that applies when the StatefulSet is deleted.

> whenScaled

> Configures the volume retention behavior that applies when the replica count of the StatefulSet is reduced; for example, when scaling down the set.

> The PVCs created from the StatefulSet volumeClaimTemplate are deleted for each Pod affected by the policy. With the whenDeleted policy all PVCs from the volumeClaimTemplate are deleted after their Pods have been deleted. With the whenScaled policy, only PVCs corresponding to Pod replicas being scaled down are deleted, after their Pods have been deleted.

## Strimzi proposal 031, StatefulSet removal

URL: https://raw.githubusercontent.com/strimzi/proposals/main/031-statefulset-removal.md
Version: fetched 2026-10-30, main branch

> Strimzi uses some hacks to workaround some of the StatefulSet limitations and allow things such as asymmetric storage configuration.

> Pods managed by a single StatefulSet always exist only on single Kubernetes cluster.

## Strimzi, deploying and managing documentation (1.3.0)

URL: https://strimzi.io/docs/operators/latest/deploying#type-Rack-reference
Version: 1.3.0

> The StrimziPodSet custom resource is used by Strimzi to create and manage Kafka, Kafka Connect, and MirrorMaker 2 pods.

> You must not create, update, or delete StrimziPodSet resources.

> To deploy a Kafka cluster in KRaft mode, you must use Kafka and KafkaNodePool custom resources.

> Enable rack-aware broker assignment to improve fault tolerance.

> This is a specialized option intended for a deployment within the same location, not across regions.

> rack:
> type: topology-label
> topologyKey: topology.kubernetes.io/zone

> Unless deleteClaim: true is set in the volume configuration, the PVCs are not deleted automatically when the node pool configuration is updated, and you have to delete them manually.

## Strimzi 0.46.0 release notes (mirrored; github.com's release page returns HTTP 403 from this build machine)

URL: https://newreleases.io/project/github/strimzi/strimzi-kafka-operator/release/0.46.0
Version: 0.46.0, mirrored copy of the GitHub release notes

> Support for ZooKeeper-based Apache Kafka clusters and for KRaft migration has been removed

> Support for ZooKeeper-based clusters and for migration from ZooKeeper-based clusters to KRaft has been removed.

> Please make sure all your clusters are using KRaft before upgrading to Strimzi 0.46.0 or newer!

## Strimzi source, KafkaRoller.java

URL: https://raw.githubusercontent.com/strimzi/strimzi-kafka-operator/main/cluster-operator/src/main/java/io/strimzi/operator/cluster/operator/resource/KafkaRoller.java
Version: fetched 2026-10-30, main branch

> rolling should happen without impacting any topic's min.isr.

## Strimzi source, KafkaAvailability.java

URL: https://raw.githubusercontent.com/strimzi/strimzi-kafka-operator/main/cluster-operator/src/main/java/io/strimzi/operator/cluster/operator/resource/KafkaAvailability.java
Version: fetched 2026-10-30, main branch

> Determines whether the given broker can be rolled without affecting

(the Javadoc comment's second line, on its own)

> producers with acks=all publishing to topics with a {@code min.in.sync.replicas}.

> LOGGER.debugCr(reconciliation, "Restart pod {} would remove it from ISR, stalling producers with acks=all", podId);

## Apache Flink Kubernetes Operator documentation, Job Management

URL: https://nightlies.apache.org/flink/flink-kubernetes-operator-docs-main/docs/managing/job-management/
Version: main (v1.17-SNAPSHOT), fetched 2026-10-30

> How state is carried across the restart is controlled through spec.job.upgradeMode, with three supported values: stateless, last-state, and savepoint.

> stateless: Stateless application upgrades from empty state.

> last-state: Quick upgrades in any application state (even for failing jobs), does not require a healthy job as it always uses the latest checkpoint information. Manual recovery may be necessary if HA metadata is lost.

> savepoint: Use savepoint for upgrade, providing maximal safety and the possibility to serve as a backup or fork point. The savepoint is created during the upgrade process. Note that the Flink job needs to be running to allow the savepoint to be created. If the job is in an unhealthy state, the last checkpoint is used instead (unless kubernetes.operator.job.upgrade.last-state-fallback.enabled is set to false). If the last checkpoint is not available, the job upgrade fails.

## Apache Flink Kubernetes Operator documentation, Autoscaler

URL: https://nightlies.apache.org/flink/flink-kubernetes-operator-docs-main/docs/managing/autoscaler/
Version: main (v1.17-SNAPSHOT), fetched 2026-10-30

> The operator ships a built-in job autoscaler that keeps the parallelism of a running Flink job aligned with its actual load. It watches every enabled FlinkDeployment and FlinkSessionJob, measures how busy each job vertex really is, and adjusts parallelism in both directions: vertices that fall behind receive more subtasks, vertices that sit idle give capacity back. Because the adjustment happens per vertex rather than per job, a heterogeneous pipeline is sized precisely, every stage gets exactly the capacity its own load demands, and nothing more.

## Apache Flink documentation, Checkpoints vs. Savepoints

URL: https://nightlies.apache.org/flink/flink-docs-stable/docs/ops/state/checkpoints_vs_savepoints
Version: stable, fetched 2026-10-30

> The primary purpose of checkpoints is to provide a recovery mechanism in case of unexpected job failures.

> A checkpoint's lifecycle is managed by Flink, i.e. a checkpoint is created, owned, and released by Flink - without user interaction.

> Checkpoints are automatically deleted if the application is terminated by the user (except if checkpoints are explicitly configured to be retained).

> Savepoints are created, owned and deleted solely by the user. That means, Flink does not delete savepoints neither after job termination nor after restore.

## Apache Flink documentation, Checkpoints (storage)

URL: https://nightlies.apache.org/flink/flink-docs-stable/docs/ops/state/checkpoints
Version: stable, fetched 2026-10-30

> The FileSystemCheckpointStorage is configured with a file system URL (type, address, path), such as "hdfs://namenode:40010/flink/checkpoints" or "file:///data/flink/checkpoints".

> If a checkpoint directory is specified, FileSystemCheckpointStorage will be used to persist checkpoint snapshots.

## Apache Flink documentation, State Backends

URL: https://nightlies.apache.org/flink/flink-docs-stable/docs/ops/state/state_backends/
Version: stable, fetched 2026-10-30

> The EmbeddedRocksDBStateBackend holds in-flight data in a RocksDB database that is (per default) stored in the TaskManager local data directories.
