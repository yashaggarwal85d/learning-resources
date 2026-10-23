# Outline: Trait objects, vtables, and dyn compatibility (`rust.trait-objects-vtables-dyn`)

Chapter 3, topic 10. Single `/make-topic` session, 2026-10-22.

## Learning outcomes

1. Describe a `dyn Trait` value's actual layout (a fat pointer: a data pointer plus a vtable pointer) and say why calling through it can't be inlined the way a monomorphized call can.
2. Name dyn-compatibility's real rules (no generic methods, no by-value `Self` without `where Self: Sized` on that method) rather than the "no generics, roughly" folk version, and use the escape hatch to fix a real failure.
3. Use trait upcasting to go from `&dyn Sub` to `&dyn Super` directly, and choose enum dispatch over `dyn Trait` when the whole set of implementors is known in advance.

## Reel steps (storyboard)

1. **"Two words, not one"** — `fig`: `FatPointer`. `examples/fat_pointer.rs`: `&A`/`Box<A>` are one word; `&dyn Codec`/`Box<dyn Codec>` are two — a data pointer and a vtable pointer. Takeaway: "A dyn Trait reference or Box is a fat pointer: a data pointer plus a vtable pointer."
2. **"What's actually inside the second word?"** (predict) — `fig`: `VtableContents`. Predict what the vtable pointer points at: the trait's source code / a table of function pointers, one per method (correct) / a copy of the concrete type's data / nothing, it's padding. Correct: a table of function pointers, one per method `Codec` and its supertraits that the concrete type implements.
3. **"Calling through it is late binding"** — `fig`: `LateBinding`. Calling a method on `&dyn Codec` loads the right function pointer from the vtable at run time, then calls through it — the Reference's own "late binding." No takeaway (this is the reel's "from" step).
4. **"The cost isn't the indirect call"** — `fig`: `LostInlining`. Both `examples/lost_inlining_generic.rs` and `examples/lost_inlining_dyn.rs` compute the identical sum through the identical loop. Optimized LLVM IR shows the generic version's call fully inlined away; the dyn version still calls through a loaded function pointer, no matter how much optimization runs. Takeaway: "Most of dyn Trait's cost is the inlining a monomorphized call gets and a vtable call never can, not the indirect call itself."
5. **"A method that takes Self by value can't go in the vtable"** (predict) — `fig`: `DynIncompatible`. `examples/dyn_incompatible_fail.rs`'s `Greet::loud(self) -> Self`, used as `Box<dyn Greet>`. Predict: compiles fine / fails: `Self` by value can't be dispatched through a fat pointer (correct) / fails: `Greet` needs `Send` / compiles, but `loud` panics at run time. Correct: the real `error[E0038]`, "the trait `Greet` is not dyn compatible."
6. **"One bound excludes just that method"** — `fig`: `SizedEscape`. `examples/sized_escape_hatch.rs`: adding `where Self: Sized` to `loud` alone excludes it from the vtable; the rest of `Greet` (including `hi`) stays dyn compatible and `Box<dyn Greet>` compiles. Takeaway: "`where Self: Sized` excludes one method from the vtable instead of disqualifying the whole trait."
7. **"Widening to the parent trait, directly"** (predict) — `fig`: `Upcasting`. `examples/upcasting.rs`'s `&dyn Sub` to `&dyn Super`. Predict: needs the concrete type again / coerces directly, stable since a recent release (correct) / only works with `Box`, not `&` / only works if `Super` has no methods of its own. Correct: direct coercion, stabilized in Rust 1.86.
8. **"A closed list, matched by hand"** — `fig`: `EnumDispatch`. `examples/enum_dispatch.rs`'s `CodecKind` enum: no vtable, no fat pointer, at the cost of needing every implementor known in advance — the third alternative to both monomorphization and `dyn Trait`. Takeaway: "Enum dispatch trades needing every type in advance for no vtable and no fat pointer at all."
9. **Recap** — a `dyn Trait` reference or `Box` is a fat pointer; its vtable is a table of function pointers, called through at run time (late binding); the real cost is lost inlining, not the indirect call; dyn-compatibility excludes generic methods and by-value `Self` methods, fixable per-method with `where Self: Sized`; trait upcasting widens directly; enum dispatch is the closed-set alternative to both chapters' tools. Handoff to topic 11: both answers so far assume the trait itself can be used this way — as a type parameter, or as `dyn Trait`. What decides whether it can?

## Engagement arc

- Hook: step 1, against topic 9's monomorphized fan-out.
- Early predictions: step 2 (within the first four).
- Surprising number: none beyond step counts (narration spells numbers as words); the surprising *fact* is that the "cost" people blame — the indirect call — isn't actually the dominant one; lost inlining is (step 4).
- Takeaways: steps 1, 4, 6, 8 (four; step 5's predict explain carries the dyn-compatibility rule itself, so no separate takeaway line is needed there).
- Recap: step 9.

## Claims list

| Claim | Source |
|---|---|
| A pointer to a trait object is a data pointer plus a vtable pointer; the vtable holds one function pointer per method the concrete type implements; calling through it is late binding, resolved at run time | `reference-trait-object` + `examples/fat_pointer.rs`, `examples/lost_inlining_dyn.rs` (executed) |
| Most of dyn Trait's real cost is lost inlining: a monomorphized call to a known type inlines away entirely under optimization; a vtable call never can, regardless of optimization level | expert knowledge + `examples/lost_inlining_generic.rs` vs `examples/lost_inlining_dyn.rs` (executed, optimized LLVM IR comparison) |
| A trait is dyn compatible only if every method is either dispatchable (no type parameters, no non-receiver use of Self) or explicitly excluded with `where Self: Sized` | `reference-traits-dyn-compatible` + `examples/dyn_incompatible_fail.rs` (executed, real `E0038`), `examples/sized_escape_hatch.rs` (executed) |
| Trait upcasting (`&dyn Sub` to `&dyn Super` directly) was stabilized in Rust 1.86.0 | `rust-releases` + `examples/upcasting.rs` (executed) |
| Enum dispatch is a closed, vtable-free alternative to `dyn Trait`, at the cost of needing every implementor known in advance | expert knowledge + `examples/enum_dispatch.rs` (executed) |

## Concept ledger

- `introduces`: `dyn-trait-fat-pointer`, `dyn-compatibility`, `trait-upcasting`, `enum-dispatch`
- `uses`: `monomorphization`
- `declared`: `traits-generics-basics`, `std-collections`

## Bridge and handoff

- Bridge: "A generic function pays its cost once, at compile time, for every type it will ever be called with. What if the set of types isn't known until the program is running?" (`CHAPTER.md` §A.8, reused verbatim.)
- Handoff: "Both answers so far assume the trait itself can be used this way — as a type parameter, or as `dyn Trait`. What decides whether it can?" (`CHAPTER.md` §A.8, reused verbatim.)
