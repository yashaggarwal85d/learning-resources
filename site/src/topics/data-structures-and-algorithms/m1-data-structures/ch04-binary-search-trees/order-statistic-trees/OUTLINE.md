# Outline — Order-statistic trees

## Learning outcomes

1. Augment a balanced BST with subtree sizes, kept correct across insert, delete and rotation.
2. Answer a rank query and a select query in O(log n) using subtree sizes.
3. State the general rule for which augmentations survive a rotation, and why subtree size satisfies it.

## Engagement arc

- **Hook (step 1):** topic 24's balanced tree answers "is x here" in O(log n). It says nothing about x's rank among everything else in the tree. A small amount of extra bookkeeping, and that question is answered too.
- **Predict 1 (step 3):** "insert a key into this augmented tree. Which nodes' sizes actually need updating?"
- **Predict 2 (step 6):** "a rotation relinks the pointers of two nodes. How many nodes' subtree sizes does it actually have to recompute?"
- **Takeaways:** steps 4, 7, 8 (three).
- **Recap (step 10, "Prove it"):** measured, side by side — a select and a rank query's actual comparison count against the tree's height, and the number of subtree sizes a real rotation recomputes.

## Steps

### 1 — Opening
- **fig:** `Opening`
- **Visual idea:** topic 24's red-black tree, each node gaining a small subtree-size label beside its key.
- **Caption:** a balanced tree answers "is x here" in O(log n). It says nothing about x's rank among everything else in the tree. A small amount of bookkeeping, and that question is answered too.
- **Narrator's line of thought:** "every structure so far answered membership. This one answers position — for almost nothing extra."

### 2 — SizeAugmentation
- **fig:** `SizeAugmentation`
- **Visual idea:** the same tree with every node's subtree size labelled, each size visibly equal to its two children's sizes plus one.
- **Caption:** one extra number per node: the size of its own subtree, including itself. Each one is just its children's sizes, plus one for itself.
- **Narrator's line of thought:** "nothing about the keys changed. Every node just started counting how much of the tree sits beneath it."

### 3 — InsertPredict (predict)
- **fig:** `InsertPredict`
- **Visual idea:** a new key about to be inserted, the root-to-new-leaf path highlighted before the insert happens.
- **Predict options:**
  1. "Only the new leaf itself"
  2. "Every node on the path from the root down to the new leaf" (correct)
  3. "Every node in the entire tree"
  4. "Only the root"
- **Explain:** every node on that path gained exactly one new descendant — the inserted key — so every one of their sizes grows by one. Nothing off that path changed at all.
- **Narrator's line of thought:** "the insert only touches one path. The bookkeeping only has to follow it."

### 4 — InsertReveal
- **fig:** `InsertReveal`
- **Visual idea:** the insert path's sizes incrementing one by one, root to leaf, the rest of the tree untouched and dimmed.
- **Caption:** one new key, one path, one increment at every node along it — never a re-scan of anything beneath.
- **Takeaway:** "Inserting a key increments the size of every node on the root-to-leaf path it followed, in time proportional to the tree's height."
- **Narrator's line of thought:** "this is why the augmentation is free. The insert was already walking this exact path."

### 5 — SelectWalk
- **fig:** `SelectWalk`
- **Visual idea:** a select query walking down from the root, at each node comparing the target rank against the left subtree's size plus one, going left, going right, or stopping.
- **Caption:** want the fifth-smallest key? Compare five against the left subtree's size. Too big, subtract and go right. Too small, go left. Exactly right, stop.
- **Narrator's line of thought:** "this is quickselect's own trick, except the tree already did the partitioning for you, permanently."

### 6 — RotationPredict (predict)
- **fig:** `RotationPredict`
- **Visual idea:** a rotation about to fire on a small augmented subtree, sizes still showing their pre-rotation values, the question posed before the fixup is drawn.
- **Predict options:**
  1. "All the sizes in the subtree being rotated"
  2. "Every size along the path back up to the root"
  3. "Only the two nodes incident to the rotated edge" (correct)
  4. "None — the sizes stay correct automatically"
- **Explain:** a rotation only changes which two nodes are parent and child; every other node keeps exactly the same set of descendants it had before. Only those two nodes' subtrees actually changed shape.
- **Narrator's line of thought:** "a rotation looks like it should disturb a lot. It disturbs exactly two numbers."

### 7 — RotationReveal
- **fig:** `RotationReveal`
- **Visual idea:** the rotation firing, only the two incident nodes' size labels updating, every other node's label frozen in place.
- **Caption:** two nodes change parent. Two sizes get recomputed. Everything else was never touched.
- **Takeaway:** "A rotation recomputes the subtree size of only the two nodes incident to the rotated edge — not a wider re-scan."
- **Narrator's line of thought:** "this is the entire reason augmenting a red-black tree doesn't cost anything extra per rotation."

### 8 — GeneralRule
- **fig:** `GeneralRule`
- **Visual idea:** the size field's recomputation (sum of two children plus one) redrawn as a generic box labelled "any field computable from this node and its two children," with a second, grayed-out box labelled "a field needing the whole subtree" crossed out.
- **Caption:** size survives a rotation because it's computed from just a node and its two children. Any augmented field with that property survives the same way, at the same cost.
- **Takeaway:** "An augmented field survives a rotation in constant time exactly when it's computable from the rotated node's new children alone, never a re-scan of the whole subtree."
- **Narrator's line of thought:** "subtree size isn't special. It's just the simplest example of a much more general rule."

### 9 — RankQuery
- **fig:** `RankQuery`
- **Visual idea:** a rank query climbing from a given node up to the root, adding a left subtree's size each time the path comes up from a right child.
- **Caption:** rank runs the same trick upward: climb to the root, and every time you climb up from a right child, add that side's whole left subtree to the count.
- **Narrator's line of thought:** "select walks down counting forward. Rank walks up, counting everything it passed on the way."

### 10 — ProveIt
- **fig:** `ProveIt`
- **Visual idea:** two measured bar pairs — a select query's comparison count against the tree's height on a real augmented tree; the number of subtree sizes one real rotation recomputes.
- **Caption:** measured, not assumed: a select query's comparisons stay tied to height, and a rotation's size fixup never touches more than two nodes.
- **Narrator's line of thought:** recap — "membership was already free. Rank and select turned out to be almost free too."

## Post-notes headings (Deep dive)

- `outcomes` — the three learning outcomes above.
- `internals` — why incrementing sizes along the insert path is correct; why a rotation only invalidates two nodes' sizes.
- `lab` — this topic's own `examples.py` measurement: select/rank comparison counts against height on topic 24's red-black tree, and the number of sizes a real rotation recomputes.
- `production` — augmented balanced trees underlie order-statistic and interval-tree libraries; named briefly, with no new named system beyond what topic 24 already established for the underlying tree.
- `frontier` — interval trees (max-endpoint augmentation), skipped in this syllabus, named as the same general rule applied to a different field.
- `questions` — "Why can't rank itself be stored directly at each node, the way size is?"; "What breaks if an augmented field depended on more than just a node's immediate two children?"
- `next` — the handoff below, word for word.

## Examples to execute (`examples.py`)

1. The identical red-black tree built in topic 24 (the same class, reused directly), augmented with a subtree-size field kept correct across insert, delete and rotation.
2. A select query and a rank query run against that augmented tree, with their comparison counts measured directly and checked against the tree's actual height.
3. A real rotation performed on the augmented tree, with the number of nodes whose subtree size actually changes counted directly (expected: two).
4. Every number shown on screen (step 10) is asserted directly from these runs.

## Bridge and handoff

- **Bridge** (word for word, matching `CHAPTER.md`): "A balanced tree answers 'is x here' in O(log n). It says nothing about x's rank among everything else in the tree. A small amount of extra bookkeeping at each node, and that question is answered too."
- **Handoff** (word for word, matching `CHAPTER.md`): "Every structure in this chapter keeps its keys in order using pointers and rotations, one node at a time. The next chapter asks what happens when a node is too expensive to visit one at a time at all — when a node is a disk page, not a pointer. B-trees, next, and the splits and merges that replace rotations entirely."

## Concept ledger

- **Introduces:** `order-statistic-tree`, `subtree-size-augmentation`, `rank-select-query`.
- **Uses:** `binary-search-tree`, `tree-rotation` (topic 23); `red-black-invariant` (topic 24, as the balanced tree being augmented).
- **Declared:** `tree-rotation` (topic 23, restated as the move whose effect on an augmented value must now be checked).

## Claims list (claim → source)

1. The size field's recurrence: size[x] = size[left[x]] + size[right[x]] + 1. → `SOURCES.md` § MIT 6.046J Lecture 11.
2. OS-SELECT's algorithm (compare the target rank against the left subtree's size, recurse left or right) and its O(h) = O(log n) running time on a balanced tree. → `SOURCES.md` § MIT 6.046J Lecture 11.
3. Recolourings don't affect subtree sizes; rotations fix up subtree sizes in O(1) time, so the augmented tree's insert/delete still runs in O(log n). → `SOURCES.md` § MIT 6.046J Lecture 11.
4. A rotation changes the size for only the two nodes incident to the rotated edge. → `SOURCES.md` § csce750 lecture notes.
5. The four-step augmentation methodology (choose a structure, choose a field, verify the field survives every modifying operation, build new operations) is stated independently by two separate courses, both following CLRS Chapter 14. → `SOURCES.md` § MIT 6.046J Lecture 11, § csce750 lecture notes.
6. The general rule — an augmented field survives a rotation in O(1) exactly when it is computable from the rotated node's new children alone — generalizes from the sources' own size/rotation example, stated explicitly as this topic's own generalization in `FACT-CHECK.md`. → `examples.py` (measured directly: a real rotation recomputes exactly two sizes) and `SOURCES.md` (both sources' size-and-rotation example).
7. A select query's and a rank query's comparison counts stay tied to the tree's height on a real augmented tree. → `examples.py` (measured directly).

## Changes from the chapter plan

None. This topic follows `CHAPTER.md`'s own entry directly, augmenting topic 24's identical red-black tree class rather than a fresh structure.
