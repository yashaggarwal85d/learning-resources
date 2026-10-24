# Chapter 27 — Kafka-Style Logs, Partitions, and Delivery Semantics (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 5, *Distributed Systems and Streaming* (its third chapter). Chapter 27 has one section, 27.1 *Log mechanics and semantics*, with three full topics and no skipped ones. The chapter's own lab exercise (a partitioned log with consumer offsets, running at-least-once, crashing between the side effect and the offset commit, observing the duplicate, then making the consumer idempotent) is not a reel either. Planned 2026-10-24, in one `/make-topic` session. Previous chapter: Chapter 26, *Raft: Leader Election, Log Replication, and Commitment* (two topics live: leader election, terms, and PreVote; log replication and commitment rules), which closed by naming this chapter's own first question directly: what a log built on exactly this kind of replicated, ordered structure looks like once it is a real product-facing abstraction, with its own partitions, delivery guarantees, and retention rules.

This file is the contract the chapter's three topics build to. Do not edit it once those topics are in progress; record any unavoidable departure under its own `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Chapter 26 measured how a single, replicated log agrees on a leader and safely commits what that leader replicates; this chapter opens the real question underneath a product like Kafka: once that log abstraction is exposed to real producers and consumers at scale, what does it actually promise about ordering, delivery, and how long data sticks around, and where do those promises concretely break? A single append-only log cannot scale past one machine's own throughput, so a real system divides a topic into partitions, each its own ordered log, and orders only within a partition, never across the topic as a whole; key-based partitioning keeps a given key's own writes in order while spreading load across partitions, but changing the number of partitions silently breaks that guarantee for existing keys. Delivery semantics (at-most-once, at-least-once, exactly-once) are not properties of the network; they are defined by exactly where publishing, consuming, and committing an offset can independently fail, and a real idempotent producer and transactional consumer exist specifically to narrow that failure window, though even they do not remove the need for a consumer's own idempotent handling of side effects. Finally, a log cannot grow forever: retention and compaction decide what a consumer can still read days or years later, and real systems tier cold segments out to cheaper storage rather than deleting them outright.

By the end of this chapter's three topics, the learner can: build a real toy partitioned log and measure that key-based partitioning preserves per-key order only until the partition count changes; build a real at-least-once consumer, measure the exact duplicate it produces by crashing between a side effect and an offset commit, and measure that making the consumer idempotent removes the duplicate's own visible effect without removing the redelivery itself; and build a real log that measures the exact difference between time/size retention and key-based compaction, including a tombstone's own real effect.

## A.2 The order of ideas, and why

1. **Partitioned logs and per-key ordering** (topic 70, this chapter's first topic) — builds the foundation every later topic in this chapter measures against: a real toy multi-partition log with real key-based partitioning (`hash(key) % N`), measuring that per-key order is genuinely preserved across many writes to the identical key, and that changing the partition count genuinely breaks that guarantee for existing keys by genuinely re-routing them to a different partition.
2. **Delivery semantics and idempotent consumers** (topic 71) — builds directly on topic 70's own partitioned log: measures the exact, real duplicate an at-least-once consumer produces when it crashes between applying a side effect and committing its own offset, and measures that an idempotent consumer, using the producer's own real idempotency key, genuinely removes the duplicate's own visible effect while the redelivery itself still genuinely happens.
3. **Retention, compaction, and tiered storage** (topic 72) — builds directly on topic 70's own partitioned log: measures the exact, real difference between time/size-based retention (which deletes entries once they age out, regardless of key) and key-based compaction (which keeps only the latest value per key forever, with a tombstone genuinely removing a key once compaction runs past it).

*(The chapter's own lab — a partitioned log with consumer offsets, running at-least-once, crashing between the side effect and the offset commit, observing the duplicate, then making the consumer idempotent — is not a reel; it stays in the syllabus as a lab exercise, exercising this chapter's own first two topics together, rather than introducing a new tested claim of its own.)*

## A.3 The running example: one real toy partitioned log, built and measured

Self-contained (no cross-chapter imports except where a topic explicitly measures a prior chapter's own construction as its baseline), continuing Chapters 1–26's conventions.

- **Topic 70** builds a real toy partitioned log: several partitions, each a real, ordered, append-only vector of entries, and a real partitioning function routing each write by `hash(key) % N`. Measures, across many writes to the identical key, that every one of them lands in the identical partition in the identical relative order, and that changing `N` genuinely re-routes existing keys to a different partition, breaking the per-key order guarantee for any key whose own partition assignment changes.
- **Topic 71** builds directly on topic 70's own partitioned log: a real consumer that applies a side effect and then commits an offset as two separate real steps, with a real injected crash between them, and a real idempotency key (producer ID plus sequence number) a consumer can use to detect and skip a side effect it has already genuinely applied.
- **Topic 72** builds directly on topic 70's own partitioned log: a real time/size retention function that deletes entries past a real threshold regardless of key, and a real compaction function that keeps only the latest entry per key, with a real tombstone value causing a key to be genuinely removed once compaction passes it.

Every number and outcome must come from each topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024). This chapter needs no root access, no real network I/O, and no real multiple machines; "partitions," "consumers," "crashes," and "retention" are all real, deterministic, in-memory Rust values and functions, continuing this milestone's own pattern of measuring a real, small, fully-controlled model directly rather than a simulation taken on faith.

## A.4 Terms and notation (continuing Chapters 1–26's vocabulary)

Everything in Chapters 1–26 §A.4 still applies. This chapter adds:

- **Partition**: one of a topic's own ordered, append-only logs; ordering is a real property of a single partition, never of the topic as a whole.
- **Key-based partitioning**: routing a write to a partition by a real function of its own key (`hash(key) % N`), so that every write sharing a key lands in the identical partition, until `N` itself changes.
- **At-most-once / at-least-once / exactly-once**: real delivery semantics defined by exactly where publishing, consuming, and committing an offset can independently fail, not by anything the network itself does.
- **Idempotent producer / idempotency key**: a real producer ID plus a real, increasing sequence number, letting a broker or consumer detect and discard a genuine duplicate of a message it has already seen.
- **Retention**: deleting a log's own entries once they age past a real time or size threshold, regardless of their own key.
- **Compaction**: keeping only the latest entry for each distinct key forever, with a real tombstone entry causing that key to be genuinely removed once compaction runs past it.

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "one of a topic's own separate, ordered logs" for a partition; "routing a write by a real function of its own key" for key-based partitioning; "where exactly publishing, consuming, and committing can each fail on their own" for the three delivery semantics; "a real id a consumer can use to notice it already saw this" for an idempotency key; "entries deleted once they get old enough" for retention; "keeping only the newest value for each key, forever" for compaction.

## A.5 Visual language (continuing Chapters 1–24's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list. This chapter adds:

- **A partition-lane glyph**: several parallel horizontal lanes, each a single partition's own ordered entries, for showing real routing and real per-partition order directly.
- **A timeline-with-crash glyph**: a short horizontal strip of real steps with an explicit crash point marked between two of them, for showing a real injected failure directly.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–26 §A.6: executed `examples.py` compiling real `rustc --edition 2024` sources, self-contained topic, sources fetched and quoted via `scripts/sources.mjs`, registry fields with `milestone: { number: 5, title: 'Distributed Systems and Streaming' }` and `chapter: { number: 27, title: 'Kafka-Style Logs, Partitions, and Delivery Semantics', section: '27.1' }`. A cargo crate under `examples/` is used; no root access, real network I/O, or real multiple machines are needed, since "partitions," "consumers," and "crashes" are real, deterministic, in-memory Rust values and functions rather than an actual distributed deployment, continuing this domain's own established pattern of measuring a real, small, fully-controlled model directly.

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–26's own declared list. Chapter 26's own *introduced* ids this chapter draws on directly: none of Chapter 26's own ids are reused mechanically here, since this chapter changes subject from a single replicated log's own consensus to a partitioned, product-facing log's own ordering and delivery guarantees; topic 70's own bridge instead names Chapter 26's own closing handoff in prose, as the real problem this chapter answers.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `key-partitioning-order-tradeoff` | 70 | Key-based partitioning genuinely preserves a given key's own write order only as long as that key keeps mapping to the identical partition; changing the partition count genuinely breaks this guarantee for any key whose own partition assignment changes. |
| `idempotent-consumer-removes-duplicate-effect` | 71 | An at-least-once consumer genuinely produces a real, measurable duplicate when it crashes between a side effect and its own offset commit; a real idempotency key lets a consumer genuinely remove that duplicate's own visible effect without removing the redelivery itself. |
| `compaction-keeps-latest-value-per-key` | 72 | Compaction genuinely differs from time/size retention by keeping the latest entry for each distinct key forever rather than deleting by age, and a real tombstone value genuinely removes a key once compaction runs past it. |

## A.8 Bridges and handoffs

- **70** bridges from Chapter 26's own real handoff (this chapter's own first sentence names it directly: what a log built on exactly this kind of replicated, ordered structure looks like once it is a real product-facing abstraction, with its own partitions, delivery guarantees, and retention rules) and needs no earlier chapter's own introduced concept directly, since it changes subject to a partitioned, product-facing log. Hands off within the chapter to topic 71: "Per-key ordering decides what a single partition promises about the order writes land in; it says nothing yet about what a consumer that crashes mid-way through handling one of those writes is allowed to do about it."
- **71** bridges from topic 70's own partitioned log directly and hands off within the chapter to topic 72: "An idempotent consumer decides what happens when the identical write is genuinely delivered twice; it says nothing yet about how long any write, duplicated or not, is even still there to be read at all."
- **72** bridges from topic 70's own partitioned log directly and hands off to the next chapter: "This chapter measured what a partitioned, product-facing log promises about order, delivery, and how long its own data sticks around; the next chapter turns to state that does not need any of this chapter's own coordination at all, because it is built to merge safely no matter which order its own updates arrive in."

## A.9 Primary sources to start from (this topic must re-fetch and verify)

- The Apache Kafka project's own documentation on partitions, key-based partitioning, and segment files, for topic 70's own concrete reference, if fetchable; Confluent's own mirrored documentation (already used successfully in Chapter 25) is an acceptable concrete substitute where Kafka's own apache.org docs are not fetchable (a known, confirmed issue: those pages are a pure client-side-rendered SPA).
- The Apache Kafka project's own documentation (or Confluent's own mirror) on the idempotent producer, transactions, and delivery semantics, for topic 71's own concrete reference, if fetchable.
- The Apache Kafka project's own documentation (or Confluent's own mirror) on log compaction, tombstones, and retention, for topic 72's own concrete reference, if fetchable.
- The `rdkafka` Rust crate's own documentation, for a concrete, real Rust-ecosystem reference on wrapping these semantics, if fetchable.
