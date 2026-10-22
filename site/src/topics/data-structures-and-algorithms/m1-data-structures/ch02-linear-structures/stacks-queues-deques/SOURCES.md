## ISO C++ working draft, N4868 (C++20), [deque]

URL: https://timsong-cpp.github.io/cppwp/n4868/deque
Version: N4868, the C++20 working draft (Tim Song's cppwp mirror)

> An insertion in the middle of the deque invalidates all the iterators and
> references to elements of the deque.

> An insertion at either end of the
> deque invalidates all the iterators to the deque, but has no effect on
> the validity of references to elements of the deque.

> Inserting a single element at either the beginning or end of a deque always takes constant time

> An erase operation that erases the last element of a deque invalidates only the past-the-end iterator
> and all iterators and references to the erased elements.

> An erase operation
> that erases neither the first element nor the last element of a deque invalidates the past-the-end
> iterator and all iterators and references to all the elements of the deque.

Contents: `[deque]`'s full member specification (constructors, capacity, element access, modifiers) with the complexity and invalidation remarks attached to `insert`, `emplace`, `push_front`/`push_back`, and `erase`/`pop_front`/`pop_back`. This topic uses only the modifiers clause's invalidation wording quoted above: insertion or erasure at either end is O(1) and invalidates iterators but not references to surviving elements, while touching the middle invalidates both.

---

## Rust, `std::collections::VecDeque` documentation

URL: https://doc.rust-lang.org/std/collections/struct.VecDeque.html
Version: current stable `std` docs, fetched 2026-10-22

> A double-ended queue implemented with a growable ring buffer.

> Since VecDeque is a ring buffer, its elements are not necessarily contiguous
> in memory.

Contents: the `VecDeque` type's full method documentation (`push_front`, `push_back`, `pop_front`, `pop_back`, `make_contiguous`, iteration, and more) and its own top-level description, quoted above: an array-backed, growable ring buffer, not a chunked design, named here as a second real example of the array-backed circular shape this chapter previews (topic 5 builds and names the mechanism in full). This topic uses only the top-level description; the method catalogue is not otherwise quoted.
