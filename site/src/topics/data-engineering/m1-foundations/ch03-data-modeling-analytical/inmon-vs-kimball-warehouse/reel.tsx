import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// No runnable system for this topic — a methodology comparison, not a measured demonstration.
// Every claim traces to Inmon's, Kimball's, or Wikipedia's own text (SOURCES.md); the three-axis
// synthesis and the ELT-narrows-the-gap claim are this topic's own reasoning, marked as such in
// FACT-CHECK.md.
const reel: Reel = {
  steps: [
    {
      title: 'Same key types, two different warehouses',
      body: (
        <>
          Two architects, two ways of organizing a whole warehouse around the tables this chapter has
          spent building. Neither one is simply right — each wins on a different axis.
        </>
      ),
      duration: 4.8,
      fig: 'one normalized model, built first. one bus of stars, built incrementally.',
      Visual: S.Hook,
    },
    {
      title: "Reveal: Inmon's definition, and his direction",
      body: (
        <>
          The accepted definition of a data warehouse itself is Inmon's own. His approach builds the
          normalized enterprise model first, and feeds every mart from it afterward — top-down.
        </>
      ),
      duration: 4.8,
      fig: 'Inmon: normalized enterprise model first, marts fed from it',
      Visual: S.RevealInmonDefinition,
    },
    {
      title: "Reveal: Kimball's bus, and his direction",
      body: (
        <>
          Kimball's own bus architecture decomposes planning by business process, delivering
          integration through conformed dimensions reused across every one — bottom-up, the opposite
          direction from Inmon's.
        </>
      ),
      duration: 4.8,
      fig: 'Kimball: one process at a time, conformed dimensions reused',
      Visual: S.RevealKimballBus,
    },
    {
      title: 'Predict: one deadline, one source system',
      body: (
        <>
          A team has an urgent deadline and a single source system to model. Which architecture gets
          them to something usable fastest?
        </>
      ),
      duration: 2.8,
      fig: 'urgent deadline, one source — which gets there first?',
      predict: {
        options: [
          { label: "Inmon's normalized model, built first" },
          { label: "Kimball's bus, one process at a time", correct: true },
        ],
        explain: (
          <>
            Kimball's bus: one star schema for one process, live quickly. Building the full normalized
            model first is the slower path exactly when the deadline is the binding constraint.
          </>
        ),
      },
      Visual: S.PredictDeadline,
    },
    {
      title: 'Reveal: time to value favors the bus',
      body: (
        <>
          A single process, a single star schema, delivered — while the normalized model is still
          being designed. Time to value is the axis Kimball's incremental approach was built to win.
        </>
      ),
      duration: 4.8,
      fig: 'one star schema, live — the normalized model still mid-design',
      takeaway: 'Time to value favors an incremental, process-first build over a model built whole, upfront.',
      Visual: S.RevealTimeToValue,
    },
    {
      title: 'Predict: a dozen sources, one definition of customer',
      body: (
        <>
          A dozen source systems all need to agree on what "customer" means. Which architecture
          handles that kind of integration better?
        </>
      ),
      duration: 2.8,
      fig: 'a dozen sources, one shared definition of customer — which wins?',
      predict: {
        options: [
          { label: "Kimball's bus, via conformed dimensions alone" },
          { label: "Inmon's single normalized model", correct: true },
        ],
        explain: (
          <>
            Inmon's model: one integration point built once, instead of re-litigating "customer" in
            every mart. Conformed dimensions do real integration work too, but this is what the
            normalized model was built for.
          </>
        ),
      },
      Visual: S.PredictIntegration,
    },
    {
      title: 'Reveal: integration cost favors the normalized model',
      body: (
        <>
          One normalized model is one place to settle what "customer" means, instead of settling it
          separately in every star schema that touches a customer.
        </>
      ),
      duration: 4.8,
      fig: 'one model, one definition — vs. settling it mart by mart',
      takeaway: 'Integration cost favors a single normalized model when many source systems must agree.',
      Visual: S.RevealIntegrationCost,
    },
    {
      title: 'Predict: a business rule that keeps changing',
      body: (
        <>
          The business's own definition of a core entity changes often and unpredictably. Which
          architecture tolerates that better?
        </>
      ),
      duration: 2.8,
      fig: 'a rule that keeps changing — which architecture takes it better?',
      predict: {
        options: [
          { label: 'One of them, cleanly' },
          { label: "It genuinely depends on what kind of change", correct: true },
        ],
        explain: (
          <>
            Both have a real claim: the bus absorbs a new process without touching the rest; the
            normalized model absorbs a changed rule in one place instead of many marts. Neither wins
            cleanly here.
          </>
        ),
      },
      Visual: S.PredictChangeTolerance,
    },
    {
      title: 'Reveal: tolerance to change is genuinely contested',
      body: (
        <>
          A new process slots into the bus without touching existing stars. A changed business rule
          is fixed once in the normalized model instead of separately in every mart. Both are real
          advantages, pointed at different kinds of change.
        </>
      ),
      duration: 4.8,
      fig: 'new process: bus wins. changed rule: normalized model wins.',
      Visual: S.RevealChangeContested,
    },
    {
      title: 'Reveal: the three axes, side by side',
      body: (
        <>
          Time to value, integration cost, tolerance to change: the same three scenarios against both
          architectures, and the verdict differs by scenario — not by which methodology is simply
          better.
        </>
      ),
      duration: 4.8,
      fig: 'three axes, two architectures, three different verdicts',
      Visual: S.RevealThreeAxes,
    },
    {
      title: 'Reveal: what ELT on a columnar engine changed',
      body: (
        <>
          Cloud columnar warehouses drove storage cost down and processing power up, making it far
          cheaper to load data raw and transform it afterward, rather than before loading it at all.
        </>
      ),
      duration: 4.8,
      fig: 'storage cheaper, compute faster — transform after load, not before',
      Visual: S.RevealELTShift,
    },
    {
      title: 'Reveal: how that narrows the original gap',
      body: (
        <>
          The original argument assumed transforming before load was expensive and had to be planned
          around upfront. Cheap, fast, repeatable transforms after load let a team start with
          Kimball's incremental marts and fold in Inmon-style integration later, without committing to
          either direction first.
        </>
      ),
      duration: 4.8,
      fig: 'start incremental, fold in integration later — no upfront either-or',
      takeaway: "ELT on a columnar engine narrowed the original tradeoff; it didn't erase it.",
      Visual: S.RevealGapNarrowed,
    },
    {
      title: 'Recap',
      body: (
        <>
          Two reference architectures, two directions — top-down and bottom-up. The real choice runs
          against three separate axes, not one verdict. ELT on a columnar engine narrowed that
          tradeoff; it did not erase it.
        </>
      ),
      duration: 4.8,
      fig: 'top-down vs. bottom-up. three axes. narrowed, not erased.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team must onboard a new source system on a recurring, short cycle, with no enterprise
          model agreed yet. Which architecture's own strength actually fits that scenario?
        </>
      ),
      duration: 2.8,
      fig: 'a new source every cycle, no agreed model yet — which fits?',
      predict: {
        options: [
          { label: "Kimball's bus — incremental, one process at a time", correct: true },
          { label: "Inmon's model — built whole before anything ships" },
        ],
        explain: (
          <>
            Kimball's bus: built specifically to add one process at a time, without waiting on an
            enterprise model nobody has agreed to yet.
          </>
        ),
      },
      Visual: S.ProveBusChoice,
    },
  ],
};

export default reel;
