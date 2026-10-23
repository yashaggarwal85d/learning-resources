# Chapter 4 plan: Binary Search Trees and Balancing (Data Structures & Algorithms, Milestone 1)

This is the contract for every topic of Chapter 4. Builders keep to their own entry and read the entries next to theirs. Don't edit this file. If a topic really can't keep to its entry, record why under `OUTLINE.md` → "Changes from the chapter plan" and say so in the report.

- **Planned:** 23 October 2026, from `syllabus/data-structures-and-algorithms.md` (Chapter 4, §4.1–§4.2) and Chapter 3's final handoff.
- **Registry fields shared by every topic:** `domain: 'data-structures-and-algorithms'`, `milestone: { number: 1, title: 'Data Structures' }`, `chapter: { number: 4, title: 'Binary Search Trees and Balancing', section: '4.1' | '4.2' }`. The registry `title` and `syllabusTitle` are both the syllabus title word for word.
- **Folders:** every topic lives in `…/m1-data-structures/ch04-binary-search-trees/<folder>`, next to this file.
- **Inherits from earlier chapters** (not re-taught; used directly): `node`/pointer structures and linked traversal (Ch.2's linked list); `amortized-cost` (Ch.1 topics 5–6, reused by topic 24 for recolouring); `hash-function`, `merkle-tree` and the rest of Chapter 3's hashing vocabulary are explicitly *not* reused — Chapter 3's final handoff draws the line between them directly. Chapter 3's handoff: "Every structure in this chapter answered 'where is the key' or 'do these two copies agree' by turning data into a number. The next chapter asks a question hashing can't answer at all: keep the keys in order, so you can ask for the smallest, the largest, or everything between two bounds. Binary search trees, next, and the rotations that keep one balanced." Topic 23 of this chapter answers that handoff directly.

---

## The chapter

### The problem it solves

Chapter 3 answered "where is the key" by turning a key into a number and accepting that the table has no order at all — a hash table can't answer "what's the smallest key" or "everything between these two bounds" without scanning every entry. This chapter asks a different question: keep the keys in order, in a structure that still finds any one of them in O(log n), not O(n). A binary search tree does this by construction (topic 23), but an *unbalanced* one degrades to a linked list on an adversarial or merely unlucky insertion order — so every topic after the first is a different way of guaranteeing the tree stays shallow, and the one guarantee itself implies a second, free capability most learners don't expect: once the shape is provably balanced, a small amount of extra bookkeeping at each node (topic 25) turns "is x in this tree" into "what rank does x have among everything in this tree," still in O(log n). The thread through this short chapter is **the rotation**: one structural move, shared by every balancing scheme the syllabus or this chapter names, that fixes a local shape problem without breaking the ordering property. Topic 23 defines it as a primitive with no invariant to maintain yet; topic 24 is the first scheme that actually needs it, with a real invariant (colour) forcing exactly when a rotation fires; topic 25 asks what a rotation does to information *other* than ordering, and states the rule for when that information survives one.

### Order of ideas, and why

1. **§4.1 Balanced binary search trees (23–24).** BST operations and rotations (23, the refresher: search, insert, delete by successor swap, in-order traversal, and the rotation itself, with no balancing invariant yet) → Red-black trees (24, the first and only balancing scheme this chapter teaches in full: colour invariants that bound height, and the rotation now firing for a reason). 23 before 24 because 24's every claim ("at most three rotations per update") is meaningless without 23's own definition of what a rotation is and why it preserves the ordering property; 24 is the chapter's only full topic in §4.1 because AVL, splay trees and treaps are all skipped (see "Skipped in this chapter" below) — the syllabus's own Lab bullet still wants a feel for *a* balancing scheme's rotations-per-op and height, and red-black trees is that scheme, verified against real production uses (`std::map`, Java `TreeMap`, Linux kernel subsystems) that AVL or a treap wouldn't give for free.
2. **§4.2 Augmented trees (25).** Order-statistic trees (25), asking what else a balanced tree's own shape can be made to answer for free, once rotations are already a solved problem. Last, and alone in its section, because it depends on 23's rotation and 24's proof that rotations stay bounded in number — augmentation only works if you already know a rotation happens rarely enough, and correctly enough, not to be its own liability.
3. **Handoff to Chapter 5.** Topic 25 ends on subtree-size augmentation and the general rule for which augmentations survive a rotation; Chapter 5 opens with B-tree and B+-tree mechanics, a search tree designed around a different constraint entirely — not "stay balanced after a pointer-level rotation" but "every node is a disk page, and a rotation is too expensive to do at all; split and merge whole pages instead."

### One running example: the log's own ordered index

Chapters 2 and 3 built one record format and a hash-based lookup by request ID; this chapter keeps the same log but asks the question hashing can't answer: an index over the log's own timestamps, kept in order, so "the oldest open request" or "everything between two times" is a tree walk, not a scan. A topic may narrow it (a handful of records, to show rotations and colours clearly on one frame) or widen it (asking for a record's rank among all of them, for 25) if it says how it relates to the shared scenario. Every number on screen is computed or asserted in that topic's own `examples.py`; the values below are planning values, and a builder who finds one wrong fixes it in its own topic and records it in `REVIEW.md` for the release seam check.

| Piece | Planning values (each topic's builder computes and asserts its own) | Used by |
|---|---|---|
| The key | the log record's own timestamp, already totally ordered (unlike Ch.3's request ID) | 23, 24, 25 |
| Tree size for the rotation/colour pictures | a handful of records (roughly 7–15), small enough that every rotation and every colour change fits on one frame | 23, 24 |
| Adversarial insertion order | timestamps inserted in sorted order, to show an unbalanced BST degrade toward a linked list — the exact failure a balancing invariant exists to prevent | 23, 24 |
| Rank/select queries | "what rank does this record have among all records so far" and "which record has rank k," on the same tree topic 24's invariant keeps shallow | 25 |

### Shared notation and terms

- **Binary search tree (BST) property:** every node's key is greater than every key in its left subtree and less than every key in its right subtree — defined once in topic 23, assumed afterward.
- **Rotation:** the one structural move (promote a child, demote its parent, re-point the two or three affected subtrees) that changes a BST's shape without breaking the BST property — defined once in topic 23 with no invariant driving it yet, reused by name in 24 (now firing to restore a colour invariant) and 25 (now asked what happens to an augmented value).
- **Height vs. size:** a BST's cost is driven by its height, not its number of nodes; an unbalanced tree's height can reach n, while a balanced one's stays O(log n) — defined in topic 23 as the quantity every later topic's invariant exists to bound.
- **2-3-4 tree encoding:** red-black trees' colour invariant is a direct encoding of a 2-3-4 tree's node-merging rule — named once in topic 24, not re-taught as its own structure (the syllabus doesn't ask for 2-3-4 trees directly).
- **Augmentation:** extra information stored at each node beyond its key, kept correct by updating it on every insert, delete and rotation — defined once in topic 25, with the general rule for which augmentations survive a rotation stated there and nowhere else.
- **Spoken numbers:** narration has no digits, symbols or code names (automatic check); say "order log n", "two three four tree", "at most three rotations", and add new terms the first time each appears (`rotation`, `successor`, `colour invariant`, `subtree size`, QUALITY.md #29).

### One visual language for the chapter's reels

The chapter builds from `site/src/reels/kit.tsx` and `DESIGN.md`'s briefing theme (PROJECT_PLAN.md, "Theme — briefing"): black and white carry everything, colour is rare and means something. On top of that this chapter shares one grammar:

- **Colour:** `crema` a node's own key, as it is; `latte` secondary labels (a node's computed height or subtree size); `taupe` a null/empty child pointer; `caramel` **the thing to look at**: the node about to rotate, the one colour invariant being checked, the subtree whose size is being read off; `cinnamon` (rare) **the alternative being compared**, always the same side of each pair: a balanced tree's height against an unbalanced one's (23, 24); `cherry` with `cherryText` **the bad outcome**: a BST degraded to a linked-list shape under sorted insertion (23), a colour invariant violated before the fixing rotation fires (24).
- **The tree is drawn the same way in every topic:** nodes as small circles holding a key label, edges as plain lines, a null child as a small `taupe` tick rather than drawn empty space. A rotation (23, 24, 25) is drawn as the same two-frame move every time: the before-shape, then an arrow sweeping the promoted/demoted pair into the after-shape, never an instant cut — the move itself is the thing being taught.
- **Colour invariants (24):** nodes gain a filled ring in `cherry` (red) or left unfilled/outlined (black); a violation is a `cherry`-ringed node directly below another `cherry`-ringed node, flagged before the rotation or recolouring that fixes it, never silently corrected off-screen.
- **Augmentation (25):** each node gains a small `latte` number beside its key (its subtree size); a rank or select query draws a `caramel` path from the root down, with the comparison made at each node (go left, count, or stop) shown as a short beat, not skipped.
- **Reel shape.** Topic 23 is this chapter's only refresher (about 6 minutes). Full topics (24, 25) open on a problem drawn from the log's own ordered index, ask a predict question in the first three steps, show the mechanism, then "Prove it." About 10–13 minutes, 2–4 predict questions.

---

## The topics, in syllabus order

Folder prefix: `site/src/topics/data-structures-and-algorithms/m1-data-structures/ch04-binary-search-trees/`. Concept ids are kebab-case. A concept is in `uses` only if an earlier topic introduces it, or this topic `declared` it. The ledger is per domain; ids Data Engineering also uses keep the same meaning here.

**Skipped in this chapter** (stay in the syllabus, get no reel, per `syllabus/review-notes/dsa-cuts.md`): AVL trees, Splay trees, Treaps and split/merge trees (§4.1); Interval trees (§4.2). Where the syllabus's own *Lab* bullet needs one of these (comparing height/rotations/throughput across AVL, red-black and a treap; a split/merge primitive), the piece that doesn't depend on a skipped scheme is kept and the rest is dropped — see "Notes for the release run" below.

### 23. BST operations and rotations (`dsa.bst-operations-rotations`): refresher, §4.1

- **Folder:** `bst-operations-rotations`. About 6 min.
- **Scope (syllabus clause → what it delivers):**
  - "search, insert, delete (successor swap), in-order traversal": the four baseline operations on a plain, unbalanced BST — search and insert by walking the BST property; delete by finding the in-order successor (the leftmost node of the right subtree) and swapping it into the deleted node's place, verified against a current, careful textbook or course treatment at research time; in-order traversal as the operation that proves the BST property by producing keys in sorted order.
  - "the rotation as the one primitive all balancing schemes share": the single structural move — promote a child, demote its parent, re-point the affected subtrees — defined once here with no invariant driving it yet, and shown preserving the BST property on both sides of the move.
  - Leaves every balancing invariant (colour, height-balance, randomized priority) to topic 24 or to the skipped topics named above; this topic's own unbalanced tree is deliberately shown degrading toward a linked list under sorted insertion, as the problem the next topic exists to solve.
- **Outcomes:**
  - Search, insert and delete (via successor swap) on a plain BST, and explain why in-order traversal yields sorted output.
  - Perform a single rotation and show it preserves the BST property.
  - Explain why an unbalanced BST's height can reach n under an adversarial or merely unlucky insertion order.
- **Introduces:** `binary-search-tree`, `in-order-traversal`, `tree-rotation`, `successor-swap`. **Uses:** none beyond general pointer/node structures (Ch.2). **Declared:** none new beyond its own.
- **Bridge:** word for word, Chapter 3's own handoff above.
- **Handoff:** "A rotation preserves order, but nothing here keeps a tree's height small. Sorted insertions already showed what goes wrong. Red-black trees, next: the colour invariant that forces a rotation before that happens."
- **Prerequisites panel:** Ch.2's linked-list topic (Before this: pointer-based node structures). On-site: none new.
- **Visual idea:** a small BST built from the log's own timestamps by ordinary insertion, then the same timestamps inserted in sorted order, visibly degrading to a `cherry`-highlighted linked-list shape; one rotation performed on the first tree, drawn as the two-frame before/after move.
- **Sources to start from:** a current, careful textbook or course treatment of BST operations and rotations (verified at research time, e.g. a university data-structures course's own lecture notes or a standard reference's own description), read directly rather than assumed from memory.

### 24. Red-black trees (`dsa.red-black-trees`): full, §4.1

- **Folder:** `red-black-trees`. About 13 min.
- **Scope (syllabus clause → what it delivers):**
  - "colour invariants as an encoding of 2-3-4 trees": the five red-black invariants (root and leaves black, no red node has a red child, every path from a node to its descendant leaves has the same number of black nodes, etc. — verified against a current primary or well-documented source, not assumed from memory) shown as a direct encoding of a 2-3-4 tree's own node-merging rule, bounding height at O(log n) without the overhead of a strict height-balance invariant.
  - "at most three rotations per update and O(1) amortized recolourings": the real, bounded cost of fixing a violated invariant after an insert or delete, verified against a current primary or well-documented source's own stated bound, not a folklore number.
  - "the default ordered map in `std::map`, Java `TreeMap` and many Linux kernel subsystems": named and verified against each implementation's own documentation or source at research time, as the real reason this is the one balancing scheme this chapter teaches in full.
- **Outcomes:**
  - State the five red-black invariants and explain how they bound a tree's height at O(log n).
  - Walk through an insert that violates an invariant and the rotation and/or recolouring that restores it.
  - Name at least two real production uses of red-black trees and why each one chose this scheme.
- **Introduces:** `red-black-invariant`, `recoloring`, `balanced-height-bound`. **Uses:** `binary-search-tree`, `tree-rotation` (topic 23). **Declared:** `tree-rotation` (topic 23, restated as the move now firing to restore a specific invariant).
- **Bridge:** "A rotation preserves order, but nothing kept a tree's height small. Sorted insertions already showed what goes wrong. Red-black trees fix that with one invariant: colour."
- **Handoff:** "A balanced tree answers 'is x here' in O(log n). It says nothing about x's rank among everything else in the tree. Order-statistic trees, next: a small amount of extra bookkeeping at each node, and that question is answered too."
- **Prerequisites panel:** topic 23 (Before this: the rotation itself, and what an unbalanced tree's height can degrade to). On-site: none new.
- **Visual idea:** the log's ordered index redrawn with each node gaining a red or black ring; an insert that creates two consecutive red nodes, flagged `cherry` before the fixing rotation and/or recolouring restores the invariant; a side-by-side height comparison against topic 23's unbalanced, sorted-insertion tree on the identical key set.
- **Sources to start from:** a current, careful primary or well-documented secondary source for the red-black invariants and the rotations-per-update bound (a standard algorithms reference or a current course's own treatment, verified at research time); `std::map`'s, Java `TreeMap`'s and a named Linux kernel subsystem's own documentation or source for the production-use claim.

### 25. Order-statistic trees (`dsa.order-statistic-trees`): full, §4.2

- **Folder:** `order-statistic-trees`. About 11 min.
- **Scope (syllabus clause → what it delivers):**
  - "subtree-size augmentation for rank and select in O(log n)": storing each node's subtree size (the count of nodes in its own subtree, including itself), kept correct on insert, delete and rotation, turning "what rank does key k have" and "which key has rank i" into an O(log n) tree walk instead of an O(n) scan or sort.
  - "the general rule for which augmentations survive rotations": an augmented value survives a rotation only if it can be recomputed from the rotated node's new children in O(1) (not requiring a re-scan of the whole subtree) — stated as the general rule, verified against a current primary or well-documented source, and shown concretely for subtree size.
  - Leaves interval trees' max-endpoint augmentation out of scope (skipped in the syllabus), but states the general rule in a way that applies to it too, so the chapter's one augmentation example generalizes rather than being a special case.
- **Outcomes:**
  - Augment a balanced BST with subtree sizes, kept correct across insert, delete and rotation.
  - Answer a rank query and a select query in O(log n) using subtree sizes.
  - State the general rule for which augmentations survive a rotation, and why subtree size satisfies it.
- **Introduces:** `order-statistic-tree`, `subtree-size-augmentation`, `rank-select-query`. **Uses:** `binary-search-tree`, `tree-rotation` (topic 23); `red-black-invariant` (topic 24, as the balanced tree being augmented). **Declared:** `tree-rotation` (topic 23, restated as the move whose effect on an augmented value must now be checked).
- **Bridge:** "A balanced tree answers 'is x here' in O(log n). It says nothing about x's rank among everything else in the tree. A small amount of extra bookkeeping at each node, and that question is answered too."
- **Handoff:** "Every structure in this chapter keeps its keys in order using pointers and rotations, one node at a time. The next chapter asks what happens when a node is too expensive to visit one at a time at all — when a node is a disk page, not a pointer. B-trees, next, and the splits and merges that replace rotations entirely."
- **Prerequisites panel:** topic 23 (Before this: the rotation, and the BST property it must preserve); topic 24 (Before this: a balanced tree worth augmenting, rather than one that can still degrade to O(n) height). On-site: none new.
- **Visual idea:** the log's ordered index (built on topic 24's red-black invariant) with each node's subtree size labelled beside it in `latte`; a rank query drawn as a `caramel` root-to-node path, with the running count shown updating at each step; a rotation performed on the same tree, with the two affected nodes' subtree sizes visibly recomputed from their new children rather than re-counted from scratch.
- **Sources to start from:** a current, careful primary or well-documented secondary source for order-statistic trees and the augmentation-survives-rotation rule (a standard algorithms reference or a current course's own treatment, verified at research time).

---

## Concept ledger at a glance (introduces, in order)

23. `binary-search-tree`, `in-order-traversal`, `tree-rotation`, `successor-swap`
24. `red-black-invariant`, `recoloring`, `balanced-height-bound`
25. `order-statistic-tree`, `subtree-size-augmentation`, `rank-select-query`

Each concept is introduced once. Declared across the chapter (each topic declares its own again): `tree-rotation` (topic 23, restated by topic 24 as the move firing to restore a colour invariant, and by topic 25 as the move whose effect on an augmented value must be checked).

## Notes for the release run

1. **Verification discipline carries over from Chapters 1–3.** Every "to verify" claim above is a placeholder for the research stage (section 3 of the skill): fetch or read a current primary or well-documented source, quote or cite it in `SOURCES.md`, and only then commit the claim to `OUTLINE.md`. Nothing above is to be taken on screen from this plan's memory. Topic 24's rotations-per-update bound and topic 25's augmentation-survives-rotation rule are both specific, checkable claims — verify the exact bound stated by a real source rather than a remembered folklore number, exactly as Chapter 3's own gotchas record for Knuth's, Karger's and Merkle's papers.
2. **Seams to check at release:** topic 23's rotation definition against topic 24's and topic 25's own re-use of it (both must describe the identical move, not a variant); topic 23's unbalanced, sorted-insertion degradation picture against topic 24's balanced-height comparison (24 must reuse the same key set so the contrast is real, not a different example); topic 24's red-black tree against topic 25's augmentation (25 must augment the identical kind of balanced tree 24 built, not a different one); topic 25's handoff against Chapter 5's first topic's actual opening.
3. **The syllabus's own Lab bullet** ("implement AVL, red-black and a treap with split/merge; replay sequential, random and Zipfian traces and compare height, rotations per op and throughput; add rank/select to one of them") depends on two skipped schemes (AVL, treap). Topic 24 keeps the piece that doesn't depend on them: a real height/rotations-per-op measurement for red-black trees alone, contrasted against topic 23's unbalanced tree under the same insertion traces; topic 25 keeps "add rank/select to one of them" using the red-black tree topic 24 already built. The cross-scheme comparison itself (AVL vs red-black vs treap) is left out, per `syllabus/review-notes/dsa-cuts.md`.
