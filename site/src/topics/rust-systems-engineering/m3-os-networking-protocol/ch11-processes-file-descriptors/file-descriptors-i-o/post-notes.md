---
title: "File descriptors and I/O safety"
---

## Outcomes

- Measure two file descriptors that refer to the same open file description — one obtained by a real `dup(2)` call — genuinely sharing that description's own read offset.
- Measure `OwnedFd` genuinely closing its file descriptor on `Drop`, while a `BorrowedFd` taken from a different, still-owned `File` remains completely valid.
- Measure `std::fs::File` opening with `O_CLOEXEC` set by default, so it does not leak across a real fork+exec, while a file descriptor with that flag explicitly cleared leaks straight into the child.
- Name `RLIMIT_NOFILE` as the real, enforced ceiling on how many of these handles one process may hold open at once.

## Internals

The shared offset measured here is not an implementation detail that happens to be true today; it follows directly from what `dup()` actually duplicates — a reference to the kernel's own open file description, not a fresh one — which is exactly why two reads split cleanly across the file instead of each starting from zero. `OwnedFd`'s own guarantee is narrower than "the fd is freed": it specifically guarantees that nobody else will close it while it's alive, which is the actual soundness property `BorrowedFd`'s lifetime depends on. If `OwnedFd` could be closed from elsewhere, a `BorrowedFd` derived from it could silently start pointing at nothing. The `EBADF` measured when a dropped `OwnedFd`'s own number is reused for a raw syscall is not a side effect worth noting in passing; it is the entire mechanism I/O safety is built around, turning a use-after-close bug from a silent, possibly-reused-fd hazard into a syscall that fails loudly and immediately, every time.

## In production

Clearing `FD_CLOEXEC` with a separate `fcntl` call after `open()`, as this topic's example does deliberately, is exactly the race pattern the `open(2)` man page itself warns about in a multithreaded program — doing it after `open()` here is a controlled stand-in for that same real race, not merely a convenient way to produce a leaked fd. The child process in this topic's own example is a genuinely separate, real process — spawned via `std::process::Command`, which forks and execs for real — not a simulation of one; the fd that disappears, disappears because the kernel's own `exec` actually closed it, not because the test merely assumes it would. `RLIMIT_NOFILE` is adjustable, as a soft limit, up to its own hard ceiling by an unprivileged process, and past that hard ceiling only with a real capability — which is why a production service tunes it explicitly rather than treating the default as fixed. Every fd this topic measures — duplicated, closed, leaked — is exactly what consumes that budget.

## The frontier

The three behaviors this topic measures are not three unrelated facts about file descriptors; they are three consequences of the same single idea — an fd is a handle into a kernel object, not the object itself — applied to three different kinds of event: duplication, destruction, and inheritance across `exec`. `into_raw_fd` and `from_raw_fd`, named directly in this topic's own syllabus clause, are the explicit ownership-handoff points at an FFI or API boundary; this topic measures the `Drop` and borrow halves of I/O safety directly and leaves the handoff functions to the next topic, which actually crosses a process boundary. This topic answers, in full, the exact gap Chapter 10's own handoff named: every task in that chapter's shutdown sequences implicitly held real kernel handles whose ownership rules were never made explicit at the Rust level, and this is where that implicit assumption finally becomes a measured, type-enforced guarantee.

## Where this goes next

A file descriptor's ownership is explicit now — but a file descriptor is cheap compared to the process that holds a whole table of them, and that process has its own, much sharper ownership rule the instant it forks.
