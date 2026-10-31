import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Hosts the chapter lab's core on this sandbox's own Postgres: a closed-loop generator and a
// constant-rate generator, the same injected stall, measured for real in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A load test reports a mean latency of forty milliseconds, and a real shopper still waits
          four full seconds on a bad request, during the exact same run.
        </>
      ),
      duration: 3.2,
      fig: 'one average. One shopper who waited far longer than it.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: which numbers would have shown the gap',
      body: (
        <>
          Which five numbers would have shown that gap where the mean hid it, and which of two
          ways to generate the test's own load would have caught the four-second request at all?
        </>
      ),
      duration: 3.0,
      fig: 'a mean is a single number hiding a whole shape.',
      predict: {
        options: [
          { label: 'The mean alone is enough, since any outlier still pulls it in that direction' },
          { label: 'The full percentile ladder catches it, but only if the load generator paces requests at a constant rate rather than waiting for each response', correct: true },
        ],
        explain: (
          <>
            The percentile ladder, especially its far tail, shows exactly what the mean cannot. But
            a closed-loop generator that waits for each response before sending the next would have
            quietly skipped measuring the slow request in the first place, hiding it from any
            statistic, percentile included.
          </>
        ),
      },
      Visual: S.PredictWhichNumbers,
    },
    {
      title: 'Reveal: why means hide tails',
      body: (
        <>
          A rare, large stall barely moves a mean taken over many requests, while the tail
          percentiles move sharply, because one extreme value is diluted across every other
          ordinary one.
        </>
      ),
      duration: 4.0,
      fig: 'one outlier, diluted into invisibility by everything around it.',
      Visual: S.RevealMeansHideTails,
    },
    {
      title: 'Reveal: the percentile ladder, p50 through max',
      body: (
        <>
          Five points on the same distribution, each answering a different real question: the
          typical request, a typical unlucky user, a very unlucky one, something rare enough to
          only show up at volume, and the single worst request this run ever saw.
        </>
      ),
      duration: 4.4,
      fig: 'five numbers. Five different questions, never one answer.',
      takeaway: 'Reporting only one point on this ladder answers only one of five real questions, and silently drops the other four.',
      Visual: S.RevealPercentileLadder,
    },
    {
      title: 'Reveal: merging histograms instead of averaging percentiles',
      body: (
        <>
          Two hosts' own p99 values, averaged together, disagree with the true p99 of their
          combined traffic. Histograms are additive and can be merged bucket by bucket; percentiles
          computed from them are not.
        </>
      ),
      duration: 4.5,
      fig: "the fleet's real tail isn't the average of two separate tails.",
      takeaway: "A fleet's percentile has to be read off a merged histogram, never averaged from each host's own.",
      Visual: S.RevealHistogramMerge,
    },
    {
      title: 'Reveal: fan-out tail amplification',
      body: (
        <>
          A single server's own rare tail event is unlikely on its own. Fan a request out across a
          hundred such servers in parallel, and the chance that at least one of them lands in its
          own tail rises sharply, because the slowest one sets the whole request's latency.
        </>
      ),
      duration: 4.3,
      fig: 'one shard, rarely slow. A hundred shards, often one of them is.',
      takeaway: 'Fan-out does not average away a tail risk — it multiplies the chance that someone in the fan-out hits it.',
      Visual: S.RevealFanoutAmplification,
    },
    {
      title: "Reveal: closed-loop vs. constant-rate generators, and the chapter lab's stall",
      body: (
        <>
          Two generators, the same offered load, the same injected stall against the shop's query.
          The closed-loop generator's own p99 stays near baseline; the constant-rate generator's
          p99 reports the stall's full backlog honestly.
        </>
      ),
      duration: 4.5,
      fig: 'same stall. One generator hides it. One reports it.',
      takeaway: "Closed-loop load generation doesn't just miss one slow request — it hides every request stuck waiting behind it.",
      Visual: S.RevealClosedLoopVsConstantRate,
    },
    {
      title: 'Recap',
      body: (
        <>
          Means hide tails. The full percentile ladder answers five different questions. Histograms
          merge; percentiles don't average. Fan-out multiplies tail risk. Only a constant-rate
          generator reports what a closed-loop one quietly hides.
        </>
      ),
      duration: 4.6,
      fig: 'report the ladder, merge the histograms, respect the fan-out, pace the load honestly.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A fleet of ten hosts each independently reports its own ninety-ninth percentile as five
          milliseconds. Is the fleet's own combined ninety-ninth percentile also five milliseconds?
        </>
      ),
      duration: 3.0,
      fig: 'ten hosts agree. Does the fleet?',
      predict: {
        options: [
          { label: "Yes, since all ten hosts independently report the exact same number" },
          { label: 'Not necessarily — the combined percentile has to be read off a merged histogram of all ten hosts, not assumed from their individual numbers agreeing', correct: true },
        ],
        explain: (
          <>
            Ten hosts agreeing on their own separate p99 says nothing certain about the shape of
            their combined traffic. The only way to know the fleet's real combined p99 is to merge
            the ten histograms and read the percentile off the merge, exactly the mechanism this
            topic just demonstrated.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
