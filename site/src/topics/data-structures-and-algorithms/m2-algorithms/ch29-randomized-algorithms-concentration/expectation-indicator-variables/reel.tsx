import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A refresher: linearity of expectation (any random variables, no independence needed) and the
// indicator variable, on three worked uses the syllabus names — the expected number of fixed
// points of a random permutation, randomized quicksort's expected comparisons (a second
// derivation of the number the chapter-one topic already found by recurrence), and the coupon
// collector. Every number is in examples.py: quicksort's exact closed form at three sizes, the
// coupon-collector draws, the fixed-point simulations, and an urn example showing linearity
// holding across visibly dependent draws.

const reel: Reel = {
  steps: [
    {
      title: 'Randomized quicksort picks pivots by coin flip, so its cost is a different number every run. On a thousand keys the exact expectation is computed in one line, with no recurrence, and a simulation of two hundred runs lands close to it.',
      body: <>A thousand keys, one exact number, no recurrence.</>,
      duration: 4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Is the expected number of comparisons closer to n times log base two of n, two n times the natural log of n, or n squared over four?',
      body: <>n log base two n, two n ln n, n squared over four, or n log base two n plus n.</>,
      duration: 2.5,
      fig: 'PredictGrowthOrder',
      predict: {
        options: [
          { label: 'n times log base two of n' },
          { label: 'Two n times the natural log of n', correct: true },
          { label: 'n squared over four' },
          { label: 'n log base two n, plus n' },
        ],
        explain: (
          <>
            Two n times the natural log of n is the right order of growth. The exact count has a correction on top
            of it, coming up next.
          </>
        ),
      },
      Visual: S.PredictGrowthOrder,
    },
    {
      title: 'The tool underneath every result here: the expectation of a sum is the sum of the expectations, for any random variables at all, whether or not they depend on each other. Two draws from an urn without replacement are visibly dependent, and the rule still holds.',
      body: <>Expectation adds, dependent or not — an urn without replacement proves it.</>,
      duration: 5,
      fig: 'LinearityUrn',
      Visual: S.LinearityUrn,
    },
    {
      title: 'An indicator variable is zero or one, standing for one event: its expectation is exactly that event’s probability. Write a count as a sum of indicators, and linearity turns the whole count into a sum of probabilities.',
      body: <>Zero or one, one event, expectation equals probability.</>,
      duration: 4,
      fig: 'IndicatorVariable',
      Visual: S.IndicatorVariable,
    },
    {
      title: 'A random permutation has, on average, exactly one fixed point — every time, for every size. One indicator per position, each with the same small probability, summed by linearity, however those positions depend on each other.',
      body: <>One indicator per position; the sum is exactly one, always.</>,
      duration: 4.5,
      fig: 'FixedPointsReveal',
      takeaway: 'Linearity does not care whether the indicators depend on each other.',
      Visual: S.FixedPointsReveal,
    },
    {
      title: 'Rank the keys first through last. Two ranked elements are ever compared exactly when the first pivot chosen among everything ranked between them lands on one of those two elements themselves.',
      body: <>Compared only if one of the pair is the first pivot between them.</>,
      duration: 4.5,
      fig: 'QuicksortPairSetup',
      Visual: S.QuicksortPairSetup,
    },
    {
      title: 'Summing that probability over every pair gives the exact expected comparison count, and it answers the earlier predict: close to two n ln n, but with a correction that is visible and exact, not approximate.',
      body: <>Every pair’s probability, summed, is the exact count.</>,
      duration: 5,
      fig: 'QuicksortSumReveal',
      Visual: S.QuicksortSumReveal,
    },
    {
      title: 'An earlier topic already found this exact number by solving a recurrence on the algorithm’s own recursive structure. This is the second way to reach it, needing only a probability per pair, and the two numbers agree.',
      body: <>Same number, reached without the recurrence.</>,
      duration: 4,
      fig: 'SecondDerivation',
      Visual: S.SecondDerivation,
    },
    {
      title: 'Draw coupons with replacement until every one has been seen. Split the wait into phases, one per new coupon: each phase is a geometric wait, and linearity adds their expectations into one harmonic sum.',
      body: <>Phase by phase, each a geometric wait, summed by linearity.</>,
      duration: 4.5,
      fig: 'CouponCollectorReveal',
      takeaway: 'The same harmonic sum keeps appearing: pivots, coupons, and a hash table’s buckets.',
      Visual: S.CouponCollectorReveal,
    },
    {
      title: 'An expectation is an average over every possible run, not a promise about the one run in front of you. It says nothing about how far a single run can land from that average, or how often.',
      body: <>An average over every run, not a guarantee about one run.</>,
      duration: 4,
      fig: 'WhatLinearityLacks',
      takeaway: 'An average is not a guarantee; a tail bound is a different tool entirely.',
      Visual: S.WhatLinearityLacks,
    },
    {
      title: 'Three different messy counts — fixed points, comparisons, coupon draws — each became a sum of probabilities, and linearity never once needed the pieces to be independent.',
      body: <>One rule, three counts, no independence required anywhere.</>,
      duration: 4.5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
