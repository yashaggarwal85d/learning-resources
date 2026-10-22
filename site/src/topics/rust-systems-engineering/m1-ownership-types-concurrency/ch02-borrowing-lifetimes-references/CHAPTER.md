# Chapter 2 — Borrowing, Lifetimes, and References (chapter plan)

Domain: Rust Systems Engineering (`rust.`). Milestone 1, *Ownership, Types, and Concurrency Primitives*. Chapter 2, section 1.2. Planned 2026-10-22, in one `/make-topic` session (the owner retired the parallel-run routine on 2026-10-20; this plan replaces that process, not its format). Previous chapter: Chapter 1, *Ownership and Moves* (all four topics live).

This file is the contract each of the chapter's four topics builds to. Do not edit it once a topic is in progress; record any unavoidable departure under that topic's `OUTLINE.md` → "Changes from the chapter plan".

## A.1 The problem it solves

Chapter 1 gave the learner the owner's side of the model: exactly one owner, a move hands that ownership on, the owner's scope end destroys the value. That model says nothing yet about *looking at* a value you don't own. This chapter is the other half: the compiler's rule for who may look, and for how long. "Aliasing XOR mutability" (many `&T` or one `&mut T`, never both) is the data-race-freedom invariant the whole language stands on; a lifetime is not a second kind of ownership but a *constraint* — a provable relationship between how long references exist relative to the data they point to — and the checker's elision, variance and `'static` rules exist to make that constraint usable without spelling it out everywhere. The chapter ends at the one place borrows get hard to type at all: a reference that must outlive the function that created it, which is where threads, tasks and self-referential data push back on the model, and where zero-copy parsing lives or dies by it.

By the end of the chapter the learner can: explain why the aliasing rule is what gives the optimizer `noalias` and the program data-race freedom (not merely "the compiler is being pedantic"); read a reborrow and a two-phase borrow in code they didn't write; say what a lifetime parameter actually constrains and predict elision without running rustc; place `&'a T` vs `&'a mut T` vs `Cell<T>` on the variance axis and explain one real failure each causes; choose between a borrowed view, `Cow`, an owned buffer and `bytes::Bytes` for a parsing workload from first principles; and know why `'static` is almost never the fix for a lifetime error it appears to solve.

## A.2 The order of ideas, and why

1. **Aliasing XOR mutability** (topic 5) — the invariant itself: many `&T` or exactly one `&mut T`, never both, and what it buys (data-race freedom, `noalias`). Needs Chapter 1's borrow-as-contract (declared) and now gives the *rule behind* that contract. Introduces reborrowing and two-phase borrows as the two places the rule looks more permissive than it is.
2. **Lifetimes as constraints, not durations** (topic 6) — needs (1): once "many reads xor one write" is fixed, the question becomes *for how long*, and a lifetime is the compiler's name for a span of that relationship, never a change to when a value is dropped (Chapter 1's territory, untouched). Elision, variance, higher-ranked bounds, and why `T: 'static` is a bound on content, not a promise of immortality.
3. **Zero-copy parsing with borrowed views** (topic 7) — needs (1) and (2) applied to a whole design: a parser that returns `&'a [u8]` views into its input is the sharing side of the rule (many readers, nothing mutates underneath them) wearing a concrete shape, and every alternative (`Cow`, owned `Vec<u8>`, `Bytes`, a self-referential struct) is a different answer to "what if the borrow can't live as long as I need".
4. **Borrows across thread and task boundaries** (topic 8) — needs all three: the reason `thread::spawn`/`tokio::spawn` want `'static` is that a lifetime is a relationship the compiler can prove only while it can see both ends, and spawned work escapes its caller's frame. `thread::scope` is a borrow-friendly loophole the checker can still prove; async has no sound equivalent, which sends the learner back to owned data or `Arc` — exactly where Chapter 1's topology topic (4) said to look first, not last. Hands off to Chapter 3, where generics and trait bounds (`for<'a> Fn(&'a T)` already seen here) become the main event.

## A.3 The running example: the byte pipeline grows a parser

Chapter 1's pipeline (`Buf`, `Header`, `Pool`, `fill`/`inspect`/`consume`, the counting allocator) continues verbatim — every topic may `use` it by reproducing the needed pieces from Chapter 1's `CHAPTER.md` §A.3 (topics are self-contained; no cross-topic imports), relabelled for this chapter's question: instead of "who owns the buffer", "who may read or write it, and for how long". Each topic adds only what it needs:

- **Topic 5** adds nothing new structurally; it re-runs `fill`/`inspect` concurrently in the type system (two `&Buf` views of `inspect` outstanding at once; one `&mut Buf` to `fill`; the two-phase borrow in `v.push(v.len())`-shaped code, e.g. `pool.free.push(pool.free.len())`-style self-referential-looking calls) and shows what the borrow checker accepts and what it must reject, plus a `noalias`-sensitive optimization (LLVL IR or a measured speed difference) that a raw-pointer aliasing violation would corrupt.
- **Topic 6** introduces `fn describe<'a>(h: &'a Header) -> &'a str`-shaped signatures over the pipeline's `Header`, a `Cell<u8>` kind field to show invariance, and a `for<'a> Fn(&'a Header)` callback used by `Pool`/pipeline code.
- **Topic 7** adds `fn parse_header(buf: &[u8]) -> Header<'a>`-style zero-copy parsing of the wire format `inspect` already reads (`bytes[0]`, `bytes[1..5]` little-endian), a `Cow<'a, [u8]>` and `bytes::Bytes` variant of the same parse, and a minimal self-referential struct that fails to compile, motivating `yoke`/`ouroboros` as named (not built) production answers.
- **Topic 8** moves the pipeline's three stages onto `thread::spawn`/`std::thread::scope`/`tokio::spawn`, showing the `'static` bound bite on a borrowed `Pool`, the `thread::scope` fix, and why the async spawn has no scoped equivalent (moves owned data or `Arc<Pool>` instead — the Chapter-1 topology call, now paid off).

Every number shown must come from each topic's own executed `examples.py` on the current stable toolchain (container has rustc 1.97.0; confirm against the syllabus baseline of 1.99 and record what actually ran). Reuse Chapter 1 §A.6's engineering conventions unchanged: `rustc --edition 2024`, compile-fail examples assert the exact `error[E0xxx]`, `test:examples` runs only `examples.py`.

## A.4 Terms and notation (continuing Chapter 1's vocabulary)

Everything in Chapter 1 §A.4 still applies (owner, handle/payload, move, copy/clone, borrow/loan, destructor, leak, guard, topology, E-codes, units). This chapter adds:

- **aliasing**: more than one live reference to the same place. The rule is **aliasing XOR mutability**: a place may have many live shared references or exactly one live exclusive reference, never both at once — never "mutable XOR shared" alone, state the "aliasing" half every time, since that is the half the optimizer relies on.
- **reborrow**: creating a new, shorter-lived borrow from an existing `&mut` (or `&`) reference, so the original is usable again once the reborrow ends; written `&mut *r` explicitly or produced implicitly at a call site (`foo(r)` where `foo` expects `&mut T` and `r: &mut T`).
- **two-phase borrow**: an exclusive borrow created for a method call (e.g. `v.push(...)`) is "reserved" during evaluation of the call's arguments (shared reads are still allowed) and only becomes fully exclusive at the call itself — why `v.push(v.len())` compiles.
- **lifetime** (as in the Rust Reference / Nomicon, not a duration): a name for a region of code throughout which a reference is valid; a *constraint* the checker proves between existing borrows, never something that extends how long a value lives. Never say a lifetime "keeps a value alive" — a lifetime describes a relationship; the value's actual lifespan is Chapter 1's territory (drop, ownership).
- **elision**: the compiler-filled lifetime parameters under the three elision rules (each input reference gets its own lifetime parameter; with exactly one input lifetime, it is assigned to every elided output; with a `&self`/`&mut self` parameter, its lifetime is assigned to every elided output).
- **variance**: how subtyping of a generic parameter relates to subtyping of the whole type. `&'a T` is **covariant** in both `'a` and `T`; `&'a mut T` is **invariant** in `T` (and covariant in `'a`); `Cell<T>`/`RefCell<T>`/`UnsafeCell<T>` are invariant in `T`. "Invariance bites" names the familiar failure: a `&mut &'a T` or a `Cell<&'a T>` cannot be used where a shorter-lived version was expected, even though `&'a T` alone could.
- **higher-ranked bound**: `for<'a> Fn(&'a T)` — a bound that holds for *every* lifetime `'a`, not one fixed lifetime chosen by the caller; needed for closures/fns taking a borrow whose lifetime isn't nameable at the bound's declaration site.
- **`'static`**: as a lifetime *of a reference* (`&'static T`), the data is valid for the whole program (string literals, `const`/`static` items, leaked allocations). As a *trait bound* (`T: 'static`), it means "T contains no non-`'static` borrows" — the type could be owned forever, not that a value of it already is; conflating the two is the chapter's named error-message trap.
- **borrowed view**: a reference (or slice of references) into data owned elsewhere, carrying that owner's lifetime; **zero-copy** describes a parser or transform that returns borrowed views instead of allocating new owned data.

Narration words (plan + chapter 1 convention: no digits, no code-style names spoken): "the aliasing rule", "an exclusive borrow"/"a shared borrow" (never "mutable"/"immutable" without saying once that rustc's own wording means exclusive), "a reborrow", "a two phase borrow", "a lifetime", "elision", "variance", "invariant in", "a higher ranked bound", "static" for `'static` as a lifetime, "holds no borrows shorter than static" for the `T: 'static` bound, "a borrowed view", "zero copy", "cow" for `Cow`, "bytes" (the crate) said as "the bytes crate" once, then "a ref-counted buffer".

## A.5 Visual language (continuing Chapter 1's kit grammar)

Same kit (`site/src/reels/kit.tsx`, `anim.ts`), same owner/heap regions, same move/clone/drop marks from Chapter 1 §A.5. This chapter adds:

- **Borrow edges carry a lifetime tag**: a small `'a`-style label in `C.latte` (shared) or `C.cinnamon` (exclusive) at the edge's midpoint, appearing only when the step is about lifetimes (topics 6–8); topic 5 uses the plain dashed edges from Chapter 1 with no tag, since its question is arity (how many), not duration.
- **A reborrow** is drawn as the original edge fading to `C.taupe` while a new, shorter dashed edge grows from the same source — same visual family as a Chapter-1 move, but the source is not marked `moved`, since the original binding is still owned and reusable once the reborrow ends.
- **Variance** gets its own small diagram: two nested boxes (outer = the longer lifetime, inner = the shorter) with an arrow showing whether substituting the inner for the outer is accepted (covariant, arrow solid `C.caramel`) or rejected (invariant, arrow `C.cherry` with the code the compiler gives).
- **`noalias`**: shown as a code/IR panel (`Code`, ≤8 lines) next to the drawing, never invented prose about what LLVM does beyond what `examples.py` actually captures from compiled output.
- Everything else (accents at most two per step, `Code` panels, colour-only-for-failure) follows Chapter 1 §A.5 and `DESIGN.md` unchanged.

## A.6 Engineering conventions

Unchanged from Chapter 1 §A.6: executed `examples.py` compiling real `rustc --edition 2024` sources per topic, self-contained topics (copy shared code, don't import sibling topics), sources fetched and quoted via `scripts/sources.mjs`, registry fields as in Chapter 1 (same `milestone`, `chapter: { number: 2, title: 'Borrowing, Lifetimes, and References', section: '1.2' }`), topics shipped **in order** (6 only after 5 is live, etc. — single session now, so this is sequencing, not a merge race).

## A.7 The chapter's concept ledger

**Declared** (Chapter 1's own declared ids, plus Chapter 1's *real* introduced ids as they are actually registered in `registry.ts`, not as an earlier draft of this plan guessed them): `rust-basics`, `stack-and-heap`, `references-basics`, `structs-enums`, `pattern-matching-basics`, `std-collections`, `error-handling-result`, `traits-generics-basics`, `threads-and-channels`, `mutexes`, `closures-basics`; `ownership`, `move-semantics`, `deinitialized-place`, `copy-trait`, `clone-cost`, `box-ownership`, `ownership-signatures`, `e0382`, `e0505` (topic 1); `drop-trait`, `raii-guard`, `drop-order`, `temporary-scopes`, `edition-2024-temporary-scopes`, `drop-flags`, `mem-forget-manuallydrop`, `leak-safety`, `counting-allocator` (topic 2); `partial-moves`, `e0509-move-out-of-drop-type`, `e0507-move-out-of-borrow`, `take-replace-idioms`, `binding-modes`, `match-ergonomics-2024`, `destructuring-as-transfer` (topic 3); `ownership-topology`, `arc-mutex-reflex`, `tree-ownership`, `generational-arena`, `owner-task-messages`, `move-closures` (topic 4). A topic in this chapter lists in `uses` only the ones it actually relies on.

**Introduced in this chapter:**

| id | Introduced by | Meaning |
|---|---|---|
| `aliasing-xor-mutability` | 5 | Many `&T` or exactly one `&mut T` on the same place, never both live at once; the source of data-race freedom and `noalias`. |
| `reborrowing` | 5 | A shorter-lived borrow carved from an existing `&mut`/`&`, implicit at call sites, so the original is usable again after. |
| `two-phase-borrows` | 5 | An exclusive borrow "reserved" during argument evaluation and only exclusive at the call, enabling `v.push(v.len())`. |
| `lifetime-as-constraint` | 6 | A lifetime names a region a reference is valid in; it constrains how existing references relate and never extends a value's life. |
| `lifetime-elision` | 6 | The three compiler-filled rules for input/output lifetime parameters. |
| `variance-of-references` | 6 | `&'a T` covariant; `&'a mut T`, `Cell<T>` invariant in `T`; why invariance rejects code covariance would accept. |
| `higher-ranked-trait-bounds` | 6 | `for<'a> Fn(&'a T)`: a bound holding for every lifetime, not one chosen by the caller. |
| `static-bound-vs-static-ref` | 6 | `T: 'static` ("no non-static borrows in T") vs `&'static T` (this data lives for the program); why the bound is rarely the right fix. |
| `zero-copy-views` | 7 | Returning `&'a [u8]`/borrowed-view types from a parser instead of allocating owned copies. |
| `cow-vs-borrowed-vs-owned` | 7 | `Cow<'a, [u8]>` vs `&'a [u8]` vs owned `Vec<u8>` as three answers to "might I need to mutate or outlive the borrow". |
| `refcounted-zero-copy` | 7 | `bytes::Bytes`-style ref-counted buffers for when a borrow can't be proven to outlive its source (network/async code). |
| `self-referential-structs` | 7 | Why a struct holding both data and a reference into itself doesn't compile under the ownership/borrow model, and why `yoke`/`ouroboros` exist. |
| `static-bound-for-spawn` | 8 | Why `thread::spawn`/`tokio::spawn` require `'static` data: the spawned work can outlive the caller's frame. |
| `scoped-threads` | 8 | `std::thread::scope`: a borrow-friendly spawn the checker can prove joins before the borrow ends. |
| `no-sound-scoped-async-spawn` | 8 | Why async has no sound scoped-spawn equivalent (futures may be leaked without running), pushing to owned data or `Arc`. |

## A.8 Bridges and handoffs

- **5** bridges from topic 4's close (ownership topology still *lends* things out) and opens on: every topology you chose still has to answer "how many borrows, of what kind, at once" — that's the aliasing rule. Hands off to 6: "the rule says *how many*; it says nothing yet about *how long* — that's a lifetime."
- **6** bridges from 5's handoff and opens on a signature with no lifetime written that still has one. Hands off to 7: "every lifetime so far named one reference; a parser returns many, all borrowed from one buffer — what shape does that take?"
- **7** bridges from 6's handoff and opens on `parse_header`'s zero-copy signature. Hands off to 8: "every view here died with its buffer's scope — what happens when the reader is a different thread, which doesn't share that scope at all?"
- **8** bridges from 7's handoff and opens on spawning the pipeline's stages. Hands off to Chapter 3 (`rust.monomorphization-costs`): "a `for<'a> Fn(&'a T)` bound already showed a function written once for every lifetime; Chapter 3 asks what 'written once' costs when the parameter is a type, not a lifetime."

## A.9 Primary sources to start from (topics must re-fetch and verify)

- *The Rust Programming Language* ch. 4 (ownership/references) and ch. 10.3 (lifetimes) — baseline, not primary for the advanced claims.
- The Rust Reference: "Lifetime elision", "Subtyping and variance", "Special types and traits" (`'static`).
- The Rustonomicon: "Aliasing", "Lifetimes", "Subtyping and Variance", "Higher-Rank Trait Bounds".
- `std::cell::Cell`/`RefCell` docs (interior mutability as the invariance example's motivation, taught fully in Ch.4 — here only as much as variance needs).
- `bytes` crate docs (`Bytes`), `yoke` and `ouroboros` crate docs (named, not built).
- Two-phase borrows: the original RFC/tracking issue and current reference wording (check it hasn't changed under NLL/Polonius work).
- `std::thread::scope` docs; `tokio::spawn` docs on its `'static` bound; an async-cancellation/leak write-up (e.g. the `std::mem::forget`-can-leak-a-future discussion in the async working group's docs) for why scoped async spawn is unsound.
