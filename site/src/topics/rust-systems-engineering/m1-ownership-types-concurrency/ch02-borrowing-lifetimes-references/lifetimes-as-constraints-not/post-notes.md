---
id: rust.lifetimes-as-constraints-not
title: Lifetimes as constraints, not durations
---

<section data-section="outcomes">

## After this topic you can

- State what a lifetime actually is — a constraint between existing references, never a change to how long a value lives — and predict the output of the three elision rules without running `rustc`.
- Place `&'a T`, `&'a mut T` and `Cell<T>` on the variance axis, and reproduce one real compile failure each of the latter two causes that the first one doesn't.
- Tell `T: 'static` apart from `&'static T`, and say in one sentence why a `'static` suggestion in an error message is rarely the actual fix.

</section>

<section data-section="internals">

## Internals: variance and the borrow checker

Everything here was run with rustc 1.97.0 (2d8144b78 2026-07-07) on x86_64 Linux, edition 2024, in `examples.py`. The syllabus baseline is 1.99.

A lifetime, as the Reference and Nomicon use the word, is a region of the program a reference is valid throughout — a relationship the borrow checker proves between the borrows that already exist, never a property it grants a value. Nothing a lifetime annotation says changes when a destructor runs; that is fixed entirely by ownership (Chapter 1). Elision is the compiler filling in lifetime parameters under three rules (Reference, "Lifetime elision in functions"): each elided input gets its own distinct lifetime parameter; with exactly one input lifetime (elided or not), it is assigned to every elided output; and with a `&self`/`&mut self` receiver, that reference's lifetime is assigned to every elided output instead. `examples/elision.rs` shows the second rule in action; `examples/elision_ambiguous.rs` shows the one case none of the three rules can resolve — two input lifetimes, no receiver — which rustc reports as `E0106`, naming the exact ambiguity ("borrowed from `s` or `t`?").

Variance governs when one instantiation of a generic type may be used where another is expected, following from subtyping among lifetimes (`'a <: 'b` when `'a` outlives `'b`, in the Nomicon's notation). The Nomicon states the three cases directly: `F` is covariant if `F<Sub>` is a subtype of `F<Super>`, contravariant if the relationship inverts, and invariant if neither holds. `&'a T` is covariant over `'a` (a longer-lived shared reference can always substitute for a shorter one); `&'a mut T` is invariant over `T`, and so is `Cell<T>`, because `Cell`'s interior mutability — letting code write through what looks like a shared reference — gives it `UnsafeCell<T>`'s variance, which is `&mut T`'s. `examples/variance_ref.rs` and `examples/variance_mut_fail.rs` compile the Nomicon's own `debug`/`assign` pair against the identical two references (one `&'static str`, one shorter): the by-value, `T: Debug` call compiles by covariance; the `&mut T` call fails with `E0597` by invariance. `examples/cell_invariant_fail.rs` reproduces the same failure shape through `Cell<&'a str>`.

A higher-ranked trait bound (`for<'a> F: Fn(&'a T) -> &'a U`) is needed exactly when a bound's lifetime can't be named at the point the bound is written — the Nomicon's `Closure<F>` example: `call`'s `&self` lifetime isn't fixed until some later call site, so the bound on `F` must hold "for all choices of `'a`," not one lifetime chosen by the caller once. `examples/hrtb.rs` compiles the Nomicon's example as written.

Finally, `'static` is two different things wearing one keyword. As a lifetime on a reference, `&'static T` means the referent is valid for the whole remaining run of the program (string literals, `static`/`const` items, or anything `Box::leak`ed), and Rust By Example notes it "can still be coerced to a shorter lifetime." As a trait bound, `T: 'static` means `T` contains no reference with a lifetime shorter than `'static` — a statement about `T`'s *content*, not about how long any particular value of `T` survives. Owned data with no borrows inside it always satisfies the bound trivially; a reference to local data generally does not. `examples/static_bound_fail.rs` calls the identical function with an owned value (compiles) and a local borrow (rejected, `E0597`), and `examples/box_leak.rs` shows the one place minting a genuine `&'static` reference is the deliberate, correct move.

</section>

<section data-section="lab">

## Lab: build, break, measure

Every claim below is asserted in `examples.py`, which compiles and runs `examples/*.rs` fresh each time.

- `elision.rs`: the elided `substr1` and the fully written `substr2` are run on the same input and asserted to return the identical substring.
- `elision_ambiguous.rs`: compiled and asserted to fail with `error[E0106]` and the compiler's own disambiguation question in the message.
- `variance_ref.rs`: a `&'static str` and a shorter `&str` passed by value to one `T: Debug` function; compiled, run, and asserted to print both values.
- `variance_mut_fail.rs`: the identical pair of references through a generic `&mut T` function; asserted to fail with `error[E0597]`.
- `cell_invariant_fail.rs`: the same shape of failure through `Cell<&'a str>`; asserted to fail with `error[E0597]`.
- `hrtb.rs`: the Nomicon's `Closure<F>` example; compiled, run, and asserted to print the expected byte.
- `static_bound_fail.rs`: `print_it` called with an owned value (asserted to compile and run) and with a borrow of local data (asserted to fail with `error[E0597]`, naming the `'static` requirement).
- `box_leak.rs`: `Box::leak` minting a `&'static u32`; compiled, run, and asserted to print the leaked value.

</section>

<section data-section="production">

## Production failures

The most common real failure this topic's rule produces is a learner (or an LLM) "fixing" a borrow-checker error by adding `'static` wherever the compiler mentions it — to a trait bound, a struct field, or a function's return type — without checking whether the data involved can actually satisfy that bound. It often compiles, because the fix usually forces a clone, an `Arc`, or a `Box::leak` somewhere upstream to manufacture genuinely `'static` data, trading a compile error for a real allocation or a real leak. The rule from this topic is the check worth running first: is the thing actually free of non-`'static` borrows (then the bound was always true, and the real bug is elsewhere), or does it actually need to own its data (then the fix is to change what the type holds, not to annotate around the symptom)?

A second real failure is invariance surprising someone who only knows `&T`'s covariance: wrapping a reference in `Cell`, `RefCell`, or a `&mut` for "just a small aside" and then hitting a lifetime mismatch that looks unrelated to the change just made. The fix is never to chase the lifetime error with more annotations; it's to recognize that the wrapping type itself changed the variance of what it holds, and that the two references now have to share one exact lifetime instead of one merely outliving the other.

</section>

<section data-section="frontier">

## Frontier

Variance for user-defined types composes from its fields exactly as the Nomicon states: a type parameter used only in covariant positions is covariant in the whole type; used in even one invariant position, the whole type is invariant in that parameter, because "invariance wins all conflicts." This topic showed the primitive cases (`&T`, `&mut T`, `Cell<T>`); reading variance off an arbitrary struct with several fields is the same rule applied field by field, not a new one. Polonius, the borrow checker's successor region-inference engine, changes *how* the compiler proves these lifetime relationships (flow-sensitive rather than purely lexical in some cases) but not *what* covariance and invariance mean — a claim this topic doesn't rely on anything Polonius-specific to make. The deeper algebra of subtyping and variance for function types (contravariant arguments, covariant results) is named here only for `fn(T) -> U`'s row in the Nomicon's table; working through why is additional reading past this topic's scope.

</section>

<section data-section="next">

## Where this goes next

Every lifetime this topic named belonged to one reference at a time. The next topic asks what happens when a single function returns *many* borrowed views, all tied to the lifetime of one input buffer — zero-copy parsing — and what the alternatives are (`Cow`, an owned buffer, a reference-counted buffer) when a borrow can't be proven to outlive what the caller needs. After that, Chapter 2 closes by sending a borrow across a thread or task boundary, where `'static` stops being an annotation to second-guess and becomes a real requirement `thread::spawn` and `tokio::spawn` enforce for a concrete reason this topic already explained.

</section>
