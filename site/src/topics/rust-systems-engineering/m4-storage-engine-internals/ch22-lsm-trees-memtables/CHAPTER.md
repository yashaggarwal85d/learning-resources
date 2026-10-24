# Chapter 22 — LSM Trees, Memtables, SSTables, and Compaction (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 4, *Storage-Engine Internals* (its fourth chapter). Chapter 22 has one section, 22.1, with three full topics; the syllabus's fourth 22.1 bullet, "Key-value separation and object-store LSMs," is marked `*(skipped)*` in `syllabus/rust-systems-engineering.md` and already recorded in `syllabus/review-notes/rust-cuts.md` under "Chapter 22 — LSM Trees, Memtables, SSTables, and Compaction (1 of 4)"; it gets no reel, per `CLAUDE.md`'s convention. The chapter's own lab exercise (an LSM key-value store with a WAL, memtable, immutable memtable, SSTables, a Bloom filter and one compaction policy, measuring write and read amplification under skewed vs uniform workloads) is not a reel either. Planned 2026-10-24, in one `/make-topic` session. Previous chapter: Chapter 21, *B-Trees, Page Splits, and Range Scans* (one topic live: B+-tree fanout and page splits), which closed on a B+-tree's own write cost, paid immediately at insert time as a split.

This file is the contract the chapter's three topics build to. Do not edit it once those topics are in progress; record any unavoidable departure under its own `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Chapter 21 closed on a real trade-off, stated directly: a B+-tree pays its own write cost immediately, at insert time, as a split. This chapter answers with the write-optimized alternative that defers that cost instead: the log-structured merge tree (LSM tree), using RocksDB's own design documentation and the original O'Neil et al. paper as the concrete reference. An LSM tree's write path never modifies an existing on-disk file in place: every write lands first in a durable log and an in-memory memtable, and once that memtable fills, it rotates to an immutable memtable and is flushed, unchanged, as a new sorted-string table (SSTable) on disk. That deferral is what makes a single write cheap, but it pushes the real cost onto two other places this chapter measures directly: a read has to check the newest structures first and potentially fall through several SSTables before finding (or ruling out) a key, and the SSTables themselves accumulate until a background compaction process merges them back down, trading foreground write cost for real, measurable background I/O and CPU that must itself be budgeted (rate limiting, write stalls) so it doesn't starve the writes it exists to serve. Two further techniques this chapter measures make that read-side cost tolerable in practice: a compaction strategy (leveled, tiered, or hybrid) decides how aggressively to pay that background cost now versus later, and a Bloom filter in front of each SSTable gives a read a real, measurable way to rule out most of those files instantly, at a real, measurable false-positive rate.

By the end of this chapter's three topics, the learner can: build a real, minimal LSM tree's own write and read paths (log, memtable, immutable memtable, SSTable) and measure that a read genuinely has to check multiple structures, newest first; measure how a real compaction strategy (leveled vs tiered) changes read, write, and space amplification differently on the identical workload; and measure a real Bloom filter's own false-positive rate against its bits-per-key budget, and that it never produces a false negative.

## A.2 The order of ideas, and why

1. **LSM write and read paths** (topic 56, this chapter's first topic) — builds the foundation every later topic in this chapter measures against: a real, minimal write path (durable log append → memtable → rotate to immutable memtable → flush as a sorted SSTable) and a real read path that checks the newest structures first. Measures that a read genuinely has to fall through multiple structures to find or rule out a key, and that flushed SSTables are genuinely immutable once written.
2. **Compaction strategies and amplification** (topic 57) — builds directly on topic 56's own SSTables: without compaction, reads degrade as SSTables accumulate; measures a real leveled compaction and a real tiered compaction running the identical write workload, and the real, different read/write/space amplification each produces.
3. **Bloom filters and their successors** (topic 58) — builds directly on topic 56's own SSTable read path: measures a real Bloom filter's own false-positive rate at a chosen bits-per-key budget, and that it never, ever produces a false negative, directly cutting down how many of topic 56's own SSTables a read has to actually open. Hands off to Chapter 23 (the next milestone's own first chapter; the amplification trade-off this chapter measures is the real cost this whole milestone has been building toward comparing against a B-tree's own cost, named directly in Chapter 21's own handoff).

*(The chapter's lab — a real LSM key-value store with a WAL, memtable, immutable memtable, SSTables, a Bloom filter and one compaction policy, measuring write and read amplification under skewed vs uniform workloads — is not a reel; it stays in the syllabus as a lab exercise, exercising all three of this chapter's topics together, rather than introducing a new tested claim of its own.)*

## A.3 The running example: one real LSM tree, built and measured

Self-contained (no cross-chapter imports except where a topic explicitly measures a prior chapter's own construction as its baseline), continuing Chapters 1–21's conventions.

- **Topic 56** builds a real, minimal LSM write path (an in-memory log of writes, a memtable, rotation to an immutable memtable, and a flush to an immutable, sorted, in-memory SSTable) and a real read path that checks the active memtable, then each immutable memtable, then each SSTable, newest first. Measures that a key overwritten after an SSTable flush is still found via the newest structure, not the stale one.
- **Topic 57** builds on topic 56's own SSTables directly: a real leveled compaction (merging one level's SSTables down into the next once a size threshold is crossed) and a real tiered compaction (merging same-level SSTables together without changing level), run on the identical sequence of writes. Measures the real, different number of SSTables a read has to check (read amplification), real total bytes rewritten by compaction (write amplification), and real total on-disk bytes retained (space amplification) for each strategy.
- **Topic 58** builds a real Bloom filter (a bit array and a chosen number of hash functions) in front of topic 56's own SSTables. Measures its real false-positive rate against a real set of keys never inserted, at a chosen bits-per-key budget, and confirms zero false negatives against every key actually inserted.

Every number and outcome must come from each topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024). This chapter needs no root access or special hardware; every structure here is built entirely from in-memory Rust collections standing in for on-disk log, memtable, and SSTable files, continuing this milestone's own pattern from Chapters 19–21.

## A.4 Terms and notation (continuing Chapters 1–21's vocabulary)

Everything in Chapters 1–21 §A.4 still applies. This chapter adds:

- **Memtable**: the in-memory, sorted structure that absorbs writes after they're durably logged; once full, it rotates to an immutable memtable and a fresh, empty memtable takes its place.
- **SSTable (sorted-string table)**: an immutable, sorted, on-disk file produced by flushing an immutable memtable; once written, it is never modified in place, only read, merged, or deleted.
- **Compaction**: the background process that merges SSTables back together, reducing how many a read must check and reclaiming space from overwritten or deleted keys.
- **Read, write, and space amplification**: the real, measurable extra cost a workload pays beyond its own logical size — extra bytes read per logical read, extra bytes written per logical write, and extra bytes retained on disk per logical byte stored.
- **Bloom filter**: a compact, probabilistic structure that can rule a key definitely absent from a set (no false negatives) or say only that it might be present (some false positives, at a rate traded against its own size).

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "the in-memory table that catches every new write" for memtable; "an unchangeable, sorted file written once" for SSTable; "merging files back together in the background" for compaction; "how much extra work a workload actually costs beyond its own size" for amplification; "a structure that can say no for certain, but only maybe for yes" for a Bloom filter.

## A.5 Visual language (continuing Chapters 1–21's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list, reusing Chapter 19's page-layout-strip family and Chapter 21's tree-depth-ladder family where relevant. This chapter adds:

- **A layered-files glyph**: a small stack of horizontal bars, newest on top, showing a read checking each one in turn until it finds or rules out a key, in the same visual family as Chapter 21's own tree-depth ladder.
- **A merge-down glyph**: two or more bars combining into one, reusing Chapter 19's own slot-to-offset arrow family to show a compaction event.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–21 §A.6: executed `examples.py` compiling real `rustc --edition 2024` sources, self-contained topic, sources fetched and quoted via `scripts/sources.mjs`, registry fields with `milestone: { number: 4, title: 'Storage-Engine Internals' }` and `chapter: { number: 22, title: 'LSM Trees, Memtables, SSTables, and Compaction', section: '22.1' }`. A cargo crate under `examples/` is used; no root access or special hardware is needed, since every structure here is an in-memory Rust collection standing in for a log, memtable, or SSTable file, continuing Chapters 19–21's own pattern.

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–21's own declared list. Chapters 1–21's *introduced* ids this chapter draws on directly: `write-ahead-lsn-redo-idempotence` (Chapter 20, topic 52), `btree-fanout-split-tradeoff` (Chapter 21, topic 55, as the direct cost comparison topic 56's own bridge names). Each topic lists in `uses` only the ones it actually relies on.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `lsm-write-read-amplification-paths` | 56 | An LSM tree's write path defers cost by never modifying an on-disk file in place, logging and buffering writes in a memtable before flushing it, unchanged, as a new SSTable; its read path pays for that deferral by checking the newest structures first, potentially falling through several of them to find or rule out a key. |
| `compaction-strategy-amplification-tradeoff` | 57 | Leveled and tiered compaction push the identical write workload's real read, write, and space amplification in genuinely different, measurable directions; a compaction strategy is a choice among those trade-offs, not a free optimization. |
| `bloom-filter-false-positive-tradeoff` | 58 | A Bloom filter trades real, measurable bits per key for a real, measurable false-positive rate, while guaranteeing zero false negatives, letting a read rule out most SSTables without ever opening them. |

## A.8 Bridges and handoffs

- **56** bridges from Chapter 21's own real handoff (this chapter's own first sentence names it directly: a B+-tree pays its own write cost immediately, at insert time, as a split) and continues Chapter 20's own `write-ahead-lsn-redo-idempotence` directly, since an LSM tree's own write path still begins with a durable log append. Hands off within the chapter to topic 57: "Flushed SSTables accumulate forever unless something merges them back together; what that background process costs is this chapter's next question."
- **57** bridges from topic 56's own SSTables directly and hands off within the chapter to topic 58: "Compaction cuts down how many SSTables a read eventually has to merge; it says nothing yet about how a read decides which SSTables are even worth opening in the first place."
- **58** bridges from topic 56's own read path directly and hands off to the next chapter: "This chapter measured the real cost an LSM tree defers and the real techniques (compaction, filtering) that make deferring it tolerable; the next chapter turns to how a storage engine gives an in-flight reader a consistent view of data that writers keep changing underneath it."

## A.9 Primary sources to start from (this topic must re-fetch and verify)

- O'Neil, Cheng, Gawlick, and O'Neil, "The Log-Structured Merge-Tree (LSM-Tree)," *Acta Informatica*, 1996, for the original write/read path and merge design, if fetchable.
- The RocksDB project's own Wiki or documentation (e.g. "Terminology," "Compaction," "RocksDB Bloom Filter"), for memtable/SSTable terminology, leveled vs tiered (universal) compaction, and Bloom filter configuration, named directly.
