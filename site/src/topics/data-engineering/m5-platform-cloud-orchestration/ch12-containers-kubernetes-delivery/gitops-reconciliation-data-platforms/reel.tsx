import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Full topic, hosts this chapter's final lab: pull-based reconcilers (Argo CD, Flux) converging a
// cluster to git, Helm/Kustomize packaging, promotion by pull request, automatic drift correction
// and its guards, secrets in GitOps, progressive delivery, and the IaC-vs-GitOps seam. No local
// Kubernetes cluster, and no reachable Argo CD or Flink operator, exist on this build machine, so
// the lab's live promotion-and-rollback cannot be run; Argo CD's own sync, self-heal, prune, and
// ignoreDifferences decision logic is run for real in examples.py, modeled directly from its own
// documentation.
const reel: Reel = {
  steps: [
    {
      title: "An undocumented fix, at three in the morning",
      body: (
        <>
          Someone fixes a production incident by hand, directly on the running cluster, and never tells anyone. Three weeks later, an unrelated deploy goes out.
        </>
      ),
      duration: 2.6,
      fig: 'a hand-edited cluster, git unaware of it',
      Visual: S.Hook,
    },
    {
      title: 'Survives, gets corrected, or something else?',
      body: (
        <>
          Automated sync is on, but the setting that reacts to live drift is off. The deploy's change doesn't touch the field that was hand-edited. What happens to that edit?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'it gets corrected back to whatever git says, immediately' },
          { label: "it survives this particular deploy, but it's still live drift waiting to be overwritten", correct: true },
          { label: 'the whole deploy is blocked until someone resolves the edit' },
          { label: 'nothing about this setup can ever detect the edit at all' },
        ],
        explain: (
          <>
            It survives this one. The setting that pulls live drift back to git is off, so nothing actively corrects the edit — but the deploy still applies the whole desired manifest, and any
            field the edit touched that happens to get touched by a later change reverts anyway. The edit was never safe; it just hadn't been overwritten yet.
          </>
        ),
      },
      fig: 'predict: does the hand-edited field survive',
      Visual: S.PredictSelfHeal,
    },
    {
      title: 'The loop, with Git as the spec',
      body: (
        <>
          A controller continuously compares the cluster's live state against a desired state — the same reconciling loop from earlier in this chapter, except the desired state now comes from a
          Git repository instead of a resource's own description.
        </>
      ),
      duration: 2.4,
      fig: 'desired state, from git, kept matching',
      Visual: S.LoopGitSpec,
    },
    {
      title: "Two real projects, and Git isn't even required",
      body: (
        <>
          Argo CD and Flux are two separate, real tools that do this same conceptual thing. Flux has gone a step further: its newer direction reconciles straight from a container registry,
          with Git no longer the only source of truth.
        </>
      ),
      duration: 2.8,
      takeaway: "The reconciling idea doesn't require Git specifically — Git is the usual spec, not the only possible one.",
      fig: 'Argo CD and Flux, named honestly',
      Visual: S.FluxOci,
    },
    {
      title: 'A chart or a base, not a cluster',
      body: (
        <>
          Helm and Kustomize only render a manifest — a chart with its values, or a base with its overlays. What the reconciler actually applies is the rendered result, not the template or the
          tool that produced it.
        </>
      ),
      duration: 2.4,
      fig: 'rendered first; applied after',
      Visual: S.HelmKustomize,
    },
    {
      title: 'Promotion by pull request',
      body: (
        <>
          Moving a change from staging to production is just a commit that bumps a version or edits an overlay. Review, history, and rollback are Git's own tools, applied to cluster state
          instead of application code.
        </>
      ),
      duration: 2.6,
      fig: 'staging to production, as a commit',
      Visual: S.PromotionByPr,
    },
    {
      title: 'Drift correction, and its guard',
      body: (
        <>
          Switching that reactive setting on is what actually pulls a manual edit back to match git. A separate setting controls pruning — deleting what git no longer lists — and pruning itself
          refuses to empty the set entirely unless specifically told it's allowed to.
        </>
      ),
      duration: 2.8,
      takeaway: "A reactive setting corrects drift; a separate guard stops pruning from quietly deleting everything at once.",
      fig: 'drift corrected; emptying the set refused by default',
      Visual: S.DriftCorrection,
    },
    {
      title: 'Deletes everything, refuses, or something else?',
      body: (
        <>
          Pruning is on. By mistake, every resource this application manages gets removed from git at once. Does the reconciler delete everything it was managing?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'yes, it deletes every managed resource immediately' },
          { label: "it refuses, by default — pruning everything away at once needs its own separate allowance", correct: true },
          { label: 'it ignores the change entirely and leaves everything as is' },
          { label: 'it pauses forever, waiting for a human to approve each deletion' },
        ],
        explain: (
          <>
            It refuses, by default. Pruning down to nothing at all is treated as too likely to be a mistake — exactly the scenario just described — so a separate setting has to allow it
            explicitly before the reconciler will actually empty the set.
          </>
        ),
      },
      fig: 'predict: pruning everything away at once',
      Visual: S.PredictPruneEverything,
    },
    {
      title: 'The field another controller owns',
      body: (
        <>
          An autoscaler changes a replica count live, on purpose. Telling the reconciler to ignore that one field stops a permanent tug of war between the autoscaler and git over who's right.
        </>
      ),
      duration: 2.4,
      fig: "a field the reconciler is told to leave alone",
      Visual: S.IgnoreDifferences,
    },
    {
      title: 'A secret committed in the clear is a leak',
      body: (
        <>
          Syncing a secret from an external store means the actual value never touches git at all. Committing it encrypted instead keeps git itself safe, but the decrypted value still sits in
          the cluster once it's applied — that exposure doesn't go away either way.
        </>
      ),
      duration: 2.8,
      fig: 'synced from a store, or committed encrypted',
      Visual: S.SecretsGitops,
    },
    {
      title: 'Why a stream job resists a gradual rollout',
      body: (
        <>
          Shifting a slice of traffic to a new version costs nothing to roll back. A stateful stream job redeployed the naive way starts over from empty state — that's not a gradual rollout,
          that's a data incident wearing the same name.
        </>
      ),
      duration: 2.8,
      fig: 'traffic shift vs. a job restarted from nothing',
      Visual: S.ProgressiveDelivery,
    },
    {
      title: 'The seam: identity and secrets',
      body: (
        <>
          The account, the network, the bucket, and the cluster itself are infrastructure as code — built before any application exists. Everything running inside that cluster is GitOps. The
          seam between them is exactly what the cluster needs handed to it from outside: identity, and a secret store.
        </>
      ),
      duration: 2.8,
      takeaway: 'Infrastructure as code builds the cluster; GitOps fills it — the seam is what the cluster needs from outside itself.',
      fig: 'the cluster as the boundary between the two',
      Visual: S.IacVsGitopsSeam,
    },
    {
      title: 'Delivered, but is it healthy?',
      body: (
        <>
          The platform is now delivered and kept converged to git. That says nothing at all about whether it's actually healthy.
        </>
      ),
      duration: 2.2,
      fig: 'recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
