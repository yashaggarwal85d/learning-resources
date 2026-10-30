import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim traces to examples.py: a real register_table() run admits one well-formed table and
// rejects two malformed ones with the exact gate name in the reason; the six governance decisions
// split exactly between a rule over an attribute and a named human steward.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Three domain teams each run their own tables. A regulator asks for one list of every
          table holding restricted personal data and its owner, by tomorrow. A hand-maintained
          central list takes weeks and is wrong. With no central rules, every domain answers
          differently.
        </>
      ),
      duration: 6.8,
      fig: 'one regulator ask. a central list, weeks late and wrong.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what must be central?',
      body: (
        <>
          Central policy, central ownership, central tooling — or some split of the three. What is
          the smallest set of things that must be impossible for a domain team to bypass?
        </>
      ),
      duration: 6.8,
      fig: 'policy, ownership, tooling. which one can’t be skipped?',
      predict: {
        options: [
          { label: 'One team must own and run every table centrally' },
          { label: 'Policy stays central; ownership and tooling stay with each domain', correct: true },
        ],
        explain: (
          <>
            A domain team keeps its own table and its own tooling. What has to stay central is the
            policy — and it has to be enforced in code, not asked for nicely.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: the operating shape',
      body: (
        <>
          Each domain owns its own data as a product. A shared platform supplies the tooling every
          domain uses. A central body writes the policy once. Dehghani's own name for that last
          part: federated computational governance — the platform, not a person, carries it out.
        </>
      ),
      duration: 7.2,
      fig: 'domain owns the data. platform supplies tooling. policy stays central.',
      Visual: S.RevealMeshShape,
    },
    {
      title: "Reveal: reverse Conway's law",
      body: (
        <>
          Conway's own 1968 thesis: a group that designs a system is constrained to copy its own
          communication structure into the design. Run it backward — choose the team split on
          purpose, and the architecture it produces follows the boundaries already drawn.
        </>
      ),
      duration: 7.2,
      fig: 'a team copies its own shape into what it builds. choose the shape first.',
      takeaway: "Conway's law runs forward by accident; reverse it on purpose to get the architecture you want.",
      Visual: S.RevealReverseConway,
    },
    {
      title: 'Reveal: automate, or ask a person?',
      body: (
        <>
          A rule over an attribute runs itself: mask a tagged column, block a table with no owner,
          fail a contract missing a field. A judgement call stays human: is this table critical, is
          this retention exception legal, what does an untagged column actually hold.
        </>
      ),
      duration: 7.2,
      fig: 'a rule over an attribute runs itself. a judgement call needs a person.',
      takeaway: 'Automate the rule over an attribute; keep a named person for the judgement call a rule cannot make.',
      Visual: S.RevealAutomateVsHuman,
    },
    {
      title: 'Reveal: the registration gate, schema and contract',
      body: (
        <>
          Before a table becomes discoverable, it passes through gates. The first checks every
          column has a name and a type. The second checks a contract exists with an id, a version
          and an owner — on this run, one table's contract was missing its version and was bounced.
        </>
      ),
      duration: 7.2,
      fig: 'gate one: schema. gate two: contract. one table bounced here.',
      Visual: S.RevealGateSchemaContract,
    },
    {
      title: 'Reveal: the registration gate, classification',
      body: (
        <>
          The third gate checks every column carries a classification tag — a tier always, a
          category only where one applies. On this run, a free-text column its own scanner never
          tagged was bounced too, naming the exact gate that caught it.
        </>
      ),
      duration: 6.8,
      fig: 'gate three: every column tagged. an untagged column, bounced.',
      takeaway: 'Three gates, three reasons — a rejected table always names the exact rule it broke.',
      Visual: S.RevealGateClassification,
    },
    {
      title: 'Reveal: what the gates cannot decide',
      body: (
        <>
          No gate can tell a business-critical table from a routine one. No gate can grant a
          retention exception, because that needs a stated legal reason. No gate can classify a
          column its own scanner missed entirely — each of those needs a named steward.
        </>
      ),
      duration: 6.8,
      fig: 'criticality, an exception, an untagged column — all need a named person.',
      Visual: S.RevealStewardship,
    },
    {
      title: 'Recap',
      body: (
        <>
          Domain ownership, a shared platform, central policy enforced by code. Reverse Conway's
          law: choose the team shape on purpose. A rule over an attribute runs itself; a judgement
          call keeps a named steward. Three gates, each naming the exact reason it bounced a table.
        </>
      ),
      duration: 7.2,
      fig: 'central policy, domain ownership, three gates, named stewards.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A new domain team wants to shorten its own table's retention window, staying fully
          inside the policy's own stated limits. Does that decision get decided by a rule, or does
          it still need a named person to sign off?
        </>
      ),
      duration: 7.2,
      fig: 'inside the policy’s own limit. a rule, or a named person?',
      predict: {
        options: [
          { label: "Still human — any retention change needs a steward's sign-off" },
          { label: "A rule over an attribute — inside the stated limit, the platform decides it", correct: true },
        ],
        explain: (
          <>
            What made the earlier retention case human was an exception past the policy's limit,
            which needs a legal reason. Staying inside the stated limit is exactly the kind of rule
            over an attribute the platform already enforces.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
