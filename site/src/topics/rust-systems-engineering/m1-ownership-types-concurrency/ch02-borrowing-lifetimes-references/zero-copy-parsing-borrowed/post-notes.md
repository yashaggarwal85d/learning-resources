---
id: rust.zero-copy-parsing-borrowed
title: Zero-copy parsing with borrowed views
---

<section data-section="outcomes">

## After this topic you can

- Write a `fn parse<'a>(buf: &'a [u8]) -> Header<'a>` whose output's fields are plain views into the input, and explain why that output can never outlive `buf`.
- Choose among `&'a [u8]`, `Cow<'a, [u8]>`, and an owned `Vec<u8>` for a mostly-read workload, and predict exactly when a `Cow` actually clones.
- Say why `bytes::Bytes` can escape a scope a plain borrow cannot, and why a self-referencing struct needs a crate like `yoke` or `ouroboros` instead of compiling as plain references.

</section>

<section data-section="internals">

## Internals: borrows, Cow, and reference-counted sharing

Everything here was run with rustc 1.97.0 (2d8144b78 2026-07-07) on x86_64 Linux, edition 2021, through a small cargo crate in `examples/` (bytes 1.12.1 and ouroboros 0.18.5, fetched from crates.io). The syllabus baseline is 1.99.

A zero-copy parse returns a value whose fields are subslices of the input: `examples/zero_copy_parse.rs`'s `Header<'a>` holds `magic: &'a [u8]` and `name: &'a [u8]`, both carved out of `buf` with ordinary range indexing, and the example asserts pointer equality to confirm no byte was copied. The lifetime parameter `'a` ties `Header`'s own lifetime to `buf`'s, so the borrow checker enforces the one rule this topic turns on: a reference can never outlive the place it was taken from. `examples/owned_vs_borrowed_fail.rs` makes that concrete by trying to return a `&[u8]` borrowed from a `Vec<u8>` allocated inside the same function; rustc rejects it with `E0515`, "cannot return value referencing local variable," because the `Vec` is dropped the instant the function returns.

`Cow` (Rust Reference's own `abs_all` example, "Cow in std::borrow") sidesteps exactly this tension for a mostly-read workload: it holds either a `Borrowed` reference or an `Owned` value, and `to_mut` clones into the owned form only the first time it is actually called. `examples/cow_example.rs` runs `abs_all` on data with nothing to flip (stays `Cow::Borrowed`) and on data with one negative value (clones into `Cow::Owned`), asserting the variant directly in both cases.

`bytes::Bytes` solves a different problem: rather than deferring a clone, it makes sharing the normal way to hold the data. Per the bytes docs, every `Bytes` implementation must be cheaply cloneable (typically by bumping a reference count) and sliceable without copying. `examples/bytes_share.rs` builds a `Bytes` from an owned `Vec<u8>` inside a function and returns it freely — unlike the `&[u8]` case, nothing about `Bytes` borrows from that function's stack — then clones it and slices it, asserting pointer equality in both cases to confirm the underlying memory is shared, not duplicated.

Self-referencing structs fail for a structural reason: `examples/self_ref_fail.rs`'s `Parsed<'a>` tries to hold an owned `String` and a `&'a str` borrowing it, built and returned together, and rustc rejects it with both `E0515` and `E0505` — the move of `owner` into the struct literal conflicts with the still-live borrow `view` holds. The ouroboros crate's `#[self_referencing]` macro (its own docs, "self_referencing in ouroboros") solves this by generating a builder: the owning field is placed into its final, stable storage first, and only then is the borrowing field constructed against that address via a `_builder` closure, with accessor methods (`borrow_view`) replacing direct field access afterward. `examples/ouroboros_works.rs` reproduces the identical shape `self_ref_fail.rs` couldn't build, successfully.

</section>

<section data-section="lab">

## Lab: build, break, measure

Every claim below is asserted in `examples.py`, which drives a small cargo crate under `examples/`.

- `zero_copy_parse.rs`: `Header`'s `magic` and `name` fields are asserted to point at `buf`'s own memory (`as_ptr()` equality), not a copy.
- `owned_vs_borrowed_fail.rs`: compiled and asserted to fail with `error[E0515]` and "cannot return value referencing local variable."
- `cow_example.rs`: `abs_all` run on `[0, 1, 2]` is asserted to leave the `Cow` as `Cow::Borrowed`; run on `[-1, 0, 1]`, asserted to become `Cow::Owned` with the sign flipped.
- `bytes_share.rs`: a `Bytes` returned from a function that owned its buffer is asserted to run successfully; a clone and a slice of it are each asserted to share the same pointer as the original.
- `self_ref_fail.rs`: compiled and asserted to fail with both `error[E0515]` and `error[E0505]`.
- `ouroboros_works.rs`: compiled, run, and asserted to print the stored string back through `borrow_view()`.

</section>

<section data-section="production">

## Production: network and async code

Code that reads from a socket or a memory-mapped file is the canonical home for every choice this topic makes. A `&'a [u8]` works fine for a function that parses and returns before its buffer goes away, but network code routinely needs to hold onto a received buffer's data across an `await` point, hand it to another task, or push it onto a queue — none of which can be tied to the borrow checker's notion of one call's lifetime. That's the specific gap `bytes::Bytes` fills: a parser can slice and clone a `Bytes` as freely as it likes without ever worrying about which scope the underlying bytes came from, because the `Bytes` itself owns a reference-counted handle to that memory. This is also why `bytes::Bytes` is the return type of choice for libraries like Tokio's networking stack and HTTP crates, rather than `&[u8]` or `Cow`: the data's owner and its readers are often different tasks entirely, running at different times, and only a refcounted owner (not a borrow) can safely outlive the specific call that produced it.

</section>

<section data-section="frontier">

## Frontier

`Yoke<Y, C>` generalizes the self-referencing pattern this topic's ouroboros example showed by hand: instead of one bespoke struct per case, `Yoke` attaches *any* zero-copy type (a `Cow`, a `ZeroVec`, or an aggregate of such types) to *any* "cart" smart pointer (`Box`, `Rc`, `Arc`), producing one movable value and getting the borrowed view back out through `.get()`, which reifies the erased lifetime to a safe, local one only for the duration of that call. This is the library ICU4X actually uses to deserialize locale data without copying it, which is a much larger-scale version of exactly the `Header<'a>` problem this topic opened with. Choosing between hand-written ouroboros structs and a general `Yoke` is a question of how many distinct self-referencing shapes a codebase actually needs, not covered further here.

</section>

<section data-section="next">

## Where this goes next

Every view this topic built — borrowed, `Cow`, `Bytes`, or self-referencing — stayed on one thread for its entire life. The next topic asks what a borrow actually needs to cross into another thread or async task: why `thread::spawn` and `tokio::spawn` require `'static`, what `std::thread::scope` buys back, and why there is no equivalent sound scoped spawn for async.

</section>
