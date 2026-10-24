---
title: "Undefined behavior: validity, provenance, aliasing"
---

## Outcomes

- Build a real validity-invariant checker (a predicate over every one of a `bool`'s 256 possible byte values) and measure that it genuinely accepts only the 2 bit patterns Rust's own validity rule allows, without ever constructing an invalid `bool` to find out.
- Build a real non-null-and-alignment check for a 4-aligned type and measure that it genuinely accepts exactly the candidate addresses Rust's own reference-validity rule would allow, without ever building a reference from an address that fails it.
- Build a real strict-provenance round trip through `addr()`/`with_addr()` on a real array's own base pointer and measure that it genuinely recovers the exact correct value, staying inside the allocation its provenance was derived from.
- State, from the Rust Reference's own "Behavior considered undefined" page, the standard library's own `MaybeUninit` docs, and `std::ptr`'s own docs, the real rules this topic's own code measures directly.

## Internals

The Reference's own undefined-behavior list covers far more than the two categories this topic measures directly: dangling or misaligned memory access, data races, calling a function through an incompatible type, and reaching code marked `unreachable_unchecked` are all on it too, each its own real rule rather than a single blanket "anything unsafe is UB." `MaybeUninit<T>`'s own documentation states the initialization half of validity directly: zero-initializing a variable of reference type is immediate undefined behavior the instant it exists, even if the reference is never used to access memory, because the compiler is entitled to assume every produced value is already valid everywhere, not just at the point it is read. Forming a raw pointer to a struct's own field with `&raw const` / `&raw mut` (stable since Rust 1.82) sidesteps this entirely for that one step: it builds the pointer without ever creating an intermediate reference, so no reference-validity check applies to a step that was never going to produce a reference in the first place. Aliasing has its own, separate model: Stacked Borrows, and its 2025 successor Tree Borrows, are the formal rules Miri actually checks a program against to decide whether two pointers' real access rights ever conflict; both are too intricate to safely hand-simulate here, and topic 79 covers directly what a checker built on a model like this can and cannot catch.

## In production

`static mut` references are denied by default starting in Rust 2024 (the `static_mut_refs` lint, promoted to deny-by-default), not because taking a reference to mutable static state suddenly became a new rule, but because the old, allowed spelling made it too easy to hold two mutable references to the identical memory at once without any guard checking for it, the identical aliasing violation Stacked Borrows and Tree Borrows exist to catch. The fix in practice is almost always a `Mutex`, an `OnceLock`, or an explicit `unsafe` block with its own written justification for why, in that one specific case, no second reference can exist at the same time; the lint does not forbid mutable static state, it forbids reaching it through a path the compiler cannot see is exclusive.

## The frontier

This topic's own checks are deliberately narrow and deliberately safe: a validity predicate run over every possible byte of one small type, an address check run over a fixed list, and one real pointer round trip that never leaves its own allocation. The much larger question of how a tool actually finds a violation it was never told to look for, and what such a tool's own real limits are, is this chapter's own next and final topic.

## Where this goes next

Knowing which bit patterns and which pointers are genuinely valid decides what a violation even is; it says nothing yet about how anyone would actually catch one happening, short of reading every line by hand.
