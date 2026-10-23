# Chapter 4 — Smart Pointers and Interior Mutability (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 1, *Ownership, Types, and Concurrency Primitives*. Chapter 4, section 1.4. Planned 2026-10-23, in one `/make-topic` session, per `.claude/skills/make-topic/SKILL.md`. Previous chapter: Chapter 3, *Traits, Generics, Monomorphization, and Dynamic Dispatch* (all three topics live).

This file is the contract each of the chapter's four topics builds to. Do not edit it once a topic is in progress; record any unavoidable departure under that topic's `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Chapters 1 and 2 gave the learner one owner, or one borrower, at a time. Chapter 3 showed that even a trait object's `Box` was a borrowed-or-boxed detail the chapter never had to examine. This chapter opens that box: what does "shared ownership" actually mean when the borrow checker's single-owner rule isn't the shape a program needs? `Box<T>` is still single ownership, just on the heap. `Rc<T>` and `Arc<T>` are the two ways Rust lets more than one part of a program own the same heap value at once, differing only in whether the refcount is safe to touch from more than one thread — and that safety is not free: an atomic increment is a real, measurable cost once more than one thread actually contends for it. None of the three lets you *mutate* through a shared owner; that needs interior mutability, built on `UnsafeCell` (the one legal way to get a mutable pointer from a shared reference) and its safe wrappers `Cell`, `RefCell`, `OnceCell`/`OnceLock`, and `LazyLock`. Shared ownership has its own failure mode safe Rust does not catch: a reference cycle (`Rc<RefCell<Node>>` pointing at itself through a child-then-parent-then-child path) leaks forever, fixed by `Weak`. The chapter ends on a design smell, not a new type: wrapping a struct in `Arc<Mutex<T>>` until the compiler stops complaining quietly serializes every access to it, and the real alternatives — sharding, an owner task with a channel, or `arc-swap` for read-mostly data — are a design decision, not a type signature.

By the end of the chapter the learner can: choose `Box`, `Rc`, or `Arc` by whether ownership is single, shared on one thread, or shared across threads, and say in one sentence why `Arc::clone` is not always "cheap"; explain why `UnsafeCell` is the only legal way to mutate through `&T`, and place `Cell`, `RefCell`, `OnceCell`/`OnceLock`, and `LazyLock` by what each one actually buys over bare `UnsafeCell`; recognize a reference cycle before it leaks and break it with `Weak`, including building a self-referencing structure with `Rc::new_cyclic`; and recognize `Arc<Mutex<T>>` as a default that serializes a hot path, naming at least one real alternative and when it fits.

## A.2 The order of ideas, and why

1. **Box, Rc, and Arc ownership shapes** (topic 12) — the three heap-ownership shapes themselves, in order of how many owners they allow and what that costs: `Box` (one owner, heap), `Rc` (many owners, one thread, a plain non-atomic refcount, `!Send`), `Arc` (many owners, any thread, an atomic refcount whose cost — a real read-modify-write on a shared cache line — only shows up under contention, measured directly rather than asserted).
2. **Interior mutability: Cell, RefCell, UnsafeCell** (topic 13) — needs (1): `Rc`/`Arc` give many owners a shared `&T`, but `&T` alone can't mutate anything, so this topic asks what actually can. `UnsafeCell` as the one legal escape hatch; `Cell` (copy in, copy out, no borrow tracking needed); `RefCell` (a run-time borrow flag, panicking — not blocking — on conflict, and explicitly `!Sync`, never a substitute for a mutex); `OnceCell`/`OnceLock` and `LazyLock` for one-time initialization.
3. **Reference cycles and Weak** (topic 14) — needs (1) and (2): `Rc<RefCell<Node>>` is exactly the shape that lets two nodes point at each other and never get dropped — safe Rust's one remaining leak. `Weak` as a non-owning reference that breaks the cycle, and `Rc::new_cyclic` for building a structure that needs to reference itself from the start.
4. **Arc<Mutex<T>> as hidden serialization** (topic 15) — needs (1): once shared, cross-thread, mutable state is on the table, this topic names the reflex everyone reaches for first and shows its real cost (every access serialized through one lock, hot-path contention hidden behind a type signature that looks perfectly safe), then the alternatives a design actually has: sharding the data, an owner task reached only through a channel, and `arc-swap`'s RCU-style read-mostly swap. Hands off to Chapter 5 (concurrency primitives proper), where this chapter's `Arc<Mutex<T>>` becomes the baseline every later primitive is measured against.

## A.3 The running example: a small document tree

None of Chapters 1–3's running examples (the byte pipeline, the codec) need shared or cyclic ownership, so this chapter introduces its own, self-contained per topic (no cross-topic imports): a small **document tree** — a node holding some text and a list of children — because shared and cyclic ownership are exactly the shape a tree with parent links needs, and because it is intuitive enough to carry four different wrapper types without the reader losing track of the underlying problem.

- **Topic 12** builds the same node three ways — `Box<Node>` (one parent owns its children outright), `Rc<Node>` (several places hold the same node, single-threaded), `Arc<Node>` (the same, shared across threads) — and measures `Arc::clone`'s real cost under contention with a counted, multi-threaded clone/drop loop against an uncontended baseline, rather than asserting the cost from documentation alone.
- **Topic 13** gives the node a mutable field two ways — `Cell<u32>` for a plain counter, `RefCell<Vec<Node>>` for its children — and reproduces `RefCell`'s real runtime panic on a conflicting double-borrow, plus a `OnceLock`-backed lazy default node.
- **Topic 14** adds a parent link to the same node (`RefCell<Weak<Node>>`), builds a genuine two-node cycle with plain `Rc` to show it leak (via the same counting-allocator technique Chapter 1's leak-safety topic used), then fixes it with `Weak` and builds the identical tree with `Rc::new_cyclic` instead.
- **Topic 15** wraps a small shared counter in `Arc<Mutex<T>>`, measures contention with a multi-threaded increment loop, then rebuilds the identical counter with sharding and with `arc-swap`, measuring the difference.

Every number shown must come from each topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0; confirm against the syllabus baseline of 1.99 and record what actually ran). `arc-swap` is the one external crate this chapter is expected to need (topic 15 only); every other topic uses only `std`. Reuse Chapters 1–3's engineering conventions unchanged: `rustc --edition 2024`, a cargo crate under `examples/` only where an external crate is actually needed, compile-fail examples assert the exact `error[E0xxx]`, "never invent what you didn't run" (`QUALITY.md`).

## A.4 Terms and notation (continuing Chapters 1–3's vocabulary)

Everything in Chapters 1–3 §A.4 still applies. This chapter adds:

- **`Box<T>`**: a single owner's value, moved onto the heap; ownership is exactly as single as an unboxed value's, only the storage differs.
- **`Rc<T>`**: shared ownership of a heap value on one thread, via a plain (non-atomic) reference count; `Rc<T>` is `!Send` because that count isn't safe to touch from two threads at once.
- **`Arc<T>`**: shared ownership across threads, via an atomic reference count; `Send`/`Sync` when `T` is, at the cost of every `clone`/`drop` being a real atomic read-modify-write on a shared cache line — cheap when uncontended, not cheap once several threads actually race for the same count.
- **`UnsafeCell<T>`**: the one primitive that legally allows getting a `*mut T` out of a `&T`; every other interior-mutability type is built on it.
- **`Cell<T>`**: interior mutability by copying a `T` in and out whole, never handing out a reference to the inside; needs no runtime borrow tracking because nothing is ever borrowed.
- **`RefCell<T>`**: interior mutability by handing out tracked `Ref`/`RefMut` guards, checked at run time; two conflicting borrows at once panic, which is why `RefCell` is `!Sync` and explicitly not a substitute for a mutex (a mutex blocks; `RefCell` panics, and only ever within one thread).
- **`OnceCell`/`OnceLock`**: a cell that can be written at most once, after which it's safely read without further checks; `OnceLock` is the `Sync` version, usable from multiple threads (stabilized 1.70).
- **`LazyLock`**: a value computed once, on first access, from a closure supplied up front (stabilized 1.80).
- **Reference cycle**: two or more `Rc`/`RefCell` values pointing at each other such that no one's count ever reaches zero; safe Rust compiles this without complaint, and it leaks for the life of the program.
- **`Weak<T>`**: a non-owning reference to an `Rc`/`Arc`-managed value, upgradable to a real `Rc`/`Arc` only while one still exists; holding a `Weak` never keeps the value alive and never creates a cycle.
- **`Rc::new_cyclic`**: builds an `Rc<T>` while handing the constructor a `Weak` reference to the not-yet-finished value itself, for structures that need to reference themselves from the moment they're created.
- **Hidden serialization**: wrapping shared, mutable, cross-thread state in `Arc<Mutex<T>>` by reflex, which quietly forces every access through one lock regardless of how independent the actual accesses were.
- **Sharding**: splitting one lock's data into several independently-locked pieces, so unrelated accesses no longer contend with each other.
- **Owner task with a channel**: giving one task sole, unshared ownership of the data and reaching it only by sending messages, trading a lock for a queue.
- **`arc-swap` (RCU-style)**: an external crate that lets readers see a consistent snapshot of read-mostly data with no lock at all, by atomically swapping in a whole new `Arc` on write.

Narration words (continuing the convention: no digits, no code-style names spoken): "a box on the heap" for `Box`, "a shared-count pointer" for `Rc`, "a shared-count pointer safe across threads" for `Arc`, "a shared count that needs no lock to touch" vs "a shared count safe to touch from more than one thread" for the refcount contrast, "the one legal way to mutate through a shared reference" for `UnsafeCell`, "copying the value in and out" for `Cell`, "a borrow checked while the program runs, not before" for `RefCell`, "written once, read freely after" for `OnceCell`/`OnceLock`, "computed once, the first time it's touched" for `LazyLock`, "a loop of ownership that never closes" for a reference cycle, "a reference that doesn't keep anything alive" for `Weak`, "splitting one lock into several" for sharding, "one task holds it, everyone else asks" for an owner task and channel.

## A.5 Visual language (continuing Chapters 1–3's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same owner/heap regions, borrow edges, and variance boxes from Chapters 1–3 §A.5. This chapter adds:

- **A refcount dial**: a small box showing a count ticking up on clone and down on drop, drawn once in plain style (`Rc`) and once with a lock-glyph border (`Arc`) to mark "safe across threads, at a cost."
- **A cycle loop**: two node boxes with arrows pointing at each other in a closed loop, redrawn with one arrow turned dashed and hollow-headed (a `Weak` reference) to show the exact same shape no longer leaking.
- **A contention bar**: reused from nowhere in Chapters 1–3 (new to this chapter) — a horizontal bar per thread count, height set by measured clone/drop or lock-acquire cost, always from real numbers in `examples.py`, never simulated.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure, the 600-unit `Svg` canvas kept at `h` 300–400) follows Chapter 1 §A.5 / `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapters 1–3 §A.6: executed `examples.py` compiling real `rustc --edition 2024` sources per topic, self-contained topics, sources fetched and quoted via `scripts/sources.mjs`, registry fields as in Chapters 1–3 (`chapter: { number: 4, title: 'Smart Pointers and Interior Mutability', section: '1.4' }`), topics shipped **in order** (13 only after 12 is live, etc.). Scenes-level lesson from Chapters 2–3 (project memory `learning-resources-scenes-reel-gotchas`): never nest an SVG element directly in a plain `<div>`/`<Stack>` or an HTML element inside an SVG `<g>`; fade HTML children via `<div style={{opacity}}>`; never give the reel's "from" step (the first non-predict step at dot index ≥ 1) a `takeaway`; keep on-screen prose lines short (phone text-overflow). A multi-threaded contention measurement (topic 12, topic 15) must use enough iterations/threads to give a stable, reproducible contrast in this sandbox, and the exact numbers asserted must come from that run, never a guessed ratio — if timing proves too noisy in CI, fall back to a structural proxy (e.g. counting actual atomic operations or lock acquisitions) and say so in `post-notes.md`.

## A.7 The chapter's concept ledger

**Declared** (Chapters 1–3's own declared prerequisite ids, plus Chapters 1–3's *real* introduced ids as they are actually registered in `registry.ts`, not as an earlier draft might guess them — verified by grep immediately before writing this list): `rust-basics`, `stack-and-heap`, `references-basics`, `structs-enums`, `pattern-matching-basics`, `std-collections`, `error-handling-result`, `traits-generics-basics`, `threads-and-channels`, `mutexes`, `closures-basics`; `ownership`, `move-semantics`, `deinitialized-place`, `copy-trait`, `clone-cost`, `move-cost`, `box-ownership`, `ownership-signatures`, `e0382`, `e0505` (topic 1); `drop-trait`, `raii-guard`, `drop-order`, `temporary-scopes`, `edition-2024-temporary-scopes`, `drop-flags`, `mem-forget-manuallydrop`, `leak-safety`, `counting-allocator` (topic 2); `partial-moves`, `e0509-move-out-of-drop-type`, `e0507-move-out-of-borrow`, `take-replace-idioms`, `binding-modes`, `match-ergonomics-2024`, `destructuring-as-transfer` (topic 3); `ownership-topology`, `arc-mutex-reflex`, `tree-ownership`, `generational-arena`, `owner-task-messages`, `move-closures` (topic 4); `aliasing-xor-mutability`, `reborrowing`, `two-phase-borrows` (topic 5); `lifetime-as-constraint`, `lifetime-elision`, `variance-of-references`, `higher-ranked-trait-bounds`, `static-bound-vs-static-ref` (topic 6); `zero-copy-view`, `cow-clone-on-write`, `refcounted-bytes`, `self-referencing-struct` (topic 7); `spawn-requires-static`, `thread-scope-join-guarantee`, `arc-satisfies-static`, `no-sound-async-scope` (topic 8); `monomorphization`, `monomorphization-bloat`, `outlining-inner-function`, `impl-trait-arg-vs-return` (topic 9); `dyn-trait-fat-pointer`, `dyn-compatibility`, `trait-upcasting`, `enum-dispatch` (topic 10); `associated-type-vs-generic-param`, `generic-associated-types`, `orphan-rule-coherence`, `newtype-for-orphan-rule` (topic 11). A topic in this chapter lists in `uses` only the ones it actually relies on. Note: topic 4 already introduced `arc-mutex-reflex` as a named smell; topic 15 deepens it with a real measurement rather than re-introducing the concept — topic 15's own `introduces` is the measured alternatives, not the smell's name.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `box-heap-ownership` | 12 | `Box<T>` is still single ownership, exactly like an unboxed value, just allocated on the heap. |
| `rc-shared-single-thread` | 12 | `Rc<T>` gives many owners on one thread via a plain, non-atomic reference count; `!Send`. |
| `arc-atomic-refcount` | 12 | `Arc<T>` gives many owners across threads via an atomic reference count. |
| `atomic-refcount-contention-cost` | 12 | `Arc::clone`/`drop`'s atomic read-modify-write is cheap uncontended and measurably not cheap under real contention. |
| `unsafecell-foundation` | 13 | `UnsafeCell<T>` is the one legal way to obtain a `*mut T` from a `&T`; every safe interior-mutability type is built on it. |
| `cell-copy-semantics` | 13 | `Cell<T>` mutates by copying a whole `T` in and out, needing no runtime borrow tracking. |
| `refcell-runtime-borrow-check` | 13 | `RefCell<T>` tracks borrows at run time and panics on a conflicting double-borrow; `!Sync`, not a synchronization primitive. |
| `oncecell-lazylock-init` | 13 | `OnceCell`/`OnceLock` write once then read freely; `LazyLock` computes its value once, on first access. |
| `reference-cycle-leak` | 14 | Safe Rust compiles a cycle of `Rc`/`RefCell` values pointing at each other, and it leaks forever: no count ever reaches zero. |
| `weak-reference` | 14 | `Weak<T>` is a non-owning reference, upgradable only while a real owner still exists, that breaks a cycle without creating one. |
| `rc-new-cyclic` | 14 | `Rc::new_cyclic` builds a value while handing its constructor a `Weak` reference to itself, for genuinely self-referencing structures. |
| `sharding-alternative` | 15 | Splitting one lock's data into several independently-locked pieces so unrelated accesses stop contending. |
| `owner-task-channel-alternative` | 15 | Giving one task sole ownership of the data, reached only through a channel, trading a lock for a queue. |
| `arc-swap-rcu-alternative` | 15 | `arc-swap`'s RCU-style atomic swap lets readers see a consistent snapshot of read-mostly data with no lock at all. |

## A.8 Bridges and handoffs

- **12** bridges from Chapter 3 topic 11's handoff ("every `dyn Trait` value this chapter built was borrowed or already behind a `Box`; Chapter 4 asks what shape of ownership that `Box` actually is, and what `Rc`/`Arc` add when one owner stops being enough") and opens on the same node built three ways. Hands off to 13: "none of `Box`, `Rc`, or `Arc` let you mutate through a shared owner on their own — `&T` is still `&T`. What actually makes that legal?"
- **13** bridges from 12's handoff and opens on giving the shared node a mutable field. Hands off to 14: "a node that can point at its own children, mutably, through `RefCell`, can also be made to point back at its parent. What happens once two of those point at each other?"
- **14** bridges from 13's handoff and opens on building that exact cycle, leaking, then fixing it with `Weak`. Hands off to 15: "every shared value in this chapter so far lived on one thread's worth of logic at a time, even when `Arc` made it legal to share across threads. The next, final step is what happens when more than one thread actually touches the same mutable, shared state at once."
- **15** bridges from 14's handoff and opens on the `Arc<Mutex<T>>` reflex. Hands off to Chapter 5 (concurrency primitives): "`Arc<Mutex<T>>` is the simplest tool that is correct by construction; the next chapter asks what the other primitives — channels, atomics, condition variables — actually buy over just reaching for a mutex every time."

## A.9 Primary sources to start from (topics must re-fetch and verify)

- *The Rust Programming Language* ch. 15 (`Box`, `Rc`, `RefCell`, reference cycles and `Weak`) — baseline for topics 12, 13, 14.
- The `std` API docs for `Rc`, `Arc`, `Cell`, `RefCell`, `UnsafeCell`, `OnceCell`/`OnceLock`, `LazyLock`, and `Weak` — exact stabilization versions and the precise safety/panic wording.
- The Rustonomicon's chapter on `UnsafeCell` / interior mutability, for why `&T` → `*mut T` is otherwise illegal.
- The `arc-swap` crate's own README/docs, if topic 15 uses it for the RCU-style alternative; otherwise a plain `std::sync::RwLock`-based proxy with the limitation noted.
- The Rust std docs' own stabilization notes for `OnceLock` (1.70) and `LazyLock` (1.80), verified against the current stable changelog.
