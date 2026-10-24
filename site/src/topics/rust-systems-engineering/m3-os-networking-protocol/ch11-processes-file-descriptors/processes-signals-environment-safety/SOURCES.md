# Sources — Processes, signals, and environment safety

## `std::process::Command` docs

URL: https://doc.rust-lang.org/std/process/struct.Command.html
Fetched: 2026-10-23, cached at `sources/command.txt`.

> A process builder, providing fine-grained control over how a new process should be spawned.

## `fork(2)` man page

URL: https://man7.org/linux/man-pages/man2/fork.2.html
Fetched: 2026-10-23, cached at `sources/fork-2.txt`.

> The child process is created with a single thread—the one that called fork().

> After a fork() in a multithreaded program, the child can safely call only async-signal-safe functions (see signal-safety(7)) until such time as it calls execve(2).

## `signal-safety(7)` man page

URL: https://man7.org/linux/man-pages/man7/signal-safety.7.html
Fetched: 2026-10-23, cached at `sources/signal-safety-7.txt`.

> An async-signal-safe function is one that can be safely called from within a signal handler.

## `pidfd_open(2)` man page

URL: https://man7.org/linux/man-pages/man2/pidfd_open.2.html
Fetched: 2026-10-23, cached at `sources/pidfd-open-2.txt`.

> The pidfd_open() system call creates a file descriptor that refers to the task referenced by pid.

## `pidfd_send_signal(2)` man page

URL: https://man7.org/linux/man-pages/man2/pidfd_send_signal.2.html
Fetched: 2026-10-23, cached at `sources/pidfd-send-signal-2.txt`.

> The pidfd_send_signal() system call allows the avoidance of race conditions that occur when using traditional interfaces (such as kill(2)) to signal a process. The problem is that the traditional interfaces specify the target process via a process ID (PID), with the result that the sender may accidentally send a signal to the wrong process if the originally intended target process has terminated and its PID has been recycled for another process. By contrast, a PID file descriptor is a stable reference to a specific process; if that process terminates, pidfd_send_signal() fails with the error ESRCH.

## `std::env::set_var` docs (Rust 2024 edition)

URL: https://doc.rust-lang.org/std/env/fn.set_var.html
Fetched: 2026-10-23, cached at `sources/set-var.txt`.

> This function is sound to call in a single-threaded program.

> In multi-threaded programs on other operating systems, the only sound option is to not use set_var or remove_var at all.

> The problem is that these operating systems do not provide a thread-safe way to read the environment, and most C libraries, including libc itself, do not advertise which functions read from the environment.
