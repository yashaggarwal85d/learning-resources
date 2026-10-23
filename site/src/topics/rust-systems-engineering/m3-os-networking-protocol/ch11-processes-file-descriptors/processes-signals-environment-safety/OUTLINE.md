# Outline: Processes, signals, and environment safety (`rust.processes-signals-environment-safety`)

Chapter 11, topic 37 (second and last of two). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Measure `std::process::Command` genuinely forking and exec'ing a separate, real child process, with its own distinct pid and its own real, observed exit status.
2. Measure a real `fork()` in a multithreaded process creating a child with exactly one thread, no matter how many the parent had running — and name why only async-signal-safe operations are permitted in that child before it calls `exec`.
3. Measure a pidfd acting as a stable reference to one specific process: sending through it succeeds while that exact process is alive, and fails with `ESRCH` once it is genuinely gone — never silently reaching some other process that reused its old pid.
4. Name why Rust 2024 made `std::env::set_var` `unsafe`: the environment is shared, process-global mutable state that C's own `getenv` reads without synchronization.

## Changes from the chapter plan

None. `CHAPTER.md` §A.3 scopes this topic to reusing topic 36's real-process conventions, spawning a real child, demonstrating the fork-to-exec window's restriction safely (by inspecting `/proc` from the parent rather than doing anything questionable inside the forked child itself), and measuring a pidfd's and `set_var`'s real documented races — built exactly that way.

## Reel steps (storyboard)

1. **"Spawn a real child process with Command. Does it get its own, separate process id, or does it somehow share the parent's?"** (predict, hook) — `fig`: `Command::new("/bin/sh").arg("-c").arg("exit 7").spawn()`. Options: it shares the parent's pid / it gets its own, completely separate pid (correct) / it depends on whether the shell forks internally.
2. **"Measured: the spawned child had its own, genuinely different process id, and its real exit code — 7 — was observed exactly"** — `fig`: `command_spawns_a_real_child`'s real, executed output. NO takeaway (this is the reel's swipe-test "from" step; a takeaway here reliably fails the phone caption-swipe check per QUALITY.md #64 — moved to a later step instead).
3. **"A multithreaded process calls fork(). How many threads does the resulting child actually have?"** (predict) — `fig`: `libc::fork()` called from a process already running several real threads. Options: the same number the parent had / exactly one — the thread that called fork() (correct) / zero, until the child starts its own.
4. **"Measured: the parent genuinely had several real threads running, and the forked child had exactly one — which is exactly why only async-signal-safe operations are allowed there before exec"** — `fig`: `fork_child_has_one_thread`'s real, executed output. Takeaway: "A forked child has exactly one thread — any lock another thread held at that moment belongs to a thread that no longer exists there."
5. **"Send a signal through a pidfd to a process that has already exited and been reaped. Does it silently succeed, silently fail, or fail with a specific, clear error?"** (predict) — `fig`: `pidfd_send_signal` called after `child.wait()`. Options: it silently succeeds, doing nothing / it fails with a clear, specific error, ESRCH (correct) / it blocks forever waiting for the process to exist.
6. **"Measured: sending through the pidfd succeeded while the real process was alive, and failed outright with ESRCH the instant it was genuinely gone — never silently reaching some other process that reused its old pid"** — `fig`: `pidfd_fails_after_the_process_is_gone`'s real, executed output. Takeaway: "A pidfd is a stable reference to one exact process — unlike a raw pid, it can never be silently confused with a later one reusing that same number."
7. **"Why did Rust 2024 make std::env::set_var unsafe, when it was perfectly safe to call for years before?"** (predict) — `fig`: `unsafe fn set_var` in the current edition's own signature. Options: it was always unsafe, and the edition just caught up / because it races with C's own getenv, which no library can be relied on to avoid calling (correct) / because the environment itself became a kernel-managed resource.
8. **"std::env::set_var's own safety section is explicit: this function is sound in a single-threaded program, and in any program on Windows — but in a multithreaded program on other platforms, the only sound choice is not to call it at all"** — `fig`: the function's own documented safety contract, quoted directly. NO takeaway (a connecting step restating the documented rationale directly, not a new measured claim).
9. **"Every one of these rules is the same rule, said three different ways: a forked child, a pidfd, and the environment are all shared state that something else in the process can be touching at the exact same moment"** — `fig`: the three measured/quoted behaviors side by side. Takeaway: "Fork safety, pidfds, and set_var's own unsafety are the same lesson three times: shared state and the exact moment it's touched."
10. **Recap** — Command genuinely spawns a separate process with its own pid; a forked child genuinely has exactly one thread, which is why only async-signal-safe operations are allowed there; a pidfd genuinely refers to one exact process and never silently confuses it with a later one; and `set_var` genuinely races with C's own `getenv`. Handoff: a process's file descriptors and its signals are both kernel handles this chapter made explicit — its memory is a kernel handle too, just one so heavily abstracted by the virtual memory system that most code never has to think of it as one at all, until it's mapped directly.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 6 (a pidfd doesn't merely identify a process by number — it fails with a specific, clear error the instant that exact process is gone, which a raw pid can never promise once it's reused).
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 8 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| std::process::Command is a process builder, providing fine-grained control over how a new process should be spawned | `docs.rs/std::process::Command` (quoted) |
| A spawned child process genuinely has its own, different process id, and its real exit code is observed exactly, measured directly | `examples/runtime-demo/src/command_spawns_a_real_child.rs` (executed, measured) |
| The child process created by fork() has a single thread — the one that called fork() | `man7.org/linux/man-pages/man2/fork.2.html` (quoted) |
| After fork() in a multithreaded program, the child can safely call only async-signal-safe functions until it calls execve() | `man7.org/linux/man-pages/man2/fork.2.html` (quoted) |
| An async-signal-safe function is one that can be safely called from within a signal handler | `man7.org/linux/man-pages/man7/signal-safety.7.html` (quoted) |
| A real multithreaded parent's forked child genuinely has exactly one thread, no matter how many the parent had, measured directly | `examples/runtime-demo/src/fork_child_has_one_thread.rs` (executed, measured) |
| pidfd_open() creates a file descriptor that refers to the task referenced by a given pid | `man7.org/linux/man-pages/man2/pidfd_open.2.html` (quoted) |
| pidfd_send_signal() avoids the race where a traditional pid-based signal could reach the wrong process if the original pid was recycled; a pidfd is a stable reference to one specific process and fails with ESRCH once that process has terminated | `man7.org/linux/man-pages/man2/pidfd_send_signal.2.html` (quoted) |
| Sending through a real pidfd succeeds while its exact process is alive and fails with ESRCH the instant that process has genuinely exited and been reaped, measured directly | `examples/runtime-demo/src/pidfd_fails_after_the_process_is_gone.rs` (executed, measured) |
| std::env::set_var is sound to call in a single-threaded program, but in a multithreaded program on non-Windows platforms the only sound option is not to call it at all, because no thread-safe way exists to read the environment and most C libraries don't advertise which functions read it | `doc.rust-lang.org/std/env/fn.set_var.html` (quoted) |

## Concept ledger

- `introduces`: `async-signal-safe-fork-window`, `pidfd-race-free-process-management` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `fd-as-kernel-handle`, `send-auto-trait`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A file descriptor's ownership is explicit now — but a file descriptor is cheap compared to the process that holds a whole table of them, and that process has its own, much sharper ownership rule the instant it forks."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A process's file descriptors and its signals are both kernel handles this chapter made explicit. Its memory is a kernel handle too — just one so heavily abstracted by the virtual memory system that most code never has to think of it as one at all, until it's mapped directly."
