---
id: rust.reference-cycles-weak
title: "Reference cycles and Weak"
---

<section data-section="outcomes">

## After this topic you can

- Build a genuine two-node Rc/RefCell cycle, and measure that it leaks for the life of the program with a counting allocator.
- Place Weak as a non-owning reference that breaks a cycle, and say what upgrade returns once the last strong owner is gone.
- Use Rc::new_cyclic to build a structure that needs to hold a weak pointer to itself from the moment it exists.

</section>

<section data-section="internals">

## Internals: the leak the compiler never sees

Everything here was run with rustc 1.97.0 (2d8144b78 2026-07-07) on x86_64 Linux, edition 2024, in `examples.py`. The syllabus baseline is 1.99.

Rust's safety guarantees stop a lot of mistakes, but not this one. The Book says it directly: "Rust's memory safety guarantees make it difficult, but not impossible, to accidentally create memory that is never cleaned up... Preventing memory leaks entirely is not one of Rust's guarantees, meaning memory leaks are memory safe in Rust." `examples/rc_cycle_leak.rs` builds exactly the shape that triggers it: a parent node holding a strong `Rc` to a child, and that same child holding a strong `Rc` straight back to the parent. The Book explains why this leaks: "it's possible to create references where items refer to each other in a cycle. This creates memory leaks because the reference count of each item in the cycle will never reach 0, and the values will never be dropped." Both nodes go out of scope at the end of the example's block, and neither one's count ever reaches zero — measured directly with a counting global allocator, the same technique Chapter 1's leak-safety topic used for `mem::forget` and `Box::leak`: the net allocation count after the block is strictly greater than before it, a real, measured leak rather than a claim taken on faith.

`Weak<T>` is what breaks that cycle, by giving up ownership entirely rather than trying to detect or prevent the cycle. The docs describe it plainly: "`Weak` is a version of `Rc` that holds a non-owning reference to the managed allocation." The Book frames the contrast directly: "strong references are how you can share ownership of an `Rc<T>` instance. Weak references don't express an ownership relationship, and their count doesn't affect when an `Rc<T>` instance is cleaned up. They won't cause a reference cycle, because any cycle involving some weak references will be broken once the strong reference count of values involved is 0." `examples/weak_breaks_cycle.rs` builds the identical parent/child shape, but the child's pointer back to its parent is a `Weak`, obtained with `Rc::downgrade`, instead of a strong `Rc`. The same counting allocator now shows every byte freed once both nodes go out of scope — nothing leaks.

Because a `Weak` carries no ownership, the value it points at can disappear while the `Weak` itself is still around. The docs: "since a `Weak` reference does not count towards ownership, it will not prevent the value stored in the allocation from being dropped, and `Weak` itself makes no guarantees about the value still being present. Thus it may return `None` when upgraded." `examples/weak_upgrade_after_drop.rs` calls `upgrade` once while the strong `Rc` is still alive, getting `Some`, drops that `Rc`, and calls `upgrade` again, getting `None` — the Book's own reasoning for why `upgrade` returns an `Option` at all: "Rust will ensure that the `Some` case and the `None` case are handled, and there won't be an invalid pointer."

The last piece is building a structure that needs a weak pointer to itself from the moment it exists, which a plain `Rc::new` can't do — there's no `Rc` to point `Weak` at until construction finishes. `Rc::new_cyclic` exists for exactly this: "constructs a new `Rc<T>` while giving you a `Weak<T>` to the allocation, to allow you to construct a `T` which holds a weak pointer to itself," specifically because, as the docs note, "a structure circularly referencing itself... should not hold a strong reference to itself to prevent a memory leak." `examples/rc_new_cyclic.rs` builds a node whose own `self_ref` field is set, inside the `new_cyclic` closure, to a `Weak` pointing at the very value still being constructed; once built, that `Weak` upgrades successfully back to the same node.

</section>

<section data-section="lab">

## Lab: build, break, measure

Every claim below is asserted in `examples.py`, which compiles and runs `examples/*.rs` fresh each time.

- `rc_cycle_leak.rs`: run and asserted to report a strictly positive net allocation count after both nodes drop out of scope, a real, measured leak.
- `weak_breaks_cycle.rs`: run and asserted to report zero net allocations, showing the identical shape frees cleanly once the parent link is a `Weak`.
- `weak_upgrade_after_drop.rs`: run and asserted to show `upgrade` succeeding while the strong owner is alive and returning `None` immediately after it is dropped.
- `rc_new_cyclic.rs`: run and asserted to print the expected name and strong counts, showing the node's own weak self-reference upgrades back to itself.

</section>

<section data-section="production">

## Production failures

The most common real failure here is building a parent/child or doubly-linked structure with `Rc` on every link, including the back-reference, without ever noticing the leak — nothing crashes, nothing panics, the program simply holds onto memory it will never give back, and the symptom only shows up as slow, creeping memory growth in a long-running process. The fix is deciding, for every back-reference, whether it is genuinely ownership (it should stay an `Rc`) or just a pointer for navigation (it should be a `Weak`); a parent pointer in a tree is almost always the latter.

The second is forgetting that a `Weak` can go stale at any point and calling something on the result of `upgrade` without handling the `None` case, either by unwrapping blindly or by assuming the value is always there because it was there a moment ago. The fix is treating every `upgrade` as a real possibility of absence, exactly as the `Option<Rc<T>>` return type is designed to force.

</section>

<section data-section="frontier">

## Frontier

This topic's leak detector, a counting global allocator, is the same technique Chapter 1's leak-safety topic used for `mem::forget` and `Box::leak`; a reference cycle is simply a third, much easier to write by accident, way to reach the identical observable outcome. A cache is a second common place `Weak` shows up beyond parent pointers: holding `Weak` references to values someone else still owns lets a cache observe and reuse live values without ever being the reason one of them outlives its real owner. Neither `Rc` nor `Weak` make any of this safe to touch from more than one thread on their own; everything in this topic stays confined to the single thread `Rc` itself requires.

</section>

<section data-section="next">

## Where this goes next

Every shared value in this chapter so far has lived on one thread's worth of logic at a time, even when `Arc` made it legal to share across threads. Topic 15, the last in this chapter, asks what happens once more than one thread actually touches the same mutable, shared state at once: the `Arc<Mutex<T>>` reflex, what it quietly costs, and the real alternatives to reaching for it by default.

</section>
