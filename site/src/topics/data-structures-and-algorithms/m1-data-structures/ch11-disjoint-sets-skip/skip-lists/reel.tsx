import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Skip lists: geometric tower heights, the expected O(log n) search-cost bound, the one-store-
// per-level splice that makes a reader safe with no lock, and two real uses of the same structure.
// Every number shown is computed or asserted in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'A sorted buffer with no lock on reads',
      body: (
        <>
          A storage engine's write buffer must stay sorted, take inserts at a high rate, and let
          readers run with no lock at all. A balanced tree keeps itself sorted by rotating, and a
          rotation rewrites several pointers that must change together — exactly what a lock-free
          reader cannot survive mid-update. What if height came from a coin flip instead?
        </>
      ),
      duration: 4.4,
      fig: 'a memtable, read with no lock',
      Visual: S.Hook,
    },
    {
      title: 'Towers by coin flip',
      body: (
        <>
          Level zero is the full sorted list. Above each key, a tower as tall as the number of
          consecutive heads a coin flip gives it: climb one level per successful flip, stop on the
          first tails. No rule ever looks at the list's size or shape to decide a height.
        </>
      ),
      duration: 4.2,
      fig: 'sixteen keys, towers from real coin flips',
      Visual: S.Towers,
    },
    {
      title: 'How many reach the next level up?',
      body: (
        <>
          Half of the nodes that reach level one also reach level two, when the promotion
          probability is one in two. About what fraction of the nodes that reach level two also
          reach level three?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'About one in four' },
          { label: 'About one in two, the same fraction, every level', correct: true },
          { label: 'About one in eight' },
          { label: 'It depends how many nodes are already at level two' },
        ],
        explain: (
          <>
            About one in two, every level: promotion has no memory of which level a node is
            already on. The same fixed fraction gets promoted at every step, which is exactly what
            makes the height of any one tower a geometric random variable.
          </>
        ),
      },
      fig: 'the same fraction, every level',
      Visual: S.Promotion,
    },
    {
      title: 'The geometric tower, and its price',
      body: (
        <>
          Promotion is memoryless, so the fraction of nodes at a given level or above shrinks by
          the same factor at every step — measured directly: about one in four promoted at
          promotion-probability one in four, about one in two at one in two. That same shape sets
          the average pointer count per node: about four-thirds at one in four, about two at one in
          two — real memory spent, in exchange for not rebalancing, ever.
        </>
      ),
      duration: 4.6,
      fig: 'measured: about four-thirds pointers per node at one in four, about two at one in two',
      takeaway: 'A geometric tower height, fixed at insert time and never revisited, is what replaces a rebalancing invariant.',
      Visual: S.GeometricPrice,
    },
    {
      title: 'A search, traced',
      body: (
        <>
          Start at the top-left corner. Step right while the next key is still smaller than the
          one you're searching for; when it isn't, drop a level. Repeat until there's nowhere left
          to drop. The same shape, every search, down to level zero.
        </>
      ),
      duration: 4,
      fig: 'one caramel path, stepping right then dropping',
      Visual: S.SearchTrace,
    },
    {
      title: 'How long does a real search take?',
      body: (
        <>
          On a real list of twenty thousand keys, is a typical search closer to twenty steps, two
          hundred steps, or two thousand steps?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'About twenty steps', correct: true },
          { label: 'About two hundred steps' },
          { label: 'About two thousand steps' },
          { label: 'It depends which key, by a lot' },
        ],
        explain: (
          <>
            About twenty: logarithmic, not linear, and the measured spread between keys is small —
            the whole point of climbing down from a random height instead of walking the base row.
          </>
        ),
      },
      fig: 'measured: under thirty steps, twenty thousand keys',
      Visual: S.SearchCount,
    },
    {
      title: 'The bound, and why one in four',
      body: (
        <>
          A real search on twenty thousand keys measured well under thirty steps on average, at
          both promotion probabilities — under the paper's own bound in both cases, and that bound
          is smaller at one in four than at one in two, which is the paper's own reason for
          recommending the smaller probability. Its stronger, separate claim: past two hundred
          fifty elements, a search running more than three times its expected cost happens under
          one time in a million.
        </>
      ),
      duration: 5,
      fig: 'measured: both average costs beneath the bound',
      takeaway: 'A smaller promotion probability trades a smaller search-cost constant for a few more comparisons near the base of every climb.',
      Visual: S.Bound,
    },
    {
      title: 'Why a reader never sees a broken list',
      body: (
        <>
          An insert's splice writes exactly one forward pointer per level the new node occupies —
          measured on twenty thousand real inserts, never more than the node's own height. A
          rotation must change several pointers together to keep a tree's shape invariant; a splice
          changes one pointer at a time, each a single store that publishes a fully built node,
          never a half-built one.
        </>
      ),
      duration: 4.8,
      fig: 'measured: every insert, writes equal height, never more',
      takeaway: 'One pointer store per level, publishing a fully built node, is what a lock-free reader actually depends on.',
      Visual: S.Splice,
    },
    {
      title: 'Same shape, two real systems',
      body: (
        <>
          LevelDB and RocksDB's default write buffer is exactly this structure, built for a reader
          that needs no lock. Redis's sorted set pairs the same structure with a hash table, and
          tags every link with a span, the count of elements it skips — so asking "what rank is
          this member" sums the spans already crossed instead of walking from the front.
        </>
      ),
      duration: 5,
      fig: 'measured: span-based rank, zero mismatches against a direct count',
      takeaway: 'The same coin-flip tower answers two different questions, ordered iteration and ranked lookup, depending only on what each link carries.',
      Visual: S.TwoSystems,
    },
    {
      title: 'Recap',
      body: (
        <>
          A coin flip at insert time, repeated and never revisited, buys an expected logarithmic
          search with no rebalancing step at all. The price is "expected," not "worst case" — and
          that price is exactly what lets a reader run with no lock.
        </>
      ),
      duration: 3.8,
      fig: 'one coin flip, never revisited',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          LevelDB's iterator has Next and Prev. There are no explicit backward pointers anywhere in
          the structure. How does Prev work?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'It follows a hidden pointer stored at insert time' },
          { label: 'It searches again, for the last key less than the current one', correct: true },
          { label: 'It walks level zero backward from the end' },
          { label: 'It is not supported without rebuilding the list' },
        ],
        explain: (
          <>
            It searches again: with no prev pointer to follow, finding the last key less than the
            current one is just another forward search for a different target — exactly what
            find_less_than in examples.py does, matched against the real predecessor on every
            probe.
          </>
        ),
      },
      fig: 'no prev pointer; a fresh search instead',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
