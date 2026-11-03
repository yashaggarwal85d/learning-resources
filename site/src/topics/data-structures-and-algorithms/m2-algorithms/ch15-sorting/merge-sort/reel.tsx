import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: the merge procedure's own comparison bound; top-down and bottom-up merge
// sort, equal at a power-of-two size and sometimes not otherwise; stability shown and
// broken by one character; three real buffer refinements; natural (run-adaptive) merging;
// the worst case checked by brute force against the information-theoretic bound. Every
// number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "Insertion sort is optimal on tiny or nearly sorted input and hopeless on a million random keys: its cost is the number of inversions, and a random array has about a quarter of n squared of them. A sort that stays near n log n on every input has to do something quite different: split the array, sort the halves, and put them back together in one linear pass. The next topic is that algorithm, and it is the one that comes closest to the information-theoretic bound. Merge sort, next.",
      body: <>Merge two sorted lists of eight keys each. How many comparisons does it take? It depends entirely on how the keys interleave.</>,
      duration: 3.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Merging the keys one through eight with the keys nine through sixteen: how many comparisons?',
      body: <>One list is entirely smaller than the other. Think about what that does to the two pointers.</>,
      duration: 2.5,
      fig: 'PredictMergeBest',
      predict: {
        options: [
          { label: 'Sixteen — every key from both lists gets compared once' },
          { label: 'Fifteen — one fewer than the combined length' },
          { label: 'Eight — the left list is used up before the right is ever touched', correct: true },
          { label: 'It depends on which list is scanned first' },
        ],
        explain: (
          <>
            Every key in the first list loses to the smallest key in the second, one comparison each, and then the second list simply
            empties out with no comparisons left to make. The smaller list's own size is the floor on how cheap a merge can be.
          </>
        ),
      },
      Visual: S.PredictMergeBest,
    },
    {
      title: "The merge procedure: two pointers, one per sorted range, one comparison each step, the smaller key copied out and its own pointer advanced. A perfect interleaving of the identical two ranges costs one less than their combined length — the most a merge can ever cost.",
      body: <>Eight comparisons when one list empties first; fifteen when the two interleave perfectly. Nothing in between is possible.</>,
      duration: 4.5,
      fig: 'MergeProcedure',
      Visual: S.MergeProcedure,
    },
    {
      title: 'Top-down: split the range at its midpoint, sort each half by the identical rule, then merge what comes back — the recursion tree already named for its own recurrence, a merge at every node instead of nothing.',
      body: <>Every node of the tree is a merge of two already-sorted halves. The recursion is just how the two halves get built.</>,
      duration: 4,
      fig: 'TopDown',
      Visual: S.TopDown,
    },
    {
      title: 'Bottom-up reaches the identical sorted order with no recursion and no call stack at all: merge every adjacent pair of width-one runs, then every adjacent pair of width-two runs, doubling the width until one run is left.',
      body: <>No function ever calls itself. One pass at width one, one at width two, one at width four — the same merges, built the other way round.</>,
      duration: 4.5,
      fig: 'BottomUp',
      takeaway: 'Top-down recurses to build the merge order; bottom-up sweeps fixed widths to the identical result.',
      Visual: S.BottomUp,
    },
    {
      title: "At a power-of-two size, every split both strategies make lands exactly in half, so their comparison counts match exactly. Off a power of two, top-down's recursive midpoint and bottom-up's fixed doubling can split some of the smaller merges differently — and the counts can differ.",
      body: <>Sixteen keys: the two strategies agree, every time. Some other sizes: they can land on different counts for the identical keys.</>,
      duration: 4,
      fig: 'PowerOfTwo',
      Visual: S.PowerOfTwo,
    },
    {
      title: "A merge takes the left key on a tie — that single rule is the entire proof that merge sort is stable. Change that one comparison from taking-the-left-or-equal to taking-the-left-only-when-strictly-smaller, and two equal keys can come out in the opposite order they went in.",
      body: <>Two equal keys, tagged so their own order can be told apart: the ordinary merge keeps them in order; the one-character change does not.</>,
      duration: 4.5,
      fig: 'StabilityDemo',
      takeaway: "A merge's own stability lives in one comparison: take the left key on a tie, not the right.",
      Visual: S.StabilityDemo,
    },
    {
      title: 'Does a comparison sort exist that is stable, sorts in place with no extra array, and always costs n log n in the worst case — all three guarantees at once?',
      body: <>Merge sort already has two of the three. Think about what the third would actually cost it.</>,
      duration: 2.5,
      fig: 'PredictThreeGuarantees',
      predict: {
        options: [
          { label: 'Yes — a well-written merge sort already gives all three' },
          { label: 'No real comparison sort gives all three at once', correct: true },
          { label: 'Yes, but only for a sorted or nearly sorted input' },
          { label: 'Only if the keys are all distinct' },
        ],
        explain: (
          <>
            Every real sort gives up exactly one of the three. Merge sort keeps its guarantee and its stability, and pays for both with a
            second array — the one guarantee it does not make is being in place.
          </>
        ),
      },
      Visual: S.PredictThreeGuarantees,
    },
    {
      title: "The buffer, three ways: the simple version copies the whole input range on every merge; the usual refinement copies only the left half, since the right half and the output can share the original array's own space; Timsort's own refinement copies only whichever run is shorter, which can be smaller still.",
      body: <>Full copy, half copy, shorter-run copy — three real amounts of spare memory for the identical guarantee.</>,
      duration: 4.5,
      fig: 'BufferStrategies',
      Visual: S.BufferStrategies,
    },
    {
      title: "Natural merge sort does not split blindly: it finds the runs an input already has — maximal ascending stretches — in one linear pass, and merges adjacent runs pairwise until one remains. Already-sorted input is one single run, and nothing is ever merged at all.",
      body: <>One pass finds the runs. Sorted input is one run from end to end; nothing after that pass has anything left to do.</>,
      duration: 4.5,
      fig: 'NaturalMergeSort',
      takeaway: 'A natural merge sort adapts to the runs an input already has; a plain merge sort never looks for them.',
      Visual: S.NaturalMergeSort,
    },
    {
      title: "Five shapes, five very different run counts: a random input has close to half as many runs as it has keys; sorted input has exactly one; reversed input has exactly as many runs as keys, the worst case for a detector that only looks for ascending stretches.",
      body: <>Random, sorted, reversed — the identical run-finding pass, three wildly different outcomes.</>,
      duration: 4.5,
      fig: 'FiveShapes',
      Visual: S.FiveShapes,
    },
    {
      title: "Checked against every possible input at small sizes, not assumed: merge sort's own worst case lands exactly one comparison above the information-theoretic floor at eight keys, and about five percent above it at a thousand and twenty-four — and that gap never grows faster than the input itself.",
      body: <>Brute force over every arrangement of up to eight keys confirms the exact worst case; the gap to the floor stays a small, bounded fraction of the input as it grows far larger.</>,
      duration: 4.5,
      fig: 'WorstCaseGap',
      Visual: S.WorstCaseGap,
    },
    {
      title: "Merge sort guarantees n log n comparisons and keeps equal keys in order, and it pays for both with a second array. There is a second way to divide: do the splitting first, by choosing a key and moving everything smaller to one side and everything larger to the other, and then the two halves never have to be merged at all. That version works in the array it was given, and on random input it is usually the fastest of all, with one weakness that decides how it is built. Quicksort and partitioning schemes, next.",
      body: <>A guarantee, stability, and a second array to pay for both of them. The next sort gives up the guarantee and gets the array back.</>,
      duration: 4,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
