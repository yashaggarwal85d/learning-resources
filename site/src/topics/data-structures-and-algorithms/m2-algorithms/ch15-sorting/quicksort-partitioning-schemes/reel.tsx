import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: Lomuto vs Hoare partitioning; the stack-depth bound; randomized and
// median-of-three pivots, and a verified quadratic killer for the fixed median-of-three
// rule; three-way (Dutch national flag) partitioning; dual-pivot quicksort and branchless
// block partitioning named from their own primary sources. Every built number is in
// examples.py; dual-pivot and block partitioning are named, not reimplemented.

const reel: Reel = {
  steps: [
    {
      title: "Merge sort guarantees n log n comparisons and keeps equal keys in order, and it pays for both with a second array. There is a second way to divide: do the splitting first, by choosing a key and moving everything smaller to one side and everything larger to the other, and then the two halves never have to be merged at all. That version works in the array it was given, and on random input it is usually the fastest of all, with one weakness that decides how it is built. Quicksort and partitioning schemes, next.",
      body: <>Sorting a row of equal keys should take almost no work — there is nothing to move.</>,
      duration: 3.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Lomuto partitioning on 1,024 equal keys: roughly how many comparisons?',
      body: <>Every key equals the pivot. Think about what that does to the boundary index, one key at a time.</>,
      duration: 2.5,
      fig: 'PredictLomutoEqual',
      predict: {
        options: [
          { label: 'About 1,024 — one pass settles the whole range' },
          { label: 'About 10,240 — ten passes over the array' },
          { label: '523,776 — the range shrinks by only one key each round', correct: true },
          { label: 'Zero — equal keys need no comparisons at all' },
        ],
        explain: (
          <>
            Every key equals the pivot, so none of them ever counts as strictly smaller — the boundary never
            advances past the pivot itself, and the very next key becomes the new pivot. That is n(n − 1)/2 comparisons,
            the same cost as the worst case on any input.
          </>
        ),
      },
      Visual: S.PredictLomutoEqual,
    },
    {
      title: 'The partition contract: rearrange a range around a pivot so nothing on the left is larger and nothing on the right is smaller, then return the split. Every quicksort is this contract plus a rule for picking the pivot.',
      body: <>Everything below comes down to one choice: which key becomes the pivot, and how the range gets rearranged around it.</>,
      duration: 3.5,
      fig: 'PartitionContract',
      Visual: S.PartitionContract,
    },
    {
      title: 'Lomuto: one scan, a boundary index, the last element as pivot — simple, correct, about n comparisons, as many as n swaps.',
      body: <>Everything at or below the pivot swaps behind a single advancing boundary. Simple to write, simple to prove, and simple to defeat.</>,
      duration: 4,
      fig: 'Lomuto',
      Visual: S.Lomuto,
    },
    {
      title: 'Hoare: two indices walking inward from both ends, swapping out-of-place pairs, stopping on equal keys. On random input, measured directly: far fewer swaps than Lomuto, and an all-equal range splits at the middle instead of shrinking by one.',
      body: <>Two pointers close in from both sides instead of one sweeping across. An all-equal range splits evenly, not one key at a time.</>,
      duration: 4.5,
      fig: 'Hoare',
      takeaway: 'Stopping on equal keys lets an all-equal range split in half instead of shrinking by one.',
      Visual: S.Hoare,
    },
    {
      title: 'Recurse on the smaller side, loop on the larger: measured directly on sorted input, Lomuto’s own worst case for comparisons, the recursion depth stays at zero. The call stack never grows past O(log n), whatever the pivot turns out to be.',
      body: <>The comparison count can still be quadratic — but the stack itself stays shallow, because the small side is always the one that recurses.</>,
      duration: 4,
      fig: 'StackBound',
      takeaway: 'Recurse on the smaller side, loop on the larger: the stack stays O(log n) deep, whatever the pivot.',
      Visual: S.StackBound,
    },
    {
      title: "A random pivot's expected cost, 2(n + 1)H_n − 4n, measured directly by averaging many runs: the average lands within a tenth of a percent of the formula.",
      body: <>Expected over the coin flips, for every input — not a guarantee about any one run, but a guarantee about the average.</>,
      duration: 4,
      fig: 'RandomPivot',
      Visual: S.RandomPivot,
    },
    {
      title: "Median-of-three — the median of the first, middle and last keys — defeats sorted and reversed input cheaply. Measured directly, both stay far under a loose n log n ceiling.",
      body: <>Sorted and reversed input, the two shapes that break a fixed last-element pivot outright, both stay cheap here.</>,
      duration: 4,
      fig: 'MedianOfThree',
      Visual: S.MedianOfThree,
    },
    {
      title: 'Is there an input that defeats median-of-three the way sorted input defeats a last-element pivot?',
      body: <>Sorted and reversed input both failed to break it. Does that mean nothing can?</>,
      duration: 2.5,
      fig: 'PredictMo3Killer',
      predict: {
        options: [
          { label: 'No — sampling three points always finds something close to the true median' },
          { label: 'Yes, any sorted run, just a longer one' },
          { label: 'Yes, but it takes two sorted runs stitched together, not one', correct: true },
          { label: 'Yes, but only with duplicate keys' },
        ],
        explain: (
          <>
            A single ascending or descending run keeps first, middle and last in the relation median-of-three is built
            to handle. Two runs stitched together put the middle index inside whichever run it happens to land in,
            so the three sampled points miss the true median every time it matters.
          </>
        ),
      },
      Visual: S.PredictMo3Killer,
    },
    {
      title: 'The median-of-three killer: two ascending runs stitched together. Measured cost grows as a constant fraction of n² across a sixteen-fold range of sizes — a real quadratic blow-up, not merely a worse constant.',
      body: <>About a quarter of n squared, every time n doubles. This is why a depth limit or randomness rides along with quicksort in production, on top of any fixed pivot rule.</>,
      duration: 5,
      fig: 'Mo3Killer',
      Visual: S.Mo3Killer,
    },
    {
      title: 'Three-way (Dutch national flag) partitioning: three indices, one pass, everything equal to the pivot already done. Measured on four distinct values, Lomuto, Hoare and three-way fall sharply in that order; on random distinct keys with no duplicates to collapse, three-way does more swaps than Hoare.',
      body: <>Built for duplicates, and it shows: linear on all-equal keys, but not automatically the right default when there are none.</>,
      duration: 4.5,
      fig: 'ThreeWay',
      takeaway: 'No fixed pivot rule survives every input; that’s why quicksort still needs a depth limit or randomness in practice.',
      Visual: S.ThreeWay,
    },
    {
      title: "Dual-pivot quicksort: two pivots split the range into three parts. The real system is the JDK's own DualPivotQuicksort, read directly: a depth limit falling back to heapsort, a pre-check for existing runs, counting sort for small primitive types. What it buys in theory and in practice is stated only from what those papers themselves say.",
      body: <>Named from its own source and its own measured papers, not rebuilt here: a second real system with a second safety net.</>,
      duration: 5,
      fig: 'DualPivot',
      Visual: S.DualPivot,
    },
    {
      title: "Branchless block partitioning: a data-dependent branch on random input mispredicts about half the time. BlockQuicksort's own fix compares a fixed block of elements into a buffer first, then replays the swaps with no conditional branch on the outcome.",
      body: <>The comparison still happens — it just no longer decides which instruction runs next.</>,
      duration: 4.5,
      fig: 'BlockPartition',
      Visual: S.BlockPartition,
    },
    {
      title: 'Quicksort is usually the fastest comparison sort, and every improvement to it — randomness, median-of-three, a depth counter — exists because an unlucky pivot makes it quadratic, and an adversary can arrange that. There is a sort that gives the n log n promise outright, in place, with no spare array: it uses the heap from Chapter six. Heapsort, next.',
      body: <>Lomuto, Hoare and three-way, on the identical equal keys: a fifty-times gap between the slowest and the fastest, from one choice of rule.</>,
      duration: 4,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
