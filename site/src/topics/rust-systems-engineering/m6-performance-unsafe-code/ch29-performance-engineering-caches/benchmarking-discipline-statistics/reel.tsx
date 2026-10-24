import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A distribution's own p50 and p99 are genuinely separate statistics; a
// real change can genuinely improve one while genuinely regressing the
// other, and a single average alone genuinely hides that divergence.
const reel: Reel = {
  steps: [
    {
      title: "A benchmark's own average goes down after a change. Does that genuinely mean every real user's own request got faster?",
      body: (
        <>
          A benchmark's own average, going down.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, genuinely; a lower average always means faster for everyone' },
          { label: 'No, genuinely; the real tail can move the opposite way', correct: true },
          { label: 'Only if the benchmark genuinely ran long enough' },
        ],
        explain: (
          <>
            No. The real tail can genuinely move apart from it.
          </>
        ),
      },
      Visual: S.AveragePredict,
    },
    {
      title: 'Measured: the real p50 and the real p99 of the identical distribution are genuinely separate statistics, computed from the identical real samples',
      body: (
        <>
          The real, measured p50 and p99, one distribution.
        </>
      ),
      duration: 3.0,
      Visual: S.PercentileReveal,
    },
    {
      title: 'Now a real change is applied. The real median genuinely drops. Does the real p99 genuinely drop along with it?',
      body: (
        <>
          A median dropping, the real p99 beside it.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, genuinely; they genuinely move together' },
          { label: 'No, genuinely; the real p99 can genuinely rise instead', correct: true },
          { label: 'Only if the change touches every request equally' },
        ],
        explain: (
          <>
            No. The real p99 genuinely rose instead.
          </>
        ),
      },
      Visual: S.MedianPredict,
    },
    {
      title: 'Measured: the real median genuinely improved, while the real p99 genuinely regressed, on the identical change',
      body: (
        <>
          The real, measured divergence, on one real change.
        </>
      ),
      duration: 3.0,
      takeaway: 'A median improving says nothing about the real tail; the two are genuinely separate facts about one change.',
      Visual: S.MedianReveal,
    },
    {
      title: "Now check the real average on this identical change. Does it genuinely show the real p99's own regression?",
      body: (
        <>
          The real average, beside the real p99.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, the real average always tracks the real tail' },
          { label: "No, genuinely; the average can improve while the p99 regresses", correct: true },
          { label: 'Only for a genuinely small sample size' },
        ],
        explain: (
          <>
            No. The real average genuinely hid it.
          </>
        ),
      },
      Visual: S.AverageDoesItPredict,
    },
    {
      title: "Measured: the real average genuinely improved too, completely hiding the real p99's own regression",
      body: (
        <>
          The real, measured average, disagreeing with the p99.
        </>
      ),
      duration: 3.0,
      takeaway: 'A single average can genuinely improve while the real tail a user actually waits on genuinely gets worse.',
      Visual: S.AverageHidesReveal,
    },
    {
      title: "Criterion.rs's own documentation and HdrHistogram's own README both describe this exact discipline directly: real warmup and outlier classification before trusting a result, and a real correction for exactly the missed, slow samples a naive measurement would hide. Does this topic's own code measure the identical real divergence those real tools exist to catch?",
      body: (
        <>
          Both sources' own words on this exact discipline, shown directly.
        </>
      ),
      duration: 2.8,
      takeaway: 'Trusting one run at all needs a real warmup and a real check for outliers first, before any comparison.',
      Visual: S.DocsReveal,
    },
    {
      title: "Recap: a distribution's own p50, p95, and p99, measured directly",
      body: (
        <>
          A distribution's own p50, p95, and p99 are three genuinely separate real statistics; a single average can genuinely improve while the real tail a user actually waits on genuinely gets worse.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
