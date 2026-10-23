# Sources — Arc shares, Mutex synchronizes

## std::sync::Arc
URL: https://doc.rust-lang.org/std/sync/struct.Arc.html
Version: std 1.99.1 (58cf8f9c3 2026-10-13)

> A thread-safe reference-counting pointer. 'Arc' stands for 'Atomically
Reference Counted'.

> The type Arc<T> provides shared ownership of a value of type T,
allocated in the heap. Invoking clone on Arc produces
a new Arc instance, which points to the same allocation on the heap as the
source Arc, while increasing a reference count.

> Shared references in Rust disallow mutation by default, and Arc is no
exception: you cannot generally obtain a mutable reference to something
inside an Arc. If you do need to mutate through an Arc, you have several options:

> Use interior mutability with synchronization primitives like Mutex,
RwLock, or one of the Atomic types.

> Arc<T> makes it thread safe to have multiple ownership of the same
data, but it doesn't add thread safety to its data. Consider
Arc<RefCell<T>>. RefCell<T> isn't Sync, and if Arc<T> was always
Send, Arc<RefCell<T>> would be as well. But then we'd have a problem:
RefCell<T> is not thread safe; it keeps track of the borrowing count using
non-atomic operations.

> In the end, this means that you may need to pair Arc<T> with some sort of
std::sync type, usually Mutex<T>.

Contents:
- `Arc<T>` provides shared ownership only; `clone` increments a reference count, nothing more
- shared references disallow mutation by default, and `Arc` is explicitly no exception — mutating through it needs `Mutex`, `RwLock`, or an atomic type
- the primary-source statement of this whole topic's claim: `Arc<T>` makes multiple ownership thread-safe but "doesn't add thread safety to its data"
- `Arc<RefCell<T>>` is the docs' own worked example of why `Arc` alone is never enough

## std::sync::Mutex
URL: https://doc.rust-lang.org/std/sync/struct.Mutex.html
Version: std 1.99.1 (58cf8f9c3 2026-10-13)

> A mutual exclusion primitive useful for protecting shared data

> This mutex will block threads waiting for the lock to become available. The
mutex can be created via a new constructor. Each mutex has a type parameter
which represents the data that it is protecting. The data can only be accessed
through the RAII guards returned from lock and try_lock, which
guarantees that the data is only ever accessed when the mutex is locked.

> The mutexes in this module implement a strategy called "poisoning" where a
mutex becomes poisoned if it recognizes that the thread holding it has
panicked.

> Once a mutex is poisoned, all other threads are unable to access the data by
default as it is likely tainted (some invariant is not being upheld).

> Poisoning is only advisory: the PoisonError type has an into_inner
method which will return the guard that would have otherwise been returned
on a successful lock. This allows access to the data, despite the lock being
poisoned.

Contents:
- `Mutex<T>`'s data is only ever reachable through the RAII guard `lock()`/`try_lock()` return
- the real, named "poisoning" strategy: a panic while holding the lock poisons it for every later locker, by default
- poisoning is advisory, not absolute — `into_inner` on the `PoisonError` still reaches the data

## std source — sys::sync::mutex::futex (the real implementation on Linux)
URL: https://doc.rust-lang.org/nightly/src/std/sys/sync/mutex/futex.rs.html
Version: fetched 2026-10-23

> use crate::sync::atomic::Ordering::{Acquire, Relaxed, Release};
use crate::sys::sync::futex::{self, futex_wait, futex_wake};

> pub struct Mutex {
 futex: Futex,
}

> const UNLOCKED: State = 0;
const LOCKED: State = 1; // locked, no other threads waiting
const CONTENDED: State = 2; // locked, and other threads waiting (contended)

Contents:
- the real, current source of `std::sync::Mutex`'s Linux implementation: a single futex word with three states (unlocked, locked, contended), not a thin wrapper around a C library mutex
- it is built directly on `futex_wait`/`futex_wake`, the primary-source proof behind "futex-based in std"

## parking_lot — Mutex
URL: https://docs.rs/parking_lot/latest/parking_lot/type.Mutex.html
Version: parking_lot 0.13.0

> A mutual exclusion primitive useful for protecting shared data.

> This mutex will block threads waiting for the lock to become available. The
mutex can be statically initialized or created by the new
constructor.

> Differences from the standard library Mutex

> No poisoning, the lock is released normally on panic.

> Only requires 1 byte of lock state.

> Supports locking with a timeout.

Contents:
- `parking_lot::Mutex`'s own, explicit "Differences from the standard library Mutex" list
- "No poisoning, the lock is released normally on panic" — the primary-source proof of parking_lot's opposite design choice
- a `parking_lot::Mutex` needs only one byte of lock state, versus std's word-sized futex state

## tokio::sync::Mutex
URL: https://docs.rs/tokio/latest/tokio/sync/struct.Mutex.html
Version: tokio 1.54.1

> An asynchronous Mutex-like type.

> This type acts similarly to std::sync::Mutex, with two major
differences: lock is an async method so does not block, and the lock
guard is designed to be held across .await points.

> Contrary to popular belief, it is ok and often preferred to use the ordinary
Mutex from the standard library in asynchronous code.

> The feature that the async mutex offers over the blocking mutex is the
ability to keep it locked across an .await point. This makes the async
mutex more expensive than the blocking mutex, so the blocking mutex should
be preferred in the cases where it can be used.

> Note that, although the compiler will not prevent the std Mutex from holding
its guard across .await points in situations where the task is not movable
between threads, this virtually never leads to correct concurrent code in
practice as it can easily lead to deadlocks.

Contents:
- `tokio::sync::Mutex` is built specifically to be held across `.await`; `std::sync::Mutex` is not and is more expensive if used for only that reason
- the docs' own explicit recommendation: prefer the standard library's `Mutex` in async code unless the lock genuinely must survive an `.await`
- the docs' own warning that the compiler does not forbid holding a `std` guard across `.await`, and that doing so "virtually never leads to correct concurrent code in practice"
