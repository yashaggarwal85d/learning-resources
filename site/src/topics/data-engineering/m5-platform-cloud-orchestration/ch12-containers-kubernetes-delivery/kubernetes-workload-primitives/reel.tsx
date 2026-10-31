import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A refresher: the Kubernetes objects every later topic in this chapter names without pausing.
// No local Kubernetes cluster exists on this build machine (no kubectl, no kind/k3s), so every
// object's behaviour is sourced from Kubernetes' own docs (SOURCES.md); the reconciliation-loop
// and taint/toleration mechanics are run for real in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Something keeps putting it back',
      body: (
        <>
          You delete a pod by hand, and a replacement appears seconds later. You edit a running pod's setting, and it's quietly set back. Something is
          watching, and it isn't you.
        </>
      ),
      duration: 2.2,
      fig: 'a deleted pod, and its replacement',
      Visual: S.Hook,
    },
    {
      title: 'Who replaces the deleted pod?',
      body: (
        <>
          A Deployment with three replicas. You delete one pod by hand. A minute later, how many pods are running, and who made the replacement?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'two — nobody refills it' },
          { label: "three — the Deployment's own controller", correct: true },
          { label: 'three, but only after you run apply again' },
          { label: 'four — the old one restarts plus a new one' },
        ],
        explain: (
          <>
            Three, and the Deployment's own controller did it without being asked twice. The deleted pod was never a special case — it was just the
            actual state drifting from the declared one, and the controller closed the gap the same way it always does.
          </>
        ),
      },
      fig: 'predict: who replaces it',
      Visual: S.PredictReplace,
    },
    {
      title: 'The loop that never stops watching',
      body: (
        <>
          A controller is a loop: it watches the gap between a declared spec and the actual status, and acts to narrow it. It doesn't wait for a person
          to notice something is wrong.
        </>
      ),
      duration: 2.2,
      fig: 'spec above, status below, a controller between',
      Visual: S.ControlLoop,
    },
    {
      title: 'Pod, Deployment, StatefulSet',
      body: (
        <>
          A Pod is the thing that actually gets scheduled. A Deployment treats its pods as interchangeable, stateless copies. A StatefulSet gives each
          pod a sticky identity and its own storage that follows it — its pods are built from the same spec, but they are not interchangeable.
        </>
      ),
      duration: 2.8,
      takeaway: "A Deployment's pods are interchangeable; a StatefulSet's are not.",
      fig: 'three objects, three jobs',
      Visual: S.PodDeployStateful,
    },
    {
      title: "A name that outlives the pod behind it",
      body: (
        <>
          A Service gives a changing set of pods one stable name. Whichever pod happens to answer a request right now, the name in front of it never
          changes.
        </>
      ),
      duration: 2.0,
      fig: 'one name, a changing set of pods',
      Visual: S.ServiceDns,
    },
    {
      title: "A Secret isn't encryption",
      body: (
        <>
          A ConfigMap and a Secret sit in the same place: the cluster's own data store, unencrypted by default. A Secret's value is written as base64 —
          that hides it from a casual glance, but anyone with API access to the namespace can read it in plain text.
        </>
      ),
      duration: 2.6,
      takeaway: "A Secret is unencrypted by default; base64 obscures a value, it doesn't secure it.",
      fig: 'ConfigMap and Secret, same unencrypted store',
      Visual: S.ConfigSecrets,
    },
    {
      title: 'Storage, requested and supplied',
      body: (
        <>
          A PersistentVolume is storage the cluster already knows about. A PersistentVolumeClaim is a pod's request for some. A StorageClass is what
          lets the cluster provision a matching volume on demand, instead of an administrator pre-creating every one by hand.
        </>
      ),
      duration: 2.4,
      fig: 'StorageClass provisions a PV to match a PVC',
      Visual: S.PvPvcStorageClass,
    },
    {
      title: 'Repelled, allowed, preferred',
      body: (
        <>
          A taint on a node repels pods. Only a pod with a matching toleration may land there anyway — and even then, scheduling isn't guaranteed, just
          allowed. Affinity is a separate idea: it pulls a pod toward or away from a set of nodes, as a preference or a hard requirement.
        </>
      ),
      duration: 2.6,
      takeaway: "A toleration only allows scheduling onto a tainted node; it never guarantees it.",
      fig: 'tainted node, with and without a toleration',
      Visual: S.TaintsAffinity,
    },
    {
      title: 'The same loop, from five more angles',
      body: (
        <>
          Everything in this refresher is a spec a controller works to match. The rest of this chapter is that same loop seen from different places:
          requests and limits, Jobs that must finish, Spark creating its own pods, stateful sets, and GitOps.
        </>
      ),
      duration: 2.4,
      fig: 'one loop, five more angles',
      Visual: S.ReconciliationRestated,
    },
    {
      title: 'Five things to keep',
      body: (
        <>
          These objects say what to run and roughly where. They don't say how much to reserve, how much to allow, or who dies first when a node runs
          short. That's next.
        </>
      ),
      duration: 2.2,
      fig: 'recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
