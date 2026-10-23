# Sources: Interior mutability: Cell, RefCell, UnsafeCell

## std::cell - Rust
URL: https://doc.rust-lang.org/std/cell/index.html
Version: online edition, module-level documentation, no date shown on the page

> Cell<T>, RefCell<T>, and OnceCell<T> allow doing this in a single-threaded way—they do not implement Sync. (If you need to do aliasing and mutation among multiple threads, Mutex<T>, RwLock<T>, OnceLock<T> or atomic types are the correct data structures to do so).

> An immutable reference to a RefCell's inner value (&T) can be obtained with borrow, and a mutable borrow (&mut T) can be obtained with borrow_mut. When these functions are called, they first verify that Rust's borrow rules will be satisfied: any number of immutable borrows are allowed or a single mutable borrow is allowed, but never both. If a borrow is attempted that would violate these rules, the thread will panic.

> The corresponding Sync version of RefCell<T> is RwLock<T>.

Contents (item by item):
- `Cell<T>`/`RefCell<T>`/`OnceCell<T>` allow interior mutability on one thread only, because they do not implement `Sync`
- `RefCell`'s `borrow`/`borrow_mut` check Rust's borrow rules at run time: any number of shared borrows, or exactly one exclusive borrow, never both at once
- a conflicting borrow panics the thread rather than refusing to compile
- `RwLock<T>` is the `Sync` equivalent of `RefCell<T>`, for when the same checked-borrow shape is needed across threads

## RefCell in std::cell - Rust
URL: https://doc.rust-lang.org/std/cell/struct.RefCell.html
Version: std 1.99.1 (58cf8f9c3 2026-10-13)

> A mutable memory location with dynamically checked borrow rules

> The borrow lasts until the returned RefMut or all RefMuts derived from it exit scope. The value cannot be borrowed while this borrow is active.

> Panics if the value is currently borrowed. For a non-panicking variant, use try_borrow_mut.

Contents (item by item):
- `RefCell<T>` is a mutable memory location whose borrow rules are checked dynamically, at run time, rather than statically
- a live `borrow_mut` guard excludes every other borrow until it, and anything derived from it, goes out of scope
- `borrow_mut` panics outright if the value is already borrowed; `try_borrow_mut` is the non-panicking alternative

## UnsafeCell in std::cell - Rust
URL: https://doc.rust-lang.org/std/cell/struct.UnsafeCell.html
Version: online edition, no date shown on the page

> The core primitive for interior mutability in Rust.

> UnsafeCell<T> opts-out of the immutability guarantee for &T: a shared reference &UnsafeCell<T> may point to data that is being mutated. This is called "interior mutability".

> All other types that allow internal mutability, such as Cell<T> and RefCell<T>, internally use UnsafeCell to wrap their data.

Contents (item by item):
- `UnsafeCell<T>` is the core primitive interior mutability is built on
- it is the one type that lets a shared reference `&T` point at data that is actually being mutated
- every other interior-mutability type (`Cell`, `RefCell`) is implemented internally on top of `UnsafeCell`

## RELEASES.md - rust-lang/rust
URL: https://raw.githubusercontent.com/rust-lang/rust/master/RELEASES.md
Version: repository `master` branch, fetched 2026-10-23

> Version 1.80.0 (2024-07-25)

> - [`LazyLock`](https://doc.rust-lang.org/beta/std/sync/struct.LazyLock.html)

> Version 1.70.0 (2023-06-01)

> - [`std::sync::OnceLock`](https://doc.rust-lang.org/stable/std/sync/struct.OnceLock.html)

Contents (item by item):
- `LazyLock` was stabilized in Rust 1.80.0, released 2024-07-25
- `std::sync::OnceLock` was stabilized in Rust 1.70.0, released 2023-06-01
