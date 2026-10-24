# Chapter 23 — MVCC, Visibility, and Transaction Isolation (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 4, *Storage-Engine Internals* (its fifth and final chapter). Chapter 23 has one section, 23.1, with three full topics; nothing in `syllabus/rust-systems-engineering.md`'s Chapter 23 is marked `*(skipped)*`. The chapter's own lab exercise (simulating two concurrent transactions over an in-memory version chain, implementing read-committed and repeatable-read visibility, measuring version retention under a long-lived reader, and writing a write-skew test that passes under SI with a detection rule that rejects it) is not a reel either. Planned 2026-10-24, in one `/make-topic` session. Previous chapter: Chapter 22, *LSM Trees, Memtables, SSTables, and Compaction* (three topics live: LSM write and read paths, compaction strategies and amplification, Bloom filters and their successors), which closed on how a storage engine gives an in-flight reader a consistent view of data that writers keep changing underneath it — this chapter's own first question.

This file is the contract the chapter's three topics build to. Do not edit it once those topics are in progress; record any unavoidable departure under its own `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Chapter 22 closed by naming the next real problem directly: a storage engine must give an in-flight reader a consistent view of data that writers keep changing underneath it. This chapter answers with multi-version concurrency control (MVCC), using PostgreSQL's own MVCC documentation as the concrete reference. Instead of locking a row for a reader or blocking a writer behind one, a writer creates a brand-new version of a row rather than overwriting the one a concurrent reader may still need; a reader's own transaction snapshot, not "the newest row available," decides which version chain entry it is actually allowed to see. That one design choice buys real concurrency (readers never block writers, writers never block readers) but creates two real, measurable costs this chapter addresses directly: the exact set of concurrent histories an isolation level permits or forbids is a precise, checkable guarantee, not a vague promise, and a version a reader might still need cannot be reclaimed until nothing could possibly still need it, which ties storage growth directly to how long any one snapshot stays open.

By the end of this chapter's three topics, the learner can: build a real, minimal version chain and a real visibility check that decides, for a given snapshot and a given chain of versions, which single version is visible, and confirm it is a function of version metadata and the snapshot, never "the newest"; build a real write-skew anomaly that snapshot isolation permits but serializability forbids, and a real conflict-detection rule that rejects it; and measure, directly, how a single long-lived reader's snapshot forces otherwise-reclaimable old versions to keep accumulating.

## A.2 The order of ideas, and why

1. **Snapshot visibility over version chains** (topic 59, this chapter's first topic) — builds the foundation every later topic in this chapter measures against: a real, minimal version chain (each row a chain of versions tagged with the transaction that created and, where applicable, deleted it) and a real visibility check that walks a chain and returns the one version a given snapshot may see. Measures that visibility is genuinely a function of version metadata plus the snapshot, never simply "the newest row," and that two concurrent snapshots can genuinely see two different versions of the same row at once.
2. **Isolation levels and their anomalies** (topic 60) — builds directly on topic 59's own version chains: measures a real write-skew anomaly that a real snapshot-isolation implementation genuinely permits, and that a real, stricter check (grounded in Adya's dependency-graph formalism) genuinely detects and rejects, over the identical concurrent history.
3. **Version garbage collection and long snapshots** (topic 61) — builds directly on topic 59's own version chains: measures that an old version genuinely cannot be reclaimed while any still-open snapshot could still need it, and that a single long-lived reader's snapshot genuinely causes version count (and thus storage) to keep growing in a way a short-lived reader never would, on the identical write workload. Hands off to Chapter 24 (this milestone's next chapter, on columnar storage and vectors — the row-oriented, version-chain world this chapter measures gives way to a column-major layout built for scanning, not point-version lookups).

*(The chapter's lab — simulating two concurrent transactions over an in-memory version chain, implementing read-committed and repeatable-read visibility, measuring version retention under a long-lived reader, and writing a write-skew test that passes under SI with a detection rule that rejects it — is not a reel; it stays in the syllabus as a lab exercise, exercising all three of this chapter's topics together, rather than introducing a new tested claim of its own.)*

## A.3 The running example: one real version chain, built and measured

Self-contained (no cross-chapter imports except where a topic explicitly measures a prior chapter's own construction as its baseline), continuing Chapters 1–22's conventions.

- **Topic 59** builds a real, minimal version chain per row (each version tagged with the id of the transaction that created it and, once superseded, the id of the transaction that deleted it) and a real visibility check taking a snapshot (a transaction id plus the set of transactions it considers still in-flight) and returning the single version, if any, that snapshot may see. Measures that two snapshots taken at different points genuinely see two different, correct versions of the identical row.
- **Topic 60** builds on topic 59's own version chains directly: a real write-skew scenario (two concurrent transactions, each reading a shared invariant and each writing a different row to preserve it, that together violate the invariant when both commit) run under a real snapshot-isolation check, and a real, stricter check implementing Adya's dependency-graph formalism against the identical history. Measures that the SI check genuinely allows the anomaly through while the stricter check genuinely detects and rejects it.
- **Topic 61** builds on topic 59's own version chains directly: a real garbage-collection pass that reclaims a version only once no still-open snapshot's in-flight set could possibly still need it, run against the identical write workload under a short-lived-reader scenario and a long-lived-reader scenario. Measures the real, different number of retained versions each scenario produces.

Every number and outcome must come from each topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024). This chapter needs no root access or special hardware; every structure here is built entirely from in-memory Rust collections standing in for a real transaction manager's version store, continuing this milestone's own pattern from Chapters 19–22.

## A.4 Terms and notation (continuing Chapters 1–22's vocabulary)

Everything in Chapters 1–22 §A.4 still applies. This chapter adds:

- **Version chain**: the ordered set of versions a single logical row has accumulated over time, each tagged with the transaction that created it and, once superseded, the one that deleted it.
- **Snapshot**: a transaction's own fixed view of which other transactions' writes it is and is not allowed to see, decided once (for snapshot isolation, at the transaction's start) and held fixed for its duration.
- **Visibility**: the rule, a function of a version's own metadata and the reader's snapshot, that decides which single version of a row a given reader may see; never simply "the newest version written."
- **Write skew**: a concurrency anomaly where two transactions each individually preserve a shared invariant they read, but their combined effect, once both commit, violates it; permitted under snapshot isolation, forbidden under full serializability.
- **Version garbage collection**: reclaiming an old, superseded version's storage, which is only safe once no still-open snapshot could possibly still need to see it.

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "a chain of versions of the same row, newest additions on one end" for version chain; "a transaction's own frozen view of who else gets to be seen" for snapshot; "which one version of a row a given reader is actually allowed to see" for visibility; "two transactions that each look safe alone but together break a shared rule" for write skew; "throwing away an old version once nobody could possibly still need it" for version garbage collection.

## A.5 Visual language (continuing Chapters 1–22's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list, reusing Chapter 22's layered-files glyph family for a version chain's own stacked versions. This chapter adds:

- **A snapshot-window glyph**: a bracket or highlighted band drawn across a version chain, showing exactly which versions a given snapshot's window includes, in the same visual family as Chapter 22's own layered-files glyph.
- **A two-lane timeline glyph**: two parallel horizontal tracks (one per concurrent transaction) with marked read and write points, for showing a write-skew history unfolding over time.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–22 §A.6: executed `examples.py` compiling real `rustc --edition 2024` sources, self-contained topic, sources fetched and quoted via `scripts/sources.mjs`, registry fields with `milestone: { number: 4, title: 'Storage-Engine Internals' }` and `chapter: { number: 23, title: 'MVCC, Visibility, and Transaction Isolation', section: '23.1' }`. A cargo crate under `examples/` is used; no root access or special hardware is needed, since every structure here is an in-memory Rust collection standing in for a real transaction manager's version store, continuing Chapters 19–22's own pattern. PostgreSQL's own wiki, if quoted, is subject to the same repo-scoped-GitHub-access workaround as Chapters 20–22's RocksDB wiki quotes where applicable (`raw.githubusercontent.com/wiki/<owner>/<repo>/<Page>.md` for the fetch, the normal `github.com/.../wiki/...` link for the reader-facing citation); PostgreSQL's own docs are ordinarily reachable directly and need no such workaround.

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–22's own declared list. Chapters 1–22's own *introduced* ids this chapter draws on directly: `lsm-write-read-amplification-paths` (Chapter 22, topic 56) and `compaction-strategy-amplification-tradeoff` (Chapter 22, topic 57), as the direct "a storage engine must still give a reader a consistent view" comparison topic 59's own bridge names. Each topic lists in `uses` only the ones it actually relies on.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `snapshot-visibility-version-chain` | 59 | Visibility is a function of a version's own metadata plus a reader's fixed snapshot, never simply the newest version written; writers create new versions instead of overwriting ones a concurrent reader may still need, which stops readers blocking writers but ties visibility directly to garbage collection. |
| `isolation-level-permitted-anomaly` | 60 | An isolation level is a precise, checkable statement about which concurrent histories are allowed; snapshot isolation genuinely permits the write-skew anomaly that a stricter, dependency-graph-based check genuinely detects and rejects over the identical history. |
| `version-gc-coupled-to-snapshot-lifetime` | 61 | An old version's storage cannot be reclaimed while any still-open snapshot could possibly still need it, so a single long-lived reader's snapshot genuinely becomes a real, measurable storage-growth problem that a short-lived reader never causes. |

## A.8 Bridges and handoffs

- **59** bridges from Chapter 22's own real handoff (this chapter's own first sentence names it directly: a storage engine must give an in-flight reader a consistent view of data that writers keep changing underneath it) and continues Chapter 22's own `lsm-write-read-amplification-paths` and `compaction-strategy-amplification-tradeoff` directly, since both describe a storage engine managing multiple on-disk structures a reader must resolve, the same shape of problem this chapter now applies to row versions instead of SSTables. Hands off within the chapter to topic 60: "Visibility decides which single version a reader sees; it says nothing yet about which concurrent histories of reads and writes across several transactions are even allowed to happen at all."
- **60** bridges from topic 59's own version chains directly and hands off within the chapter to topic 61: "An isolation level draws the line on which histories are allowed; it says nothing about how long the versions those histories created are allowed to stick around afterward."
- **61** bridges from topic 59's own version chains directly and hands off to the next chapter: "This chapter measured what a storage engine owes a concurrent reader: a consistent version to see, a precise rule on which histories are allowed, and a real cost for every version kept around until nothing could still need it; the next chapter turns to a different layout question entirely, how storing values column by column instead of row by row changes what a scan and a point update each cost."

## A.9 Primary sources to start from (this topic must re-fetch and verify)

- PostgreSQL's own documentation on MVCC (e.g. "Chapter 13. Concurrency Control," `xmin`/`xmax` and the transaction-snapshot mechanics), for the concrete reference on version metadata, snapshot visibility, and isolation levels this chapter is built against.
- Adya, "Weak Consistency: A Generalized Theory and Optimistic Implementations for Distributed Transactions," for the dependency-graph formalism grounding topic 60's own stricter anomaly check.
- Cahill, Röhm, and Fekete, "Serializable Isolation for Snapshot Databases" (SIGMOD 2008), and Ports and Grittner, "Serializable Snapshot Isolation in PostgreSQL" (VLDB 2012), for Serializable Snapshot Isolation as topic 60's own named real-world technique, if fetchable.
