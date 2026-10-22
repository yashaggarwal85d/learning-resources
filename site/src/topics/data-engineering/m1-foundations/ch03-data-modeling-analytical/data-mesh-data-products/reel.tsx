import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This topic has no lab of its own (CHAPTER.md). Every claim traces to a direct quote from
// Dehghani's own writing. No literal digits appear anywhere in this reel.
const reel: Reel = {
  steps: [
    {
      title: "The shop's one central pipeline team, everywhere",
      body: (
        <>
          One central team now owns every pipeline across every domain. The team that
          understands orders least is the team that owns the orders pipeline. Still the right
          shape?
        </>
      ),
      duration: 4.8,
      fig: 'one central team, every domain — does it still own the pipeline it understands least?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: domain ownership, quoted directly',
      body: (
        <>
          Instead of flowing data into a centrally owned lake, each domain hosts and serves its
          own data, in an easily consumable way.
        </>
      ),
      duration: 4.8,
      fig: 'each domain hosts, serves its own data — not a centrally owned lake',
      Visual: S.RevealDomainOwnershipQuote,
    },
    {
      title: 'Predict: does owning your own data make it trustworthy to everyone else who needs it?',
      body: (
        <>
          Each domain now hosts its own data instead of handing it to a central team. Does that
          alone make the data trustworthy to whoever downstream actually needs it?
        </>
      ),
      duration: 2.8,
      fig: 'a domain hosting its own data — trustworthy to everyone else, just by owning it?',
      predict: {
        options: [
          { label: 'Yes — the domain understands its own data best' },
          { label: "No — trustworthiness is its own separate, explicit standard", correct: true },
        ],
        explain: (
          <>
            No. Ownership alone satisfies nothing about discoverability, a stable address,
            trustworthiness, or interoperability — those are a separate, explicit standard a
            domain still has to actually meet.
          </>
        ),
      },
      Visual: S.PredictOwnershipEqualsTrust,
    },
    {
      title: 'Reveal: data as a product, named and defined, quoted directly',
      body: (
        <>
          Domains have to treat their data the way they'd treat a real product — and the
          consumers of that data as customers, worth genuinely delighting.
        </>
      ),
      duration: 4.8,
      fig: 'domain data, treated as a product — its consumers treated as customers',
      Visual: S.RevealDataAsProductQuote,
    },
    {
      title: 'Reveal: the four data-product qualities, quoted directly',
      body: (
        <>
          Discoverable through a registry, addressable at a stable location, trustworthy
          through a stated quality guarantee, and inter-operable through shared standards.
        </>
      ),
      duration: 4.8,
      fig: 'discoverable, addressable, trustworthy, inter-operable — a checklist, not a slogan',
      takeaway: "Data as a product is a specific, named checklist a domain either meets or doesn't — not a slogan.",
      Visual: S.RevealFourQualitiesQuote,
    },
    {
      title: 'Predict: does handing every domain full data ownership cost nothing extra?',
      body: (
        <>
          Each domain was already running its own operational systems. Does giving it its own
          data pipeline too cost nothing extra, since the team is already there?
        </>
      ),
      duration: 2.8,
      fig: 'a domain, already operational — its own data pipeline too, free of extra cost?',
      predict: {
        options: [
          { label: "Yes — the team is already there, so there's no new cost" },
          { label: "No — specialized infrastructure skill still has to be duplicated in every domain", correct: true },
        ],
        explain: (
          <>
            No. Analytical data infrastructure needs a genuinely different, specialized skill
            than running operational services — and without something shared, every domain pays
            that specialized cost separately.
          </>
        ),
      },
      Visual: S.PredictOwnershipIsFree,
    },
    {
      title: 'Reveal: the real cost of ownership without a shared platform, quoted directly',
      body: (
        <>
          Distributing data ownership to every domain means duplicating the effort and the
          specialized skill needed to operate each one's own pipeline infrastructure.
        </>
      ),
      duration: 4.8,
      fig: "ownership, distributed — specialized effort, duplicated in every domain's own pipeline",
      takeaway: "Domain ownership alone multiplies infrastructure cost; it doesn't make that cost disappear.",
      Visual: S.RevealOwnershipCostQuote,
    },
    {
      title: 'Reveal: the four named principles together, quoted directly',
      body: (
        <>
          Domain ownership, data as a product, a self-serve platform, and federated
          computational governance — stated as collectively necessary and sufficient, together.
        </>
      ),
      duration: 4.8,
      fig: 'four named principles, together — collectively necessary and sufficient, Dehghani\'s own claim',
      Visual: S.RevealFourPrinciplesQuote,
    },
    {
      title: 'Predict: without a shared self-serve platform yet, does the mesh still work?',
      body: (
        <>
          A company adopts domain ownership and the data-as-a-product standard tomorrow, but has
          no shared self-serve platform in place yet. Does the mesh still work?
        </>
      ),
      duration: 2.8,
      fig: 'ownership, product standard adopted — platform still missing: does the mesh still work?',
      predict: {
        options: [
          { label: "Yes — the organizational principles are what actually matter" },
          { label: "No — without the platform, each domain pays the full specialized cost alone", correct: true },
        ],
        explain: (
          <>
            No. The self-serve platform exists specifically to remove the specialized
            infrastructure cost each domain would otherwise carry on its own — skip it, and
            every domain pays that cost separately, right away.
          </>
        ),
      },
      Visual: S.PredictMeshWithoutPlatform,
    },
    {
      title: "Reveal: the self-serve platform's own stated reason to exist, quoted directly",
      body: (
        <>
          The specialized skill needed to provision analytical data infrastructure is exactly
          what's hard to replicate in every domain — which is the platform's own entire reason
          to exist.
        </>
      ),
      duration: 4.8,
      fig: 'specialized infrastructure skill, hard to replicate per domain — the platform\'s own reason to exist',
      takeaway: "The platform isn't optional polish; skip it, and the other principles' real cost lands on every domain separately.",
      Visual: S.RevealSelfServePlatformQuote,
    },
    {
      title: 'Reveal: federated computational governance, quoted directly',
      body: (
        <>
          Domain-local autonomy, paired with a small set of global rules, enforced
          automatically by the platform rather than by a central team's manual sign-off.
        </>
      ),
      duration: 4.8,
      fig: 'domain-local autonomy, global rules — enforced by the platform, automatically',
      Visual: S.RevealFederatedGovernanceQuote,
    },
    {
      title: 'Recap',
      body: (
        <>
          Domain ownership reverses who hosts the data. Data as a product is a specific
          checklist, not a slogan. None of this is free without a shared self-serve platform.
          Federated governance keeps the result interoperable, not fragmented.
        </>
      ),
      duration: 4.8,
      fig: 'ownership reversed; a real checklist; a shared platform; governance that keeps it together',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A company rolls out domain ownership and the data-as-a-product standard across every
          team this quarter, with the shared self-serve platform still many months from ready.
        </>
      ),
      duration: 2.8,
      fig: 'ownership and the standard, rolled out now — the shared platform, still far from ready',
      predict: {
        options: [
          { label: 'The mesh works fine — the platform can catch up later, no real cost in the meantime' },
          { label: "Every domain pays the full specialized infrastructure cost alone, right now", correct: true },
        ],
        explain: (
          <>
            Every domain pays that cost alone, right now. The platform isn't a later convenience
            — it's the piece that was supposed to absorb exactly this cost, and until it
            exists, each domain carries it by itself.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
