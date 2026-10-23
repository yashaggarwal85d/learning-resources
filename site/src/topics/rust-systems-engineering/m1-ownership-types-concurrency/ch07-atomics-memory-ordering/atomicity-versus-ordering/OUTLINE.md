# Outline: Atomicity versus ordering (`rust.atomicity-versus-ordering`)

Chapter 7, topic 22 (first of two). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. State the difference between atomicity (no torn updates) and ordering (visibility between threads) in one sentence each, and explain why a program can have one without the other.
2. State that Rust's atomics follow the C++20 memory model (minus `consume`): happens-before, per-location agreement on a total order of writes, and data races as undefined behavior.
3. Name the Linux kernel's own memory model (LKMM) as a distinct, stricter model that matters only for kernel Rust, deferred to a later chapter.

## Reel steps (storyboard)

1. **"Two separate questions about the same shared memory"** — hook. `fig`: one box of shared memory, two questions written beside it: "did this update tear?" and "what order do other threads see this in?"
2. **"Eight threads, one counter, fifty thousand increments each — any lost?"** (predict) — `fig`: eight thread dots around one `AtomicU64`, each doing many `fetch_add`s with the weakest ordering. Predict: does the final count come out exact? Options: no, some get lost under contention / yes, exactly four hundred thousand (correct) / only with the strongest ordering.
3. **"Exact: four hundred thousand, every time"** — `fig`: `examples/atomic_no_torn_updates.rs`'s real measured count. NO takeaway (first non-predict step after a predict step).
4. **"Atomicity bought that — but it bought nothing about order"** — `fig`: the same counter, reframed: every individual access was atomic, but nothing here claimed anything about *visibility* between threads. Takeaway: "Atomicity means no torn updates on one location; it says nothing about when another thread sees them, or in what order."
5. **"One thread publishes a value, then a flag — does the reader ever see a stale value?"** (predict) — `fig`: thread A stores a value then a ready flag, both relaxed; thread B checks the flag, then reads the value. Predict: can B see the flag as true but the value as stale? Options: no, atomics are always safe / yes, relaxed gives no guarantee here (correct) / only on exotic hardware.
6. **"loom found it: the reader saw the flag before the value"** — `fig`: the real model-checked violation, not a one-off hardware fluke. Takeaway: "Relaxed is atomic, but gives no happens-before edge — a reader can legally see the flag before the data it was supposed to announce."
7. **"The missing piece has a name: happens-before"** — `fig`: the C++20 model Rust's atomics follow, cited directly. Takeaway: "Rust's atomics follow the C++20 memory model, minus consume: happens-before and a per-location agreement on write order are the two guarantees every ordering is built from."
8. **"Unsynchronized conflicting access is undefined behavior, full stop"** — `fig`: the std library's own definition of a data race, quoted directly. Takeaway: "A data race — conflicting, unsynchronized access where at least one side writes — is undefined behavior in Rust, not merely a wrong answer."
9. **"The kernel has its own, stricter model — and it only matters in the kernel"** — `fig`: LKMM named, scoped explicitly out of this chapter. Takeaway: "The Linux kernel's own memory model is distinct and stricter than the one this chapter covers; it matters only for kernel Rust, not here."
10. **Recap** — atomicity and ordering are separable (proved both ways); Rust follows C++20 minus consume; a data race is real UB; LKMM is a different, later concern. Handoff: the next topic builds the one pattern that actually fixes the ordering gap — acquire/release publication — and the one case even that isn't enough for.

## Engagement arc

- Hook: step 1.
- Early prediction: step 2 (within the first four).
- Second prediction: step 5.
- Surprising fact: step 6 (a real, found violation, not a described risk).
- Takeaways: steps 4, 6, 7, 8, 9 (five — step 3 deliberately has none, the test-harness rule).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| Atomicity means no torn updates on one location, even under the weakest ordering | `examples/atomic_no_torn_updates.rs` (executed, exact count every run) |
| Atomicity does not imply any ordering guarantee between threads — a Relaxed publication can be observed out of order | `doc.rust-lang.org/nomicon/atomics.html` (quoted) + `examples/loom-check` (executed, loom finds the real violating interleaving) |
| Rust's atomics follow the same rules as C++20 atomics, minus the "consume" ordering | `doc.rust-lang.org/std/sync/atomic/index.html` (quoted) |
| A data race — conflicting, unsynchronized accesses where at least one is a write — is undefined behavior | `doc.rust-lang.org/std/sync/atomic/index.html` (quoted) |
| `Relaxed`, `Release`, `Acquire`, and `SeqCst` each give a different, named guarantee | `doc.rust-lang.org/std/sync/atomic/enum.Ordering.html` (quoted) |
| A release in one thread and a matching acquire in another establishes causality for every prior write | `doc.rust-lang.org/nomicon/atomics.html` (quoted) |
| LKMM is the Linux kernel's own, distinct memory model, relevant only to kernel Rust | syllabus line itself (→ Ch.39, named and deferred, not built here) |

## Concept ledger

- `introduces`: `atomicity-vs-ordering`, `happens-before-relation`, `data-race-is-ub`
- `uses`: `arc-atomic-refcount`, `send-auto-trait`, `sync-auto-trait`
- `declared`: `threads-and-channels`

## Bridge and handoff

- Bridge: topic 21's own handoff line, reused verbatim: "Four places, and that's the whole list: a value's ownership only ever crosses a thread boundary at a spawn or a send. Chapter 7 asks a different question about the same threads — not who owns what, but what order their operations actually happen in."
- Handoff: "Atomicity and ordering are each precise now, and so is the vocabulary — happens-before, modification order, a data race as real undefined behavior. The one pattern worth building correctly, every time, is publication: writing some data, then telling another thread it's ready. The next topic builds exactly that, and the one case where even that isn't strong enough."
