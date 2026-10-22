# Chapter 3 — Traits, Generics, Monomorphization, and Dynamic Dispatch (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 1, *Ownership, Types, and Concurrency Primitives*. Chapter 3, section 1.3. Planned 2026-10-22, in one `/make-topic` session (the owner retired the parallel-run routine on 2026-10-20; this plan replaces that process, not its format). Previous chapter: Chapter 2, *Borrowing, Lifetimes, and References* (all four topics live).

This file is the contract each of the chapter's three topics builds to. Do not edit it once a topic is in progress; record any unavoidable departure under that topic's `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Chapters 1 and 2 gave the learner a model for one concrete value at a time: who owns it, and who may borrow it, for how long. This chapter asks a different question about the *code* that handles many types at once: when a function is written generically over a type parameter, what does the compiler actually produce, and what does that cost? Rust's answer is monomorphization — a separate copy of the function per concrete type, as if the programmer had hand-written each one, which is why a generic call optimizes exactly as well as a non-generic one. That zero-overhead promise is not free of *all* cost: it moves the cost to compile time and to binary size, and the moment a program needs one function body shared across many types at run time instead — a plugin list, a widget tree, a codec registry — the trade reverses, and `dyn Trait` becomes the better tool despite its own, smaller and different cost (a lost-inlining tax, not primarily the indirect call people blame). The chapter ends on the type-level machinery (associated types, GATs, coherence) that decides which of these designs a given trait can even express.

By the end of the chapter the learner can: explain monomorphization well enough to predict what a generic function compiles to without running anything; use the non-generic-inner-function trick to keep compile times and binary size down without giving up a generic public signature; place `impl Trait` in argument vs. return position and say what each one desugars to; describe a `dyn Trait` value's actual layout (data pointer + vtable pointer) and name dyn-compatibility's real rules, not the "no generics, roughly" folk version; choose between generics, `dyn Trait`, and a closed enum for a given plugin-style boundary by measured cost, not habit; and place an associated type against a generic parameter, state the orphan rule, and know why specialization is still unstable.

## A.2 The order of ideas, and why

1. **Monomorphization and its costs** (topic 9) — the baseline fact everything else in the chapter reacts against: a generic function with trait bounds is compiled once per concrete type, giving zero-overhead calls at the cost of code bloat and compile time. The non-generic-inner-function outlining trick, and `impl Trait` in argument position (sugar for an anonymous generic parameter) vs. return position (an opaque, caller-unknown concrete type) as two different compiler mechanisms wearing the same syntax.
2. **Trait objects, vtables, and dyn compatibility** (topic 10) — needs (1): once monomorphization's cost (code size, compile time) is on the table, `dyn Trait` is introduced as the other answer, with its own concrete cost model (a fat pointer, a vtable, lost inlining) measured against monomorphization's, not assumed worse by reputation. Dyn-compatibility (formerly "object safety"), the `where Self: Sized` escape hatch, trait upcasting, and enum dispatch as a third, closed-set alternative to both.
3. **Associated types, GATs, and coherence** (topic 11) — needs (1) and (2): having built both a generic function and a trait object across the first two topics, this topic asks what decides which traits can even be used that way. Associated types vs. generic parameters, generic associated types for lending iterators, the orphan rule and coherence, blanket impls, the newtype pattern, and why specialization remains unstable. Hands off to Chapter 4 (`rust.box-rc-arc-ownership`), where `Box<dyn Trait>`'s heap allocation becomes the main event instead of a side effect.

## A.3 The running example: the byte pipeline grows a codec

Chapters 1 and 2's pipeline (`Buf`, `Header`, `Pool`, `fill`/`inspect`/`consume`) continues in spirit but this chapter's question — "one function body per type, or one function body for many types" — needs a *codec* on top of it, so each topic adds a minimal, self-contained codec shape over the pipeline's `Header`/`Buf` rather than importing Chapter 1/2 code verbatim (topics are self-contained; no cross-topic imports):

- **Topic 9** writes one small generic function bound by a `Codec`-shaped trait (e.g. `fn encode<C: Codec>(c: &C, h: &Header) -> Vec<u8>`), inspects what it monomorphizes to for two concrete codecs (via `rustc --emit=llvm-ir`, counting distinct compiled symbols, the same proof technique topic 5 used for `noalias`), then extracts its generic body into a non-generic inner function and shows the public signature is unchanged while the compiled duplication drops. `impl Trait` in argument vs. return position is shown over the same `encode`-shaped function, each compiled and inspected for what it actually accepts/returns.
- **Topic 10** puts the same two codecs behind `Box<dyn Codec>`, inspects the fat pointer's two words (data, vtable) with `std::mem::size_of`/a raw-pointer transmute proof, and measures a lost-inlining cost difference against topic 9's monomorphized version on a tight loop. A dyn-incompatible trait method (generic or by-value `Self`) is shown failing to compile as a trait object, then fixed with `where Self: Sized` on just that method. An enum of the same two codecs is built as the third alternative.
- **Topic 11** gives `Codec` (or a sibling trait) an associated type for its output instead of a generic parameter, compares it against a generic-parameter version that needs many impls per input type (the `Iterator`/`From<T>` contrast from the syllabus), sketches a GAT-shaped lending iterator over the pipeline's buffer, and reproduces the orphan rule's real compile failure (implementing a foreign trait for a foreign type) fixed by the newtype pattern.

Every number shown must come from each topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0; confirm against the syllabus baseline of 1.99 and record what actually ran). Reuse Chapter 1 §A.6 / Chapter 2 §A.6's engineering conventions unchanged: `rustc --edition 2024`, compile-fail examples assert the exact `error[E0xxx]`, a cargo crate under `examples/` only if a topic needs an external crate (none of this chapter's core claims do; `cargo bloat`-style binary-size measurement, if used, should be done with a plain `rustc`/`size`-based proxy before reaching for an external tool, per QUALITY.md's "never invent what you didn't run" rule).

## A.4 Terms and notation (continuing Chapters 1–2's vocabulary)

Everything in Chapter 1 §A.4 and Chapter 2 §A.4 still applies (owner, handle/payload, move, copy/clone, borrow/loan, destructor, leak, guard, topology, lifetime, elision, variance, higher-ranked bound, `'static`, borrowed view, E-codes, units). This chapter adds:

- **monomorphization**: the compiler generating one specialized copy of a generic function (or `impl` method) per concrete type/trait combination actually used, at the call sites that use it — the mechanism behind Rust's "zero-cost abstraction" claim for generics.
- **outlining** (the non-generic-inner-function trick): factoring a generic function's body into a separate, non-generic function taking only the already-erased data it needs, so the generic wrapper that gets monomorphized per type is tiny and the bulk of the code is compiled exactly once.
- **`impl Trait` (argument position)**: sugar for an anonymous generic type parameter bound by `Trait`; the caller picks the concrete type, same as a normal generic.
- **`impl Trait` (return position)**: the function picks one concrete, hidden type that implements `Trait` and commits to it; the caller only ever sees `Trait`'s interface, never the real type — opaque, not generic, no monomorphization choice at the call site.
- **`dyn Trait`**: a trait used as a dynamically-sized type; a value only ever exists behind a pointer (`&dyn Trait`, `Box<dyn Trait>`, …) that is a **fat pointer**: a data pointer plus a pointer to a **vtable** (a fixed table of function pointers for `Trait`'s methods, one table per concrete type).
- **dyn-compatibility** (formerly "object safety"): the rules deciding whether a trait can be used as `dyn Trait` at all — no generic methods (the vtable has one fixed slot per method, not one per instantiation), no method taking `Self` by value (the callee wouldn't know `Self`'s size through the fat pointer) unless that method opts out with `where Self: Sized`.
- **trait upcasting**: converting `&dyn SubTrait` to `&dyn SuperTrait` (stable since 1.86), without re-widening through the concrete type.
- **enum dispatch**: a closed, non-extensible alternative to `dyn Trait` — one `enum` variant per known implementor, matched explicitly, with no vtable and no fat pointer, at the cost of needing to know every variant in advance.
- **associated type**: a type chosen once per `impl` of a trait (`type Item;`), as opposed to a generic parameter, which a trait can be implemented many times for (once per concrete type argument) on the same type.
- **GAT (generic associated type)**: an associated type that is itself generic over a parameter (often a lifetime), needed to express a trait method returning a borrow tied to `&self`'s own call (a "lending iterator").
- **orphan rule / coherence**: an `impl Trait for Type` is only allowed in the crate that defines `Trait` or the crate that defines `Type` (never neither), which guarantees exactly one impl of any trait for any type exists program-wide.
- **blanket impl**: an `impl<T: Bound> Trait for T`, implementing a trait for every type satisfying a bound in one declaration.
- **newtype pattern**: wrapping a foreign type in a local single-field struct (`struct Wrapper(ForeignType);`) specifically to satisfy the orphan rule and implement a foreign trait for it.
- **specialization**: an unstable feature that would let a more specific generic impl override a more general blanket impl; named here only as "not available on stable", not built.

Narration words (continuing Chapter 1/2 convention: no digits, no code-style names spoken): "written once per type" for monomorphization, "pulled out into its own plain function" for outlining, "a trait used as the argument type" vs "a trait used as the return type" for the two `impl Trait` positions, "a trait object"/"a fat pointer"/"a table of functions" for `dyn Trait`/vtable, "allowed as a trait object" for dyn-compatibility, "widening to the parent trait" for upcasting, "a closed list, matched by hand" for enum dispatch, "a type chosen once per implementation" for an associated type, "a lending iterator" for a GAT use case, "the one-crate rule" for the orphan rule, "a wrapper type" for newtype, "not yet on stable" for specialization.

## A.5 Visual language (continuing Chapters 1–2's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same owner/heap regions, borrow edges and variance boxes from Chapters 1–2 §A.5. This chapter adds:

- **A monomorphization fan-out**: one generic function box with an arrow fanning out to two or more concrete-type boxes, each labelled with the type it was compiled for — the visual for "one generic body becomes several compiled bodies".
- **A fat pointer**: two adjacent small boxes (`data` and `vtable`) drawn side by side as one unit, with the vtable box's own small rows for each method's function pointer — reused for every `dyn Trait` step in topics 10–11.
- **An outlining split**: a single function box splitting into a small generic "shim" box (thin, `C.taupe`) feeding into one wider shared box (`C.caramel` outline) — the opposite visual direction from the fan-out, making the two ideas visually distinguishable at a glance.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 340–400) follows Chapter 1 §A.5 / Chapter 2 §A.5 and `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–2 §A.6: executed `examples.py` compiling real `rustc --edition 2024` sources per topic, self-contained topics, sources fetched and quoted via `scripts/sources.mjs`, registry fields as in Chapters 1–2 (same `milestone`, `chapter: { number: 3, title: 'Traits, Generics, Monomorphization, and Dynamic Dispatch', section: '1.3' }`), topics shipped **in order** (10 only after 9 is live, etc.). Scenes-level lesson from Chapter 2 (see project memory `learning-resources-scenes-reel-gotchas`): never nest an SVG element directly in a plain `<div>`/`<Stack>` or an HTML element inside an SVG `<g>`; fade HTML children via `<div style={{opacity}}>`; never give the reel's "from" step (the first non-predict step at dot index ≥ 1) a `takeaway`.

## A.7 The chapter's concept ledger

**Declared** (Chapters 1–2's own declared prerequisite ids, plus Chapters 1–2's *real* introduced ids as they are actually registered in `registry.ts`, not as an earlier draft might guess them — verified by grep immediately before writing this list): `rust-basics`, `stack-and-heap`, `references-basics`, `structs-enums`, `pattern-matching-basics`, `std-collections`, `error-handling-result`, `traits-generics-basics`, `threads-and-channels`, `mutexes`, `closures-basics`; `ownership`, `move-semantics`, `deinitialized-place`, `copy-trait`, `clone-cost`, `move-cost`, `box-ownership`, `ownership-signatures`, `e0382`, `e0505` (topic 1); `drop-trait`, `raii-guard`, `drop-order`, `temporary-scopes`, `edition-2024-temporary-scopes`, `drop-flags`, `mem-forget-manuallydrop`, `leak-safety`, `counting-allocator` (topic 2); `partial-moves`, `e0509-move-out-of-drop-type`, `e0507-move-out-of-borrow`, `take-replace-idioms`, `binding-modes`, `match-ergonomics-2024`, `destructuring-as-transfer` (topic 3); `ownership-topology`, `arc-mutex-reflex`, `tree-ownership`, `generational-arena`, `owner-task-messages`, `move-closures` (topic 4); `aliasing-xor-mutability`, `reborrowing`, `two-phase-borrows` (topic 5); `lifetime-as-constraint`, `lifetime-elision`, `variance-of-references`, `higher-ranked-trait-bounds`, `static-bound-vs-static-ref` (topic 6); `zero-copy-view`, `cow-clone-on-write`, `refcounted-bytes`, `self-referencing-struct` (topic 7); `spawn-requires-static`, `thread-scope-join-guarantee`, `arc-satisfies-static`, `no-sound-async-scope` (topic 8). A topic in this chapter lists in `uses` only the ones it actually relies on.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `monomorphization` | 9 | A generic function compiled once per concrete type/trait combination used, giving call sites the same codegen as a hand-written non-generic version. |
| `monomorphization-bloat` | 9 | The code-size and compile-time cost of monomorphization: one compiled copy per type actually used, growing with the number of instantiations. |
| `outlining-inner-function` | 9 | Factoring a generic function's body into a non-generic inner function so only a thin generic shim gets duplicated per type. |
| `impl-trait-arg-vs-return` | 9 | `impl Trait` in argument position (an anonymous generic parameter) vs. return position (one hidden, caller-opaque concrete type) as two different mechanisms. |
| `dyn-trait-fat-pointer` | 10 | A `dyn Trait` value exists only behind a pointer that is itself two words: a data pointer and a vtable pointer. |
| `dyn-compatibility` | 10 | The rules for whether a trait can be used as `dyn Trait`: no generic methods, no by-value `Self` without `where Self: Sized` on that method. |
| `trait-upcasting` | 10 | Converting `&dyn SubTrait` to `&dyn SuperTrait` directly (stable 1.86). |
| `enum-dispatch` | 10 | A closed `enum` of known implementors matched explicitly, as a vtable-free alternative to `dyn Trait` for a fixed set of types. |
| `associated-type-vs-generic-param` | 11 | An associated type is chosen once per `impl`; a generic parameter allows many impls of the same trait for one type. |
| `generic-associated-types` | 11 | An associated type that is itself generic (typically over a lifetime), needed for a lending iterator's borrowed item type. |
| `orphan-rule-coherence` | 11 | An impl of `Trait` for `Type` is only allowed where either is locally defined, guaranteeing one impl exists program-wide. |
| `newtype-for-orphan-rule` | 11 | Wrapping a foreign type in a local single-field struct to satisfy the orphan rule and implement a foreign trait for it. |

## A.8 Bridges and handoffs

- **9** bridges from Chapter 2 topic 8's handoff ("a `for<'a> Fn(&'a T)` bound already showed a function written once for every lifetime; this chapter asks what 'written once' costs when the parameter is a type, not a lifetime") and opens on one generic function compiled for two concrete codecs. Hands off to 10: "a generic function pays its cost once, at compile time, for every type it will ever be called with. What if the set of types isn't known until the program is running?"
- **10** bridges from 9's handoff and opens on the same two codecs now behind `Box<dyn Codec>`. Hands off to 11: "both answers so far assume the trait itself can be used this way — as a type parameter, or as `dyn Trait`. What decides whether it can?"
- **11** bridges from 10's handoff and opens on giving `Codec` an associated type instead of a generic parameter. Hands off to Chapter 4 (`rust.box-rc-arc-ownership`): "every `dyn Trait` value this chapter built was borrowed or already behind a `Box`; Chapter 4 asks what shape of ownership that `Box` actually is, and what `Rc`/`Arc` add when one owner stops being enough."

## A.9 Primary sources to start from (topics must re-fetch and verify)

- *The Rust Programming Language* ch. 10 (generics, traits) and ch. 17/18 (trait objects) — baseline, not primary for the advanced claims.
- The Rust Reference: "Trait and lifetime bounds", "Trait objects", "Associated Items" (associated types), "Generic parameters".
- The Rustonomicon or the `dyn`-compatibility tracking RFC/reference text for the current (post-"object safety" rename) rules, including the `where Self: Sized` escape hatch and trait upcasting (stabilized 1.86 — verify against the current stable changelog).
- The Rust Reference or an RFC on GATs (generic associated types) for the lending-iterator motivation.
- The Rust Reference's "Coherence" / orphan rule wording, and the `std` docs' own blanket-impl examples (e.g. `impl<T: Display> ToString for T`).
- `cargo bloat`'s own README/docs if actually used for a binary-size measurement; otherwise a plain `rustc`-based proxy (symbol counts from `--emit=llvm-ir`, or `size`/`nm` on a compiled binary) with the limitation noted.
