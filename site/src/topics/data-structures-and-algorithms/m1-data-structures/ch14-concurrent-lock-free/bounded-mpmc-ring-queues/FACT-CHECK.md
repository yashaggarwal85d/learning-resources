# FACT-CHECK: Bounded MPMC ring queues (`dsa.bounded-mpmc-ring-queues`)

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Vyukov's queue: a power-of-two ring, each cell holding an atomic sequence number starting at its own index, two shared counters, one CAS per operation | spdlog/Rust-libsync vendored copies of Vyukov's own code | Verified — two independent vendored copies agree; `examples.c`/`examples.py` both implement this exact structure, checked against a hand trace |
| 2 | The capacity-four trace's sequence numbers after each step | `CHAPTER.md`'s own description (asserted numbers to compute, not quoted from a source) | Verified — `examples.py`'s `hand_trace()`, every step |
| 3 | A producer that claims a slot and stalls before publishing blocks every later dequeue on that slot, indefinitely | `CHAPTER.md`'s own derivation from the algorithm | Verified — `examples.py`'s `stalled_producer_blocks_dequeue`, ten thousand straight failed attempts |
| 4 | That exact history (enqueue completes, then dequeue returns empty) is not linearizable; the overlapping version is | Derived from topic 45's own linearizability definition | Verified — `examples.py`'s own checker, reused from topic 45 |
| 5 | crossbeam's `ArrayQueue`: "The implementation is based on Dmitry Vyukov's bounded MPMC queue" | crossbeam-rs, `array_queue.rs` | Verified — quoted exactly |
| 6 | Cache lines are typically 32–256 bytes, most commonly 64; two variables sharing one cost as much write contention as one | LMAX Disruptor technical paper | Verified — quoted exactly |
| 7 | The Disruptor: Sequencer as "the real core"; a Sequence Barrier holding references to the published Sequence and dependent consumers' Sequences; a Wait Strategy; two-phase claim-then-publish | LMAX Disruptor user guide | Verified — quoted exactly |
| 8 | A claimed-but-unpublished slot stalls the Disruptor's consumers, "unable to recover without a restart" | LMAX Disruptor user guide | Verified — quoted exactly |
| 9 | False sharing, measured: padded counters finish faster than unpadded ones incrementing the same number of times | This topic's own `examples.c` | Verified — real compiled measurement on this machine (see OUTLINE.md) |
| 10 | Queue throughput, measured, at one/two/four/eight threads each side, Vyukov's queue vs. a mutex-protected ring | This topic's own `examples.c` | Verified — real compiled measurement; result is not the "expected" shape (see Red team) |

## Currency check

Vyukov's algorithm (2010-2011) and the two vendored copies that preserve it are fixed, historical
artifacts; crossbeam's `array_queue.rs` and the Disruptor's own docs were read from their current
default branches on 2026-11-01 and may have since changed in ways this topic does not track.

## Red team

1. **`web.archive.org` is unreachable from this environment.** Vyukov's own classification
   prose and his specific benchmark figure are not quoted anywhere in this topic — see
   `SOURCES.md`'s own red-team section for the full explanation and the substitute verification
   (two independently vendored, license-attributed copies of his exact code).
2. **This topic's own measured queue-throughput table does not show lock-free beating a lock as
   contention rises** — the opposite, in fact, past one thread each side, on this particular
   four-core cloud sandbox with a busy-spinning (not backing-off) CAS retry loop. This is
   reported honestly, with the machine and the implementation detail (busy-spin, no backoff)
   that plausibly explains it, rather than discarded or re-run until it matches the "expected"
   direction. No claim is made that Vyukov's queue is faster than a mutex in general, nor that
   it is slower in general — only what this one run, on this one machine, showed.
3. **Obstruction-freedom and the progress ladder's placement of this specific queue** follow
   directly from topic 45's own definitions, not from any new source: Vyukov's own queue is
   blocking under topic 45's definition (a stalled producer blocks a specific consumer
   indefinitely), never lock-free in that strict sense, which `CHAPTER.md` itself calls out as
   the gap between Vyukov's informal classification and the formal ladder.
4. **The Disruptor's own measured throughput claims are not quoted or repeated**, per
   `CHAPTER.md`'s instruction, since they were not re-read with the paper's hardware named this
   session.
5. **Michael–Scott queues are named, not built** — the skipped-topic rule (`dsa-cuts.md`); this
   topic's own post-notes name it once, from `CHAPTER.md`'s own description, with no new claim
   about it beyond what `CHAPTER.md` already states.

## Corrections applied

None needed in the verified quotes (20/20 clean on first `sources.mjs check`). The one real
correction was methodological, not a factual error: the first plan assumed the live/archived
Vyukov page would be reachable for his own classification prose and benchmark figure; when
neither was reachable in this environment, those two specific claims were dropped rather than
reconstructed from memory or a secondary paraphrase (see `SOURCES.md`'s red team).
