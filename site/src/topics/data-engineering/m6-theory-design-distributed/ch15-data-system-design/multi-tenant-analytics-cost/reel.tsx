import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The isolation-cost comparison, the noisy-neighbour simulation, the
// fairness-rule allocations, the coupled erasure cost, and the
// metering-and-remainder attribution are asserted in examples.py's own
// isolation_total_cost(), neighbour_latency(), fairness_allocation(),
// erasure_cost() and attribute_cost(). The Snowflake and BigQuery
// claims trace to their own docs, quoted in SOURCES.md and checked
// step by step in FACT-CHECK.md. No literal digits appear below.
const reel: Reel = {
  steps: [
    {
      title: "Hook: one seller slows every dashboard",
      body: (
        <>
          Thousands of sellers share one warehouse. One seller's nightly report scans the whole
          fact table, and every other seller's dashboard slows to a crawl. At month end, finance
          asks what each seller costs, and the answer is "the warehouse is mostly idle, we have
          no per-seller number."
        </>
      ),
      duration: 5.0,
      fig: "one lane spiking, every other lane slowing, a bill with no names on it",
      Visual: S.Hook,
    },
    {
      title: "Predict: which two controls would have prevented this?",
      body: (
        <>
          Which two controls, designed in from the start, would have stopped the slowdown and
          actually produced the number finance asked for?
        </>
      ),
      duration: 4.6,
      predict: {
        options: [
          { label: "a bigger warehouse, since more compute fixes slow queries" },
          {
            label: "a per-tenant limit on heavy queries, and a metering view that attributes cost per query",
            correct: true,
          },
        ],
        explain: (
          <>
            A bigger warehouse still lets one tenant consume the whole thing, and still produces
            no per-tenant number. A limit stops the slowdown; a metering view answers finance's
            actual question.
          </>
        ),
      },
      fig: "a bigger box fixes nothing; the real fixes are a limit and a meter",
      Visual: S.Predict1,
    },
    {
      title: "Reveal: the isolation spectrum, priced",
      body: (
        <>
          Shared tables with row-level security: cheapest, weakest blast-radius containment. A
          schema or catalog per tenant: a middle ground. An account or project per tenant:
          strongest, most expensive. Each priced for a small and a large tenant count.
        </>
      ),
      duration: 5.0,
      fig: "a three-rung ladder, each rung gaining a cost bar and a blast-radius bar",
      Visual: S.RevealIsolationLadder,
    },
    {
      title: "Reveal: what forces a tenant up the spectrum",
      body: (
        <>
          A regulated tenant and a noisy tenant each get pushed up one rung from the cheapest
          default — one named constraint per push, not a blanket upgrade for everyone.
        </>
      ),
      duration: 4.8,
      takeaway: "The isolation spectrum trades cost against blast radius; nothing on it is free, including the cheapest rung.",
      fig: "two tenants pushed up one rung each, the forcing constraint named beside them",
      Visual: S.RevealForcedUp,
    },
    {
      title: "Reveal: noisy-neighbour control, simulated",
      body: (
        <>
          One tenant's lane spikes to many times its normal load. Without a control, every
          neighbour's latency climbs with it. With a quota and a fairness rule in place, the
          neighbours stay flat.
        </>
      ),
      duration: 4.8,
      fig: "neighbour latency bars climbing without a control, flat with one",
      Visual: S.RevealNoisySimulated,
    },
    {
      title: "Reveal: fairness is the actual design question",
      body: (
        <>
          The same spike, split three ways: an equal share starves a large legitimate tenant, a
          weighted share favours whoever pays more, and burst-with-credit lets a short spike
          through but caps a sustained one.
        </>
      ),
      duration: 5.0,
      takeaway: "A quota without a fairness rule just moves who gets starved; the fairness rule is the real design choice.",
      fig: "the same spike allocated three different ways, side by side",
      Visual: S.RevealFairnessRules,
    },
    {
      title: "Reveal: retention and erasure, coupled to isolation",
      body: (
        <>
          A tenant stored under its own schema or key erases cheaply: one drop, one key deleted.
          The same tenant in a shared table needs a scan and rewrite — the erasure cost was
          already decided back at the isolation choice.
        </>
      ),
      duration: 4.8,
      fig: "a schema-isolated tenant erasing with one drop, a shared tenant needing a rewrite",
      Visual: S.RevealErasureCoupled,
    },
    {
      title: "Reveal: metering, allocation and the remainder",
      body: (
        <>
          A bill splits into per-tenant slices from the engine's own metering view, plus a grey
          "idle and shared" remainder the slices don't cover. Three policy cards decide what
          happens to it: charge it proportionally, charge it flat, or absorb it.
        </>
      ),
      duration: 5.0,
      takeaway: "The unattributable remainder is a policy decision stated up front, not a rounding error left unexplained.",
      fig: "a bill split into named slices plus a grey remainder with three policy cards under it",
      Visual: S.RevealRemainderPolicy,
    },
    {
      title: "Recap",
      body: (
        <>
          A priced isolation ladder. A fairness rule that decides who gets starved. An erasure
          cost already paid for by the isolation choice. And a metered bill, honest about its
          own remainder.
        </>
      ),
      duration: 4.8,
      fig: "the ladder, the fairness comparison, the coupled erasure, and the metered split",
      Visual: S.Recap,
    },
    {
      title: "Prove it: ten times the tenants",
      body: (
        <>
          The marketplace grows to ten times its tenant count. The cheapest rung's per-tenant
          cost barely moves — but the metering view's own overhead starts showing up as a real
          line on the bill. What's the next bottleneck?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          { label: "move every tenant up a rung preemptively, since more tenants means more risk" },
          {
            label: "watch the metering overhead itself as the next bottleneck, and widen its granularity before it outgrows what it measures",
            correct: true,
          },
        ],
        explain: (
          <>
            The rung choice was driven by a named constraint, not by tenant count, so moving
            everyone up multiplies cost for tenants that triggered no constraint. A metering view
            has its own real cost, and that cost scales with query count — it can become the next
            thing the design has to watch.
          </>
        ),
      },
      fig: "tenant count grows tenfold; the meter's own overhead becomes the thing to watch",
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
