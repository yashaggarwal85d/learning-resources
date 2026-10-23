# Fact-check — Red-black trees

Adversarial pass, re-deriving every claim in `OUTLINE.md`'s claims list from the fetched source
texts in `sources/`, never from memory of writing the outline.

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | The red-black invariants: every node red or black; null nodes black; a red node never has a red child; every path to a leaf has the same number of black nodes. | Confirmed | `sources/wikipedia-red-black-tree.txt`: "A red node does not have a red child," "All null nodes are considered black," "Every path from a given node to any of its leaf nodes ... goes through the same number of black nodes." |
| 2 | A black node together with its red children corresponds to one 2-3-4 node (two-representation caveat for 3-nodes). | Confirmed | `sources/wikipedia-red-black-tree.txt`: "These 2–3–4 nodes correspond to black node – red children groups in red-black trees ... It is not a 1-to-1 correspondence, because 3-nodes have two equivalent representations: the red child may lie either to the left or right." |
| 3 | An insert needs at most two rotations total; a delete needs at most three; both occur outside the recolouring loop. | Confirmed | `sources/wikipedia-red-black-tree.txt`: "Rotations occur in cases I6 and I5 + I6 – outside the loop. Therefore, at most two rotations occur in total" (insert); "Rotations occur in cases 6 and 5 + 6 and 3 + 5 + 6 – all outside the loop. Therefore, at most three rotations occur in total" (delete). Corroborated independently by `sources/kernel-rbtree.txt`: "worst case performance for insertion and deletion (at most two rotations and three rotations, respectively, to balance the tree)." `examples.py` measures both bounds directly across 400 inserts and 40 deletes: observed max 2 for insert, max 2 for delete (within the ≤3 bound; the bound is an upper limit, not a guaranteed worst case on every run). |
| 4 | Named Linux kernel subsystems use rbtree. | Confirmed | `sources/kernel-rbtree.txt`: "The deadline and CFQ I/O schedulers employ rbtrees to track requests; the packet CD/DVD driver does the same. The high-resolution timer code uses an rbtree to organize outstanding timer requests. The ext3 filesystem tracks directory entries in a red-black tree. Virtual memory areas (VMAs) are tracked with red-black trees, as are epoll file descriptors, cryptographic keys, and network packets in the 'hierarchical token bucket' scheduler." |
| 5 | Java's `TreeMap` is a red-black tree implementation adapting CLRS's algorithms. | Confirmed | `sources/oracle-treemap.txt`: "A Red-Black tree based NavigableMap implementation," "Algorithms are adaptations of those in Cormen, Leiserson, and Rivest's Introduction to Algorithms." |
| 6 | C++'s `std::map` is usually implemented as a red-black tree. | Confirmed | `sources/cppreference-map.txt`: "Maps are usually implemented as Red–black trees." |
| 7 | A red-black tree's height stays O(log n) under topic 23's worst-case sorted insertion order, on the identical key set. | Confirmed by construction | `examples.py`: the identical 200-key set (reproduced bit-for-bit from topic 23's seed and random-call sequence), inserted in sorted order, reaches a plain BST height of 200 (recomputed here) versus a red-black tree height of 13. |
| 8 | The largest rotation count any single insert/delete triggers respects the two-and-three bound. | Confirmed by construction | `examples.py`: measured directly across 400 inserts (200 random-order, 200 sorted-order) and 40 deletes, with the red-black invariants checked after every single operation, not just at the end. |

## Red team: the two predict questions

**Step 3 (ViolationPredict).** Distractors tested against the real mechanism:
- "Nothing — the tree is still a valid BST, so it's fine" — wrong, and tests the exact misconception this topic exists to correct: the BST property and the colour invariant are two separate properties, and a valid BST can still be an invalid red-black tree.
- "The tree must be rebuilt from scratch" — wrong, and tests whether a learner assumes a violated invariant requires global repair rather than a local, bounded fix.
- "A recolouring and/or a rotation must restore the invariant before the tree is valid again" (correct) — the actual fixup mechanism.
- "The new node is simply rejected and not inserted" — wrong, and tests whether a learner confuses a red-black tree with a structure that can refuse an insert; nothing about the invariant blocks insertion itself.

**Step 6 (RotationBoundPredict).** Distractors tested against the real mechanism:
- "Unbounded — it depends on how deep the violation started" — wrong, and tests the single most important misconception this topic corrects: the recolouring climb can be deep, but the rotation that ends it is not.
- "At most two for an insert, at most three for a delete" (correct) — the real, sourced bound.
- "Exactly one, always" — wrong, and tests whether a learner over-simplifies the bound into a fixed count rather than an upper limit that depends on which case fires.
- "As many as the tree's current height" — wrong, and tests the same misconception as the first distractor, phrased as if the bound scaled with tree size.

## Currency notes

- Wikipedia's "Red–black tree" article is used for the invariants, the 2-3-4 correspondence, and the rotation bound, as a current, well-documented secondary source; its rotation bound is independently corroborated by the Linux kernel's own documentation (a primary implementation source), so no single claim rests on Wikipedia alone.
- The Linux kernel's `core-api/rbtree.html` is read directly from the current kernel documentation tree, not a secondary summary.
- Oracle's Java SE 21 API documentation and cppreference (via its current mirror, cppreference.net) are each read directly from the current, official or near-official reference for their respective language.

## Claims not made

- No claim about AVL trees, splay trees, or treaps' own balancing mechanisms — all are skipped in the syllabus for this chapter, and this topic names them only as alternatives with no mechanism taught.
- No claim that this topic's own measured numbers (height 13 vs. 200; max rotations observed) are the universal worst case for every possible sequence of operations — only that they respect the sourced upper bounds, measured honestly on one real run rather than cherry-picked to hit the bound exactly.
- No claim about the left-leaning red-black tree variant's own, stricter 1-to-1 correspondence with 2-3 trees — this topic uses the general CLRS-style red-black tree and 2-3-4 correspondence, not Sedgewick's left-leaning variant.
- No re-derivation of why the five invariants are sufficient to bound height at O(log n) beyond the 2-3-4 correspondence argument already stated — the full inductive proof is left to the cited sources.
