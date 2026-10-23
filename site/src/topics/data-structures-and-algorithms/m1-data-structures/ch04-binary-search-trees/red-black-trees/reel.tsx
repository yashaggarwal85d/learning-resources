import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A rotation preserves order, but last topic found nothing that keeps height small. This topic adds
// one invariant -- colour -- and shows it's exactly a 2-3-4 tree wearing a disguise. Every number
// is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'A rotation preserves order, but last topic found nothing that keeps height small. What is the smallest rule that would have stopped that chain from ever forming?',
      body: (
        <>
          Sorted insertion degraded a plain BST to one long chain, and the BST property held the
          entire time. One rule fixes it &mdash; colour.
        </>
      ),
      duration: 3.8,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Every node is red or black, the root is black, a red node never has a red child, and every path down to empty space passes through the same number of black nodes.',
      body: (
        <>
          Four rules about colour, layered on top of a tree that's still just a BST underneath.
          Nothing about search, insert, or delete changes &mdash; only what colours an insert is
          allowed to leave behind.
        </>
      ),
      duration: 4,
      fig: 'FiveInvariants',
      Visual: S.FiveInvariants,
    },
    {
      title: 'An insert just created two consecutive red nodes. What has to happen before this tree is valid again?',
      body: <>Two red nodes in a row. What has to happen before this tree is valid again?</>,
      duration: 2,
      fig: 'ViolationPredict',
      predict: {
        options: [
          { label: "Nothing — the tree is still a valid BST, so it's fine" },
          { label: 'The tree must be rebuilt from scratch' },
          { label: 'A recolouring and/or a rotation must restore the invariant before the tree is valid again', correct: true },
          { label: 'The new node is simply rejected and not inserted' },
        ],
        explain: (
          <>
            The BST property never broke. A completely different property did, and fixing it means
            walking back up from the new node, recolouring, and rotating only when recolouring alone
            can't restore the rule.
          </>
        ),
      },
      Visual: S.ViolationPredict,
    },
    {
      title: "Recolouring fixes most violations by itself. When it can't, one rotation finishes the job — the same move last topic defined, now firing for a reason.",
      body: (
        <>
          Recolouring is the cheap move, tried first. Rotation is the one reached for only when
          colour alone won't settle it.
        </>
      ),
      duration: 3.8,
      fig: 'FixReveal',
      Visual: S.FixReveal,
    },
    {
      title: "A black node and its red children aren't really separate nodes — they're one node of a 2-3-4 tree, wearing a disguise.",
      body: (
        <>
          Colour was never an arbitrary rule bolted onto a BST. It's a binary tree pretending to be
          a wider one.
        </>
      ),
      duration: 3.8,
      fig: 'TwoThreeFourEncoding',
      takeaway: 'A black node and its red children together form one 2-3-4 tree node — not an arbitrary rule.',
      Visual: S.TwoThreeFourEncoding,
    },
    {
      title: 'Across every insert and delete this tree will ever do, what is the largest number of rotations any single one of them can need?',
      body: <>What is the largest number of rotations any single insert or delete can ever need?</>,
      duration: 2,
      fig: 'RotationBoundPredict',
      predict: {
        options: [
          { label: 'Unbounded — it depends on how deep the violation started' },
          { label: 'At most two for an insert, at most three for a delete', correct: true },
          { label: 'Exactly one, always' },
          { label: "As many as the tree's current height" },
        ],
        explain: (
          <>
            Every fixup case that actually rotates sits outside the loop that walks back up
            recolouring. That walk can climb many levels; the rotation at the end of it never
            repeats.
          </>
        ),
      },
      Visual: S.RotationBoundPredict,
    },
    {
      title: 'The climb can be as tall as the tree. The rotation at the bottom of it never is.',
      body: (
        <>
          This is the entire reason the scheme stays cheap: the part that looks expensive isn't the
          part that's actually bounded.
        </>
      ),
      duration: 3.8,
      fig: 'RotationBoundReveal',
      takeaway: 'An insert needs at most two rotations, a delete at most three — the recolouring climbs, the rotation doesn\'t.',
      Visual: S.RotationBoundReveal,
    },
    {
      title: "The 2-3-4 correspondence is what does the real work: every 2-3-4 node expands into at most two tree levels, so a red-black tree's height can never run away the way an unbalanced BST's did.",
      body: (
        <>
          The chain from last topic simply isn't possible here. The colour invariant is exactly
          what rules it out.
        </>
      ),
      duration: 4,
      fig: 'HeightBound',
      takeaway: "A red-black tree's height stays order log n, even under the sorted order that degraded last topic's plain BST.",
      Visual: S.HeightBound,
    },
    {
      title: "This is the one scheme every mainstream ordered map actually ships with: C++'s std::map, Java's TreeMap, and a long list of Linux kernel subsystems.",
      body: (
        <>
          AVL trees get taught more often. This is the one actually running underneath the ordered
          map you already reach for.
        </>
      ),
      duration: 3.6,
      fig: 'ProductionUses',
      Visual: S.ProductionUses,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Measured, not assumed: the same worst-case keys that broke last topic's tree, and the real
          ceiling on how many rotations any single fixup ever needed.
        </>
      ),
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
