---
title: "Explicit ownership-crossing points"
---

## Outcomes

- Name the only four places ownership of a value changes which thread owns it: `thread::spawn`, `thread::scope`, `tokio::spawn`, and a channel send — and nowhere else.
- Explain why `thread::spawn` needs `Send + 'static` (ownership moves, and the new thread can outlive the caller), and why `thread::scope` can relax that to a borrow, because of its own join guarantee.
- State that `std::sync::mpsc`'s real implementation is a port of the `crossbeam-channel` crate, a deliberate choice to reuse a proven algorithm rather than build a new one.

## Internals

`std::sync::mpsc` has not been a hand-rolled channel for some time: its real backing module (`std::sync::mpmc`, used internally) states directly in its own source comment that the implementation is a port of the `crossbeam-channel` crate — the same channel algorithm widely used as an external dependency, now also shipped inside the standard library itself. This is a common and healthy pattern in systems software: rather than maintaining two subtly different channel implementations with two different sets of bugs, the standard library adopted the externally-proven one. The user-facing API (`channel()`, `Sender`, `Receiver`, `.send()`, `.recv()`) stayed the same; what changed underneath it did not.

The four ownership-crossing points share a structural similarity worth noticing: three of them (`thread::spawn`, `tokio::spawn`, and `thread::scope`'s scoped spawn) are all, at bottom, "hand this closure or future to code that will run it elsewhere," and the fourth (a channel send) is "hand this value to code that will receive it elsewhere." In every case, the type system's job is the same: make sure nothing the sending side still thinks it can touch is actually reachable from there anymore.

## In production

Real async codebases run into the `tokio::spawn` boundary constantly: a value that's perfectly fine to use in an `async fn` directly (an `Rc`, a `RefCell`, a borrowed reference) often can't cross into a `tokio::spawn`'d task, because the task needs to be `Send` to move between worker threads. The fix is almost always the same shape shown in this topic: either restructure so the task owns what it needs (clone an `Arc` instead of sharing an `Rc`, move data in with `async move` instead of borrowing it), or use `thread::scope` (for synchronous work that can stay on one set of threads for a bounded lifetime) instead of a true `spawn`. Picking the wrong one of the four crossing points for a given job — reaching for a full `tokio::spawn` when a `thread::scope` would do, or vice versa — is a common, real source of either unnecessary `Arc`/`clone()` overhead or unnecessary `'static` contortions.

## The frontier

Scoped threads (`thread::scope`) are a relatively recent stabilization (Rust 1.63, 2022) compared to `thread::spawn`, which has existed since 1.0 — for years, borrowing non-`'static` data into a spawned thread required `unsafe` or a crate like `crossbeam` providing its own scoped-thread API, which is part of why `crossbeam-channel`'s algorithm was mature enough to be worth porting into `std` by the time that happened. An async equivalent of `thread::scope` — scoped `tokio::spawn` with a compiler-enforced join guarantee — remains an open design question in the async ecosystem rather than something `tokio` itself provides directly, because an async task's actual lifetime is harder for the type system to pin down than a synchronous thread's.

## Where this goes next

Four places, and that's the whole list: a value's ownership only ever crosses a thread boundary at a spawn or a send. Chapter 7 asks a different question about the same threads — not who owns what, but what order their operations actually happen in.
