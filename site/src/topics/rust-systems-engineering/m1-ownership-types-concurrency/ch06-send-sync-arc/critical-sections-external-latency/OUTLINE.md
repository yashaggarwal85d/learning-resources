# Outline: Critical sections and external latency (`rust.critical-sections-external-latency`)

Chapter 6, topic 20 (last of the chapter's three so far). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. State the rule precisely: never do I/O inside a critical section, because the lock then serializes the external call's latency, not just the memory access it was meant to protect — and predict/measure the slowdown.
2. Explain lock ordering as the fix for a two-lock deadlock (the circular-wait shape), and tell a deadlock apart from a lock convoy (both threads still make progress in a convoy; neither does in a deadlock).
3. Name priority inversion and its fix (priority inheritance), and say why it is a performance/liveness problem, not a memory-safety one — Rust's type system has nothing to say about any of lock ordering, convoys, or inversion.

## Reel steps (storyboard)

1. **"A lock's only job is synchronizing memory"** — hook, reusing topic 19's own handoff line almost verbatim. `fig`: the critical section box, holding only a memory read/write. Bridges straight into "what if something else goes in there?"
2. **"Four threads, one 'network call' each, inside the lock"** (predict) — `fig`: four thread dots behind one lock, each needing a simulated 40ms external call while holding it. Predict: roughly how long does the whole thing take? Options: ~40ms / ~160ms (correct) / instant / "depends on the OS scheduler".
3. **"Measured: 161 milliseconds"** — `fig`: a timing bar, ~4x one call's width. `examples/io_inside_critical_section.rs`, the real measured number. NO takeaway on this step (it is the reel's first non-predict step after a predict step, which a real test-harness bug makes unsafe to give a takeaway to — see `scenes-reel-gotchas` memory).
4. **"Move the call outside the lock"** — `fig`: the same four calls, same lock, call moved before the lock is taken. `examples/io_outside_critical_section.rs`: ~40ms, all four run concurrently. Takeaway: "A critical section should hold memory operations only — the moment it holds a call to the outside world, it serializes that call's own latency too."
5. **"Two locks, two threads, opposite acquisition order"** (predict) — `fig`: lock A and lock B, thread 1 taking A-then-B, thread 2 taking B-then-A. Predict: does this program ever finish? Options: yes, finishes quickly / yes, but slowly / no, it hangs forever (correct) / only if one thread is faster.
6. **"It never finishes: a real deadlock, proven by timing out"** — `fig`: the circular wait, each arrow pointing at what the other thread holds. `examples/lock_ordering_deadlock.rs`, run under a 3-second timeout in `examples.py` and asserted to still be running — the actual proof a program hangs, not a description of one.
7. **"Same program, one consistent order: it finishes"** — `fig`: both threads now take A-then-B. `examples/lock_ordering_fixed.rs` completes cleanly. Takeaway: "Lock ordering prevents deadlock by removing the circular wait a cycle of opposite acquisitions needs."
8. **"A lock convoy: everyone still moves, just badly"** — `fig`: the Wikipedia-sourced distinction from deadlock. Not independently executed (the effect Wikipedia describes — repeated forced context switches among equal-priority threads — depends on OS scheduler internals this sandbox doesn't expose reliably; scoped down to the fetched primary source, noted in `coverage.json`'s `gapReview`). Takeaway: "Unlike a deadlock, a lock convoy's threads keep making progress — the cost is repeated, wasted context switches, not a permanent stall."
9. **"Priority inversion: a low-priority holder blocks a high-priority waiter"** — `fig`: the kernel docs' own rt-mutex priority-inheritance fix. Also cited only (real-time scheduling control isn't available in this sandbox); the std/kernel source material is quoted directly. Takeaway: "None of lock ordering, convoys, or priority inversion is something Rust's type system checks — the borrow checker's guarantees stop at memory safety."
10. **Recap** — never do I/O inside a critical section (measured: ~4x slower, serialized); lock ordering removes the circular wait that causes deadlock; a convoy still progresses, a deadlock never does; priority inversion needs priority inheritance to fix, and none of this is enforced by the type system. Handoff: the next topic in the chapter (channels/message-passing as the alternative to shared-state locking for exactly this "don't serialize the outside world" problem).

## Engagement arc

- Hook: step 1, against topic 19's own handoff.
- Early predictions: step 2 (within the first four) and step 5.
- Surprising number: step 3's measured 161ms for four 40ms calls — four times slower than the naive "it's one lock, how bad can it be" intuition.
- Takeaways: steps 4, 7, 8, 9 (four — step 3 deliberately has none, see above).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| I/O inside a critical section serializes the external call's latency, not just the memory access | `rbe/book-shared-state` (framing) + `examples/io_inside_critical_section.rs`, `examples/io_outside_critical_section.rs` (executed, measured) |
| `tokio::sync::Mutex` exists for holding a lock across an await for an I/O resource, and spawning a task + message passing is the docs' own preferred alternative | `docs.rs tokio::sync::Mutex` (quoted) |
| `Mutex<T>` cannot protect against deadlock; a two-lock deadlock is two threads each holding one lock and waiting on the other's | `doc.rust-lang.org/book` ch16-03 (quoted) + `examples/lock_ordering_deadlock.rs` (executed, proven to hang via timeout) |
| Lock ordering (a consistent acquisition order across every path) removes the circular wait a deadlock needs | Linux kernel `lockdep-design.html` (quoted) + `examples/lock_ordering_fixed.rs` (executed) |
| A lock convoy is threads of equal priority repeatedly contending for one lock; unlike deadlock, they still make progress, just wastefully | Wikipedia `Lock convoy` (quoted) — cited only, not independently executed (see step 8) |
| Priority inversion is a low-priority holder blocking a higher-priority waiter; priority inheritance (temporarily boosting the holder) is the fix, with the kernel's own caveat that it isn't a cure for bad design | Linux kernel `rt-mutex.html` (quoted) — cited only, not independently executed (see step 9) |

## Concept ledger

- `introduces`: `critical-section-io-latency`, `lock-ordering-deadlock-avoidance`, `lock-convoy`, `priority-inversion`
- `uses`: `arc-shares-only`, `mutex-rwlock-synchronizes`, `threads-and-channels`
- `declared`: `threads-and-channels`, `mutexes`

## Bridge and handoff

- Bridge: topic 19's own handoff line, reused verbatim: "The lock now has exactly one well-defined job: synchronizing access to a few memory operations. The next question is what happens the moment something that isn't a memory operation ends up inside it."
- Handoff: "None of this — ordering, convoys, inversion — is something the type system checks. The next topic asks what changes when the threads doing the sharing stop sharing state at all, and pass messages instead."
