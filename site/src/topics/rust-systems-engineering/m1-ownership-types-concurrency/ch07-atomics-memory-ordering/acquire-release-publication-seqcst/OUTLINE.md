# Outline: Acquire/release publication, and when SeqCst is required (`rust.acquire-release-publication-seqcst`)

Chapter 7, topic 23 (second of two, closes Chapter 7 and Milestone 1). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Apply the publication pattern correctly: a `Release` store of the data-carrying flag, paired with an `Acquire` load of that same flag, establishes a happens-before edge and fixes the Chapter 7 opening topic's race.
2. Explain why fixing only one side of a `Release`/`Acquire` pair (the store, or the load, but not both) does not establish that edge, and why `Relaxed` remains the right choice when nothing is actually being handed off between threads.
3. State the one extra guarantee `SeqCst` gives beyond `Release`/`Acquire` — a single total order every thread agrees on — and why a store-load (Dekker / store-buffer) litmus test needs exactly that guarantee.
4. Name `fence`/`compiler_fence` as carrying the same acquire/release handoff without being attached to a specific atomic operation, and name x86-TSO vs ARM as the reason an under-synchronized program can pass on one and fail on the other.

## Reel steps (storyboard)

1. **"Last topic's race, fixed with two words"** — hook. `fig`: the Relaxed publication race from `rust.atomicity-versus-ordering` recapped in one line, the two missing words highlighted: `Release`, `Acquire`.
2. **"Release-store the flag, acquire-load it back — does that fix it?"** (predict) — `fig`: the same data/flag pair, now with `Release` on the store and `Acquire` on the load. Options: no, atomics can't be fixed this way / yes, that's exactly the pairing (correct) / only if the data itself is also atomic.
3. **"Fixed: loom finds no violation"** — `fig`: `examples/ordering-check/release_acquire_fix.rs`, loom exhaustively checked, no interleaving where the flag is true and the data is still 0. NO takeaway (first non-predict step after a predict step).
4. **"Release orders everything before it; acquire orders everything after it"** — `fig`: the pairing rule itself, quoted from the std docs. Takeaway: "A `Release` store orders every earlier write on its thread before any `Acquire` (or stronger) load that observes it; that load then orders every later operation on its own thread after that store."
5. **"Fixing only the write side doesn't work either"** — `fig`: `half_fixed_still_races.rs` — the store stays `Release`, but the load stays `Relaxed`. loom still finds the race. Takeaway: "Both sides have to opt in. A `Release` store only promises visibility to a load that is itself `Acquire` or stronger; a `Relaxed` load never asked for that promise."
6. **"Two threads, two flags, no shared leader — does Release/Acquire still hold?"** (predict) — `fig`: the store-buffering (Dekker) shape: thread 1 stores to `x` then loads `y`; thread 2 stores to `y` then loads `x`, every access `Release`/`Acquire`. Predict: can both loads still see 0? Options: no, Release/Acquire rules that out / yes, Release/Acquire only orders pairs, not every thread at once (correct) / only without `Arc`.
7. **"loom finds it: both loads see 0, Release/Acquire everywhere"** — `fig`: `store_buffering_acqrel.rs`'s real found violation. NO takeaway (a takeaway on this step was found, during verification, to squeeze the phone Visual pane mid-test and break the reel smoke test's text-bounds check — moved to step 8 instead).
8. **"SeqCst adds the one thing missing: one order, every thread agrees"** — `fig`: `store_buffering_seqcst.rs`, every access upgraded to `SeqCst`, the std docs' and the nomicon's own stated total-order guarantee. Takeaway: "`SeqCst` keeps every `Acquire`/`Release` guarantee and adds one more: every thread agrees on a single order of every `SeqCst` operation, which is the only thing that rules out a store-buffering pattern seeing nothing from either side."
9. **"A fence carries the same handoff without touching the atomic op"** — `fig`: `fence_spinlock.rs`'s spinlock — `compare_exchange_weak` stays `Relaxed`, a separate `fence(Acquire)` does the acquire half, `Release` does the store in unlock. Takeaway: "A fence pairs with a matching atomic operation or fence the same way `Release` pairs with `Acquire`; it just isn't attached to one specific access."
10. **"Relaxed is still right when nothing is being handed off"** — `fig`: `relaxed_independent_counters.rs` — eight threads, independent counters, no publication between them. Takeaway: "`Relaxed` is the correct choice, not a shortcut, whenever a value's final state only depends on operations on that same location — nothing is being published, so there is nothing for a stronger ordering to add."
11. **Recap** — the publication pattern is `Release` store paired with `Acquire` load, both sides; `SeqCst` is for when a single global order is the actual requirement, not a safety margin; fences carry the same handoff off the atomic op itself; `Relaxed` is still correct for independent counters; x86-TSO can hide a missing ordering that ARM exposes. Handoff: Milestone 1 closes here; Chapter 7's second half and Milestone 2 open with lock-free building blocks.

## Engagement arc

- Hook: step 1.
- Early prediction: step 2 (within the first four).
- Second prediction: step 6.
- Surprising fact: step 7 (a real, found violation under Release/Acquire everywhere, not a described risk).
- Takeaways: steps 4, 5, 8, 9, 10 (five — step 3 deliberately has none, the test-harness rule; step 7 lost its takeaway during verification, see step 7's note above).
- Recap: step 11.

## Claims list

| Claim | Source |
|---|---|
| A `Release` store paired with an `Acquire` load on the same location establishes a happens-before edge and fixes the previous topic's publication race | `examples/ordering-check/release_acquire_fix.rs` (loom model-checked, no violation found) |
| `Release` orders every earlier write on its thread before a matching `Acquire`-or-stronger load; `Acquire` orders every later operation after a matching `Release`-or-stronger store | `doc.rust-lang.org/std/sync/atomic/enum.Ordering.html` (quoted) |
| Fixing only the write side (`Release` store, `Relaxed` load) does not establish the happens-before edge | `examples/ordering-check/half_fixed_still_races.rs` (loom model-checked, violation still found) |
| `Release`/`Acquire` orders a single pair, not a global order across every thread — a store-buffering (Dekker-style) litmus test can still see both loads read 0 | `examples/ordering-check/store_buffering_acqrel.rs` (loom model-checked, violation found) |
| `SeqCst` adds the one extra guarantee `Release`/`Acquire` doesn't give: every thread agrees on a single order of every `SeqCst` operation | `doc.rust-lang.org/std/sync/atomic/enum.Ordering.html` + `doc.rust-lang.org/nomicon/atomics.html` (quoted; not loom-checked — loom's own test suite documents this exact store-buffering shape as a known modeling gap) |
| A fence creates the same atomic-release/acquire or fence-release/acquire handoff as a `Release`/`Acquire` pair, without being attached to one specific atomic operation; fences cannot synchronize non-atomic accesses on their own | `doc.rust-lang.org/std/sync/atomic/fn.fence.html` (quoted) + `examples/fence_spinlock.rs` (executed, exact count every run) |
| `Relaxed` remains the correct ordering, not merely a weaker one, when nothing is being published between threads | `examples/relaxed_independent_counters.rs` (executed, exact count every run) |
| x86/64 is strongly-ordered and ARM is weakly-ordered; code that is actually under-synchronized can still happen to run correctly on the former while being wrong on the latter | `doc.rust-lang.org/nomicon/atomics.html` (quoted) |

## Concept ledger

- `introduces`: `acquire-release-publication`, `seqcst-store-load-litmus`, `ordering-hardware-mapping` (per `CHAPTER.md` §A.7's concept table — this topic's ids, authoritative)
- `uses`: `atomicity-vs-ordering`, `happens-before-relation`, `data-race-is-ub`
- `declared`: (none — every concept this topic needs was introduced by `rust.atomicity-versus-ordering`)

## Bridge and handoff

- Bridge: topic 22's own handoff line, reused verbatim: "Atomicity and ordering are each precise now, and so is the vocabulary — happens-before, modification order, a data race as real undefined behavior. The one pattern worth building correctly, every time, is publication: writing some data, then telling another thread it's ready. The next topic builds exactly that, and the one case where even that isn't strong enough."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim (it closes Milestone 1): "Every guarantee in this chapter was about memory becoming visible between threads that already exist and are already running. The next question is different in kind: what does it mean for a unit of work to not be running at all yet, and for something else entirely — not a thread, a scheduler — to decide when it starts again?"
