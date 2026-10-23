# Outline: Explicit ownership-crossing points (`rust.explicit-ownership-crossing-points`)

Chapter 6, topic 21 (last of the chapter). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Name the only four places ownership of a value actually changes which thread owns it: `thread::spawn`, `thread::scope`, `tokio::spawn(async move { .. })`, and a channel send — and nowhere else.
2. Explain why `thread::spawn` needs `Send + 'static` (ownership moves, and the new thread can outlive the caller), and why `thread::scope` can relax that to a borrow (the scope's own join guarantee).
3. State that `std::sync::mpsc`'s real implementation is a port of the `crossbeam-channel` crate, not a bespoke one — a deliberate design choice to reuse a well-tested algorithm rather than one built from scratch.

## Reel steps (storyboard)

1. **"Four places, and only four, change which thread owns a value"** — hook. `fig`: the four crossing points named directly: `thread::spawn`, `thread::scope`, `tokio::spawn`, a channel send.
2. **"Move a String into a new thread — does the caller still have it after?"** (predict) — `fig`: a String, a spawn call, the caller's own variable afterward. Options: yes, Rust clones it / no, ownership moved for good (correct) / only if `.clone()` was forgotten.
3. **"Moved for good: the new thread owns it, the caller can't"** — `fig`: `examples/thread_spawn_owns.rs`, real measured length (27). NO takeaway (first non-predict step after a predict step).
4. **"Try to only borrow, not move, into a plain spawn"** — `fig`: the same shape, but the closure borrows instead of moving. `examples/thread_spawn_borrow_fails.rs`'s real compiler error: `closure may outlive the current function`. Takeaway: "A plain `thread::spawn` needs `Send + 'static`: the closure must own what it touches, because the new thread may outlive the function that spawned it."
5. **"`thread::scope` makes the identical borrow sound"** — `fig`: the same borrow, now inside `thread::scope`. `examples/thread_scope_borrows.rs`, real measured sum (60). Takeaway: "`thread::scope` can relax `'static` because it guarantees every spawned thread joins before the scope itself returns."
6. **"`tokio::spawn` asks for the identical `Send + 'static` contract"** (predict) — `fig`: an async task, the same two bounds on a `Future` this time. Predict: does a non-`Send` future compile inside `tokio::spawn`? Options: yes, tasks are single-threaded by default / no, the identical bound applies (correct) / only on a multi-thread runtime.
7. **"Same contract, same reason: the runtime may move the task to another thread"** — `fig`: `examples/src/bin/tokio_spawn_owns.rs`, real measured length (29), and the docs' own words on why. Takeaway: "`tokio::spawn`'s `Send + 'static` bound exists for the same reason `thread::spawn`'s does: the runtime, not the caller, decides which thread actually runs the task."
8. **"A channel send is the fourth crossing point"** — `fig`: two producer threads, one channel, one receiver. `examples/mpsc_send_moves.rs`, real measured count (2). Takeaway: "Sending a value through a channel moves its ownership from the sender's thread to whichever thread eventually calls `recv`."
9. **"That channel's own implementation is borrowed, not built from scratch"** — `fig`: the real source comment naming `crossbeam-channel` as the implementation `std::sync::mpsc` is ported from. Takeaway: "`std::sync::mpsc` is a real port of the `crossbeam-channel` crate's algorithm — reusing a proven design, not reinventing one."
10. **Recap** — four crossing points, no more, no fewer: `thread::spawn`, `thread::scope`, `tokio::spawn`, a channel send; `thread::spawn`/`tokio::spawn` need `Send + 'static`, `thread::scope` trades that for a join guarantee, and `mpsc`'s own channel is a crossbeam port. Handoff: chapter 7 opens with atomics — ordering, not just synchronizing, becomes the question.

## Engagement arc

- Hook: step 1.
- Early prediction: step 2 (within the first four).
- Second prediction: step 6.
- Surprising fact: step 9's real source-code attribution (std's own channel is someone else's algorithm, ported in).
- Takeaways: steps 4, 5, 7, 8, 9 (five — step 3 deliberately has none, the test-harness rule).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| `thread::spawn`'s closure needs `'static` because the new thread may outlive the function that spawned it, and `Send` because ownership moves across the thread boundary | `doc.rust-lang.org/std/thread/fn.spawn.html` (quoted) + `examples/thread_spawn_owns.rs` (executed) |
| Borrowing non-`'static` data in a plain `thread::spawn` is a real compile error (`E0373`, "closure may outlive the current function") | `examples/thread_spawn_borrow_fails.rs` (executed, the real rustc diagnostic captured) |
| `thread::scope` lets scoped threads borrow non-`'static` data because the scope itself guarantees every thread joins before it returns | `doc.rust-lang.org/std/thread/fn.scope.html` (quoted) + `examples/thread_scope_borrows.rs` (executed) |
| `tokio::spawn` requires the identical `Send + 'static` bound, now on a `Future`, because the runtime decides which thread actually runs the task | `docs.rs/tokio/latest/tokio/task/fn.spawn.html` (quoted) + `examples/src/bin/tokio_spawn_owns.rs` (executed via cargo) |
| `std::sync::mpsc` is multi-producer, single-consumer; sending a value moves its ownership from sender to receiver | `doc.rust-lang.org/std/sync/mpsc/index.html` (quoted) + `examples/mpsc_send_moves.rs` (executed) |
| `std::sync::mpsc`'s real channel implementation is a direct port of the `crossbeam-channel` crate, per the standard library's own source comment | `doc.rust-lang.org/src/std/sync/mpmc/mod.rs.html` (quoted, the real source file) |

## Concept ledger

- `introduces`: `ownership-crossing-points`, `thread-scope-borrowing`, `mpsc-crossbeam-internals`
- `uses`: `send-auto-trait`, `arc-shares-only`, `critical-section-io-latency`
- `declared`: `threads-and-channels`

## Bridge and handoff

- Bridge: "None of this — lock ordering, convoys, inversion — is something the type system checks. The next question is what changes when the threads doing the sharing stop sharing state at all, and pass messages instead."
- Handoff: "Four places, and that's the whole list: a value's ownership only ever crosses a thread boundary at a spawn or a send. Chapter 7 asks a different question about the same threads — not who owns what, but what order their operations actually happen in."
