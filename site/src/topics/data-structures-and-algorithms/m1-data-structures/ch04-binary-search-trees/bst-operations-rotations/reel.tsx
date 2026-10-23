import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Hashing answered where a key lives by giving up on order completely. This refresher keeps the
// keys in order instead, and asks what that costs. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Hashing answered where a key lives by giving up on order completely. This topic keeps the keys in order instead, and asks what that costs.',
      body: (
        <>
          Last chapter turned every key into a number and lost its order on purpose. This chapter keeps the order
          &mdash; a binary search tree, where every node's key sits between its left and right subtree's keys.
        </>
      ),
      duration: 3.6,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "Search and insert both walk the same comparison: smaller, go left; bigger, go right. Insert just keeps going until it finds an empty spot.",
      body: (
        <>
          One comparison rule does both jobs. Searching for a key and finding where a new one belongs are the exact
          same walk &mdash; insert just doesn't stop until it reaches an empty spot.
        </>
      ),
      duration: 3.6,
      fig: 'SearchInsert',
      Visual: S.SearchInsert,
    },
    {
      title: 'Insert these timestamps in already-sorted order instead of random order. What shape does the tree take?',
      body: <>These timestamps are about to be inserted in sorted order, not random order. What shape results?</>,
      duration: 2,
      fig: 'DegeneratePredict',
      predict: {
        options: [
          { label: 'A balanced, roughly log n deep tree, same as usual' },
          { label: 'One long chain — every node has only a right child, height n', correct: true },
          { label: 'A random, unpredictable shape' },
          { label: 'A single node holding every key' },
        ],
        explain: (
          <>
            Each new key is bigger than everything already in the tree, so it always becomes the current rightmost
            node's right child. The tree degrades to exactly what a linked list already was.
          </>
        ),
      },
      Visual: S.DegeneratePredict,
    },
    {
      title: "Same keys, same BST property, wildly different height. One insertion order silently degrades search from fast to slow.",
      body: (
        <>
          Nothing broke. The BST property held the entire time, every single insert. The shape just quietly became
          the worst possible one, and nothing in the property itself warned you.
        </>
      ),
      duration: 3.6,
      fig: 'DegenerateReveal',
      takeaway: "An unbalanced BST's height can reach n under a sorted insertion order — the BST property alone never prevents it.",
      Visual: S.DegenerateReveal,
    },
    {
      title: 'Deleting a two-child node swaps in its in-order successor — the smallest key bigger than it. No key sits between them, so order never breaks.',
      body: (
        <>
          A leaf or a one-child node is easy to delete. A two-child node isn't &mdash; so swap in the one key
          guaranteed not to disturb anything: the smallest key in its right subtree.
        </>
      ),
      duration: 3.8,
      fig: 'DeleteSuccessor',
      takeaway: 'Deleting a two-child node by swapping in its in-order successor preserves the BST property, because no key lies between them.',
      Visual: S.DeleteSuccessor,
    },
    {
      title: 'Walk left, visit, walk right, every single time. That one rule reads every key back out in sorted order.',
      body: (
        <>
          This is the BST property proving itself. The output comes out sorted because the shape of the tree forced
          it to be, not because anything sorted it afterward.
        </>
      ),
      duration: 3.4,
      fig: 'InOrderTraversal',
      Visual: S.InOrderTraversal,
    },
    {
      title: 'A rotation relinks a handful of pointers and reshapes a tree — but never touches its in-order sequence of keys.',
      body: (
        <>
          This one move is the entire toolkit every balancing scheme after this topic will use. Nothing more is
          needed to fix a tree's shape &mdash; only a reason to know when to use it.
        </>
      ),
      duration: 3.8,
      fig: 'Rotation',
      takeaway: "A rotation relinks a constant number of pointers, changing a tree's shape while never changing its in-order sequence of keys.",
      Visual: S.Rotation,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Measured, not assumed: the same keys reach wildly different heights depending on insertion order, and a
          rotation changes shape without ever touching that order.
        </>
      ),
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
