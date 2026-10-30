import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number here is computed and asserted in examples.py: fourteen teams by sixty datasets by
// three environments is two thousand five hundred twenty roles; a new restricted dataset every
// team needs costs RBAC forty-two role edits and ABAC one tag edit; an access review over three
// synthetic grants catches exactly one stale one.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The shop has fourteen teams, sixty datasets and three environments. Security asks for a
          role per team per dataset per environment, for least privilege. Count the roles.
        </>
      ),
      duration: 5.2,
      fig: 'fourteen teams, sixty datasets, three environments. Count the roles.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: one change, or fourteen?',
      body: (
        <>
          The data science team gets a new dataset with a restricted column. Under the role
          grid, does that take one change, or fourteen? And under a tag-based rule instead?
        </>
      ),
      duration: 5.2,
      fig: 'one new restricted dataset. One change, or fourteen?',
      predict: {
        options: [
          { label: 'Both approaches need about the same number of changes' },
          { label: 'The role grid needs one change per team; a tag-based rule needs one, total', correct: true },
        ],
        explain: (
          <>
            A role tied to one specific team and dataset has to be created or edited for every
            team that needs the new dataset. A rule that reads a tag needs the tag applied once —
            every team's existing rule already reads it.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: the role count, done out',
      body: (
        <>
          Teams times datasets times environments. Not a one-time number — every new team,
          dataset or environment multiplies it again, until nobody can say what a given role
          actually grants anymore.
        </>
      ),
      duration: 5.2,
      fig: 'teams times datasets times environments. It only grows.',
      Visual: S.RevealRoleCount,
    },
    {
      title: 'Reveal: one rule, read from tags, instead',
      body: (
        <>
          A policy that reads a tag on the data itself — its tier, its category — replaces the
          entire grid of roles with a handful of short rules, written once.
        </>
      ),
      duration: 5.2,
      fig: 'read the tag, not the team. A handful of rules, not a grid.',
      Visual: S.RevealAbacRule,
    },
    {
      title: 'Reveal: the decision point and the enforcement point are separate',
      body: (
        <>
          Where data is actually read sits one box, asking a question. A separate engine answers
          it. Splitting them lets every data surface in the company share one policy, and one
          audit trail.
        </>
      ),
      duration: 5.6,
      fig: 'ask here, decide there. One engine, every surface.',
      Visual: S.RevealDecisionEnforcement,
    },
    {
      title: 'Reveal: what the policy engines actually hand back',
      body: (
        <>
          Ask one of these engines a question, and it hands back a verdict — allow, deny, or a
          narrower instruction: filter these rows out, mask this column.
        </>
      ),
      duration: 5.2,
      fig: 'ask the engine. Back comes allow, deny, filter, or mask.',
      Visual: S.RevealPolicyEngines,
    },
    {
      title: 'Reveal: identity comes from outside, through the IdP',
      body: (
        <>
          A person proves who they are once, at the company's own identity provider. Every
          downstream system trusts that single proof instead of asking again itself.
        </>
      ),
      duration: 5.2,
      fig: 'prove it once, at the IdP. Everyone downstream trusts it.',
      Visual: S.RevealIdpFederation,
    },
    {
      title: 'Reveal: provisioning keeps accounts and groups in sync',
      body: (
        <>
          Proving who you are and actually having an account somewhere are two separate jobs. A
          second protocol creates and removes accounts and group membership as people join, move
          and leave.
        </>
      ),
      duration: 5.6,
      fig: 'a second job: creating, and removing, the account itself.',
      takeaway: 'Authentication proves who someone is; provisioning is the separate job of keeping their accounts in sync.',
      Visual: S.RevealProvisioning,
    },
    {
      title: 'Reveal: offboarding in one place, everywhere at once',
      body: (
        <>
          Because every downstream system trusts the same identity provider and the same
          provisioning feed, removing someone there removes their access everywhere at once — no
          extra ticket, per system, required.
        </>
      ),
      duration: 5.6,
      fig: 'remove them once. Every downstream system follows.',
      takeaway: 'Offboarding looks instant only because provisioning, not authentication alone, is wired to every system.',
      Visual: S.RevealOffboarding,
    },
    {
      title: 'Reveal: periodic access reviews catch what policy never will',
      body: (
        <>
          A rule evaluated correctly every single time still grants access the rule says is
          correct, long after the real reason for it ended. A scheduled review, with an owner who
          has to attest, is the control that catches that.
        </>
      ),
      duration: 5.6,
      fig: 'a correct rule, an expired reason. Someone has to check.',
      takeaway: "A policy that's evaluated correctly can still be granting access for a reason that's gone stale.",
      Visual: S.RevealAccessReviews,
    },
    {
      title: 'Recap',
      body: (
        <>
          A role per team per dataset per environment only ever grows. A rule that reads a tag on
          the data stays flat. A decision point and an enforcement point, kept separate, let one
          engine serve every surface. Identity and provisioning are different jobs, and a review
          still has to check what a correct rule alone cannot.
        </>
      ),
      duration: 5.6,
      fig: 'roles grow, tags stay flat; ask here, decide there; review, still needed.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          The shop's grid is still live: fourteen teams, three environments. One new restricted
          dataset lands in every team's hands at once. How many changes does each approach
          actually need now, and by how much do they differ?
        </>
      ),
      duration: 5.6,
      fig: 'one dataset, every team. How many changes, each way?',
      predict: {
        options: [
          { label: 'Both approaches need roughly the same handful of changes' },
          { label: 'The role grid needs dozens of edits; the tag rule needs exactly one', correct: true },
        ],
        explain: (
          <>
            Fourteen teams across three environments means the role grid needs a new or edited
            role for every one of those combinations — dozens of edits. The tag-based rule needs
            the new dataset's tag set once, and every existing rule already reads it.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
