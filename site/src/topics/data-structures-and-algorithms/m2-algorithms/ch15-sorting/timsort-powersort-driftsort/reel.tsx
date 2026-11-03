import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Timsort, Powersort and driftsort. A full topic: run detection and minrun, galloping
// merges, the 2015 Timsort invariant bug (reproduced from the JDK's own mergeCollapse
// loop), CPython 3.11's Powersort merge policy, Stefan Pochmann's 2025 minrun
// refinement, and driftsort as Rust's stable sort since 1.81. Every count is exact and
// asserted in examples.py; driftsort's exact mechanism is named, not reimplemented.

const reel: Reel = {
  steps: [
    {
      title: 'Heapsort completes the set of comparison sorts built from scratch: quicksort for speed, heapsort for the worst case, merge sort for stability and the guarantee. But every one of them starts from nothing, as if the input were random. Real data rarely is: it arrives with stretches already in order, and a sort that notices them can finish in a fraction of the work. One family of sorts is built around exactly that observation, and two real libraries had to repair the same bug in it. Timsort, Powersort and driftsort, next.',
      body: <>In 2015, a team trying to prove Java's sort never crashes found an input that crashes it.</>,
      duration: 4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Run lengths 120, 80, 25, 20 and 30 sit on the stack; the code merges 25 and 20 and stops. Is the invariant "each run is longer than the sum of the next two" still true for 120?',
      body: <>One merge happens. Does the rule that was true before still hold everywhere after?</>,
      duration: 2.5,
      fig: 'PredictInvariant',
      predict: {
        options: [
          { label: 'Yes — the merge only touches the bottom of the stack' },
          { label: 'No — 120 is not longer than 80 + 45', correct: true },
          { label: 'Yes — the rule is checked after every merge' },
          { label: 'Not enough information to tell' },
        ],
        explain: (
          <>
            The merge checks only the top three entries it touches, 80, 45 and 30. It never looks back at
            120, and after the merge, 120 is no longer longer than 80 plus 45 — the invariant has silently
            broken one level further down than the check ever looks.
          </>
        ),
      },
      Visual: S.PredictInvariant,
    },
    {
      title: "Run detection: scan for the next non-decreasing stretch, or a strictly decreasing one, reversed in place. CPython's own worked example: a 3-element descending prefix reverses to an ascending run, then extends seamlessly into the ascending keys right after it.",
      body: <>A descending prefix reverses in place and keeps going, right into the ascending keys after it.</>,
      duration: 4.5,
      fig: 'RunDetection',
      Visual: S.RunDetection,
    },
    {
      title: 'Minrun and binary insertion sort: a run shorter than minrun is boosted up to minrun by a stable binary insertion sort. On random data, this makes every run close to minrun long, which is good for balanced merges.',
      body: <>A short run gets topped up to minrun by binary insertion sort before anything merges it.</>,
      duration: 4,
      fig: 'Minrun',
      Visual: S.Minrun,
    },
    {
      title: "Picking minrun, the old way: CPython's pre-2025 scheme measured directly on N=2,112, the one case the library's own file names — picking 33 instead of 32 avoids an unbalanced tail merge.",
      body: <>At N=2,112, minrun 32 leaves an unbalanced tail. Minrun 33 doesn't.</>,
      duration: 4,
      fig: 'MinrunChoice',
      Visual: S.MinrunChoice,
    },
    {
      title: 'Galloping: once one side wins repeatedly, switch from one-pair-at-a-time to searching exponentially, then binary search the last gap. Measured directly: galloping first strictly beats linear search at i=6, and MIN_GALLOP is set to 7, just past where it starts reliably paying off.',
      body: <>A winning streak triggers a search instead of one comparison at a time.</>,
      duration: 4.5,
      fig: 'Galloping',
      takeaway: "Galloping only pays off on long winning streaks; CPython's own threshold sits just past the measured crossover.",
      Visual: S.Galloping,
    },
    {
      title: 'Is there a case where galloping costs more comparisons than linear search ever would?',
      body: <>Galloping is supposed to help. Does it ever cost more than just comparing one pair at a time?</>,
      duration: 2.5,
      fig: 'PredictBrokenLeg',
      predict: {
        options: [
          { label: 'No — galloping never costs more than linear search' },
          { label: 'Yes, but only on fully random data' },
          { label: 'Yes — a short winning streak triggered by chance can cost more', correct: true },
          { label: 'Yes, but only once the array is larger than a million keys' },
        ],
        explain: (
          <>
            If the winner belongs at B[2], linear search needs 3 comparisons; galloping needs 4 — a 33%
            increase, just to find the same answer. CPython's own name for this: "Galloping with a Broken Leg."
          </>
        ),
      },
      Visual: S.PredictBrokenLeg,
    },
    {
      title: 'The old merge-policy invariant: merging must stay on adjacent runs for stability, so the original Timsort kept each pending run bigger than the next two combined — the first thing that didn’t obviously suck, loosely based on Fibonacci growth, by CPython’s own words.',
      body: <>Bigger than the next two combined, loosely based on Fibonacci growth — by the author's own account.</>,
      duration: 4,
      fig: 'OldInvariant',
      Visual: S.OldInvariant,
    },
    {
      title: "Why the hook's merge breaks it: mergeCollapse only re-checks the invariant on the top three stack entries, exactly enough to miss what just happened one level further down. The paper's own smallest crashing counterexample: over 67 million elements; the same bug sat unfixed in Python since the method was introduced.",
      body: <>A check on three entries misses a break one level deeper. The real counterexample: 67 million elements.</>,
      duration: 5,
      fig: 'BugScale',
      takeaway: 'A local check on the top of a stack is not the same guarantee as a global invariant.',
      Visual: S.BugScale,
    },
    {
      title: "CPython 3.11: Powersort. A run pair's power is the depth, in an ideal merge tree, of the node joining them. Measured: runs of 40 and 40 have power 1; runs of 10 and 10 have power 3, and 10 and 60 have power 1. Confirmed from source: the changelog entry sits under the 3.11.0a1 heading, dated 2021-09-01.",
      body: <>A run pair's power is a tree depth, computed exactly, not approximated.</>,
      duration: 5,
      fig: 'Powersort',
      takeaway: "Powersort replaces a local, three-entry check with a globally correct rule computed exactly from where each run sits.",
      Visual: S.Powersort,
    },
    {
      title: "2025: Pochmann's minrun refinement. CPython's own current development branch describes a newer scheme: at every level of the merge tree, the number of runs is a power of 2, at most two run lengths appear, and they differ by at most one. Reproduced on CPython's own 315-element example.",
      body: <>At 315 elements, the old scheme gives one short run of 35. The new scheme spreads the shortfall evenly.</>,
      duration: 4.5,
      fig: 'Pochmann',
      Visual: S.Pochmann,
    },
    {
      title: "Driftsort, named: Rust's stable sort since 1.81, by Peters and Bergdoll. The documentation calls it quicksort's average case with mergesort's fast worst case and partial run detection; its own source allocates scratch memory as max(n/2, min(n, 8MB)) and falls back to mergesort, not heapsort, past its own depth limit.",
      body: <>Quicksort's average case, mergesort's worst case, named and sourced, not rebuilt here.</>,
      duration: 5,
      fig: 'Driftsort',
      Visual: S.Driftsort,
    },
    {
      title: 'Three things, learned once, keep showing up: detect what’s already there before doing new work; a merge policy is a promise that needs checking as carefully as the merge itself; and "the fast case" and "the worst case" are usually two different algorithms stitched together by one counter.',
      body: <>Detect what's already there. Check the promise as carefully as the merge. Stitch two algorithms with one counter.</>,
      duration: 4.5,
      fig: 'Recap',
      Visual: S.Recap,
    },
    {
      title: 'Timsort and its descendants get as close to optimal as comparison sorting allows, by noticing the order the data already has. They still compare keys, so the n log n floor still stands over them. The floor belongs to a model, though, and the model has a door in it: if the keys are integers, or can be turned into byte strings, you do not have to compare them at all, you can read them one digit at a time. Counting, radix and bucket sort, next.',
      body: <>Every sort so far pays per comparison. There's a way to pay per digit instead.</>,
      duration: 4,
      fig: 'Handoff',
      Visual: S.Handoff,
    },
  ],
};

export default reel;
