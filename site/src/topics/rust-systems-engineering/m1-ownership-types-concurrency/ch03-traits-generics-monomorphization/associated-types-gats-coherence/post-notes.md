---
id: rust.associated-types-gats-coherence
title: Associated types, GATs, and coherence
---

<section data-section="outcomes">

## After this topic you can

- Place an associated type against a generic parameter on a trait, and say which one lets the same type implement a trait many times.
- Read a generic associated type as an associated type generic over a lifetime, and say why a lending iterator needs one.
- State the orphan rule, reproduce its real compile failure, fix it with the newtype pattern, and name a blanket impl.

</section>

<section data-section="internals">

## Internals: coherence, GATs, and why the orphan rule exists

Everything here was run with rustc 1.97.0 (2d8144b78 2026-07-07) on x86_64 Linux, edition 2024, in `examples.py`. The syllabus baseline is 1.99.

The Book introduces the contrast directly: "the associated type is named `Item` and stands in for the type of the values the type implementing the `Iterator` trait is iterating over," and crucially, "with associated types, we don't need to annotate types, because we can't implement a trait on a type multiple times... we can choose what the type of `Item` will be only once because there can be only one `impl Iterator` for" a given type. `examples/assoc_type_one_impl.rs` and `examples/assoc_vs_generic.rs` show the associated-type side: `Codec::Output` is fixed inside the one impl `A` gets. `examples/assoc_type_duplicate_fail.rs` shows what happens if code tries to pick `Output` a second time anyway — a genuinely different error than it looks: it fails with `error[E0119]`, "conflicting implementations," because a type simply cannot implement the same trait twice, with or without an associated type involved. A generic parameter on the trait itself sidesteps that limit entirely, because `CodecGeneric<u8>` and `CodecGeneric<u16>` are different trait bounds as far as coherence is concerned — `examples/generic_param_multiple_impls.rs` implements both for the same type, the same shape `From<i32>` and `From<f64>` use for the same target type.

A generic associated type takes that same associated-type mechanism and adds a parameter of its own. The Reference: "associated types may include generic parameters and where clauses; these are often referred to as generic associated types, or GATs," and its own canonical example is exactly the case this topic needs — a lending iterator: `trait LendingIterator { type Item<'x> where Self: 'x; fn next<'a>(&'a mut self) -> Self::Item<'a>; }`. The Reference explains the required bound directly: "on the next function, we can prove that `Self: 'a`, because of the implied bounds from `&'a mut self`; therefore, we must write the equivalent bound on the GAT itself: `where Self: 'x`." `examples/gat_lending_iterator.rs` implements this over a byte buffer: each call to `next` hands back a `&'a mut [u8]` tied to that one call's own borrow of `self`, something `Iterator::Item` — with no lifetime parameter of its own — cannot express at all.

Coherence is the property both of the previous ideas rest on: a type gets exactly one impl of a trait, full stop. The orphan rule is what makes that provable across separately-compiled crates: "a trait implementation is only allowed if either the trait or at least one of the types in the implementation is defined in the current crate," specifically to prevent "two crates [implementing] the same trait for the same type in incompatible ways." `examples/orphan_rule_fail.rs`'s `impl Display for Vec<u8>` is rejected with the real `error[E0117]`, naming the exact reason, because neither `Display` nor `Vec` is local here. `examples/newtype_fix.rs` fixes it the standard way: wrapping the foreign type in a local, single-field `Bytes` struct satisfies the rule with the identical `Display` logic. A blanket impl is subject to this same rule — the Book's own example, "the standard library implements the `ToString` trait on any type that implements the `Display` trait" via `impl<T: Display> ToString for T`, is only legal because `ToString` itself is defined in `std`. `examples/blanket_impl.rs` writes the identical shape locally, covering both a plain integer and a custom struct from one declaration.

</section>

<section data-section="lab">

## Lab: build, break, measure

Every claim below is asserted in `examples.py`, which compiles and runs `examples/*.rs` fresh each time.

- `assoc_vs_generic.rs` and `assoc_type_one_impl.rs`: run and asserted to print the expected values, showing one associated-type impl working as a single, fixed choice.
- `assoc_type_duplicate_fail.rs`: compiled and asserted to fail with `error[E0119]`, naming the conflicting implementations.
- `generic_param_multiple_impls.rs`: compiled, run, and asserted to print both results, proving two impls of the same generic trait coexist for one type.
- `gat_lending_iterator.rs`: compiled, run, and asserted to print the correct accumulated total across every lending `next()` call.
- `orphan_rule_fail.rs`: compiled and asserted to fail with `error[E0117]`, naming the current-crate requirement.
- `newtype_fix.rs`: compiled, run, and asserted to print the wrapped value, proving the newtype satisfies the rule.
- `blanket_impl.rs`: compiled, run, and asserted to print both the integer's and the struct's results through the one blanket impl.

</section>

<section data-section="production">

## Production failures

The most common real failure here is adding an associated type to a trait, expecting it to behave like a generic parameter, and being surprised that a type can't implement the trait twice with different concrete types for it. The fix isn't fighting coherence; it's checking, before writing the trait, whether a given implementor genuinely needs one fixed choice (associated type) or several coexisting ones (a generic parameter on the trait), the same decision `Iterator` and `From<T>` each made for a reason.

The second is hitting the orphan rule while trying to add convenience behavior to a type from another crate — a `Display` impl, a `serde::Serialize` impl, an operator overload — and reaching for `unsafe` or a fork of the dependency instead of the newtype pattern. The newtype wrapper costs an extra `.0` at call sites, but it is almost always the correct, minimal fix, and it keeps the exact coherence guarantee that makes a dependency upgrade safe in the first place.

</section>

<section data-section="frontier">

## Frontier

Specialization — letting a more specific generic impl override a more general blanket one — remains unstable precisely because it would reintroduce the thing coherence and the orphan rule both exist to prevent: two impls of a trait that could overlap for the same type, now resolved by some ordering rule instead of being disallowed outright. An `async fn` inside a trait needs a hidden, compiler-generated `Future` type per implementation, which is itself a kind of associated type the compiler invents automatically; the full mechanism for writing and dispatching async trait methods is this syllabus's own Chapter 8, out of scope here, but it rests on exactly the associated-type machinery this topic covers. Coherence is also not quite "any type, any trait": fundamental types like `Box<T>` get special treatment, where the `T` inside `Box<T>` doesn't count as foreign for orphan-rule purposes, so `Box<LocalType>` counts as local even though `Box` itself is defined elsewhere — a detail that matters for library authors more than for this topic's own examples.

</section>

<section data-section="next">

## Where this goes next

Every `dyn Trait` value Chapter 3 built was either borrowed or already sitting behind a `Box`. Chapter 4 asks what shape of ownership that `Box` actually is, and what `Rc` and `Arc` add once a single owner stops being enough — the move from "one function owns this value" to "several parts of a program need to share it."

</section>
