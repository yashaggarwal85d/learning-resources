# Sources — Acquire/release publication, and when SeqCst is required

## Ordering (std::sync::atomic — Release, Acquire, SeqCst)
URL: https://doc.rust-lang.org/std/sync/atomic/enum.Ordering.html
Version: Rust std 1.99.1

> When coupled with a store, all previous operations become ordered
before any load of this value with Acquire (or stronger) ordering.
In particular, all previous writes become visible to all threads
that perform an Acquire (or stronger) load of this value.

> When coupled with a load, if the loaded value was written by a store operation with
Release (or stronger) ordering, then all subsequent operations
become ordered after that store. In particular, all subsequent loads will see data
written before the store.

> Like Acquire/Release/AcqRel (for load, store, and load-with-store
operations, respectively) with the additional guarantee that all threads see all
sequentially consistent operations in the same order.

Contents:
- `Release`'s own definition, store side: every prior write in the releasing thread becomes visible to any thread whose matching load is `Acquire` or stronger
- `Acquire`'s own definition, load side, the mirror image: once the load observes a `Release`-or-stronger store, every later operation in the loading thread is ordered after that store
- `SeqCst`'s own definition: the same per-pair guarantee as `Acquire`/`Release`/`AcqRel`, plus every thread agreeing on one single global order of every `SeqCst` operation — the guarantee `Release`/`Acquire` pairs alone do not give

## fence (std::sync::atomic — atomic/fence synchronization and SeqCst fences)
URL: https://doc.rust-lang.org/std/sync/atomic/fn.fence.html
Version: Rust std 1.99.1

> an atomic operation 'X' with (at least) Release ordering semantics on some atomic
object 'm', is paired on thread 2 with: an atomic read 'Y' with any order on 'm', followed
by a fence 'B' with (at least) Acquire ordering semantics. This provides a happens-before
dependence between X and B.

> Note that in the examples above, it is crucial that the access to m are atomic. Fences cannot
be used to establish synchronization between non-atomic accesses in different threads.

> A fence which has SeqCst ordering, in addition to having both Acquire and Release
semantics, participates in the global program order of the other SeqCst operations and/or
fences.

Contents:
- the atomic-release/fence-acquire pairing rule, stated with its own thread diagram: a `Release` store on one thread can hand off to a plain `Relaxed` load plus a separate `Acquire` fence on the other, instead of the load itself carrying `Acquire`
- the mandatory-atomic caveat, in the source's own words: a fence only orders around a real atomic access on both sides; it cannot substitute for atomicity on a non-atomic variable
- the fence's own `SeqCst` variant: it keeps `Acquire`+`Release` and additionally joins the one global order shared with every other `SeqCst` operation or fence

## Atomics (The Rustonomicon — strongly- vs weakly-ordered hardware, store-buffering)
URL: https://doc.rust-lang.org/nomicon/atomics.html
Version: fetched 2026-10-23

> It is common to separate hardware into two categories: strongly-ordered and weakly-ordered.
Most notably x86/64 provides strong ordering guarantees, while ARM
provides weak ordering guarantees.

> Asking for guarantees that are too weak on strongly-ordered hardware is
more likely to happen to work, even though your program is strictly
incorrect. If possible, concurrent algorithms should be tested on
weakly-ordered hardware.

> Sequentially Consistent is the most powerful of all, implying the restrictions
of all other orderings. Intuitively, a sequentially consistent operation
cannot be reordered: all accesses on one thread that happen before and after a
SeqCst access stay before and after it.

> Even on strongly-ordered platforms sequential consistency involves
emitting memory fences.

Contents:
- the hardware split the chapter itself draws: x86/64 is strongly-ordered, ARM is weakly-ordered, and code that is merely under-synchronized can still happen to run correctly on the former while being wrong on the latter
- `SeqCst`'s own description as strictly more restrictive than `Acquire`/`Release`: nothing on either side of a `SeqCst` access, on any thread, can cross it, which is the extra guarantee a store-load (store-buffering / Dekker-style) pattern needs and `Release`/`Acquire` alone cannot give
- the direct statement that `SeqCst` is not free even on x86/64: it still requires real fences to be emitted, which is why the chapter treats it as the safe-but-costly default rather than the normal choice
