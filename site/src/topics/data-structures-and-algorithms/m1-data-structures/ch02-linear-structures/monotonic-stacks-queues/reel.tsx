import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: a stack or queue costs what you'd expect, one operation at a time. Keep one extra
// invariant on what it's allowed to hold (stay monotonically decreasing), and a whole run amortizes
// to O(n) for a reason that has nothing to do with resizing. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Opening',
      body: (
        <>
          A plain stack or queue costs what you'd expect, one operation at a time. Keep one extra invariant on what it's allowed to hold, and
          a whole run amortizes to O(n) for a reason that has nothing to do with resizing.
        </>
      ),
      duration: 3,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'The problem',
      body: (
        <>
          Next-greater-element: for each bar, find the next bar to its right that's taller. Scan right from every bar and it's &Theta;(n&sup2;)
          on a strictly decreasing run &mdash; nothing to the right is ever taller.
        </>
      ),
      duration: 3.4,
      fig: 'Problem',
      Visual: S.Problem,
    },
    {
      title: 'The invariant',
      body: (
        <>
          Keep a stack monotonically decreasing, bottom to top. Before pushing the current bar, pop everything shorter &mdash; each pop just
          found its next-greater element: the bar about to be pushed.
        </>
      ),
      duration: 3.6,
      fig: 'Invariant',
      Visual: S.Invariant,
    },
    {
      title: "What's on the stack right before 6 is pushed?",
      body: <>Scanning [5, 3, 4, 2, 6] left to right. Right before 6 is pushed, what does the stack hold, and who already has an answer?</>,
      duration: 1.8,
      fig: 'StackPredict',
      takeaway: 'Only pops have found their answer so far; everything still on the stack is still waiting, in decreasing order.',
      predict: {
        options: [
          { label: '5, 4, 2 (bottom to top); only 3 has an answer so far', correct: true },
          { label: '5, 3, 4, 2; none has an answer yet' },
          { label: '5, 4, 2; all four already have answers' },
          { label: 'Just 2; everything else already popped' },
        ],
        explain: (
          <>
            4 popped 3 on arrival, so 3 already knows its answer is 4. Nothing else has popped yet &mdash; 5, 4 and 2 are still sitting on the
            stack, still waiting, bottom to top.
          </>
        ),
      },
      Visual: S.StackPredictViz,
    },
    {
      title: 'Why O(n)',
      body: (
        <>
          Every bar is pushed exactly once and popped at most once, over the whole scan. Total push-and-pop work is O(n) no matter how the pops
          cluster &mdash; the aggregate method, applied to an invariant instead of a resize schedule.
        </>
      ),
      duration: 4,
      fig: 'WhyLinear',
      takeaway: "Every element is pushed once and popped at most once — the whole scan is O(n), never O(n²).",
      Visual: S.WhyLinear,
    },
    {
      title: 'Sliding-window maximum, the problem',
      body: (
        <>
          A window of fixed width k slides across the bars; report the max in every window. Rescanning each window costs O(n&middot;k) &mdash;
          most of each scan repeats work the last one already did.
        </>
      ),
      duration: 3.4,
      fig: 'WindowProblem',
      Visual: S.WindowProblem,
    },
    {
      title: 'The monotonic deque',
      body: (
        <>
          Same decreasing invariant, now at both ends: pop the back for anything smaller than the bar just added, pop the front for any index
          that's aged out of the window. The front is always the current window's max.
        </>
      ),
      duration: 4,
      fig: 'MonotonicDeque',
      takeaway: "The deque drops smaller tails before adding, and expired heads before reading — the front is always the window's max.",
      Visual: S.MonotonicDeque,
    },
    {
      title: "What's in the deque once the window reaches [-1, -3, 5]?",
      body: <>Window width 3 over [1, 3, -1, -3, 5]. The instant the window first covers [-1, -3, 5], what does the deque hold?</>,
      duration: 1.8,
      fig: 'DequePredict',
      predict: {
        options: [
          { label: 'Just the index holding 5 — it outranks everything still in range', correct: true },
          { label: 'Indices for -1, -3 and 5, in that order' },
          { label: 'Indices for 3 and 5 only' },
          { label: 'All five original elements, oldest first' },
        ],
        explain: (
          <>
            5 arrives and pops every smaller bar still in the deque &mdash; -3, -1 and 3 all lose to it in turn, in one scan step. Only 5's
            own index is left, and it's the window's max.
          </>
        ),
      },
      Visual: S.DequePredictViz,
    },
    {
      title: 'The two idioms compared',
      body: (
        <>
          Chapter 1 amortized over a resize schedule set in advance &mdash; grow by a fixed factor. This chapter amortizes over an invariant
          enforced on every single operation: stay decreasing. Same aggregate method, a different thing being bounded.
        </>
      ),
      duration: 4,
      fig: 'Compared',
      takeaway: 'Chapter 1 amortized over a resize schedule; this chapter amortizes over an invariant enforced on every single operation.',
      Visual: S.Compared,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Next-greater-element and sliding-window maximum, run against brute force on the same inputs: identical answers, every time. Total
          push-and-pop work stays within 2n as n climbs from a hundred to a hundred thousand.
        </>
      ),
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
