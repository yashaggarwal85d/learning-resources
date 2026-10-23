import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every earlier chapter in this module asked where data sits. This one drops that question
// entirely and asks only which element is smallest right now. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Every structure in this chapter optimized where data physically sits — on a page, in a run, across a level — to make a block of I/O count for as much work as possible. The next chapter asks a narrower question, answered the same way regardless of where anything sits: of everything not yet processed, which one is smallest, right now.',
      body: (
        <>
          No sorting, no page, no pointer. Just: what's smallest, right now, as things keep
          arriving.
        </>
      ),
      duration: 4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "A binary heap's tree lives entirely in one flat array — no pointers at all. A node at index i has its children at indices 2i+1 and 2i+2, and its parent at index floor((i−1)/2).",
      body: <>The tree shape is free. It's computed from a position, not stored anywhere.</>,
      duration: 3.5,
      fig: 'ArrayTree',
      Visual: S.ArrayTree,
    },
    {
      title: "A new value just landed at the array's own end, past every other element. What has to happen before this is a valid heap again?",
      body: <>What has to happen before this array is a valid heap again?</>,
      duration: 2,
      fig: 'SiftUpPredict',
      predict: {
        options: [
          { label: "Nothing — the heap property doesn't care about insertion order" },
          { label: 'The whole heap gets rebuilt from scratch' },
          { label: "The new value walks up toward the root, swapping with its parent until it's no longer out of order", correct: true },
          { label: 'The smallest element gets moved to the end instead' },
        ],
        explain: (
          <>
            A rebuild would touch everything; the heap only needs the one path the new value
            sits on repaired. Sift-up walks exactly that path, root-ward, one swap at a time.
          </>
        ),
      },
      Visual: S.SiftUpPredict,
    },
    {
      title: "Sift-up: compare the new value with its parent; if the heap property already holds, stop. If not, swap them, and repeat from the new position.",
      body: (
        <>
          Only the single path from the new leaf up to the root is ever touched — nothing else
          in the heap moves.
        </>
      ),
      duration: 3.5,
      fig: 'SiftUpReveal',
      takeaway: 'Sift-up only repairs the one path from a new leaf up to the root — nothing else moves.',
      Visual: S.SiftUpReveal,
    },
    {
      title: "Removing the minimum empties the root. Sift-down fills it: move the array's last element into the root, then walk it down, swapping with whichever child is smaller, until it's no longer out of order.",
      body: <>Same move as sift-up, aimed the other way — one path, root to wherever it stops.</>,
      duration: 3.5,
      fig: 'SiftDownReveal',
      takeaway: "Sift-down is sift-up's mirror: one path, root to leaf instead of leaf to root.",
      Visual: S.SiftDownReveal,
    },
    {
      title: "Building a heap from n arbitrary elements one insertion at a time costs O(n log n) — each of n insertions pays its own O(log n) sift-up. Sifting down from the bottom instead costs O(n): most nodes sit near the bottom, where a sift-down's own cost, bounded by that node's height, is small.",
      body: (
        <>
          The same n elements, the same final heap — only the order of operations changed, and
          the total cost fell.
        </>
      ),
      duration: 4,
      fig: 'BuildReveal',
      takeaway: 'Bottom-up heap construction is O(n), not O(n log n) — most nodes sit near the bottom, where sift-down is cheap.',
      Visual: S.BuildReveal,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Measured, not assumed: real swap counts for one-at-a-time insertion against the
          bottom-up build on the identical input, and a direct check that both end at a valid
          heap.
        </>
      ),
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
