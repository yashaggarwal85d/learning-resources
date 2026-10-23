---
title: "Tasks multiplexed on worker threads"
---

## Outcomes

- State precisely why a task is not a thread: it is a lightweight state machine multiplexed onto a small, fixed pool of real worker threads, and a task that blocks its worker without yielding stalls every other task scheduled there — demonstrated with a real, measured delay.
- Choose between the current-thread and multi-thread runtimes as a workload-shape decision: a multi-thread runtime spawns its own fixed worker pool and is always running; a current-thread runtime has none and only runs while `Runtime::block_on` drives it.
- Explain why `tokio::spawn` requires its future to be `Send`, and use `LocalSet` with `spawn_local` to run the exact `!Send` future `tokio::spawn` refuses, on the one thread that calls it.

## Internals

The measured stall in this topic uses a single-worker runtime deliberately, to make the delay deterministic rather than probabilistic: with only one worker thread, a trivial task spawned right behind a non-yielding blocking call has no other worker to run on at all, so the measured wait is the full length of the blocking call, not a fraction of it. The timing is captured inside the trivial task itself — an `Instant` recorded at the moment it was created, compared against the moment it actually starts executing — rather than from outside, because that is the only way to isolate pure scheduling delay from any other latency in the harness. `LocalSet`'s fix for the `!Send` case is not a relaxation of `tokio::spawn`'s rule: it is a different scheduling guarantee entirely. `tokio::spawn`'s `Send` bound exists because a multi-threaded runtime's scheduler may move a task to a different worker thread at any suspension point; `LocalSet` sidesteps the question by guaranteeing every task it runs stays on the one thread that drives it, so there is never a cross-thread move for a `!Send` value to be unsound across.

## In production

The choice between runtimes is a real, consequential decision many real services get right by default (most async Rust server code is naturally multi-threaded) and get wrong by habit when a workload is genuinely single-threaded — a CLI tool, a single-connection proxy, or any program driven by `LocalSet` for a `!Send`-only dependency gains nothing from the multi-thread runtime's extra worker threads and cross-thread synchronization, and pays for them anyway. `LocalSet` itself is the standard, real answer for bringing a library built around `Rc`, `RefCell`, or a non-thread-safe FFI handle into an otherwise async codebase — typically isolated on its own dedicated current-thread runtime, rather than mixed directly into a multi-thread one, so the rest of the program is never accidentally constrained by it.

## The frontier

This topic deliberately isolates the worker-stall failure mode on its own, before any of this chapter's fixes exist yet, because every later topic's fix only makes sense against this exact baseline: `spawn_blocking` (topic 30) exists specifically to move a blocking call like this one's off the cooperative worker pool entirely, and cooperative budgeting (topic 29) only helps a task that has a yield point to be forced back to at all — a task doing a real, synchronous `std::thread::sleep` or any other blocking syscall has no such point, so no scheduling mechanism in this chapter can rescue it after the fact.

## Where this goes next

A blocked worker stalls its own queue completely — but even an unblocked one has to decide, task by task, what runs next and where a newly-woken task actually goes. That decision has real, documented mechanics, not just a queue.
