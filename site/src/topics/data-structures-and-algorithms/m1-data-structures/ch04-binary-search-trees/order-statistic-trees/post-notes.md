---
id: dsa.order-statistic-trees
title: Order-statistic trees
---

<section data-section="outcomes">

## After this topic you can

- Augment a balanced BST with subtree sizes, kept correct across insert, delete and rotation.
- Answer a rank query and a select query in O(log n) using subtree sizes.
- State the general rule for which augmentations survive a rotation, and why subtree size satisfies it.

</section>

<section data-section="internals">

## Into the internals

### Why incrementing sizes along the insert path is correct

An insert's new key becomes a descendant of every node on the root-to-leaf path it walked down, and of no other node in the tree. Since a node's size counts exactly the number of nodes in its own subtree including itself, every node that gained a descendant must have its size increased by exactly one, and every node that didn't gain one must stay exactly as it was. The insert walk and the size update walk are the same walk, which is why the bookkeeping costs nothing beyond what the insert was already doing.

### Why a rotation only invalidates two nodes' sizes

A rotation changes exactly one parent-child relationship: one node is promoted, its former parent is demoted, and a small, fixed number of subtrees are repositioned beneath them. Every node that wasn't one of those two keeps precisely the same set of descendants it had before — its subtree's membership never changed, so its size doesn't need recomputing. Only the two nodes whose set of descendants actually changed (the promoted and demoted node) need their sizes recomputed, and each can be recomputed in O(1) directly from its new two children's sizes. This is the specific instance of a more general rule: an augmented field survives a rotation at constant cost exactly when it can be computed from a node and its immediate two children alone, never from scanning further down the subtree.

</section>

<section data-section="lab">

## In the lab

`examples.py` reuses topic 24's red-black tree class directly, augmented with a subtree-size field. On an identical 200-key set inserted in sorted order, a select query's comparison count never exceeds the tree's own height (13), and neither does a rank query's climb length. Isolating a single rotation from any fixup chain and snapshotting every node's size before and after confirms that exactly two sizes change — never more, regardless of which two nodes are involved.

</section>

<section data-section="production">

## In production

Augmented balanced trees carrying a subtree-size field underlie the order-statistic structures used wherever a sorted container needs fast rank and select alongside the usual search, insert and delete — the same red-black trees topic 24 already named in `std::map`, Java's `TreeMap`, and several Linux kernel subsystems are the natural base for this augmentation, though none of those specific libraries ship rank/select as a public operation by default.

</section>

<section data-section="frontier">

## The frontier

Interval trees apply the identical general rule to a different field (each node storing the maximum endpoint in its own subtree, to answer overlap queries), skipped in this chapter's syllabus but named here as the same methodology applied elsewhere.

</section>

<section data-section="questions">

## More questions

- Why can't rank itself be stored directly at each node, the way size is?
- What breaks if an augmented field depended on more than just a node's immediate two children?

</section>

<section data-section="next">

## Where this goes next

Every structure in this chapter keeps its keys in order using pointers and rotations, one node at a time. The next chapter asks what happens when a node is too expensive to visit one at a time at all — when a node is a disk page, not a pointer. B-trees, next, and the splits and merges that replace rotations entirely.

</section>
