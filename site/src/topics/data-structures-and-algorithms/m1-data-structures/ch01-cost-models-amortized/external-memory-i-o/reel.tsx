import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The word-RAM charged one unit per access regardless of where the data sat; once the vector
// outgrows memory, the real cost is block transfers between a fast level and a slow one.
// Running example: the 1 GiB vector of 64-bit keys. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'What the word-RAM hid',
      body: (
        <>
          Our vector has grown to a <b>1 GiB</b> array of 64-bit keys and no longer fits in the memory the program is given. The word-RAM charged
          one unit for every access, whether the item was already there or had to travel in from disk. That fiction just broke.
        </>
      ),
      duration: 3.6,
      Visual: S.Problem,
    },
    {
      title: 'Predict: sorted sweep vs random visit',
      body: (
        <>
          Visit <b>1,000,000</b> keys of the vector two ways: one sweep in sorted order, then the same keys in random order. The disk moves data
          in blocks of <b>512</b> keys. How do the two block-transfer counts compare?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'About the same either way' },
          { label: 'The sweep costs about 512 times fewer transfers', correct: true },
          { label: 'The random visit is cheaper' },
          { label: 'Both cost one transfer per key' },
        ],
        explain: (
          <>
            The sweep rides the blocks, about one transfer per 512 keys; the random visit lands each key in its own block, about one transfer per
            key. Same work, a factor of 512 apart: the whole reason this cost model exists.
          </>
        ),
      },
      Visual: S.SweepVsRandomPredict,
    },
    {
      title: 'The model: Aggarwal and Vitter, 1988',
      body: (
        <>
          Aggarwal and Vitter&rsquo;s model has exactly two levels: a bounded fast store that holds <b>M</b> items, and an unbounded slow one that
          only ever moves whole blocks of <b>B</b> items. Nothing is charged for touching data already resident; the meter runs only when a block
          crosses that boundary.
        </>
      ),
      duration: 3.4,
      Visual: S.ModelIntro,
    },
    {
      title: 'Three numbers describe the job',
      body: (
        <>
          <b>N</b> items in the problem, <b>M</b> that fit in memory, <b>B</b> per block. Our vector: N = <b>134,217,728</b> keys, M ={' '}
          <b>8,388,608</b> keys, B = <b>512</b> keys.
        </>
      ),
      duration: 3.6,
      Visual: S.ThreeNumbers,
    },
    {
      title: 'A scan touches every block once',
      body: (
        <>
          Reading every item once touches each of <b>N / B = 262,144</b> blocks exactly once, all sequential. It is the floor for anything that
          must look at all the data.
        </>
      ),
      duration: 3.2,
      Visual: S.ScanBound,
    },
    {
      title: 'Search costs log base B, not log base two',
      body: (
        <>
          A binary search over sorted blocks costs about <b>log₂ N = 27</b> probes. But one block holds B keys, so one transfer rules out a whole
          <b> 1/B</b> share of the range: the search costs <b>log<sub>B</sub> N = 3</b> transfers instead.
        </>
      ),
      duration: 3.8,
      Visual: S.SearchBound,
    },
    {
      title: 'Predict: how many passes to sort it?',
      body: <>Phase one leaves N / M = 16 sorted runs behind, and a single merge can absorb up to M / B = 16,384 of them at once. Tally every pass the sort makes, start to finish: what's the total?</>,
      duration: 2,
      predict: {
        options: [{ label: '1' }, { label: '2', correct: true }, { label: '4' }, { label: '16' }],
        explain: (
          <>
            Two: one pass writes the 16 runs, and a single merge pass swallows all 16 at once, since the fan-in of 16,384 dwarfs them. Run
            formation, then one merge.
          </>
        ),
      },
      Visual: S.SortPassesPredict,
    },
    {
      title: 'The sort bound is a pass count',
      body: (
        <>
          Each merge keeps one block from about <b>M / B</b> runs in memory at once, so every pass cuts the run count by that fan-in. The fan-in
          sits in the thousands, which is why almost every realistic sort finishes in two or three passes; a two-way merge of the same 16 runs
          would instead need <b>4</b> passes.
        </>
      ),
      duration: 4,
      Visual: S.PassCountExplain,
    },
    {
      title: 'Count the same sort twice',
      body: (
        <>
          By comparisons, sorting the vector does about N·log₂N ≈ <b>3.6 billion</b> of them. By block transfers, it does about{' '}
          <b>524,288</b>, the two scans above. On real hardware, the clock follows the transfers, because one block off a disk costs more than
          thousands of comparisons in memory.
        </>
      ),
      duration: 4.2,
      Visual: S.CountTwice,
    },
    {
      title: 'Repricing the doubling vector',
      body: (
        <>
          A resize is a scan in disguise: it rewrites the whole current contents in one pass. Add every resize together and the copied items stay
          under <b>2N</b>, keeping total movement near <b>2N / B</b> blocks plus a handful of partial-block reads at the edges. Spread across N
          appends, each one owes only about <b>1/B</b> of a block transfer: the same O(1) amortized result, now in the model&rsquo;s own currency.
        </>
      ),
      duration: 4.4,
      Visual: S.DoublingVectorRepriced,
    },
    {
      title: 'The same model at every boundary',
      body: (
        <>
          At the disk boundary, a block is a page of <b>512</b> keys. At the CPU-cache boundary, a block is a <b>64</b>-byte cache line, just{' '}
          <b>8</b> keys, and M becomes the cache size. Only M and B change; the counting is identical at every level.
        </>
      ),
      duration: 3.8,
      Visual: S.EveryLevel,
    },
    {
      title: 'Predict: lookups vs sort-then-scan',
      body: <>Picture a hash table too big to fit in memory, N records deep, and probe every single one of them in turn. Set that transfer count against first sorting the whole table and sweeping it once instead.</>,
      duration: 1.8,
      predict: {
        options: [
          { label: 'About the same either way' },
          { label: 'About N transfers, versus a few passes of N / B', correct: true },
          { label: 'Lookups are always cheaper' },
          { label: 'Neither depends on B' },
        ],
        explain: (
          <>
            About N transfers for the lookups, since each lands in its own block; sorting first costs only a couple of passes of about N / B.
            Sorting first wins by a factor close to B, which is why engines sort or partition before probing one at a time.
          </>
        ),
      },
      Visual: S.LookupPredict,
    },
    {
      title: 'Predict: does it stay two passes forever?',
      body: <>Hold N and B steady, but let the dataset balloon well beyond anything memory could hold. Is two passes a ceiling the sort can outgrow, or does it hold forever?</>,
      duration: 1.6,
      predict: {
        options: [
          { label: 'Yes, always two' },
          { label: 'No, but it stays small for a long way', correct: true },
          { label: 'No, it grows with every doubling of N' },
          { label: 'It depends only on B' },
        ],
        explain: (
          <>
            No, but the pass count only ticks up once the run count, N / M, first exceeds the fan-in, M / B: the moment memory starts to matter,
            long after the data stopped fitting in it.
          </>
        ),
      },
      Visual: S.GrowthPredict,
    },
    {
      title: 'The honest caveat: measure the constant',
      body: (
        <>
          The model counts transfers; it does not hand you nanoseconds. Device latency, bandwidth and prefetching set the constant, so the count
          predicts the shape of the cost, and the measurement sets the rest. Every level of the hierarchy has its own M and B.
        </>
      ),
      duration: 3.6,
      Visual: S.Verdict,
    },
  ],
};

export default reel;
