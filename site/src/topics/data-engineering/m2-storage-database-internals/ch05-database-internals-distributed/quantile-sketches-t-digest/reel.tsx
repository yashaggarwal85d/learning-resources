import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The naive-average-vs-merged-sketch comparison is reproduced for real in examples.py, against
// a real, partitioned, heavy-tailed dataset — a real mergeable digest built from scratch, not
// asserted from a description. DDSketch's own relative-error construction, KLL's own rank-error
// construction, and a real warehouse's own t-digest-backed function are sourced and named, not
// separately implemented, since this topic's own measurement is about mergeability and the
// averaging-percentiles trap. No literal digits anywhere.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: the same partitioned data, two ways of computing a percentile land on two different answers',
      body: (
        <>
          The exact same partitioned dataset, and the exact same target percentile. One way of
          computing it, and a completely different way of computing it, land on two genuinely
          different answers.
        </>
      ),
      duration: 5.6,
      fig: 'the same partitioned data, the same target percentile, two ways of computing it land on two different answers',
      Visual: S.Hook,
    },
    {
      title: "Predict: is averaging several partitions' own tail percentile a valid estimate of the whole dataset's real one",
      body: (
        <>
          Several partitions each already computed their own tail percentile correctly. Is
          simply averaging those separate values together a valid estimate of what the whole
          combined dataset's real tail percentile actually is?
        </>
      ),
      duration: 2.8,
      fig: "is averaging several partitions' own tail percentile a valid estimate of the whole dataset's real one?",
      predict: {
        options: [
          { label: "Yes — averaging each partition's own correct value gives the right answer" },
          { label: 'No — averaging percentiles this way is mathematically wrong', correct: true },
        ],
        explain: (
          <>
            No. A percentile isn't a quantity that combines by simple averaging the way a sum or
            a count does; the true combined value depends on the whole shape of the combined
            data, not on quietly blending each partition's own separate answer.
          </>
        ),
      },
      Visual: S.PredictAveragingValid,
    },
    {
      title: 'Reveal: a real counterexample, computed on a real partitioned dataset, proves it',
      body: (
        <>
          A real dataset, split into real partitions, with the true combined value computed
          directly by looking at every single point at once. Compared side by side against the
          naive average, the two numbers simply do not match.
        </>
      ),
      duration: 5.2,
      fig: 'a real counterexample, computed on a real partitioned dataset, proves averaging wrong',
      Visual: S.RevealCounterexample,
    },
    {
      title: 'Reveal: a rank-error guarantee bounds a different thing than a relative-error one',
      body: (
        <>
          One real guarantee bounds how far off an estimated position within the data can be. A
          genuinely different real guarantee instead bounds how far off the actual value itself
          can be — and once the tail gets heavy, that difference matters enormously.
        </>
      ),
      duration: 5.6,
      fig: 'a rank-error guarantee bounds a different thing entirely than a relative-error guarantee',
      takeaway: 'A rank-error guarantee and a relative-error guarantee bound genuinely different things.',
      Visual: S.RevealRankVsRelative,
    },
    {
      title: 'Reveal: a merged sketch stays a valid approximation; a naive average does not',
      body: (
        <>
          The true combined value, a naive average of per-partition values, and a single sketch
          merged from every partition's own sketch, all computed on the exact same real data. The
          naive average drifts noticeably away from the truth; the merged sketch stays close to
          it.
        </>
      ),
      duration: 5.6,
      fig: 'a merged sketch stays a valid approximation of the true value; a naive average does not',
      takeaway: 'A merged sketch stays close to the true value where a naive average drifts off.',
      Visual: S.RevealMergedStaysValid,
    },
    {
      title: 'Reveal: mergeability is a real, deliberate design choice',
      body: (
        <>
          Combining two of these sketches into one, and compressing the result back down, is a
          real mechanism these structures are deliberately built around from the start — named
          directly in their own original descriptions, not something that happens to work by
          accident.
        </>
      ),
      duration: 5.6,
      fig: "mergeability is a real, deliberate design choice named directly in these sketches' own papers",
      takeaway: 'Mergeability is a deliberate design choice these sketches are built around.',
      Visual: S.RevealMergeByDesign,
    },
    {
      title: 'Reveal: real engines and real tools each picked a different one of these sketches',
      body: (
        <>
          A real warehouse engine's own documented function ships one of these sketches directly.
          A completely different, real observability platform ships a different one of them,
          named directly from its own creators' own description, at real wide-scale use.
        </>
      ),
      duration: 5.6,
      fig: 'real engines and real tools each picked a different one of these sketches, named from their own sources',
      takeaway: 'Different real engines and tools each shipped a different one of these sketches.',
      Visual: S.RevealRealEngines,
    },
    {
      title: 'Recap',
      body: (
        <>
          Averaging per-partition percentiles together is measurably wrong, proven by a real
          counterexample. A rank-error guarantee and a relative-error guarantee bound genuinely
          different things. Mergeability is a deliberate design choice, which is why a merged
          sketch stays close to the truth where a naive average does not. Real engines and real
          tools each picked a different one of these sketches.
        </>
      ),
      duration: 5.6,
      fig: 'averaging percentiles is wrong, rank error and relative error bound different things, mergeability is deliberate, real tools each picked one',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A dashboard already averages each service instance's own reported tail latency into
          one number shown to on-call. A teammate asks why that number sometimes looks fine while
          users are actually complaining about slow requests. What's actually wrong with that
          dashboard's own number, and what would fix it?
        </>
      ),
      duration: 2.8,
      fig: "a dashboard averages each instance's own tail latency; users complain while the number looks fine — what's wrong?",
      predict: {
        options: [
          { label: "The dashboard just needs a bigger sample — nothing else is wrong" },
          { label: 'Averaging per-instance values hides a single bad instance; a merged sketch would fix it', correct: true },
        ],
        explain: (
          <>
            Averaging each instance's own value is exactly the same mathematically wrong move as
            averaging per-partition percentiles. One genuinely struggling instance gets diluted
            into the average instead of showing up. Replacing that average with one sketch merged
            across every instance would show the real combined tail latency instead.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
