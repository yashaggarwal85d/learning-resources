import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: reframing a feasibility question as a monotone predicate over the answer
// space; a non-monotone predicate shown giving a confidently wrong boundary, not a slow
// one; real-valued bisection and its exact, predicate-cost-independent iteration count;
// parametric search, named from Megiddo's own framing. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Binary search as written here only ever asks one kind of question: is the key at this index too small, too big, or found. The same loop answers a very different-looking question if the thing being tested is not an array lookup but any yes/no test that flips exactly once as a parameter increases: can this courier finish the route by this hour, is this capacity enough. The loop does not change; only what counts as the predicate does. Binary search on the answer, next.',
      body: <>Five packages, two trips. What is the smallest truck capacity that fits all of them?</>,
      duration: 3.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "A packing feasibility check — does this capacity need at most this many trips — is monotone in capacity, so binary search on it is safe. What happens if a caller hands binary search a predicate that isn't actually monotone?",
      body: <>The search doesn't check its own precondition. Think about what it does when that precondition is false.</>,
      duration: 2.5,
      fig: 'PredictMonotone',
      predict: {
        options: [
          { label: 'It still runs to completion and returns an answer, with no warning that anything is wrong', correct: true },
          { label: "It detects the problem and raises an error" },
          { label: 'It runs forever, since the range never narrows' },
          { label: 'It always returns the first element of the range' },
        ],
        explain: (
          <>
            The loop only ever looks at the predicate's value at one midpoint per iteration — it has no way to notice a
            false appearing after a true somewhere else in the range. It terminates, and it returns something, with exactly
            the same confidence whether the predicate was monotone or not.
          </>
        ),
      },
      Visual: S.PredictMonotone,
    },
    {
      title: 'The candidate space is now capacities, not array indices; the predicate is "is this capacity enough," checked by a greedy packing pass instead of a comparison. The half-open range, the loop invariant and the overflow-safe midpoint all carry over from the previous topic unchanged — only what counts as the predicate is different.',
      body: <>lo and hi are now capacities. mid is a capacity to test, not an index to read.</>,
      duration: 4.5,
      fig: 'Reframe',
      Visual: S.Reframe,
    },
    {
      title: "A genuinely non-monotone predicate — true, false, true, true, false — handed to the identical loop: the loop still terminates and returns index two, confidently. But the array's first true position is index zero, which the search never even examines, because the loop's own correctness proof assumes a single boundary that this predicate doesn't have.",
      body: <>The search isn't slow here. It's simply answering a question that doesn't have the kind of answer it assumes.</>,
      duration: 5,
      fig: 'BrokenPrecondition',
      takeaway: "Binary search on a non-monotone predicate doesn't fail loudly — it returns a wrong answer, confidently.",
      Visual: S.BrokenPrecondition,
    },
    {
      title: 'The same idea over a continuous range instead of integers: there is no "next" real number to converge to exactly, so the loop stops at a precision bound instead of an empty range. Bisecting for the square root of two, narrowing from one and two toward one point four one four two.',
      body: <>Narrower, narrower, narrower — stopped not by an empty range, but by "close enough."</>,
      duration: 4.5,
      fig: 'RealValuedBisection',
      Visual: S.RealValuedBisection,
    },
    {
      title: 'Halve the required precision — does the number of iterations double, stay the same, or something else entirely?',
      body: <>Think back to the halving argument from the previous topic. What does halving a bound again actually cost?</>,
      duration: 2.5,
      fig: 'PredictDoubling',
      predict: {
        options: [
          { label: 'One more iteration, not twice as many', correct: true },
          { label: 'Twice as many iterations' },
          { label: 'The same number of iterations' },
          { label: 'It depends on the predicate being bisected' },
        ],
        explain: (
          <>
            Each iteration halves the remaining span regardless of how small ε already is, so reaching a span half the
            previous target's size costs exactly one additional halving — one more iteration, the identical relationship
            topic fifty-five found for array sizes.
          </>
        ),
      },
      Visual: S.PredictDoubling,
    },
    {
      title: 'The iteration count to reach a given precision on a real-valued range is the ceiling of log base two of the span divided by epsilon — the identical halving argument from the previous topic, now over a continuous range, and completely indifferent to how expensive the predicate itself is to evaluate.',
      body: <>The formula never mentions what's being tested. Only how far apart the two ends started, and how close is close enough.</>,
      duration: 4,
      fig: 'IterationCountIndependent',
      takeaway: "Doubling the precision costs exactly one more iteration — the halving argument doesn't care what's being halved.",
      Visual: S.IterationCountIndependent,
    },
    {
      title: "Megiddo's own framing, from 1983: a decision procedure — does a value at least this good exist — composed with an outer binary search over candidate values gives an optimisation procedure that finds the best one. Every worked example in this topic has been an instance of exactly this pattern, which Megiddo himself notes is not always the fastest route to a given answer, only often the best known one for harder problems.",
      body: <>A decision test plus an outer search. That's the whole pattern, named.</>,
      duration: 4.5,
      fig: 'ParametricSearch',
      takeaway: 'A decision procedure plus an outer binary search gives an optimisation algorithm: not always fastest, often the best known.',
      Visual: S.ParametricSearch,
    },
    {
      title: "Every search in this chapter so far has assumed that order already exists to exploit, whether in an array or in the answer space. The next topic's order is hidden in a different way — a rotated array, or a matrix sorted two different ways — and the first job is recognising which invariant actually applies before any loop can be written at all. Search in rotated and sorted matrices, next.",
      body: <>The answer space, the precision bound, parametric search — three ideas that travel together into whatever comes next.</>,
      duration: 4,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
