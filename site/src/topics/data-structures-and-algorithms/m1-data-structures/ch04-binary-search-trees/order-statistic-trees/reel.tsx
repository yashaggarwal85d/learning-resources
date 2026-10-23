import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A balanced tree answers "is x here." It says nothing about x's rank among everything else.
// One extra field per node, kept correct through insert, delete and rotation, answers that too.
// Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "A balanced tree answers whether a key is here in order log n. It says nothing about that key's rank among everything else in the tree. A small amount of bookkeeping, and that question is answered too.",
      body: (
        <>
          Every structure so far answered membership. This one answers position &mdash; for almost
          nothing extra.
        </>
      ),
      duration: 4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "One extra number per node: the size of its own subtree, including itself. Each one is just its children's sizes, plus one for itself.",
      body: (
        <>
          Nothing about the keys changed. Every node just started counting how much of the tree
          sits beneath it.
        </>
      ),
      duration: 3.6,
      fig: 'SizeAugmentation',
      Visual: S.SizeAugmentation,
    },
    {
      title: 'Insert a key into this augmented tree. Which nodes actually need their size updated?',
      body: <>Which nodes actually need their size updated after this insert?</>,
      duration: 2,
      fig: 'InsertPredict',
      predict: {
        options: [
          { label: 'Only the new leaf itself' },
          { label: 'Every node on the path from the root down to the new leaf', correct: true },
          { label: 'Every node in the entire tree' },
          { label: 'Only the root' },
        ],
        explain: (
          <>
            Every node on that path just gained one new descendant. Nothing off that path changed
            at all.
          </>
        ),
      },
      Visual: S.InsertPredict,
    },
    {
      title: 'One new key, one path, one increment at every node along it — never a re-scan of anything beneath.',
      body: (
        <>
          The insert was already walking this exact path to find where the key belongs. The size
          bookkeeping just rides along with it.
        </>
      ),
      duration: 3.8,
      fig: 'InsertReveal',
      takeaway: 'Inserting a key increments the size of every node on the path it followed — in time proportional to height.',
      Visual: S.InsertReveal,
    },
    {
      title: "Want the fifth-smallest key? Compare it against the left subtree's size. Too big, subtract and go right. Too small, go left. Exactly right, stop.",
      body: (
        <>
          This is the exact same comparison quickselect uses to pick a side. The difference is the
          tree already did the partitioning, and it stays done.
        </>
      ),
      duration: 4,
      fig: 'SelectWalk',
      Visual: S.SelectWalk,
    },
    {
      title: 'A rotation relinks two nodes. How many of their subtree sizes actually need recomputing?',
      body: <>How many subtree sizes does this one rotation actually need to recompute?</>,
      duration: 2,
      fig: 'RotationPredict',
      predict: {
        options: [
          { label: 'All the sizes in the subtree being rotated' },
          { label: 'Every size along the path back up to the root' },
          { label: 'Only the two nodes incident to the rotated edge', correct: true },
          { label: 'None — the sizes stay correct automatically' },
        ],
        explain: (
          <>
            A rotation only changes which two nodes are parent and child. Every other node keeps
            exactly the descendants it already had.
          </>
        ),
      },
      Visual: S.RotationPredict,
    },
    {
      title: 'Two nodes change parent. Two sizes get recomputed. Everything else was never touched.',
      body: (
        <>
          This looks like it should disturb a lot of bookkeeping. It disturbs exactly two numbers.
        </>
      ),
      duration: 3.8,
      fig: 'RotationReveal',
      takeaway: "A rotation recomputes the subtree size of only the two nodes incident to the rotated edge, never a wider re-scan.",
      Visual: S.RotationReveal,
    },
    {
      title: "Size survives a rotation because it's computed from just a node and its two children. Any augmented field with that property survives the same way, at the same cost.",
      body: (
        <>
          Subtree size isn't special here. It's the simplest working example of a much more
          general rule.
        </>
      ),
      duration: 4,
      fig: 'GeneralRule',
      takeaway: "An augmented field survives a rotation at constant cost exactly when it's computable from the rotated node's new children alone.",
      Visual: S.GeneralRule,
    },
    {
      title: "Rank runs the same trick upward: climb to the root, and every time the path climbs up from a right child, add that side's whole left subtree to the count.",
      body: (
        <>
          Select walks down, counting forward. Rank walks up, counting everything the climb
          passed along the way.
        </>
      ),
      duration: 3.8,
      fig: 'RankQuery',
      Visual: S.RankQuery,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Measured, not assumed: a select query's comparisons stay tied to the tree's height, and a
          rotation's size fixup never touches more than two nodes.
        </>
      ),
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
