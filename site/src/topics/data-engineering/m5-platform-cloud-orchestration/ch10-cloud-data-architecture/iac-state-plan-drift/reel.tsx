import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Declarative state, locking, plan/apply, drift and import, module boundaries, the 2023 BSL
// relicensing and the OpenTofu fork, Pulumi/CDK as the general-purpose alternative, and a
// policy-as-code gate — sourced from HashiCorp's, OpenTofu's, Pulumi's and AWS's own current
// documentation (SOURCES.md). No real Terraform or OpenTofu binary runs in this sandbox
// (disclosed in OUTLINE.md); examples.py reproduces the documented mechanics structurally.
const reel: Reel = {
  steps: [
    {
      title: 'Eight seconds apart, and no error from either one',
      body: (
        <>
          Two engineers run apply against the same state file, eight seconds apart. Neither sees
          an error. A bucket policy silently reverts to an earlier, more permissive version —
          the second apply's plan was already stale by the time it ran.
        </>
      ),
      duration: 4.8,
      Visual: S.RaceHook,
    },
    {
      title: 'Before the mechanism: what is a plan actually diffed against?',
      body: (
        <>
          A plan has to compare "what you want" against something. It isn't asking the live
          cloud fresh every time — so what is it actually comparing against?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: "The live cloud account, checked fresh every time" },
          { label: "The tool's own last-known record of what it last created", correct: true },
          { label: "Nothing — it just re-runs the last apply" },
          { label: "A snapshot taken by the cloud provider" },
        ],
        explain: (
          <>
            Its own record — the state file. That's exactly why state can go stale: it's a
            record of what the tool last did, not a live read of what's actually there right now.
          </>
        ),
      },
      Visual: S.PredictDiffTarget,
    },
    {
      title: "State: the tool's own record, not the live cloud",
      body: (
        <>
          State stores the binding between a remote object and the resource declared in
          configuration. Every plan is computed against this record — which means a stale record
          produces a plan built on outdated facts.
        </>
      ),
      duration: 4.8,
      Visual: S.StateIsTheRecord,
    },
    {
      title: 'Locking: the guard that stops two applies colliding',
      body: (
        <>
          A lock on the state file blocks a second operation from starting while the first is
          still writing. Reproduced for real: the second lock request fails outright until the
          first one releases — not a warning, a hard block.
        </>
      ),
      duration: 4.6,
      Visual: S.LockingGuard,
      takeaway: "A lock doesn't make the second apply wait on the live cloud — it waits on the state file.",
    },
    {
      title: 'Plan, then apply: dry run, then commit',
      body: (
        <>
          Plan alone changes nothing — it's a description of the effect, reviewable before
          anyone commits to it. Apply is the step that actually acts, on the remote system and
          on the state record together.
        </>
      ),
      duration: 4.2,
      Visual: S.PlanThenApply,
    },
    {
      title: 'Drift and import: two ends of the same surprise',
      body: (
        <>
          A console click changes something outside the tool entirely — the next plan shows
          drift, a gap between the record and reality. Import brings an existing, already-changed
          resource under management without recreating it.
        </>
      ),
      duration: 4.8,
      Visual: S.DriftAndImport,
      takeaway: "Drift is the tool noticing reality moved without it. Import is the tool catching up to reality without rebuilding it.",
    },
    {
      title: 'One unit: a bucket, its catalog entry, its IAM role',
      body: (
        <>
          A bucket, its catalog registration and the role that can touch it get modelled as one
          module — one unit of change and review — instead of three resources someone could
          change independently of each other.
        </>
      ),
      duration: 4.4,
      Visual: S.ModuleBoundary,
    },
    {
      title: 'The license changed, and a fork answered',
      body: (
        <>
          In August of 2023 HashiCorp moved Terraform from an open-source license to the
          Business Source License, with little advance notice to the community. OpenTofu is the
          fork that followed, now maintained under the Linux Foundation.
        </>
      ),
      duration: 4.8,
      Visual: S.LicenseFork,
    },
    {
      title: 'A real programming language instead of a declarative file',
      body: (
        <>
          Pulumi and AWS CDK define infrastructure in an actual general-purpose language — loops,
          conditionals, real abstractions. The trade-off is just as real: that same expressive
          power makes it easier to write logic that quietly breaks the plan-then-apply safety story.
        </>
      ),
      duration: 4.8,
      Visual: S.GeneralPurposeIac,
    },
    {
      title: "A plan that can't ship without a passed check",
      body: (
        <>
          A policy-as-code gate checks a plan before apply is even allowed to run. Reproduced for
          real: a plan containing a forbidden resource is blocked outright, while an identical
          plan without it goes straight through.
        </>
      ),
      duration: 4.6,
      Visual: S.PolicyGate,
      takeaway: "A policy-as-code gate turns \"someone should review this\" into something that is actually enforced, not merely suggested.",
    },
    {
      title: 'In one breath',
      body: (
        <>
          State is the tool's own record, which is why it can go stale. Locking stops two applies
          colliding on that record. Drift and import are the same gap, approached from two
          directions. And a policy gate can block a bad plan before it ever runs.
        </>
      ),
      duration: 4.2,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A plan that would have made a bucket public shipped without a single human looking at
          it. Which mechanism, on its own, would have actually stopped that from reaching apply?
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'State locking' },
          { label: 'A policy-as-code gate checking the plan before apply', correct: true },
          { label: 'Switching from Terraform to OpenTofu' },
          { label: 'Running terraform import first' },
        ],
        explain: (
          <>
            A policy gate. Locking stops two operators from colliding, not a single bad plan from
            shipping. Import and the choice of tool don't touch this at all — only a gate that
            actually inspects the plan's content can refuse to let it through.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
