---
id: dsa.bst-operations-rotations
title: BST operations and rotations
---

<section data-section="outcomes">

## After this topic you can

- Search, insert and delete (via successor swap) on a plain BST, and explain why in-order traversal yields sorted output.
- Perform a single rotation and show it preserves the BST property.
- Explain why an unbalanced BST's height can reach n under an adversarial or merely unlucky insertion order.

</section>

<section data-section="internals">

## Into the internals

### Why the BST property alone says nothing about height

The BST property only constrains where a key can sit relative to its ancestors, by Sedgewick and Wayne's own definition: every node's key is greater than every key in its left subtree and less than every key in its right subtree. Nothing in that definition bounds how deep the tree gets. A sorted insertion order satisfies the property at every single step — each new key really is larger than everything already present, so it belongs as the current rightmost node's right child — while still producing one long chain of height n, exactly the shape of a linked list. The property is about key order, not about shape; a tree can be perfectly valid and perfectly degenerate at the same time.

### Why a rotation never changes the in-order sequence

A rotation relinks a constant number of pointers — "a rotation relinks O(1) pointers to modify tree structure and maintains traversal order," per MIT 6.006's own lecture. The reason it preserves order is structural: a rotation only changes which node is whose parent among a small, fixed set of nodes already related by the BST property (a node, its child, and that child's subtree get repositioned), and it never moves a key across a boundary it wasn't already inside. The ranges of keys each subtree is responsible for swap which position they occupy, but no individual key's position relative to any other key changes, so the sequence read back out by an in-order walk is identical before and after.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds a real, unbalanced BST from scratch and measures two things directly: the height of an identical 200-key set inserted in random order (17) versus sorted order (exactly 200 — one long chain), and whether a single rotation performed on a 7-key tree changes the tree's in-order sequence (it does not — verified byte-identical before and after).

</section>

<section data-section="production">

## In production

Real binary search trees essentially never ship unbalanced in production code, precisely because the degenerate case this topic measures is so easy to trigger by accident (any sorted or near-sorted feed of keys). The fix — a balancing invariant enforced by rotations — is handed entirely to the next topic; this one only establishes the primitive every such scheme will reuse.

</section>

<section data-section="frontier">

## The frontier

AVL trees, splay trees, and treaps are each a different rule for deciding when to rotate, none covered in this chapter's syllabus; they are named here with no mechanism taught.

</section>

<section data-section="questions">

## More questions

- Why does an already-sorted insertion order produce the worst case, rather than some other order?
- If you rotated every node in a sorted-order tree once, would it become balanced?

</section>

<section data-section="next">

## Where this goes next

A rotation preserves order, but nothing here keeps a tree's height small. Sorted insertions already showed what goes wrong. Red-black trees, next: the colour invariant that forces a rotation before that happens.

</section>
