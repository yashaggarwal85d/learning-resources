# Fact-check — BST operations and rotations

Adversarial pass, re-deriving every claim in `OUTLINE.md`'s claims list from the fetched source
texts in `sources/`, never from memory of writing the outline.

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Search and insert both walk the BST property by comparison, left or right. | Confirmed by construction | `sources/princeton-bst.txt` defines the BST property (every node's key greater than its left subtree, less than its right) and the recursive search/insert walk directly from it; `examples.py` implements and verifies both against a real 200-key set. |
| 2 | Delete on a two-child node swaps in the node's in-order successor, which preserves order because no key lies between them. | Confirmed | `sources/princeton-bst.txt`: "is to delete a node x by replacing it with its successor," "Because x has a right child, its successor is the node with the smallest key in its right subtree," and "The replacement preserves order in the tree because there are no keys between x.key and the successor's key." |
| 3 | In-order traversal (left subtree, node, right subtree) yields every key in sorted order. | Confirmed | `sources/princeton-bst.txt`: "we begin with a basic recursive BST traversal method, known as inorder traversal," described as printing the left subtree, then the root, then the right subtree. `examples.py` verifies the traversal output equals Python's own `sorted()` of the same key set. |
| 4 | A rotation relinks a constant number of pointers and never changes a tree's in-order sequence. | Confirmed | `sources/mit6006-lec7-avl.txt`: "A rotation relinks O(1) pointers to modify tree structure and maintains traversal order." `examples.py` performs a real rotation on a 7-key tree and verifies the in-order sequence is byte-identical before and after. |
| 5 | An unbalanced BST's height can reach n under a sorted insertion order. | Confirmed by construction | `examples.py` inserts the identical 200-key set in random order (height 17) and in sorted order (height exactly 200 — one long chain), measured directly. |
| 6 | Every number put on screen (step 8) is measured directly in `examples.py`. | Confirmed by construction | See `examples.py` itself. |

## Red team: the predict question

**Step 3 (DegeneratePredict).** Distractors tested against the real mechanism:
- "A balanced, roughly log n deep tree, same as usual" — wrong, and tests whether a learner assumes the BST property itself guarantees balance, which it never does; balance is a property of insertion order, not of the BST property.
- "One long chain — every node has only a right child, height n" (correct) — directly what sorted insertion produces: each new key is larger than every existing key, so it always becomes the current rightmost node's right child.
- "A random, unpredictable shape" — wrong, and tests whether a learner assumes insertion order has some randomizing effect on shape, when a sorted order is in fact the single most deterministic, worst-case order possible.
- "A single node holding every key" — wrong, and tests whether a learner conflates "every key ends up on one path" with "every key ends up in one node," confusing a degenerate tree with a different structure entirely.

## Currency notes

- Sedgewick and Wayne's Algorithms, 4th Edition companion site is the current, official, freely-available reference for this material, maintained by the book's own authors at Princeton.
- MIT 6.006 (Spring 2020)'s own lecture 7 PDF is read directly from the course's current OpenCourseWare listing, not a secondary summary.

## Claims not made

- No claim about AVL trees, splay trees, or treaps' own balancing mechanisms — all are skipped in the syllabus for this chapter, and this topic defines the rotation with no invariant attached, leaving every specific scheme to name its own.
- No claim that this topic's own measured heights (17 for random, 200 for sorted, on 200 keys) match any particular textbook's worked example — they are this topic's own honest measurement of the same well-known phenomenon.
- No claim about the general "O(n) rotations can transform any BST into any other" result beyond naming it (from `sources/mit6006-lec7-avl.txt`) as framing for why later balancing schemes can rely on rotations alone — not re-derived or used as a bound in this topic's own claims.
