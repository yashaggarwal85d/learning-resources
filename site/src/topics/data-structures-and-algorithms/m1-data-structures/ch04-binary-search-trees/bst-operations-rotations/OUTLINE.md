# Outline — BST operations and rotations

## Learning outcomes

1. Search, insert and delete (via successor swap) on a plain BST, and explain why in-order traversal yields sorted output.
2. Perform a single rotation and show it preserves the BST property.
3. Explain why an unbalanced BST's height can reach n under an adversarial or merely unlucky insertion order.

## Engagement arc

- **Hook (step 1):** Chapter 3 answered "where is the key" by turning it into a number and giving up on order entirely; this refresher asks what you get back if you keep the keys in order instead — and what it costs.
- **Predict (step 3):** "insert these timestamps in sorted order instead of random order. What shape does the tree take?"
- **Takeaways:** steps 4, 5, 7 (three).
- **Recap (step 8, "Prove it"):** measured, side by side — the identical key set's height under random order vs sorted order, and a rotation's in-order sequence before and after.

## Steps

### 1 — Opening
- **fig:** `Opening`
- **Visual idea:** Chapter 3's hash table (no order at all) fading, a binary search tree growing in its place, keys landing in order left-to-right.
- **Caption:** hashing answered where a key lives by giving up on order completely. This topic keeps the keys in order instead — and asks what that costs.
- **Narrator's line of thought:** "last chapter turned a key into a number and lost its order on purpose. This one keeps the order, on purpose."

### 2 — SearchInsert
- **fig:** `SearchInsert`
- **Visual idea:** a small BST with a search path lit from the root down, comparing left/right at each node until it lands or fails; an insert following the same path to its new leaf.
- **Caption:** search and insert both just walk the same comparison: smaller, go left; bigger, go right. Insert is a search that keeps going until it finds an empty spot.
- **Narrator's line of thought:** "one comparison rule does both jobs — finding a key, and finding where a new one belongs."

### 3 — DegeneratePredict (predict)
- **fig:** `DegeneratePredict`
- **Visual idea:** a handful of timestamps about to be inserted in already-sorted order, asking what shape results.
- **Predict options:**
  1. "A balanced, roughly log n deep tree, same as usual"
  2. **"One long chain — every node has only a right child, height n"** (correct)
  3. "A random, unpredictable shape"
  4. "A single node holding every key"
- **Explain:** each new key is bigger than everything already in the tree, so it always becomes the new rightmost node's right child. The tree degrades to exactly what a linked list already was.
- **Narrator's line of thought:** "nothing broke. The BST property held the entire time. The shape just quietly became the worst possible one."

### 4 — DegenerateReveal
- **fig:** `DegenerateReveal`
- **Visual idea:** the same key set drawn two ways side by side — inserted in random order (shallow) and in sorted order (one long rightward chain).
- **Caption:** same keys, same BST property, completely different height. One insertion order degrades search from O(log n) to O(n), silently.
- **Takeaway:** "An unbalanced BST's height can reach n under a sorted or adversarial insertion order — nothing in the BST property prevents it."
- **Narrator's line of thought:** "this is the entire reason the next topic exists. Order alone was never the hard part."

### 5 — DeleteSuccessor
- **fig:** `DeleteSuccessor`
- **Visual idea:** a node with two children being deleted, its in-order successor (the leftmost node of its right subtree) sliding up into its place.
- **Caption:** deleting a two-child node swaps in its in-order successor — the smallest key bigger than it. No key sits between them, so the order never breaks.
- **Takeaway:** "Deleting a two-child node by swapping in its in-order successor preserves the BST property, because no key lies between them."
- **Narrator's line of thought:** "the hard delete case isn't really hard — you just need the one key guaranteed not to disturb anything."

### 6 — InOrderTraversal
- **fig:** `InOrderTraversal`
- **Visual idea:** the same tree walked left-subtree, node, right-subtree, recursively, with each visited key appearing in a growing sorted list beneath.
- **Caption:** walk left, visit, walk right, every time. That one rule is enough to read every key back out in sorted order.
- **Narrator's line of thought:** "this is the BST property proving itself — the output is sorted because the shape forced it to be."

### 7 — Rotation
- **fig:** `Rotation`
- **Visual idea:** a small subtree rotating — one node promoted, its parent demoted, two or three pointers re-linked — drawn as a two-frame before/after move.
- **Caption:** a rotation relinks a constant number of pointers and changes the tree's shape — but never its in-order sequence of keys.
- **Takeaway:** "A rotation relinks a constant number of pointers, changing a tree's shape while never changing its in-order sequence of keys."
- **Narrator's line of thought:** "this one move is the entire toolkit every balancing scheme after this topic will use. Nothing more is needed — just when to use it."

### 8 — ProveIt
- **fig:** `ProveIt`
- **Visual idea:** two measured bar pairs — height under random vs sorted insertion order on the identical key set; a rotation's in-order sequence shown unchanged before and after.
- **Caption:** measured, not assumed: the same keys reach wildly different heights depending on insertion order, and a rotation changes shape without ever touching that order.
- **Narrator's line of thought:** recap — "order preserved, height not guaranteed. That's exactly the gap the next topic closes."

## Post-notes headings (Deep dive)

- `outcomes` — the three learning outcomes above.
- `internals` — why the BST property alone says nothing about height; why a rotation never changes the in-order sequence (the subtree ranges swap positions, but their internal order doesn't).
- `lab` — this topic's own `examples.py` measurement: height under random vs sorted insertion order, and a rotation's in-order sequence before and after.
- `production` — real BSTs rarely ship unbalanced in practice; named briefly, with the balancing schemes that fix this handed to the next topic.
- `frontier` — self-balancing schemes this chapter doesn't cover in full (AVL, splay trees, treaps), named with no mechanism, since the syllabus skips them.
- `questions` — "Why does an already-sorted insertion order produce the worst case, rather than some other order?"; "If you rotated every node in a sorted-order tree once, would it become balanced?"
- `next` — the handoff below, word for word.

## Examples to execute (`examples.py`)

1. A plain BST built from scratch: search, insert, delete by successor swap, and in-order traversal, all verified against a real key set.
2. A measurement of tree height for the identical key set inserted in random order versus sorted order.
3. A single rotation performed on a small tree, with its in-order sequence checked identical before and after.
4. Every number shown on screen (step 8) is asserted directly from these runs.

## Bridge and handoff

- **Bridge** (word for word, matching `CHAPTER.md`): Chapter 3's own final handoff: "Every structure in this chapter answered 'where is the key' or 'do these two copies agree' by turning data into a number. The next chapter asks a question hashing can't answer at all: keep the keys in order, so you can ask for the smallest, the largest, or everything between two bounds. Binary search trees, next, and the rotations that keep one balanced."
- **Handoff** (word for word, matching `CHAPTER.md`): "A rotation preserves order, but nothing here keeps a tree's height small. Sorted insertions already showed what goes wrong. Red-black trees, next: the colour invariant that forces a rotation before that happens."

## Concept ledger

- **Introduces:** `binary-search-tree`, `in-order-traversal`, `tree-rotation`, `successor-swap`.
- **Uses:** none beyond general pointer/node structures (Ch.2).
- **Declared:** none new beyond its own.

## Claims list (claim → source)

1. Search and insert both walk the BST property by comparison, left or right. → `SOURCES.md` § Princeton (the BST property and traversal mechanism, applied directly).
2. Delete on a two-child node swaps in the node's in-order successor, which preserves order because no key lies between them. → `SOURCES.md` § Princeton.
3. In-order traversal (left subtree, node, right subtree) yields every key in sorted order. → `SOURCES.md` § Princeton.
4. A rotation relinks a constant number of pointers and never changes a tree's in-order sequence. → `SOURCES.md` § MIT 6.006.
5. An unbalanced BST's height can reach n under a sorted insertion order. → `examples.py` (measured directly).
6. Every number put on screen (step 8) is measured directly in `examples.py`.

## Changes from the chapter plan

None. This topic follows `CHAPTER.md`'s own entry directly: a refresher with no balancing invariant, ending on the exact degenerate-height problem topic 24 exists to solve.
