---
id: rust.box-rc-arc-ownership
title: Box, Rc, and Arc ownership shapes
---

<section data-section="outcomes">

## After this topic you can

- Place `Box`, `Rc`, and `Arc` by how many owners each allows and whether that owner count is safe to touch from more than one thread.
- Explain why `Rc<T>` is `!Send` and reproduce the real compile failure from moving one into another thread.
- State that `Arc::clone` is cheap only while uncontended, backed by a real, measured multi-threaded benchmark rather than an asserted ratio.

</section>

<section data-section="internals">

## Internals: what actually changes between Box, Rc, and Arc

Everything here was run with rustc 1.97.0 (2d8144b78 2026-07-07) on x86_64 Linux, edition 2024, in `examples.py`. The syllabus baseline is 1.99.

`Box<T>` is the simplest of the three: a single owner's value, moved onto the heap, with no reference count at all. `examples/box_ownership.rs` moves a `Node` and its boxed child together, through one owner the entire time — ownership exactly as single as an unboxed value's, only the storage location differs.

`Rc<T>` lets more than one place in a program own the same heap value at once, on a single thread. The Book explains the mechanism directly: "every time we call `Rc::clone`, the reference count to the data... will increase, and the data won't be cleaned up unless there are zero references to it," and crucially, "the call to `Rc::clone` only increments the reference count, which doesn't take much time" — unlike a deep copy. `examples/rc_shared.rs` clones an `Rc<Node>` twice, watches `Rc::strong_count` climb from one to three, drops one clone, and watches it fall back to two, all on one thread with a plain, non-atomic count.

That plain count is exactly why `Rc<T>` cannot cross a thread boundary. `examples/rc_not_send_fail.rs` moves an `Rc<i32>` into `thread::spawn` and fails to compile with the real `error[E0277]`, naming the reason directly: `Rc<i32>` cannot be sent between threads safely. The std docs give the underlying rule: "`Rc<T>` is a safe default, because the compiler will catch any attempt to send an `Rc<T>` between threads." Nothing here is a runtime check — the compiler rejects the program before it ever runs, because `Rc<T>` simply does not implement `Send`.

`Arc<T>` is the same shared-ownership shape, built to cross that boundary safely. The std docs: "unlike `Rc<T>`, `Arc<T>` uses atomic operations for its reference counting. This means that it is thread-safe." `examples/arc_shared.rs` clones one `Arc<Node>` into four real threads, each of which reads the shared text and exits; only the original owner's count remains once every clone has been dropped. The same docs are explicit about the cost of that safety: "the disadvantage is that atomic operations are more expensive than ordinary memory accesses. If you are not sharing reference-counted allocations between threads, consider using `Rc<T>` for lower overhead." `Rc<T>`'s plain count is not a missing feature; it is the cheaper default for the common case where sharing never actually leaves one thread.

That extra cost is easy to read about and easy to dismiss as negligible — until more than one thread actually touches the same count at once. `examples/arc_contention.rs` measures it directly: the identical total number of `Arc::clone`/`drop` pairs, once run by a single thread alone, and once split across four threads all hitting the same `Arc`, released together by a `std::sync::Barrier` so they genuinely start contending at the same instant rather than drifting into the benchmark at slightly different times. The naive expectation is that splitting fixed work across four threads finishes in roughly a quarter of the time. What this topic's own run actually measured was the opposite: the contended run, split across four threads, took noticeably *longer* than the single uncontended thread doing the entire thing alone — every clone and drop on the shared `Arc` is a real atomic read-modify-write on the same cache line, and four threads racing for that one cache line cost far more than the parallelism ever gave back.

</section>

<section data-section="lab">

## Lab: build, break, measure

Every claim below is asserted in `examples.py`, which compiles and runs `examples/*.rs` fresh each time.

- `box_ownership.rs`: run and asserted to print the expected values, showing the boxed child moving with its parent.
- `rc_shared.rs`: run and asserted to print the expected counts, showing the plain refcount rise and fall across clone and drop.
- `rc_not_send_fail.rs`: compiled and asserted to fail with `error[E0277]`, naming `Rc<i32>` as unsendable.
- `arc_shared.rs`: compiled, run across four real threads, and asserted to print the expected combined result and the final count.
- `arc_contention.rs`: compiled with optimizations, run for real with `std::time::Instant` and a `std::sync::Barrier`, and asserted that the measured contended time exceeds the measured uncontended baseline — never a guessed or hard-coded number.

</section>

<section data-section="production">

## Production failures

The most common real failure here is reaching for `Arc<T>` everywhere out of caution, even on code that never actually leaves one thread, paying the atomic cost for no benefit `Rc<T>` wasn't already giving for less. The fix is deciding up front whether a value is ever shared across a thread boundary; if it genuinely isn't, `Rc<T>` is the correct, cheaper choice, and the compiler will refuse to let it leak across threads by accident.

The second is assuming that because an individual `Arc::clone` is cheap in isolation, splitting hot, shared-counter-touching work across more threads always helps. It does not, once enough threads genuinely contend for the same cache line at once; this topic's own measured run is the concrete evidence, not a rule of thumb to take on faith. The fix in a real system is usually not more threads touching the same `Arc`, but reducing how often threads actually need to touch the shared count at all — the subject this chapter returns to directly in topic 15.

</section>

<section data-section="frontier">

## Frontier

Neither `Rc<T>` nor `Arc<T>` lets code mutate the value behind a shared owner; `&T` stays `&T` no matter how many owners hold it. That gap, and the one legal way around it, is this chapter's very next topic. Weak references and reference cycles — what happens when two `Rc`/`Arc`-managed values end up pointing at each other — are topic 14's subject, out of scope here. The exact contention numbers measured in this topic's own run are specific to this sandbox's hardware and thread count; the qualitative result (contention on a shared atomic count costs real, measurable time, and does not scale the way naive parallelism predicts) is the durable claim, not any single nanosecond figure. The syllabus itself points this exact cost forward to a much later chapter on lock-free and atomic data structures, where the same cache-line contention this topic measures becomes the starting cost every lock-free design is trying to avoid; that chapter is out of scope here.

</section>

<section data-section="next">

## Where this goes next

None of `Box`, `Rc`, or `Arc` let a program mutate through a shared owner on their own — a shared `&T` is still just `&T`. Topic 13 asks what actually makes that legal: `UnsafeCell` as the one sanctioned escape hatch, and the safe wrappers — `Cell`, `RefCell`, `OnceCell`/`OnceLock`, `LazyLock` — built on top of it.

</section>
