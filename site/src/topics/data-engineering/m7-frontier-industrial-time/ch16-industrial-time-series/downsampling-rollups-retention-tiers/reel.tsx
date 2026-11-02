import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real, executed rollup/continuous-aggregate/retention computation
// (examples.py): a naive average-of-averages error, an exact merge of
// hourly rollups, a mergeable digest, a late-data recompute, a three-tier
// storage and routing plan, and a spike hidden by one rollup and kept by
// another. No numbers are repeated on screen beyond what that file computes.
const reel: Reel = {
  steps: [
    {
      title: "Hook: a daily mean that disagrees with its own raw data",
      body: (
        <>
          The daily dashboard's mean comes from averaging twenty-four hourly means. One
          of those hours, right after a restart, had a tiny fraction of the usual
          samples — and counted exactly as much as every full hour.
        </>
      ),
      duration: 5.6,
      fig: "a daily mean built from averaging hourly means disagrees with the raw mean, because a restart hour's tiny sample count was weighted equally with every full hour",
      Visual: S.Hook,
    },
    {
      title: "Reveal: mergeable aggregates, and the one that isn't",
      body: (
        <>
          A minimum, a maximum, a sum and a count can each be combined from two rollups
          into the rollup of their union. A quantile can't — there's no rule for
          merging two percentiles into the percentile of both.
        </>
      ),
      duration: 5.4,
      fig: "a minimum, a maximum, a sum and a count can each be merged from two rollups into the rollup of their union; a quantile can't be merged this way at all",
      Visual: S.RevealMergeableAggregates,
    },
    {
      title: 'Predict: does merging two rollups match the raw computation?',
      body: (
        <>
          Two hourly rollups, each storing sum and count instead of an average, get
          merged into one. Does the merged result equal what computing directly from
          every raw reading would give?
        </>
      ),
      duration: 4.6,
      fig: "two hourly rollups, storing sum and count instead of an average, are merged into one — does the merged result equal computing directly from every raw reading?",
      predict: {
        options: [
          { label: 'Only approximately — some rounding is unavoidable' },
          { label: 'Exactly — sum and count lose nothing by merging', correct: true },
        ],
        explain: (
          <>
            Exactly. Sum and count are each a complete, lossless summary of their own
            bucket — combining them loses nothing an average would have already
            thrown away.
          </>
        ),
      },
      Visual: S.PredictMerge,
    },
    {
      title: 'Reveal: merged exactly, never averaged',
      body: (
        <>
          The merged sum and count equal the raw total and the raw count, so the
          derived mean matches exactly. The naive average of hourly averages does not
          come close.
        </>
      ),
      duration: 5.0,
      fig: "the merged sum and count equal the raw total and count exactly, so the derived mean matches — the naive average of hourly averages does not come close",
      Visual: S.RevealMergedExactly,
    },
    {
      title: 'Reveal: a late reading reopens one bucket',
      body: (
        <>
          A reading that arrives after its bucket was already materialized changes that
          bucket's max, count and mean. Only the one affected bucket is recomputed, not
          the whole aggregate.
        </>
      ),
      duration: 5.4,
      fig: "a reading arriving after its bucket was already materialized changes that bucket's max, count and mean — only the one affected bucket is recomputed",
      takeaway: "A late reading has to reopen the one bucket it belongs to, not get silently dropped or left stale.",
      Visual: S.RevealLateData,
    },
    {
      title: 'Reveal: three tiers, and a query that spans two of them',
      body: (
        <>
          Raw for days, minute rollups for months, hour rollups for years. A short
          query reads raw; a long one reads the coarsest tier that covers it; a query
          spanning both stitches them together.
        </>
      ),
      duration: 5.4,
      fig: "raw for days, minute rollups for months, hour rollups for years; a short query reads raw, a long one reads the coarsest tier, and a spanning query stitches both",
      takeaway: "Reducing storage cost by downsampling doesn't reduce the number of blocks kept — it buys faster long-range queries instead.",
      Visual: S.RevealThreeTiers,
    },
    {
      title: 'Reveal: a spike hidden by one rollup, kept by another',
      body: (
        <>
          A single real spike in one bucket barely moves that bucket's mean. The same
          bucket's max shows the spike exactly, unchanged.
        </>
      ),
      duration: 5.0,
      fig: "a single real spike in one bucket barely moves that bucket's mean, while the same bucket's max shows the spike exactly",
      takeaway: "A mean rollup and a max rollup answer different questions — keep only one and the other is lost.",
      Visual: S.RevealSpike,
    },
    {
      title: 'Recap',
      body: (
        <>
          Only mergeable aggregates survive a rollup; derive the average, never store
          it. A late reading reopens its bucket. A query can span tiers and has to
          stitch them. A mean and a max keep different truths.
        </>
      ),
      duration: 5.6,
      fig: 'only mergeable aggregates survive a rollup, a late reading reopens its bucket, a spanning query stitches tiers, and a mean and a max keep different truths',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A dashboard reports a daily mean with no record of how many samples went
          into each hour behind it. Is that daily number trustworthy on its own?
        </>
      ),
      duration: 4.4,
      fig: "a dashboard reports a daily mean with no record of how many samples went into each hour behind it — is that daily number trustworthy on its own?",
      predict: {
        options: [
          { label: 'Yes — a mean already summarizes whatever happened that day' },
          {
            label: "No — a thin hour and a full hour counted the same way can't be told apart",
            correct: true,
          },
        ],
        explain: (
          <>
            No. Without each bucket's own count, a restart hour's handful of hot
            readings and a full hour of normal ones look identical to the daily
            average — the count is load-bearing information, not an afterthought.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
