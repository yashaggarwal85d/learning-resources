# Outline: Aliasing XOR mutability (`rust.aliasing-xor-mutability`)

Chapter 2, topic 5 (first topic of the chapter). Single `/make-topic` session, 2026-10-22.

## Learning outcomes

1. State the aliasing rule precisely (many `&T` or exactly one `&mut T` on the same place, never both live at once) and say what it buys: data-race freedom across threads, and `noalias` facts the optimizer can rely on.
2. Read a reborrow and a two-phase borrow in code not written for teaching, and explain why each compiles under the rule rather than as an exception to it.
3. Predict, before compiling, whether a given snippet that looks like it violates the rule actually does.

## Reel steps (storyboard)

1. **"Two readers or one writer, never both"** — `fig`: the rule. Owner/heap drawing from Ch.1's grammar: one payload, either many dashed shared edges or one dashed exclusive edge landing on it, never both kinds at once. *Moves on beat:* the shared edges draw in one by one, then fade and the exclusive edge draws. *Takeaway:* "Many can read at once, but a writer always has the place alone." Narrator's line of thought: state the rule exactly as the Nomicon's working definition implies it, correcting the common shorthand ("one mutable xor many immutable") by naming the *aliasing* half explicitly — the thing that's banned is overlap, not plurality.
2. **"What the rule buys: no two threads both holding the pen"** — `fig`: data-race freedom. Two owner columns (two threads) both reaching for the same payload with `&mut` edges; the second is drawn starting, then rejected (edge turns `cherry`, label `E0499`-style "already borrowed"). Links back to topic 4's `Mutex` (runtime version of the same exclusivity). Narrator: ties the compile-time rule to the run-time lock the learner already knows, and says what's different (checked before the program runs vs checked while it runs).
3. **"A function the compiler wants to shrink"** (predict) — `fig`: `compute`. Code panel showing `compute(input: &u32, output: &mut u32)` from `examples/compute.rs`, with the two `if`s. Predict: "If `input` and `output` could be the same place, would the compiler's shrunk version (cache `*input` once, write `*output` once) ever give a different answer?" Options: yes always / yes sometimes / no, aliasing can't happen here / the question doesn't apply to references. Correct: "yes sometimes" is the trap (it's about *could the compiler assume it*, not *does it happen*); the real answer the step explains is that the rule makes the question moot — explained in step 4.
4. **"`compute(&x, &mut x)` doesn't compile"** — `fig`: E0502. The owner slot for `x` sprouts both a shared and an exclusive edge at once; both flash `cherry`; code panel shows the real `rustc` message (`examples/compute_alias_fail.rs`, asserted). Takeaway: "The compiler didn't optimize around this case — it made the case impossible." Narrator: walks through *why* the naive and shrunk versions would disagree if aliasing were allowed (the `*input > 10` write also changes `*input`), using the Nomicon's own execution trace, then lands on: that's exactly the input Rust rules out.
5. **"The optimizer is told, not just lucky"** — `fig`: `noalias`. A compact `Code` panel of the two `define` lines from the compiled LLVM IR (`examples/noalias.rs`): the `&`/`&mut` version carries `noalias` on both parameters, the raw-pointer version carries none. Takeaway: "`noalias` is not a guess the compiler makes — it's a fact the type system handed it." Narrator: explains what `noalias` lets the optimizer do in one sentence (treat the two parameters' memory as definitely separate) and why raw pointers don't get it (nothing in their type says they don't overlap).
6. **"Lending from a `&mut` without losing it: a reborrow"** — `fig`: reborrow. `examples/reborrow.rs`'s `bump(r); bump(r);` with the drawing showing the exclusive edge from `r` fading to a shorter dashed "reborrow" edge into `bump`'s frame, then reappearing for the second call; `r`'s own slot is never marked `moved`. Takeaway: "Each call borrows from `r`, not `r` itself." Narrator: contrasts with what *would* happen if `bump` took `x: &mut i32` by move-of-the-reference-itself (it can't — references aren't consumed by using them this way); names the implicit `&mut *r` the compiler inserts at the call site.
7. **"Does `v.push(v.len())` compile?"** (predict) — `fig`: the question. Code panel with `v.push(v.len())`; the drawing shows `push`'s `&mut` edge starting to grow from `v` while a dashed `len()` read edge also reaches in. Predict: compiles cleanly / E0502, can't borrow twice / only compiles in older editions / only compiles with `.clone()`. Correct: "compiles cleanly."
8. **"Reserved, then activated"** — `fig`: two-phase borrow. The `push`'s edge is drawn first as a dashed (shared-looking) "reserved" edge, the `len()` read edge coexists beside it, then at the actual call the reserved edge thickens into the real exclusive edge. Takeaway: "A reserved borrow is a shared borrow until it's used." Narrator: names the two phases from the RFC (reservation, activation) and the rule they still obey — during reservation it behaves exactly like a shared borrow, so other shared reads are fine, but a second *exclusive* claim still wouldn't be.
9. **"A reservation still isn't a free pass"** — `fig`: the sneaky case. `examples/two_phase_sneaky.rs`: a borrow taken during the reservation (`p = borrow_first(&v)`) but used *after* the call — rejected, E0502, shown in the real compiler message. Takeaway: "The aliasing rule still applies across the activation point." Narrator: walks the RFC's own reasoning for why this one case needed an extra check, so the learner sees the rule enforced, not relaxed.
10. **Recap** — the five things shown: the rule itself, what it buys (data races, `noalias`, both measured/compiled, not asserted), reborrowing, two-phase borrows, and the limit of the reservation. Handoff line to topic 6: a lifetime is the question the aliasing rule doesn't yet answer — *how long* can a borrow last.

## Engagement arc

- Hook: step 1, the rule stated against the visual grammar the learner already trusts from Chapter 1.
- Early predictions: step 3 (by step 3 of 10, within the first four) and step 7.
- Surprising number: 2 — `noalias` attributes present on the reference version, 0 on the raw-pointer version (the same source logic, two different compiled guarantees).
- Takeaways: steps 1, 4, 5, 6, 8, 9 (six, well over three).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| Working definition of aliasing; the rule forbids `&mut` ever aliasing anything | `nomicon-aliasing` |
| `compute`/`compute_opt` agree because aliasing can't happen; `compute(&x,&mut x)` is the input that would break it | `nomicon-aliasing` + `examples/compute.rs`, `examples/compute_alias_fail.rs` (executed) |
| `compute(&x, &mut x)` is rejected, E0502 | `examples/compute_alias_fail.rs` (executed) |
| Shared refs: any number, `Copy`, prevent direct mutation modulo interior mutability; exclusive refs: sole access, not `Copy` | `reference-pointer-types` |
| Reference params get `noalias` in `-O` LLVM IR; raw-pointer params don't | `examples/noalias.rs` (executed, IR inspected) |
| Reborrowing: a shorter borrow carved from a `&mut`, implicit at call sites | `examples/reborrow.rs` (executed) + expert knowledge |
| Two-phase borrows: reservation behaves as a shared borrow, activates at first use | `rfc-2025-two-phase-borrows` + `examples/two_phase.rs` (executed) |
| The RFC's "sneaky" example is still rejected on current rustc | `rfc-2025-two-phase-borrows` + `examples/two_phase_sneaky.rs` (executed) |

## Concept ledger

- `introduces`: `aliasing-xor-mutability`, `reborrowing`, `two-phase-borrows`
- `uses`: `ownership-signatures`, `e0382`, `counting-allocator` (not needed — none used), `ownership-topology`, `arc-mutex-reflex` — pruned to what's actually referenced: `ownership-signatures` (the `&T`/`&mut T` signature vocabulary), `arc-mutex-reflex` (step 2's `Mutex` callback)
- `declared`: `references-basics`, `structs-enums`, `std-collections`, `threads-and-channels`, `mutexes`

## Bridge and handoff

- Bridge: "Every topology still lends: `fill` borrows `&mut Buf`, `inspect` borrows `&Buf`. Now: the rule behind those loans, many shared borrows or one exclusive borrow, never both." (topic 4's real handoff, reused verbatim since it already states this topic's opening question.)
- Handoff: "The rule says how many borrows, of what kind, at once. It says nothing yet about how long — that's a lifetime."
