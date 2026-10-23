# Outline: Interior mutability: Cell, RefCell, UnsafeCell (`rust.interior-mutability-cell-refcell`)

Chapter 4, topic 13. Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Name `UnsafeCell` as the one legal way to obtain a mutable pointer from a shared reference, and say that every safe interior-mutability type is built on it.
2. Use `Cell<T>` where values are copied in and out, needing no runtime borrow tracking.
3. Use `RefCell<T>` where borrows are tracked at run time, reproduce its real panic on a conflicting double borrow, and place `OnceCell`/`OnceLock` and `LazyLock` as one-time-initialization tools built the same way.

## Reel steps (storyboard)

1. **"The one legal way to mutate through &T"** — `fig`: `UnsafeCellFig`. `examples/unsafecell_basics.rs`: a counter mutated through `&self` via `UnsafeCell::get`. Takeaway: "UnsafeCell is the one legal way to get a mutable pointer from a shared reference; every safe interior-mutability type is built on it."
2. **"Mutate through &self, with no cell type at all"** (predict) — `fig`: `NoCellFail`. `examples/counter_without_unsafecell_fail.rs`: the identical shape, `value: u32` with no `UnsafeCell`. Predict: compiles, but is undefined behavior / fails to compile outright, before UB ever enters it (correct) / compiles only in release mode / fails, but only because u32 is Copy. Correct: `error[E0594]`, cannot assign to `self.value` through a `&` reference.
3. **"Cell copies the whole value, in and out"** — `fig`: `CellCopy`. `examples/cell_basics.rs`: `Cell::set`/`get`/`replace`. No takeaway (this is the reel's "from" step).
4. **"RefCell tracks borrows while the program runs"** — `fig`: `RefCellTracked`. `examples/refcell_children.rs`: `borrow_mut`/`borrow` on a `RefCell<Vec<String>>`. Takeaway: "RefCell checks borrows at run time, not compile time, and a conflicting borrow panics instead of refusing to compile."
5. **"A shared borrow is still alive — then borrow_mut"** (predict) — `fig`: `DoubleBorrowFail`. `examples/refcell_double_borrow_fail.rs`. Predict: compiles and silently returns stale data / panics at run time, naming the conflict (correct) / blocks until the first borrow ends / fails to compile. Correct: panics, exit code 101, "already borrowed."
6. **"Written once, computed once"** — `fig`: `OnceLazy`. `examples/oncelock_lazy_init.rs`: `OnceLock::get_or_init` and `LazyLock::new`. Takeaway: "OnceCell/OnceLock write once then read freely; LazyLock computes its value once, the first time it's touched."
7. **Recap** — `UnsafeCell` is the one legal way to mutate through `&T`; `Cell` copies values whole, needing no tracking; `RefCell` tracks borrows at run time and panics on conflict, `!Sync`; `OnceCell`/`OnceLock` write once then read freely, `LazyLock` computes once on first touch. Handoff to topic 14: a `RefCell` holding a reference back to its own parent is exactly the shape that can leak forever — what happens when two of these point at each other?

## Engagement arc

- Hook: step 1, opening on the one escape hatch everything else is built on.
- Early predictions: step 2 (within the first four).
- Surprising fact: step 5's real runtime panic, rather than a compile error, is the surprising contrast with every other failure mode this chapter and the last one have shown.
- Takeaways: steps 1, 4, 6 (three; steps 2, 5's predicts explain themselves, step 3 carries its point without a separate takeaway line).
- Recap: step 7.

## Claims list

| Claim | Source |
|---|---|
| `UnsafeCell<T>` is the core primitive interior mutability is built on; it is the one type that lets `&T` point at data being mutated | `unsafecell-docs` + `examples/unsafecell_basics.rs` (executed) |
| Without a cell type, mutating through `&self` is rejected as an ordinary borrow-check error | expert knowledge + `examples/counter_without_unsafecell_fail.rs` (executed, real `E0594`) |
| `Cell`/`RefCell`/`OnceCell` allow interior mutability on one thread only, because none of them implement `Sync` | `cell-module-overview` + `examples/cell_basics.rs` (executed) |
| `RefCell`'s `borrow`/`borrow_mut` check Rust's borrow rules at run time, and a live `borrow_mut` guard excludes every other borrow until it is dropped | `refcell-docs` + `examples/refcell_children.rs` (executed) |
| A conflicting double borrow panics the thread rather than refusing to compile | `cell-module-overview` + `refcell-docs` + `examples/refcell_double_borrow_fail.rs` (executed, real runtime panic, exit code 101) |
| `OnceLock` was stabilized in Rust 1.70.0; `LazyLock` was stabilized in Rust 1.80.0 | `rust-releases` + `examples/oncelock_lazy_init.rs` (executed) |

## Concept ledger

- `introduces`: `unsafecell-foundation`, `cell-copy-semantics`, `refcell-runtime-borrow-check`, `oncecell-lazylock-init`
- `uses`: `rc-shared-single-thread`
- `declared`: `structs-enums`, `error-handling-result`

## Bridge and handoff

- Bridge: "None of Box, Rc, or Arc let you mutate through a shared owner on their own — &T is still &T. What actually makes that legal?" (`CHAPTER.md` §A.8, reused verbatim.)
- Handoff: "A node that can point at its own children, mutably, through RefCell, can also be made to point back at its parent. What happens once two of those point at each other?" (`CHAPTER.md` §A.8, reused verbatim.)
