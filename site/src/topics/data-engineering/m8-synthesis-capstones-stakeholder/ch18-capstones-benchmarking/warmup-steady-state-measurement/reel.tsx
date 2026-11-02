import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Opens this chapter on this sandbox's own Postgres: a cold-restart measurement, a steady-state
// detector, and repeated trials with a confidence interval, executed for real in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Two engineers benchmark the same query on the same database and report numbers twice as
          far apart as the actual difference between a good day and a bad one. One started
          measuring the instant the service started; the other waited five minutes first.
        </>
      ),
      duration: 3.2,
      fig: 'same query, same database, two very different numbers.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: whose number is closer to real',
      body: (
        <>
          Whose number is closer to what a real, long-running deployment would actually see, and
          what, precisely, changed in those five minutes?
        </>
      ),
      duration: 2.8,
      fig: 'five minutes changed more than the clock.',
      predict: {
        options: [
          { label: 'The first engineer, since measuring immediately shows the system under real conditions' },
          { label: "The second engineer; an empty buffer pool and an empty result cache were still absorbing most of the first engineer's \"slow\" requests", correct: true },
        ],
        explain: (
          <>
            The system under test had not finished starting up. An empty Postgres buffer pool and
            an empty OS page cache made the first engineer's early requests pay for work a
            long-running deployment never repeats. The second engineer's five-minute wait let both
            caches fill before measuring.
          </>
        ),
      },
      Visual: S.PredictWhoseNumber,
    },
    {
      title: 'Reveal: why the first minutes lie — the warm-up causes',
      body: (
        <>
          Five named causes: JIT or code-gen warm-up, a cold page cache and buffer pool, empty
          result caches, LSM compaction debt, and table-format small files not yet accumulated.
          This sandbox's own Postgres reproduces the first two directly.
        </>
      ),
      duration: 4.5,
      fig: 'five causes. One database. Two reproduced here.',
      Visual: S.RevealWarmupCauses,
    },
    {
      title: 'Reveal: cold page cache and buffer pool, reproduced',
      body: (
        <>
          Restarting Postgres empties both its own buffer pool and the OS page cache beneath it.
          The shop's order-lookup query, run immediately after, is measurably slower for its first
          several requests than it will ever be again this run.
        </>
      ),
      duration: 4.2,
      fig: 'every early page, paid for with a disk round trip.',
      takeaway: "A cold start isn't a fluke to average away — it's a real, repeatable cost the first requests actually pay.",
      Visual: S.RevealColdCacheReproduced,
    },
    {
      title: 'Reveal: detecting steady state',
      body: (
        <>
          A sliding window of recent latency compares its mean to the window right before it.
          Once that change stays small for several windows in a row, the run is declared steady,
          adapted from a published coefficient-of-variation threshold at this topic's own,
          wall-clock scale.
        </>
      ),
      duration: 4.4,
      fig: 'not "long enough." A number that says when to stop discarding.',
      takeaway: 'Steady state is detected from the data, not guessed from a stopwatch.',
      Visual: S.RevealSteadyStateDetection,
    },
    {
      title: 'Reveal: repeated trials and confidence intervals',
      body: (
        <>
          One steady-state run still carries sampling noise. Repeating the trial several times and
          reporting a confidence interval around the result lets a reader judge whether two
          numbers actually differ, or only appear to.
        </>
      ),
      duration: 4.0,
      fig: 'one run is a guess. Several runs, with an interval, are a claim.',
      takeaway: 'A number without a confidence interval is a guess wearing a decimal point.',
      Visual: S.RevealConfidenceIntervals,
    },
    {
      title: 'Reveal: cold-cache and hot-cache as two honest numbers',
      body: (
        <>
          The same query's cold-start number and its steady-state number answer two different real
          questions — a service that restarts often, and one that runs for days — so this topic
          reports them side by side instead of blending them into one average.
        </>
      ),
      duration: 4.0,
      fig: 'two questions. Two numbers. Never one blend.',
      takeaway: 'Averaging a cold number into a hot one answers neither question anyone actually asked.',
      Visual: S.RevealColdHotTwoNumbers,
    },
    {
      title: 'Recap',
      body: (
        <>
          The first minutes lie for named, reproducible reasons. Steady state is detected, not
          assumed. Repeated trials earn a confidence interval. Cold-cache and hot-cache numbers
          stay two separate, honest results.
        </>
      ),
      duration: 4.5,
      fig: 'discard the warm-up. Detect, repeat, report both numbers.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A vendor reports a single benchmark number with no mention of warm-up or trial count.
          What would you ask before trusting it, and what would make you suspicious even if the
          number itself were accurate?
        </>
      ),
      duration: 3.2,
      fig: 'one number. No warm-up discard. No trial count.',
      predict: {
        options: [
          { label: 'Nothing to ask — if the number is accurate, how it was taken doesn\'t matter' },
          { label: 'Ask whether warm-up was discarded and whether the run was repeated; without both, the number is very likely still measuring startup, not steady state', correct: true },
        ],
        explain: (
          <>
            An accurate single number from an undiscarded, unrepeated run is still probably
            measuring the system's startup transient, which this topic has just shown runs
            measurably slower than steady state. Accuracy of the number doesn't rescue a benchmark
            that never asked when steady state began.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
