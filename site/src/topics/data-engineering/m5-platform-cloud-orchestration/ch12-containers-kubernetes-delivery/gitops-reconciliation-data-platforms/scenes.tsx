import { C, Svg, T, Reticle } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// No local Kubernetes cluster, and no reachable Argo CD or Flink Kubernetes Operator, on this build
// machine (no Docker daemon, no kubectl/kind/k3s, confirmed across every topic in this chapter), so
// this chapter's lab (a savepoint-preserving promotion through Argo CD, drift, rollback) cannot be
// run live. Argo CD's own sync, self-heal, prune, and ignoreDifferences decision logic is run for
// real in examples.py instead, modeled directly from its own documentation.

function CompareRow({ y, title, caption, color }: { y: number; title: string; caption: string; color: string }) {
  return (
    <g>
      <rect x={100} y={y} width={400} height={60} rx={4} fill={C.panel} stroke={color} />
      <T x={300} y={y + 28} s={13} a="middle" f={color}>{title}</T>
      <T x={300} y={y + 48} s={11} a="middle" f={C.quiet}>{caption}</T>
    </g>
  );
}

function StateBand({ y = 60, label, color }: { y?: number; label: string; color: string }) {
  return (
    <g>
      <rect x={80} y={y} width={440} height={50} rx={4} fill={C.panel} stroke={color} />
      <T x={300} y={y + 30} s={12} a="middle" f={color}>{label}</T>
    </g>
  );
}

// 1 · Hook: an undocumented 3 a.m. fix, and a deploy that reverts it.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="Someone fixes an incident by hand at three in the morning, and never tells anyone" h={280}>
      <StateBand y={50} label="cluster: hand-edited, undocumented" color={C.badText} />
      <StateBand y={140} label="git: unaware of the edit" color={C.quiet} />
      <T x={300} y={230} s={13} a="middle" f={C.quiet}>three weeks later, a deploy runs</T>
    </Svg>
  );
}

// 2 · Predict: does the manual edit survive the next, unrelated deploy?
export function PredictSelfHeal({ t }: StepCtx) {
  return (
    <Svg label="Automated sync is on, self heal is off. A git change lands that does not touch the edited field" h={280}>
      <StateBand y={60} label="cluster: still hand-edited" color={C.focus} />
      <Reticle x={80} y={60} w={440} h={50} t={t} at={0.3} />
      <T x={300} y={200} s={15} a="middle" f={C.crema} serif>
        survives, gets corrected, or something else?
      </T>
    </Svg>
  );
}

// 3 · The loop, with Git as the spec.
export function LoopGitSpec({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="A controller continuously compares live state against a desired state taken from git" h={280}>
      <StateBand y={50} label="git: desired state" color={C.second} />
      <g opacity={k}>
        <StateBand y={140} label="cluster: live state, kept matching" color={C.focus} />
      </g>
    </Svg>
  );
}

// 4 · Two real projects; Git isn't even required any more.
export function FluxOci({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="Argo CD and Flux are two separate real projects. Flux now also reconciles from an image registry, not only git" h={300}>
      <CompareRow y={40} title="Argo CD" caption="reconciles applications from a git repository" color={C.second} />
      <g opacity={k}>
        <CompareRow y={130} title="Flux" caption="also reconciles straight from a container registry" color={C.focus} />
      </g>
    </Svg>
  );
}

// 5 · Helm and Kustomize: a rendered diff, not a cluster.
export function HelmKustomize({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="Helm and Kustomize only render the manifest. The reconciler owns everything after that" h={260}>
      <rect x={100} y={40} width={400} height={60} rx={4} fill={C.panel} stroke={C.second} />
      <T x={300} y={75} s={13} a="middle" f={C.second}>chart or overlay, rendered</T>
      <g opacity={k}>
        <T x={300} y={160} s={12} a="middle" f={C.quiet}>the rendered diff is what actually gets applied</T>
      </g>
    </Svg>
  );
}

// 6 · Promotion by pull request.
export function PromotionByPr({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="Staging to production is a commit changing a version or an overlay" h={260}>
      <CompareRow y={40} title="staging overlay" caption="a version bump, reviewed as a pull request" color={C.second} />
      <g opacity={k}>
        <CompareRow y={130} title="production overlay" caption="the same commit, promoted; a revert is the rollback" color={C.focus} />
      </g>
    </Svg>
  );
}

// 7 · Automatic drift correction, and its guard.
export function DriftCorrection({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="Self heal pulls live drift back to git. Pruning deletes what git no longer lists, guarded against deleting everything" h={300}>
      <CompareRow y={40} title="self heal: on" caption="live drift from a manual edit gets pulled back" color={C.second} />
      <g opacity={k}>
        <CompareRow y={130} title="pruning, guarded" caption="deletes what's gone from git; refuses to empty the set by accident" color={C.focus} />
      </g>
    </Svg>
  );
}

// 8 · Predict: everything removed from git at once.
export function PredictPruneEverything({ t }: StepCtx) {
  return (
    <Svg label="Every resource is removed from git at once, by a mistake. Pruning is on. What happens?" h={280}>
      <StateBand y={60} label="git: suddenly empty" color={C.badText} />
      <Reticle x={80} y={150} w={440} h={50} t={t} at={0.3} />
      <StateBand y={150} label="cluster: ?" color={C.focus} />
      <T x={300} y={230} s={14} a="middle" f={C.crema} serif>deletes everything, refuses, or something else?</T>
    </Svg>
  );
}

// 9 · The field another controller owns.
export function IgnoreDifferences({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="An autoscaler changes replica count live. Telling the reconciler to ignore that field stops a fight over it" h={280}>
      <StateBand y={50} label="git: replica count, fixed" color={C.quiet} />
      <g opacity={k}>
        <StateBand y={140} label="cluster: replica count, from the autoscaler, ignored on purpose" color={C.focus} />
      </g>
    </Svg>
  );
}

// 10 · A Secret in Git is a leak.
export function SecretsGitops({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="A secret committed in the clear is a leak. Syncing from a store, or committing it encrypted, are the two fixes" h={300}>
      <CompareRow y={40} title="synced from an external store" caption="the controller fetches it; the secret itself never touches git" color={C.second} />
      <g opacity={k}>
        <CompareRow y={130} title="committed, encrypted" caption="safe in git; the decrypted version in the cluster is still exposed" color={C.focus} />
      </g>
    </Svg>
  );
}

// 11 · Progressive delivery, and why a stateful stream job resists it.
export function ProgressiveDelivery({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="Canary and blue green shift traffic gradually. A stateful stream job redeployed from empty state is not a traffic shift, it's a data incident" h={300}>
      <CompareRow y={40} title="canary, blue green" caption="a slice of traffic moves first; rolling back costs nothing" color={C.second} />
      <g opacity={k}>
        <CompareRow y={130} title="a stream job, redeployed naively" caption="starts from empty state; that's not a rollout, it's data loss" color={C.badText} />
      </g>
    </Svg>
  );
}

// 12 · IaC vs. GitOps, the seam.
export function IacVsGitopsSeam({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="The cluster itself is infrastructure as code. What runs inside it is GitOps. The seam is identity and secrets" h={300}>
      <CompareRow y={40} title="infrastructure as code" caption="the account, network, bucket, cluster, and identity" color={C.second} />
      <g opacity={k}>
        <CompareRow y={130} title="GitOps" caption="the objects running inside that cluster" color={C.focus} />
      </g>
    </Svg>
  );
}

// 13 · Recap / handoff.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="The platform is delivered and kept converged. That says nothing about whether it is healthy" h={280}>
      <StateBand y={60} label="delivered, and kept converged" color={C.second} />
      <T x={300} y={200} s={13} a="middle" f={C.quiet}>whether it's healthy is the next question</T>
    </Svg>
  );
}
