# Chapter 24 — Columnar Storage, Vectors, and Compression (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 4, *Storage-Engine Internals* (its sixth and last chapter). Chapter 24 has two sections: 24.1 *Columnar layout* (two full topics) and 24.2 *Execution* (two full topics). Nothing in `syllabus/rust-systems-engineering.md`'s Chapter 24 is marked `*(skipped)*`. The chapter's own lab exercise (a column scan over ten million integers comparing row-major structs with column-major arrays, adding RLE or delta encoding and an explicit SIMD kernel, measuring bytes read, cycles per row, and the effect of predicate selectivity) is not a reel either. Planned 2026-10-24, in one `/make-topic` session. Previous chapter: Chapter 23, *MVCC, Visibility, and Transaction Isolation* (three topics live: snapshot visibility over version chains, isolation levels and their anomalies, version garbage collection and long snapshots), which closed Milestone 4's row-oriented storage-engine work by naming this chapter's own question directly: how storing values column by column instead of row by row changes what a scan and a point update each cost.

This file is the contract the chapter's four topics build to. Do not edit it once those topics are in progress; record any unavoidable departure under its own `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Chapter 23 closed by naming this chapter's own question directly: a row-oriented layout (every chapter before this one) stores a logical row's fields contiguously, so touching one column of a narrow query still means reading every other column sitting next to it on disk or in cache. A column-major layout instead stores each column's own values contiguously, so a query over a handful of columns genuinely reads only the bytes those columns occupy, with far better cache locality and loops shaped for SIMD execution; the real cost that layout change creates is this chapter's own measured trade: a point update or a wide-row read, genuinely cheap in a row-major layout, becomes genuinely more expensive once a single logical row's fields are scattered across separate columns. Apache Arrow's own format, and the lightweight, data-distribution-aware encodings (run-length, delta, dictionary, frame-of-reference, bit-packing) layered on top of it, are this chapter's concrete references for what a real columnar layout and a real compression scheme actually look like, measured directly rather than taken on faith. The chapter's second half turns from storage layout to execution: once data sits in columnar batches, a query engine can process it in vectorized batches instead of row by row, or compile a query down to data-centric generated code instead; Rust's own SIMD facilities (autovectorization, `std::arch` intrinsics, safe `#[target_feature]` functions) are the concrete mechanism this chapter measures underneath both approaches.

By the end of this chapter's four topics, the learner can: build a real row-major and a real column-major layout over the identical data and measure the real, different costs each pays for a narrow-column scan versus a point update; build a real lightweight encoding (such as run-length or delta) and measure the real, data-distribution-dependent trade between its compression ratio and its decode cost; build a real vectorized, batch-at-a-time execution loop and measure its real throughput advantage over a naive row-at-a-time loop on the identical workload; and measure a real SIMD kernel's own speedup over its scalar equivalent, and confirm autovectorization alone did or did not already provide it.

## A.2 The order of ideas, and why

1. **Columnar layout and the Arrow format** (topic 62, this chapter's first topic) — builds the foundation every later topic in this chapter measures against: a real row-major layout and a real column-major layout over the identical rows, each exposing a validity (null) bitmap the way Arrow's own format does. Measures that a narrow-column scan genuinely reads far fewer bytes in the column-major layout, and that a point update or a wide-row read genuinely costs more there instead.
2. **Lightweight encodings and cascading compression** (topic 63) — builds directly on topic 62's own column-major layout: measures a real run-length (or delta) encoding's own compression ratio and decode cost on a skewed, repetitive column versus a uniformly random one, showing the trade is genuinely data-distribution-dependent, not a default win.
3. **Vectorized versus compiled query execution** (topic 64) — builds directly on topic 62's own column-major batches: measures a real vectorized, batch-at-a-time execution loop's own throughput against a naive row-at-a-time loop over the identical columnar data, on the identical operation.
4. **SIMD in Rust** (topic 65) — builds directly on topic 64's own batch-at-a-time loop: measures a real SIMD kernel's own speedup over its scalar equivalent on the identical data, and whether the compiler's own autovectorization already closed that gap without an explicit kernel at all. Hands off to Chapter 25 (the next milestone's own first chapter, Replication, Quorums, and Failure Semantics — this chapter's own single-node layout and execution questions give way to what a single column or row's own value even means once it's replicated across machines that can fail independently).

*(The chapter's lab — a column scan over ten million integers comparing row-major structs with column-major arrays, adding RLE or delta encoding and an explicit SIMD kernel, measuring bytes read, cycles per row, and the effect of predicate selectivity — is not a reel; it stays in the syllabus as a lab exercise, exercising all four of this chapter's topics together, rather than introducing a new tested claim of its own.)*

## A.3 The running example: one real columnar scan, built and measured

Self-contained (no cross-chapter imports except where a topic explicitly measures a prior chapter's own construction as its baseline), continuing Chapters 1–23's conventions.

- **Topic 62** builds a real row-major layout (a `Vec` of structs, each holding every column's own value for one logical row) and a real column-major layout (one `Vec` per column, plus a validity bitmap per column) over the identical rows. Measures real bytes touched for a narrow-column scan and for a point update, in each layout.
- **Topic 63** builds a real run-length (or delta) encoding over one of topic 62's own columns, measured on a skewed, repetitive data distribution and a uniformly random one. Measures the real compression ratio and the real decode cost (time to materialize every value back out) each distribution produces.
- **Topic 64** builds a real vectorized, batch-at-a-time execution loop (processing topic 62's own columnar batches a chunk at a time) against a real naive row-at-a-time loop performing the identical operation (such as a filter-then-sum) over the identical data. Measures the real throughput each one achieves.
- **Topic 65** builds a real, explicit SIMD kernel (via `std::arch` intrinsics or a safe `#[target_feature]` function) performing topic 64's own operation, measured against both its scalar equivalent and the compiler's own autovectorized version of the scalar loop. Measures the real speedup, if any, the explicit kernel adds beyond what autovectorization alone already provided.

Every number and outcome must come from each topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024). This chapter needs no root access or special hardware beyond whatever SIMD features the container's own CPU exposes (checked, not assumed, at topic 65's own build time); every structure here is built entirely from in-memory Rust collections, continuing this milestone's own pattern from Chapters 19–23.

## A.4 Terms and notation (continuing Chapters 1–23's vocabulary)

Everything in Chapters 1–23 §A.4 still applies. This chapter adds:

- **Row-major layout**: storing a logical row's own fields contiguously, so every column of that row sits next to each other in memory; a wide-row read or a point update touches one contiguous region, but a narrow-column scan still has to skip past every other column.
- **Column-major layout**: storing each column's own values contiguously instead, so a narrow-column scan touches only that column's own bytes; a wide-row read or a point update now has to visit several separate, non-adjacent regions instead.
- **Validity bitmap**: a compact bit-per-row array recording whether a given row's value in a column is present or null, the mechanism Arrow's own format uses instead of a sentinel value or a separate nullable wrapper type.
- **Lightweight encoding**: a compression scheme (run-length, delta, dictionary, frame-of-reference, bit-packing) chosen by a column's own real data distribution and the decode cost a query can afford, not applied by default regardless of the data.
- **Vectorized execution**: processing a batch of values at a time instead of one row at a time, cutting the per-row interpreter overhead a naive row-at-a-time engine pays.
- **SIMD (single instruction, multiple data)**: one CPU instruction operating on several values at once; autovectorization is the compiler doing this on its own from scalar code, an explicit kernel is doing it by hand instead.

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "storing a row's own fields all together" for row-major; "storing each column's own values all together instead" for column-major; "a bit per row, marking whether its value is even there" for a validity bitmap; "a compression trick chosen for how the real data actually looks" for a lightweight encoding; "working through a whole batch at once instead of one row at a time" for vectorized execution; "one instruction doing several values' worth of work at once" for SIMD.

## A.5 Visual language (continuing Chapters 1–23's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list, reusing Chapter 19's page-layout-strip family for this chapter's own row-vs-column memory-layout glyphs. This chapter adds:

- **A row-vs-column grid glyph**: a small grid of cells, highlighted either by row or by column, showing exactly which bytes a scan or an update actually touches in each layout.
- **A batch-lane glyph**: several parallel short lanes processed together in one pass, for showing vectorized or SIMD execution working on several values at once, distinct from a single lane processed repeatedly.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–23 §A.6: executed `examples.py` compiling real `rustc --edition 2024` sources, self-contained topic, sources fetched and quoted via `scripts/sources.mjs`, registry fields with `milestone: { number: 4, title: 'Storage-Engine Internals' }` and `chapter: { number: 24, title: 'Columnar Storage, Vectors, and Compression', section: '24.1' }` (topics 62–63) or `section: '24.2'` (topics 64–65). A cargo crate under `examples/` is used; no root access is needed, though topic 65's own SIMD claims must check the container's own real CPU feature support at build or run time rather than assuming it, and fall back to a clearly-labeled scalar-only measurement if a needed feature is genuinely absent, continuing Chapters 19–23's own pattern of measuring the real, available hardware rather than an idealized one.

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–23's own declared list. Chapters 1–23's own *introduced* ids this chapter draws on directly: none of Chapter 23's own ids are reused mechanically here, since this chapter changes subject from concurrency control to physical layout and execution; topic 62's own bridge instead names Chapter 23's closing handoff in prose, as the real problem this chapter answers. Each topic lists in `uses` only the ones it actually relies on (this chapter's own topics build on each other far more than on earlier chapters).

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `columnar-layout-locality-tradeoff` | 62 | A column-major layout genuinely reduces the real bytes touched by a narrow-column scan and improves cache locality, but it genuinely increases the real cost of a point update or a wide-row read, which a row-major layout pays far less for. |
| `lightweight-encoding-decode-cost-tradeoff` | 63 | A lightweight encoding's own compression ratio and decode cost are genuinely dependent on a column's own real data distribution; the identical encoding that wins big on a skewed, repetitive column can lose on a uniformly random one. |
| `vectorized-vs-compiled-execution-tradeoff` | 64 | Processing data a batch at a time (vectorized execution) genuinely cuts the real per-row overhead a naive row-at-a-time loop pays, measured directly on the identical operation and data. |
| `simd-autovectorization-verification` | 65 | An explicit SIMD kernel's own real speedup over its scalar equivalent must be measured against what the compiler's own autovectorization already provided on its own, not assumed to be the entire gain. |

## A.8 Bridges and handoffs

- **62** bridges from Chapter 23's own real handoff (this chapter's own first sentence names it directly: how storing values column by column instead of row by row changes what a scan and a point update each cost) and needs no earlier chapter's own introduced concept directly, since it changes subject to physical layout. Hands off within the chapter to topic 63: "A column-major layout already cuts the bytes a narrow scan has to touch; it says nothing yet about how much smaller those bytes themselves could genuinely get, or at what cost to read them back out."
- **63** bridges from topic 62's own column-major layout directly and hands off within the chapter to topic 64: "Compression changes how many bytes a column takes up on disk or in memory; it says nothing yet about how a query actually works through those bytes once they're back in hand, one row at a time or a whole batch at once."
- **64** bridges from topic 62's own columnar batches directly and hands off within the chapter to topic 65: "Vectorized execution already cuts the per-row overhead a naive loop pays by working through a batch at a time; it says nothing yet about how much further a single CPU instruction can push that same batch, by working on several of its values at once."
- **65** bridges from topic 64's own batch-at-a-time loop directly and hands off to the next milestone: "This chapter measured what a single machine's own layout and execution choices cost, in real, measured bytes touched and real, measured throughput; the next milestone turns to what happens once that single machine's own data is replicated across several machines that can fail independently, and what an acknowledgement from one of them is actually allowed to promise."

## A.9 Primary sources to start from (this topic must re-fetch and verify)

- The Apache Arrow project's own documentation or specification (format overview, validity bitmaps, buffer layout, the `Utf8View`/`BinaryView`, "German strings" variable-size view layouts), for topic 62's own concrete reference, if fetchable.
- The `arrow-rs` crate's own documentation, for the Rust implementation topic 62 names directly, if fetchable.
- Documentation or a paper excerpt on lightweight encodings (run-length, delta, dictionary, frame-of-reference, bit-packing) for topic 63, naming BtrBlocks (SIGMOD 2023), FSST (VLDB 2020), and ALP (SIGMOD 2024) in prose per the syllabus, if fetchable; a vendor's own columnar-format documentation (e.g. Parquet's own encoding documentation) is an acceptable concrete substitute where a cited paper itself is not fetchable.
- MonetDB/X100 (CIDR 2005) and Kersten et al. (VLDB 2018), for topic 64's own vectorized-versus-compiled comparison, named directly; Polars's or DataFusion's own documentation as the concrete, real vectorized-Arrow-engine reference, if fetchable.
- The Rust standard library's own documentation on `std::arch`, `#[target_feature]`, and runtime feature detection (e.g. `is_x86_feature_detected!`), for topic 65's own concrete reference on safe, explicit SIMD in stable Rust.
