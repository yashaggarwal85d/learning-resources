# Outline: Arc<Mutex<T>> as hidden serialization (`rust.arc-mutex-t-as`)

Chapter 4, topic 15 (closes the chapter). Single `/make-topic` session, 2026-10-23.

## Learning outcomes

1. Name the reflex of wrapping shared, mutable, cross-thread state in `Arc<Mutex<T>>` until the compiler is satisfied, and say what it quietly costs: every access serialized through one lock.
2. Measure, rather than assume, that splitting identical work across several threads behind one `Mutex` does not scale, and that sharding the data into independently-locked pieces does.
3. Name an owner task reached only through a channel, and `arc-swap`'s RCU-style atomic swap, as two further alternatives, and place each by what kind of workload it actually fits.

## Reel steps (storyboard)

1. **"The reflex: wrap it in Arc&lt;Mutex&lt;T&gt;&gt;"** — `fig`: `MutexReflex`. `examples/mutex_contention.rs`: four real threads incrementing a shared counter through one `Arc<Mutex<u64>>`, correct every time. Takeaway: "Arc<Mutex<T>> is correct by construction, but it serializes every single access through the same lock."
2. **"Does splitting the work across threads help?"** (predict) — `fig`: `ContentionPredict`. The same total increments, once by one thread alone, once split across four threads on the same `Mutex`. Predict: yes, close to four times faster / no, about as slow or slower than one thread alone (correct) / about the same / only slower with few cores. Correct: measured several times slower, not faster.
3. **"Sharding: no two threads share a lock"** — `fig`: `Sharding`. `examples/sharding.rs`: the identical total split across one independent `Mutex` per thread. No takeaway (this is the reel's "from" step).
4. **"An owner task, reached only by channel"** — `fig`: `OwnerTask`. `examples/owner_task_channel.rs`: a single thread owns the counter outright; every other thread only sends a message. Takeaway: "An owner task trades a lock for a queue: one thread owns the data outright, and everyone else only ever sends it a message."
5. **"Can a reader see a half-updated config?"** (predict) — `fig`: `ArcSwapPredict`. `examples/arc_swap_config.rs`'s shape: many readers, one writer swapping in new values. Predict: yes, under heavy load / no, every read sees one complete, consistent snapshot (correct) / only if the writer panics / yes, but only the first read after a swap. Correct: never, by construction.
6. **"arc-swap: a lock-free swap for read-mostly data"** — `fig`: `ArcSwapFig`. `examples/arc_swap_config.rs`: readers `load()` with no lock at all; a writer `store()`s a whole new `Arc`. Takeaway: "arc-swap lets read-mostly data be read with no lock at all, by atomically swapping in a whole new value on write."
7. **Recap** — `Arc<Mutex<T>>` is correct but serializes every access through one lock, measured to cost real time under real contention; sharding removes the shared lock entirely; an owner task trades a lock for a queue; `arc-swap` gives read-mostly data a lock-free read path. Handoff to the next chapter: concurrency primitives proper, where this chapter's `Arc<Mutex<T>>` becomes the baseline every later primitive is measured against.

## Engagement arc

- Hook: step 1, the reflex everyone reaches for first.
- Early predictions: step 2 (within the first four).
- Surprising number: step 2's measured slowdown (several times slower, not faster) — spoken qualitatively, never as a hard-coded ratio.
- Takeaways: steps 1, 4, 6 (three; steps 2, 5's predicts explain themselves, step 3 carries its point without a separate takeaway line).
- Recap: step 7.

## Claims list

| Claim | Source |
|---|---|
| A Mutex protects shared data by mutual exclusion; a thread waiting for a held lock blocks, and the data is only reachable through the RAII guard the lock returns | `mutex-docs` + `examples/mutex_contention.rs` (executed, real wall-clock measurement) |
| Splitting identical work across several threads on one shared Mutex does not scale, and measured noticeably slower than one thread doing it alone | expert knowledge + `examples/mutex_contention.rs` (executed) |
| Splitting the identical work across independently-locked shards, with no two threads sharing a lock, measurably beats both single-Mutex runs | expert knowledge + `examples/sharding.rs` (executed) |
| An owner task reached only through a channel needs no shared mutable pointer to the data at all, trading a lock for a queue | expert knowledge + `examples/owner_task_channel.rs` (executed) |
| ArcSwap lets an Arc be swapped atomically, with no lock needed to read; a reader always sees one complete, consistent version, never a mix of old and new | `arc-swap-docs` + `examples/arc_swap_config.rs` (executed) |

## Concept ledger

- `introduces`: `sharding-alternative`, `owner-task-channel-alternative`, `arc-swap-rcu-alternative`
- `uses`: `arc-mutex-reflex`, `arc-atomic-refcount`
- `declared`: `threads-and-channels`, `mutexes`

## Bridge and handoff

- Bridge: "Every shared value in this chapter so far lived on one thread's worth of logic at a time, even when Arc made it legal to share across threads. The next, final step is what happens when more than one thread actually touches the same mutable, shared state at once." (`CHAPTER.md` §A.8, reused verbatim.)
- Handoff: "Arc<Mutex<T>> is the simplest tool that is correct by construction; the next chapter asks what the other primitives — channels, atomics, condition variables — actually buy over just reaching for a mutex every time." (`CHAPTER.md` §A.8, reused verbatim.)
