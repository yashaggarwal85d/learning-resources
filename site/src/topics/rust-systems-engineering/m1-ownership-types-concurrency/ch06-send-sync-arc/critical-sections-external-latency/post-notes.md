---
title: "Critical sections and external latency"
---

## Outcomes

- State the rule precisely: never do I/O inside a critical section, because the lock then serializes the external call's latency, not just the memory access it was meant to protect — and predict, then measure, the slowdown.
- Explain lock ordering as the fix for a two-lock deadlock, and tell a deadlock apart from a lock convoy: both threads still make progress in a convoy, neither does in a deadlock.
- Name priority inversion and its fix, priority inheritance, and say why it is a performance and liveness problem, not a memory-safety one — Rust's type system has nothing to say about lock ordering, convoys, or inversion.

## Internals

The measured numbers in this topic come from the simplest possible version of the mistake and its fix: four threads, one `Arc<Mutex<u32>>`, and a `thread::sleep` standing in for a slow network call. Holding the lock across that sleep forces every thread through the critical section one at a time, so the wall-clock time is close to the sum of all four sleeps rather than the length of just one. Moving the identical sleep before `lock()` is taken changes nothing about what the lock protects — it still protects the one memory write — but removes the lock from the critical path of the slow part entirely, and the four sleeps now overlap freely.

The deadlock example is deliberately built to be provable, not just plausible: two `Mutex`es, two threads acquiring them in opposite order, with a short sleep inserted between the first and second acquisition in each thread to guarantee both threads are genuinely waiting rather than racing past each other. `examples.py` runs the compiled binary under a three-second subprocess timeout and treats `TimeoutExpired` as success — the only way a Rust program can produce that exact observable behavior is if it is still blocked waiting on a lock that will never be released, which is exactly what a circular wait produces.

## In production

Real codebases that hold a lock across a slow operation usually didn't do it on purpose — it tends to arrive by accretion, when a function that happens to be called while a lock is held grows a new network call or a new database query over time, long after the original lock was taken for an unrelated, fast reason. The fix this topic demonstrates (move the slow call outside the critical section, or spawn a dedicated task and message-pass to it, per `tokio::sync::Mutex`'s own documented recommendation) is the same fix either way: shrink the critical section down to just the memory operation it actually needs to protect. Lock ordering is the standard real-world defense against the two-lock deadlock shown here, usually enforced by convention (acquire in a fixed, documented order everywhere) rather than by any language-level check, which is exactly why tools like the Linux kernel's lockdep validator exist: to catch an inconsistent order automatically, at runtime, across every code path a real program actually exercises.

## The frontier

Lock convoys and priority inversion are real, well-documented failure modes — this topic quotes Wikipedia's own definition of a lock convoy and the Linux kernel's own rt-mutex documentation on priority inheritance directly — but neither is independently reproduced here. Demonstrating a lock convoy's repeated forced context switches, or measuring priority inheritance actually boosting a thread's scheduling priority, needs real control over OS scheduler behavior (thread priorities, run queues) that this sandbox doesn't expose reliably enough to measure and assert on. The claims stand on their primary sources alone, scoped down deliberately rather than illustrated with a fabricated local measurement.

## Where this goes next

None of this — lock ordering, convoys, inversion — is something the type system checks. The next topic asks what changes when the threads doing the sharing stop sharing state at all, and pass messages instead.
