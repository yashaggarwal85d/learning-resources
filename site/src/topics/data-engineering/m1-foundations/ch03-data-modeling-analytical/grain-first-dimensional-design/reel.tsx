import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured on this sandbox: a real order-line fact table (atomic grain) vs. an order-header table
// (coarser grain), a real semi-additive balance series, and a real non-additive margin calculation
// (SOURCES.md, examples.py). Every number here is spelled in words; the underlying measured values
// are recorded as exact constants in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Same order, two grains, one question',
      body: (
        <>
          One table holds a single row for the whole order. The other holds one row per line.
          "Which product sold the most this quarter" is a question only one of them can even answer.
        </>
      ),
      duration: 4.8,
      fig: 'one row per order. one row per order line. one question, two outcomes.',
      Visual: S.Hook,
    },
    {
      title: "Reveal: Kimball's four steps, quoted directly",
      body: (
        <>
          Select the business process. Declare the grain. Identify the dimensions. Identify the
          facts. In that exact order, each step binding on the one after it.
        </>
      ),
      duration: 4.8,
      fig: 'process, then grain, then dimensions, then facts',
      Visual: S.RevealFourSteps,
    },
    {
      title: 'Reveal: grain is the pivotal step, quoted directly',
      body: (
        <>
          The grain establishes exactly what a single fact row represents. Once declared, it becomes
          a binding contract on everything the design does afterward.
        </>
      ),
      duration: 4.8,
      fig: 'grain: what one row represents. declared once, binding after.',
      Visual: S.RevealGrainIsBinding,
    },
    {
      title: 'Predict: one row per order, or one row per line?',
      body: (
        <>
          The order-line business process needs a fact table. Should its grain be one row per
          order, or one row per individual order line?
        </>
      ),
      duration: 2.8,
      fig: 'order-line business process — one row per order, or per line?',
      predict: {
        options: [
          { label: 'One row per order — simpler, and orders are the natural unit' },
          { label: 'One row per order line — the most atomic grain available', correct: true },
        ],
        explain: (
          <>
            One row per order line. The order itself is not the most atomic thing this business
            process actually produces; the individual line is.
          </>
        ),
      },
      Visual: S.PredictGrainChoice,
    },
    {
      title: 'Reveal: atomic grain, measured',
      body: (
        <>
          Built for real, at one row per line: summing the line totals reproduces the order's own
          total exactly, whether grouped by region or rolled straight back up to the order.
        </>
      ),
      duration: 4.8,
      fig: 'line totals summed → the order total, exactly, either way',
      takeaway: 'The most atomic grain available still rolls up correctly; a coarser one cannot roll back down.',
      Visual: S.RevealAtomicGrain,
    },
    {
      title: 'Reveal: what the coarser grain loses',
      body: (
        <>
          A table built at one row per order simply has no product, quantity or line column to ask
          a line-level question with — not harder to query, structurally unable to answer it at all.
        </>
      ),
      duration: 4.8,
      fig: 'order-level table: no line columns exist, at all',
      Visual: S.RevealCoarseGrainLoses,
    },
    {
      title: 'Reveal: additive measures, proven',
      body: (
        <>
          The line total sums correctly no matter which dimension groups it — by region, or rolled
          back to the order — measured directly, not merely declared additive by assumption.
        </>
      ),
      duration: 4.8,
      fig: 'line total: correct, summed by any dimension, measured',
      Visual: S.RevealAdditiveMeasure,
    },
    {
      title: 'Predict: does a balance sum the same way across time?',
      body: (
        <>
          An account balance sums correctly across accounts. Does it sum the same way across
          quarters of the same account?
        </>
      ),
      duration: 2.8,
      fig: 'a balance sums across accounts — across time too?',
      predict: {
        options: [
          { label: 'Yes — a balance is a balance, however you group it' },
          { label: 'No — summing balances across time gives a meaningless number', correct: true },
        ],
        explain: (
          <>
            No. The year-end balance is simply the last quarter's own value, not the sum of all four
            quarters' balances.
          </>
        ),
      },
      Visual: S.PredictBalanceAcrossTime,
    },
    {
      title: 'Reveal: semi-additive, measured',
      body: (
        <>
          Summing four quarterly balances gives a number with no meaning at all. The correct
          year-end figure is just the fourth quarter's own balance, measured directly.
        </>
      ),
      duration: 4.8,
      fig: 'four balances, summed: meaningless. the last one alone: correct.',
      takeaway: 'A semi-additive measure sums correctly across every dimension except time.',
      Visual: S.RevealSemiAdditive,
    },
    {
      title: 'Reveal: non-additive, measured',
      body: (
        <>
          A profit margin, averaged naively across two regions, lands on a different number than
          recomputing it from the two regions' summed revenue and cost.
        </>
      ),
      duration: 4.8,
      fig: 'margin, naively averaged: one number. recomputed from sums: a different one.',
      Visual: S.RevealNonAdditive,
    },
    {
      title: 'Reveal: the fix, quoted directly',
      body: (
        <>
          Store the fully additive components — revenue, cost — sum those first, and only then
          compute the final ratio, often in the BI layer itself.
        </>
      ),
      duration: 4.8,
      fig: 'sum the components first. compute the ratio last.',
      takeaway: "A non-additive measure's components sum fine; the ratio itself never does.",
      Visual: S.RevealNonAdditiveFix,
    },
    {
      title: 'Recap',
      body: (
        <>
          Business process, grain, dimensions, facts — grain declared first, binding after. Additive
          measures sum anywhere; semi-additive sums everywhere but time; non-additive measures don't
          sum at all, only their components do.
        </>
      ),
      duration: 4.8,
      fig: 'grain first, binding. additive, semi-additive, non-additive, measured.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A new measure is a shipping-cost-per-unit ratio. Is it safe to sum it directly across
          orders, or does it need the same component-based fix as the profit margin?
        </>
      ),
      duration: 2.8,
      fig: 'a cost-per-unit ratio — sum it directly, or fix it first?',
      predict: {
        options: [
          { label: 'Sum it directly — it is still just a number per order' },
          { label: 'Sum shipping cost and units separately, then divide', correct: true },
        ],
        explain: (
          <>
            Sum the components. A per-unit ratio is non-additive for exactly the same reason a
            profit margin is — summing the ratio itself throws away the information the ratio needs.
          </>
        ),
      },
      Visual: S.ProveShippingRatio,
    },
  ],
};

export default reel;
