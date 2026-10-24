# Chapter 21 — B-Trees, Page Splits, and Range Scans (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 4, *Storage-Engine Internals* (its third chapter). Chapter 21 has one section, 21.1, with exactly one full topic; the syllabus's other three 21.1 bullets (crash-safe structure modifications, range scans and B-link trees, concurrent B-tree latching protocols) are marked `*(skipped)*` in `syllabus/rust-systems-engineering.md` and already recorded in `syllabus/review-notes/rust-cuts.md` under "Chapter 21 — B-Trees, Page Splits, and Range Scans (3 of 4)"; they get no reel, per `CLAUDE.md`'s convention. The chapter's own lab exercise (a disk-backed B-tree over fixed pages with point lookup, ascending range scan and splits, killing the process mid-split and recovering from the WAL) is not a reel either. Planned 2026-10-24, in one `/make-topic` session. Previous chapter: Chapter 20, *Write-Ahead Logging and Crash Recovery* (three topics live: write-ahead rule and LSNs, ARIES steal/no-force recovery, group commit and commit latency), which closed on the cost of making a transaction durable.

This file is the contract the chapter's one topic builds to. Do not edit it once that topic is in progress; record any unavoidable departure under its `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Chapter 20 closed on a durable, recoverable log, but said nothing about how a single record is actually found among billions of others without scanning every page to find it. This chapter answers that with the read-optimized index every real relational and embedded store builds on: a B+-tree, using PostgreSQL's own B-tree implementation (`nbtree`) as the concrete reference. A B+-tree's defining property is fanout: by packing many keys into each fixed-size page, the tree stays only a few levels deep even at billions of records, so a point lookup or a range scan touches a small, bounded number of pages regardless of how large the table grows. That fanout isn't free — when a page fills up and a new key still needs to go in, the page must split in two, and that split propagates a new separator key up into the page's own parent, which can itself need to split in turn. A split is also where write amplification comes from directly: a single logical insert can, in the worst case, force a cascade of page rewrites all the way up the tree. Real systems counter this with prefix and suffix truncation (keeping only the minimum key prefix actually needed to tell two subtrees apart in an internal page, rather than a full copy of a key), a deliberate fill factor (leaving a page's own free space allowance below full so ordinary inserts don't immediately force a split), and merging two underfull neighboring pages back together when deletions leave them sparse.

By the end of this chapter's one topic, the learner can: build a real, minimal B+-tree over fixed-size pages, with internal and leaf pages built directly from this milestone's own self-describing page format and slot-indirection record identity; measure a real split happening when a page fills past its own fill factor, and show the resulting tree's own fanout keeping it only a few levels deep even as the number of records keeps growing; and measure the real, different space a separator key costs with and without prefix/suffix truncation.

## A.2 The order of ideas, and why

1. **B+-tree fanout and page splits** (topic 55, this chapter's only topic) — builds directly on this milestone's own page and record foundations: an internal or leaf node is this milestone's own self-describing page, its entries addressed through this milestone's own slot indirection. Measures a real split triggered by a page's own fill factor, the resulting tree's own fanout and depth as records accumulate, and the real space prefix/suffix truncation saves on a separator key. Hands off to Chapter 22 (LSM Trees, Memtables, SSTables, and Compaction): a B+-tree pays its own write cost immediately, at insert time, as a split; the next chapter's write-optimized alternative defers that cost instead, and the trade-off between the two is the real subject of the next chapter's own first topic.

*(The chapter's lab — a real, disk-backed B+-tree over fixed pages, with point lookup, an ascending range scan, and real page splits, killing the process mid-split and recovering from the WAL — is not a reel; it stays in the syllabus as a lab exercise, exercising this chapter's one topic together with Chapter 20's own WAL and recovery mechanisms, rather than introducing a new tested claim of its own.)*

## A.3 The running example: one real B+-tree, built and measured

Self-contained (no cross-chapter imports except where this topic explicitly measures a prior chapter's own construction as its baseline), continuing Chapters 1–20's conventions.

- **Topic 55** builds a real, minimal B+-tree: internal pages holding separator keys and child page references, leaf pages holding the actual key-value entries, both built from this milestone's own self-describing page header and slot array. Measures that inserting past a page's own fill factor genuinely triggers a real split, propagating a new separator key into the parent; that the tree's own depth stays small (a few levels) even as the number of inserted records grows into the thousands; and that a separator key stored with prefix/suffix truncation genuinely takes less space than one stored in full.

Every number and outcome must come from this topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024). This topic needs no root access or special hardware; a B+-tree here is built entirely from in-memory, fixed-size byte buffers playing the role of pages, continuing this milestone's own pattern from Chapters 19 and 20.

## A.4 Terms and notation (continuing Chapters 1–20's vocabulary)

Everything in Chapters 1–20 §A.4 still applies. This chapter adds:

- **Fanout**: the number of children (for an internal page) or entries (for a leaf page) a single B+-tree page can hold; a high fanout is what keeps the tree only a few levels deep even at a huge number of records.
- **Page split**: when a page fills past its own fill factor and a new entry still needs to go in, the page's own entries are divided into two pages, and a new separator key naming the dividing point is inserted into the page's own parent.
- **Write amplification (B+-tree)**: the real, extra work a single logical insert can cause beyond writing its own entry, when a split (or a cascade of splits up the tree) is triggered.
- **Fill factor**: a deliberate target below 100% full that a page is packed to on an ordinary insert, leaving room to absorb further inserts before the next split.
- **Prefix / suffix truncation**: storing only the minimum key prefix actually needed to distinguish two subtrees in a separator key, rather than a full copy of the key that triggered the split.
- **Merge (B+-tree)**: combining two underfull neighboring pages back into one when deletions have left them sparse, the reverse of a split.

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "how many entries fit in one page before it has to split" for fanout; "a full page dividing itself in two, and handing a new name up to its parent" for a page split; "one insert causing extra writes beyond its own entry" for write amplification; "packing a page less than completely full on purpose" for fill factor; "keeping only the shortest piece of a key that still tells two sides apart" for prefix/suffix truncation.

## A.5 Visual language (continuing Chapters 1–20's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list and the page-layout-strip/slot-to-offset-arrow glyphs Chapter 19 introduced, reused where relevant. This chapter adds:

- **A tree-depth ladder**: a small set of stacked horizontal bands, one per tree level, showing how few levels the tree needs even as the record count climbs, in the same visual family as Chapter 19's own page-layout strip.
- **A split-and-propagate glyph**: one page shown dividing into two, with an arrow carrying a new separator key up into a parent page, reusing Chapter 19's own slot-to-offset arrow family.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–20 §A.6: executed `examples.py` compiling real `rustc --edition 2024` sources, self-contained topic, sources fetched and quoted via `scripts/sources.mjs`, registry fields with `milestone: { number: 4, title: 'Storage-Engine Internals' }` and `chapter: { number: 21, title: 'B-Trees, Page Splits, and Range Scans', section: '21.1' }`. A cargo crate under `examples/` is used; no root access or special hardware is needed, since this topic's own pages are in-memory, fixed-size byte buffers, continuing Chapters 19 and 20's own pattern.

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–20's own declared list. Chapters 1–20's *introduced* ids this chapter draws on directly: `self-describing-page-header`, `slot-indirection-stable-identity` (Chapter 19). This chapter's one topic lists in `uses` only the ones it actually relies on.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `btree-fanout-split-tradeoff` | 55 | A B+-tree's high fanout keeps it only a few levels deep at any record count, at the real, measurable cost of a page split (and the write amplification a split can cascade) whenever a page fills past its own fill factor. |

## A.8 Bridges and handoffs

- **55** bridges from Chapter 20's own real handoff (this chapter's own first sentence names it directly: Chapter 20 closed on a durable, recoverable log, saying nothing about how a single record is actually found among billions without scanning every page) and continues Chapter 19's own `self-describing-page-header` and `slot-indirection-stable-identity` directly, since a B+-tree's own internal and leaf pages are built from exactly those two foundations. Hands off to Chapter 22 (LSM Trees, Memtables, SSTables, and Compaction): "A B+-tree pays its own write cost immediately, at insert time, as a split; a write-optimized structure can defer that cost instead, and that trade-off is this next chapter's own first subject."

## A.9 Primary sources to start from (this topic must re-fetch and verify)

- The PostgreSQL Global Development Group, "B-Tree Indexes," the PostgreSQL documentation, for `nbtree`'s own structure, fill factor, and page layout as the chapter's own reference implementation.
- The PostgreSQL Global Development Group's own `nbtree` README or source comments (if fetchable), for prefix/suffix truncation and write amplification from splits, named directly.
