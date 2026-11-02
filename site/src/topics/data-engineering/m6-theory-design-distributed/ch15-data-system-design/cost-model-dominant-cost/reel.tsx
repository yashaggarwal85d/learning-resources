import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The cost-waterfall and lever simulations are asserted in examples.py's own cost_waterfall(),
// apply_pruning_layout_lever() and lever_with_second_order_cost(). The scan-volume billing and
// storage cost-component claims trace to BigQuery's and Amazon S3's own pricing pages, quoted
// verbatim in SOURCES.md and checked step by step in FACT-CHECK.md. No literal digits appear
// below; the duration numbers are exempt.
const reel: Reel = {
  steps: [
    {
      title: "Hook: a month of tuning against one query's real share",
      body: (
        <>
          The shop's analytics bill doubles in a quarter while orders only grow by a fifth. The
          team spends a month tuning cluster sizes and saves little. One query, scanning the
          whole events table every few minutes for a dashboard nobody has looked at since launch,
          turns out to be most of the bill.
        </>
      ),
      duration: 4.8,
      fig: "a month of tuning effort next to one query's actual share of the bill",
      Visual: S.Hook,
    },
    {
      title: 'Predict: which cost class does the waterfall actually show dominating?',
      body: (
        <>
          The team's month went into tuning cluster sizes. The bill's own biggest line is
          something else entirely. Which one is it?
        </>
      ),
      duration: 4.2,
      predict: {
        options: [
          { label: "compute, since the team spent a month tuning cluster sizes" },
          {
            label: 'requests — one query scanning the whole table repeatedly, billed per byte read',
            correct: true,
          },
        ],
        explain: (
          <>
            Effort spent isn't evidence of where a bill's cost actually sits. One unwatched query
            scanning an entire table on every run turns into a scan-volume charge that dwarfs
            whatever cluster tuning could ever save — the month went into the wrong class
            entirely.
          </>
        ),
      },
      fig: 'which of these does the waterfall actually show dominating?',
      Visual: S.Predict1,
    },
    {
      title: 'Reveal: five cost classes, priced per unit of business',
      body: (
        <>
          Compute, storage, egress, requests and licence — each re-expressed per thousand orders
          so designs and scales become comparable, each priced from a dated provider page, never
          hard-coded.
        </>
      ),
      duration: 5.0,
      fig: 'five bars rising side by side, each labeled with its per-unit price',
      Visual: S.RevealFiveClasses,
    },
    {
      title: 'Reveal: the waterfall finds the one term that dominates',
      body: (
        <>
          Re-sorted by share of the bill, the five classes rarely come out even. One bar — here,
          the query's own scan volume — towers over the rest, and that's the only one worth
          attacking first.
        </>
      ),
      duration: 4.6,
      takeaway: 'A bill is usually dominated by one term, and optimizing the others first is wasted effort.',
      fig: 'the five bars re-sorted into a waterfall; one bar towers over the rest',
      Visual: S.RevealWaterfall,
    },
    {
      title: 'Reveal: three recurring dominators',
      body: (
        <>
          Scan volume, cross-AZ traffic, and idle compute are the three shapes a dominating bar
          usually takes. Naming which shape it is, is the actual diagnostic step — a bill rarely
          needs five separate fixes, it needs one.
        </>
      ),
      duration: 4.8,
      fig: 'scan volume, cross-AZ traffic, and idle compute named as the three recurring shapes',
      Visual: S.RevealThreeDominators,
    },
    {
      title: 'Reveal: a lever, and its measured ratio',
      body: (
        <>
          A layout-and-pruning lever lands on the scan-volume bar. It doesn't just shrink — it
          shrinks by a measured factor, with the exact ratio and the saving per thousand orders
          stated.
        </>
      ),
      duration: 4.6,
      takeaway: "A lever's saving is a measured ratio against the actual bill, not a guess.",
      fig: 'a lever lands on the dominating bar, shrinking it by a stated, measured ratio',
      Visual: S.RevealLeverRatio,
    },
    {
      title: 'Reveal: cross-AZ and idle-compute levers',
      body: (
        <>
          The same waterfall, redrawn for a design dominated instead by cross-AZ traffic, fixed
          by locality and rack awareness, and one dominated by idle compute, fixed by
          autoscaling or suspension. The lever is specific to the dominator, not a generic
          "optimize everything" response.
        </>
      ),
      duration: 5.0,
      fig: 'the same waterfall, redrawn with a different bar dominating and a different lever',
      Visual: S.RevealOtherLevers,
    },
    {
      title: 'Reveal: every lever has a second-order cost',
      body: (
        <>
          The scan-volume lever's saving bar shrinks — and a thin second bar grows beside it, in
          a marked color: the write amplification that pre-aggregating the data to cut scans
          itself introduced.
        </>
      ),
      duration: 4.6,
      takeaway: "Every lever that lowers one cost has a second-order cost of its own.",
      fig: "the lever's saving bar next to the thin, growing bar it caused",
      Visual: S.RevealSecondOrderCost,
    },
    {
      title: 'Recap',
      body: (
        <>
          Five cost classes, priced per unit of business. A waterfall that finds the one that
          dominates. A lever with a measured ratio, not a guess. And every lever's own
          second-order cost, priced alongside its saving.
        </>
      ),
      duration: 4.6,
      fig: 'the waterfall, the lever, and its second-order cost, side by side',
      Visual: S.Recap,
    },
    {
      title: 'Prove it: a new price sheet, the same waterfall',
      body: (
        <>
          A few months later, one provider cuts cross-AZ transfer prices sharply. Does the same
          waterfall, run again on the unchanged design, still show the same bar dominating?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          {
            label: "yes — the dominator a design has doesn't change just because one provider's price sheet changed",
          },
          {
            label: 'not necessarily — a large enough cut to one class can drop it below another that stayed flat, so the waterfall has to be re-run',
            correct: true,
          },
        ],
        explain: (
          <>
            The waterfall ranks classes by their actual billed share, and that share moves
            whenever any one price moves. A steep enough cut to the previously-dominant class can
            hand the lead to a class that never changed at all — the method has to be re-run, not
            assumed to hold.
          </>
        ),
      },
      fig: 'a new price sheet; the same waterfall, re-run rather than assumed',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
