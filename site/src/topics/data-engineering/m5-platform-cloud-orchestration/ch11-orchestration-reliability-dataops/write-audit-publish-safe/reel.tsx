import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real write-audit-publish cycle against a local snapshot-log stand-in for an Iceberg table
// (examples.py): a good write audited and fast-forwarded into production, a deliberately bad
// write that fails the same audit and never reaches it. Blue-green table swap, a shadow run
// diffed before cutover, a canary rollout halting on a bad partition, a feature-flagged
// transform, and a one-step time-travel rollback. Sourced: the Apache Iceberg specification's
// own branching documentation and AWS's published WAP engineering write-up.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A bad transformation goes straight to production and silently corrupts a week of data
          before anyone notices. The same bad transformation, run through a write-audit-publish
          deploy instead, fails its audit in minutes -- production is never touched.
        </>
      ),
      duration: 4.8,
      fig: 'straight to production vs audited first.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does passing CI mean safe at deploy time?',
      body: (
        <>
          The prior topic's slim CI proves a change is safe before it merges. Is that the same
          guarantee as being safe at the exact moment the change actually reaches production?
        </>
      ),
      duration: 2.8,
      fig: 'safe to merge. is that safe to deploy?',
      predict: {
        options: [
          { label: 'Yes -- passing CI is the same guarantee' },
          { label: 'No -- a write can still corrupt production', correct: true },
        ],
        explain: (
          <>
            A change can pass every pre-merge test and still corrupt production the moment it
            actually writes. That is a different failure, at a different moment.
          </>
        ),
      },
      Visual: S.PredictCIMeansSafeDeploy,
    },
    {
      title: 'Reveal: write to an audit branch',
      body: (
        <>
          The write lands somewhere production genuinely can't see yet -- a branch independent
          of the main table's own history, not a copy consumers could accidentally read.
        </>
      ),
      duration: 4.8,
      fig: 'written. not yet visible to anyone downstream.',
      Visual: S.RevealAuditBranch,
    },
    {
      title: 'Reveal: audit, then fast-forward or block',
      body: (
        <>
          A real audit runs against that branch. A pass fast-forwards production straight to it.
          A fail leaves production exactly as it was -- the bad write never arrives at all.
        </>
      ),
      duration: 4.8,
      fig: 'pass: fast-forwarded. fail: never arrives.',
      takeaway: 'An audit that blocks a bad write is only real if production genuinely never sees it.',
      Visual: S.RevealAuditGate,
    },
    {
      title: 'Predict: does a table deploy need the same care as an app deploy?',
      body: (
        <>
          Blue-green and canary rollouts are well-known patterns for deploying application code
          safely. Does a table full of data need that same kind of careful rollout?
        </>
      ),
      duration: 2.8,
      fig: 'known for app code. true for tables too?',
      predict: {
        options: [
          { label: "No -- a table isn't running code, it doesn't need this" },
          { label: 'Yes -- the same patterns apply at the table level', correct: true },
        ],
        explain: (
          <>
            A table swap and a partition-by-partition rollout work exactly the same way a
            blue-green or canary application deploy does, with the same measured safety.
          </>
        ),
      },
      Visual: S.PredictTableNeedsAppSafety,
    },
    {
      title: 'Reveal: blue-green tables and a canary rollout',
      body: (
        <>
          Two full copies, one live and one being rebuilt, swapped with a single atomic pointer
          update. Separately, a change measured on one partition first, expanding only while
          every partition it reaches still looks healthy.
        </>
      ),
      duration: 4.8,
      fig: 'one pointer swap. one partition at a time.',
      Visual: S.RevealBlueGreenCanary,
    },
    {
      title: 'Reveal: a shadow run, diffed before cutover',
      body: (
        <>
          A new pipeline version runs in parallel with the old one, touching no real traffic at
          all. Its output gets diffed against the old version's real output before anyone
          actually cuts over.
        </>
      ),
      duration: 4.8,
      fig: 'runs in parallel. diffed before anyone cuts over.',
      takeaway: 'A shadow run catches a regression with zero production traffic ever at risk.',
      Visual: S.RevealShadowRun,
    },
    {
      title: 'Reveal: a feature flag and a time-travel rollback',
      body: (
        <>
          New transform logic sits behind a flag, toggled without a redeploy -- including
          instantly off. And a bad publish that did slip through gets undone in one operation,
          back to the exact prior snapshot.
        </>
      ),
      duration: 4.8,
      fig: 'toggled, not redeployed. rolled back in one step.',
      Visual: S.RevealFlagAndRollback,
    },
    {
      title: 'Recap',
      body: (
        <>
          Six different mechanisms, all built around one shared idea: never let an unverified
          change touch what a real consumer actually reads.
        </>
      ),
      duration: 4.8,
      fig: 'six mechanisms. one shared idea.',
      takeaway: 'Nothing unverified ever touches what a consumer actually reads.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          This topic's own real audit branch: a good batch and a deliberately bad batch, each
          written and audited for real, against the shop's own production table.
        </>
      ),
      duration: 2.8,
      fig: 'one good batch. one bad batch. which reaches production?',
      predict: {
        options: [
          { label: 'Both batches eventually reach production' },
          { label: 'Only the batch that passes the audit does', correct: true },
        ],
        explain: (
          <>
            The good batch passes the audit and is fast-forwarded in. The bad batch fails the
            exact same audit, and production is left completely untouched.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
