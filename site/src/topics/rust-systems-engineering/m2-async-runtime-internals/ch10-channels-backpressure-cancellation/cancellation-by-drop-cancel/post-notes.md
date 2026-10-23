---
title: "Cancellation by drop and cancel safety"
---

## Outcomes

- Measure `select!` genuinely dropping its losing branch's future: the loser's own side effect never runs, even long after its own delay would have elapsed.
- Measure `mpsc::Receiver::recv` being genuinely cancel-safe: cancelling it via `select!` loses no message, and a fresh `recv()` afterward gets exactly what was sent.
- Measure `read_exact` being genuinely not cancel-safe: cancelling it mid-read loses the bytes it had already consumed, which a fresh read can never recover.
- Measure dropping a `JoinHandle` detaching its task rather than cancelling it: the task keeps running on the runtime, unobserved, with nothing left to join on.

## Internals

Cancellation in async Rust has exactly one real mechanism: dropping a future at whatever `.await` point it's currently paused at. That's the whole story — there's no separate "cancel" signal, no cooperative check a future has to opt into. What varies entirely is the consequence, and that consequence is decided by what the future was holding onto at the moment it's dropped. `recv`'s cancel safety isn't an implementation accident; it holds because `recv` has no partial state to lose — it either hasn't yet observed a message or it has fully received one, with no in-between moment a drop could catch it at. `read_exact`'s unsafety is the opposite case, and it's structural rather than incidental: because it must fill an exact byte count, it necessarily has partial progress whenever fewer bytes than that have arrived so far, and that partial progress lives only inside the future being dropped. There is no async drop in Rust — `Drop` cannot run asynchronous cleanup — which is exactly why `read_exact` has no way to hand its partially-filled buffer back anywhere once cancelled: by the time `drop` runs, there's no way to `await` anything to save what was already read.

## In production

A `JoinHandle` is deliberately not a cancel-on-drop guard, unlike many other Rust types that clean up their resource when dropped. A background task is often meant to keep running independent of whoever spawned it, and detaching rather than cancelling is the documented default specifically so that dropping a handle you no longer need doesn't silently kill unrelated work. This is exactly the gap `abort`, `JoinSet`, and `AbortHandle` exist to close — none of them are needed to keep a task alive after its handle is gone, because that already happens automatically; they exist for the opposite case, when a caller genuinely wants the task stopped.

## The frontier

This topic deliberately proves both halves of the cancellation rule Chapter 9 named but didn't prove: a drop is the real mechanism, and cancel safety is the real property deciding whether that drop is free or costly. `select!` in a loop depends on exactly this property for every branch it races — a cancel-unsafe operation used that way would intermittently and silently lose data depending on timing, which is why the ecosystem documents this list explicitly rather than leaving it to be discovered in production.

## Where this goes next

Backpressure and cancellation are both real, local mechanisms — true of one channel, one future, one task at a time. Turning them into a shutdown a whole service can trust means making the sequence explicit, not assuming every task will notice on its own.
