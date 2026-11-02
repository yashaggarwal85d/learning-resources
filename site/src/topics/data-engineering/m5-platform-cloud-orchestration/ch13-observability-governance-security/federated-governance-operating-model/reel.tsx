import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured directly (examples.py): a self-serve table-registration gate, modeling the central
// policy / self-serve platform / domain ownership split Dehghani's own article describes,
// admits a table that satisfies every centrally-defined rule and rejects one missing exactly
// its classification tag, naming the specific rule it failed.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Three domain teams -- orders, customers, marketing -- each run their own tables. A
          regulator asks for one list of every table holding restricted personal data, with its
          owner, within a day. A central team hand-maintaining that list takes weeks and is
          wrong by the time it's done; with no central rules at all, every domain gives a
          different answer. What's the smallest set of things that has to be central, and what
          must be impossible to bypass?
        </>
      ),
      duration: 5,
      fig: 'one list, one day. hand-maintained: weeks, wrong. no rules: every domain differs.',
      Visual: S.Hook,
    },
    {
      title: "Reveal: domain teams own their data products, a platform team supplies self-serve tooling, and central policy is applied by the platform, computationally",
      body: (
        <>
          Each domain owns and runs its own data products. A platform team builds the tooling
          every domain uses to do that without reinventing it. And a central body writes policy
          once -- a classification scheme, a retention rule, an access rule -- which the
          platform then enforces in code, so no domain can quietly ship around it.
        </>
      ),
      duration: 5,
      fig: 'domains: own their products. platform: self-serve tooling. policy: central, in code.',
      Visual: S.RevealMeshShape,
    },
    {
      title: "Predict: should policy, ownership and tooling each be centralized, each be left to the domain, or split -- and if split, which way?",
      body: (
        <>
          For the regulator's request to actually work, decide where each of three things
          should live: the rule itself, who answers for a given table, and the tool that
          actually checks the rule.
        </>
      ),
      duration: 2.8,
      fig: 'policy, ownership, tooling: central, local, or a three-way split?',
      predict: {
        options: [
          { label: 'All three should be centralized, so one team controls the whole answer' },
          { label: 'Policy and tooling are central; ownership stays with the domain -- a split, not one answer', correct: true },
        ],
        explain: (
          <>
            A split. The rule has to be written once or every domain answers differently. The
            tool that enforces it has to be shared or every domain builds its own, inconsistent
            version. But who actually answers for a given table is a fact about that table, and
            centralizing it doesn't make a central team actually know the data better.
          </>
        ),
      },
      Visual: S.PredictSplit,
    },
    {
      title: "Reveal: policy is written centrally; ownership stays with the domain that actually knows the data; tooling is central and enforces the policy automatically",
      body: (
        <>
          The rule itself -- what counts as restricted, how long to retain it -- is written
          once, centrally. Who owns a given table stays exactly where the data actually lives:
          with the domain. And the tool that checks every table against the rule is shared,
          central infrastructure, so enforcement doesn't depend on any one domain remembering to
          run it.
        </>
      ),
      duration: 5,
      fig: 'policy: central. ownership: stays with the domain. tooling: central, automatic.',
      takeaway: 'A rule written once and platform-enforced beats a central team checking by hand or every domain inventing its own.',
      Visual: S.RevealSplitAnswer,
    },
    {
      title: "Elaborate: reverse Conway's law -- choose the team structure that produces the governance architecture you actually want",
      body: (
        <>
          Conway's own 1968 paper states its thesis plainly: an organization that designs a
          system is constrained to produce a design that copies that organization's own
          communication structure. Reversed, as a design tool: pick the team structure on
          purpose, so the system it produces is the one you actually wanted, instead of
          whatever your org chart happened to produce by accident.
        </>
      ),
      duration: 5,
      fig: "Conway, 1968: a design copies the org's structure. reversed: pick the structure first.",
      Visual: S.ElaborateConway,
    },
    {
      title: "Predict: a masking rule over a tag, a table with no declared owner, and a retention exception with a stated legal reason -- which of these can be automated, and which needs a human?",
      body: (
        <>
          Sort three governance decisions: applying a mask to a column already tagged
          sensitive, blocking a table that was never assigned an owner, and granting one table
          an exception to the retention policy because of a specific legal reason. Which of
          these can a machine decide on its own, and which genuinely needs a person?
        </>
      ),
      duration: 2.8,
      fig: 'a tag-based mask, an ownerless table, a legal retention exception: automate, or human?',
      predict: {
        options: [
          { label: 'All three can be automated -- a rule is a rule, whatever it governs' },
          { label: 'The first two are rules over an attribute; the legal exception needs a person to judge the reason', correct: true },
        ],
        explain: (
          <>
            A rule over an attribute -- a tag is present, an owner field is empty -- is exactly
            what a machine checks well. A legal reason for an exception is a judgment call about
            whether that specific reason actually holds, and that needs a named person who can
            be asked to justify it later, not a rule evaluated once and forgotten.
          </>
        ),
      },
      Visual: S.PredictStewardship,
    },
    {
      title: "Reveal: a rule over an attribute automates cleanly; a legal reason or a genuinely ambiguous case keeps a named human steward and a review cadence",
      body: (
        <>
          Masking a tagged column and blocking an ownerless table are both rules over an
          attribute, so the platform automates both without anyone in the loop. A retention
          exception's legal reason and a free-text column that might or might not be personal
          data both need actual judgment -- so each keeps a named steward, and a cadence for
          revisiting the call.
        </>
      ),
      duration: 5,
      fig: 'a tag, an empty owner field: automated. a legal reason, an ambiguous call: a steward.',
      takeaway: "Automate what a machine can check against a rule; keep human what needs a reason a machine can't weigh.",
      Visual: S.RevealStewardshipAnswer,
    },
    {
      title: "Reveal: measured directly -- a self-serve registration gate admits a table meeting every rule, and rejects one missing its classification tag, naming exactly which rule it failed",
      body: (
        <>
          Measured directly: run a table through a registration gate checking its schema, its
          contract fields and its classification tags against the centrally-defined rules. A
          table meeting all three is admitted. A table that forgot to tag a column holding
          emails is rejected, and the rejection names the exact missing rule -- not just a
          refusal, a reason.
        </>
      ),
      duration: 5,
      fig: 'schema, contract, tag: all present, admitted. tag missing: rejected, by name.',
      Visual: S.RevealGateRuns,
    },
    {
      title: 'Recap',
      body: (
        <>
          Policy gets written once, centrally. Ownership stays wherever the data actually
          lives, with the domain. And the line between what a platform automates and what keeps
          a named human steward is exactly the line between a rule over an attribute and a
          judgment call a machine can't make.
        </>
      ),
      duration: 5,
      fig: 'policy: central. ownership: local. the line: a rule vs. a judgment call.',
      takeaway: 'Governance that only lives on paper is optional; governance a platform actually enforces is not.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
