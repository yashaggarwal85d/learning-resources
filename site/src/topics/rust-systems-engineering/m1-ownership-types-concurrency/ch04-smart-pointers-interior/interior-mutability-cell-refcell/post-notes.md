---
id: rust.interior-mutability-cell-refcell
title: "Interior mutability: Cell, RefCell, UnsafeCell"
---

<section data-section="outcomes">

## After this topic you can

- Name UnsafeCell as the one legal way to obtain a mutable pointer from a shared reference, and say that every safe interior-mutability type is built on it.
- Use Cell where values are cheap to copy in and out, needing no runtime borrow tracking.
- Use RefCell where borrows must be tracked at run time, reproduce its real panic on a conflicting double borrow, and place OnceCell/OnceLock and LazyLock as one-time-initialization tools.

</section>

<section data-section="internals">

## Internals: one escape hatch, three ways to use it safely

Everything here was run with rustc 1.97.0 (2d8144b78 2026-07-07) on x86_64 Linux, edition 2024, in `examples.py`. The syllabus baseline is 1.99.

Every ordinary Rust type can only be mutated through `&mut T`; a shared `&T` is supposed to point at data the compiler is free to treat as immutable. `UnsafeCell<T>` is the one sanctioned way around that: the docs describe it directly as "the core primitive for interior mutability in Rust," which "opts-out of the immutability guarantee for `&T`: a shared reference `&UnsafeCell<T>` may point to data that is being mutated." `examples/unsafecell_basics.rs` builds a counter whose `increment` method takes `&self` and still mutates its stored value, through `UnsafeCell::get`'s raw pointer. Crucially, this is not something the type system grants automatically to every field: `examples/counter_without_unsafecell_fail.rs` writes the identical shape with a bare `u32` field instead, and it fails to compile outright with `error[E0594]`, the ordinary "cannot assign through a `&` reference" error every `&self` method hits trying to mutate a field — no undefined behavior, no cell type, just the plain borrow checker doing its normal job.

Rather than reach for `UnsafeCell` directly, almost all real code uses one of the safe wrappers built on top of it. `Cell<T>` is the simplest: the std docs note that `Cell`, `RefCell`, and `OnceCell` "allow doing this in a single-threaded way—they do not implement `Sync`." `examples/cell_basics.rs` never hands out a reference to the value inside a `Cell<u32>` at all; `set`, `get`, and `replace` all copy the whole value in or out, which is exactly why `Cell` needs no runtime bookkeeping whatsoever.

`RefCell<T>` is for values that are not cheap to copy, or that genuinely need a reference handed out. The docs: "an immutable reference to a `RefCell`'s inner value (`&T`) can be obtained with `borrow`, and a mutable borrow (`&mut T`) can be obtained with `borrow_mut`. When these functions are called, they first verify that Rust's borrow rules will be satisfied... If a borrow is attempted that would violate these rules, the thread will panic." `examples/refcell_children.rs` pushes twice through `borrow_mut` and reads the length back through `borrow`, each guard dropped before the next is taken. `examples/refcell_double_borrow_fail.rs` holds a shared `borrow()` alive and then calls `borrow_mut()` while it's still in scope: the program compiles cleanly and panics the instant it runs, exiting with code 101 and a message naming the conflict directly, exactly the "already borrowed" panic the docs' own `borrow_mut` entry describes. `RefCell` is explicitly `!Sync`, and "the corresponding `Sync` version of `RefCell<T>` is `RwLock<T>`" — `RefCell` is never a substitute for a mutex, only a single-threaded, run-time borrow check.

`OnceCell`/`OnceLock` and `LazyLock` solve a narrower problem: a value that only ever needs to be produced once. `examples/oncelock_lazy_init.rs` calls `OnceLock::get_or_init` twice and gets back the identical value both times, written only on the first call; a `static LazyLock` computed from a closure is read twice and evaluated only once. `OnceLock` was stabilized in Rust 1.70.0 (2023-06-01); `LazyLock` followed in Rust 1.80.0 (2024-07-25), per the project's own `RELEASES.md`.

</section>

<section data-section="lab">

## Lab: build, break, measure

Every claim below is asserted in `examples.py`, which compiles and runs `examples/*.rs` fresh each time.

- `unsafecell_basics.rs`: run and asserted to print the expected count, showing mutation through `&self` via `UnsafeCell::get`.
- `counter_without_unsafecell_fail.rs`: compiled and asserted to fail with `error[E0594]`, naming the exact field.
- `cell_basics.rs`: run and asserted to print the expected values, showing `Cell`'s copy-in, copy-out semantics.
- `refcell_children.rs`: run and asserted to print the expected count, showing two sequential `borrow_mut` guards followed by one `borrow`.
- `refcell_double_borrow_fail.rs`: run and asserted to exit with code 101 and a stderr message naming the borrow conflict, from a real runtime panic, never simulated.
- `oncelock_lazy_init.rs`: run and asserted to print the expected values, showing both the `OnceLock` and the `LazyLock` initialize exactly once.

</section>

<section data-section="production">

## Production failures

The most common real failure here is reaching for `RefCell` on data that is actually shared across threads, discovering only at compile time that it is `!Sync` and refuses to go inside an `Arc` shared across threads the way the code wants — or worse, wrapping it in an `unsafe impl Sync` to force it through, which reintroduces exactly the data race `!Sync` exists to prevent. The fix is `Mutex`/`RwLock` whenever more than one thread is actually involved; `RefCell` is for single-threaded aliasing only.

The second is a `RefCell` panic from a borrow that outlives the expression it looks like it belongs to: a `Ref` or `RefMut` bound to a variable and kept alive longer than intended, often across a function call that itself tries to borrow the same `RefCell` again. The fix is almost always scoping the borrow explicitly, with a block or by not binding the guard to a name at all, so it drops before the next borrow is attempted.

</section>

<section data-section="frontier">

## Frontier

`RwLock<T>` is the `Sync` equivalent of `RefCell<T>`, with the identical "any number of shared borrows, or exactly one exclusive borrow" shape, checked across threads instead of within one — it is this chapter's own later subject once `Arc<Mutex<T>>`-style serialization comes up directly. None of `Cell`, `RefCell`, `OnceCell`, or `LazyLock` make the data behind them safe to access from more than one thread at once on their own; that gap, and what a reference cycle built from `Rc<RefCell<T>>` can do once two of these point at each other, is exactly where this chapter goes next.

</section>

<section data-section="next">

## Where this goes next

A node that can point at its own children, mutably, through `RefCell`, can also be made to point back at its parent. Topic 14 asks what happens once two of those point at each other: a reference cycle that safe Rust compiles without complaint and leaks forever, and `Weak`, the non-owning reference that breaks it.

</section>
