# Chapter 43 — Capstone D: Zero-Copy ETL and Streaming Data Plane (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 8, *Meta-Skill, Compiler, Embedded, GPU, Security, and Testing* (its own last chapter, a capstone project). Chapter 43 has one section: 43.1 *Build* (three full topics: bounded stages and buffer ownership, checkpoints/offsets/watermarks, and throughput accounting beyond records per second; no skipped topics). The chapter's own lab (ingest a large real event stream, zero-copy parse it, build real Arrow-compatible column batches, transform them, write to a real durable sink, then slow the sink tenfold and prove memory stays bounded) is not a reel. Planned 2026-10-24, in one `/make-topic` session. This is the final chapter of the entire Rust Systems Engineering domain.

This file is the contract the chapter's three topics build to. Do not edit it once those topics are in progress; record any unavoidable departure under its own `OUTLINE.md` → "Changes from the chapter plan."

## A.1 The problem it solves

Every earlier chapter in this domain taught one real mechanism, decided and measured once. A real data platform's own hot path needs all of them working together, continuously, under a real, variable load: a producer that never outpaces a slow consumer, a restart that never reprocesses or loses a single real record, and a measurement of throughput honest enough to catch a real, pathological allocation regime that a single, simple number (records per second) would hide. This chapter integrates the whole domain's own real techniques into one real, bounded, zero-copy data pipeline, judged end to end rather than one mechanism at a time.

By the end of this chapter's three topics, the learner can: build a real, bounded pipeline whose own memory stays bounded under a real, slowed-down sink, where an unbounded, clone-heavy pipeline's own memory would not; measure that a real restart after a real, simulated crash is exactly-once, reprocessing nothing already committed and losing nothing that was not; and measure a real, concrete case where records-per-second alone hides a real difference in allocation cost that a second, real metric exposes directly.

## A.2 The order of ideas, and why

1. **Bounded stages and buffer ownership** (topic 97, this chapter's first topic) — builds a real, bounded pipeline (source, batch builder, sink, each stage owning its own real backing buffer, connected by real bounded channels) and measures a real, concrete difference under a real, slowed-down sink: the bounded, owning pipeline's own real memory stays capped, while an unbounded, clone-heavy pipeline's own real memory keeps growing with every batch the slow sink has not yet drained.
2. **Checkpoints, offsets, and watermarks** (topic 98) — adds a real, durable checkpoint, storing the real source offset only once the sink has actually committed, and measures a real, concrete difference after a real, simulated crash mid-stream: a pipeline that checkpoints restarts exactly where it actually left off, reprocessing nothing and losing nothing, while a pipeline that checkpoints at the wrong real point (before the sink commits, rather than after) either reprocesses real records the sink already has or silently loses real records the sink never received.
3. **Throughput accounting beyond records per second** (topic 99) — measures a real, concrete case where two real implementations produce the identical real records-per-second throughput, while one of them allocates a real, dramatically larger number of bytes per record than the other, a real difference records-per-second alone never reveals.

*(The chapter's own lab — ingesting a real event stream, zero-copy parsing it into real Arrow-compatible column batches, transforming them, writing to a real durable sink, then slowing the sink tenfold and proving memory stays bounded — is not a reel; it applies this chapter's own three topics together to a larger, real system rather than introducing a new tested claim of its own.)*

## A.3 The running example: one real, bounded ETL pipeline, extended topic by topic

Self-contained (no cross-chapter imports). Each topic's own `examples/` folder holds its own independent crate, extending the identical real pipeline shape from the prior topic.

- **Topic 97** builds a real, three-stage pipeline (a source task generating records, a batch-builder task grouping them into real, owned batches, and a sink task that is deliberately slowed down), connected by real, bounded `tokio::sync::mpsc` channels, each batch owning its own real `Vec<u8>` backing buffer moved between stages rather than cloned. A second, independent pipeline, built the identical way except its own channels are unbounded and each stage clones its own batch into the next rather than moving it, is driven by the identical real, fast producer against the identical real, slow sink; it measures that the real, bounded, owning pipeline's own real, measured memory (total bytes held across all in-flight batches) stays capped near a real, small bound, while the unbounded, cloning pipeline's own real, measured memory keeps growing for as long as the fast producer keeps running ahead of the slow sink.
- **Topic 98** reuses topic 97's own real, bounded pipeline shape, adding a real checkpoint that records the highest real source offset whose own batch the sink has actually, durably committed. It measures a real, simulated crash partway through a real stream and a real restart from the real, saved checkpoint: a pipeline that checkpoints only after the sink's own real commit restarts and reprocesses nothing the sink already has and loses nothing it does not; a second, deliberately wrong pipeline that checkpoints before the sink commits (the instant a batch is handed to the sink, not once it is actually durable) restarts having silently lost whatever batch was in flight exactly at the real crash.
- **Topic 99** reuses the identical real pipeline shape once more, this time comparing two real transform implementations that process the identical real stream and reach the identical real records-per-second throughput: one moves and borrows its own real column buffers, and one clones them needlessly at every stage. It measures, with a real, simple allocation counter wrapping the global allocator, that the two implementations' own real throughput numbers are statistically indistinguishable, while their own real, measured allocation bytes per record differ by a real, large, measured factor.

Every number and outcome must come from each topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024, cargo, and tokio available from crates.io). This chapter needs no root access beyond ordinary package installation and no real network I/O, continuing this domain's own established pattern of measuring a real, small, fully-controlled system directly.

## A.4 Terms and notation (continuing Chapters 1–42's vocabulary)

Everything in Chapters 1–42 §A.4 still applies. This chapter adds:

- **Buffer ownership**: which real stage of a pipeline actually owns a batch's own backing memory at a given moment, moved forward rather than copied, so a slow stage downstream cannot force an unbounded, real amount of memory to pile up upstream of it.
- **Watermark**: a real, monotonically advancing marker naming the latest real point in a stream a pipeline has fully, durably processed, used to decide what a restart must redo and what it must not.
- **Allocation regime**: the real, measured pattern of how much memory a pipeline actually allocates per unit of real work, which can differ enormously between two implementations that otherwise produce the identical real throughput number.

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "handing the buffer forward instead of copying it" for buffer ownership; "remembering exactly how far it got, and no further" for a watermark/checkpoint; "the same speed, a very different cost" for an allocation regime records-per-second hides.

## A.5 Visual language (continuing Chapters 1–24's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list. This chapter adds:

- **A watermark glyph**: a real, simple advancing line with a visible marker showing exactly how far a pipeline has actually, durably gotten.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–42 §A.6, with this chapter's own explicit addition: every topic's own `examples.py` drives a real `cargo run` of a real, small, async pipeline crate under `examples/`; every measured claim (memory held, restart correctness, allocation bytes per record) comes from that real, executed pipeline's own printed, real counts, never from a claim merely asserted in prose. Registry fields use `milestone: { number: 8, title: 'Meta-Skill, Compiler, Embedded, GPU, Security, and Testing' }` and `chapter: { number: 43, title: 'Capstone D: Zero-Copy ETL and Streaming Data Plane', section: '43.1' }` (this chapter's own three full topics are all in section 43.1).

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–42's own declared list. Topic 97 reuses `bounded-channel-backpressure` (Ch.10) directly, building the identical bounded-versus-unbounded contrast at the scale of a whole pipeline rather than one channel. Topics 98 and 99 each reuse topic 97's own introduced id directly, continuing the identical within-chapter pattern earlier capstone chapters established.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `an-owned-buffer-moved-forward-keeps-memory-bounded` | 97 | A pipeline where each stage owns its own real buffer and hands it forward rather than cloning it keeps its own real, total memory bounded under a slow sink; a pipeline that clones into unbounded queues does not, however fast the stages themselves run. |
| `a-checkpoint-taken-before-the-real-commit-loses-data` | 98 | A checkpoint's own real correctness depends entirely on when it is taken relative to the sink's own real commit; taken after, a restart reprocesses nothing and loses nothing; taken before, a restart can silently lose whatever was genuinely in flight. |
| `records-per-second-alone-hides-a-real-allocation-cost` | 99 | Two real implementations can reach the identical real records-per-second throughput while allocating a dramatically different real number of bytes per record, a difference records-per-second alone never reveals. |

## A.8 Bridges and handoffs

- **97** bridges from Chapter 42's own real handoff (naming directly that a real property test and a real, stateful comparison both catch what a hand-picked example cannot, and that this milestone now turns to how all of this domain's own real techniques come together in one real system, built and judged end to end). Hands off within the chapter to topic 98: "A pipeline whose own real memory stays bounded under a slow sink has solved one real problem, keeping up; the next real problem is what happens when it stops running entirely, mid-stream, and has to start again without losing or repeating a single real record."
- **98** bridges from topic 97's own measured comparison directly and hands off within the chapter to topic 99: "Surviving a real crash without losing or repeating a single real record is a real, structural property of a pipeline's own restart logic; it says nothing yet about whether that same pipeline is actually efficient while it runs, which is a real, separate question a single throughput number can hide."
- **99** bridges from topic 98's own measured comparison directly and hands off to whatever comes after this domain's own final chapter (verbatim, closing this domain): "A bounded pipeline that keeps its own memory capped, restarts without losing or repeating a single real record, and is measured by more than one real number, is what every earlier chapter in this domain was building toward: a real system, judged end to end, by how it actually behaves rather than by any one mechanism in isolation."

## A.9 Primary sources to start from (this topic must re-fetch and verify)

- The `tokio::sync::mpsc` module's own documentation (`docs.rs/tokio`), reused directly for topic 97's own concrete reference on bounded-versus-unbounded channel backpressure, continuing Chapters 10, 34, and 92's own established source.
- The Apache Arrow project's own documentation on its own columnar format (`arrow.apache.org`), for a concrete reference on the real, zero-copy, owned-buffer convention this chapter's own running pipeline is modeled on, named directly in topic 97's own `OUTLINE.md`.
- The `std::alloc::GlobalAlloc` trait's own documentation (`doc.rust-lang.org/std`), for topic 99's own concrete reference on the real allocator-wrapping mechanism this topic measures allocation bytes per record with.
