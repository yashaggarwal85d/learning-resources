# Sources: Reference cycles and Weak

## Reference Cycles Can Leak Memory - The Rust Programming Language
URL: https://doc.rust-lang.org/book/ch15-06-reference-cycles.html
Version: online edition, no edition number or date shown on the page

> Rust's memory safety guarantees make it difficult, but not impossible, to accidentally create memory that is never cleaned up (known as a memory leak). Preventing memory leaks entirely is not one of Rust's guarantees, meaning memory leaks are memory safe in Rust.

> It's possible to create references where items refer to each other in a cycle. This creates memory leaks because the reference count of each item in the cycle will never reach 0, and the values will never be dropped.

> Strong references are how you can share ownership of an Rc<T> instance. Weak references don't express an ownership relationship, and their count doesn't affect when an Rc<T> instance is cleaned up. They won't cause a reference cycle, because any cycle involving some weak references will be broken once the strong reference count of values involved is 0.

> Because upgrade returns an Option<Rc<T>>, Rust will ensure that the Some case and the None case are handled, and there won't be an invalid pointer.

Contents (item by item):
- Rust's safety guarantees don't prevent memory leaks; a leak is memory-safe, just wasteful
- an `Rc`/`RefCell` cycle leaks because each item's reference count never reaches zero, so none of them is ever dropped
- a `Weak` reference carries no ownership, so it cannot itself keep a cycle from breaking once every strong reference is gone
- `upgrade` returns an `Option<Rc<T>>` precisely so the compiler forces both the still-alive and the already-dropped case to be handled

## Weak in std::rc - Rust
URL: https://doc.rust-lang.org/std/rc/struct.Weak.html
Version: online edition, no date shown on the page

> Weak is a version of Rc that holds a non-owning reference to the managed allocation.

> Since a Weak reference does not count towards ownership, it will not prevent the value stored in the allocation from being dropped, and Weak itself makes no guarantees about the value still being present. Thus it may return None when upgraded.

Contents (item by item):
- `Weak<T>` is a version of `Rc<T>` whose reference does not own the value it points at
- because `Weak` carries no ownership, the value it points at can be dropped out from under it, and `upgrade` returns `None` when that has happened

## Rc in std::rc - Rust
URL: https://doc.rust-lang.org/std/rc/struct.Rc.html
Version: online edition, no date shown on the page

> Constructs a new Rc<T> while giving you a Weak<T> to the allocation, to allow you to construct a T which holds a weak pointer to itself.

> Generally, a structure circularly referencing itself, either directly or indirectly, should not hold a strong reference to itself to prevent a memory leak.

Contents (item by item):
- `Rc::new_cyclic` hands the constructor a `Weak<T>` to the value's own not-yet-finished allocation, so the value being built can store a weak pointer to itself
- a self-referencing structure should hold that self-reference as a `Weak`, never a strong `Rc`, specifically to avoid creating a leak
