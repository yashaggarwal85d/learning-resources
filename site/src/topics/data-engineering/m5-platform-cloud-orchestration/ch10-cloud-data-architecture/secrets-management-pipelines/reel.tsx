import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Dual-credential rotation, dynamic short-lived credentials, orchestrator secrets backends, and
// the three surfaces a secret must never be committed to. Every number is executed and checked
// by examples.py, against a real local PostgreSQL instance.
const reel: Reel = {
  steps: [
    {
      title: 'One password, revoked at the exact wrong instant',
      body: (
        <>
          A rotation script updates the secret store and revokes the old password in the same breath. Every pipeline run still holding that old
          password starts failing mid-batch within seconds, with no warning beforehand.
        </>
      ),
      duration: 4.2,
      Visual: S.OnePasswordRevoked,
    },
    {
      title: "What's the one change that prevents every one of those failures?",
      body: (
        <>
          The rotation script did two things in one step: issue a new password, and revoke the old one. Which single change prevents every one
          of those in-flight failures, without giving up rotation entirely?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'Rotate less often' },
          { label: 'Keep both credentials valid for an overlap window, cut the old one only after every consumer has moved', correct: true },
          { label: 'Make the rotation script run faster' },
          { label: 'Store the password in more places' },
        ],
        explain: (
          <>
            An overlap window. Rotating less often only makes the failure rarer, never impossible — the same race exists at every rotation. Keep
            both credentials valid until every consumer has actually switched, and the identical rotation causes nothing to fail.
          </>
        ),
      },
      Visual: S.WhatPreventsFailures,
    },
    {
      title: 'A secret store is not just a place to put a string',
      body: (
        <>
          A managed secret store or Vault isn't competing with "an environment variable" on storage. It's competing on knowing who read a secret
          and when, rolling a compromised value back to a known-good one, and controlling exactly who can read what.
        </>
      ),
      duration: 4.6,
      Visual: S.NotJustAPlaceToPut,
    },
    {
      title: 'Two roles, not one password, is the whole trick',
      body: (
        <>
          Reproduced against a real local database: change one role's password in place, and the old one stops authenticating on the very next
          attempt. Create a second role with the same access instead, and both stay valid until the old one is deliberately cut.
        </>
      ),
      duration: 4.8,
      Visual: S.TwoRolesNotOnePassword,
      takeaway: 'Rotate by creating a second credential with the same access; cut the old one only once everything has moved.',
    },
    {
      title: 'A credential that expires without anyone revoking it',
      body: (
        <>
          A dynamic database credential carries its own expiry from the moment it's issued. Before that point a connection succeeds; after it,
          the identical attempt fails — with nobody having run a revoke command in between.
        </>
      ),
      duration: 4.4,
      Visual: S.ExpiresWithoutRevoking,
      takeaway: "A dynamic credential expires on its own schedule; nobody has to remember to revoke it for it to stop working.",
    },
    {
      title: 'The orchestrator asks the real store, every time it runs',
      body: (
        <>
          An orchestrator's own metastore is a database like any other — anyone who can query it can read whatever was pasted into a connection
          string there. A secrets backend moves the lookup to task-run time, against the real store, checked before the metastore ever is.
        </>
      ),
      duration: 4.6,
      Visual: S.AsksTheRealStore,
      takeaway: "An orchestrator's secrets backend is checked before its own metastore, so the real secret never has to live there.",
    },
    {
      title: 'Three surfaces, one mistake',
      body: (
        <>
          An image layer is cached and redistributed to every machine that pulls it. A notebook's outputs get committed right along with its
          code. Literal DAG code sits in version-control history long after anyone remembers it's there.
        </>
      ),
      duration: 4.6,
      Visual: S.ThreeSurfacesOneMistake,
      takeaway: "A secret in an image layer, a notebook's output or literal DAG code outlives the fix on its own surface.",
    },
    {
      title: 'In one breath',
      body: (
        <>
          A secret store buys access control, an audit log and versioning. Rotate by adding a second credential, never by overwriting the first.
          A dynamic credential's own expiry beats a human remembering to revoke it. Next: what any of this actually costs.
        </>
      ),
      duration: 3.4,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A rotation script creates a second database role, waits a fixed delay, then revokes the first role's login — but one long-running batch
          job was still mid-run on the old role when its login got revoked. Did the dual-credential approach itself fail here?
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes — overlap windows don\'t actually prevent this kind of failure' },
          { label: "No — the window was sized to a fixed delay instead of \"until every consumer has actually finished\"", correct: true },
        ],
        explain: (
          <>
            No, the mechanism didn't fail — the window was sized wrong. "Overlap until every consumer has moved" means confirming the old
            credential has zero active connections before revoking it, not picking a fixed delay and hoping it's long enough for every consumer,
            including a long-running batch job.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
