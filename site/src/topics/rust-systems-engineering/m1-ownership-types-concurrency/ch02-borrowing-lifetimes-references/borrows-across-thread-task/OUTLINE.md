# Outline: Borrows across thread and task boundaries (`rust.borrows-across-thread-task`)

Chapter 2, topic 8 (last of the chapter). Single `/make-topic` session, 2026-10-22.

## Learning outcomes

1. State why `thread::spawn` requires `F: Send + 'static` (the spawned thread can outlive the caller's stack frame) and reproduce the real compile failure when a closure borrows a local.
2. Use `std::thread::scope` to let spawned threads borrow non-`'static` data, and explain why that is sound: the scope's own call does not return until every scoped thread has joined.
3. Know that moving an owned `Arc<T>` (cloned before `spawn`) is the fix when a thread must outlive the function that spawned it, and why an owned `Arc` trivially satisfies `'static`.
4. Explain why there is no sound scoped spawn in async: `std::mem::forget` lets safe code skip any destructor, so a guard a hypothetical async scope relied on to enforce "wait for every task" can be forgotten, breaking the guarantee `thread::scope` gets for free from the OS actually running and joining real threads.

## Reel steps (storyboard)

1. **"A thread can outlive the frame that made it"** — `fig`: the stack-frame vs. thread timeline. `thread::spawn`'s own signature: `F: Send + 'static`. Takeaway: "`'static` on a spawned closure is enforced because the new thread's lifetime is not bounded by the caller's stack frame."
2. **"Borrow a local, then spawn"** (predict) — `fig`: the closure borrowing `count` by reference. Predict: does `thread::spawn(|| println!("{count}"))` compile when `count` is a local `i32`? Correct: no.
3. **"The compiler's own reason"** — `fig`: the real `rustc` error on `examples/spawn_borrow_fail.rs`, read in full (closure may outlive the current function, `count` is borrowed here). No takeaway (this is the test's "from" step — kept plain on purpose).
4. **"`thread::scope` makes the same borrow sound"** — `fig`: the identical borrow, now inside `thread::scope`. Takeaway: "`thread::scope` doesn't relax the rule; it changes what's true: the call itself does not return until every scoped thread has joined, so the borrow really does outlive the thread."
5. **"Needs to outlive the function? Clone an `Arc` instead"** (predict) — `fig`: `Arc::clone` before `spawn`. Predict: does moving a cloned `Arc<Mutex<i32>>` into `thread::spawn` (no scope) compile, when the thread must run past the end of the function? Correct: yes.
6. **"An owned `Arc` already satisfies `'static`"** — `fig`: refcount bump. Takeaway: "`'static` is a statement about what a value owns, not about never returning; a moved, owned `Arc` has no borrow inside it, so the bound is free."
7. **"`tokio::spawn` asks for the identical bound, for a different reason"** — `fig`: `tokio::task::spawn`'s own signature, `Future + Send + 'static`. No predict, no takeaway — sets up the next two steps.
8. **"Could a scoped async spawn ever be sound?"** (predict) — `fig`: a hypothetical `async_scope` guarding a spawned task with a `Drop` guard. Predict: can safe code defeat that guard? Correct: yes, with `std::mem::forget`.
9. **"`mem::forget` is exactly the hole"** — `fig`: `mem::forget(guard)`, compiled and run. Takeaway: "`mem::forget` is 100% safe and lets any code skip a destructor; a `Drop`-based join guarantee can always be forgotten, so there is no sound borrow-based scope for spawned futures — only owned data or a reference-counted share."
10. **Recap** — `thread::spawn` needs `'static` because the thread outlives the frame; `thread::scope` makes borrowing sound by actually joining before it returns; an owned `Arc` satisfies `'static` for free; `tokio::spawn` needs the same bound but has no sound scoped equivalent, because `mem::forget` can always defeat a `Drop`-based join guarantee. Handoff to Chapter 3.

## Engagement arc

- Hook: step 1, the stack-frame/thread timeline.
- Early predictions: step 2 (within the first four).
- Further predictions: step 5, step 8 (the real surprise of the whole topic).
- Takeaways: steps 1, 4, 6, 9 (four) — step 3 (the test's "from" step) and step 7 (a pure setup step) deliberately carry none.
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| `thread::spawn<F, T>` requires `F: FnOnce() -> T + Send + 'static, T: Send + 'static`, because the new thread can outlive its caller | `std-thread-spawn` + `examples/spawn_borrow_fail.rs` (executed, rejected) |
| `thread::scope` lets scoped threads borrow non-`'static` data because the scope guarantees every thread is joined before the call returns | `std-thread-scope` + `examples/scope_borrow_ok.rs` (executed, compiles and runs) |
| A cloned, owned `Arc<T>` moved into `thread::spawn` satisfies `'static` trivially and can run past the spawning function's return | `std-thread-spawn` + `examples/arc_move_ok.rs` (executed) |
| `tokio::task::spawn` requires the identical `Future + Send + 'static` bound; a spawned task has no guaranteed completion (dropped wholesale on runtime shutdown, "regardless of the lifecycle of that task") | `tokio-spawn` |
| `std::mem::forget` is safe to call on any value and skips its destructor outright; "leaking resources ... is usually undesirable" but never unsafe | `std-mem-forget` + `examples/forget_defeats_guard.rs` (executed) |

## Concept ledger

- `introduces`: `spawn-requires-static`, `thread-scope-join-guarantee`, `arc-satisfies-static`, `no-sound-async-scope`
- `uses`: `ownership-signatures`, `lifetime-as-constraint`, `rc-arc-refcount`
- `declared`: `references-basics`, `threads-and-channels`, `mutexes`, `std-collections`

## Bridge and handoff

- Bridge: topic 7's own handoff, reused verbatim: "Every one of these views lived on a single thread. Next: what a thread::spawn or tokio::spawn actually requires of a borrow that wants to cross into another task."
- Handoff: "Every borrow this chapter studied lived inside one function's own stack. Chapter 3 leaves that world entirely: a trait object, a generic function monomorphized per type, and the cost of choosing between them, none of which the borrow checker had to say anything about."
