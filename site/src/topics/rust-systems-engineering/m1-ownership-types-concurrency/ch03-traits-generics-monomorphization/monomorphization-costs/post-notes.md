---
id: rust.monomorphization-costs
title: Monomorphization and its costs
---

<section data-section="outcomes">

## After this topic you can

- Explain monomorphization well enough to predict, without running anything, that a generic function bound by a trait compiles to one distinct body per concrete type it is actually called with.
- Use the non-generic-inner-function (outlining) trick to keep the compiled duplicate thin while the public generic signature stays unchanged.
- Place `impl Trait` in argument position against return position and say what each one actually costs.

</section>

<section data-section="internals">

## Internals: what the proof actually shows

Everything here was run with rustc 1.97.0 (2d8144b78 2026-07-07) on x86_64 Linux, edition 2024, in `examples.py`. The syllabus baseline is 1.99.

The Book states the claim directly: "using generic types won't make your program run any slower than it would with concrete types," because "Rust accomplishes this by performing monomorphization of the code using generics at compile time" — "the process of turning generic code into specific code by filling in the concrete types that are used when compiled." It adds the mechanism: "the compiler looks at all the places where generic code is called and generates code for the concrete types the generic code is called with." `examples/monomorphization.rs` makes this checkable: one `encode_generic<C: Codec>` function, called through `call_a`/`call_b` with codecs `A` and `B`. Compiled with `--emit=llvm-ir` at the default, unoptimized level, the IR shows exactly two `define` lines for `encode_generic`, each with a distinct mangled name carrying the concrete type's own fragment — `A` in one, `B` in the other. At `-O`, this proof breaks: LLVM's interprocedural constant propagation folds the whole single-call-site chain down to a bare `ret i8 1` / `ret i8 2` and the `encode_generic` symbol disappears entirely, even with `#[inline(never)]` on it (which blocks true inlining, not value-level folding). The proof needs the unoptimized build specifically because that build reliably keeps one distinct symbol per instantiation instead of folding them away.

That duplication is monomorphization's real cost, and it scales with the number of distinct concrete types a generic function is instantiated with, not with how many times it's called. `examples/outlining.rs` and `examples/naive.rs` isolate where that cost actually lands: both define an `encode<C: Codec>` that produces the same eight-byte output, but `outlining.rs` pulls the byte-formatting loop into its own non-generic `format_bytes` function, so the generic `encode` that gets duplicated per type shrinks to a thin shim calling it, while `naive.rs` leaves the whole loop inside the generic boundary, so each of its two compiled copies carries the full logic. Counting IR lines per `define` block confirms it: the outlined version's two shims are far smaller than `format_bytes`'s one shared body, and the naive version's two full bodies are each clearly larger than either outlined piece — proportional, measured duplication, not a guess.

`impl Trait` wears one phrase for two different mechanisms. The Reference states both: "argument position (where it can act as an anonymous type parameter to functions), and return position (where it can act as an abstract return type)." In argument position, it "is syntactic sugar for a generic type parameter like `<T: Trait>`, except that the type is anonymous" — the Book's own example makes the practical difference concrete: with two `impl Trait` parameters, "we want this function to allow item1 and item2 to have different types," but "if we want to force both parameters to have the same type... we must use a trait bound" instead. `examples/impl_trait_arg.rs` compiles `two_impl_trait(a: impl Greet, b: impl Greet)` called with a `Dog` and a `Cat`; `examples/trait_bound_same_type_fail.rs` writes the same call through one shared `<T: Greet>` and gets the real `error[E0308]`, "expected `Dog`, found `Cat`," because a single named parameter forces one concrete type everywhere it appears.

In return position, the Reference says "each possible return value from the function must resolve to the same concrete type," and the function, not the caller, picks which one — "the caller may only use the methods declared by the specified trait." Critically, "impl Trait in return position allows a function to return an unboxed abstract type," which is the point `examples/impl_trait_return.rs` measures directly: a counting global allocator (the same technique Chapter 1's leak-safety topic used) shows `make_adder_impl_trait`, returning `impl Fn(i32) -> i32`, makes no new allocation at all, while `make_adder_boxed`, returning `Box<dyn Fn(i32) -> i32>` — the way to return "some closure" before `impl Trait` existed — makes exactly one allocation, every single call.

</section>

<section data-section="lab">

## Lab: build, break, measure

Every claim below is asserted in `examples.py`, which compiles and runs `examples/*.rs` fresh each time.

- `monomorphization.rs`: run and asserted to print the two codecs' own bytes; compiled to unoptimized LLVM IR and asserted to contain exactly two distinct `encode_generic` symbols, one carrying each concrete codec's mangled fragment.
- `outlining.rs`: run and asserted to print the expected byte count from both codecs; its IR is asserted to show exactly two `encode` shims and exactly one shared `format_bytes` body.
- `naive.rs`: run and asserted to print the same byte count; its IR is asserted to show exactly two `encode` bodies, equal in size to each other and larger than the outlined version's shim.
- `impl_trait_arg.rs`: compiled, run, and asserted to print both greeters' words, proving two `impl Trait` parameters may hold different concrete types.
- `trait_bound_same_type_fail.rs`: compiled and asserted to fail with `error[E0308]`, naming the exact type mismatch a shared generic bound forces.
- `impl_trait_return.rs`: compiled, run, and asserted on the allocator's count before and after each call: no new allocation for the `impl Trait` return, exactly one for the boxed trait object.

</section>

<section data-section="production">

## Production failures

The most common real failure here is treating `impl Trait` in argument position as a drop-in replacement for a named generic parameter without checking whether the function needs two parameters to share a type. Refactoring `fn pair<T: Summary>(a: T, b: T)` to `fn pair(a: impl Summary, b: impl Summary)` silently loosens the constraint: code that relied on `a` and `b` being the same concrete type (a comparison, a shared buffer, a match on an enum variant) now compiles with mismatched types and fails somewhere downstream, often with a confusing error far from the actual signature change.

The second is reaching for `Box<dyn Trait>` out of habit when returning a closure or an iterator, paying a real heap allocation and a vtable's lost inlining on every call, when the concrete return type is always the same and `impl Trait` in return position would do the same job for free. This topic's allocator count is the check worth running before assuming a `dyn` return is necessary: if every return path really does resolve to one concrete type, it almost always does.

</section>

<section data-section="frontier">

## Frontier

Monomorphization's bloat cost generalizes past this topic's one-parameter examples: a function generic over several type parameters, each bound by a trait, multiplies out to one compiled body per *combination* of concrete types actually used, not per parameter. Large Rust binaries that take a long time to compile are frequently diagnosed this way, and `cargo bloat`'s whole purpose is surfacing which generic functions are the worst offenders in a real binary — a measurement this topic approximates with a plain `rustc --emit=llvm-ir` symbol count instead of reaching for that external tool. Neither `impl Trait` position changes anything the borrow checker already decided in Chapter 2: they only change which party, caller or callee, gets to pick the concrete type sitting behind the trait's interface. The next topic's `dyn Trait` is the third option when even that isn't enough — when the set of concrete types isn't known until the program is running.

</section>

<section data-section="next">

## Where this goes next

A generic function pays monomorphization's cost once, at compile time, for every type it will ever be called with. The next topic asks what happens when the set of types calling into one shared piece of code isn't known until the program is running — a plugin list, a widget tree, a codec registry chosen at run time — where `dyn Trait`'s fat pointer and vtable become the better tool, at a different, smaller cost than the one this topic just measured.

</section>
