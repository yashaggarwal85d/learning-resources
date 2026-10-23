---
id: dsa.red-black-trees
title: Red-black trees
---

<section data-section="outcomes">

## After this topic you can

- State the five red-black invariants and explain how they bound a tree's height at O(log n).
- Walk through an insert that violates an invariant and the rotation and/or recolouring that restores it.
- Name at least two real production uses of red-black trees and why each one chose this scheme.

</section>

<section data-section="internals">

## Into the internals

### Why a red-black tree is really a 2-3-4 tree in disguise

The colour invariant isn't an arbitrary bookkeeping rule bolted onto a BST — it's a direct encoding of a wider, four-way tree. A black node together with its red children corresponds to one 2-3-4 node; a black node with no red children is a 2-node, with one red child a 3-node, with two red children a 4-node. Because every path from the root to a leaf passes through the same number of black nodes, every 2-3-4 node's corresponding black-and-red group sits at the same relative position, which is exactly why the leaves of the underlying 2-3-4 tree all land at the same level. A 2-3-4 tree with n keys has height O(log n) by construction (each node holds up to three keys), and since every 2-3-4 node expands into at most two red-black tree levels, the red-black tree's height stays within a constant factor of that bound — O(log n), never the O(n) a plain BST risks.

### Why the rotation bound holds no matter how far the recolouring climbs

An insert or delete can leave a colour violation that recolouring alone has to walk back up toward the root to fix, level by level, and that climb really can be as long as the tree is tall. But every fixup case that performs an actual rotation sits outside that climbing loop — it's the move that ends the climb, not a step repeated inside it. That's why the total rotation count per operation stays fixed (at most two for an insert, at most three for a delete) even though the recolouring itself has no such fixed limit.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds a real CLRS-style red-black tree from scratch, checking all five invariants after every single insert and delete, never just once at the end. On the identical 200-key set topic 23 used, inserted in the same worst-case sorted order, the red-black tree reaches a height of 13 against the plain BST's 200. Across 400 inserts and 40 deletes, the largest number of rotations any single operation ever triggered is 2, comfortably inside the sourced two-and-three bound.

</section>

<section data-section="production">

## In production

cppreference's own current documentation for `std::map` states that maps are usually implemented as red-black trees. Java's `TreeMap` Javadoc (Java SE 21) describes itself directly as "a Red-Black tree based NavigableMap implementation," with algorithms adapted from Cormen, Leiserson, and Rivest's own textbook. The Linux kernel's own rbtree documentation names the deadline and CFQ I/O schedulers, the packet CD/DVD driver, the high-resolution timer code, the ext3 filesystem, virtual memory areas, epoll file descriptors, cryptographic keys, and the hierarchical token bucket packet scheduler as real users of its red-black tree implementation — all three read from each project's own current, primary documentation.

</section>

<section data-section="frontier">

## The frontier

AVL trees, splay trees, and treaps are each a different balancing scheme with their own invariant and trade-offs, none covered in this chapter's syllabus; they are named here with no mechanism taught.

</section>

<section data-section="questions">

## More questions

- Why does recolouring alone sometimes suffice, while other times a rotation is unavoidable?
- What would go wrong if the root were allowed to be red?

</section>

<section data-section="next">

## Where this goes next

A balanced tree answers 'is x here' in O(log n). It says nothing about x's rank among everything else in the tree. Order-statistic trees, next: a small amount of extra bookkeeping at each node, and that question is answered too.

</section>
