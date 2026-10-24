# Chapter 19 — Pages, Records, and Physical Storage Layout (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 4, *Storage-Engine Internals* (its first chapter). Chapter 19 has one section, 19.1, with four full topics; its own lab exercise (a 4 KiB slotted page, variable-length records, deletion and compaction, fuzzed malformed offsets, a page checksum and format version, a small CLOCK buffer pool in front of it) is not a reel, per `CLAUDE.md`'s convention. Planned 2026-10-24, in one `/make-topic` session. Previous chapter: Chapter 18, *Axum, Tower, and Production Service Boundaries* (three topics live: Tower Service and poll_ready backpressure, Axum on Tower and hyper, middleware ordering as semantics), which closed Milestone 3.

This file is the contract the chapter's four topics build to. Do not edit it once a topic is in progress; record any unavoidable departure under that topic's `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Chapter 18 closed on a request correctly bounded and correctly ordered at a service boundary. This chapter is about what sits behind that boundary once the request lands and needs to be stored: bytes on disk, organized into fixed-size pages, with an explicit identity for every record and a policy for who caches which page in memory. A page that isn't self-describing — no magic number, no format version, no checksum — can't tell corruption from a genuine, intentional format change, and can't be safely read back years later by a different version of the same program; PostgreSQL's own page layout (header, line pointers, tuples, free space, a special area) is the reference this chapter builds from directly. A slotted page's whole point is that a record's logical identity (its slot) and its physical offset inside the page are two different things, deliberately: that's what lets a record move during compaction without invalidating every pointer to it elsewhere in the system. Choosing how to apply an update — in place, append-only, or copy-on-write — is not a detail; it trades off fragmentation, multi-version concurrency support, and compaction cost differently, and three real systems (PostgreSQL's heap, an LSM's append-only writes, LMDB's copy-on-write B-tree) each made a different, deliberate choice. And none of this says anything yet about memory: a buffer pool's own frame table, pin counts, and dirty bits, plus an eviction policy, decide which of possibly many more pages than fit in RAM are actually resident at any moment — and modern designs (LeanStore's pointer swizzling, vmcache) found ways to avoid the hash-table indirection a classic buffer pool needs, by swizzling pointers directly once a page is pinned.

By the end of the chapter the learner can: build a real, self-describing fixed-size page (header, line pointers, tuples, free space, special area, magic number, format version, a real CRC32C checksum, a page LSN, explicit endianness and alignment) and show that corruption or a format mismatch is caught, not silently misread; build a real slotted page where a record's logical slot and its physical offset are genuinely decoupled, and show a record moving during compaction while every reference to its slot stays valid; implement and measure the real, different fragmentation and compaction cost of an in-place update versus an append-only write versus a copy-on-write update, on the same workload; and build a minimal, real buffer pool with a frame table, pin counts, dirty bits, and a real eviction policy, showing it genuinely evicts the right page under pressure and never evicts a pinned one, contrasted directly with Chapter 12's own `mmap`-based approach.

## A.2 The order of ideas, and why

1. **Self-describing page formats** (topic 48) — the chapter's foundation: a real, fixed-size page that can tell its own format, version, and integrity from its own header alone, needing nothing outside the page itself to validate it. Needs Chapter 5's own `size-alignment-padding-rules` and `safe-byte-level-views` directly (a page's own header is exactly a byte-level view over an explicitly laid-out, explicitly-aligned struct, with endianness chosen deliberately rather than left to the platform).
2. **Slotted pages and record identity** (topic 49) — needs topic 48's own page layout directly: a slotted page is topic 48's page format with one deliberate addition, an indirection layer (the slot array) between a record's logical identity and its physical offset. Measures a record's slot staying stable while its physical offset changes during a real compaction.
3. **Update strategies: in-place, append, copy-on-write** (topic 50) — needs topic 49's own record-identity question directly: once a record has a stable logical identity, updating it can mean overwriting its old bytes in place, appending a new version elsewhere, or copying the whole page and swapping a pointer — three deliberate choices with different, measurable fragmentation and compaction costs on the same real workload.
4. **Buffer pool and page eviction** (topic 51) — needs topics 48-50's own page as its unit of caching: once pages are a well-defined, self-describing, independently-updatable unit, the question becomes which ones are resident in memory, who may evict which, and how a pin keeps a page from being evicted while it's in use. Contrasts directly with Chapter 12's own `mmap-double-caching` id, closing the chapter by naming the real trade-off between an explicit buffer pool and letting the kernel's own page cache do the work. Hands off to Chapter 20 (Write-Ahead Logging and Crash Recovery), since a page that can be evicted and later re-read needs a durability story for what happens if the process or machine dies with a dirty page still only in memory.

*(The chapter's lab — a real 4 KiB slotted page, insert variable-length records, delete half, compact, fuzz malformed offsets, add a page checksum and format version, and a small CLOCK buffer pool in front of it — is not a reel; it stays in the syllabus as a lab exercise, exercising all four of this chapter's topics together rather than introducing a new tested claim of its own.)*

## A.3 The running example: one real page, built and measured four ways

Self-contained per topic (no cross-chapter imports except where a topic explicitly measures a prior chapter's own construction as its baseline), continuing Chapters 1–18's conventions.

- **Topic 48** builds a real, fixed-size page as an explicit, `#[repr(C)]` (or manually laid out) byte buffer: a header with a magic number, format version, slot count, a real CRC32C checksum (computed over the page's own bytes) and a page LSN, explicit little-endian (or big-endian) encoding chosen and enforced rather than left to the platform's own native order. Measures that a corrupted byte, or a deliberately wrong magic number, is genuinely caught on read, and that the checksum genuinely changes when the page's own bytes change.
- **Topic 49** extends that page with a real slot array: each slot holds a physical offset into the page, and a record's own identity is its slot index, not its offset. Measures that compacting the page (physically moving a record to remove a gap left by a deleted one) changes that record's physical offset while its slot index, and everything that referenced the record by slot, stays genuinely valid.
- **Topic 50** builds the same kind of update three different real ways over a real sequence of writes to the same logical record: overwriting its bytes in place, appending each new version to a growing log and tracking the latest, and copying the whole page with the new version swapped in. Measures the real, different space used and real, different work needed to compact or reclaim space under each strategy, on the same workload.
- **Topic 51** builds a minimal, real buffer pool: a frame table mapping page numbers to in-memory frames, a pin count per frame, a dirty bit, and a real eviction policy (at minimum CLOCK, as the syllabus's own lab specifies). Measures that pinned pages are genuinely never chosen for eviction, that a dirty page is genuinely written back before its frame is reused, and that the policy genuinely favors evicting pages the policy's own rule says to evict, not an arbitrary one.

Every number and outcome must come from the topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024). No topic in this chapter needs root access or special hardware; a page is just a byte buffer, and eviction and compaction are measured entirely in-process. Where CRC32C isn't in `std`, a topic adds the minimal, explicit dependency the syllabus names (e.g. `crc32fast` or a hand-written CRC32C table) rather than reaching for a heavier framework.

## A.4 Terms and notation (continuing Chapters 1–18's vocabulary)

Everything in Chapters 1–18 §A.4 still applies. This chapter adds:

- **Self-describing page format**: a fixed-size page whose own header carries enough information (a magic number, format version, checksum, page LSN) to validate and interpret the page without any information from outside the page itself.
- **Line pointers / slot array**: an indirection layer inside a page mapping a stable, logical slot index to a record's current physical offset, so a record's identity and its physical location can change independently.
- **In-page compaction**: physically rearranging a page's own records to reclaim space left by deleted ones, updating the slot array's own offsets without changing any slot's own index.
- **In-place / append-only / copy-on-write update**: three deliberate strategies for applying an update to a record, trading off fragmentation, multi-version concurrency support, and compaction cost differently.
- **Buffer pool / frame table / pin count / dirty bit**: an explicit, in-process cache of pages, with a table mapping page numbers to frames, a count of how many callers currently hold a page pinned (and therefore ineligible for eviction), and a bit marking whether a frame's own contents have been modified since they were last written back.
- **Eviction policy (CLOCK, LRU-K, 2Q)**: an explicit rule for choosing which unpinned, resident page to evict when a new page needs a frame and none is free.
- **Pointer swizzling**: replacing a page-number reference with a direct in-memory pointer once a page is pinned, avoiding a buffer pool's own hash-table lookup on every access (contrasted with the classic frame-table design).

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "a page that can tell its own format and whether it's been damaged" for a self-describing page format; "a stable name for a record, separate from where it actually sits" for a slot; "closing the gaps left by deleted records" for in-page compaction; "overwriting it where it sits, adding a new version elsewhere, or copying the whole page" for the three update strategies; "a cache of pages, with a count of who's using each one" for a buffer pool; "a rule for choosing which page to kick out" for an eviction policy; "swapping in a direct pointer once a page is pinned" for pointer swizzling.

## A.5 Visual language (continuing Chapters 1–18's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list (per Chapter 11's own established fix) and the byte-stream-strip/frame-cap-gate/nested-layer-stack glyphs Chapters 16 and 18 introduced, reused where relevant. This chapter adds:

- **A page-layout strip**: a single horizontal strip divided into labeled regions (header, line pointers, tuples, free space, special area), matching PostgreSQL's own reference layout.
- **A slot-to-offset arrow**: a glyph showing a stable slot index on one side and an arrow to a physical offset that can change, in the same visual family as Chapter 16's frame-cap gate.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–18 §A.6: executed `examples.py` compiling real `rustc --edition 2024` sources, self-contained topic, sources fetched and quoted via `scripts/sources.mjs`, registry fields with `milestone: { number: 4, title: 'Storage-Engine Internals' }` and `chapter: { number: 19, title: 'Pages, Records, and Physical Storage Layout', section: '19.1' }`. A cargo crate under `examples/` is used, with a minimal, explicit CRC32C dependency where `std` doesn't provide one (topic 48 only); no `sys.platform != 'win32'` guard is needed in this chapter, since every measurement here is a plain, portable byte buffer.

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–18's own declared list. Chapters 1–18's *introduced* ids this chapter draws on directly: `size-alignment-padding-rules`, `safe-byte-level-views` (Chapter 5); `mmap-double-caching` (Chapter 12). A topic in this chapter lists in `uses` only the ones it actually relies on.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `self-describing-page-header` | 48 | A fixed-size page's own header carries a magic number, format version, checksum, and page LSN, letting it validate and interpret itself without outside information. |
| `slot-indirection-stable-identity` | 49 | A slotted page's slot array separates a record's stable logical identity from its physical offset, letting the offset change (e.g. during compaction) without invalidating the identity. |
| `update-strategy-fragmentation-tradeoff` | 50 | In-place, append-only, and copy-on-write updates trade off fragmentation, MVCC support, and compaction cost differently; which one a system picks is a deliberate, measurable choice. |
| `buffer-pool-pin-evict-contract` | 51 | A buffer pool's frame table, pin counts, and dirty bits enforce that a pinned page is never evicted and a dirty page is written back before its frame is reused. |

## A.8 Bridges and handoffs

- **48** bridges from Chapter 18's own real handoff (this chapter's own first sentence names it directly: Chapter 18 closed on a request correctly bounded and ordered at a service boundary; this chapter is about what sits behind that boundary once the request lands and needs to be stored) and continues Chapter 5's own `size-alignment-padding-rules`/`safe-byte-level-views`, since a page's own header is exactly a byte-level view over an explicitly laid-out, explicitly-aligned struct. Hands to 49: "A page that can describe itself is the foundation; the next question is how a record inside that page keeps a stable identity while its own physical location can still change."
- **49** bridges from 48's own handoff directly, adding the slot array as the one deliberate addition to 48's page format. Hands to 50: "A record with a stable logical identity can now be updated three genuinely different ways, and each way trades off fragmentation, concurrency support, and compaction cost differently."
- **50** bridges from 49's own handoff directly, measuring the three ways. Hands to 51: "All three update strategies still produce pages that need to be cached in memory; the next question is which pages are resident at all, and who gets to decide which one is evicted."
- **51** bridges from 50's own handoff directly, closing the chapter with the buffer pool as the unit of caching built from topics 48-50's own page. Hands off to Chapter 20 (Write-Ahead Logging and Crash Recovery): "A page that can be evicted and later re-read needs a durability story for what happens if the process or machine dies with a dirty page still only in memory."

## A.9 Primary sources to start from (each topic must re-fetch and verify)

- The PostgreSQL Global Development Group, "Database Page Layout," the PostgreSQL documentation, for the header/line-pointers/tuples/free-space/special-area reference layout.
- The PostgreSQL Global Development Group, "pageinspect," the PostgreSQL documentation, for the slotted-page/line-pointer model and TOAST's own out-of-line storage.
- The `crc32fast` crate's own documentation (or an equivalent, minimal CRC32C reference), for the checksum algorithm's own documented behavior.
- The LeanStore paper (ICDE 2018) and the vmcache paper (SIGMOD 2023), for the pointer-swizzling approach to buffer-pool design named directly by the syllabus.
