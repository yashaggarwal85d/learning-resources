# Outline: B-tree and B+-tree mechanics (`dsa.b-tree-b-tree`)

## Learning outcomes

1. Explain why a B+Tree keeps all records in its leaves, linked to their siblings, rather than scattered across internal nodes like a classic 1972 B-tree.
2. Walk through a split and a merge and show each keeps every node at least half full.
3. State and justify the Θ(log_B N) I/O bound for a search, and contrast it against Chapter 4's Θ(log₂ N) comparison bound on the same N.

## Engagement arc

- **Hook (step 1):** Chapter 4's red-black tree answers "is x here" in a small number of comparisons, but each comparison can be a separate disk I/O — on 200 keys it took height 13 to search. A disk page holds hundreds of keys, not one.
- **Predict 1 (step 3, within the first four):** a leaf overflows on insert — what happens to the tree?
- **Predict 2 (step 5):** a leaf underflows on delete — borrow from a sibling, or merge with one, and how is that decided?
- **Surprising number:** the same 200 keys that gave a red-black tree height 13 give an order-4 B+Tree height 5 — and with a realistic disk page (fanout in the hundreds to thousands), the same shape of tree stays height 3-4 for a billion keys.
- **Takeaways (≥3):** step 4 (a split keeps every node at least half full, win or lose the median key depending on leaf vs. inner); step 7 (a merge, not a borrow, is the one move that can shrink the tree); step 9 (Θ(log_B N) I/Os is the identical shape of bound as Chapter 1's own I/O model, made concrete here).
- **Recap:** step 10, "Prove it" — the measured split/borrow/merge counts, the measured range-scan I/O count against a re-descending alternative, and the fanout/height formula checked against a billion keys.

## Reel steps and storyboard

1. **Opening.** Title/body: a balanced, pointer-based tree (Ch.4) needs a small number of comparisons, but each one can be its own disk I/O. Visual: the Ch.4 red-black tree (height thirteen on two hundred keys, spelled, no digits in narration) next to a single wide disk page holding many keys at once. Moves: `Draw` the pointer tree, `Surface` the page. Duration ~4s.
2. **BTreeShape.** Define the B+Tree: an M-way search tree, every leaf at the same depth, every node but the root at least half full, every inner node's children count one more than its key count. Visual: a small B+Tree, root/inner/leaf layers labelled. Moves: `Draw`, `Decode` the half-full rule. Duration ~4s.
3. **SplitPredict.** Predict: a leaf overflows on insert — what happens? Options: only the new key is rejected; the leaf splits and a key is promoted to the parent (correct); the whole tree rebuilds; nothing, leaves can hold unlimited keys. Visual: a leaf with one too many keys. Duration ~2s.
4. **SplitReveal.** The leaf splits: keys redistributed evenly, the middle key copied up to the parent; if the parent overflows too, it splits the same way but pushes its middle key up (not kept in either half) — and if the root itself splits, the tree grows one level taller. Takeaway: "A split always keeps both halves at least half full — it's forced by the fill rule, never a choice." Moves: `Draw` the two-frame split, `Decode` the promoted key. Duration ~4s.
5. **MergePredict.** Predict: a leaf underflows on delete — what happens? Options: the leaf is left as-is; the leaf borrows one key from an adjacent sibling, or merges with it if no sibling can spare one (correct); the whole tree rebuilds; the key is simply re-inserted elsewhere. Visual: an underflowed leaf beside a full sibling and a half-full one. Duration ~2s.
6. **MergeReveal.** A borrow when a sibling has a spare key to give; a merge, and deletion of the parent's now-orphaned separator key, only when no sibling can spare one. Takeaway: "Borrowing never changes the tree's height. A merge is the only move that can shrink it." Moves: `Draw` both paths side by side. Duration ~4.5s.
7. **SiblingScan.** Leaves are linked left-to-right; a range scan finds the first leaf once, then streams across linked leaves, never re-descending from the root. Visual: a scan path lighting up leaf after leaf via its sibling link. Takeaway: "A range scan pays for one descent, then one I/O per leaf touched — not one descent per key." Moves: `Plot` the streaming path. Duration ~4s.
8. **FanoutHeight.** Fanout B is bounded by how many (key, pointer) pairs fit a disk page; height is about log base B of the key count. Visual: the fanout formula next to a worked height for a realistic page size and a billion keys. Moves: `Decode` the formula, `Surface` the computed height. Duration ~4s.
9. **IOComparison.** Side-by-side bar: Chapter 4's red-black tree's height (comparisons) against this topic's B+Tree's height (I/Os), on the identical two hundred keys. Takeaway: "The same keys that need height thirteen one comparison at a time need height five one page at a time — and a real page shrinks that further still." Moves: `Plot` two bars, `Reticle` the gap. Duration ~4s.
10. **ProveIt.** Measured, not assumed: the split/borrow/merge counts from building and modifying the tree; the range scan's I/O count against a re-descending alternative; the fanout/height formula checked against a billion keys. Duration ~4s.

## Narrator's line of thought (beyond the description)

- Step 1: why a comparison-optimal tree can still be I/O-expensive — the thing a comparison bound doesn't count at all.
- Step 2: why "every leaf at the same depth" is the thing that makes height predictable, the way the five red-black invariants did for Chapter 4's tree, but by a completely different mechanism (forced minimum fill, not colour).
- Step 3/5: predict from the fill-rule logic already shown, not from guessing.
- Step 4: why a leaf split copies the key (the key still has to live in a leaf somewhere) but an inner-node split doesn't need to (inner nodes only route, they don't store the record).
- Step 6: why borrowing is always tried first — it's strictly cheaper, touching one sibling instead of deleting a tree-wide entry.
- Step 7: the sibling link is doing for scans what the red-black invariant did for point lookups — turning an expensive case into a cheap, bounded one.
- Step 8: connect back to Chapter 1's own I/O model by name — this is that same bound, now with a real mechanism producing it.
- Step 9: the honesty of the comparison — same keys, two different cost models, and why that's a fair comparison and not a trick.
- Step 10: state exactly what was measured vs. assumed.

## Post-notes headings

- **Internals:** the Lehman & Yao concurrent B-tree algorithm (right-links and high keys, as PostgreSQL's own `nbtree` README states them) and why a real B+Tree needs a concurrency story a textbook tree diagram skips.
- **Lab:** this topic's slice of the chapter's shared Lab bullet — build a small, disk-backed B+Tree and drive it with insert-heavy, range-scan and random-delete workloads, reporting I/O counts (the chapter's topics 28-29 build and drive the LSM side).
- **Production:** PostgreSQL's B-tree (`nbtree`), and how a real system's fanout and page size compare to this topic's illustrative order-4 tree.
- **Frontier:** brief mention of why learned indexes and copy-on-write B-trees exist as alternatives (both skipped from this syllabus, named only in passing, no mechanism taught).
- **Where this goes next:** B-tree node engineering (topic 27) — what it takes to make a real page's fanout B actually large.

## Examples to execute and assert

- Build an order-4 `BPlusTree` on the identical 200-key set topics 23-25 used; assert height is 4 or 5 and strictly less than topic 24's measured height of thirteen.
- Assert a search's I/O count equals the tree's own height exactly.
- Assert at least one split occurs while building; assert at least one borrow and at least one merge occur while deleting sixty of the two hundred keys.
- Assert in-order traversal across linked leaves yields every remaining key in sorted order after deletes.
- Assert a range scan's I/O count stays additive in leaves touched (height + keys scanned, at most) and is far less than re-descending from the root once per key.
- Assert the fanout/height formula reproduces Stanford CS145's own worked table for a trillion keys at four page/key-size combinations, and separately assert a billion keys gives height three or four for three realistic page/key sizes.

## Bridge and handoff

- **Bridge:** word for word, Chapter 4's own final handoff (see `CHAPTER.md`).
- **Handoff:** word for word, this topic's entry in `CHAPTER.md` ("A B+-tree's height is bounded, but only if its nodes are actually full of keys, not full of wasted bytes. Node engineering, next...").

## Concept ledger

- **Introduces:** `b-tree`, `b-plus-tree`, `node-split-merge`, `sibling-link-range-scan`.
- **Uses:** `io-model`, `io-search-bound` (Ch.1 §1.3); `binary-search-tree` (Ch.4, as the contrasted baseline, not a building block).
- **Declared:** none new beyond its own.

## Claims list (claim → source)

1. A B+Tree is a self-balancing, ordered, M-way tree, O(log_f n) for search/insert/delete, f the fanout — CMU 15-445 Lecture 8.
2. Every leaf is at the same depth; every non-root node is at least half full; an inner node with k keys has k+1 children — CMU 15-445 Lecture 8.
3. A classic (1972) B-tree stores values in every node; a B+Tree stores values only in leaves, inner nodes route only — CMU 15-445 Lecture 8.
4. Insert: find leaf, insert sorted, split on overflow; a leaf split redistributes and copies the middle key up; an inner-node split redistributes and pushes the middle key up — CMU 15-445 Lecture 8.
5. Delete: remove, re-distribute (borrow) from a sibling on underflow, merge with a sibling if borrowing fails, delete the orphaned parent entry on a merge — CMU 15-445 Lecture 8.
6. Leaves are linked left-to-right for a range scan that streams across them without returning to the root — CMU 15-445 Lecture 8 ("traverse to the left-most leaf page... retrieve tuples from all leaf pages") and Stanford CS145 (explicit "linked left-to-right... stream across them without going back to the root").
7. A real production B+Tree (PostgreSQL's `nbtree`) implements the identical right-link-to-sibling mechanism, per Lehman & Yao's algorithm — PostgreSQL `nbtree` README.
8. Fanout f ≈ page size / (key size + pointer size); height h ≈ ⌈log_f N⌉ — Stanford CS145, with a worked table for a trillion keys.
9. Height stays three to four for realistic page/key sizes even at a billion to a trillion keys, turning a search into a small, constant number of I/Os regardless of table size — Stanford CS145's own worked table and point-lookup example (this topic's own `examples.py` reproduces the table's arithmetic and separately checks the billion-key case for three page/key-size combinations).

## Claims not made

- Doesn't re-teach concurrent B-tree locking in full (Lehman & Yao's right-link and high-key mechanism is named in post-notes/internals, not animated as its own mechanism in the reel).
- Doesn't claim a universal "the" fanout or page size — every number is tied to a stated page and key size, per the sources' own worked tables.
- Doesn't cover copy-on-write B-trees or the Linux maple tree (both skipped per `syllabus/review-notes/dsa-cuts.md`).
- Doesn't claim this topic's own order-4 illustrative tree is representative of a real page's fanout — the illustrative tree is explicitly small, for visibility, and the realistic-fanout claim is checked separately and arithmetically.
