import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every structure in Chapters 3-7 answered "is this key here, and where" -- one key, one
// answer. This chapter asks what's true about a whole range of positions, right now, as
// individual positions keep changing. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "Every structure in Chapters 3 through 7 answered 'is this key here, and where' — one key, one answer. This chapter asks a different question about a changing array: what's true about positions i through j, right now, as individual positions keep getting updated?",
      body: (
        <>
          Scan the range for an answer and it costs O(n). Cache a running total and rebuild
          it after an update, and that costs O(n) too.
        </>
      ),
      duration: 4.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "A Fenwick tree stores, at index i, a partial sum whose own range is set by i's own lowest set bit — one array, no explicit tree, index arithmetic only.",
      body: <>Index 11 is 1011 in binary; its lowest set bit is 1. Index 8 is 1000; its lowest set bit is the whole value, 8.</>,
      duration: 4,
      fig: 'LowBitReveal',
      Visual: S.LowBitReveal,
    },
    {
      title: 'A point update at minute 5 has to fix every Fenwick slot whose own stored range includes minute 5. Over 15 slots, how many slots does one update actually touch?',
      body: <>How many of the 15 slots does updating minute 5 actually touch?</>,
      duration: 2,
      fig: 'UpdatePredict',
      predict: {
        options: [
          { label: "1 — only minute 5's own slot" },
          { label: '3 — one jump per step, walking forward by the lowest set bit', correct: true },
          { label: '15 — every slot downstream has to shift' },
          { label: '8 — half the array, on average' },
        ],
        explain: (
          <>
            Each jump adds the current index's own lowest set bit — three jumps land past
            the array and stop.
          </>
        ),
      },
      Visual: S.UpdatePredict,
    },
    {
      title: 'The real jump sequence: minute 5 (0101) adds its own lowest set bit to reach 6 (0110), adds again to reach 8 (1000), and stops there once the index runs past the array — three slots touched, not fifteen.',
      body: <>Each jump adds the current index's own lowest set bit.</>,
      duration: 4,
      fig: 'UpdateReveal',
      takeaway: 'A point update walks forward by its own lowest set bit — three slots touched here, not all fifteen.',
      Visual: S.UpdateReveal,
    },
    {
      title: 'A prefix-sum query through minute 11 jumps backward the same way, subtracting a lowest set bit each time instead of adding one. How many slots does it visit?',
      body: <>Does the query's own jump count match the update's three?</>,
      duration: 2,
      fig: 'QueryPredict',
      predict: {
        options: [
          { label: '3 — the same jump count as the update, by the same arithmetic', correct: true },
          { label: '11 — one slot per minute up to 11' },
          { label: '1 — the whole prefix is cached in one slot' },
          { label: '4 — one more jump than the update needed' },
        ],
        explain: (
          <>
            Three jumps again — not because update and query always match, but because
            these two particular indices do.
          </>
        ),
      },
      Visual: S.QueryPredict,
    },
    {
      title: "Minute 11 (1011) subtracts its own lowest set bit to reach 10 (1010), subtracts again to reach 8 (1000), and stops — the same three-slot walk, run backward.",
      body: <>Add the three visited slots' own stored partial sums and the running total through minute 11 falls out directly.</>,
      duration: 4,
      fig: 'QueryReveal',
      Visual: S.QueryReveal,
    },
    {
      title: 'A range sum from minute 5 through minute 11 needs exactly two of these queries — the prefix through 11, minus the prefix through 4 — and the same two-tree trick extends a single Fenwick tree to a range-wide update.',
      body: <>Two Fenwick trees together extend one query into a range-wide update.</>,
      duration: 5,
      fig: 'RangeReveal',
      takeaway: 'Any range sum costs exactly two prefix-sum queries; two Fenwick trees together extend that to a range-wide update.',
      Visual: S.RangeReveal,
    },
    {
      title: 'The same lowest-set-bit arithmetic extends along a second dimension. Does a 2D Fenwick tree need a genuinely new mechanism, or the same index jumps run twice?',
      body: <>Does a grid need a new mechanism, or the same jumps, nested?</>,
      duration: 2,
      fig: 'TwoDPredict',
      predict: {
        options: [
          { label: 'The same index jumps, nested along a second dimension', correct: true },
          { label: "A fundamentally different structure — the 1D trick doesn't extend" },
          { label: 'The same jumps, but only for square grids' },
          { label: 'A new structure that no longer needs lowest-set-bit arithmetic at all' },
        ],
        explain: <>One update/query loop run inside another, one per axis — no new arithmetic.</>,
      },
      Visual: S.TwoDPredict,
    },
    {
      title: "A 2D Fenwick tree updates and queries by jumping in two dimensions at once — the identical lowest-set-bit arithmetic, nested, on a grid measured directly: a 4-by-4 grid's own full prefix sum came out to 73, checked against a brute-force sum of every cell.",
      body: <>Named and measured at this small scale — the same mechanism carries to a larger grid.</>,
      duration: 4.5,
      fig: 'TwoDReveal',
      takeaway: 'A 2D Fenwick tree is the identical index-jump arithmetic, nested along a second dimension — not a new mechanism.',
      Visual: S.TwoDReveal,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Measured, not assumed: ten point updates and ten prefix-sum queries over this
          exact 15-slot array cost a naive cached running total 97 slot-touches in total —
          rebuilding every prefix at and after each updated index — against 47 for the
          Fenwick tree's own index jumps.
        </>
      ),
      duration: 4.5,
      fig: 'ProveIt',
      takeaway: 'Across the same updates and queries, the naive approach touched 97 slots; the Fenwick tree touched 47.',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
