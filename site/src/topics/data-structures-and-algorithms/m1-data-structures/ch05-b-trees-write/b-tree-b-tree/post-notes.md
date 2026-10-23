---
id: dsa.b-tree-b-tree
title: B-tree and B+-tree mechanics
---

<section data-section="outcomes">

## After this topic you can

- Explain why a B+Tree keeps all records in its leaves, linked to their siblings, rather than scattered across internal nodes like a classic B-tree.
- Walk through a split and a merge and show each keeps every node at least half full.
- State and justify the Θ(log_B N) I/O bound for a search, and contrast it against Chapter 4's Θ(log₂ N) comparison bound on the same N.

</section>

<section data-section="internals">

## Into the internals

### Why a leaf split copies its key up, and an inner-node split doesn't

A leaf is the only place a B+Tree stores a record's actual key and value. When a leaf splits, the middle key has to end up in a leaf somewhere so a later search can still find it — so the split copies it up to the parent as a routing key, while also keeping it in the new right leaf. An inner node never stores a record, only routes to one, so when an inner node splits there is nothing to keep two copies of: the middle key is pushed up to that node's own parent and dropped from both halves. This single distinction (copy vs. push) is the one place the leaf/inner-node split differ.

### Why a merge is the only move that changes height

A split can only ever make the tree taller, and only at the root: every other split just adds one more entry to an already-existing parent. A borrow moves one key sideways between siblings and never touches the parent's own key count in a way that cascades. A merge is the one move that removes an entry from the parent (the separator key between the two merging nodes), and if that removal itself underflows the parent, the fix propagates upward the same way — the only path, however rare, by which this tree's height can shrink.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds a small, order-four B+Tree on the identical two-hundred-key set topics 23 through 25 used, and measures its height directly against topic 24's own measured red-black-tree height on the same keys. It then deletes sixty of those keys, forcing both a borrow and a merge to occur (both code paths are exercised, not just one), and verifies every remaining key is still reachable in sorted order by walking the leaves' own sibling links. A range scan's I/O count is measured directly against what re-descending from the root for every matching key would have cost. Separately, the fanout-and-height formula is checked arithmetically against a realistic page and key size at a billion keys, and against a published worked table at a trillion.

</section>

<section data-section="production">

## In production

PostgreSQL's own `nbtree` implementation is a current, production example of the Lehman and Yao concurrent B-tree algorithm: it adds a right-link pointer from every page to its right sibling, the structural ancestor of the sibling-linked range scan this topic teaches, plus a "high key" on every page that lets a search detect a concurrent split without holding a read lock across the whole operation. A textbook B+Tree diagram has no concurrency story at all; a real one needs this.

</section>

<section data-section="frontier">

## The frontier

Copy-on-write B-trees (used by LMDB and Btrfs) trade in-place updates for path copying to the root, buying crash safety and free snapshots at the cost of write amplification and free-space bookkeeping. Learned indexes replace the tree search itself with a learned model of the key distribution. Both are skipped in this syllabus (named here only in passing, no mechanism taught) as research-tier alternatives to the mechanics this topic covers.

</section>

<section data-section="questions">

## More questions

- Why does an inner-node split drop the promoted key instead of keeping a copy, when a leaf split keeps one?
- What would go wrong with the sibling-linked range scan if a split could happen mid-scan with no concurrency protocol at all?

</section>

<section data-section="next">

## Where this goes next

A B+Tree's height is bounded, but only if its nodes are actually full of keys, not full of wasted bytes. Node engineering, next: what it takes to make a real page hold as many keys as the hardware allows.

</section>
