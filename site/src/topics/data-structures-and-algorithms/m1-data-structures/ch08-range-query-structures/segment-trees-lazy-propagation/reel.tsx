import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A Fenwick tree (topic 33) answers one aggregate with one operator and can't answer a
// range minimum or a range-wide update. This topic builds the fully general structure.
// Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "A Fenwick tree answers one specific aggregate — a running sum — in O(log n), using one fixed operator and nothing but lowest-set-bit arithmetic. It can't answer a range minimum, and it can't apply one update to an entire range without extending it.",
      body: (
        <>
          This topic builds the fully general structure: any associative combine function,
          over any range, with a range-wide update costing no more than a single point
          update does.
        </>
      ),
      duration: 4.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "A segment tree draws a small binary tree above the array: each leaf holds one slot's own value, each internal node holds the combine of its two children — sum here, but any associative operator fits the same shape.",
      body: <>Built once, bottom-up, in O(n): every internal node combines its own two children exactly once.</>,
      duration: 4,
      fig: 'TreeReveal',
      Visual: S.TreeReveal,
    },
    {
      title: "A range-sum query from minute 5 through minute 11 doesn't have to visit every node under the tree's own root. Over this 15-slot array, how many nodes does the query actually touch?",
      body: <>How many tree nodes does a range query over six minutes actually touch?</>,
      duration: 2,
      fig: 'QueryPredict',
      predict: {
        options: [
          { label: '1 — the root already has the whole answer' },
          { label: 'A handful — only the nodes whose own range matters, and no more', correct: true },
          { label: '11 — one node per minute up to 11' },
          { label: "All of them — the tree has no way to skip a subtree" },
        ],
        explain: (
          <>
            Six nodes, not eleven and not all of them — the descent skips any subtree whose
            own range sits fully outside the query.
          </>
        ),
      },
      Visual: S.QueryPredict,
    },
    {
      title: "The query descends only into the nodes it actually needs: any node whose own range sits fully inside [5, 11) is used directly, and the descent skips straight past everything else.",
      body: <>The same descent costs O(log n) regardless of how wide the range is — a handful of nodes, not a scan of the array.</>,
      duration: 4,
      fig: 'QueryReveal',
      takeaway: 'A range query visits only the nodes whose own range the query actually needs — a handful, not a scan.',
      Visual: S.QueryReveal,
    },
    {
      title: "The identical tree shape, built with a different combine function — minimum instead of sum — answers a range-minimum query by the same descent, in the same O(log n).",
      body: <>Nothing about the tree's own structure changes; only the one operator plugged into every internal node's own combine step does.</>,
      duration: 4,
      fig: 'OperatorReveal',
      Visual: S.OperatorReveal,
    },
    {
      title: "The identical structure, built a second way: one flat array, leaves at fixed positions, no pointers and no recursion — a point update climbs from a leaf straight up to the root, combining with its sibling at every level.",
      body: <>Both layouts answer every query on this array identically; the bottom-up array version only changes how the tree is stored, not what it computes.</>,
      duration: 4.5,
      fig: 'IterativeReveal',
      takeaway: 'Recursive-with-pointers and bottom-up-in-one-array are the same structure, built two different ways, answering identically.',
      Visual: S.IterativeReveal,
    },
    {
      title: "Updating minute 5 through minute 11 all at once, by the same amount, is a range-wide update — not a point update. Does it cost touching every one of those six slots, or can it cost what one point update costs?",
      body: <>Does a range-wide update have to touch every slot, or can it cost one tag?</>,
      duration: 2,
      fig: 'LazyPredict',
      predict: {
        options: [
          { label: "It has to touch every slot in the range — there's no way around that" },
          { label: 'It can cost the same as a single point update, using a tag deferred at one node', correct: true },
          { label: 'It costs more than touching every slot, because the tag itself needs tracking' },
          { label: "It's only possible for a sum combine function, never for minimum" },
        ],
        explain: <>One tag at one node, deferred until a query actually needs to see past it.</>,
      },
      Visual: S.LazyPredict,
    },
    {
      title: "A lazy tag sits on an internal node whose own range falls fully inside the update — the whole subtree is marked updated without visiting one leaf beneath it — and is only pushed down into that node's own children the moment a later query actually needs to see past it.",
      body: <>The update itself costs the same O(log n) as a point update; the leaves underneath only pay their own share of that cost if and when a query forces the tag down to them.</>,
      duration: 5,
      fig: 'LazyReveal',
      takeaway: 'A lazy tag marks a whole subtree updated in one step; the leaves wait until a query forces it down.',
      Visual: S.LazyReveal,
    },
    {
      title: "A node already carries a pending range-assign tag — set every slot underneath to 7 — when a new range-add arrives for the same node, add 3 more. Does the add combine with the assign, or does one simply win?",
      body: <>Does the new add combine with the pending assign, or does one of them win outright?</>,
      duration: 2,
      fig: 'ComposePredict',
      predict: {
        options: [
          { label: 'They combine into one bigger add, 3 plus whatever was there' },
          { label: "The add folds into the pending assign's own value, landing on assign-10", correct: true },
          { label: 'The add is silently dropped, the assign still wins at 7' },
          { label: 'The node has to push both down to its children immediately, right then' },
        ],
        explain: (
          <>
            The add folds into the assign's own value — assign-10, not assign-7 and not a
            separate add tag left sitting beside it.
          </>
        ),
      },
      Visual: S.ComposePredict,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Measured, not assumed: ten range-add updates over this exact 15-slot array cost a
          segment tree with no lazy tags 85 leaf-touches in total — one touch per slot, per
          update, every time — against 24 for the same updates run through lazy tags
          instead.
        </>
      ),
      duration: 4.5,
      fig: 'ProveIt',
      takeaway: 'Across ten range-wide updates, no lazy tags touched 85 leaves; lazy tags touched 24 nodes.',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
