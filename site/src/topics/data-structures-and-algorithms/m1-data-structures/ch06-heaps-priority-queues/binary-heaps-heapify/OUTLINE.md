# Outline — Binary heaps and heapify (topic 30, dsa.binary-heaps-heapify, refresher)

## Learning outcomes

- Trace a sift-up and a sift-down by hand and show each restores the heap property.
- State and justify the O(n) bottom-up build bound, and contrast it against the O(n log n) bound of n one-at-a-time insertions on the same input.
- Compute a node's parent and child indices directly from its own array position, with no pointers involved.

## Engagement arc (refresher: fast recap, one predict in the first four steps)

- **Hook** (step 1): Chapter 5's own closing line — every structure so far asked where data sits; this one asks only which one is smallest, right now.
- **Predict** (step 3, "SiftUpPredict"): an element just got appended past the end. What has to happen before it's a valid heap again?
- **Surprising number**: the chapter's own `examples.py` measures a real swap-count gap between one-at-a-time insertion and the bottom-up build on the identical input.
- **Takeaway** (step 6).
- **Recap** (step 7, "ProveIt").

## 7-step reel storyboard

1. **Opening.** *Title:* "Every structure in this chapter optimized where data physically sits — on a page, in a run, across a level — to make a block of I/O count for as much work as possible. The next chapter asks a narrower question, answered the same way regardless of where anything sits: of everything not yet processed, which one is smallest, right now." *Body:* "No sorting, no page, no pointer. Just: what's smallest, right now, as things keep arriving." *Visual:* a loose scatter of values settling into one highlighted minimum.

2. **ArrayTree.** *Title:* "A binary heap's tree lives entirely in one flat array — no pointers at all. A node at index i has its children at indices 2i+1 and 2i+2, and its parent at index floor((i−1)/2)." *Body:* "The tree shape is free. It's computed from a position, not stored anywhere." *Visual:* an array drawn twice — once as a row of boxes, once redrawn as the implicit tree it represents, with one node's own index arithmetic traced live.

3. **SiftUpPredict.** *Title:* "A new value just landed at the array's own end, past every other element. What has to happen before this is a valid heap again?" *Predict options:* (a) "Nothing — the heap property doesn't care about insertion order" (b) "The whole heap gets rebuilt from scratch" (c) "The new value walks up toward the root, swapping with its parent until it's no longer out of order" (correct) (d) "The smallest element gets moved to the end instead." *Visual:* a value appended past the array's current end, a question mark over it.

4. **SiftUpReveal.** *Title:* "Sift-up: compare the new value with its parent; if the heap property already holds, stop. If not, swap them, and repeat from the new position." *Body:* "Only the single path from the new leaf up to the root is ever touched — nothing else in the heap moves." *Visual:* the new value walking up the tree one swap at a time, the rest of the heap undisturbed.

5. **SiftDownReveal.** *Title:* "Removing the minimum empties the root. Sift-down fills it: move the array's last element into the root, then walk it down, swapping with whichever child is smaller, until it's no longer out of order." *Body:* "Same move as sift-up, aimed the other way — one path, root to wherever it stops." *Visual:* the root replaced, then walking down the tree toward whichever child is smaller at each step.

6. **BuildReveal.** *Title:* "Building a heap from n arbitrary elements one insertion at a time costs O(n log n) — each of n insertions pays its own O(log n) sift-up. Sifting down from the bottom instead costs O(n): most nodes sit near the bottom, where a sift-down's own cost, bounded by that node's height, is small." *Body:* "The same n elements, the same final heap — only the order of operations changed, and the total cost fell." *Visual:* two side-by-side swap-count bars, one-at-a-time against bottom-up, on the identical input.
   *Takeaway (step 6):* "Bottom-up heap construction is O(n), not O(n log n) — most nodes are near the bottom, where a sift-down is cheap."

7. **ProveIt.** *Title:* "Prove it." *Body:* "Measured, not assumed: real swap counts for one-at-a-time insertion against the bottom-up build on the identical input, and a direct check that both end at a valid heap." *Visual:* the swap-count comparison from step 6, now populated with `examples.py`'s own measured numbers.

## Narrator's line of thought (one bullet per step)

1. Every earlier chapter asked where something sits. This one drops that question entirely.
2. The tree was never really there — it's just arithmetic on where something already sits in an array.
3. Before I show you the fix, think about what actually breaks when a value lands out of order at the very end.
4. Notice what sift-up doesn't touch: everything except one path stays exactly where it was.
5. Sift-down is the same idea run in reverse, and for the same reason: touch one path, trust the rest.
6. Here's the part that surprises people: changing nothing about the operation, only the order you apply it in, changes the total cost class.
7. This is the one place in the whole topic where a claim gets checked against a real count, not just argued.

## Post-notes headings

- **Internals**: the formal sum-of-heights argument for the O(n) bottom-up bound (most nodes near the bottom have small height, and the heights across a complete binary tree sum to O(n), not O(n log n)).
- **Lab**: `examples.py`'s own one-at-a-time vs. bottom-up swap-count measurement.
- **Production**: heapsort's own use of the bottom-up build as its first phase, in a real, current textbook implementation.
- **Frontier**: named only in passing — d-ary heaps and other heap variants, deferred to the syllabus's own skipped topics.
- **Where this goes next**: topic 31's own k-way merge, where a binary heap is the baseline a tournament/loser tree is contrasted against.

## Examples-to-execute list

1. Build a binary heap from scratch (array-backed, zero-indexed, explicit parent/child index arithmetic), with `sift_up` and `sift_down` as the only two repair operations.
2. Insert n elements one at a time (each triggering its own `sift_up`) and count the total number of swaps.
3. Build a heap from the identical n elements via the bottom-up method (place them arbitrarily, then `sift_down` from the last internal node up to the root) and count the total number of swaps.
4. Assert the bottom-up build's swap count is asymptotically smaller than the one-at-a-time build's, on the same input, and assert both methods produce a valid heap (the heap property holds at every node) at the end.
5. Assert a node's computed parent/child indices via the stated formula match a direct check against the array's own contents at every step of a sift.

## Bridge (Chapter 5's own handoff, quoted word for word)

"Every structure in this chapter optimized where data physically sits — on a page, in a run, across a level — to make a block of I/O count for as much work as possible. The next chapter asks a narrower question, answered the same way regardless of where anything sits: of everything not yet processed, which one is smallest, right now. Binary heaps, next."

## Handoff (this topic's own, quoted word for word from `CHAPTER.md`)

"A binary heap answers what's smallest right now for one stream of insertions. A k-way merge asks the same question across several already-sorted streams at once, every time it produces one output — and a heap's own sift-down re-examines a full root-to-leaf path to answer it, which is more comparison work than the problem actually requires. Tournament and loser trees, next: the structure built to hit the bound a k-way merge actually allows."

## Concept ledger

- **Introduces:** `binary-heap`, `sift-up-down`, `implicit-array-tree`, `heapify-linear-build`.
- **Uses:** none from an earlier chapter as a reused mechanism.
- **Declared:** none new beyond its own.

## Claims list (claim → source)

1. Sift-up: compare with parent, swap and repeat if out of order, otherwise stop → Wikipedia "Binary heap".
2. Sift-down: compare with children, swap with the smaller (min-heap) and repeat if out of order, otherwise stop → Wikipedia "Binary heap".
3. Implicit zero-indexed array formula: children at 2i+1, 2i+2; parent at floor((i−1)/2) → Wikipedia "Binary heap".
4. The same relationship in a 1-indexed array: parent at k/2, children at 2k, 2k+1 → Sedgewick & Wayne, "Priority Queues".
5. One-at-a-time insertion (Williams' method) costs O(n log n) → Wikipedia "Binary heap".
6. Bottom-up sift-down construction (Floyd's method) costs O(n), because most of the heapification work happens in the lower levels → Wikipedia "Binary heap"; "Sink-based heap construction is linear time" → Sedgewick & Wayne, "Priority Queues".

## Claims not made

- The full closed-form sum-of-heights proof (the exact asymptotic series) is named and used as the source's own stated result, not re-derived symbol by symbol on screen; the topic instead measures the real swap-count gap directly in `examples.py`.
- Heap variants (d-ary heaps, monotone integer priority queues) are named only in the frontier section, per the chapter plan's own skip list, not taught as mechanisms.
- Heapsort's own second phase (the sortdown) is named only in the production section as where the bottom-up build is actually used, not taught as its own mechanism.
