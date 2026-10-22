import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This topic has no lab of its own (CHAPTER.md). Every claim traces to a direct quote: the
// term's own originating vendor (Databricks) for each layer's contract, and an independent
// critique for the failure modes. No literal digits appear anywhere in this reel.
const reel: Reel = {
  steps: [
    {
      title: "The shop's own pipeline, three stops or fewer?",
      body: (
        <>
          Raw orders land, get cleaned into a shared view, then get turned into a sales
          dashboard. Does that really need to be three separate layers, or could it be fewer?
        </>
      ),
      duration: 4.8,
      fig: 'raw orders, a shared view, a dashboard — three layers, or fewer?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: medallion architecture itself, quoted directly',
      body: (
        <>
          A pattern that organizes data into Bronze, Silver, and Gold layers, progressively
          improving quality and structure as data moves through each one.
        </>
      ),
      duration: 4.8,
      fig: 'Bronze, Silver, Gold — quality and structure improving, layer by layer',
      Visual: S.RevealMedallionQuote,
    },
    {
      title: 'Predict: does naming a layer "Silver" automatically give it a quality contract?',
      body: (
        <>
          Calling a layer "Silver" sounds like it already promises something about its quality.
          Does the name itself do that work?
        </>
      ),
      duration: 2.8,
      fig: 'a layer named "Silver" — does the name alone set the contract?',
      predict: {
        options: [
          { label: 'Yes — the name itself is the contract' },
          { label: 'No — the contract has to be stated and actually honored', correct: true },
        ],
        explain: (
          <>
            No. A name is just a label; the contract is the specific, stated behavior a team
            has to actually build and maintain, which has to be named on its own.
          </>
        ),
      },
      Visual: S.PredictNameIsContract,
    },
    {
      title: 'Reveal: the Bronze contract, quoted directly',
      body: (
        <>
          Land the data exactly as the source system structured it, plus load metadata — built
          for audit and lineage, nothing refined yet.
        </>
      ),
      duration: 4.8,
      fig: 'raw, as-is, load metadata attached — audit and lineage, nothing more',
      Visual: S.RevealBronzeQuote,
    },
    {
      title: 'Reveal: the Silver contract, quoted directly',
      body: (
        <>
          Conform and cleanse "just enough" to give an enterprise view of the key business
          entities — not yet shaped for any one project.
        </>
      ),
      duration: 4.8,
      fig: '"just-enough" cleansed, an enterprise view — not yet project-specific',
      Visual: S.RevealSilverQuote,
    },
    {
      title: 'Reveal: the Gold contract, quoted directly',
      body: (
        <>
          Consumption-ready, denormalized, and shaped around one specific project's own
          reporting needs — the final layer.
        </>
      ),
      duration: 4.8,
      fig: 'consumption-ready, denormalized, project-specific — built for reporting',
      Visual: S.RevealGoldQuote,
    },
    {
      title: 'Predict: does forcing every pipeline through all three stages always improve its data?',
      body: (
        <>
          Three layers of refinement sounds like it can only help. Does running every pipeline
          through all three stages always leave the data better off?
        </>
      ),
      duration: 2.8,
      fig: 'every pipeline, all three stages — always strictly better?',
      predict: {
        options: [
          { label: 'Yes — more layers of refinement is always better' },
          { label: "No — a pipeline that doesn't need all three pays a real cost anyway", correct: true },
        ],
        explain: (
          <>
            No. Not every pipeline's data genuinely needs three transformation stages, and
            running it through them anyway pays a real cost with no matching benefit.
          </>
        ),
      },
      Visual: S.PredictMoreLayersBetter,
    },
    {
      title: "Reveal: layer sprawl's cost, quoted directly",
      body: (
        <>
          Forcing data through stages it doesn't need causes unnecessary processing, showing up
          as added latency before the data is usable, and added cost from storing it copied
          across every layer.
        </>
      ),
      duration: 4.8,
      fig: "stages it doesn't need — added latency, added storage cost, no matching benefit",
      takeaway: "A layer's cost is real whether or not that layer's own contract was ever actually needed.",
      Visual: S.RevealLayerSprawlQuote,
    },
    {
      title: "Predict: whose job is it to fix a data-quality bug that surfaces in the Gold layer?",
      body: (
        <>
          A bug shows up in a Gold-layer report. It was discovered there. Is fixing it obviously
          that Gold team's own responsibility?
        </>
      ),
      duration: 2.8,
      fig: 'a bug found in Gold — obviously Gold\'s own job to fix?',
      predict: {
        options: [
          { label: "Yes — it's obviously the Gold team's job, since that's where it showed up" },
          { label: 'It depends, and that uncertainty is exactly the problem', correct: true },
        ],
        explain: (
          <>
            It depends — and that's the real issue. Different teams transform the data at
            different stages, so where a bug is found and who actually owns fixing it are
            routinely two different teams.
          </>
        ),
      },
      Visual: S.PredictWhoOwnsTheBug,
    },
    {
      title: 'Reveal: fragmented silver-layer accountability, quoted directly',
      body: (
        <>
          Transformations applied at different stages by different teams mean accountability
          for data quality becomes genuinely fragmented — correctness ends up with no single
          clear owner.
        </>
      ),
      duration: 4.8,
      fig: 'different teams, different stages — accountability fragmented, no clear owner',
      takeaway: 'A layer without a clear owner is a liability no matter how good its stated contract looks on paper.',
      Visual: S.RevealFragmentedAccountabilityQuote,
    },
    {
      title: 'Reveal: the Silver bottleneck, quoted directly',
      body: (
        <>
          Silver specifically takes the brunt of this: downstream teams pull from aggregates
          built without their own input, which is exactly what turns that one layer into a
          named bottleneck.
        </>
      ),
      duration: 4.8,
      fig: 'downstream teams pulling from aggregates built without their input — a named bottleneck',
      takeaway: 'Silver becomes a bottleneck specifically because it serves consumers it was never built with, not despite it.',
      Visual: S.RevealSilverBottleneckQuote,
    },
    {
      title: 'Recap',
      body: (
        <>
          Each layer's name means nothing without a stated, honored contract behind it. Forcing
          every pipeline through all three stages pays a real cost even when unneeded. Silver
          specifically bears the brunt of fragmented ownership, becoming a named bottleneck.
        </>
      ),
      duration: 4.8,
      fig: 'a contract behind every name; unneeded stages still cost; Silver bears the brunt',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A small pipeline: one source, one consumer, nobody else sharing any of its data. Does
          it genuinely need all three medallion layers, or should it be reshaped?
        </>
      ),
      duration: 2.8,
      fig: 'one source, one consumer, nothing shared — still three layers?',
      predict: {
        options: [
          { label: 'Yes — every pipeline should keep all three layers, for consistency' },
          { label: "No — reshape or collapse the layers this pipeline doesn't actually need", correct: true },
        ],
        explain: (
          <>
            No. The convention exists to serve multiple consumers and progressively widen
            reuse — a pipeline with exactly one source and one consumer has no one else to
            serve, so the layers it doesn't need should be collapsed, not kept out of habit.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
