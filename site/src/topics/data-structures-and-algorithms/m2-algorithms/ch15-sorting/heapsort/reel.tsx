import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Heapsort. A refresher: the two ideas from Chapter 6 (linear build, sift-down) run in
// sequence, measured against quicksort's own worst case and against the bound neither
// sort reaches. Every count is exact and asserted in examples.py; the introsort depth
// limit is named from three real systems' own source, not reimplemented.

const reel: Reel = {
  steps: [
    {
      title: 'Quicksort is usually the fastest of the comparison sorts, and every one of its improvements, a random pivot, a median of three, a depth counter, exists because of one fact: with an unlucky pivot every time, it takes quadratic time, and an adversary can arrange that. A production sort cannot promise n log n on every input unless something stands behind the quicksort. There is a sort that gives that promise outright, in place, with no spare array: it uses the heap from Chapter six. Heapsort, next.',
      body: <>A crafted input can still drive quicksort to quadratic time. Every production quicksort promises n log n anyway.</>,
      duration: 4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'On random keys, heapsort uses about how many times the minimum number of comparisons?',
      body: <>1,024 random keys. The information-theoretic floor is 8,770 comparisons. How far above it does heapsort land?</>,
      duration: 2.5,
      fig: 'PredictRatio',
      predict: {
        options: [
          { label: 'About the same, within a few percent' },
          { label: 'About two times the floor', correct: true },
          { label: 'About ten times the floor' },
          { label: 'Below the floor — heapsort beats the bound' },
        ],
        explain: (
          <>
            17,316 against 8,770: almost exactly double. Two comparisons per level, times about ten levels, on
            every key moved — that's the whole story, and it doesn't change much with the input.
          </>
        ),
      },
      Visual: S.PredictRatio,
    },
    {
      title: "Build the max-heap: Chapter 6's linear bottom-up build, run here again. Sift every non-leaf down, from the last one to the root. Measured directly: 1,887 comparisons to build the heap of 1,024 keys.",
      body: <>Every parent at least as large as its children, built bottom-up in one linear pass — nothing new, Chapter 6's own method.</>,
      duration: 4,
      fig: 'BuildHeap',
      Visual: S.BuildHeap,
    },
    {
      title: 'Swap, shrink, sift: pull the root to the end of the live range, shrink the heap by one, sift the new root down. Repeat until the heap is empty — the sorted suffix grows where the heap shrinks, no second array anywhere.',
      body: <>The maximum leaves the heap and lands exactly where it belongs. No second array ever appears.</>,
      duration: 4.5,
      fig: 'SwapShrinkSift',
      Visual: S.SwapShrinkSift,
    },
    {
      title: 'The cost, on three shapes: measured directly on 1,024 keys, random 17,316 comparisons, sorted 18,060, reversed 16,407 — all within a fifth of each other.',
      body: <>Random, sorted, reversed: three very different inputs, three almost identical counts.</>,
      duration: 4,
      fig: 'ThreeShapes',
      takeaway: 'Heapsort is not adaptive: its cost barely moves between the easiest and hardest input shapes.',
      Visual: S.ThreeShapes,
    },
    {
      title: 'Against the bounds: the information-theoretic minimum at 1,024 keys is 8,770 comparisons; heapsort lands at about twice that on every shape measured, and above merge sort’s own worst case of 9,217.',
      body: <>Two comparisons per level, about ten levels: a real bound, just not a tight one.</>,
      duration: 4.5,
      fig: 'AgainstBounds',
      Visual: S.AgainstBounds,
    },
    {
      title: "Poor locality: a sift-down from the root of a heap of a million keys walks about 20 nodes, each one farther from the last in memory than the one before. Measured directly: that path touches 17.9 distinct 64-byte cache lines on average, where a sequential scan of the same 20 keys would touch about 3.",
      body: <>Index i, then roughly 2i. Twenty steps down, almost twenty different cache lines.</>,
      duration: 5,
      fig: 'CacheLines',
      takeaway: 'The branchy, scattered access pattern is why heapsort loses to quicksort and merge sort on real machines.',
      Visual: S.CacheLines,
    },
    {
      title: 'Unstable, in place: the tagged deck, three keys tied at 3, heapsort’s root-to-end swaps reorder them. Input order a, c, f becomes c, a, f — no stability promise survives a sift-down. In place: no second array, O(1) extra memory beyond the input.',
      body: <>Three keys tied at the same value, traced through the sort. Their order does not survive it.</>,
      duration: 4,
      fig: 'Unstable',
      Visual: S.Unstable,
    },
    {
      title: "Its role as the fallback: quicksort's own worst case is still quadratic on an adversarial input; the fix three real systems share is a depth counter on the recursion, and when it crosses a bound proportional to lg n, the current range is finished by heapsort instead. libstdc++'s introsort loop falls back to a heap sort at depth limit zero; the JDK's DualPivotQuicksort calls its own heapSort once a partitioning-round counter crosses its own fixed bound; Rust's unstable sort passes its own quicksort a limit of 2 times floor(log2(len)), falling back the same way.",
      body: <>Three real sorts, one shared idea: count the recursion, and hand the dangerous range to heapsort before it turns quadratic.</>,
      duration: 5.5,
      fig: 'IntrosortFallback',
      takeaway: "A production sort's worst-case guarantee usually isn't a cleverer quicksort — it's a depth counter backed by heapsort.",
      Visual: S.IntrosortFallback,
    },
    {
      title: 'Heapsort completes the set of comparison sorts built from scratch: quicksort for speed, heapsort for the worst case, merge sort for stability and the guarantee. But every one of them starts from nothing, as if the input were random. Real data rarely is: it arrives with stretches already in order, and a sort that notices them can finish in a fraction of the work. One family of sorts is built around exactly that observation, and two real libraries had to repair the same bug in it. Timsort, Powersort and driftsort, next.',
      body: <>Speed, a worst-case guarantee, stability: three sorts, three different prices. None of them has looked at the input's own order yet.</>,
      duration: 4.5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
