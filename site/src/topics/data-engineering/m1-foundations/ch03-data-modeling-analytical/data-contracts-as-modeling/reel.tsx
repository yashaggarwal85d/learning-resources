import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This topic has no lab of its own (CHAPTER.md). Every sourced claim traces to a direct quote
// from the Open Data Contract Standard's own specification. One claim (producer-boundary
// enforcement) is this topic's own reasoned argument, flagged in FACT-CHECK.md. No literal
// digits appear anywhere in this reel.
const reel: Reel = {
  steps: [
    {
      title: "The shop's schema that changed overnight",
      body: (
        <>
          A domain's schema changed overnight, no warning given. A downstream dashboard broke
          silently. What was actually missing wasn't a schema — it was a contract.
        </>
      ),
      duration: 4.8,
      fig: 'a schema, changed overnight — a dashboard, broken silently: a missing contract',
      Visual: S.Hook,
    },
    {
      title: "Reveal: the contract's own format, quoted directly",
      body: (
        <>
          A structured document of keys and values under an actual open standard, not a wiki
          page or a verbal promise between teams.
        </>
      ),
      duration: 4.8,
      fig: 'keys and values, under an open standard — not a wiki page, not a promise',
      Visual: S.RevealContractFormatQuote,
    },
    {
      title: "Predict: does a contract have to pick between a dataset's business meaning and its physical layout?",
      body: (
        <>
          One document could describe what the data means to the business. A different document
          could describe its actual physical layout. Does a contract have to pick one?
        </>
      ),
      duration: 2.8,
      fig: 'business meaning, physical layout — does a contract have to pick just one?',
      predict: {
        options: [
          { label: 'Yes — those serve different audiences, so they need separate documents' },
          { label: 'No — the standard ties both together in one schema', correct: true },
        ],
        explain: (
          <>
            No. The standard's own schema explicitly carries both at once — a field's business
            meaning sits right alongside its physical type, in the same artifact.
          </>
        ),
      },
      Visual: S.PredictMustPickOne,
    },
    {
      title: 'Reveal: schema as both business and physical, quoted directly',
      body: (
        <>
          Schema supports both a business representation of the data and a physical
          implementation, tying the two together — one field's business name, right alongside
          its actual type.
        </>
      ),
      duration: 4.8,
      fig: "business representation, physical implementation — tied together, one field's own name",
      Visual: S.RevealSchemaBothQuote,
    },
    {
      title: 'Reveal: quality rules tied to schema, quoted directly',
      body: (
        <>
          Quality rules get their own named section, tightly linked to the schema they actually
          check — not a separate, disconnected concern.
        </>
      ),
      duration: 4.8,
      fig: 'quality rules, tightly linked to the schema — not floating free, disconnected',
      takeaway: "A contract's quality rules only mean something because they're pinned to a specific schema field.",
      Visual: S.RevealQualityTiedQuote,
    },
    {
      title: 'Predict: is a check that runs after data lands downstream still real enforcement?',
      body: (
        <>
          A quality check runs only after data has already landed in a downstream warehouse.
          Is that late enough to still count as real enforcement?
        </>
      ),
      duration: 2.8,
      fig: 'a check, run only downstream — late enough to still count as enforcement?',
      predict: {
        options: [
          { label: 'Yes — catching it anywhere before a human sees a report is enforcement' },
          { label: "No — every consumer in between already saw the bad data first", correct: true },
        ],
        explain: (
          <>
            No. By the time that check runs, every consumer sitting between the producer and
            that check has already seen the bad data — that's detection after the fact, not
            prevention.
          </>
        ),
      },
      Visual: S.PredictDownstreamEnoughCheck,
    },
    {
      title: "Reveal: enforcement belongs at the producer boundary",
      body: (
        <>
          Stopping bad data has to happen at the exact point a producer emits it, before any
          consumer downstream ever gets a chance to see it at all.
        </>
      ),
      duration: 4.8,
      fig: "the point data is emitted — stopped there, before any consumer ever sees it",
      takeaway: 'Where a check actually runs changes what it protects: downstream catches it late, the producer boundary prevents it.',
      Visual: S.RevealProducerBoundaryQuote,
    },
    {
      title: 'Reveal: SLAs as enumerated, checkable fields, quoted directly',
      body: (
        <>
          Service-level agreements get their own named section too, with a required, structured
          value drawn from a standard list — availability, latency, retention, and more.
        </>
      ),
      duration: 4.8,
      fig: 'SLAs, a named section — a required, structured value, not loose prose',
      Visual: S.RevealSlaQuote,
    },
    {
      title: 'Predict: does a contract leave ownership implicit, assumed from whoever wrote the pipeline?',
      body: (
        <>
          Nobody wrote down who owns this dataset. Is that fine, since whoever built the
          pipeline is obviously assumed to own it anyway?
        </>
      ),
      duration: 2.8,
      fig: "ownership, unwritten — fine, since the pipeline's builder is obviously assumed to own it?",
      predict: {
        options: [
          { label: "Yes — whoever built the pipeline is the obvious, assumed owner" },
          { label: 'No — ownership is a named role the contract has to actually state', correct: true },
        ],
        explain: (
          <>
            No. The standard's own worked example names "Owner" as an explicit role in the
            contract's team structure — an assumed owner is an owner nobody can point to once
            the original builder moves on.
          </>
        ),
      },
      Visual: S.PredictOwnershipImplicit,
    },
    {
      title: 'Reveal: ownership as a named role, quoted directly',
      body: (
        <>
          Team membership and its history get tracked directly in the contract, with "Owner"
          appearing as an explicit, named role in the standard's own example.
        </>
      ),
      duration: 4.8,
      fig: 'team, tracked in the contract — "Owner" named explicitly, in the standard\'s own example',
      takeaway: "Ownership that isn't written into the contract is ownership nobody can actually point to later.",
      Visual: S.RevealOwnershipRoleQuote,
    },
    {
      title: "Reveal: the version this topic is teaching against, quoted directly",
      body: (
        <>
          The specification's own current default version has already moved past the one named
          earlier in this chapter — the standard keeps evolving underneath it.
        </>
      ),
      duration: 4.8,
      fig: "the spec's own current version — already past the one named earlier; it keeps evolving",
      Visual: S.RevealVersionQuote,
    },
    {
      title: 'Recap',
      body: (
        <>
          A contract is a structured document, not a promise. Its schema carries business
          meaning and physical layout together. Quality rules and SLAs are named, checkable
          fields pinned to that schema. Ownership is a role the contract names explicitly.
        </>
      ),
      duration: 4.8,
      fig: 'a structured document; schema tying meaning to layout; named fields; ownership, explicit',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A producer ships a schema change with no updated contract and no new quality rule for
          the changed field. Who catches that, and where does the catch actually have to happen?
        </>
      ),
      duration: 2.8,
      fig: 'a schema change, no updated contract — who catches it, and where does that happen?',
      predict: {
        options: [
          { label: "Whoever downstream notices the dashboard looks wrong, whenever that happens" },
          { label: "The producer's own contract check, at the point the change is about to be emitted", correct: true },
        ],
        explain: (
          <>
            The producer's own contract check, at the point the change is about to be emitted —
            waiting for a downstream consumer to notice means every consumer in between has
            already been exposed to the unreviewed change.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
