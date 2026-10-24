# Chapter 42 — Testing Concurrent and Failure-Prone Rust Systems (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 8, *Meta-Skill, Compiler, Embedded, GPU, Security, and Testing* (its last chapter before the milestone's own capstone). Chapter 42 has one section: 42.1 *Test techniques* (one full topic: property-based and model-based testing; three of its own four topics are skipped: "Exhaustive interleavings with loom," "Deterministic simulation testing," and "Fuzz findings to permanent regressions," each marked `*(skipped)*`, plus the chapter's own lab, which is not a reel). Planned 2026-10-24, in one `/make-topic` session. This chapter bridges directly from Chapter 41's own last real lesson, supply-chain trust.

This file is the contract the chapter's one topic builds to. Do not edit it once that topic is in progress; record any unavoidable departure under its own `OUTLINE.md` → "Changes from the chapter plan."

## A.1 The problem it solves

A hand-written test checks the one case its author thought to write down. A real bug living in the gap between "every case I thought of" and "every case that's actually possible" survives exactly as long as nobody happens to think of the case that triggers it. Two real, different techniques close that gap from two different directions: a property-based test generates a large, real, random space of inputs and checks a real, general invariant against every one of them, automatically shrinking any real failure down to the smallest input that still reproduces it; a stateful, model-based test compares a real, complex implementation against a real, deliberately simple reference model across a real, random sequence of operations, catching any real disagreement between the two, however the two happen to diverge.

By the end of this chapter's one topic, the learner can: write a real property test that catches a real, planted bug in an implementation that an example-based test would have missed, and watch it shrink the real failure down to its own minimal, reproducible case; and write a real, stateful, model-based test that compares a real implementation against a real, independent reference model across a real, random sequence of operations, and measure that the two agree.

## A.2 The order of ideas, and why

1. **Property-based and model-based testing** (topic 96, this chapter's only topic) — builds a tiny, real, fixed-capacity slot allocator (standing in for the syllabus's own named storage-page invariants: slots stay in bounds, no two slots' own real ranges overlap) in two real versions, one with a real, planted off-by-one bug and one without; a real property test, run with `proptest`, measures that the buggy version genuinely fails and shrinks to a real, minimal failing case, while the correct version genuinely passes across a real, large number of randomly generated cases. The identical topic then measures a real, stateful, model-based comparison between the correct allocator and a real, deliberately simpler reference model, across a real, random sequence of operations, confirming the two agree every time.

*(The chapter's own lab — adding property tests, fuzzed record bytes, and crash points to a real WAL/page engine, plus one real deterministic concurrency model for an in-memory index — is not a reel; it stays in the syllabus as a lab exercise, applying this chapter's own one topic to a larger, real system rather than introducing a new tested claim of its own.)*

## A.3 The running example: a slot allocator, tested two different ways

Self-contained (no cross-chapter imports). This topic's own `examples/` folder holds its own independent crate, with `proptest` added as a real dependency.

- **Topic 96** builds `SlotPage`, a tiny, real, fixed-capacity allocator (standing in for the syllabus's own storage-page invariants) with two real insert methods: `naive_insert`, which checks only that an inserted slot's own length fits the page's own real capacity (a real, planted off-by-one: it never checks the slot's own real starting offset), and `checked_insert`, which checks that the slot's own real end offset, start plus length, fits the real capacity. A real property test, driven by `proptest`'s own `TestRunner`, generates a real, random sequence of insert lengths and checks, after every one, that no slot's own real range ever runs past the page's own real capacity; it measures that `naive_insert` genuinely fails this real check and that `proptest` genuinely shrinks the failure to a real, minimal reproducing sequence, while `checked_insert` genuinely passes across a real, large number of random sequences. The identical topic then measures a real, stateful comparison: the identical `checked_insert` allocator, and a real, deliberately simpler reference model (a single running total of bytes used, with no real slot list at all), driven by the identical real, random sequence of operations, checking that the two agree on every real accept-or-reject decision.

Every number and outcome must come from this topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024, cargo, and crates.io available, including `proptest`). This chapter needs no root access beyond ordinary package installation and no real network I/O beyond a `cargo build`'s own dependency fetches, continuing this domain's own established pattern.

## A.4 Terms and notation (continuing Chapters 1–41's vocabulary)

Everything in Chapters 1–41 §A.4 still applies. This chapter adds:

- **Property-based test**: a real test that states a general, real invariant and checks it against a large, real, randomly generated space of inputs, rather than against one, hand-picked example.
- **Shrinking**: a real process by which a property-testing tool, having found a real failing input, searches for a real, smaller input that still fails the identical check, so the real counterexample reported is as minimal as the tool can make it.
- **Model-based test**: a real test that compares a real, complex implementation against a real, deliberately simpler reference model across a real sequence of operations, checking that the two agree at every real step.

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "trying a great many real cases instead of one" for property-based testing; "shrinking the failure down to its smallest real cause" for shrinking; "a simple stand-in, checked against the real thing" for a model-based test.

## A.5 Visual language (continuing Chapters 1–24's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list. This chapter adds:

- **A shrinking glyph**: a real, simple sequence of shrinking marks, each one smaller than the last, showing a real failing case being reduced to its own minimal form.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–41 §A.6, with this chapter's own explicit addition: this topic's own `examples.py` drives a real `cargo run` of a real, small crate under `examples/`, whose own `main()` runs a real `proptest::test_runner::TestRunner` programmatically (rather than through `cargo test`'s own harness), printing its own real, measured results as plain, real output; every measured claim comes from that real, executed run, never from a claim merely asserted in prose. Registry fields use `milestone: { number: 8, title: 'Meta-Skill, Compiler, Embedded, GPU, Security, and Testing' }` and `chapter: { number: 42, title: 'Testing Concurrent and Failure-Prone Rust Systems', section: '42.1' }`.

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–41's own declared list. This chapter's own one topic bridges from Chapter 41's own supply-chain handoff in prose, since this chapter's own subject (testing technique) is a new, general-purpose skill rather than a continuation of Chapter 41's own running examples.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `a-shrunk-counterexample-finds-what-one-example-cannot` | 96 | A property test's own real, random search across a large input space, and its own real shrinking of whatever it finds down to a minimal case, catches a real bug an example-based test, checking only the cases its author thought of, would never have been written to find. |

## A.8 Bridges and handoffs

- **96** bridges from Chapter 41's own real handoff (naming directly that a real boundary inside a project's own code and a real, published record of outside trust are both real, concrete answers to whether trust is checked or merely assumed, and that this milestone now turns to how to actually test a system that only fails under a real, specific interleaving or a real, specific kind of crash). Hands off to whatever this milestone's own next, and last, chapter begins with: "A real property test and a real, stateful, model-based comparison both catch what a hand-picked example cannot; the next real question this milestone asks is how all of this domain's own real techniques come together in one real system, built and judged end to end."

## A.9 Primary sources to start from (this topic must re-fetch and verify)

- The `proptest` crate's own documentation or README (`docs.rs/proptest` or its own GitHub repository), for this topic's own concrete reference on what property-based testing and shrinking actually are, in the tool's own words.
