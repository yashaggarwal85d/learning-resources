import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The last two topics took M and B as given; this one measures the real machine behind them with
// a pointer-chasing benchmark and a strided sweep, then reconciles the staircase with the
// amortized vector proofs. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'The models took M and B as a gift',
      body: (
        <>
          Every bound so far assumed a memory level's size and its block size. A real core is a staircase of levels, registers, L1, L2, L3, DRAM,
          and a cache of address translations, each larger and slower than the one above it. This topic measures that staircase instead of
          assuming it.
        </>
      ),
      duration: 3.6,
      Visual: S.Problem,
    },
    {
      title: 'Predict: the shape of the latency curve',
      body: <>Sweep a working set from a few kilobytes up to a gibibyte, timing one memory load at each size. What shape does the curve trace?</>,
      duration: 1.6,
      predict: {
        options: [
          { label: 'A smooth, rising curve' },
          { label: 'A staircase: flat, then a step, repeated', correct: true },
          { label: 'A straight line' },
          { label: 'It falls as the set grows' },
        ],
        explain: (
          <>
            A staircase: flat while the working set fits in one level, then a step up as it spills into the next, slower one. Each flat run is a
            level; each step is that level's capacity.
          </>
        ),
      },
      Visual: S.StaircaseShapePredict,
    },
    {
      title: 'Timing one load means breaking the overlap',
      body: (
        <>
          A modern core runs many independent loads at once, so summing an array measures throughput, not latency. The fix: make every load
          depend on the result of the last, so load k+1 cannot start until load k returns. Nothing can overlap, and the chain measures a single
          load's true cost.
        </>
      ),
      duration: 4,
      Visual: S.PointerChasing,
    },
    {
      title: 'One cycle, visited in random order',
      body: (
        <>
          The chain must form exactly one cycle through every slot, built with Sattolo&rsquo;s algorithm, or the walk revisits a small set that
          happily lives in cache. Walking it in random order, not address order, is what stops the hardware from predicting where it goes next.
        </>
      ),
      duration: 3.8,
      Visual: S.SattoloCycle,
    },
    {
      title: 'Reading the staircase',
      body: (
        <>
          Inside L1, a load costs about <b>1 ns</b>. Past L2 and L3 the plateaus climb into the tens of nanoseconds, and past the last cache, DRAM
          costs roughly <b>50</b>–<b>100 ns</b>: a hundredfold span top to bottom. The working-set size where the curve climbs is the capacity
          you just measured, not one you looked up.
        </>
      ),
      duration: 4.2,
      Visual: S.StaircasePlateaus,
    },
    {
      title: 'Predict: cost per access as the stride grows',
      body: <>Walk a set larger than cache, touching one item every stride bytes, and grow the stride from a few bytes past a cache line. What does the cost per access do?</>,
      duration: 1.8,
      predict: {
        options: [
          { label: 'It stays flat throughout' },
          { label: 'It climbs, then flattens', correct: true },
          { label: 'It falls, then climbs' },
          { label: 'It oscillates' },
        ],
        explain: (
          <>
            It climbs, then flattens: below the line size several touches share one transfer, and once the stride reaches the line, every touch
            needs its own. For 64-bit keys, a 64-byte line holds 8 of them, and that stride is the knee.
          </>
        ),
      },
      Visual: S.StridePredict,
    },
    {
      title: 'A prefetcher can hide the knee',
      body: (
        <>
          A real chip guesses the next line and fetches it early. One common guesser also grabs the neighbouring line, which can make a 64-byte
          line look <b>128</b> bytes wide in a naive sweep. The honest fix: visit the strided addresses in random order, or report the knee with
          the prefetcher named.
        </>
      ),
      duration: 4,
      Visual: S.PrefetcherCaveat,
    },
    {
      title: 'A second miss, hiding underneath',
      body: (
        <>
          Every access first translates a virtual page to a physical one, and that translation is cached in the TLB: its <b>reach</b> is the
          entry count times the page size. A <b>4 KiB</b> page and a larger huge page trade granularity for reach, and striding across more
          pages than the TLB holds steps the latency up again, independent of the data caches.
        </>
      ),
      duration: 4.2,
      Visual: S.TlbReach,
    },
    {
      title: 'Sequential vs random tells the prefetcher apart',
      body: (
        <>
          Walk the same footprint two ways: sequential addresses let the prefetcher learn the pattern and stay flat even far past the last cache;
          a random cycle defeats it and the full staircase returns. The gap between the two curves is the prefetcher&rsquo;s contribution, and
          nothing else.
        </>
      ),
      duration: 4,
      Visual: S.SequentialVsRandom,
    },
    {
      title: 'Predict: why would the clock still spike?',
      body: <>A million appends that double give just over a million element copies in total, about 1.05 per append on average. Yet one single append can still stall far longer than the rest. Why?</>,
      duration: 2,
      predict: {
        options: [
          { label: 'The count was wrong' },
          { label: 'A count is not a time; one resize can copy into cold memory', correct: true },
          { label: 'The doubling rule stops working at scale' },
          { label: 'Appends are never actually equal cost' },
        ],
        explain: (
          <>
            A count is not a time. The one resize near the end copies hundreds of thousands of elements, and if that copy spills into slower
            memory, each element costs far more nanoseconds than one that stayed in cache. The potential proof bounds the work; the staircase
            prices it.
          </>
        ),
      },
      Visual: S.ClockSpikePredict,
    },
    {
      title: 'Back to the vector: count and clock agree',
      body: (
        <>
          You proved the doubling vector&rsquo;s cost in copies; now you have measured the machine that turns those copies into nanoseconds. The
          shape of the staircase transfers to any machine; the exact numbers belong only to the one you measured.
        </>
      ),
      duration: 3.6,
      Visual: S.Verdict,
    },
  ],
};

export default reel;
