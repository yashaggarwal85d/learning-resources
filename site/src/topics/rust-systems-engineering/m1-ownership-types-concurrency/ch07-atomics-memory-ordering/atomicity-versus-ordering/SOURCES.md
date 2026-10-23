# Sources — Atomicity versus ordering

## std::sync::atomic (module docs — memory model)
URL: https://doc.rust-lang.org/std/sync/atomic/index.html
Version: Rust std 1.99.1

> Rust atomics currently follow the same rules as C++20 atomics, specifically the rules
from the intro.races section, without the "consume" memory ordering.

> The most important aspect of this model is that data races are undefined behavior. A data race
is defined as conflicting non-synchronized accesses where at least one of the accesses is
non-atomic.

> They are non-synchronized if neither of them
happens-before the other, according to the happens-before order of the memory model.

Contents:
- the exact scope of the claim: Rust's atomics follow C++20's rules precisely, minus the "consume" ordering, named directly
- data races are stated as undefined behavior, not merely a bug class — the definition itself: conflicting, non-synchronized accesses where at least one is a write
- "non-synchronized" is defined through the happens-before order: two accesses race exactly when neither happens-before the other

## Ordering (std::sync::atomic — the four orderings)
URL: https://doc.rust-lang.org/std/sync/atomic/enum.Ordering.html
Version: Rust std 1.99.1

> In its weakest Ordering::Relaxed, only the memory directly touched by the
operation is synchronized. On the other hand, a store-load pair of Ordering::SeqCst
operations synchronize other memory while additionally preserving a total order of such
operations across all threads.

> No ordering constraints, only atomic operations.

> When coupled with a store, all previous operations become ordered
before any load of this value with Acquire (or stronger) ordering.

> When coupled with a load, if the loaded value was written by a store operation with
Release (or stronger) ordering, then all subsequent operations
become ordered after that store.

> Like Acquire/Release/AcqRel (for load, store, and load-with-store
operations, respectively) with the additional guarantee that all threads see all
sequentially consistent operations in the same order.

Contents:
- `Relaxed`'s own definition: no ordering constraints at all, atomicity only
- `Release`'s own definition: everything written before it becomes visible to a matching `Acquire` (or stronger) load
- `Acquire`'s own definition, the mirror image: subsequent operations become ordered after a matching `Release` (or stronger) store
- `SeqCst`'s own definition: every thread agreeing on one single order of every sequentially-consistent operation, the one guarantee the other three orderings don't give

## Atomics (The Rustonomicon)
URL: https://doc.rust-lang.org/nomicon/atomics.html
Version: fetched 2026-10-23

> When thread A releases a location in memory and then thread B subsequently
acquires the same location in memory, causality is established. Every write
(including non-atomic and relaxed atomic writes) that happened before A's
release will be observed by B after its acquisition.

> Relaxed accesses are the absolute weakest. They can be freely re-ordered and
provide no happens-before relationship. Still, relaxed operations are still
atomic.

Contents:
- the exact publication mechanism, stated plainly: a release in thread A and a matching acquire in thread B establishes causality, making every one of A's prior writes (atomic or not) visible to B
- the exact statement that separates the chapter's two concerns: relaxed operations are atomic (no torn values) yet give no happens-before relationship at all — atomicity without ordering, in the source's own words
