# Chapter 25 — Replication, Quorums, and Failure Semantics (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 5, *Distributed Systems and Streaming* (its first chapter). Chapter 25 has one section, 25.1 *Replication semantics*, with two full topics and one skipped one (`syllabus/review-notes/rust-cuts.md`, owner decision of 13 October 2026): "Quorum intersection is not enough" stays in the curriculum for reference but gets no reel. The chapter's own lab exercise (a three-node replicated register, injecting delayed acks and leader failure, checking the recorded history for linearizability) is not a reel either. Planned 2026-10-24, in one `/make-topic` session. Previous chapter: Chapter 24, *Columnar Storage, Vectors, and Compression* (four topics live: columnar layout and the Arrow format, lightweight encodings and cascading compression, vectorized versus compiled query execution, and SIMD in Rust), which closed Milestone 4 (Storage-Engine Internals) entirely by naming this milestone's own first question directly: what happens once a single machine's own data is replicated across several machines that can fail independently, and what an acknowledgement from one of them is actually allowed to promise.

This file is the contract the chapter's two topics build to. Do not edit it once those topics are in progress; record any unavoidable departure under its own `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Milestone 4 measured what a single machine owes a concurrent reader and what its own layout and execution choices cost; this chapter opens Milestone 5 by asking what a *group* of machines owes a caller once any one of them can fail independently. The real question this chapter answers is: once a write is "acknowledged," what does that acknowledgement actually promise about where the data now lives, and under which failures can that promise still be kept? Durability and availability trade directly against each other through the choice of *which* point in a replication pipeline counts as "acknowledged": accepted by a single node, accepted by a subset, persisted by a quorum, or durably recorded by the elected leader. Kafka's own `acks`, ISR (in-sync replica set), and `min.insync.replicas` settings, and the Raft paper's own commitment rule, are this chapter's concrete references for what a real acknowledgement point actually looks like, measured directly rather than taken on faith. The second half of this chapter turns from defining the promise to proving it: once several real, independent failures (process death, partition, delayed or duplicated messages) are injected into a replicated system together, not one at a time, does the system's own recorded history of reads and writes still satisfy a precise correctness property (linearizability), checked mechanically rather than argued informally.

By the end of this chapter's two topics, the learner can: build a real toy replicated log with several distinct acknowledgement policies and measure, under an injected node failure, which policies genuinely lose data and which genuinely do not; and build a real linearizability checker over a recorded history of reads and writes from a replicated register under injected failures, and use it to tell a correct history from one that only looks correct.

## A.2 The order of ideas, and why

1. **Acknowledgement points define durability** (topic 66, this chapter's first topic) — builds the foundation every later topic in this milestone measures against: a real toy leader-plus-replicas log with several distinct acknowledgement policies (accepted by the leader alone, accepted by a quorum, persisted by a quorum). Measures that, under an injected node failure immediately after acknowledgement, some policies genuinely lose the acknowledged write and some genuinely do not.
2. **Failure injection and linearizability checking** (topic 67) — builds directly on topic 66's own replicated log: injects several real, independent failures together (delayed acknowledgement, a leader failing after accepting but before a quorum persists) into a small replicated register, records the resulting history of reads and writes, and runs a real linearizability checker over that history, measuring that it correctly distinguishes a linearizable history from one that is not.

*(The chapter's lab — a three-node replicated register, injecting delayed acks and leader failure, recording which reads are permitted at each point, and checking the history for linearizability — is not a reel; it stays in the syllabus as a lab exercise, exercising both of this chapter's topics together, rather than introducing a new tested claim of its own. "Quorum intersection is not enough," marked `*(skipped)*` in the syllabus per the 13 October 2026 owner decision, is not a reel either; its own further material, sloppy quorums and hinted handoff, is named in prose in topic 66's own post-notes rather than measured.)*

## A.3 The running example: one real toy replicated log, built and measured

Self-contained (no cross-chapter imports except where a topic explicitly measures a prior chapter's own construction as its baseline), continuing Chapters 1–24's conventions.

- **Topic 66** builds a real toy replicated log: one leader, several replicas, and a real function computing whether a given acknowledgement policy (leader-only, quorum-accepted, quorum-persisted) has actually been satisfied for a given write, given which nodes have genuinely accepted or persisted it so far. Measures, under an injected node failure immediately after each policy's own acknowledgement point, whether the acknowledged write is still genuinely recoverable from the surviving nodes.
- **Topic 67** builds directly on topic 66's own replicated log: injects several real, independent failures together into a small replicated register (a leader failing after accepting but before a quorum persists; a delayed acknowledgement arriving out of order), records the resulting real history of reads and writes, and builds a real linearizability checker that walks that history and determines whether it is consistent with some real total order of operations each respecting real-time precedence.

Every number and outcome must come from each topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024). This chapter needs no root access, no real network I/O, and no real multiple machines; "nodes," "failures," and "partitions" are all real, deterministic, in-memory Rust values and functions, continuing this milestone's own pattern of measuring a real, small, fully-controlled model directly rather than a simulation taken on faith.

## A.4 Terms and notation (continuing Chapters 1–24's vocabulary)

Everything in Chapters 1–24 §A.4 still applies. This chapter adds:

- **Acknowledgement point**: the specific point in a replication pipeline (accepted by one node, accepted by a subset, persisted by a quorum, recorded by the leader) that a system treats as meaning a write is "done."
- **Quorum**: a subset of nodes large enough that any two quorums are guaranteed to overlap by at least one node, the real property making a quorum-based read or write safe against a single partition.
- **In-sync replica set (ISR)**: the subset of a log's own replicas that are caught up closely enough with the leader to be eligible to take over durably, the real set Kafka's own `min.insync.replicas` setting counts against.
- **Linearizability**: a correctness property for a history of concurrent operations, stating that the history is consistent with some real total order of those operations that also respects each operation's own real-time precedence (an operation that finishes before another begins must come first in that order).
- **Failure injection**: deliberately introducing a real fault (a node failing, a message arriving late or duplicated, a partition) into a system under test, rather than waiting for one to occur naturally.

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "the point a system actually calls a write done" for an acknowledgement point; "a group of nodes big enough that two of them always overlap" for a quorum; "the replicas caught up enough to safely take over" for an in-sync replica set; "a history that could have happened in some real, honest order" for linearizability; "breaking something on purpose, instead of waiting for it to break" for failure injection.

## A.5 Visual language (continuing Chapters 1–24's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list. This chapter adds:

- **A node-and-arrow glyph**: a small set of labeled nodes (leader, replicas) with arrows showing which nodes have accepted or persisted a given write, for showing an acknowledgement policy's own real state directly.
- **A timeline glyph**: a short horizontal strip of events (a write starts, a write finishes, a read starts, a read finishes) for showing a recorded history directly, the structure a linearizability checker works over.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–24 §A.6: executed `examples.py` compiling real `rustc --edition 2024` sources, self-contained topic, sources fetched and quoted via `scripts/sources.mjs`, registry fields with `milestone: { number: 5, title: 'Distributed Systems and Streaming' }` and `chapter: { number: 25, title: 'Replication, Quorums, and Failure Semantics', section: '25.1' }`. A cargo crate under `examples/` is used; no root access, real network I/O, or real multiple machines are needed, since "nodes" and "failures" are real, deterministic, in-memory Rust values and functions rather than an actual distributed deployment, continuing this domain's own established pattern of measuring a real, small, fully-controlled model directly.

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–24's own declared list. Chapters 1–24's own *introduced* ids this chapter draws on directly: none of Chapter 24's own ids are reused mechanically here, since this chapter changes subject from single-machine physical layout and execution to multi-node replication and failure; topic 66's own bridge instead names Chapter 24's closing handoff in prose, as the real problem this chapter answers. Each topic lists in `uses` only the ones it actually relies on.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `acknowledgement-point-durability-tradeoff` | 66 | Which point in a replication pipeline counts as "acknowledged" genuinely decides whether a write survives a given node failure; a leader-only or subset-accepted acknowledgement can genuinely lose a write that a quorum-persisted one would not, on the identical failure. |
| `linearizability-checking-over-injected-failure` | 67 | A recorded history of concurrent reads and writes, gathered while several real, independent failures are injected together, can be mechanically checked against the real definition of linearizability, rather than judged by inspection or intuition. |

## A.8 Bridges and handoffs

- **66** bridges from Chapter 24's own real handoff (this chapter's own first sentence names it directly: what a group of machines owes a caller once any one of them can fail independently, and what an acknowledgement from one of them is actually allowed to promise) and needs no earlier chapter's own introduced concept directly, since it changes subject to multi-node replication. Hands off within the chapter to topic 67: "Choosing an acknowledgement point decides what a single write survives; it says nothing yet about whether an entire recorded history of many concurrent reads and writes, gathered while real failures are happening, is even consistent with any honest order at all."
- **67** bridges from topic 66's own replicated log directly and hands off to the next chapter: "This chapter measured what one acknowledgement is allowed to promise, and how to check a whole recorded history against that promise under real injected failure; the next chapter turns to how a cluster of nodes, with no leader assumed in advance, actually agrees on which one gets to make that promise at all, and proves it stays correct."

## A.9 Primary sources to start from (this topic must re-fetch and verify)

- The Apache Kafka project's own documentation on `acks`, the in-sync replica set, and `min.insync.replicas`, for topic 66's own concrete reference, if fetchable.
- The Raft paper itself (Ongaro & Ousterhout, "In Search of an Understandable Consensus Algorithm") or its own extended technical report, for topic 66's own commitment-rule reference, if fetchable; the Raft website's own documentation summary is an acceptable concrete substitute where the paper itself is not fetchable.
- Documentation or a paper excerpt on linearizability itself (Herlihy & Wing's own original definition, or a widely used summary such as Kyle Kingsbury's Jepsen writings) for topic 67's own concrete reference, if fetchable.
- Jepsen's own documentation or blog writing on failure injection methodology (killing processes, partitioning, delaying and duplicating messages together) and on checking a recorded history against a consistency model, for topic 67's own concrete reference, if fetchable.
