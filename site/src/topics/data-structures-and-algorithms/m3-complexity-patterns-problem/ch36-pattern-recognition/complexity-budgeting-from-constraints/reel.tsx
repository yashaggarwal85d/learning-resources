import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: the first of the chapter's four reading skills, and the cheapest filter, because it
// uses nothing but the numbers already on the page. The budget table every competitive programmer
// carries, derived from a rule of thumb rather than memorised; the exception meeting in the middle
// buys; the correction a cache miss forces; and the four signal words that hint at a technique
// without ever proving one. Every count is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'A statement says n is at most a hundred thousand and the time limit is one second. The obvious double loop over every pair costs ten billion steps, about a hundred seconds on an ordinary machine. The limit has already answered the question, before the problem itself is even understood.',
      body: <>The limit alone rules out the double loop before the problem is read.</>,
      duration: 5,
      fig: 'DoubleLoopHook',
      Visual: S.DoubleLoopHook,
    },
    {
      title: 'The starting point for every such estimate is one fact: an ordinary modern machine performs on the order of a hundred million simple operations in a second. A time limit, multiplied by that rate, turns into a budget of operations — a number to compare an algorithm against before writing a line of it.',
      body: <>A time limit times that rate becomes a budget in operations.</>,
      duration: 4.5,
      fig: 'RuleOfThumb',
      Visual: S.RuleOfThumb,
    },
    {
      title: 'Predict: with n at a hundred thousand and a one second limit, which growth rate actually fits inside that budget — an algorithm that costs n squared operations, or one that costs n log n?',
      body: <>At that size and limit, does n squared fit, or only n log n?</>,
      duration: 4,
      fig: 'PredictBudgetFit',
      predict: {
        options: [
          { label: 'n squared fits comfortably inside a one second limit at that size' },
          { label: 'Only n log n fits; n squared costs about ten billion operations there', correct: true },
          { label: 'Neither fits; a problem at that size needs a constant-time algorithm' },
          { label: 'Both fit equally well, since the limit is generous at that size' },
        ],
        explain: (
          <>
            Only n log n fits. At a hundred thousand, n squared costs ten billion operations, roughly a hundred
            seconds at that rate — far over a one second limit. The same size, run through n log n instead, costs
            well under two million operations, comfortably inside it.
          </>
        ),
      },
      Visual: S.PredictBudgetFit,
    },
    {
      title: "That single division, repeated for every growth rate, is the whole table: n at ten allows a factorial amount of work; twenty allows two to the n; five hundred allows n cubed; five thousand allows n squared; a million allows n log n or better; and once n is large, only constant or logarithmic work fits. Nothing here is memorised — every row falls out of the same division.",
      body: <>One division, repeated for every growth rate, builds the whole table.</>,
      duration: 5.5,
      fig: 'BudgetTableDerived',
      takeaway: 'The budget table is not memorized. Every row is the same division, repeated once per growth rate.',
      Visual: S.BudgetTableDerived,
    },
    {
      title: 'A smaller input size does not just forbid algorithms, it can permit ones that were hopeless at a larger size. At n of forty, trying two to the n choices outright costs well over a trillion operations. Splitting the forty choices into two halves of twenty, and combining the two results, costs only two to the twenty per half — a few million, not a trillion.',
      body: <>Splitting into two halves of twenty turns a hopeless count into a cheap one.</>,
      duration: 5,
      fig: 'MeetInTheMiddle',
      takeaway: 'A smaller size does not just forbid algorithms. It can permit ones a larger size made hopeless.',
      Visual: S.MeetInTheMiddle,
    },
    {
      title: "The rule of thumb's hundred million operations a second quietly assumed every operation hits the cache. Near the top of the budget, around a hundred million elements, the work has to be one sequential pass — because a random access per element is a cache miss, and that assumption breaks. Measured directly: the same count of reads, done once in order and once in random order, and the random pass runs reliably slower.",
      body: <>The same read count, done at random instead of in order, measurably costs more.</>,
      duration: 5,
      fig: 'CacheFriendlyMeasured',
      takeaway: 'A random access per element breaks the rate the budget assumed — the work must be one sequential pass.',
      Visual: S.CacheFriendlyMeasured,
    },
    {
      title: 'Four words in a statement each hint at a technique, each checked here against a brute force on a small case: "sorted" points at binary search; "k-th" points at a heap; "all pairs" asks whether n squared is even affordable; "minimum maximum" points at binary search over the answer itself, a monotone predicate.',
      body: <>Four words, four techniques, each checked against a brute force.</>,
      duration: 5,
      fig: 'SignalWords',
      Visual: S.SignalWords,
    },
    {
      title: 'Predict: when an exact algorithm still fails to fit the budget, even at a small input size, and the input size looks deliberately kept small, is that only a statement about speed — or can it also be a signal about the problem itself?',
      body: <>When nothing exact fits even a small size, is that only about speed?</>,
      duration: 4,
      fig: 'PredictBudgetExit',
      predict: {
        options: [
          { label: 'Only about speed — a faster exact algorithm is always the fix' },
          { label: 'Also a signal that the problem itself may be hard, not just the algorithm', correct: true },
          { label: 'A sign the time limit was set incorrectly by the problem setter' },
          { label: 'A sign the input size itself was mistyped' },
        ],
        explain: (
          <>
            A deliberately small size paired with an exponential budget is often a tell that the problem is hard on
            purpose. When that is the case, the exit is not a faster exact algorithm — it is an approximation or a
            heuristic, accepting a weaker guarantee in exchange for fitting the budget at all.
          </>
        ),
      },
      Visual: S.PredictBudgetExit,
    },
    {
      title: 'A budget only ever rules algorithms out. Fitting inside it is a necessary condition, never a sufficient one — an algorithm that fits the budget can still be the wrong algorithm, computing the wrong answer quickly.',
      body: <>Fitting the budget says nothing about being correct.</>,
      duration: 4,
      fig: 'NecessaryNotSufficient',
      takeaway: 'A budget is a necessary condition on an algorithm, never a sufficient one.',
      Visual: S.NecessaryNotSufficient,
    },
    {
      title: "Three questions close every statement before an algorithm is chosen: what is n, and what are the values? What does the limit allow? What do the signal words point at? The budget says how much work is allowed. It says nothing about how to organise the data to do that work at all — that question is next.",
      body: <>Three questions on size and limit; next is organising the data itself.</>,
      duration: 5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
