---
title: "Arc shares, Mutex synchronizes"
---

## Outcomes

- State `Arc`'s one job (shared ownership) and `Mutex`/`RwLock`'s separate job (synchronized access), and explain why `Arc` alone never makes mutation safe.
- Explain `std::sync::Mutex`'s poisoning strategy and why `parking_lot::Mutex` makes the opposite design choice on purpose.
- State when `tokio::sync::Mutex` is actually needed (holding a lock across an `.await`) and recognize the real compile failure a `std` guard held across `.await` produces inside a spawned task.

## Internals

`std::sync::Mutex` is not, on current Linux targets, a thin wrapper around a C library mutex. Its real source (`std::sys::sync::mutex::futex`) is a single futex-sized word with three states — `UNLOCKED`, `LOCKED`, and `CONTENDED` — and `lock()`'s fast path is one `compare_exchange`; only the contended path falls back to the kernel's `futex_wait`/`futex_wake` syscalls to actually block. This is why an uncontended lock/unlock pair is cheap: the fast path never leaves userspace at all, and the kernel is only asked to get involved once there's genuine contention to resolve.

`parking_lot::Mutex` takes a different structural approach: its own documentation states it needs "only 1 byte of lock state," against std's full futex-sized word, and layers its own userspace parking queue (`parking_lot_core`) on top rather than going straight to the kernel's futex on every contended wait. The two designs optimize for different things — std's for being the obvious, zero-dependency default with a built-in safety net (poisoning); `parking_lot`'s for being smaller and avoiding poisoning's overhead and ergonomics entirely.

## Lab

The chapter's lab line asks for a concurrent counter built three ways (`Mutex`, atomics, an owner task via channel), compared at several worker counts. Topic 18 already built this topic's identical `Arc<Mutex<u64>>` shape (four real workers landing on an exact count); this topic makes explicit what that demo was actually proving — that `Arc` and `Mutex` were doing two separate, separable jobs the whole time. The atomics leg remains Chapter 7's; the owner-task leg remains topic 21's.

## In production

The three-way choice this topic draws out — `std::sync::Mutex`, `parking_lot::Mutex`, `tokio::sync::Mutex` — maps directly onto a decision real Rust codebases make constantly: reach for `std`'s `Mutex` by default, since it needs no dependency and its poisoning is a genuine safety net against silently trusting data a panic may have corrupted; escalate to `parking_lot` only once profiling shows real lock contention cost that its smaller, faster implementation measurably improves, accepting the loss of poisoning deliberately; and reach for `tokio::sync::Mutex` only for the one case neither of the other two can do at all — genuinely holding a lock across an `.await`. A common real bug is skipping straight to `tokio::sync::Mutex` out of habit in async code where the protected value is plain data accessed only inside non-async methods, paying its extra cost for a capability the code never actually uses.

## The frontier

`Mutex::clear_poison` (stabilized) lets a caller deliberately un-poison a lock once they've verified by other means that the panic didn't actually leave the protected data in a broken state — a narrow, explicit escape hatch rather than a blanket override. More broadly, whether poisoning is worth its ergonomic cost (the `Result` every `lock()` call returns, usually just `.unwrap()`-ed away) remains a live, unsettled design debate in the Rust ecosystem, visible in how widely `parking_lot` is used specifically to opt out of it.

## Where this goes next

The lock now has exactly one well-defined job: synchronizing access to a few memory operations. The next question is what happens the moment something that isn't a memory operation — a slow external call — ends up inside it.
