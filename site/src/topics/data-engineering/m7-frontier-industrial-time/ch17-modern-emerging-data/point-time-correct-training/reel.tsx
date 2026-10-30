import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows (the AUC gap, the TTL edge cases, the post-outcome field's
// construction) is measured for real in examples.py against this sandbox's own Postgres cluster
// on a synthetic churn dataset with deliberately engineered leakage.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A churn model's offline score looks strong. Live, it barely beats a coin flip. Nothing
          in the model changed between the two.
        </>
      ),
      duration: 2.6,
      fig: 'strong offline. Barely better than chance, live.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: naive vs. as-of join',
      body: (
        <>
          Join a label to a feature's value today, or to its value at the label's own moment.
          Which AUC is the one to trust?
        </>
      ),
      duration: 2.4,
      fig: "today's value, or the label's own moment?",
      predict: {
        options: [
          { label: "Both are equally trustworthy — it's the same underlying data either way" },
          { label: "The as-of AUC — a current-value join lets the future leak backward into training", correct: true },
        ],
        explain: (
          <>
            A feature's current value already reflects everything that happened since the label,
            including things the outcome itself caused. The as-of join only sees what was true at
            the label's own moment — the only thing a live model will ever get to see.
          </>
        ),
      },
      Visual: S.PredictNaiveVsAsof,
    },
    {
      title: 'Reveal: the as-of join, mechanism',
      body: (
        <>
          Scan backward from the label's own timestamp. Stop at the first feature value at or
          before it, never after — this doesn't ask what the feature is now, only what it was at
          that moment.
        </>
      ),
      duration: 4.2,
      fig: 'scan backward. Stop at the first value at or before.',
      Visual: S.RevealAsOfMechanism,
    },
    {
      title: 'Reveal: temporal leakage, measured',
      body: (
        <>
          A real synthetic dataset, joined both ways: the naive join's AUC is inflated by exactly
          the leakage the as-of join refuses to admit.
        </>
      ),
      duration: 4.5,
      fig: 'naive, inflated. As-of, honest. Measured, not assumed.',
      takeaway: "The naive AUC wasn't a lie about training data. It was truth about data a live model never has.",
      Visual: S.RevealTemporalLeakageMeasured,
    },
    {
      title: 'Reveal: post-outcome field leakage',
      body: (
        <>
          A cancellation-reason column, filled in only for customers who already churned. No
          amount of join timing fixes a field that exists only because of the outcome.
        </>
      ),
      duration: 4.2,
      fig: 'filled in only where the outcome already happened.',
      takeaway: 'Temporal leakage is about when you looked. This leak is about why the field exists at all.',
      Visual: S.RevealPostOutcomeField,
    },
    {
      title: 'Predict: TTL edges',
      body: (
        <>
          A label older than any feature data. A label ten days past the last update, with a
          seven-day limit. What does each join to?
        </>
      ),
      duration: 2.4,
      fig: 'too early, or too stale. What comes back?',
      predict: {
        options: [
          { label: 'Both join to the nearest value anyway — closer is better than nothing' },
          { label: 'Both join to nothing: too early for one, too stale for the other', correct: true },
        ],
        explain: (
          <>
            A staleness limit is a stated line: past it, the honest answer is "unknown," not "the
            nearest guess." A join that quietly substitutes a stale value for a missing one hides
            exactly the gap the limit exists to surface.
          </>
        ),
      },
      Visual: S.PredictTtlEdges,
    },
    {
      title: 'Reveal: feature TTL, measured',
      body: (
        <>
          Both edge cases, run for real: a label with no earlier feature row, and a label past the
          staleness window. Neither joins to anything.
        </>
      ),
      duration: 4.2,
      fig: 'both cases, run for real. Neither joins to anything.',
      takeaway: "A staleness limit isn't a performance setting. It admits a feature value can get too old to mean anything.",
      Visual: S.RevealTtlMeasured,
    },
    {
      title: 'Reveal: backfill with the same online logic',
      body: (
        <>
          A feature added after the model is already live still has to be computed for history —
          with the identical transformation that will run online, or the two drift apart from day
          one.
        </>
      ),
      duration: 4.5,
      fig: 'one transformation. Two pipes, never two versions.',
      takeaway: "A backfilled feature isn't close enough. If it isn't identical, it's a second feature wearing the first one's name.",
      Visual: S.RevealBackfillSameLogic,
    },
    {
      title: 'Recap',
      body: (
        <>
          Read a feature as of the label's own moment. Drop a field that only exists because of
          the outcome. Respect the limit on how old "known" is allowed to be.
        </>
      ),
      duration: 4.5,
      fig: 'as of the label; drop the post-outcome field; respect the limit.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A new feature is added nine months after launch. The engineer backfilling it has no
          access to the original online code and approximates it from the warehouse instead.
        </>
      ),
      duration: 2.6,
      fig: 'approximated from the warehouse, not the online code.',
      predict: {
        options: [
          { label: "Close enough — the warehouse tables hold the same underlying facts" },
          { label: "Probably a second, subtly different feature wearing the same name", correct: true },
        ],
        explain: (
          <>
            Without the exact online transformation, a warehouse approximation is a
            plausible-looking stand-in that can diverge from what the live service actually
            computes — invisible until skew shows up in production, which is exactly the failure
            the next topic measures directly.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
