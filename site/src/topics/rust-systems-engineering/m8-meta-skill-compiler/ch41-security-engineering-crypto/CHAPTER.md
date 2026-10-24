# Chapter 41 — Security Engineering: Crypto APIs, Parsers, Secrets, and Supply Chain (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 8, *Meta-Skill, Compiler, Embedded, GPU, Security, and Testing*. Chapter 41 has one section: 41.1 *Threat surfaces* (two full topics: parsers as security boundaries, and supply-chain trust and provenance; two of its own four topics are skipped: "Using cryptography without implementing it" and "Secrets in memory and telemetry," both marked `*(skipped)*`, plus the chapter's own lab, which is not a reel). Planned 2026-10-24, in one `/make-topic` session. Chapters 38, 39, and 40 (compiler internals, bare-metal/kernel Rust, and GPU/heterogeneous systems) are each entirely skipped in this curriculum, so this chapter bridges directly from Chapter 37's own last real lesson, evidence discipline, rather than from any of the three.

This file is the contract the chapter's two topics build to. Do not edit it once those topics are in progress; record any unavoidable departure under its own `OUTLINE.md` → "Changes from the chapter plan."

## A.1 The problem it solves

Memory safety removes one entire bug class; it removes none of the rest. A real parser that trusts a length field enough to do arithmetic on it before checking that length against anything is one real, specific way the rest of those bugs still happen, in perfectly safe Rust, on perfectly valid syntax. A real dependency tree that nobody ever actually checked against a real advisory database is another: the vulnerability isn't in the code this project wrote at all, it's in code this project's own build silently trusted.

By the end of this chapter's two topics, the learner can: build a real parser that validates a length before using it in arithmetic, bound its own real size and nesting, and measure the real, concrete difference between that parser and a naive one when both are driven by the same real, deliberately malformed input; and run a real, published advisory database against a real dependency tree, and measure that a real, known-vulnerable version is caught while a real, patched version is not.

## A.2 The order of ideas, and why

1. **Parsers as security boundaries** (topic 94, this chapter's first topic) — builds a real binary parser that checks a declared length against both the remaining real input and a real maximum before ever using that length in arithmetic or allocation, and measures a real, concrete difference against a naive parser that does the arithmetic first: fed the identical real, deliberately malformed inputs (a truncated length, an oversized length, a length that silently overflows), the naive parser's own arithmetic genuinely panics or produces a wrong result, while the checked parser genuinely rejects the same real bytes cleanly.
2. **Supply-chain trust and provenance** (topic 95) — runs a real advisory lookup against two real, pinned dependency trees, one holding a real crate version with a real, published RustSec advisory against it and one holding the patched version one release later, and measures that the real lookup catches exactly the vulnerable one and clears the patched one.

*(The chapter's own lab — fuzzing a binary parser with a max nesting/size policy, running a dependency audit, and writing a short threat model — is not a reel; it stays in the syllabus as a lab exercise, exercising this chapter's own two full topics together rather than introducing a new tested claim of its own.)*

## A.3 The running example: a parser that checks its own lengths, and a dependency tree that is actually looked up

Self-contained (no cross-chapter imports except where a topic explicitly measures a prior chapter's own construction as its baseline), continuing Chapters 1–37's conventions. Each topic's own `examples/` folder holds its own independent crate.

- **Topic 94** builds a tiny, real binary record format (a one-byte tag, a four-byte little-endian length, then that many bytes of payload) and two real parsers for it: a naive one that reads the length and immediately does `payload_start + length` and slices with it, and a checked one that validates the length against both the real remaining buffer length and a real, stated maximum before ever touching it, using `checked_add` rather than raw arithmetic. Both are driven by the identical real set of deliberately malformed inputs (a length claiming more bytes than the buffer actually holds; a length large enough to overflow a 32-bit addition on a real build where overflow checks are off); it measures that the naive parser's own arithmetic either panics or returns a wrong, out-of-bounds result on at least one of them, while the checked parser rejects every one of them cleanly, with no panic, and still returns the real, correct bytes on well-formed input.
- **Topic 95** builds two real, minimal workspaces, each with a single real third-party dependency pinned by its own exact version in a real `Cargo.lock`: one pinned to a dependency version against which a real RustSec advisory exists, and one pinned to the very next version, which the real advisory names as fixed. A real `cargo audit` run against each is the real measurement: it measures that the lookup reports the real advisory for the vulnerable tree and reports a clean result for the patched one, from the identical real, published database, not from a hand-maintained list this topic wrote itself.

Every number and outcome must come from each topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024, cargo, and crates.io available). This chapter needs no root access beyond ordinary package installation; topic 95 additionally needs `cargo-audit` installed from crates.io (`cargo install cargo-audit --locked`) and real, local network access to fetch the RustSec advisory database, continuing this domain's own established pattern of measuring a real, concrete difference in real, running tools rather than a simulation taken on faith.

## A.4 Terms and notation (continuing Chapters 1–37's vocabulary)

Everything in Chapters 1–37 §A.4 still applies. This chapter adds:

- **Security boundary**: a real, specific point where untrusted input is checked against a real limit before it is trusted enough to drive arithmetic, allocation, or control flow.
- **Checked arithmetic**: a real operation (`checked_add`, `checked_mul`, and their saturating equivalents) that reports its own real overflow instead of silently wrapping or, in a debug build only, panicking.
- **Advisory database**: a real, published, continuously updated record (RustSec) of which real dependency versions have known, disclosed vulnerabilities, looked up by a real tool against a real dependency tree rather than checked by hand.

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "a length nobody checked before trusting it" for an unchecked boundary; "asking a published list instead of trusting a guess" for an advisory lookup.

## A.5 Visual language (continuing Chapters 1–24's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list. This chapter adds:

- **A boundary glyph**: a real, simple line with a visible checkpoint mark on it, showing where a real length or version is actually checked against a real limit before being trusted further.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–37 §A.6, with this chapter's own explicit addition: topic 94's own `examples.py` drives a real `cargo run` of a real, small parsing crate under `examples/`, with every measured claim coming from the real parser's own printed, real result on real byte input, never from a claim merely asserted in prose. Topic 95's own `examples.py` drives a real `cargo audit` subprocess against two real, minimal workspaces under `examples/`, with every measured claim coming from that real tool's own real, printed JSON output against the real, live RustSec database, never from a hand-maintained advisory list this topic wrote itself. Registry fields use `milestone: { number: 8, title: 'Meta-Skill, Compiler, Embedded, GPU, Security, and Testing' }` and `chapter: { number: 41, title: 'Security Engineering: Crypto APIs, Parsers, Secrets, and Supply Chain', section: '41.1' }` (this chapter's own two full topics are both in section 41.1).

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–37's own declared list. Neither of this chapter's own two topics reuses a prior chapter's own introduced id directly in its own measured code; both bridge from Chapter 37's own evidence-discipline handoff in prose instead, since this chapter's own subject (threat surfaces) is genuinely new rather than a continuation of a prior chapter's own running system.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `an-unchecked-length-is-a-real-security-boundary` | 94 | A length read from untrusted input that drives arithmetic or allocation before being checked against a real limit is a real boundary whether or not anyone decided to treat it as one; checking it first is what makes the difference measurable rather than theoretical. |
| `an-advisory-lookup-finds-what-a-guess-cannot` | 95 | Whether a real dependency version is actually vulnerable is a real, published, continuously updated fact, not something a project can determine by guessing or by how recently it was last updated; a real lookup against the real database is what actually answers it. |

## A.8 Bridges and handoffs

- **94** bridges from Chapter 37's own real handoff (naming directly that a real method for finding an implicit decision and a real method for checking an optimization's own result are both real, repeatable habits, and that this milestone now turns to what the compiler does with the code those habits produce, skipping three entirely-skipped chapters on compiler internals, embedded and kernel Rust, and GPU systems to land on security instead). Hands off within the chapter to topic 95: "A boundary that checks a real length before trusting it catches a real, adversarial input at the exact moment it arrives; the next real question is whether the code trusted to run at all, the dependencies nobody wrote by hand, is actually trustworthy in the first place."
- **95** bridges from topic 94's own measured comparison directly and hands off to whatever this milestone's own next chapter begins with: "A real boundary inside a project's own code, and a real, published record of which outside code is actually trustworthy, are both real, concrete answers to the same underlying question, whether trust is actually checked or merely assumed; the next real question this milestone asks is how to actually test a system that only fails under a real, specific interleaving or a real, specific kind of crash."

## A.9 Primary sources to start from (this topic must re-fetch and verify)

- The Rust standard library's own documentation for `checked_add` (or `checked_mul`) on a primitive integer type (`doc.rust-lang.org/std`), for topic 94's own concrete reference on checked arithmetic's own real behaviour on overflow.
- The RustSec Advisory Database's own documentation or front page (`rustsec.org`), for topic 95's own concrete reference on what the database is and what `cargo audit` checks against it.
