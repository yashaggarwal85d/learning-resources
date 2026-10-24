# Chapter 28 — CRDTs, Idempotency, and Convergent State (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 5, *Distributed Systems and Streaming* (its fourth and last chapter). Chapter 28 has one section, 28.1 *Convergence*, with one full topic and two skipped ones, already recorded in `syllabus/review-notes/rust-cuts.md` under "Chapter 28 — CRDTs, Idempotency, and Convergent State (2 of 3)". The chapter's own lab exercise (modeling a replicated shopping-cart quantity as a CRDT against a unique reservation needing consensus) is not a reel either. Planned 2026-10-24, in one `/make-topic` session. Previous chapter: Chapter 27, *Kafka-Style Logs, Partitions, and Delivery Semantics* (three topics live: per-key ordering, idempotent consumers, retention and compaction), which closed by naming this chapter's own first question directly: state that does not need Chapter 27's own coordination at all, because it is built to merge safely no matter which order its own updates arrive in.

This file is the contract the chapter's one full topic builds to. Do not edit it once that topic is in progress; record any unavoidable departure under its own `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Chapter 27 measured exactly-once at the log layer: an idempotency key let a *consumer* detect and skip a side effect it had already applied, because the broker gave it a real producer id and sequence number to check against. A plain HTTP or RPC API has no broker and no log underneath it, so the identical safe-retry problem shows up again at the API layer in a harder shape: a client that cannot tell whether its last request actually reached the server (the response was lost, the connection dropped) has nothing but its own idempotency key to prove, on retry, that this is the same logical request rather than a new one. The syllabus's own two skipped topics name the chapter's wider frontier without measuring it here: a CRDT's own merge needs to be commutative, associative, and idempotent to converge safely with no coordination at all (state-based, op-based, or delta-state), and CALM names exactly when that is even possible, monotonic programs needing no coordination while a business rule like a unique reservation or a non-negative balance needs a real coordination protocol instead. This chapter's own full topic measures the practical, narrower cousin of all of this: a server-side idempotency-key store with a real scope and a real TTL, which replays a stored response verbatim for a genuine duplicate, and which must not let two genuinely concurrent retries carrying the identical key race each other into running the real side effect twice.

By the end of this chapter's one topic, the learner can: build a real toy idempotency-key store and measure that a key's own scope keeps two otherwise-identical keys from colliding across different endpoints or resources; measure that a duplicate request within a key's own TTL genuinely replays the exact stored response without running the real side effect again; and measure that a genuine race, two concurrent requests carrying the identical key before the first one finishes, is genuinely caught, so the real side effect still runs exactly once.

## A.2 The order of ideas, and why

1. **CRDT merge semantics: state, op, delta** *(skipped)* — stays in the syllabus; `syllabus/review-notes/rust-cuts.md` already records it.
2. **Coordination avoidance: CALM and invariants** *(skipped)* — stays in the syllabus; `syllabus/review-notes/rust-cuts.md` already records it.
3. **Idempotency keys for distributed APIs** (topic 73, this chapter's only full topic) — builds a real toy idempotency-key store (key scope, TTL, a stored response to replay, and a real race between two concurrent retries carrying the identical key), continuing the identical idempotency-key idea Chapter 27 measured at the consumer layer, now measured at the API layer instead.

*(The chapter's own lab — modeling a replicated shopping-cart quantity as a CRDT against a unique reservation needing consensus — is not a reel; it stays in the syllabus as a lab exercise, exercising the chapter's own two skipped topics rather than introducing a new tested claim of its own.)*

## A.3 The running example: one real toy idempotency-key store, built and measured

Self-contained (no cross-chapter imports except where the topic explicitly measures a prior chapter's own construction as its baseline), continuing Chapters 1–27's conventions.

- **Topic 73** builds a real toy idempotency-key store: a real map keyed by a real `(scope, key)` pair, each entry holding either `InProgress` (a real side effect is currently running under this key) or `Completed(response)` (the real side effect already ran, and this is its own real, stored result), plus a real TTL after which an entry is genuinely evicted and the key becomes available again. A real request handler checks the store before running any side effect: an absent or expired key runs the real side effect and stores its result; a `Completed` key replays the real, stored response byte for byte, with no second run of the side effect; an `InProgress` key, found by a second, genuinely concurrent retry that arrived before the first one finished, is genuinely rejected or made to wait, rather than being allowed to race the first one into running the real side effect twice.

Every number and outcome must come from the topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0 stable, edition 2024). This chapter needs no root access, no real network I/O, and no real multiple machines; "requests," "retries," and "the race" are all real, deterministic, in-memory Rust values and functions, continuing this milestone's own pattern of measuring a real, small, fully-controlled model directly rather than a simulation taken on faith.

## A.4 Terms and notation (continuing Chapters 1–27's vocabulary)

Everything in Chapters 1–27 §A.4 still applies. This chapter adds:

- **Idempotency key**: a real, client-supplied identifier for one logical request, letting a server detect a genuine retry of the identical request rather than a new one.
- **Key scope**: the real part of an idempotency key's own identity beyond the key string itself (which endpoint, which resource) that keeps two otherwise-identical key strings from colliding across unrelated requests.
- **TTL (time to live)**: the real window during which a stored idempotency-key entry is honored; once it expires, the key is genuinely available again, and a new request under that key runs the real side effect anew.
- **The race**: the real hazard this topic's own code measures directly — two genuinely concurrent requests carrying the identical key, arriving before the first one's own side effect has finished and been stored, which must not be allowed to both run that side effect.

Narration words (continuing the convention: no digits, symbols, or code-style names spoken): "a real id the client sends to prove this is the same request" for an idempotency key; "which endpoint or resource the key belongs to" for key scope; "how long the stored answer is still honored" for TTL; "two retries arriving before the first one even finished" for the race.

## A.5 Visual language (continuing Chapters 1–24's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same vertical-stack convention for any multi-item list. This chapter adds:

- **A key-store glyph**: a small table of real `(scope, key)` entries, each marked in progress, completed, or expired, for showing real store state directly.
- **A race-timeline glyph**: two parallel short horizontal strips of real steps, arriving close together, for showing a real concurrent race directly.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–27 §A.6: executed `examples.py` compiling real `rustc --edition 2024` sources, self-contained topic, sources fetched and quoted via `scripts/sources.mjs`, registry fields with `milestone: { number: 5, title: 'Distributed Systems and Streaming' }` and `chapter: { number: 28, title: 'CRDTs, Idempotency, and Convergent State', section: '28.1' }`. A cargo crate under `examples/` is used; no root access, real network I/O, or real multiple machines are needed, since "requests," "retries," and "the race" are real, deterministic, in-memory Rust values and functions rather than an actual distributed deployment, continuing this domain's own established pattern of measuring a real, small, fully-controlled model directly.

## A.7 The chapter's concept ledger

**Declared**: unchanged from Chapters 1–27's own declared list. Chapter 27's own *introduced* id this chapter draws on directly: `idempotent-consumer-removes-duplicate-effect` (topic 71), since this chapter's own full topic measures the identical idempotency-key idea at the API layer instead of the consumer layer.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `idempotency-key-scope-ttl-and-replay` | 73 | A real idempotency-key store, scoped per endpoint or resource and bounded by a real TTL, genuinely replays a stored response for a duplicate request without re-running its own side effect, and genuinely catches a real race between two concurrent retries carrying the identical key before either one has let the side effect run twice. |

## A.8 Bridges and handoffs

- **73** bridges from Chapter 27's own real handoff (this chapter's own first sentence names it directly: Chapter 27 measured exactly-once at the log layer; this chapter's own full topic measures the practical, narrower cousin of that same idea at the API layer, with no broker or log underneath it) and needs Chapter 27's own introduced concept directly (`idempotent-consumer-removes-duplicate-effect`), since it reuses the identical idempotency-key idea at a different layer. Hands off to the next milestone: "This chapter measured how a single idempotency key keeps one logical request safe to retry; the next milestone turns to the engineering disciplines that make a whole Rust system fast, sound, embeddable, releasable, and diagnosable, starting with measuring performance itself before explaining it."

## A.9 Primary sources to start from (this topic must re-fetch and verify)

- Stripe's own public documentation on idempotency keys for its API, a real, widely used production reference for key scope, TTL, and replaying a stored response, if fetchable.
- The IETF's own "The Idempotency-Key HTTP Header Field" draft or RFC, a real, vendor-neutral specification of the identical mechanism, if fetchable.
- A real, widely used Rust web framework's or crate's own documentation on idempotency middleware, for a concrete Rust-ecosystem reference, if fetchable.
