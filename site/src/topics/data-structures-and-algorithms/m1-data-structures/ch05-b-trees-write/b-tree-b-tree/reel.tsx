import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A comparison-optimal tree (Ch.4) still costs one I/O per pointer it follows. A B+Tree makes
// the node itself a disk page, so one I/O reads many keys at once, and height shrinks to the
// I/O model's own bound (Ch.1). Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "A balanced, pointer-based tree answers whether a key is here in a small number of comparisons. It says nothing about how many of those comparisons are separate trips to disk.",
      body: (
        <>
          Last chapter's tree was optimal in comparisons. This one asks what happens once a
          comparison and a disk trip aren't the same thing anymore.
        </>
      ),
      duration: 4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "A B+Tree: every leaf at the same depth, every node but the root at least half full, every inner node with some number of keys holding one more child than that.",
      body: (
        <>
          Nothing here is optional. The half-full rule is what will force every later move in this
          topic.
        </>
      ),
      duration: 4,
      fig: 'BTreeShape',
      Visual: S.BTreeShape,
    },
    {
      title: 'An insert just overflowed a leaf past its limit. What happens to the tree?',
      body: <>What happens to the tree once this leaf holds one key too many?</>,
      duration: 2,
      fig: 'SplitPredict',
      predict: {
        options: [
          { label: 'The new key is rejected; the leaf stays as it was' },
          { label: 'The leaf splits in two, and a key is promoted to the parent', correct: true },
          { label: 'The whole tree is rebuilt from scratch' },
          { label: 'Nothing — a leaf can hold as many keys as it needs to' },
        ],
        explain: (
          <>
            The half-full rule from the last step is never optional. An overfull leaf splits, and
            only the path up to the root is ever touched.
          </>
        ),
      },
      Visual: S.SplitPredict,
    },
    {
      title: "Watch the split: both halves come out at least half full by construction, not by luck — a leaf copies its middle key up; an inner node pushes its middle key up instead, since inner nodes only route.",
      body: (
        <>
          If the parent overflows too, it splits the exact same way. If the root splits, the tree
          grows one level taller — the only way its height ever increases.
        </>
      ),
      duration: 4.2,
      fig: 'SplitReveal',
      takeaway: 'A split always leaves both halves at least half full — forced by the fill rule, never a choice.',
      Visual: S.SplitReveal,
    },
    {
      title: 'A delete just underflowed a leaf below its minimum. What happens now?',
      body: <>What happens to this leaf once it drops below the minimum fill?</>,
      duration: 2,
      fig: 'MergePredict',
      predict: {
        options: [
          { label: 'The leaf is left underfull; nothing else changes' },
          { label: 'It borrows a key from a sibling, or merges with one if it must', correct: true },
          { label: 'The whole tree is rebuilt from scratch' },
          { label: 'The missing key is re-inserted somewhere else in the tree' },
        ],
        explain: (
          <>
            The fill rule cuts both ways. An underfull node either borrows from a sibling that can
            spare a key, or merges with one that can't.
          </>
        ),
      },
      Visual: S.MergePredict,
    },
    {
      title: "Borrow first, always: take one key from a sibling with keys to spare. Only merge, and delete the parent's now-orphaned key, when no sibling can spare one.",
      body: (
        <>
          A borrow never changes the tree's height. A merge is the one move in this whole topic
          that can shrink it.
        </>
      ),
      duration: 4.5,
      fig: 'MergeReveal',
      takeaway: "Borrowing from a sibling never changes height. Only a merge can make the tree shorter.",
      Visual: S.MergeReveal,
    },
    {
      title: "Leaves are linked to their siblings. A range scan finds the first leaf once, then streams across linked leaves directly — it never climbs back to the root to find the next one.",
      body: (
        <>
          This is the same leaf-linking a real production B-tree names directly as its own
          right-sibling pointer.
        </>
      ),
      duration: 4,
      fig: 'SiblingScan',
      takeaway: "A range scan pays for one descent, then one I/O per leaf touched — never one descent per key.",
      Visual: S.SiblingScan,
    },
    {
      title: "Fanout is bounded by how many keys and pointers actually fit in one disk page. Height is about the log of the key count, base fanout — not base two.",
      body: (
        <>
          A bigger page or a smaller key buys a bigger fanout. A bigger fanout buys a shorter
          tree, for free.
        </>
      ),
      duration: 4,
      fig: 'FanoutHeight',
      Visual: S.FanoutHeight,
    },
    {
      title: "The same keys, measured two ways: one comparison at a time against one disk page at a time. The gap is the entire reason this chapter exists.",
      body: (
        <>
          A realistic page shrinks this further still — a real fanout turns a billion keys into
          the same small handful of levels.
        </>
      ),
      duration: 4,
      fig: 'IOComparison',
      takeaway: "The identical keys that need many comparisons one at a time need far fewer I/Os one page at a time.",
      Visual: S.IOComparison,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Measured, not assumed: the split, borrow and merge counts from building and modifying
          this tree; a range scan's real I/O count against re-descending for every key; and the
          fanout-height formula checked against a billion keys on a realistic page.
        </>
      ),
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
