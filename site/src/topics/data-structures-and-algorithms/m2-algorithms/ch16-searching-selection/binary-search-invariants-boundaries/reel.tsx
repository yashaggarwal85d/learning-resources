import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: the half-open range convention and its loop invariant; lower_bound/upper_bound
// and the first/last-occurrence and count questions built from them; the 2006 midpoint-overflow
// bug, reproduced on a small fixed-width integer, not asserted; termination by invariant and the
// exact iteration bound. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "A file ten times the size of memory is sorted at the cost of a handful of passes over the disk, and the price is worth paying because of what a sorted sequence makes cheap: finding one key in a million takes about twenty steps if the keys are in order, and a million if they are not. That search is binary search, one of the shortest algorithms in the course and one of the easiest to get wrong, and the next chapter starts there. Binary search invariants and boundaries, next.",
      body: <>A million sorted keys. How many steps to find one — or learn for certain it isn't there?</>,
      duration: 3.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'On an array of 1,000,000 keys, present or absent, how many comparisons does binary search need in the worst case?',
      body: <>Every comparison throws away half of what's left. Think about how many halvings a million keys survives.</>,
      duration: 2.5,
      fig: 'PredictMillion',
      predict: {
        options: [
          { label: '20 — ⌈log₂(n + 1)⌉ at n = 1,000,000', correct: true },
          { label: '1,000,000 — one comparison per key' },
          { label: 'About 500,000 — half the array, on average' },
          { label: '19 — ⌈log₂(1,000,000)⌉' },
        ],
        explain: (
          <>
            Each comparison halves the range that's left, and a million keys can only be halved so many times before nothing
            remains: twenty halvings bring it to zero. The exact count is ⌈log₂(n + 1)⌉, not ⌈log₂ n⌉ — the "+1" matters at
            exact powers of two.
          </>
        ),
      },
      Visual: S.PredictMillion,
    },
    {
      title: 'Every range in this topic is written as a half-open interval [lo, hi): lo is always a candidate, hi is always one past the last candidate, and the loop invariant is kept at the top of every iteration — the answer, if it exists, lies in [lo, hi). A closed [lo, hi] version needs a fiddlier termination check, lo > hi instead of just lo == hi.',
      body: <>lo is always a candidate. hi is always one past the last one. The empty range is just lo == hi.</>,
      duration: 4,
      fig: 'HalfOpenInvariant',
      Visual: S.HalfOpenInvariant,
    },
    {
      title: 'lower_bound is the first index with a[i] >= x; upper_bound is the first index with a[i] > x — the same loop with one comparison flipped. First and last occurrence of a key, and the count of a key, all reduce to one or both of them: on three equal 3s, lower_bound lands on the first, upper_bound one past the last, and their difference is the count.',
      body: <>Three equal keys. lower_bound finds the first of them; upper_bound finds one past the last.</>,
      duration: 4.5,
      fig: 'FourQuestions',
      takeaway: 'lower_bound and upper_bound are the same loop with one comparison flipped; first/last occurrence and count are both built from them.',
      Visual: S.FourQuestions,
    },
    {
      title: 'A key that is absent entirely from the array: what do lower_bound and upper_bound return, and how do the two relate to each other?',
      body: <>Think about what "the first index not smaller than x" and "the first index strictly greater than x" mean when no element equals x at all.</>,
      duration: 2.5,
      fig: 'PredictAbsent',
      predict: {
        options: [
          { label: 'Both return the same index — the first position a larger value would go', correct: true },
          { label: 'upper_bound returns one more than lower_bound, as with a present key' },
          { label: 'lower_bound returns -1 to signal absence' },
          { label: 'They land exactly two indices apart' },
        ],
        explain: (
          <>
            With no element equal to x, "not less than x" and "greater than x" pick out the identical boundary: the first
            position where something larger than x would have to go. The two functions only disagree by more than zero when
            x is actually present.
          </>
        ),
      },
      Visual: S.PredictAbsent,
    },
    {
      title: "The naive midpoint, (low + high) / 2, shipped in Bentley's Programming Pearls and in the JDK's own Arrays.binarySearch — written by the engineer, Joshua Bloch, who later found the bug in his own code. Once low + high exceeds the maximum value a fixed-width signed integer can hold, the sum wraps negative, and the bug sat unnoticed for about nine years before it broke someone's program and was reported.",
      body: <>One line, shipped by its own author, broken for nine years before anyone noticed.</>,
      duration: 4.5,
      fig: 'TheBug',
      Visual: S.TheBug,
    },
    {
      title: 'The identical overflow, reproduced on an eight-bit signed integer so the wraparound lands on indices small enough to read by hand: 70 + 90 = 160 exceeds the eight-bit signed maximum of 127, wraps to −96, and the naive midpoint comes out negative, −48, an out-of-bounds index. The safe line, low + ((high − low) / 2), never sums two large values and gives the correct 80.',
      body: <>70 and 90 are both perfectly valid indices. Their sum, on an eight-bit integer, is not.</>,
      duration: 5,
      fig: 'ReproducedOverflow',
      takeaway: 'The safe midpoint never sums two large values; the naive one always does.',
      Visual: S.ReproducedOverflow,
    },
    {
      title: 'Every iteration either returns or strictly shrinks hi − lo, since lo <= mid < hi whenever lo < hi: the range width can only fall, never stay put or rise, and it starts at n. That proves termination by itself — at most ⌈log₂(n + 1)⌉ iterations, twenty for a million keys, checked directly against every possible target, not assumed.',
      body: <>Twelve, then six, then three, then one, then zero. Every step strictly smaller — that alone proves it ends.</>,
      duration: 4.5,
      fig: 'ProvingItEnds',
      takeaway: 'A loop invariant that strictly shrinks the range is itself a termination proof, with no need to run it.',
      Visual: S.ProvingItEnds,
    },
    {
      title: "Binary search as built here answers one kind of question: is the candidate at this index too small, too big, or the boundary itself. The next topic asks the identical loop a very different-looking question — not an array lookup, but any yes-or-no test that flips exactly once as a parameter grows. Binary search on the answer, next.",
      body: <>The half-open range, the overflow-safe midpoint, the iteration bound — three habits that carry into every search that follows.</>,
      duration: 4,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
