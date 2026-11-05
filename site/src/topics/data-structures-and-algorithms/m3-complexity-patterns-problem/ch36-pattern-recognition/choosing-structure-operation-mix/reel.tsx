import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: the second of the chapter's four reading skills. The budget said how much work
// is allowed; this topic reads the operations themselves and asks which structure answers that
// mix the cheapest — a dispatch table across seven rows, each with its own breaking condition,
// and the thesis that the structure is chosen by the mix, never by the single biggest operation.
// Every count is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Ten million keys, one table, and one question per operation. At ninety-five lookups in a hundred, a hash table wins by a wide margin. Shift the mix toward range queries, and the same hash table loses to a tree it just beat.',
      body: <>The same data, three mixes, three different winners.</>,
      duration: 5,
      fig: 'MixHook',
      Visual: S.MixHook,
    },
    {
      title: 'A hash table answers equality lookup in constant time and nothing about order. Ask it for the next key larger than a given one, or for every key between two bounds, and it has no order to consult — the table itself has nothing to answer that question with.',
      body: <>No order to consult: a hash table has nothing to answer a range question with.</>,
      duration: 4.5,
      fig: 'HashBreakingCondition',
      Visual: S.HashBreakingCondition,
    },
    {
      title: 'Predict: mix a small sliver of range queries into a stream that is otherwise all equality lookups. How large does that sliver have to get before a tree, kept in order the whole time, beats the hash table outright?',
      body: <>How large a share of range queries flips the winner from hash to tree?</>,
      duration: 4,
      fig: 'PredictRangeShare',
      predict: {
        options: [
          { label: 'About thirty percent of the operations need to be range queries' },
          { label: 'About five percent of the operations need to be range queries' },
          { label: 'Well under one percent is already enough to flip the winner', correct: true },
          { label: 'No share is ever enough; a hash table always wins on this workload' },
        ],
        explain: (
          <>
            Well under one percent. A hash table has no order at all, so answering even one range query means
            scanning every key it holds — a cost that dwarfs a tree's range query, which costs only the width of
            the range itself. The intuitive guess badly underestimates how lopsided that one operation's cost is.
          </>
        ),
      },
      Visual: S.PredictRangeShare,
    },
    {
      title: "Measured directly: a hash table's range query costs a full scan of every key it holds, because it has no order to narrow the search. A tree's range query costs only the width of the range, because the tree is already in order. That asymmetry is why such a tiny share is enough.",
      body: <>A full scan against only the range's own width — measured, not assumed.</>,
      duration: 5,
      fig: 'TreeRangeMeasured',
      Visual: S.TreeRangeMeasured,
    },
    {
      title: 'For the top few of a large collection, a small heap beats sorting the whole thing. Measured directly: at ten percent of the collection, the heap wins. At twenty percent, sorting everything has already won instead, because the heap bookkeeping itself grows larger as it is asked to keep more.',
      body: <>A heap wins at ten percent of n; sorting wins back by twenty percent.</>,
      duration: 5,
      fig: 'TopKCrossover',
      takeaway: 'A heap beats sorting at a small share of the data and loses that lead as the share grows.',
      Visual: S.TopKCrossover,
    },
    {
      title: 'For membership at a scale too large to hold exactly, a Bloom filter answers in a handful of bits per key, where a wrong yes happens rarely and a wrong no never happens at all. Priced against an exact set at the identical key count, the filter is a small fraction of the size — using the bits-per-key arithmetic a different topic already verified, not re-derived here.',
      body: <>A handful of bits per key, priced against an exact set's full cost.</>,
      duration: 5,
      fig: 'BloomFilterPriced',
      Visual: S.BloomFilterPriced,
    },
    {
      title: "For grouping by an equivalence that only ever merges, union-find answers in near-constant amortised time per operation. Its one missing operation is splitting a group back apart once it has been merged — there simply is no such operation, by the structure's own design.",
      body: <>Merging is near-constant time. Splitting a group back apart has no operation at all.</>,
      duration: 4.5,
      fig: 'UnionFindBreakingCondition',
      takeaway: 'Union-find merges groups cheaply and splits none; grouping by aggregation is a different problem, answered by a hash table instead.',
      Visual: S.UnionFindBreakingCondition,
    },
    {
      title: "A trie answers a prefix query bounded only by the length of the key, not by how many keys it holds. Ask it instead for a substring buried in the middle of a word — not a prefix at all — and its own search, which only ever walks downward from the root, has no way to find it.",
      body: <>Bounded by the key's own length. A substring, not a prefix, is a different question entirely.</>,
      duration: 4.5,
      fig: 'TrieBreakingCondition',
      Visual: S.TrieBreakingCondition,
    },
    {
      title: 'A range sum is a prefix sum minus an earlier prefix sum, because subtraction undoes addition exactly. Predict: does the identical trick — take a running prefix maximum, and subtract the earlier one — give the correct maximum of a range strictly inside the array?',
      body: <>Does subtracting one running prefix maximum from another give a correct range maximum?</>,
      duration: 4,
      fig: 'PredictFenwickMax',
      predict: {
        options: [
          { label: 'Yes, the identical trick works for maximum exactly as it does for sum' },
          { label: 'No — maximum has no inverse operation, so the trick gives a wrong answer', correct: true },
          { label: 'It works, but only when the array has no repeated values' },
          { label: 'It works only for a range that starts at the very first element' },
        ],
        explain: (
          <>
            No. Subtraction undoes addition, which is exactly why a Fenwick tree's prefix-sum trick recovers a
            range sum correctly. Maximum has no such inverse: a running prefix maximum computed on a constructed
            array gives a wrong answer for a range that excludes an early, larger value — confirmed directly.
            A segment tree, built on an associative combining rule rather than an invertible one, gets it right.
          </>
        ),
      },
      Visual: S.PredictFenwickMax,
    },
    {
      title: 'Confirmed directly on a constructed case: the prefix-maximum trick returns the wrong answer for a range that excludes an early, larger value, while a segment tree, built on nothing more than an associative combining rule, returns the correct one on the identical case.',
      body: <>The trick fails on a constructed case; a segment tree gets the identical case right.</>,
      duration: 4.5,
      fig: 'SegmentTreeCorrect',
      Visual: S.SegmentTreeCorrect,
    },
    {
      title: 'The structure is chosen by the mix, not by the single biggest operation: total cost is a weighted sum over every operation, frequency times its own cost, and that ranking changes as the mix changes. The same ten million keys, the same three structures, and three different mixes each choose a different winner — and when the mix genuinely needs two things, the answer is sometimes two structures kept in sync over the identical data, the way a well known in-memory store keeps a hash table and a skip list together over one sorted collection.',
      body: <>Three mixes, three winners, over the identical data and the identical structures.</>,
      duration: 5.5,
      fig: 'WeightedMixThesis',
      takeaway: 'Total cost is a weighted sum over every operation. The ranking of structures changes with the mix, not the data.',
      Visual: S.WeightedMixThesis,
    },
    {
      title: "A structure holds the data and answers questions about it. Some problems do not hand you data at all — they hand you a situation: a position, a set of legal moves, a goal. There is no table to put a situation in, because what is being searched over is the set of situations itself, and it is usually too large to write down. Modelling problems as graphs, next.",
      body: <>Next: when the input is a situation, not data to put in a structure.</>,
      duration: 5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
