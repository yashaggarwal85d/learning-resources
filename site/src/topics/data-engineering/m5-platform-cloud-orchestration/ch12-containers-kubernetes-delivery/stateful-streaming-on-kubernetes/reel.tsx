import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Full topic, this chapter's stateful-streaming section: stable identities and PVC-per-broker, zone/rack awareness, ISR-safe rolling
// restarts, Strimzi's own resources since the StatefulSet-removal proposal, the Flink Kubernetes
// Operator's three upgrade modes, checkpoints on object storage, and when a managed service is the
// better trade. No local Kubernetes cluster is reachable on this build machine (no Docker daemon,
// no kubectl/kind/k3s), so a live multi-broker roll and a live operator upgrade are sourced from
// Strimzi's and Flink's own documentation and source files; the ISR-safe-roll decision, the
// PVC-retention resolution, and the Flink upgrade-mode and savepoint-fallback decisions are run
// for real in examples.py. Hosts no lab of its own: the savepoint-preserving upgrade is exercised
// end to end in the next topic's lab.
const reel: Reel = {
  steps: [
    {
      title: 'A drain takes two at once',
      body: (
        <>
          A node needs patching, so the cluster is drained. Two of this topic's three brokers happen to sit on the nodes being drained, with `min.insync.replicas` set to two.
        </>
      ),
      duration: 2.6,
      fig: 'two of three brokers drained at once',
      Visual: S.Hook,
    },
    {
      title: 'Stall, lose data, or neither?',
      body: (
        <>
          If the drain evicts both brokers at once, what happens to a producer writing with `acks=all`?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'nothing — Kubernetes replaces broker pods seamlessly' },
          { label: 'already-acknowledged writes are lost outright' },
          { label: 'the second eviction is held back until the first broker rejoins, so writes stall but nothing is lost', correct: true },
          { label: 'the whole cluster becomes unavailable until both nodes return' },
        ],
        explain: (
          <>
            Nothing is lost, but writes can stall. A disruption budget and the operator's own roll logic hold back the second eviction until the first broker is back in the in-sync set — the
            drain pauses there instead of taking the partition below its minimum.
          </>
        ),
      },
      fig: 'predict: stall, lose data, or neither',
      Visual: S.PredictDrain,
    },
    {
      title: "What a broker needs that an executor didn't",
      body: (
        <>
          A Spark executor is disposable: lose one and Kubernetes starts a fresh one with no memory of the old. A broker owns data on a disk and must keep the same name — a `StatefulSet`'s
          sticky identity, applied to a workload that actually needs it.
        </>
      ),
      duration: 2.8,
      fig: 'disposable executor vs. a broker that must persist',
      Visual: S.BrokerVsExecutor,
    },
    {
      title: 'A template, not a pod',
      body: (
        <>
          `volumeClaimTemplates` gives each broker Pod its own volume, one that follows that Pod's identity across restarts. A retention policy then decides whether deleting or scaling the set
          actually deletes that data, or leaves it behind.
        </>
      ),
      duration: 2.8,
      takeaway: "A StatefulSet's volume claim template follows the Pod's identity; the retention policy decides if deleting it deletes the data too.",
      fig: 'per-pod volume, and a retention choice',
      Visual: S.StableStorage,
    },
    {
      title: "Strimzi's own resources",
      body: (
        <>
          A plain `StatefulSet` wasn't enough: Strimzi's own proposal names the workarounds it needed for things like asymmetric storage, and the fact that one `StatefulSet` only ever lives on
          one cluster. Strimzi draws the identity-and-storage principle from `StatefulSet` but uses its own `StrimziPodSet` and `KafkaNodePool` resources instead.
        </>
      ),
      duration: 3,
      fig: 'StrimziPodSet and KafkaNodePool, named honestly',
      Visual: S.StrimziResources,
    },
    {
      title: 'Rack awareness, and its cost',
      body: (
        <>
          Setting a broker's rack spreads a partition's replicas across racks or zones, so one zone's failure doesn't take every replica with it. The replication traffic those spread-out
          replicas now generate crosses zones — a cost this topic names and Chapter ten's egress material actually prices.
        </>
      ),
      duration: 2.8,
      fig: 'one replica per zone; traffic now crosses zones',
      Visual: S.RackAwareness,
    },
    {
      title: "The roller's own rule",
      body: (
        <>
          Strimzi's `KafkaRoller` states its own rule in its source: a restart should never impact a topic's minimum in-sync replicas. Before touching a broker, it checks whether doing so would
          drop that broker's topics below the minimum, and declines the restart if so.
        </>
      ),
      duration: 2.8,
      takeaway: "The roller checks the real in-sync set before every restart, not just the replication factor on paper.",
      fig: 'checked against the in-sync set, not just the replica count',
      Visual: S.RollerRule,
    },
    {
      title: "Drain Cleaner and the budget's half",
      body: (
        <>
          Strimzi Drain Cleaner intercepts a node eviction and hands it to that same safe-roll logic, instead of letting Kubernetes evict the broker directly. A pod disruption budget is the
          Kubernetes side of the identical promise, from earlier in this chapter.
        </>
      ),
      duration: 2.6,
      fig: "an eviction becomes the operator's own safe roll",
      Visual: S.DrainCleanerPdb,
    },
    {
      title: 'KRaft only, now',
      body: (
        <>
          The current Strimzi release removed ZooKeeper-based clusters and the migration path to KRaft entirely. A cluster has to already be on KRaft before it can take that upgrade — there's no
          in-place path left for one that isn't.
        </>
      ),
      duration: 2.6,
      takeaway: 'An old ZooKeeper-based cluster cannot upgrade directly; it must already be on KRaft first.',
      fig: 'ZooKeeper-based clusters: no longer supported',
      Visual: S.KraftOnly,
    },
    {
      title: 'A Flink job as a declared resource',
      body: (
        <>
          The Flink Kubernetes Operator treats a running job the same way earlier topics treated a workload: a declared custom resource the operator continuously reconciles, not a one-off
          command.
        </>
      ),
      duration: 2.4,
      fig: 'a job declared, and kept matching',
      Visual: S.FlinkDeclared,
    },
    {
      title: 'Three upgrade modes',
      body: (
        <>
          Changing that resource triggers an upgrade, and the upgrade mode decides what survives the restart. Stateless upgrades start from nothing. Last-state reuses the latest checkpoint
          without needing a healthy job. Savepoint takes a fresh point during the upgrade itself, for the most safety.
        </>
      ),
      duration: 3,
      fig: 'stateless, last state, savepoint',
      Visual: S.UpgradeModes,
    },
    {
      title: 'Savepoint anyway, fall back, or fail?',
      body: (
        <>
          The job is unhealthy right now, and an upgrade needs to happen in savepoint mode. Does it still get a fresh savepoint, fall back to something older, or simply refuse?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'it takes the savepoint anyway, unhealthy or not' },
          { label: 'it falls back to the last checkpoint, and fails only if none exists', correct: true },
          { label: 'it always fails outright on an unhealthy job' },
          { label: "it switches itself to last-state mode permanently" },
        ],
        explain: (
          <>
            It falls back to the last checkpoint. Savepoint mode needs a running job to take a fresh savepoint, so an unhealthy job gets the latest checkpoint instead — and only if even that doesn't exist does the upgrade fail outright.
          </>
        ),
      },
      fig: 'predict: savepoint mode on an unhealthy job',
      Visual: S.PredictSavepointHealth,
    },
    {
      title: 'Who owns the lifecycle',
      body: (
        <>
          A checkpoint's lifecycle belongs to Flink: created, owned, and deleted automatically once the job ends. A savepoint belongs to the user instead — Flink never deletes it on its own,
          which is exactly what makes it safe to use as a fork point or a backup.
        </>
      ),
      duration: 2.8,
      takeaway: 'Flink deletes its own checkpoints by default; a savepoint is kept until the user removes it.',
      fig: "checkpoint: Flink's; savepoint: the user's",
      Visual: S.LifecycleOwnership,
    },
    {
      title: 'Checkpoints on object storage',
      body: (
        <>
          Pointing the checkpoint directory at object storage means the Pod's disk isn't the only copy of that state. It's still the pod's own local disk where the live state actually lives, if
          the job uses RocksDB for it — the checkpoint is a copy taken from there, not a substitute for it.
        </>
      ),
      duration: 2.8,
      fig: "live state on disk; the checkpoint is a copy, elsewhere",
      Visual: S.CheckpointStorage,
    },
    {
      title: 'Managed vs. self-run',
      body: (
        <>
          Running this yourself means watching the in-sync set, rolling brokers safely, and picking upgrade modes. A managed Kafka or managed Flink service takes that off your plate — at the
          price of lock-in, which this topic names and leaves the learner's own numbers to weigh.
        </>
      ),
      duration: 2.8,
      fig: 'who rolls brokers, who watches the in-sync set',
      Visual: S.ManagedVsSelfRun,
    },
    {
      title: 'Disposable executors; stable brokers',
      body: (
        <>
          A Spark executor is disposable: lose one and the stage is redone. A broker and a job owned something worth keeping. Everything in this chapter so far is a document — the next question
          is who's allowed to change those documents on a running cluster.
        </>
      ),
      duration: 2.6,
      fig: 'recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
