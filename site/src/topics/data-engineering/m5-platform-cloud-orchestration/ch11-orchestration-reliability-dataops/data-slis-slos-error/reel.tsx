import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Recaps quality dimensions taught earlier in the course (freshness, completeness, validity,
// uniqueness, consistency, accuracy) and turns them into SLIs, SLOs and error budgets, sourced
// from the Google SRE Workbook. The lab is a real thirty-day run against an in-process database
// (examples.py); every sourced claim is verified word for word against the fetched source text.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A pipeline's own dashboard says every run finished on time all month. The
          customer-facing report it feeds was stale for days, because a downstream refresh
          silently failed.
        </>
      ),
      duration: 4.8,
      fig: 'the pipeline finished. the report was still stale.',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the quality dimensions, recapped',
      body: (
        <>
          Freshness, completeness, validity, uniqueness, consistency, accuracy -- each already
          taught. This topic turns them into measured numbers with a target and a budget.
        </>
      ),
      duration: 4.8,
      fig: 'six dimensions. now: numbers, not vibes.',
      Visual: S.RevealDimensions,
    },
    {
      title: 'Predict: where should freshness actually be measured?',
      body: (
        <>
          A pipeline can finish precisely on schedule while the thing a person actually reads is
          still showing yesterday's numbers. Where should the freshness SLI actually be measured?
        </>
      ),
      duration: 2.8,
      fig: 'where should freshness actually be measured?',
      predict: {
        options: [
          { label: 'Wherever the pipeline itself finishes writing' },
          { label: "At the point a consumer actually reads the data", correct: true },
        ],
        explain: (
          <>
            The pipeline finishing has nothing to say about a downstream cache or view that
            silently stopped refreshing. Only the consumer's own read point sees that gap.
          </>
        ),
      },
      Visual: S.PredictReadPoint,
    },
    {
      title: "Reveal: the consumer's read point",
      body: (
        <>
          Measured where a consumer actually reads the data -- a dashboard query, an API response
          -- not where the pipeline writes it. The two diverge exactly when a downstream step
          fails quietly.
        </>
      ),
      duration: 4.8,
      fig: 'measured at the read, not the write.',
      takeaway: "A pipeline finishing on time isn't the same claim as the data being fresh to a reader.",
      Visual: S.RevealReadPoint,
    },
    {
      title: 'Predict: does every table deserve the same target?',
      body: (
        <>
          A customer-facing table and an internal exploration table clearly don't carry the same
          stakes. Should they share one freshness target anyway?
        </>
      ),
      duration: 2.8,
      fig: 'does every table deserve the same target?',
      predict: {
        options: [
          { label: 'Yes -- one target keeps the system simple to reason about' },
          { label: 'No -- a tighter target for what customers actually see', correct: true },
        ],
        explain: (
          <>
            A missed freshness target means something different depending on who's looking. The
            target should be set by the tier the table actually serves.
          </>
        ),
      },
      Visual: S.PredictTiers,
    },
    {
      title: 'Reveal: SLO targets per tier, and the error budget',
      body: (
        <>
          A tier-one table gets a tighter freshness target than a tier-three table. The SLO's
          allowed slack is the error budget -- spent deliberately by backfills and schema changes.
        </>
      ),
      duration: 4.8,
      fig: 'tighter target for tier one. the slack is a budget.',
      takeaway: 'An error budget is not a failure allowance. It is the slack a team is allowed to spend on purpose.',
      Visual: S.RevealTiersBudget,
    },
    {
      title: 'Reveal: the burn-rate alert, sourced',
      body: (
        <>
          Per the Google SRE Workbook's own recommended rule: a short, high burn rate pages fast;
          a longer, lower burn rate still worth a ticket before the whole budget is gone.
        </>
      ),
      duration: 4.8,
      fig: 'short window, high burn rate: page. longer window: ticket.',
      Visual: S.RevealBurnRate,
    },
    {
      title: 'Recap',
      body: (
        <>
          Measure at the read point, size the target by tier, spend the budget on purpose, and
          alert on burn rate before the whole budget is simply gone.
        </>
      ),
      duration: 4.8,
      fig: 'read point. tiered target. spend on purpose. alert on burn rate.',
      takeaway: "The hook's dashboard wasn't lying. It was just measuring the wrong point in the pipeline.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          This topic's own real month-long run, against a real database: does the finish-time SLI
          ever notice the same outage the read-point SLI catches immediately?
        </>
      ),
      duration: 2.8,
      fig: 'same outage. does the finish-time sli ever notice?',
      predict: {
        options: [
          { label: 'Yes -- eventually the finish-time SLI catches up' },
          { label: 'No -- it stays perfect the whole month', correct: true },
        ],
        explain: (
          <>
            The finish-time SLI measured a perfect month, every single day, because the pipeline
            genuinely never missed its own schedule. Only the read-point SLI saw the outage, and
            the sourced ticket-alert rule fired exactly when the real data said it should.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
