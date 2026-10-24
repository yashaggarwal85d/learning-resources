---
title: "Processes, signals, and environment safety"
---

## Outcomes

- Measure `std::process::Command` genuinely forking and exec'ing a separate, real child process, with its own distinct pid and its own real, observed exit status.
- Measure a real `fork()` in a multithreaded process creating a child with exactly one thread, no matter how many the parent had running — and name why only async-signal-safe operations are permitted in that child before it calls `exec`.
- Measure a pidfd acting as a stable reference to one specific process: sending through it succeeds while that exact process is alive, and fails with `ESRCH` once it is genuinely gone — never silently reaching some other process that reused its old pid.
- Name why Rust 2024 made `std::env::set_var` `unsafe`: the environment is shared, process-global mutable state that C's own `getenv` reads without synchronization.

## Internals

The single-thread guarantee measured in this topic is not merely a fact about `fork`'s implementation; it is the entire reason the async-signal-safe restriction exists at all. A lock another thread held at `fork` time belongs to a thread that, in the child, has no way to ever release it, because it was never duplicated — only the calling thread was. The thread-count measurement itself deliberately reads `/proc` from the parent about the child's real pid, never from inside the forked child itself, precisely because doing anything beyond the async-signal-safe set inside that window is exactly the hazard this topic is teaching, not something to risk for a cleaner measurement. The pidfd measurement specifically waits on and reaps the child before testing the post-exit case, because `pidfd_send_signal`'s own documented `ESRCH` condition is defined as the process having both terminated and been waited on — testing against an unreaped zombie would not exercise the same guarantee.

## In production

The race `pidfd_send_signal` avoids is not hypothetical or rare under load: PID numbers are reused as soon as the kernel's pid counter wraps back around to a value that has already exited, which happens constantly on a busy, long-running system that spawns and reaps many short-lived processes. `set_var`'s own race is specifically with reads of the environment that go through C's `getenv`, not with Rust's own `std::env::var` — `std::env::var` takes an internal lock that `set_var` also takes, so the actually dangerous case is exactly the C library call that std cannot see or coordinate with. The asymmetry between Windows and other platforms in `set_var`'s own safety section is not an afterthought: Windows actually provides a thread-safe way to access the per-process environment block, while POSIX genuinely does not, which is why the same function is unconditionally sound on one platform and conditionally unsound on the other.

## The frontier

All three of this topic's measured behaviors are instances of exactly one idea: correctness requires knowing precisely what else in the system might touch the same resource at the same moment — a lock across `fork`, a pid number across process lifetimes, an environment variable across threads — and each mechanism this topic covers exists to make that moment explicit rather than assumed. This topic deliberately leaves `tokio::signal` and `signal-hook`'s own async-specific integration out of its executed examples, since that material is where Chapter 9's io-driver-readiness topic already placed tokio's own signal-delivery mechanism; this topic's job is the process, pidfd, and environment claims specifically. Together with topic 36, this topic fully discharges the gap Chapter 10's own handoff named: every kernel handle a task implicitly held across that chapter's shutdown sequences — file descriptors, process identity, signal delivery — now has a measured, documented ownership and safety story at the Rust level.

## Where this goes next

A process's file descriptors and its signals are both kernel handles this chapter made explicit. Its memory is a kernel handle too — just one so heavily abstracted by the virtual memory system that most code never has to think of it as one at all, until it's mapped directly.
