import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: the sweep-line skeleton (events, active set, tie rule) generalized from the
// previous topic's depth sweep into a skyline (lazy-deletion max-heap), a rectangle union's
// area (cover-count sweep), and Bentley-Ottmann segment intersection (ordered active set,
// output-sensitive bound). Every number is in examples.py: five buildings, three rectangles,
// eight seeded segments, and a scaling set at n of fifty, two hundred and one thousand.

const reel: Reel = {
  steps: [
    {
      title: 'A thousand segments could cross in nearly half a million places, and a scan tests every pair. Eight segments have twenty-eight pairs, and only two of them cross.',
      body: <>Draw eight segments: twenty-eight pairs, two crossings.</>,
      duration: 4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'How many of the twenty-eight pairs does a sweep actually need to test, to find both crossings?',
      body: <>All twenty-eight, only pairs overlapping in x, only pairs that become neighbors, or half at random.</>,
      duration: 2.5,
      fig: 'PredictNeighborTests',
      predict: {
        options: [
          { label: 'All twenty-eight pairs' },
          { label: 'Pairs that overlap in x' },
          { label: 'Only pairs that become neighbors', correct: true },
          { label: 'Half, chosen at random' },
        ],
        explain: (
          <>
            Two segments can only cross after becoming adjacent in the sweep's vertical order, so only
            newly-adjacent pairs are ever tested. The skeleton that makes this precise, next.
          </>
        ),
      },
      Visual: S.PredictNeighborTests,
    },
    {
      title: 'The sweep skeleton: events are the only coordinates where the answer can change, and an active set holds what the line currently crosses between them. For each event in order, update the active set and record what changed.',
      body: <>Events, an active set, and one pass: update, then record.</>,
      duration: 4.5,
      fig: 'SweepSkeleton',
      Visual: S.SweepSkeleton,
    },
    {
      title: 'Tie-breaking at equal coordinates is where sweeps go wrong: with half-open intervals, an end is processed before a start at the same x, or an interval is wrongly counted as overlapping its neighbor.',
      body: <>End before start at a tie, or two touching intervals look like one overlap.</>,
      duration: 4,
      fig: 'TieBreakingBug',
      takeaway: 'Get the tie rule backwards and two merely-touching intervals register as overlapping.',
      Visual: S.TieBreakingBug,
    },
    {
      title: 'The skyline problem: given buildings as left edge, right edge and height, output the outline. Events are left and right edges; the active set is a max-heap of heights, with lazy deletion.',
      body: <>Five buildings, a max-heap of heights, lazy deletion.</>,
      duration: 4,
      fig: 'SkylineSetup',
      Visual: S.SkylineSetup,
    },
    {
      title: 'The skyline walk produces seven key points as the maximum in the heap changes. A monotonic deque, from an earlier chapter, handles a window of fixed order, not a heap of arbitrary expiry like this one.',
      body: <>Seven key points, one for every change in the running maximum.</>,
      duration: 4.5,
      fig: 'SkylineWalk',
      takeaway: 'A monotonic deque keeps a fixed window; lazy deletion keeps whatever is still genuinely live.',
      Visual: S.SkylineWalk,
    },
    {
      title: 'What structure holds the active set for the area of a rectangle union, updated at every left or right edge?',
      body: <>A running count, a cover-count segment tree, a rebuilt sorted array, or a hash set.</>,
      duration: 2.5,
      fig: 'PredictUnionAreaStructure',
      predict: {
        options: [
          { label: 'A single running count' },
          { label: 'A cover-count segment tree', correct: true },
          { label: 'A sorted array, rebuilt each event' },
          { label: 'A hash set of covered rows' },
        ],
        explain: (
          <>
            A count cannot say where coverage changes; a rebuilt array costs O(n) per event, not O(log n). A segment
            tree of cover counts over the compressed y-coordinates answers both in O(log n).
          </>
        ),
      },
      Visual: S.PredictUnionAreaStructure,
    },
    {
      title: 'Three rectangles sum to thirty-four in area; their union is twenty-nine. Victor Klee posed the one-dimensional version in nineteen seventy-seven; Jon Bentley extended it to this two-dimensional sweep the same year.',
      body: <>Sum thirty-four, union twenty-nine: five units of overlap removed by the sweep.</>,
      duration: 5,
      fig: 'UnionAreaReveal',
      Visual: S.UnionAreaReveal,
    },
    {
      title: 'Bentley–Ottmann reports every crossing among n segments: events are endpoints, known up front, plus crossings, discovered as the sweep proceeds. The active set is a balanced search tree ordered by height at the current sweep position.',
      body: <>Endpoints and discovered crossings as events; an ordered tree as the active set.</>,
      duration: 4.5,
      fig: 'BentleyOttmannSetup',
      Visual: S.BentleyOttmannSetup,
    },
    {
      title: 'The order of the tree is always the true vertical order at the sweep position, and two segments can only cross after becoming neighbors in it, so every crossing is found before the sweep reaches it.',
      body: <>Only newly-adjacent pairs are ever tested, and none is missed.</>,
      duration: 4,
      fig: 'CorrectnessInvariant',
      takeaway: 'The order is always true, and a crossing always arrives between neighbors first.',
      Visual: S.CorrectnessInvariant,
    },
    {
      title: 'If the number of crossings k grows as large as n squared, does a sweep costing n plus k, times log n, still beat an all-pairs scan costing n squared?',
      body: <>Always faster, slower once k reaches n squared, only for small n, or always equal.</>,
      duration: 2.5,
      fig: 'PredictCrossoverPoint',
      predict: {
        options: [
          { label: 'Yes, always faster' },
          { label: 'No, the log factor makes it slower', correct: true },
          { label: 'Only for small n' },
          { label: 'The two are always exactly equal' },
        ],
        explain: (
          <>
            At k on the order of n squared, (n plus k) times log n carries an extra log factor over the plain n
            squared of the scan, so the scan wins exactly when crossings are that dense.
          </>
        ),
      },
      Visual: S.PredictCrossoverPoint,
    },
    {
      title: 'Scaling up: at n of fifty, two hundred and a thousand sparse segments, crossings grow to three, five and forty-eight, while the pairs a scan would test grow to twelve hundred, nineteen thousand and near half a million.',
      body: <>Crossings stay small; the pairs a scan would test do not.</>,
      duration: 5,
      fig: 'ScalingCurve',
      takeaway: 'The output-sensitive bound only pays off when the answer itself stays small.',
      Visual: S.ScalingCurve,
    },
    {
      title: 'The one geometric primitive this needs is the sign of a cross product, exact on integer coordinates, deciding which side of a segment a point falls on. Shared endpoints, three segments through one point, or floating-point coordinates all break it.',
      body: <>One sign test, exact on integers, broken by ties and by rounding error.</>,
      duration: 4.5,
      fig: 'GeometricPrimitive',
      Visual: S.GeometricPrimitive,
    },
    {
      title: 'DuckDB IEJoin sorts two tables on one inequality, merges the sort keys, then sorts the combined positions on a second inequality — the same sort-the-endpoints idea, one layer down in a query engine.',
      body: <>A real database sorts on two conditions instead of sweeping a line.</>,
      duration: 4,
      fig: 'DuckDBIEJoin',
      takeaway: 'Sorting the endpoint order once is a query-engine trick too, not only a geometry one.',
      Visual: S.DuckDBIEJoin,
    },
    {
      title: 'One skeleton — events, an active set, a tie rule — produced a skyline, a union area and every segment crossing, each with its own active-set structure. Every bound here was a promise about every possible input.',
      body: <>One skeleton, three active-set structures, three different problems solved.</>,
      duration: 4.5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
