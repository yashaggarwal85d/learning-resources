---
title: "Futures, Poll, and the Waker contract"
---

## Outcomes

- Explain why constructing a future does no work at all, and why that laziness is itself a form of backpressure rather than an accident of the design.
- State the `Poll::Pending` contract precisely: a pending future must arrange for its `Waker` to be called, or it may never be polled again — and show a future that breaks this contract hanging for real.
- Describe the actual architecture — future → waker → scheduler → poll — with no hidden thread anywhere in it, built and run as a real, working loop.

## Internals

Proving a genuine hang honestly, rather than merely asserting one, requires the opposite move from most of this course's examples: instead of waiting for a correct result, `examples.py` runs the contract-breaking binary under a deliberately short timeout and asserts that the process is *still running* when that timeout expires — `subprocess.TimeoutExpired` is the expected, successful outcome, and a clean exit would be the test failure. This mirrors exactly what would happen in production: there is no way to distinguish "a future that will eventually be woken, just not yet" from "a future that will never be woken" by waiting, because both look identical from the outside until the deadline you chose to stop waiting. The only way to actually show the contract is load-bearing is to construct a future that violates it on purpose and watch the executor have no path left to recover.

## In production

Every real async runtime — Tokio chief among them, the subject of the next chapter — is built from exactly this shape at a larger scale: a runnable-task queue, a `Waker` implementation (frequently, as here, backed by `Arc` and `std::task::Wake`), and a loop that calls `poll` only when something has actually re-enqueued a task. The bug this topic demonstrates on purpose — a future that returns `Pending` and never arranges a wakeup — is a real, documented class of production incident in async Rust: a future wrapping a raw FFI callback, or a hand-rolled synchronization primitive, that fails to store or invoke the `Waker` correctly produces a task that silently stops making progress forever, with no panic, no error, and no log line, because nothing in the model requires one.

## The frontier

This topic's executor is deliberately minimal — single-threaded, with no I/O driver, no timer wheel, and no fairness guarantees across many competing tasks — specifically so the future/waker/poll contract itself stays visible, uncomplicated by any particular production runtime's scheduling policy. Real schedulers add substantial machinery on top of this exact loop (work-stealing across worker threads, I/O readiness notification via epoll/io_uring, cooperative yielding to prevent one task from starving others), none of which changes the contract this topic proves, only how efficiently and fairly it gets executed at scale — the next three chapters build toward exactly that machinery.

## Where this goes next

A future that does nothing until polled, and a waker that promises to ask again — that's the whole contract, proven by a loop with no hidden thread in it anywhere. The next question is what the compiler actually builds when it turns ordinary-looking `async` code into exactly this shape.
