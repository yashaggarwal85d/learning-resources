# Sources — Explicit ownership-crossing points

## thread::spawn (std::thread)
URL: https://doc.rust-lang.org/std/thread/fn.spawn.html
Version: Rust std 1.99.1

> The 'static constraint means that the closure and its return value
must have a lifetime of the whole program execution.

> The Send constraint is because the closure will need to be passed
by value from the thread where it is spawned to the new thread.

Contents:
- the two real constraints on a spawned closure, named precisely: `'static` (the closure and its return value must outlive any possible caller) and `Send` (ownership of the closure moves to the new thread)
- the structural reason both exist: a spawned thread can outlive the scope that created it, so the compiler can't know when it's safe to free anything the closure captured by reference

## thread::scope (std::thread)
URL: https://doc.rust-lang.org/std/thread/fn.scope.html
Version: Rust std 1.99.1

> Unlike non-scoped threads, scoped threads can borrow non-'static data,
as the scope guarantees all threads will be joined at the end of the scope.

> All threads spawned within the scope that haven't been manually joined
will be automatically joined before this function returns.

Contents:
- the exact trade-off `thread::scope` buys back: borrowing non-`'static` data, because the scope itself guarantees every spawned thread joins before it returns
- the automatic-join guarantee that makes the borrow sound: nothing spawned inside the scope can outlive it

## tokio::task::spawn
URL: https://docs.rs/tokio/latest/tokio/task/fn.spawn.html
Version: tokio 1.54.1

> F: Future + Send + 'static,
F::Output: Send + 'static,

> Spawning a task enables the task to execute concurrently to other tasks. The
spawned task may execute on the current thread, or it may be sent to a
different thread to be executed. The specifics depend on the current
Runtime configuration.

Contents:
- the identical two constraints as `thread::spawn`, `Send + 'static`, now on a `Future` instead of a closure — the same ownership-crossing contract, enforced the same way
- the docs' own statement that a spawned task's thread is unspecified by the caller: it may run on the current thread or be moved to a different one entirely, which is exactly why the future must be `Send`

## std::sync::mpsc (module docs)
URL: https://doc.rust-lang.org/std/sync/mpsc/index.html
Version: Rust std 1.99.1

> Multi-producer, single-consumer FIFO queue communication primitives.

> A Sender or SyncSender is used to send data to a Receiver. Both
senders are clone-able (multi-producer) such that many threads can send
simultaneously to one receiver (single-consumer).

Contents:
- the exact shape of the primitive: many cloneable senders, one receiver, FIFO order
- `send` is how ownership of a value crosses from the sending thread to whichever thread eventually calls `recv`

## std::sync::mpmc source (the module std::sync::mpsc is implemented on top of)
URL: https://doc.rust-lang.org/src/std/sync/mpmc/mod.rs.html
Version: Rust std 1.99.1 (nightly source listing)

> This module is used as the implementation for the channels in `sync::mpsc`.
The implementation comes from the crossbeam-channel crate:

Contents:
- the source's own comment, naming its own internals directly: `std::sync::mpsc`'s real channel implementation is a port of the `crossbeam-channel` crate, not a bespoke one
