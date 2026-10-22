---
id: dsa.stacks-queues-deques
title: Stacks, queues and deques
---

<section data-section="outcomes">

## After this topic you can

- State LIFO and FIFO and give one real use of each: an undo history for a stack, a task queue for a queue.
- Say what a deque adds over a stack or queue alone: O(1) push, pop and peek directly at both ends, not a composition of two simpler structures.
- Name the two common deque implementations — an array-backed ring buffer and a chunked block deque — and the real trade-off between them: resize behaviour versus iterator stability.

</section>

<section data-section="internals">

## Into the internals

### Stack, queue, deque, compared

A stack restricts access to one end (push and pop both there); a queue splits access across two ends (enqueue at one, dequeue at the other); a deque lifts the restriction entirely, supporting O(1) push, pop and peek at both ends directly. Neither a stack nor a queue is a weaker *data structure* than a deque — each is a deque's interface used with a self-imposed discipline, which is exactly what the next topic, monotonic stacks and queues, builds a further invariant on top of.

### Two real designs, precisely

An array-backed circular buffer wraps a fixed-size array with modular ("wrap-around") indexing; when it's full, growing it means allocating a new, larger array and copying everything across, exactly as a vector's reallocation does (topic 1). Rust's `VecDeque` documents itself, in its own words, as "a double-ended queue implemented with a growable ring buffer," and warns that "its elements are not necessarily contiguous in memory" as a direct consequence.

A chunked block deque — the shape `std::deque` is required to have — instead holds an array of fixed-size blocks (plus a small index structure tracking which block holds which logical position). Growing it allocates a new block without moving any element already stored. The current C++ standard states the resulting iterator-stability rule precisely: inserting a single element at either end of a deque always takes constant time, and that insertion "invalidates all the iterators to the deque, but has no effect on the validity of references to elements of the deque." Erasure's rule is more specific still: erasing the last element invalidates only the past-the-end iterator and the erased element's own iterators and references; erasing the first element (but not the last) invalidates only the erased element's iterators and references; erasing from anywhere in the middle invalidates everything.

</section>

<section data-section="production">

## In production

The two designs are not interchangeable in code that holds iterators or pointers across a push: code written against a ring-buffer deque must treat *any* push or pop as invalidating every iterator and every reference it's holding (same discipline as a vector), while code written against a chunked deque can safely keep a reference across a push at either end, but must still treat iterators as gone. Mixing up the two is a real, sourced way to introduce a use-after-invalidation bug that only one of the two implementations would actually produce.

</section>

<section data-section="frontier">

## The frontier

A lock-free deque (used in work-stealing schedulers, for instance) has to solve the same push/pop-at-both-ends problem under concurrent access without a single lock serializing everything — a substantially harder problem than either design here, named only, not built.

</section>

<section data-section="questions">

## More questions

- Why does a stack's or a queue's own interface never need to specify which of the two deque designs backs it?
- If code holds a reference into a `std::deque` across a `push_back`, is that reference still valid? What if it holds an iterator instead?

</section>

<section data-section="next">

## Where this goes next

A plain stack or queue only promises O(1) at the ends it supports. The next topic builds a stack or queue whose own shape proves a second bound — all without ever resizing for it.

</section>
