# Sources: Box, Rc, and Arc ownership shapes

## Rc\<T\>, the Reference Counted Smart Pointer - The Rust Programming Language
URL: https://doc.rust-lang.org/book/ch15-04-rc.html
Version: online edition, no edition number or date shown on the page

> Every time we call Rc::clone, the reference count to the data within the Rc<List> will increase, and the data won't be cleaned up unless there are zero references to it.

> The call to Rc::clone only increments the reference count, which doesn't take much time.

Contents (item by item):
- cloning an `Rc<T>` bumps a plain reference count rather than copying the underlying data
- the data behind an `Rc<T>` is freed only once its reference count reaches zero
- `Rc::clone`'s cost is a cheap count increment, not a deep copy, which is why the convention is to call it explicitly instead of `.clone()`

## Arc - std - Rust
URL: https://doc.rust-lang.org/std/sync/struct.Arc.html
Version: online edition, section id `§Thread Safety`, no date shown on the page

> Unlike Rc<T>, Arc<T> uses atomic operations for its reference counting. This means that it is thread-safe. The disadvantage is that atomic operations are more expensive than ordinary memory accesses. If you are not sharing reference-counted allocations between threads, consider using Rc<T> for lower overhead. Rc<T> is a safe default, because the compiler will catch any attempt to send an Rc<T> between threads.

Contents (item by item):
- `Arc<T>`'s reference count is updated with atomic operations, which is what makes it safe to share across threads
- atomic operations cost more than the ordinary, non-atomic memory accesses `Rc<T>`'s count uses
- the compiler rejects sending an `Rc<T>` across threads, which is why `Rc<T>` stays the cheaper default whenever sharing is confined to one thread
