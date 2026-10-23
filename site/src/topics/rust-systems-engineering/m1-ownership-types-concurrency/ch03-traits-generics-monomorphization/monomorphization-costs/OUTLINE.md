# Outline: Monomorphization and its costs (`rust.monomorphization-costs`)

Chapter 3, topic 9. Single `/make-topic` session, 2026-10-22.

## Learning outcomes

1. Explain monomorphization well enough to predict, without running anything, that a generic function bound by a trait compiles to one distinct body per concrete type it is actually called with.
2. Use the non-generic-inner-function (outlining) trick to keep the compiled duplicate thin while the public generic signature stays unchanged.
3. Place `impl Trait` in argument position (an anonymous generic parameter, caller picks the type, parameters may differ) against return position (one hidden concrete type the function itself picks, unboxed, no allocation) and say what each one actually costs.

## Reel steps (storyboard)

1. **"One generic function, compiled once per concrete type"** — `fig`: `MonoFanOut`. One `encode_generic<C: Codec>` box fanning out to two labelled, separately compiled bodies, one per codec. Takeaway: "Monomorphization: the compiler writes the generic function out again for every concrete type it is actually called with."
2. **"How many compiled bodies does rustc actually emit?"** (predict) — `fig`: `MonomorphizationCode`. `examples/monomorphization.rs`'s `encode_generic` called through `call_a`/`call_b`. Predict: one shared body / two, one per codec (correct) / none, inlined away / depends on call order. Correct: two, confirmed by `--emit=llvm-ir` showing two distinct mangled symbols, one per codec.
3. **"Zero run-time overhead is not zero cost"** — `fig`: `MonoProof`. The two compiled copies run exactly as fast as hand-written code (the zero-overhead promise); producing and storing both of them is not free, and that cost grows with every new concrete type the function is called with. No takeaway (this is the reel's "from" step for the phone swipe test).
4. **"Pulling the loop out of the generic shrinks the duplicate"** — `fig`: `OutliningSplit`. `examples/outlining.rs`: the byte-formatting loop lives in one ordinary, non-generic function; the generic wrapper that actually gets duplicated per type shrinks to a thin shim calling it, with the public signature unchanged. Takeaway: "Pulling the shared work into a plain function keeps monomorphization's duplicate down to a thin shim."
5. **"Skip the outlining: what happens to the duplicate?"** (predict) — `fig`: `NaiveVsOutlining`. `examples/naive.rs`: the same loop written directly inside the generic function. Predict: stays the same size / each copy duplicates the whole loop, not just a shim (correct) / the compiler outlines it automatically / only one copy gets the loop. Correct: each compiled copy now carries the whole loop, confirmed larger than the outlined version's shim-plus-one-shared-body split.
6. **"impl Trait in argument position: sugar for a hidden generic"** — `fig`: `ImplTraitArg`. `examples/impl_trait_arg.rs`'s `two_impl_trait(a: impl Greet, b: impl Greet)` called with a `Dog` and a `Cat`: each `impl Trait` parameter is its own anonymous generic parameter, so the two may differ in concrete type. No takeaway.
7. **"One shared bound instead of two impl Trait parameters"** (predict) — `fig`: `SharedBoundFail`. `examples/trait_bound_same_type_fail.rs`'s `two_same_type<T: Greet>(a: T, b: T)` called the same way. Predict: still compiles / fails because one shared `T` forces the same concrete type (correct) / compiles only with a trait object / fails because `Greet` isn't dyn-compatible. Correct: the real `error[E0308]`, "expected `Dog`, found `Cat`". Takeaway: "`impl Trait` on each parameter lets them differ; one shared generic bound forces them to match."
8. **"impl Trait in return position: one hidden, committed type"** — `fig`: `ImplTraitReturn`. `make_adder_impl_trait` returns `impl Fn(i32) -> i32`: the function itself picks one real, unboxed closure type and every return path commits to it; the caller only ever sees `Fn`'s interface, never the real type. Takeaway: "Return-position impl Trait commits to one real, unboxed type; the caller never learns which one."
9. **"Returning it unboxed costs nothing extra; boxing it allocates"** — `fig`: `AllocCount`. A counting global allocator (Chapter 1's leak-safety technique, reused) shows `make_adder_impl_trait` making no new allocation while `make_adder_boxed`'s `Box<dyn Fn(i32) -> i32>` makes exactly one, heap-allocating the trait object the pre-`impl Trait` world needed just to return "some closure" at all. Takeaway: "An unboxed `impl Trait` return allocates nothing new; a boxed trait object allocates once, every time."
10. **Recap** — one generic body per concrete type, free at run time, not free at compile time or in binary size; outlining keeps the duplicate thin; `impl Trait` in argument position lets parameters differ, one shared bound forces them to match; `impl Trait` in return position commits to one hidden, unboxed type, cheaper than boxing it. Handoff to topic 10: a generic function pays its cost once, at compile time, for every type it will ever be called with — what if the set of types isn't known until the program is running?

## Engagement arc

- Hook: step 1, against the chapter's own "written once per type" framing.
- Early predictions: step 2 (within the first four).
- Surprising number: none beyond step counts (narration spells numbers as words); the surprising *fact* is that the unboxed return allocates nothing at all while the boxed one allocates every single call (steps 8–9).
- Takeaways: steps 1, 4, 7, 8, 9 (five).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| Generics carry no run-time cost because the compiler performs monomorphization, generating code per concrete type used at each call site | `book-generic-syntax` + `examples/monomorphization.rs` (executed, `--emit=llvm-ir` symbol count) |
| Monomorphization's cost is compile time and binary size, not run time; the non-generic-inner-function trick keeps the per-type duplicate thin while the shared body stays compiled once | expert knowledge + `examples/outlining.rs` vs `examples/naive.rs` (executed, IR body-size comparison) |
| `impl Trait` in argument position is sugar for an anonymous, trait-bounded generic parameter; it is not fully equivalent to a named generic bound, because two `impl Trait` parameters may differ in concrete type where one shared `<T: Trait>` cannot | `book-traits` + `reference-impl-trait` + `examples/impl_trait_arg.rs`, `examples/trait_bound_same_type_fail.rs` (executed, real `E0308`) |
| `impl Trait` in return position lets a function return one concrete, hidden, unboxed type without heap allocation or dynamic dispatch, unlike a boxed trait object | `reference-impl-trait` + `examples/impl_trait_return.rs` (executed, counting-allocator proof) |

## Concept ledger

- `introduces`: `monomorphization`, `monomorphization-bloat`, `outlining-inner-function`, `impl-trait-arg-vs-return`
- `uses`: `higher-ranked-trait-bounds`
- `declared`: `traits-generics-basics`, `closures-basics`, `std-collections`

## Bridge and handoff

- Bridge: "A `for<'a> Fn(&'a T)` bound already showed a function written once for every lifetime; this chapter asks what 'written once' costs when the parameter is a type, not a lifetime." (`CHAPTER.md` §A.8, reused verbatim.)
- Handoff: "A generic function pays its cost once, at compile time, for every type it will ever be called with. What if the set of types isn't known until the program is running?" (`CHAPTER.md` §A.8, reused verbatim.)
