---
id: rust.borrows-across-thread-task
title: Borrows across thread and task boundaries
---

<section data-section="outcomes">

## After this topic you can

- State why `thread::spawn` requires `F: Send + 'static`, in one sentence that names the actual mechanism: a spawned thread's lifetime is not bounded by the caller's own stack frame.
- Use `thread::scope` to let spawned threads borrow non-`'static` data, and say exactly why that is sound rather than a relaxation of the rule.
- Reach for a cloned `Arc` instead of a borrow when a thread needs to outlive the function that spawned it, and explain why an owned value satisfies `'static` for free.
- Explain, with `mem::forget` as the concrete mechanism, why there is no sound scoped spawn for async tasks.

</section>

<section data-section="internals">

## Internals: why threads need `'static` and async can't get a scope

Everything here was run with rustc 1.97.0 (2d8144b78 2026-07-07) on x86_64 Linux, edition 2024, in `examples.py`.

`thread::spawn`'s own documentation states the bound directly: the closure and its return value need `F: Send + 'static`, "because threads can outlive the lifetime they have been created in" — and since the caller can't know when a detached thread will finish, the only safe choice is to require its captured data to stay valid for as long as possible, which is the rest of the program. `examples/spawn_borrow_fail.rs` reproduces the resulting failure directly: a closure that merely borrows a local `count` is rejected with `E0373`, naming the exact problem ("closure may outlive the current function, but it borrows `count`, which is owned by the current function").

`thread::scope` does not weaken this rule; it changes which facts are true. Its own documentation is explicit: "scoped threads can borrow non-'static data, as the scope guarantees all threads will be joined at the end of the scope," and "all threads spawned within the scope that haven't been manually joined will be automatically joined before this function returns." `examples/scope_borrow_ok.rs` spawns the identical closure that failed a moment earlier, now inside `thread::scope(|s| ...)`, and it compiles and runs: the borrow of `count` really does outlive the scoped thread, because `scope()` itself cannot return until that thread has already finished.

When a thread genuinely needs to outlive the function that spawned it, no scope can help, because the scope's own call has to still be running. `examples/arc_move_ok.rs` shows the other fix: clone an `Arc<Mutex<i32>>` and move the clone into a plain `thread::spawn`. The closure captures the `Arc` by value, not by reference, so it contains no borrow at all — `'static` was true of it before `thread::spawn` was ever called, because the bound asks what a value owns, not when the function around it returns.

`tokio::task::spawn` asks for the identical shape of bound (`F: Future + Send + 'static`), for a related but distinct reason: its own docs state that "there is no guarantee that a spawned task will execute to completion," since "when a runtime is shutdown, all outstanding tasks are dropped, regardless of the lifecycle of that task." A `thread::scope`-style guarantee for async would need some value — a guard — whose `Drop` fires only once its task is truly finished. `std::mem::forget`'s own documentation is the fact that breaks this: forgetting a value is "not marked as unsafe, because Rust's safety guarantees do not include a guarantee that destructors will always run." `examples/forget_defeats_guard.rs` builds exactly such a guard, whose `Drop` prints `joined`, then calls `mem::forget` on it from completely ordinary code: no `joined` line ever appears. Any `Drop`-based join guarantee can be defeated this way, which is the concrete reason async has no sound scoped spawn.

</section>

<section data-section="lab">

## Lab: build, break, measure

Every claim below is asserted in `examples.py`, which compiles and runs `examples/*.rs` fresh each time.

- `spawn_borrow_fail.rs`: compiled and asserted to fail with `error[E0373]` naming `count` as borrowed by a closure that may outlive the current function.
- `scope_borrow_ok.rs`: compiled, run, and asserted to print the borrowed value from inside the scoped thread and again from the caller after `scope()` returns.
- `arc_move_ok.rs`: a cloned `Arc<Mutex<i32>>` moved into a plain `thread::spawn` from a function that returns immediately; compiled, run, and asserted to print the incremented value.
- `forget_defeats_guard.rs`: a `Drop` guard that prints `joined`, forgotten with `mem::forget`; compiled, run, and asserted that no `joined` line appears in the output.

</section>

<section data-section="production">

## Production failures

The most common real mistake here is reaching for `unsafe` (or giving up and cloning everything) the moment `thread::spawn` rejects a borrowed closure, instead of asking the actual question: does this thread need to outlive the function that spawns it, or not? If it doesn't, `thread::scope` gets you the borrow back for free, with no cost beyond structuring the spawn inside the scope's closure. If it does — a thread pool worker, a background task kept alive past the function that started it — then a scope genuinely cannot help, and the fix is ownership: clone an `Arc`, or move owned data in directly.

A second real failure is treating `tokio::spawn`'s `'static` bound as a formality to satisfy with `.clone()` calls scattered until it compiles, without noticing that a spawned task can simply be dropped wholesale on shutdown regardless of what it was doing. Code that assumes a spawned task will always finish and run its own cleanup is relying on a guarantee tokio's own documentation explicitly does not make.

</section>

<section data-section="frontier">

## Frontier

Scoped async spawning is an active area of library design, not an unsolved theoretical problem: crates built on top of `async-scoped`-style designs exist, but they all have to fall back to `unsafe` somewhere, because the soundness gap this topic demonstrates with `mem::forget` is real and has to be patched rather than argued around. `async-std`'s and `moro`'s approaches differ in exactly where they accept that risk. None of this changes the two sound, `unsafe`-free tools this topic actually teaches: `thread::scope` for borrows that don't need to outlive the spawning function, and owned or reference-counted data for borrows that do.

</section>

<section data-section="next">

## Where this goes next

Every borrow this entire chapter studied lived inside the memory layout a single function's own stack describes, whether it stayed on one thread or crossed into another. Chapter 3 leaves that picture behind: a trait object erases a concrete type behind a pointer and a vtable, a generic function gets a fresh compiled copy per type it's used with, and choosing between those two strategies is a cost decision the borrow checker has nothing to say about.

</section>
