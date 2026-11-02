import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Roles over static keys, the four distinct gates on a role (trust, permission, boundary, SCP),
// and the PassRole escalation path AWS itself documents, reproduced and closed locally. Every
// number is executed and checked by examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'A key that never expires, a credential that already has',
      body: (
        <>
          A contractor's laptop with a static access key pasted into a file years ago is stolen. The key still works, because nothing ever rotated
          or scoped it, and it reaches both raw and curated data. Replay the identical theft against a workload-identity design instead.
        </>
      ),
      duration: 4.4,
      Visual: S.StolenKeyVsCredential,
    },
    {
      title: 'What made the difference?',
      body: (
        <>
          The same laptop theft happened in both halves of that story. What property of the second credential — not of the thief, not of the
          laptop — is the entire reason the breach there did almost no damage?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'It was encrypted on disk' },
          { label: 'It was short-lived and scoped to one role', correct: true },
          { label: 'The attacker was less skilled the second time' },
          { label: 'The laptop had a firewall' },
        ],
        explain: (
          <>
            Short-lived and scoped. A federated credential is minted fresh, expires soon, and is scoped to exactly the role a workload assumed —
            never written to disk by a human. The laptop's own defenses already failed in both halves; what differed is that the thing worth
            stealing from it expired before anyone needed to notice it was gone.
          </>
        ),
      },
      Visual: S.WhatMadeTheDifference,
    },
    {
      title: 'Three clouds, the same broker pattern',
      body: (
        <>
          A workload proves who it is to an identity broker, and the broker hands back a short-lived credential. AWS has two names for this
          (IRSA, and the newer EKS Pod Identity); GKE and Azure each have their own name for the identical exchange.
        </>
      ),
      duration: 5,
      Visual: S.ThreeCloudsBrokerPattern,
    },
    {
      title: "A trust policy answers one question; a permission policy answers another",
      body: (
        <>
          A trust policy decides who may even become this role for a moment. A permission policy decides what that role, once assumed, is
          actually allowed to do. Getting either one wrong breaks the role in a different way.
        </>
      ),
      duration: 4.4,
      Visual: S.TrustVsPermission,
      takeaway: 'A trust policy (who may assume a role) and a permission policy (what it may do) are independent gates.',
    },
    {
      title: 'A boundary and an org guardrail are the same idea, drawn at different sizes',
      body: (
        <>
          A permission boundary never grants anything by itself — it only caps what an identity policy can grant, by intersection. An SCP is the
          same cap, drawn around an entire account instead of one role, reaching even that account's own root user.
        </>
      ),
      duration: 4.8,
      Visual: S.BoundaryAndGuardrail,
      takeaway: 'A permission boundary and an SCP never grant access; both only cap what an identity policy can grant, by intersection.',
    },
    {
      title: 'The escalation, reproduced — and closed',
      body: (
        <>
          A principal that can create a resource and hand it a role ends up with that role's permissions by proxy — unless the role a principal
          may pass is scoped down to only the roles it should ever be allowed to pass.
        </>
      ),
      duration: 4.8,
      Visual: S.EscalationReproduced,
      takeaway: "Permission to pass any role escalates a launch to that role's permissions; scoping which roles may be passed fixes it.",
    },
    {
      title: 'Raw and curated are never the same role',
      body: (
        <>
          A role scoped to raw data and a role scoped to curated data share nothing. A credential stolen for one of them is simply the wrong key
          for the other door.
        </>
      ),
      duration: 4,
      Visual: S.RawVsCuratedRoles,
      takeaway: 'Raw and curated roles should share no permissions, so a credential stolen for one is the wrong key elsewhere.',
    },
    {
      title: 'In one breath',
      body: (
        <>
          Roles over static keys. Trust, permission, boundary and org guardrail are four distinct gates, not one. Scoping which role may be
          passed closes the escalation; raw and curated roles should never overlap. Next: the secrets a role still can't replace.
        </>
      ),
      duration: 3.2,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team gives a CI service account permission to pass any role in the account, reasoning that every role it might pass today is already
          scoped tightly. Is that reasoning safe?
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes — the roles being scoped tightly today is what matters' },
          { label: "No — passing any role still lets this account pass a role created later with far more permission", correct: true },
        ],
        explain: (
          <>
            No. Today's roles being scoped tightly says nothing about every role that will ever exist in that account. Permission to pass any
            role means the moment anyone creates a higher-privileged role for an unrelated purpose, this same CI account can pass that one too —
            the exact gap the earlier fix closed, reopened by a policy that looked safe at the time it was written.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
