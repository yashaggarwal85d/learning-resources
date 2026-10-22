---
id: rust.aliasing-xor-mutability
title: Aliasing XOR mutability
---

<section data-section="outcomes">

## After this topic you can

- State the aliasing rule precisely — many live `&T` or exactly one live `&mut T` to the same place, never both — and say in one sentence why it is the thing that makes `&mut` safe to hand to the optimizer as `noalias`.
- Read a reborrow (`bump(r); bump(r);`) and know why it doesn't move `r`, and read a two-phase borrow (`v.push(v.len())`) and know which phase, reservation or activation, a given line is in.
- Predict whether a snippet that *looks* like it violates the rule actually does, instead of waiting for `rustc` to tell you.

</section>

<section data-section="internals">

## Internals: noalias and LLVM

Everything here was run with rustc 1.97.0 (2d8144b78 2026-07-07) on x86_64 Linux, edition 2024, in `examples.py`. The syllabus baseline is 1.99; if you run this on a newer stable toolchain and the `noalias` attributes still appear as described, nothing here has gone stale.

The Rustonomicon's own working definition: variables and pointers alias "if they refer to overlapping regions of memory." Its `compute(input: &u32, output: &mut u32)` example writes `*output` up to twice; a compiler that could assume `input` and `output` never overlap could cache `*input` once and write `*output` once, landing on 2 whenever `*input > 10`. If they *did* overlap (`compute(&x, &mut x)`), the first write would also change `*input`, so the real function would stop at 1 instead — the shrunk version would be wrong. Rust rejects `compute(&x, &mut x)` with `E0502`, which is exactly what makes the shrunk version always safe to use. The Nomicon lists what alias analysis in general buys an optimizer: caching a read in a register, eliminating a read it can prove is stale, eliminating a write it can prove is never read, and reordering reads and writes that provably don't depend on each other — and names writes, not reads, as "the primary hazard."

`noalias` is where that abstract list becomes a concrete compiler fact. Compiling `examples/noalias.rs` with `rustc --edition 2024 --crate-type lib -O --emit=llvm-ir` shows `compute_ref`'s two reference parameters each carrying the `noalias` attribute in its `define` line, while `compute_raw`, identical logic over `*const u32`/`*mut u32`, carries none. That is the mechanical link: the aliasing rule is what lets the Rust compiler attach `noalias` to `&`/`&mut` parameters, and `noalias` is the LLVM-level promise ("this pointer's memory does not overlap any other `noalias` pointer's memory for the duration of the call") that unlocks the optimizations the Nomicon describes. Raw pointers get none of this, because nothing in their type says they don't overlap — the Reference states plainly that raw pointers "have no aliasing requirements on their own."

</section>

<section data-section="lab">

## Lab: build, break, measure

Every claim below is asserted in `examples.py`, which compiles and runs `examples/*.rs` fresh each time.

- `compute.rs`: `compute` and a hand-written `compute_opt` (the Nomicon's shrunk version) are run over 21 inputs (0–20) and 5 starting values each — 105 pairs — and must agree every time. They do, because the two arguments can never be the same place.
- `compute_alias_fail.rs`: `compute(&x, &mut x)` is compiled and asserted to fail with `error[E0502]` and the exact message "cannot borrow `x` as mutable because it is also borrowed as immutable."
- `noalias.rs`: compiled with `-O --emit=llvm-ir`; the `compute_ref` `define` line is asserted to contain exactly 2 occurrences of `noalias`, and the `compute_raw` line exactly 0.
- `reborrow.rs`: `bump(r); bump(r);` through one `&mut i32` is compiled and run; the result is asserted to be 2 (both calls took effect through reborrows of the same binding).
- `two_phase.rs`: `v.push(v.len() as i32)` on `vec![10, 20, 30]` is compiled and run; the result is asserted to be `[10, 20, 30, 3]`.
- `two_phase_sneaky.rs`: the RFC 2025 "sneaky" example (a shared borrow taken during the reservation, used after the call) is compiled and asserted to still fail with `error[E0502]` on current stable rustc — the reservation did not relax the rule for it.

</section>

<section data-section="production">

## Production failures

The error this topic's rule produces most often in real code is not `E0502` on a single call (the compiler catches that immediately) but a design that keeps re-deriving `Arc<Mutex<T>>` to dodge it, which Chapter 1's topic 4 already named as the reflex, not the fix: reaching for shared, runtime-checked exclusivity because the static version of the same rule rejected a design where more than one part of the program needed `&mut` to the same place at once. The fix in that situation is almost never "relax the rule" (it can't be relaxed); it's "name one owner," which is the chapter the aliasing rule sits inside the memory of, not outside it.

A second real failure mode: code that compiles only because of a two-phase borrow the author didn't know they were relying on, then breaks when it's refactored into two statements. `v.push(v.len())` compiles; `let n = v.len(); v.push(n);` also compiles (ordinary sequencing, no two-phase borrow needed at all) — but a line like `v.iter().for_each(|x| { v.push(*x); })` (an iterator borrow of `v` held across a `push` on the same `v`) is rejected, because the iterator's shared borrow is not a two-phase reservation and is still live when `push` wants its exclusive borrow. The fix is almost always to collect first, then mutate: the two-phase mechanism only ever smooths over the one syntactic shape it was built for (an `&mut self` method whose own arguments read `self`), never a general exemption from the rule.

</section>

<section data-section="frontier">

## Frontier

The rule as stated here is deliberately the *checked* half of a larger story. `UnsafeCell` (and therefore `Cell`, `RefCell`, atomics, and every other interior-mutability type) is the Reference's own named exception to "a shared reference prevents direct mutation" — it lets code mutate through a `&`, soundly, by moving the exclusivity check from the compiler to a runtime discipline the type enforces itself (a later Chapter 4 topic covers it in full; nothing here should be read as "there is no way to mutate behind a shared reference," only "not without opting in"). Raw pointers (`*const T`/`*mut T`) sit on the other side of the same boundary: the Reference states they "have no aliasing requirements on their own," which is precisely why `compute_raw` in this topic's `noalias.rs` gets no `noalias` attribute — the compiler has no static guarantee to hand the optimizer once a pointer isn't tied to the borrow checker. `unsafe` code that violates the aliasing rule through raw pointers or `UnsafeCell` misuse is undefined behaviour exactly because it breaks the assumption `noalias` encodes; that is Chapter 11's subject.

</section>

<section data-section="next">

## Where this goes next

This topic showed the rule is checked *right now*, for borrows the compiler can see start and end in one function. Chapter 2's next topics ask the question the rule itself doesn't answer: for how long can a borrow exist at all (a lifetime, topic 6), what happens when a type's own shape is built entirely around returning borrowed views (zero-copy parsing, topic 7), and what changes when the borrow has to cross into another thread or task, whose lifetime the compiler can no longer see end where the caller's does (topic 8). Further out, Chapter 38 covers what the optimizer actually does with the `noalias` facts this topic measured directly (loop vectorization, redundant-load elimination at a much larger scale) once whole programs, not one function, are in view.

</section>
