import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A hash function says nothing about what happens when two keys collide. Chaining is the oldest
// answer: a bucket doesn't hold one entry, it holds a list. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'A hash function says nothing about collisions',
      body: (
        <>
          Last topic ended right here: a hash function turns any key into a number, but two different keys can turn into the same one.
          Chaining is the oldest answer anyone gave.
        </>
      ),
      duration: 3,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Link records in the same slot into a list',
      body: (
        <>
          A bucket doesn&rsquo;t hold one entry &mdash; it holds a chain of every entry that landed there, built from the exact same
          singly-linked list two topics back.
        </>
      ),
      duration: 3.2,
      fig: 'ChainMechanism',
      Visual: S.ChainMechanism,
    },
    {
      title: 'A real standard library already does this',
      body: (
        <>
          Java&rsquo;s own <code>HashMap</code> is &ldquo;a binned (bucketed) hash table&rdquo; &mdash; chaining, by its own source
          comment. (One honest footnote: a bucket that grows past a threshold becomes a balanced tree, not pure chaining.)
        </>
      ),
      duration: 3.6,
      fig: 'RealLibrary',
      Visual: S.RealLibrary,
    },
    {
      title: "At load factor 1.5, how long is a random key's chain?",
      body: <>At load factor α ≈ 1.5, how long is the chain a random key probably lands in?</>,
      duration: 2,
      fig: 'ChainPredict',
      predict: {
        options: [
          { label: '0 — most buckets are probably still empty' },
          { label: 'Always exactly 1, however many keys there are' },
          { label: 'About α — the load factor itself', correct: true },
          { label: 'It grows without bound as more keys are added, regardless of table size' },
        ],
        explain: (
          <>
            Under a hash that spreads keys evenly, the expected number of keys sharing any one bucket is n divided by m &mdash; which is
            exactly α by definition. More buckets or fewer keys makes chains shorter; it&rsquo;s a ratio, not a fixed number or an
            unbounded one.
          </>
        ),
      },
      Visual: S.ChainPredictViz,
    },
    {
      title: 'Chaining never fails — it just gets slow',
      body: (
        <>
          Every key could still land in one slot. The chain just keeps growing &mdash; access degrades to one long list, but nothing
          ever runs out of room.
        </>
      ),
      duration: 3.4,
      fig: 'WorstCase',
      takeaway: 'Chaining never runs out of room in a bucket — it just degrades to one long list.',
      Visual: S.WorstCase,
    },
    {
      title: "The average is always alpha — that's not the real claim",
      body: (
        <>
          The average chain length over every bucket is exactly α, by counting &mdash; true for any hash, good or terrible. The real
          question is whether any one chain hoards the keys instead. Here, the longest chain stays close to average at every load
          factor tested.
        </>
      ),
      duration: 4.2,
      fig: 'ChainLengthReveal',
      takeaway: 'The average chain length is always α, by counting — the promise is no single chain runs away from it.',
      Visual: S.ChainLengthReveal,
    },
    {
      title: 'The one real cost: a pointer per entry',
      body: (
        <>
          Every entry pays for a pointer to the next one in its chain. That&rsquo;s the real cost the next topic&rsquo;s scheme avoids
          by storing every entry directly in the table itself.
        </>
      ),
      duration: 3.4,
      fig: 'PointerCost',
      takeaway: "Chaining's flexibility costs a pointer per entry — the next topic's scheme gives that up, and pays differently.",
      Visual: S.PointerCost,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Three load factors, one real table, one real measurement each time: the average tracks α exactly (it has to), and the longest
          chain stays a small fraction of n at every one &mdash; next to the worst case, where one chain holds everything.
        </>
      ),
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
