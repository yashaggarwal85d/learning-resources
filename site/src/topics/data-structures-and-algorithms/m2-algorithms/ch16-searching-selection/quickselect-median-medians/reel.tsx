import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: quickselect's partition-and-discard mechanics, measured against a full
// sort; its adversarial worst case, the same fact Chapter 15's unguarded quicksort
// showed; median-of-medians' guaranteed worst-case discard fraction, verified by direct
// counting, and its real, measured cost; introselect's textbook answer against the
// answer this machine's own installed standard library actually gives. Every number is
// in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "Every search this chapter has built has assumed order already exists somewhere to exploit — in an array, in the answer space, split across a rotation or a matrix's two axes. The next question has none: finding the k-th smallest element of an unsorted collection, as fast as possible, without paying to sort the rest.",
      body: <>Find the median of a million numbers. Sorting them all first answers a question nobody asked.</>,
      duration: 3.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'On a million random keys, does finding the median by quickselect take roughly n comparisons, n log n comparisons, or n squared comparisons, in the typical case?',
      body: <>One rank is wanted, not a full ranking of every element.</>,
      duration: 2.5,
      fig: 'PredictComparisons',
      predict: {
        options: [
          { label: 'Roughly a small constant times n — most of the array is discarded every round', correct: true },
          { label: 'Roughly n log n, the same as a full sort' },
          { label: 'Roughly n squared, since every element must be checked against every other' },
          { label: 'It depends entirely on whether the input is already sorted' },
        ],
        explain: (
          <>
            Each partition discards the side that cannot contain the target rank, so the work shrinks geometrically
            round to round — a small constant times n in total, not n log n. Sorting pays for the rank of every
            element; quickselect pays only for the one rank asked for.
          </>
        ),
      },
      Visual: S.PredictComparisons,
    },
    {
      title: "Quickselect partitions around a pivot, exactly as quicksort does, but recurses into only the side that contains the target rank — the other side is discarded outright, never sorted, never visited again. Finding the median of a million random keys this way costs a small constant times n comparisons, against n log n for a full sort of the same keys.",
      body: <>One partition, one side kept, the other thrown away for good.</>,
      duration: 4.5,
      fig: 'Quickselect',
      takeaway: 'Sorting answers a question nobody asked — the rank of every element — when only one rank was wanted.',
      Visual: S.Quickselect,
    },
    {
      title: 'An adversarial or always-unlucky pivot — the first element, on data that is already sorted — degrades quickselect to the same quadratic blow-up unguarded quicksort suffered: each partition shrinks the range by only one element instead of roughly half, so the work adds up like a triangle, not a shrinking geometric sum.',
      body: <>The same bad pivot, the same bad bound — this chapter has seen this exact failure before.</>,
      duration: 4,
      fig: 'WorstCase',
      Visual: S.WorstCase,
    },
    {
      title: "Median-of-medians: split into groups of five, sort each tiny group, take each group's median, then recursively find the median of those group-medians and use that as the pivot. At least three in ten elements are provably smaller than that pivot, and at least three in ten are provably larger — so at most seven in ten survive to the next round, worst case, not merely on average.",
      body: <>A guaranteed fraction discarded every round — not usually, not on average, every time.</>,
      duration: 5,
      fig: 'MedianOfMedians',
      takeaway: 'Median-of-medians buys a worst-case guarantee quickselect never had — the same trade heapsort made against quicksort.',
      Visual: S.MedianOfMedians,
    },
    {
      title: "The constant hidden inside that worst-case linear bound is large enough — sorting every group of five, two recursive calls every round instead of one — that median-of-medians measurably loses to ordinary randomised quickselect on the same everyday input. A worst-case guarantee, bought at a real and measurable price.",
      body: <>Same input, same target rank: the algorithm with the better worst-case guarantee does more work.</>,
      duration: 4,
      fig: 'WhyNobodyUsesIt',
      takeaway: 'A worst-case guarantee bought at a real constant-factor cost is still a cost — measured, not assumed.',
      Visual: S.WhyNobodyUsesIt,
    },
    {
      title: 'A third option trades neither way: take a small random sample first, use it to estimate two bounds around the target rank, and split the whole array against those two bounds in a single pass before finishing with ordinary quickselect on only the much smaller band left over. Averaged over several random inputs, this measurably beats plain randomised quickselect on the same inputs.',
      body: <>A small sample first, to narrow the range, before the usual partition even starts.</>,
      duration: 4.5,
      fig: 'FloydRivest',
      Visual: S.FloydRivest,
    },
    {
      title: 'A real standard library promises a worst-case bound for exactly this operation. Does it actually fall back to median-of-medians to deliver that guarantee?',
      body: <>The textbook fix is well known. Does the library you actually call use it?</>,
      duration: 2.5,
      fig: 'PredictLibrary',
      predict: {
        options: [
          { label: 'Not necessarily — some standard libraries use a different, faster-worst-case-looking fallback instead', correct: true },
          { label: 'Yes, every C++ standard library uses median-of-medians as the fallback' },
          { label: 'No standard library provides any worst-case guarantee at all' },
          { label: 'Standard libraries never implement introselect in any form' },
        ],
        explain: (
          <>
            Musser's own 1997 introselect falls back to median-of-medians, but most real C++ standard library
            implementations use a different fallback (a heap-based selection) instead, trading a slightly worse
            worst-case bound for lower overhead — checked directly against this machine's own installed library.
          </>
        ),
      },
      Visual: S.PredictLibrary,
    },
    {
      title: "Musser's own 1997 introselect: run quickselect, and only switch to median-of-medians once the recursion depth passes a bound proportional to log n, keeping quickselect's good average case while still guaranteeing linear worst-case time. But reading this machine's own installed standard library header directly shows its actual fallback is a heap-based selection, not median-of-medians at all — the textbook algorithm and the one actually shipped have quietly diverged.",
      body: <>The textbook names one fallback. The library installed on this machine uses a different one.</>,
      duration: 5,
      fig: 'Introselect',
      takeaway: "The algorithm in the textbook and the algorithm in your standard library's header are not always the same algorithm.",
      Visual: S.Introselect,
    },
    {
      title: 'Every algorithm this chapter has built answers a question about one value — a key, a boundary, an order statistic — in time that scales with the logarithm of n, or, for selection, with n itself. The next chapter leaves arrays behind: not a value to find, but a structure to explore, node by node. Breadth-first search, next.',
      body: <>One key, one boundary, one rank — every answer in this chapter has been a single value. Next: a structure to explore.</>,
      duration: 4,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
