import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured directly (examples.py): 14 teams x 60 datasets x 3 environments, one role per
// triple, is 2,520 roles. Adding one new restricted dataset for one team needs 3 new roles
// under RBAC (one per environment) versus 0 new policy edits under ABAC, because the existing
// tag-based rule already covers the new dataset by attribute. The same ABAC rule is tested on
// an allow case, a tier-deny case, and a PII-without-purpose deny case.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The shop has fourteen teams, sixty datasets and three environments, and security asks
          for "a role per team per dataset per environment, for least privilege." Count the
          roles. Then: when data science gets a new restricted dataset, does that need one
          change, or fourteen?
        </>
      ),
      duration: 5,
      fig: 'a role per team, per dataset, per environment. Count the roles.',
      Visual: S.Hook,
    },
    {
      title: "Reveal: RBAC's own shape -- a role holds many privileges, a user holds one or more roles",
      body: (
        <>
          A role bundles up the privileges a job needs. A person is assigned one or more roles,
          not given privileges one at a time. Security administration becomes managing roles,
          not managing every individual grant.
        </>
      ),
      duration: 4.8,
      fig: 'a role holds privileges. A person holds one or more roles.',
      Visual: S.RevealRBACShape,
    },
    {
      title: 'Predict: 14 teams, 60 datasets, 3 environments, one role per triple. How many roles?',
      body: (
        <>
          If "least privilege" means a separate role for every team, dataset and environment
          combination, how many roles does that produce for fourteen teams, sixty datasets and
          three environments?
        </>
      ),
      duration: 2.8,
      fig: '14 teams x 60 datasets x 3 environments. How many roles?',
      predict: {
        options: [
          { label: 'A few hundred -- most teams only touch a handful of datasets in practice' },
          { label: 'Over two thousand -- the count is the full product of all three numbers', correct: true },
        ],
        explain: (
          <>
            Over two thousand. "A role per triple" means every team-dataset-environment
            combination gets its own role, whether or not that team actually uses that dataset
            yet -- the count is the full product, not the realistic subset.
          </>
        ),
      },
      Visual: S.PredictRoleCount,
    },
    {
      title: 'Reveal: 2,520 roles, measured directly',
      body: (
        <>
          Measured directly: fourteen times sixty times three is two thousand five hundred and
          twenty roles. Nobody reviews a list that size and can say with confidence who should
          still have what.
        </>
      ),
      duration: 4.8,
      fig: '14 x 60 x 3: two thousand five hundred twenty roles, measured.',
      Visual: S.RevealRoleCount,
    },
    {
      title: 'Elaborate: ABAC replaces the grid with one rule over attributes',
      body: (
        <>
          Attribute-based access control decides access by evaluating attributes of the subject,
          the object and the environment against a policy -- not by matching a role to a name.
          One rule like "analysts may read tier confidential or below, never category PII
          without a purpose attribute" replaces the entire grid.
        </>
      ),
      duration: 5,
      fig: 'attributes, not roles per combination. One rule for the whole grid.',
      takeaway: 'RBAC multiplies a role for every team and dataset; ABAC writes one rule over the data and the person instead.',
      Visual: S.ElaborateABACRule,
    },
    {
      title: 'Predict: data science gets a new restricted dataset. New RBAC roles vs new ABAC edits?',
      body: (
        <>
          Data science now needs access to a brand-new dataset with a restricted column. Under
          the role-per-triple RBAC scheme, how many new roles does that take? Under the one
          tag-based ABAC rule, how many edits?
        </>
      ),
      duration: 2.8,
      fig: 'one new restricted dataset, one team. RBAC roles vs ABAC edits?',
      predict: {
        options: [
          { label: 'Both need the same number of changes -- a new dataset is a new dataset either way' },
          { label: 'RBAC needs a new role per environment; ABAC needs none, if the tag already matches', correct: true },
        ],
        explain: (
          <>
            RBAC needs a brand new role, created and assigned, for every environment that
            dataset lives in. ABAC needs nothing new at all, as long as the new dataset is
            tagged the way the existing rule already reads.
          </>
        ),
      },
      Visual: S.PredictNewDataset,
    },
    {
      title: 'Reveal: 3 new roles under RBAC; 0 edits under ABAC, measured directly',
      body: (
        <>
          Measured directly: one team needing the new dataset across three environments costs
          three brand-new RBAC roles. The same change costs zero ABAC rule edits, because the
          rule already reads "tier confidential," and the new dataset is tagged that way too.
        </>
      ),
      duration: 4.8,
      fig: 'RBAC: 3 new roles. ABAC: 0 edits. Same change, measured.',
      Visual: S.RevealNewDatasetCost,
    },
    {
      title: 'Elaborate: the decision point and the enforcement point are two different jobs',
      body: (
        <>
          A policy engine like OPA decouples deciding from enforcing: software asks a question
          with structured data, and the engine answers allow, deny, or in Trino's case a row
          filter or a column mask to apply. One engine can answer that question for every
          enforcement point in the stack, instead of each one reimplementing the logic.
        </>
      ),
      duration: 5,
      fig: 'decision point: one engine, asked by many. Enforcement: applies the verdict.',
      takeaway: 'Deciding what is allowed and enforcing it where data lives are separate jobs; one engine can answer for many enforcers.',
      Visual: S.ElaborateDecisionEnforcement,
    },
    {
      title: 'Reveal: identity comes from outside the policy engine entirely',
      body: (
        <>
          None of this knows who someone is on its own. Single sign-on through the company's
          identity provider authenticates a person once, and a separate provisioning protocol
          creates and removes their accounts across every connected system -- so removing someone
          in one place removes their access everywhere, not just from the system an admin
          happened to touch.
        </>
      ),
      duration: 5,
      fig: 'SSO: authenticate once. Provisioning: remove access everywhere, from one place.',
      Visual: S.RevealIdentityFederation,
    },
    {
      title: 'Reveal: entitlements drift, so a periodic access review is the catch policy alone misses',
      body: (
        <>
          None of this stays correct on its own. People change teams, projects end, and a rule
          written for one purpose keeps granting access long after the reason is gone. A
          scheduled review that lists who has what, with an owner who attests to each one, is
          the control that catches that drift -- something no policy or role, however well
          written, checks by itself.
        </>
      ),
      duration: 5,
      fig: 'entitlements drift silently. A periodic review, with an owner, catches it.',
      Visual: S.RevealAccessReviews,
    },
    {
      title: 'Recap',
      body: (
        <>
          A role per combination multiplies into thousands, measured. One attribute-based rule
          replaces the whole grid, and costs nothing when a new dataset already fits the pattern.
          Deciding and enforcing stay separate jobs, fed by an identity that comes from outside
          the policy entirely.
        </>
      ),
      duration: 5,
      fig: '2,520 roles vs one rule; decision and enforcement; identity from outside.',
      takeaway: 'Who someone is, what a rule allows, and who enforces it are three separate questions no working policy can skip.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
