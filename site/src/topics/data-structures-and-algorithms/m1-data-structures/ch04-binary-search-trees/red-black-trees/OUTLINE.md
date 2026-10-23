# Outline — Red-black trees

## Learning outcomes

1. State the five red-black invariants and explain how they bound a tree's height at O(log n).
2. Walk through an insert that violates an invariant and the rotation and/or recolouring that restores it.
3. Name at least two real production uses of red-black trees and why each one chose this scheme.

## Engagement arc

- **Hook (step 1):** topic 23 proved a rotation preserves order but found nothing that keeps height small — sorted insertion degraded a plain BST to one long chain. This topic asks: what's the smallest rule that would have prevented that?
- **Predict 1 (step 3):** "an insert just created two consecutive red nodes. What has to happen before this tree is valid again?"
- **Predict 2 (step 6):** "across every insert and delete this tree will ever do, what's the largest number of rotations any single one of them can need?"
- **Takeaways:** steps 5, 7, 8 (three).
- **Recap (step 10, "Prove it"):** measured, side by side — the identical 200-key set's height under sorted insertion as a red-black tree versus topic 23's plain BST; the largest rotation count any single insert or delete actually triggered across hundreds of operations.

## Steps

### 1 — Opening
- **fig:** `Opening`
- **Visual idea:** topic 23's degenerate, sorted-insertion chain reappearing, fading, replaced by the same keys rearranged into a short, colour-ringed tree.
- **Caption:** a rotation preserves order, but nothing in topic 23 kept a tree's height small. What's the smallest rule that would have stopped that chain from ever forming?
- **Narrator's line of thought:** "the last topic ended on a cliffhanger it built on purpose. One rule fixes it — colour."

### 2 — FiveInvariants
- **fig:** `FiveInvariants`
- **Visual idea:** a small red-black tree with every node ringed red or black, each of the five invariants highlighted one at a time as it's named.
- **Caption:** every node is red or black, the root is black, a red node never has a red child, and every path down to empty space passes through the same number of black nodes.
- **Narrator's line of thought:** "four rules about colour, applied to a tree that's still just a BST underneath."

### 3 — ViolationPredict (predict)
- **fig:** `ViolationPredict`
- **Visual idea:** an insert landing as a red node directly below another red node — two reds in a row, flagged.
- **Predict options:**
  1. "Nothing — the tree is still a valid BST, so it's fine"
  2. "The tree must be rebuilt from scratch"
  3. "A recolouring and/or a rotation must restore the invariant before the tree is valid again" (correct)
  4. "The new node is simply rejected and not inserted"
- **Explain:** the BST property never broke, but the colour invariant did. Fixing it means walking back up from the new node, recolouring, and rotating only when recolouring alone can't restore the rule.
- **Narrator's line of thought:** "the ordering was never in danger. A completely different property just broke, and it has its own fix."

### 4 — FixReveal
- **fig:** `FixReveal`
- **Visual idea:** the two-red violation resolving — first by recolouring up toward the root, then, in the case recolouring can't reach, a rotation at the grandparent.
- **Caption:** recolouring fixes most violations by itself. When it can't, one rotation finishes the job — the same move topic 23 defined, now firing for a reason.
- **Narrator's line of thought:** "recolouring is the cheap move. Rotation is the one you reach for only when colour alone won't settle it."

### 5 — TwoThreeFourEncoding
- **fig:** `TwoThreeFourEncoding`
- **Visual idea:** the same red-black tree redrawn with red-child groups circled, each circled group relabeled as a single node of a 2-3-4 tree alongside it.
- **Caption:** a black node and its red children aren't really separate nodes — they're one node of a 2-3-4 tree, wearing a disguise.
- **Takeaway:** "A black node together with its red children stands for one node of a 2-3-4 tree — the colour invariant is that correspondence, not an arbitrary rule."
- **Narrator's line of thought:** "colour was never arbitrary. It's a binary tree pretending to be a wider one."

### 6 — RotationBoundPredict (predict)
- **fig:** `RotationBoundPredict`
- **Visual idea:** a long sequence of inserts and deletes running past, each one needing a fixup, asking how many rotations the worst single one could ever need.
- **Predict options:**
  1. "Unbounded — it depends on how deep the violation started"
  2. "At most two for an insert, at most three for a delete" (correct)
  3. "Exactly one, always"
  4. "As many as the tree's current height"
- **Explain:** every fixup case that actually rotates sits outside the loop that walks back up recolouring. The recolouring can climb many levels; the rotation at the end of that climb never repeats.
- **Narrator's line of thought:** "the walk back up can be long. The rotation that finishes it is never more than a couple of moves."

### 7 — RotationBoundReveal
- **fig:** `RotationBoundReveal`
- **Visual idea:** the recolouring climb drawn as a tall, thin path, with a single rotation glyph fixed at its end, same size regardless of how tall the climb was.
- **Caption:** the climb can be as tall as the tree. The rotation at the bottom of it never is.
- **Takeaway:** "An insert triggers at most two rotations and a delete at most three, no matter how many levels the recolouring climbs to find them."
- **Narrator's line of thought:** "this is the whole reason the scheme stays cheap — the expensive-looking part isn't the part that's actually bounded."

### 8 — HeightBound
- **fig:** `HeightBound`
- **Visual idea:** the red-black tree from step 1 next to topic 23's long chain, same keys, heights labelled.
- **Caption:** the 2-3-4 correspondence is what does the real work: every 2-3-4 node expands into at most two tree levels, so a red-black tree's height can never run away the way an unbalanced BST's did.
- **Takeaway:** "Because every 2-3-4 node expands into at most two levels, a red-black tree's height stays O(log n) even under the exact insertion order that degraded topic 23's plain BST."
- **Narrator's line of thought:** "the chain from last topic isn't possible here. The colour invariant is exactly what rules it out."

### 9 — ProductionUses
- **fig:** `ProductionUses`
- **Visual idea:** three small labelled icons — C++'s std::map, Java's TreeMap, a Linux kernel subsystem list — each beside a tiny red-black tree glyph.
- **Caption:** this is the one scheme every mainstream ordered map actually ships with: C++'s std::map, Java's TreeMap, and a long list of Linux kernel subsystems.
- **Narrator's line of thought:** "AVL trees are taught more. This is the one that's actually running underneath the map you already use."

### 10 — ProveIt
- **fig:** `ProveIt`
- **Visual idea:** two measured bar pairs — the identical 200-key set's height as a red-black tree versus topic 23's plain BST under sorted insertion; the largest rotation count seen across every insert and delete actually run.
- **Caption:** measured, not assumed: the same worst-case keys that broke topic 23's tree, and the real ceiling on how many rotations any single fixup ever needed.
- **Narrator's line of thought:** recap — "height stayed bounded, rotations stayed bounded. Both for exactly the reason this topic just gave."

## Post-notes headings (Deep dive)

- `outcomes` — the three learning outcomes above.
- `internals` — why a red-black tree is really a 2-3-4 tree in disguise; why the rotation bound holds regardless of how far the recolouring climbs.
- `lab` — this topic's own `examples.py` measurement: height under the identical worst-case insertion order from topic 23, and the largest rotation count across every insert/delete actually run.
- `production` — std::map, Java TreeMap, named Linux kernel subsystems, each verified against its own current documentation.
- `frontier` — AVL trees, splay trees, treaps, named with no mechanism, since the syllabus skips them.
- `questions` — "Why does recolouring alone sometimes suffice, while other times a rotation is unavoidable?"; "What would go wrong if the root were allowed to be red?"
- `next` — the handoff below, word for word.

## Examples to execute (`examples.py`)

1. A real CLRS-style red-black tree built from scratch: insert and delete, each with its own fixup, invariants checked after every single operation, never just at the end.
2. The identical 200-key set and 40-key delete set from topic 23, reproduced bit-for-bit from the same seed, inserted in the same worst-case sorted order.
3. The tree's height under that worst-case order, contrasted against topic 23's plain BST recomputed on the identical keys (a minimal, separate class — not the full topic 23 implementation).
4. The largest number of rotations any single insert and any single delete actually triggers, measured across every operation run, asserted against the two-and-three bound.

## Bridge and handoff

- **Bridge** (word for word, matching `CHAPTER.md`): "A rotation preserves order, but nothing kept a tree's height small. Sorted insertions already showed what goes wrong. Red-black trees fix that with one invariant: colour."
- **Handoff** (word for word, matching `CHAPTER.md`): "A balanced tree answers 'is x here' in O(log n). It says nothing about x's rank among everything else in the tree. Order-statistic trees, next: a small amount of extra bookkeeping at each node, and that question is answered too."

## Concept ledger

- **Introduces:** `red-black-invariant`, `recoloring`, `balanced-height-bound`.
- **Uses:** `binary-search-tree`, `tree-rotation` (topic 23).
- **Declared:** `tree-rotation` (topic 23, restated as the move now firing to restore a specific invariant).

## Claims list (claim → source)

1. The red-black invariants (every node red or black; null nodes black; a red node never has a red child; every path to a leaf has the same number of black nodes). → `SOURCES.md` § Wikipedia.
2. A black node together with its red children corresponds to one 2-3-4 node (with the two-representation caveat for 3-nodes). → `SOURCES.md` § Wikipedia.
3. An insert needs at most two rotations total; a delete needs at most three; both occur outside the recolouring loop. → `SOURCES.md` § Wikipedia, corroborated by § Linux kernel documentation.
4. Named Linux kernel subsystems (I/O schedulers, high-resolution timers, ext3, VMAs, epoll, cryptographic keys, the HTB scheduler) use rbtree. → `SOURCES.md` § Linux kernel documentation.
5. Java's `TreeMap` is a red-black tree implementation adapting CLRS's own algorithms. → `SOURCES.md` § Oracle TreeMap docs.
6. C++'s `std::map` is usually implemented as a red-black tree. → `SOURCES.md` § cppreference.
7. A red-black tree's height stays O(log n) even under topic 23's worst-case sorted insertion order, on the identical key set. → `examples.py` (measured directly: height 13 vs. 200 on 200 keys).
8. The largest number of rotations any single insert or delete actually triggers, across every operation run, respects the two-and-three bound. → `examples.py` (measured directly).

## Changes from the chapter plan

None. This topic follows `CHAPTER.md`'s own entry directly, reusing topic 23's identical key set for the height contrast as the chapter's own release-seam note requires.
