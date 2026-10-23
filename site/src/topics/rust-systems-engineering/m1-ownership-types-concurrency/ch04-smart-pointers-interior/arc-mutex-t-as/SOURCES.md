# Sources: Arc<Mutex<T>> as hidden serialization

## Mutex in std::sync - Rust
URL: https://doc.rust-lang.org/std/sync/struct.Mutex.html
Version: online edition, no date shown on the page

> A mutual exclusion primitive useful for protecting shared data

> This mutex will block threads waiting for the lock to become available.

> Each mutex has a type parameter which represents the data that it is protecting. The data can only be accessed through the RAII guards returned from lock and try_lock, which guarantees that the data is only ever accessed when the mutex is locked.

Contents (item by item):
- a `Mutex` protects shared data by mutual exclusion: only one thread can hold the lock at a time
- a thread waiting for a held lock blocks until it becomes available, rather than failing or retrying on its own
- the protected data is only ever reachable through the RAII guard `lock`/`try_lock` return, which is what guarantees it is never touched while unlocked

## arc_swap - Rust (docs.rs)
URL: https://docs.rs/arc-swap/latest/arc_swap/
Version: arc-swap 1.9.3

> The ArcSwap type is a container for an Arc that can be changed atomically. Semantically, it is similar to something like Atomic<Arc<T>> (if there was such a thing) or RwLock<Arc<T>> (but without the need for the locking). It is optimized for read-mostly scenarios, with consistent performance characteristics.

> Using the same version of the data structure over longer period of time ‒ a query should be answered by a consistent version of data, a packet should be routed either by an old or by a new version of the routing table but not by a combination, etc.

> Better option would be to have RwLock<Arc<T>>. Then one would lock, clone the Arc and unlock. This suffers from CPU-level contention (on the lock and on the reference count of the Arc) which makes it relatively slow.

Contents (item by item):
- `ArcSwap<T>` lets an `Arc<T>` itself be swapped atomically, with no lock needed to read the current value
- it is built for read-mostly data, where many threads read often and updates are comparatively rare
- a reader is guaranteed to see one complete, consistent version of the data, never a mix of an old and a new one
- `RwLock<Arc<T>>` is the naive alternative `ArcSwap` improves on, and it still pays for a lock acquisition plus a reference-count bump on every single read
