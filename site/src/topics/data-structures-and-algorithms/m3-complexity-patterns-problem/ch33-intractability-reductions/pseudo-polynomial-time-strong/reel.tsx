import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: why knapsack's O(n·W) dynamic program is pseudo-polynomial (polynomial in the
// value of the numbers, exponential in the number of bits it takes to write them), why that
// escape is unavailable to bin packing (strongly NP-hard, by reduction from three-partition),
// and the one-line argument for why a strongly NP-hard problem has no pseudo-polynomial
// algorithm at all unless P equals NP. Every figure is computed or asserted in examples.py: the
// cell counts at ten, twenty and forty bits of capacity, a timed run showing the roughly
// doubling-per-bit growth, a small knapsack instance checked against brute force, the unary
// against binary length gap, a three-partition instance whose backtracking call count grows
// sharply with the number of triples even though every number stays small, and the bin-packing
// table size for a fixed, small number of bins.

const reel: Reel = {
  steps: [
    {
      title: "A knapsack with a hundred items and a capacity measured in bits fills a table in a blink: about a hundred thousand cells. Append ten more bits to that capacity and the table has about a hundred million. Append thirty more and it is over a hundred trillion, though the input itself grew by only thirty bits.",
      body: <>Same hundred items, one number thirty bits longer: the table grows from a blink to forever.</>,
      duration: 5.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "Bin packing is also NP-complete, and it also has numbers in it. Does shrinking those numbers give it the same kind of escape that knapsack's table gives knapsack?",
      body: <>A table indexed by every bin's load at once is exponential in the bin count, whatever the numbers are.</>,
      duration: 2.5,
      fig: 'PredictBinPacking',
      predict: {
        options: [
          { label: 'Yes, the same trick shrinks its table too' },
          { label: 'No, its table depends on every bin at once', correct: true },
          { label: 'No, bin packing has no table at all' },
          { label: 'Yes, but only for very few items' },
        ],
        explain: (
          <>
            A table big enough to track every bin's current load has one dimension per bin, so it
            is exponential in the number of bins no matter how the item sizes are written down.
          </>
        ),
      },
      Visual: S.PredictBinPacking,
    },
    {
      title: "The decision form of knapsack — can a value of at least some target be reached without exceeding the weight limit — is NP-complete. And yet a dynamic program with one row per item and one column per unit of capacity fills in and answers it in a single pass.",
      body: <>NP-complete in theory, solved in practice by a table with n times the capacity many cells.</>,
      duration: 5.5,
      fig: 'KnapsackNPCompleteAndDP',
      Visual: S.KnapsackNPCompleteAndDP,
    },
    {
      title: "That table's size is the item count times the capacity itself, not times the length of the capacity written down. Ten bits of capacity gives about a hundred thousand cells; twenty bits gives about a hundred million; forty bits gives over a hundred trillion, for the same hundred items.",
      body: <>Polynomial in the value of the capacity. Exponential in how many bits that value takes to write.</>,
      duration: 5.5,
      fig: 'CellsVsBits',
      Visual: S.CellsVsBits,
    },
    {
      title: "Write that same capacity as a short string of bits, or as one tally mark for every unit of value. The table's size tracks the tally strip's length, not the bit string's. That table is pseudo-polynomial: polynomial in the number itself, exponential in how compactly it is written.",
      body: <>The dynamic program is only as fast as its input is long when that input is written in tallies.</>,
      duration: 5.5,
      fig: 'UnaryVsBinary',
      Visual: S.UnaryVsBinary,
    },
    {
      title: "A problem is weakly NP-hard when it is hard only in the usual, compact binary encoding, and a pseudo-polynomial algorithm may still exist for it, the way it does for knapsack. The partition problem is the standard example: shrink its numbers and the hard instances disappear.",
      body: <>Weak hardness is a property of the encoding, not of the problem's structure alone.</>,
      duration: 5,
      fig: 'WeakNPHardness',
      Visual: S.WeakNPHardness,
    },
    {
      title: "Running the knapsack dynamic program for real as the capacity's bit length climbs, one bit at a time, its measured time roughly doubles with each bit appended — exactly what a table with that many more cells should cost.",
      body: <>Exactly the predicted shape, run for real: time doubling with every bit, not with every unit of value.</>,
      duration: 5,
      fig: 'TimedGrowthDoublingPerBit',
      takeaway: 'A pseudo-polynomial algorithm runs fast when the numbers are written compactly and slow when they are not.',
      Visual: S.TimedGrowthDoublingPerBit,
    },
    {
      title: "Three-partition's hard instances keep every number small by design: the numbers are bounded by a polynomial in how many of them there are. Does that smallness buy the same escape it bought partition, or is something different going on here?",
      body: <>Small numbers rescued partition. Whether they rescue a problem built to stay hard on small numbers is the question.</>,
      duration: 2.5,
      fig: 'PredictThreePartition',
      predict: {
        options: [
          { label: 'Yes, small numbers make it easy, like partition' },
          { label: 'No, it stays hard even with tiny numbers', correct: true },
          { label: 'Yes, but only if there are few triples' },
          { label: 'It depends on the specific numbers chosen' },
        ],
        explain: (
          <>
            Three-partition is built so its hardest instances already have small numbers, so
            shrinking the numbers further removes nothing: there is no encoding to blame.
          </>
        ),
      },
      Visual: S.PredictThreePartition,
    },
    {
      title: "A problem is strongly NP-hard when it remains NP-hard even with every numerical parameter bounded by a polynomial in the input's length — the same thing as staying hard when every number is written in unary. Three-partition is the standard example of exactly this.",
      body: <>Strong hardness survives the one trick that rescued the weak case: making the numbers small.</>,
      duration: 5.5,
      fig: 'StrongNPHardnessDefinition',
      Visual: S.StrongNPHardnessDefinition,
    },
    {
      title: "A backtracking solver on three-partition instances with every number kept small still fans out sharply as more triples are added: the search tree's size climbs fast even though no single number in the instance ever grows.",
      body: <>Small numbers, more triples, and the search tree still explodes — that is what strong hardness looks like.</>,
      duration: 5,
      fig: 'ThreePartitionBlowUp',
      Visual: S.ThreePartitionBlowUp,
    },
    {
      title: "Suppose a strongly NP-hard problem did have a pseudo-polynomial algorithm. Bounding its numbers by a polynomial would then make that algorithm run in ordinary polynomial time — but the problem is, by definition, still NP-hard on exactly those bounded instances. That is the contradiction.",
      body: <>A pseudo-polynomial algorithm on a strongly NP-hard problem would prove the problem is not hard after all.</>,
      duration: 5.5,
      fig: 'NoEscapeArgument',
      takeaway: 'A strongly NP-hard problem has no pseudo-polynomial algorithm: bounding its numbers would make it run polynomial time outright.',
      Visual: S.NoEscapeArgument,
    },
    {
      title: "Bin packing's own hardness depends on the interaction of many bins with many different sizes. Fix the number of bins and it becomes pseudo-polynomial in the capacity; fix the bin capacity instead and it becomes polynomial outright. Neither fix is available when both are free to vary.",
      body: <>Fix either one and the hardness lifts. Leave both free, together, and bin packing stays strongly NP-hard.</>,
      duration: 5.5,
      fig: 'BinPackingKFixed',
      takeaway: 'Fixing the number of bins makes bin packing pseudo-polynomial; fixing the bin capacity makes it polynomial outright.',
      Visual: S.BinPackingKFixed,
    },
    {
      title: "Strong NP-hardness rules out more than an exact algorithm: a strongly NP-hard problem with a polynomially bounded objective also has no fully polynomial-time approximation scheme, unless P equals NP. Knapsack's own such scheme, built on its weak hardness, belongs to a later topic on approximation.",
      body: <>Strong hardness closes off the approximation escape too, not only the exact one.</>,
      duration: 5,
      fig: 'WhatThisRulesOut',
      Visual: S.WhatThisRulesOut,
    },
    {
      title: "Knapsack's table is polynomial in the value of its numbers, so shrinking those numbers shrinks the table away. Bin packing's hardness lives in the interaction of its bins, so no amount of shrinking the item sizes ever shrinks that away. Approximation ratios and greedy set cover, next.",
      body: <>Weak or strong, the numbers in a problem tell you exactly where its hardness can and cannot hide.</>,
      duration: 5.5,
      fig: 'Recap',
      takeaway: 'Weak hardness vanishes once the numbers shrink; strong hardness does not, no matter how small the numbers get.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
