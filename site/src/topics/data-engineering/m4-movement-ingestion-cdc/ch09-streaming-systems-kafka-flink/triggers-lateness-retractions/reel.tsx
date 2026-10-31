import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a real sequence of early, on-time, and late
// firings for one window, a real pane that closes and drops a late record right at the allowed-
// lateness boundary, and all three accumulation modes measured against the same real ground
// truth, including a downstream sum-of-sums that really does go wrong under the wrong mode. No
// literal digits anywhere below (duration numbers are exempt); the real values live in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: "Hook: a dashboard that silently lies about its own total",
      body: (
        <>
          A downstream dashboard sums every window value it receives, assuming accumulating mode.
          The upstream job is actually configured for discarding mode. The dashboard's total
          silently multiplies far beyond the truth, caught only when checked against a measured
          ground truth.
        </>
      ),
      duration: 4.8,
      fig: 'a dashboard assumes the wrong mode, and its total quietly runs away',
      Visual: S.Hook,
    },
    {
      title: 'Setup: a window has a shape. Now it has to say something',
      body: (
        <>
          The last topic fixed what a window is — its shape, its state. This topic is when it
          actually speaks: early, on time, or as a correction, and what it reports each time.
        </>
      ),
      duration: 4.8,
      fig: 'a window has a shape; now it has to say something, and say it honestly',
      Visual: S.Setup,
    },
    {
      title: 'Reveal: the same window, three different moments to speak',
      body: (
        <>
          A window can fire early, with a speculative, incomplete answer before the watermark
          passes. It can fire on time, right as the watermark passes its end. And it can fire
          late, a correction once a record arrives within the allowed-lateness period.
        </>
      ),
      duration: 4.8,
      fig: 'the same window, speaking at three different moments, each a real total',
      Visual: S.RevealThreeFirings,
    },
    {
      title: 'Predict: once the allowed-lateness window closes, what happens to a later record?',
      body: (
        <>
          A window configured with allowed lateness keeps accepting corrections for exactly that
          long. What happens to a record that shows up after that period has already ended?
        </>
      ),
      duration: 2.8,
      fig: 'once the allowed window closes, what happens to a record that shows up after?',
      predict: {
        options: [
          { label: "It's queued and applied to the window whenever it finally runs" },
          { label: "It's simply dropped — the window's state is already gone", correct: true },
          { label: 'It starts an entirely new window of its own' },
        ],
        explain: (
          <>
            Dropped, outright. Once allowed lateness expires, the pane's state is gone — there's
            nothing left for a late record to be applied to, by design, not by accident.
          </>
        ),
      },
      Visual: S.PredictLateness,
    },
    {
      title: 'Reveal: dropped, not queued, not retried',
      body: (
        <>
          Once allowed lateness expires, the pane's state is simply gone, and a later record is
          dropped outright — a deliberate, bounded trade-off between correctness and letting state
          grow without end.
        </>
      ),
      duration: 4.8,
      fig: "not queued, not retried — the pane's state is simply gone",
      takeaway: 'Allowed lateness is not a promise to eventually be right — it is a deadline trading correctness away on purpose.',
      Visual: S.RevealDropped,
    },
    {
      title: 'Predict: does a downstream sum-of-sums always get the right answer?',
      body: (
        <>
          A downstream consumer just adds up every value a window emits, no matter which
          accumulation mode produced them. Does that work for every mode, or only some of them?
        </>
      ),
      duration: 2.8,
      fig: 'sum up every value a window emits — does that always work?',
      predict: {
        options: [
          { label: "Yes — a window's totals always sum to the right answer" },
          { label: 'No — it depends entirely on which accumulation mode is in use', correct: true },
          { label: 'No — summing emitted values never produces the right answer' },
        ],
        explain: (
          <>
            It depends entirely on the mode. Some modes report values a naive sum can safely add
            together. Others report values that double-count unless the consumer accounts for it.
          </>
        ),
      },
      Visual: S.PredictSumOfSums,
    },
    {
      title: 'Reveal: discarding and accumulating report completely different things',
      body: (
        <>
          Discarding reports only the delta since the last firing, so a naive downstream sum
          naturally lands on the right total. Accumulating reports the full running total every
          time, and that same naive sum double- and triple-counts it.
        </>
      ),
      duration: 4.8,
      fig: 'discarding reports a delta each time; accumulating reports the whole total again',
      takeaway: "Accumulating mode isn't wrong — a sum-of-sums consumer that doesn't know the mode is, and that mismatch is the lesson.",
      Visual: S.RevealDiscardingVsAccumulating,
    },
    {
      title: 'Reveal: a retraction is how accumulating gets fixed',
      body: (
        <>
          Accumulating-and-retracting emits an explicit retraction of its previous value — a
          real, negative-valued record — before the new one. Apply every value a window emits,
          retractions included, and the same naive downstream sum is correct again.
        </>
      ),
      duration: 4.8,
      fig: 'a retraction cancels the old value first, so the same naive sum works again',
      takeaway: "A retraction isn't a special case to ignore — it's a real record that correctness depends on applying.",
      Visual: S.RevealRetraction,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every number in this reel came from a real run of this topic's own toy model, just now —
          the three firings for one window, the exact moment a late record starts being dropped,
          and all three accumulation modes measured against the same ground truth.
        </>
      ),
      duration: 4.8,
      fig: "this topic's own real run, every number read straight off it",
      Visual: S.ProveIt,
    },
    {
      title: 'Recap',
      body: (
        <>
          Early, on time, or late — a window can say the same thing three different ways. Allowed
          lateness is a bounded trade-off, not a bug. And accumulation mode is never a detail a
          downstream consumer can afford to guess at.
        </>
      ),
      duration: 4.8,
      fig: 'three moments to speak, a bounded trade-off, and a mode that must be known',
      Visual: S.Recap,
    },
  ],
};

export default reel;
