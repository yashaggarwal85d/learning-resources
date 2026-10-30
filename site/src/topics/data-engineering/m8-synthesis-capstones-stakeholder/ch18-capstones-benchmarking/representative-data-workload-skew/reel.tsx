import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Hosts the running shop example again: the same order-lookup query, now generated with a
// seeded Zipfian key and a correlated column pair, measured for real in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The shop's own order-lookup benchmark just reported a clean, flat latency distribution
          with no visible hot spots, while the shop's real traffic that same week shows one
          percent of customers generating nearly a third of all lookups.
        </>
      ),
      duration: 3.4,
      fig: 'one clean benchmark. One real traffic shape it never looked like.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what did the benchmark data get wrong',
      body: (
        <>
          What did the benchmark's own data get wrong, and what single change to how that data
          was generated would fix it?
        </>
      ),
      duration: 3.0,
      fig: 'a uniform random id, standing in for a real customer.',
      predict: {
        options: [
          { label: 'The query itself was wrong, and needs rewriting' },
          { label: 'The benchmark generated customer ids uniformly at random; switching to a Zipfian distribution reproduces the real hot-key shape', correct: true },
        ],
        explain: (
          <>
            The query was always fine. What was wrong was the data feeding it: a uniform random
            customer id spreads load evenly across every customer, which real traffic never does.
            Switching the key generator to a seeded Zipfian distribution, the same shape YCSB's
            own default workload uses, reproduces the real hot-key effect on the identical query.
          </>
        ),
      },
      Visual: S.PredictWhatBroke,
    },
    {
      title: 'Reveal: the uniform baseline, confirmed flat',
      body: (
        <>
          The same query, the same load shape, a uniform random customer id: every customer
          carries roughly the same number of orders, and the lookup is equally fast for everyone.
        </>
      ),
      duration: 3.6,
      fig: 'a flat baseline — exactly what the benchmark reported.',
      Visual: S.RevealUniformFlat,
    },
    {
      title: 'Reveal: Zipfian key generation, reproduced',
      body: (
        <>
          Swap the uniform generator for a seeded Zipfian one, change nothing else, and the
          busiest customer suddenly carries far more orders than a typical customer, with a
          measurably slower lookup on the identical query.
        </>
      ),
      duration: 4.2,
      fig: 'the hot key was always there — the uniform data just hid it.',
      takeaway: 'A uniform key generator cannot hide a hot key; it simply never creates one in the first place.',
      Visual: S.RevealZipfianKeys,
    },
    {
      title: 'Reveal: correlated columns breaking a cardinality estimator',
      body: (
        <>
          A query planner that assumes every column is independent of every other misestimates a
          join badly once two columns are correlated, the same query shape and row count showing
          a far smaller error when the columns are independent instead.
        </>
      ),
      duration: 4.4,
      fig: 'same query, same row count — correlation alone breaks the estimate.',
      takeaway: "A planner's independence assumption fails quietly on correlated columns, and only extended statistics or representative test data catches it.",
      Visual: S.RevealCorrelatedColumns,
    },
    {
      title: 'Reveal: an explicit scale factor',
      body: (
        <>
          The dataset's own size is stated as a number, not left implicit, following the same
          convention industry benchmark standards use to declare how large a test database is.
        </>
      ),
      duration: 3.4,
      fig: 'a stated number, not a guess at how big the data is.',
      takeaway: 'A benchmark that never states its own scale factor leaves every result unreproducible at any other size.',
      Visual: S.RevealScaleFactor,
    },
    {
      title: 'Reveal: the seeded generator as a committed artifact',
      body: (
        <>
          The Zipfian-and-correlated generator, given the same seed, reproduces byte-identical
          data every single run, committed as a reusable function rather than a one-off script
          run once by hand.
        </>
      ),
      duration: 4.0,
      fig: 'the same seed, twice, byte for byte identical.',
      takeaway: 'A benchmark whose own data generator is not committed and seeded is not actually reproducible by anyone else.',
      Visual: S.RevealSeededGenerator,
    },
    {
      title: 'Recap',
      body: (
        <>
          Uniform data hides both a hot key and a cardinality-breaking correlation. A seeded
          Zipfian generator, an explicit scale factor, and a committed, reproducible generator
          turn a toy benchmark into one that resembles the real thing.
        </>
      ),
      duration: 4.4,
      fig: 'generate data that looks like real data, and say exactly how much of it there is.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A benchmark reports a clean result on synthetic data generated with independent,
          uniformly random columns. Should that result be trusted for a production workload with
          correlated, skewed real columns?
        </>
      ),
      duration: 3.0,
      fig: 'a clean result on tidy data. Does it hold for the real thing?',
      predict: {
        options: [
          { label: 'Yes — a clean benchmark result generalizes regardless of how the test data was generated' },
          { label: 'Not without re-running on representative data — a clean result on independent, uniform data says nothing about what happens once real skew and correlation are present', correct: true },
        ],
        explain: (
          <>
            A clean result on independent, uniform data is not a result about production at all —
            it is a result about independent, uniform data. This topic's own lab just showed both
            failure modes directly: a hot key invisible under uniform keys, and a cardinality
            estimate that only breaks once columns are actually correlated.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
