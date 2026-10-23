# Outline: B-tree node engineering (`dsa.b-tree-node-engineering`)

## Learning outcomes

1. Explain prefix/suffix truncation and key normalization, and show the byte savings each gives on a real key set.
2. Lay out a page as a slot directory with a variable-length data area, and explain why this avoids shifting every entry on insert.
3. Bulk-load a B+Tree from sorted input and show it costs fewer I/Os than one-at-a-time insertion; explain PostgreSQL's duplicate-key deduplication and the version it shipped in.

## Engagement arc

- **Hook (step 1):** topic 26's B+Tree node is a disk page, but a page is just bytes — nothing in topic 26 said how to spend them well. The same fanout formula gets a much bigger B if the bytes aren't wasted.
- **Predict 1 (step 3, within the first four):** a leaf splits — what happens to the key bytes copied into the new parent routing entry?
- **Predict 2 (step 6):** building a B+Tree from a million already-sorted keys — insert them one at a time, or something else?
- **Surprising number:** suffix truncation plus key normalization measurably shrinks a pivot tuple; a bulk load's I/O count is a small fraction of one-at-a-time insertion's, on the identical sorted input.
- **Takeaways (≥3):** step 4 (suffix truncation keeps only the bytes that still distinguish the split, nothing more); step 7 (every split during a bulk load happens on the tree's own right-most path, never anywhere else); step 9 (deduplication is a lazy, split-time-only rewrite, never a background pass).
- **Recap:** step 10, "Prove it" — measured byte savings from truncation and normalization, the bulk-load I/O count against one-at-a-time insertion, and a dedup savings ratio on a repeated-key set.

## Reel steps and storyboard

1. **Opening.** A disk page is just bytes; topic 26's fanout formula rewards whoever spends those bytes best. Visual: topic 26's wide page redrawn, half of it shaded as wasted space. Duration ~4s.
2. **SlottedLayout.** A real page: a header tracking used-slot count and last-used offset, a slot array of fixed-size offsets, a variable-length data area growing from the other end. Visual: header + slot array + growing data area. Duration ~4s.
3. **PrefixSuffixPredict.** Predict: a leaf splits — what happens to the key bytes copied up into the new parent routing entry? Options: the full key, unchanged; only the bytes that still distinguish the two new halves (correct); nothing, routing entries store no key at all; a hash of the key. Duration ~2s.
4. **PrefixSuffixReveal.** Suffix truncation: keep only the attributes that distinguish the last tuple of the left half from the first tuple of the right half; the rest is dropped, with no storage cost, since a routing entry only needs to pick a side. Takeaway: "A routing key only needs to pick a side — it never needs the full key a leaf stores." Duration ~4.2s.
5. **KeyNormalization.** Converting a typed key (an integer, a float, a string) into one fixed, byte-comparable form, so every comparison anywhere in the tree is a plain `memcmp`, never a type-aware parse. Visual: a signed integer's bytes flipped to a big-endian, sign-adjusted form. Duration ~4s.
6. **BulkLoadPredict.** Predict: building a B+Tree from a million already-sorted keys — insert them one at a time, or something else? Options: insert one at a time, same as any other insert; sort once, then build the leaf level directly and link upward (correct); build every level at once in parallel; it can't be done faster than one-at-a-time insertion. Duration ~2s.
7. **BulkLoadReveal.** Sort once; fill leaf pages left to right to the fill-factor target; keep the current root in memory, not yet written to disk; every structural split happens only on the tree's own right-most path, because a sorted build never revisits a page once it's full. Takeaway: "A bulk load's only splits happen on the tree's own right-most path — nowhere else ever overflows." Duration ~4.5s.
8. **FillFactor.** The percentage a page is packed to on a build or a right-edge append; a hundred percent wastes no space but risks a flood of splits on the very next write; a lower factor leaves room on purpose. Duration ~3.8s.
9. **Deduplication.** Repeated keys merged into one physical tuple with a posting list of row pointers, applied lazily, only at the moment a page would otherwise have to split — shipped in a real, current database starting at a named version. Takeaway: "Deduplication only ever runs at the one moment a split was about to happen — never as a background pass." Duration ~4s.
10. **ProveIt.** Measured, not assumed: the byte savings from truncation and normalization on a real key set, a bulk load's I/O count against one-at-a-time insertion on the identical sorted input, and a deduplication savings ratio on a repeated-key set. Duration ~4s.

## Narrator's line of thought (beyond the description)

- Step 1: the fanout formula from topic 26 is only as good as the bytes actually spent on keys — this topic is entirely about that spending.
- Step 2: why a slot array (indirection) beats shifting every tuple on every insert — the same reason an array-of-pointers beats a packed array when entries vary in size.
- Step 3/6: predict from the mechanism already shown (what a routing entry is actually for; what a sorted build never has to redo), not from guessing.
- Step 4: a leaf split must keep the full key somewhere (a leaf still answers "is this exact key here"); an inner node's routing entry never needs to, which is why suffix truncation is safe there and nowhere else.
- Step 5: normalization and truncation are solving two different problems that look similar — one shrinks *what's compared*, the other shrinks *what's stored for routing* — and both pay off simultaneously on the same key.
- Step 7: the right-most-path property is what makes a bulk load fast: no root-to-leaf descent is ever wasted re-finding a page that already has room.
- Step 8: fill factor is a knob, not a universal best value — tied directly to whether the table is static or write-heavy.
- Step 9: why "lazy" matters — a background pass would cost I/O for pages that would never have split anyway.
- Step 10: state exactly what was measured vs. assumed.

## Post-notes headings

- **Internals:** Bayer and Unterauer's 1977 Prefix B-Trees paper, which the mechanism in step 4 is loosely based on per PostgreSQL's own README; the specific byte-level encoding of normalized integers and floats from a real production key-value store.
- **Lab:** this topic's slice of the chapter's shared Lab bullet — bulk-load a small, disk-backed B+Tree from sorted input and compare its I/O count against one-at-a-time insertion (topic 29's own Lab slice covers the LSM side).
- **Production:** PostgreSQL's B-tree deduplication (`deduplicate_items`, on by default since 13.0) and fill factor (`fillfactor`, default ninety).
- **Frontier:** brief mention of why compression of posting lists isn't used in PostgreSQL's own nbtree (a trade-off against fast concurrent deletion), named only in passing.
- **Where this goes next:** LSM-tree write and read paths (topic 28) — the structure that avoids in-place node engineering entirely.

## Examples to execute and assert

- Build a small slotted-page simulation; measure the byte size of a routing entry before and after suffix truncation on a real key set, and assert the truncated form is smaller.
- Normalize a set of signed integers and floats to their byte-comparable form; assert that sorting the normalized byte strings with plain byte comparison produces the identical order as sorting the original typed values.
- Bulk-load a B+Tree from a sorted key set and count every split; assert every split occurs on the tree's own right-most path (no other node ever overflows); compare the total I/O count against one-at-a-time insertion of the identical keys in sorted order and assert the bulk load costs meaningfully fewer page writes.
- Simulate deduplication on a key set with many repeated keys; assert the deduplicated storage size is smaller than the non-deduplicated size, and that it's applied only when a page would otherwise split (never eagerly).

## Bridge and handoff

- **Bridge:** word for word, topic 26's own final handoff (see `CHAPTER.md`).
- **Handoff:** word for word, this topic's entry in `CHAPTER.md` ("Every technique so far still updates a page in place... LSM-trees, next.").

## Concept ledger

- **Introduces:** `prefix-suffix-truncation`, `slotted-page-layout`, `bulk-loading`, `key-deduplication`.
- **Uses:** `b-tree`, `b-plus-tree`, `node-split-merge` (topic 26).
- **Declared:** `node-split-merge` (topic 26, restated as the operation bulk loading and deduplication are measured against).

## Claims list (claim → source)

1. Suffix truncation drops key attributes not needed for a page's high key at a leaf split, keeping only what distinguishes the two new halves — PostgreSQL nbtree README, naming Bayer and Unterauer's 1977 Prefix B-Trees paper.
2. Suffix truncation's purpose is smaller pivot tuples, which delays internal-page splits and improves fan-out — PostgreSQL nbtree README.
3. Key normalization converts a typed key to a byte-comparable form so comparisons reduce to `memcmp`; a real production key-value store's exact byte-level encoding for integers and floats (big-endian, sign bit flipped) — MyRocks record-format wiki.
4. A slotted page layout: a header (used-slot count, last-used offset) plus a slot array mapping slots to variable-length tuples' actual offsets, the most common real page layout — CMU 15-445 Lecture 3.
5. Fill factor: the percentage a page is packed to on a build or right-edge append, default ninety, range ten to one hundred, explicitly tied to bulk loading in the same documentation — PostgreSQL CREATE INDEX reference.
6. Bulk loading from sorted input: sort once, build leaf pages left to right, keep an in-memory not-yet-written root, every split confined to the tree's own right-most path — University at Buffalo CSE 350 Lecture 16.
7. B-tree deduplication: repeated non-pivot tuples merged into one physical tuple with a posting list, applied lazily only at the point a split would otherwise be needed — PostgreSQL nbtree README.
8. Deduplication shipped in PostgreSQL 13.0 (2020-09-24), confirming the syllabus's own "(PostgreSQL 13+)" claim, and requires `REINDEX` on upgrade to take effect on an existing index — PostgreSQL 13.0 Release Notes.

## Claims not made

- Doesn't claim this topic's own illustrative byte savings generalize to every key type or page size — the measured numbers are tied to the specific key set and sizes `examples.py` states.
- Doesn't re-derive Bayer and Unterauer's full 1977 Prefix B-Trees algorithm; names it as the technique's origin per PostgreSQL's own README, not re-taught as its own mechanism.
- Doesn't claim deduplication's posting-list representation is compressed; PostgreSQL's own README explicitly declines compression for concurrency reasons, named in post-notes only.
- Doesn't cover unique-index deduplication's distinct goals (a different section of the same README) — only the non-unique-index deduplication the syllabus names.
