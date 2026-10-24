# Outline — Undefined behavior: validity, provenance, aliasing

Concept ledger: introduces `validity-invariants-reject-illegal-bit-patterns`; uses `safety-contracts-bound-what-a-caller-can-trigger` (topic 77), per Chapter 30's own CHAPTER.md §A.7 — this topic goes one level deeper than "a guard enforces a contract" into "what, exactly, makes a value invalid in the first place."

Bridge/handoff (verbatim from CHAPTER.md §A.8): "A safe guard decides whether a caller is even allowed to reach the unsafe code; it says nothing yet about what, exactly, makes a value inside that unsafe code valid or invalid once a caller does reach it."

Chapter 30's own no-real-UB rule (§A.3/§A.6) applies throughout: no step ever constructs a genuinely invalid bool, a genuinely dangling/misaligned reference, or a pointer dereferenced outside its own provenance. Every claim is a real, safe, deterministic rule applied directly: a validity predicate run over every one of the 256 possible byte values, a non-null/alignment check run over a fixed list of candidate addresses, and a real `addr()`/`with_addr()` round trip that stays inside the allocation its provenance came from.

## Storyboard (8 steps, 3 predict/reveal pairs)

1. **BoolValidityPredict** — Of the 256 possible byte patterns a `bool`'s own one byte could hold, how many genuinely count as a valid `bool`? Options: all 256; only 2 (correct); only 1.
2. **BoolValidityReveal** — Measured: a real predicate (`byte == 0 || byte == 1`) run over every one of the 256 possible byte values finds exactly 2 that pass: `0` and `1`. No separate takeaway here (moved to step 7, the connecting step, below).
3. **AddrRoundTripPredict** — A pointer's address is read out with `addr()`, shifted to point at a different element of the same allocation, and rebuilt with `with_addr()`. Does the rebuilt pointer still carry the real right to read that allocation? Options: no, the round trip genuinely loses that right; yes, `with_addr` genuinely copies the original pointer's own provenance to the new address (correct); only if the address didn't change.
4. **AddrRoundTripReveal** — Measured: a real `Vec<i32>`'s base pointer, its address read with `addr()`, shifted by three elements, and rebuilt with `with_addr()`; dereferencing the rebuilt pointer genuinely recovers the exact correct element. Takeaway: `with_addr` keeps the real right to access memory explicit; a bare integer round trip never makes that promise.
5. **NullAlignPredict** — A reference to a 4-aligned type must genuinely be both non-null and a multiple of 4. Of a fixed list of 6 candidate addresses, how many genuinely pass both checks at once, without ever building a reference from them? Options: all 6; exactly 3 (correct); none, one check always fails.
6. **NullAlignReveal** — Measured: the identical real check (`addr != 0 && addr % 4 == 0`) run over `[0, 4, 6, 8, 11, 16]` finds exactly 3 that pass: `4`, `8`, `16`. Takeaway: the validity rule is checked directly on the address; nothing invalid needs to be built to measure it.
7. **DocsReveal** — The Rust Reference's own words, the standard library's own `MaybeUninit` docs, and `std::ptr`'s own docs all state the identical underlying rule directly: a value is either valid for its type or its production is immediate undefined behavior, and a pointer's provenance is the real right that makes dereferencing it sound. Does every one of this topic's own three measured checks apply exactly that rule? Takeaway (moved here from step 2, the "from" step for the phone swipe test, so step 2 stays its own simple two-row reveal): a type's own validity rule cuts far below what its raw bits could represent.
8. **Recap** — A validity rule, a provenance rule, both checked directly and safely, never by constructing the invalid case they describe.

## Engagement arc

- Predicts: steps 1, 3, 5 — each a genuine guess about a real, countable or checkable outcome.
- Takeaways: steps 4, 6, 7 (three — step 2 deliberately carries none, since it is the reel's own "from" step for the phone swipe test and stays a simple two-row reveal; its takeaway moves to step 7, the connecting "both sources say this" step; step 8's recap carries the closing statement instead of a fourth).
- Numbers throughout are exact and small (2 of 256, 3 of 6, one correct element), chosen so the predict options are genuine guesses rather than obvious.

## Deferred to post-notes (not measured in the reel itself, per the no-real-UB rule and the kit's real-measurement standard)

- The Reference's full UB list (dangling/misaligned access, data races, `unreachable_unchecked` misuse, etc.) beyond the two categories measured here — Internals.
- `&raw const` / `&raw mut` (stable 1.82) as the way to form a raw pointer to a field without ever creating an intermediate reference, so no intermediate validity check applies — Internals.
- Aliasing models: Stacked Borrows and its 2025 successor Tree Borrows, as the formal model Miri actually checks against (too complex to safely hand-simulate; topic 79 covers what a checker like this can and cannot catch) — The frontier.
- `static mut` references denied by default in Rust 2024 (a lint, not a new validity rule) — In production.
