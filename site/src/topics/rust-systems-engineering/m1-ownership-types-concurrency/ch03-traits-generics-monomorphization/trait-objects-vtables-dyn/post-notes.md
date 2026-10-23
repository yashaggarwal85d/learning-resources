---
id: rust.trait-objects-vtables-dyn
title: Trait objects, vtables, and dyn compatibility
---

<section data-section="outcomes">

## After this topic you can

- Describe a `dyn Trait` value's actual layout — a fat pointer: a data pointer plus a vtable pointer — and say why calling through it can't be inlined the way a monomorphized call can.
- Name dyn-compatibility's real rules and use the `where Self: Sized` escape hatch to fix a real failure, one method at a time.
- Use trait upcasting to go from `&dyn Sub` to `&dyn Super` directly, and choose enum dispatch over `dyn Trait` when every implementor is known in advance.

</section>

<section data-section="internals">

## Internals: the vtable, dyn compatibility, and what optimization can't fix

Everything here was run with rustc 1.97.0 (2d8144b78 2026-07-07) on x86_64 Linux, edition 2024, in `examples.py`. The syllabus baseline is 1.99.

The Reference states the layout directly: because a trait object's concrete type is erased, it is "used behind some type of pointer," and "each instance of a pointer to a trait object includes: a pointer to an instance of a type T that implements SomeTrait" and "a virtual method table, often just called a vtable, which contains, for each method of SomeTrait and its supertraits that T implements, a pointer to T's implementation." `examples/fat_pointer.rs` checks this with `size_of`: `&A` and `Box<A>` are exactly one word; `&dyn Codec` and `Box<dyn Codec>` are exactly two. Calling a method is "late binding": the Reference says it "results in virtual dispatch at runtime: that is, a function pointer is loaded from the trait object vtable and invoked indirectly." `examples/lost_inlining_dyn.rs`'s optimized LLVM IR shows exactly that — a value loaded from a fixed offset into the vtable, then called through that loaded pointer, with no named callee anywhere in the instruction.

What that IR comparison actually proves is the chapter's real claim about cost. `examples/lost_inlining_generic.rs` and `examples/lost_inlining_dyn.rs` compute the identical sum through the identical loop, one over a statically known type, one over `&dyn Codec`. Compiled with the optimizer on, the generic version's call to its trivial `encode` method disappears completely — inlined and even auto-vectorized away, leaving no call instruction in the function at all. The dyn version keeps a real, indirect call through the vtable no matter how much optimization runs, because the optimizer genuinely cannot know which concrete type's `encode` it will reach until the program is running. Raising the optimization level helps the generic version more and more; it cannot touch the dyn version's call at all. That is the chapter's point: the indirect call itself is a small, fixed cost, and the inlining a monomorphized call gets for free — and a vtable call structurally cannot — is the larger piece people usually blame on "the indirect call" instead.

Dyn compatibility decides whether a trait can be used as `dyn Trait` at all. The Reference: "all associated functions must either be dispatchable from a trait object or be explicitly non-dispatchable," and a dispatchable method "must not have any type parameters" and "must not use Self except in the type of the receiver." `examples/dyn_incompatible_fail.rs`'s `loud(self) -> Self` uses `Self` by value, which the vtable can't express (the callee would need to know `Self`'s concrete size through an opaque fat pointer), so `Box<dyn Greet>` fails to compile with the real `error[E0038]`, "the trait `Greet` is not dyn compatible." The fix, per the Reference, is making the offending method "explicitly non-dispatchable," which "require[s] a where Self: Sized bound." `examples/sized_escape_hatch.rs` adds exactly that to `loud` alone; the vtable is built without a slot for it, the rest of `Greet` (including `hi`) stays dyn compatible, and `Box<dyn Greet>` compiles.

Trait upcasting is a separate, newer capability: converting `&dyn Sub` to `&dyn Super` directly, without going back through the concrete type. `examples/upcasting.rs` compiles and runs this. The Rust project's own release notes record exactly when: "Version 1.86.0 (2025-04-03)" stabilized "upcasting trait objects to supertraits."

</section>

<section data-section="lab">

## Lab: build, break, measure

Every claim below is asserted in `examples.py`, which compiles and runs `examples/*.rs` fresh each time.

- `fat_pointer.rs`: run and asserted that `&A`/`Box<A>` are exactly one word wide and `&dyn Codec`/`Box<dyn Codec>` are exactly two.
- `lost_inlining_generic.rs` and `lost_inlining_dyn.rs`: both run and asserted to compute the identical sum; both compiled to optimized LLVM IR and asserted that the generic version's body has no real call instruction left, while the dyn version's body keeps one, through a function pointer loaded from the vtable.
- `dyn_incompatible_fail.rs`: compiled and asserted to fail with `error[E0038]`, naming the trait as not dyn compatible.
- `sized_escape_hatch.rs`: compiled, run, and asserted to print the expected string, proving the `where Self: Sized` fix compiles and the rest of the trait still works through `Box<dyn Greet>`.
- `upcasting.rs`: compiled, run, and asserted to print both the subtrait's and supertrait's results through the same upcast reference.
- `enum_dispatch.rs`: compiled, run, and asserted to print the correct sum across both enum variants.

</section>

<section data-section="production">

## Production failures

The most common real failure here is reaching for `Box<dyn Trait>` on a hot path expecting the cost to be "one indirect call," then being surprised when a profiler shows far more time lost than that would explain. The missing half of the picture is this topic's own measurement: every call site that used to inline a small, frequently-called method now cannot, and that lost inlining compounds across a tight loop in a way a single indirect call's overhead never would on its own. The fix usually isn't removing the trait object; it's checking whether the method being called is small and hot enough that the lost inlining actually matters, and reaching for generics, enum dispatch, or batching the dynamic dispatch outside the hot loop only when it does.

The second is treating dyn-compatibility as "no generics, roughly" and being confused when a trait with no generic methods still fails to compile as `dyn Trait`. The actual rule is about any method that can't be dispatched through a fixed vtable slot, which also includes a by-value `Self` method, an async method (a hidden, per-implementation `Future` type), and a method with a return-position `impl Trait`. The one general fix is the same for all of them: add `where Self: Sized` to that specific method, which excludes it from the vtable instead of disqualifying the whole trait, provided the trait's other methods don't also need it.

</section>

<section data-section="frontier">

## Frontier

The `AsyncFn`/`AsyncFnMut`/`AsyncFnOnce` traits are not dyn compatible at all, for the same underlying reason as an async method: their calling convention needs a per-implementation, compiler-generated future type that a fixed vtable slot can't express — a case this topic's rules predict without needing a dedicated example. Enum dispatch's closedness composes awkwardly with a plugin architecture that genuinely needs new implementors added without recompiling the core crate; that is precisely the situation `dyn Trait` exists for, and the chapter's real lesson is picking the tool by the actual shape of the problem (how many types, known when, how hot the call site is) rather than by habit. The next topic turns to a different question entirely: not how a trait is *used*, but what decides whether a trait can be used a given way in the first place — associated types, generic associated types, and the orphan rule.

</section>

<section data-section="next">

## Where this goes next

Both answers this chapter has built so far — a generic function monomorphized per type, and a trait object dispatched through a vtable — assume the trait itself can be used that way at all. The next topic asks what decides that: an associated type chosen once per `impl` versus a generic parameter that allows many; a generic associated type for a lending iterator; and the orphan rule that guarantees only one `impl` of a trait for a type can ever exist.

</section>
