import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Full topic, hosts this chapter's lab: the driver creates executor pods through the API
// server, dynamic allocation with shuffle tracking, graceful executor decommissioning with block
// migration, remote shuffle (Celeborn), pod templates, and operators vs. managed offerings. No
// local Kubernetes cluster is reachable on this build machine (no Docker daemon, no
// kubectl/kind/k3s), so live pod creation and the lab's recovery-time measurements are sourced
// from Spark's and the operators' own documentation; the OwnerReference, shuffle-tracking-timeout
// and decommission-vs-abrupt-kill mechanics are run for real in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'A two-minute warning',
      body: (
        <>
          The shop's nightly job runs on spot nodes. Overnight, one node is reclaimed, with a two-minute warning before it's actually gone.
        </>
      ),
      duration: 2.4,
      fig: 'spot node, two-minute warning',
      Visual: S.Hook,
    },
    {
      title: "How much gets redone?",
      body: (
        <>
          With executor decommissioning off, how much work does the job redo when that node goes?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'nothing — Kubernetes replaces the pod seamlessly' },
          { label: 'just the one task that was running' },
          { label: "the whole stage that held the lost executor's shuffle data", correct: true },
          { label: 'the whole job, from the start' },
        ],
        explain: (
          <>
            The whole stage. Without decommissioning, losing an executor abruptly loses the shuffle data it held, and every task that produced that data has to run again — not just the one task
            that happened to be running when the node went.
          </>
        ),
      },
      fig: 'predict: how much is redone',
      Visual: S.PredictRedo,
    },
    {
      title: 'No cluster manager, pre-built',
      body: (
        <>
          `spark-submit` against a `k8s://` master starts a driver pod. The driver itself asks the API server to create the executor pods, and connects to them once they exist. There's no
          standing cluster manager Spark hands off to — the driver builds its own cluster.
        </>
      ),
      duration: 2.8,
      fig: 'driver creates executors via the API server',
      Visual: S.SubmitFlow,
    },
    {
      title: "The driver outlives its executors",
      body: (
        <>
          When the application finishes, the executor pods terminate and get cleaned up. The driver pod doesn't — it stays around in a "completed" state, using no compute or memory, purely so its
          logs are still there to read.
        </>
      ),
      duration: 2.6,
      takeaway: "A completed driver pod uses no resources; it's kept only so its logs survive.",
      fig: 'driver persists; executors gone',
      Visual: S.DriverPersists,
    },
    {
      title: 'The tie that cleans up executors',
      body: (
        <>
          Executors carry an `OwnerReference` back to the driver pod, so deleting the driver deletes them too. That tie only works if the driver's pod name was actually set correctly — point it
          at the wrong pod, and the real driver's death leaves orphaned executors behind.
        </>
      ),
      duration: 2.8,
      fig: 'owner reference, correctly wired',
      Visual: S.OwnerReference,
    },
    {
      title: "Dynamic allocation's missing piece",
      body: (
        <>
          Kubernetes has no external shuffle service sitting outside the executors. So dynamic allocation needs `shuffleTracking.enabled` just to know which idle executors are still holding
          shuffle data other stages need — and keep exactly those ones alive.
        </>
      ),
      duration: 2.8,
      takeaway: 'Shuffle tracking exists because Kubernetes has no external shuffle service of its own.',
      fig: 'idle executor with data vs. without',
      Visual: S.ShuffleTracking,
    },
    {
      title: 'An infinite default',
      body: (
        <>
          `shuffleTracking.timeout` defaults to infinity. An executor holding live shuffle data may simply never idle out on its own — Spark relies on that shuffle eventually being garbage
          collected instead, which can hold resources a shrinking cluster actually needs back.
        </>
      ),
      duration: 2.6,
      fig: 'held until garbage collected',
      Visual: S.InfiniteTimeout,
    },
    {
      title: 'Migrate the blocks first',
      body: (
        <>
          An abrupt kill takes the executor's shuffle data with it, forcing the stage that produced it to run again. With `decommission.enabled` and block migration, the exiting executor's
          blocks move to other executors before it actually goes.
        </>
      ),
      duration: 2.8,
      fig: 'abrupt kill vs. migrated decommission',
      Visual: S.AbruptVsGraceful,
    },
    {
      title: 'Does the window fit?',
      body: (
        <>
          Decommissioning is on. The warning gives two minutes before the node is actually reclaimed. Does the stage still have to be redone?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'yes, decommissioning only helps with planned maintenance' },
          { label: "no — nothing is redone if migration finishes inside the warning", correct: true },
          { label: 'half the stage, always' },
          { label: "it depends only on the executor's exit code" },
        ],
        explain: (
          <>
            Nothing is redone, as long as migration actually completes before the node goes. The two-minute warning is exactly the window the migration has to fit inside — the same mechanism
            works whether the eviction is planned maintenance or an unplanned reclaim, as long as there's enough warning to finish moving the blocks.
          </>
        ),
      },
      fig: 'predict: does migration finish in time',
      Visual: S.PredictResolve,
    },
    {
      title: 'Moving the data off the executors',
      body: (
        <>
          Apache Celeborn takes a different approach entirely: shuffle data never lives on the executors to begin with. Lose an executor, lose nothing — at the cost of running Celeborn itself as
          another service.
        </>
      ),
      duration: 2.6,
      fig: 'Celeborn: shuffle off the executors',
      Visual: S.RemoteShuffle,
    },
    {
      title: "The escape hatch, and who wins",
      body: (
        <>
          A pod template file carries whatever Spark's own configuration properties can't express — tolerations, sidecars, a security context. But where both set the same value, Spark's own
          properties always overwrite the template, never the other way around.
        </>
      ),
      duration: 2.6,
      takeaway: "A pod template fills gaps in Spark's config; Spark's own properties still win any conflict.",
      fig: 'template fills gaps; Spark wins conflicts',
      Visual: S.PodTemplates,
    },
    {
      title: "Someone else's loop",
      body: (
        <>
          The Apache Spark Kubernetes Operator and the Kubeflow Spark Operator are two separate, real projects. Each turns "run this application" into a custom resource a controller reconciles —
          the same reconciliation loop from earlier in this chapter, applied to Spark itself.
        </>
      ),
      duration: 2.6,
      fig: 'two operators, two APIs',
      Visual: S.Operators,
    },
    {
      title: "Someone else's cluster",
      body: (
        <>
          EMR on EKS runs EMR-managed Spark on a cluster you still operate. Managed Service for Apache Spark on GKE skips the cluster entirely, creating its own node pools inside GKE. Both trade
          operational weight for lock-in — the choice is a cost comparison, not a verdict.
        </>
      ),
      duration: 2.8,
      fig: 'EMR on EKS vs. managed Spark on GKE',
      Visual: S.ManagedVsSelf,
    },
    {
      title: 'Disposable, by design',
      body: (
        <>
          A Spark executor is disposable: lose one and the stage is redone. Not everything on a cluster can be treated that way.
        </>
      ),
      duration: 2.2,
      fig: 'recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
