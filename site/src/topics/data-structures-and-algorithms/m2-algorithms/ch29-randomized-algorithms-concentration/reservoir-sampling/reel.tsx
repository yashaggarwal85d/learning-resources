import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: Algorithm R (keep k, replace with probability k/n), its induction proof,
// Algorithm L's skip-based speedup, weighted sampling by Efraimidis's key construction (named
// "A-ES" in the one fetched source for it, not the chapter plan's unconfirmed "A-Res"), and the
// merge of two reservoirs. Every number is in examples.py: a small exact case, a million-item
// stream against a hundred-item reservoir, a four-light-one-heavy weighted example, and a
// seven-against-three merge.

const reel: Reel = {
  steps: [
    {
      title: 'A log of unknown length is flowing past, and there is memory for a thousand lines. The sample kept must give every line in the whole file exactly the same chance of being in it.',
      body: <>Unknown length, fixed memory, every line equally likely.</>,
      duration: 4.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'When a new line arrives, with what probability should it replace something already in the sample?',
      body: <>One half, a fixed small number, k over n, or one over n.</>,
      duration: 2.5,
      fig: 'PredictReplaceProbability',
      predict: {
        options: [
          { label: 'One half, every time' },
          { label: 'A fixed small number' },
          { label: 'k over n, where n is lines seen so far', correct: true },
          { label: 'One over n' },
        ],
        explain: (
          <>
            k over n is the only rule that keeps every line, early or late, equally likely — and it shrinks as the
            stream grows, which a fixed rule never does.
          </>
        ),
      },
      Visual: S.PredictReplaceProbability,
    },
    {
      title: 'Algorithm R: keep the first k items. For every item after that, draw a number uniformly from one through how many items have been seen, and if it lands at k or below, replace that slot.',
      body: <>Keep the first k, then replace a slot with shrinking probability.</>,
      duration: 4.5,
      fig: 'AlgorithmR',
      Visual: S.AlgorithmR,
    },
    {
      title: 'By induction: if every item was uniformly in the reservoir after n items, then after the next item each survivor’s probability multiplies by one minus a shrinking fraction, and the product telescopes to exactly k over n plus one.',
      body: <>Each step’s survival probability telescopes to k over n.</>,
      duration: 5,
      fig: 'CorrectnessInvariant',
      Visual: S.CorrectnessInvariant,
    },
    {
      title: 'Sampling with probability k over n needs knowing n in advance, which a stream never gives up front. Keeping only the first k is not uniform. Replacing a random slot with probability one half is not either.',
      body: <>Three tempting rules, three different ways to be wrong.</>,
      duration: 4.5,
      fig: 'WrongVersions',
      takeaway: 'Needing n in advance, or a fixed rule, both break uniformity in a different way.',
      Visual: S.WrongVersions,
    },
    {
      title: 'A million items with a reservoir of a hundred costs one random draw for every item after the hundredth — nine hundred ninety-nine thousand, nine hundred draws, every one of them touching the stream.',
      body: <>Every item after the first k costs one random draw.</>,
      duration: 4,
      fig: 'AlgorithmRCost',
      Visual: S.AlgorithmRCost,
    },
    {
      title: 'Can an algorithm stay exactly uniform while touching fewer than all n items?',
      body: <>No, every item must be examined; yes, by skipping ahead; only if the reservoir holds one item; only with extra memory.</>,
      duration: 2.5,
      fig: 'PredictCanSkip',
      predict: {
        options: [
          { label: 'No, every item must be examined' },
          { label: 'Yes, by skipping ahead to the next replacement', correct: true },
          { label: 'Only if the reservoir holds one item' },
          { label: 'Only with extra memory' },
        ],
        explain: (
          <>
            The number of items skipped before the next replacement follows a known distribution, so that count can
            be drawn directly instead of testing every item along the way.
          </>
        ),
      },
      Visual: S.PredictCanSkip,
    },
    {
      title: 'Algorithm L draws the skip length itself from a geometric distribution, then jumps straight to the next item that enters the reservoir — three random numbers for every item that enters, nothing spent on the rest.',
      body: <>Draw the skip directly; touch only items that actually enter.</>,
      duration: 4.5,
      fig: 'AlgorithmL',
      Visual: S.AlgorithmL,
    },
    {
      title: 'At the same million-item scale, a seeded run of Algorithm L makes a few thousand draws against Algorithm R’s hundreds of thousands — on the order of k times one plus the log of n over k, not n minus k.',
      body: <>A few thousand draws against hundreds of thousands.</>,
      duration: 4.5,
      fig: 'SkipMeasured',
      Visual: S.SkipMeasured,
    },
    {
      title: 'The skip saves random draws either way, but on a stream read item by item it saves only that — the reading itself still happens one item at a time. Only an indexed, seekable source lets the skip save the reads too.',
      body: <>Saves random draws always; saves reads only when the source can seek.</>,
      duration: 4.5,
      fig: 'WhatSkipBuys',
      takeaway: 'A skip saves generating randomness; it saves reading only where reading can itself jump ahead.',
      Visual: S.WhatSkipBuys,
    },
    {
      title: 'A reservoir can also sample by weight, favoring some items over others. What does an item’s weight actually mean here?',
      body: <>Probability of being in the final sample, probability at each draw, both the same, or only rank matters.</>,
      duration: 2.5,
      fig: 'PredictWeightMeaning',
      predict: {
        options: [
          { label: 'The probability the item ends up in the final sample' },
          { label: 'The probability it is picked at each individual draw', correct: true },
          { label: 'Both, since they are always the same thing' },
          { label: 'Neither; only each item’s rank matters' },
        ],
        explain: (
          <>
            Those two readings genuinely differ once more than one item is sampled, and the key construction coming
            up fixes which one it means.
          </>
        ),
      },
      Visual: S.PredictWeightMeaning,
    },
    {
      title: 'Each item draws a key: a uniform random number raised to the power of one over its own weight. The sample is the k items whose keys are largest, held in a min-heap of size k.',
      body: <>Key equals a uniform draw raised to one over the weight; keep the largest keys.</>,
      duration: 5,
      fig: 'WeightedKeys',
      Visual: S.WeightedKeys,
    },
    {
      title: 'Four items of equal weight and one item ten times as heavy, sampling two: the heavy item is kept nearly every time, not by the naive share of the total weight doubled — that guess is not even a valid probability.',
      body: <>The heavy item dominates, far past what a naive weight share predicts.</>,
      duration: 5,
      fig: 'WeightedExample',
      takeaway: 'Weighted means proportional at each draw, not proportional in the final share — they differ once k exceeds one.',
      Visual: S.WeightedExample,
    },
    {
      title: 'Two uniform reservoirs merge into one by sending each output slot to the larger stream’s reservoir more often, in proportion to how many items that stream actually saw — so a reservoir without its own count cannot be merged. A real range partitioner carries exactly that count with every sample it takes.',
      body: <>Merging needs each reservoir’s own stream length, not just its sample.</>,
      duration: 5,
      fig: 'MergeAndProduction',
      Visual: S.MergeAndProduction,
    },
    {
      title: 'A reservoir answers one question: give me k items, each equally likely, from a stream read exactly once. Its cousin wants every item, in an order where every ordering is equally likely.',
      body: <>One pass, one proof, equally likely items — next, equally likely orderings.</>,
      duration: 4.5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
