# OUTLINE: Bounded MPMC ring queues (`dsa.bounded-mpmc-ring-queues`)

## Storyboard (12 steps)

1. **Hook.** Four producer threads and four consumer threads share a ring of a thousand and
   twenty-four cells. A mutex around the whole ring is correct, and at eight threads it is the
   bottleneck. Vyukov's queue needs one compare-and-swap per operation and no lock.
2. **Predict.** One producer claims a slot and is descheduled before it writes anything. Another
   producer then enqueues into the next slot and returns. A consumer calls dequeue. What does it
   return — the message that's sitting there, "empty", or does it wait?
3. **Reveal, takeaway.** It returns "empty" — not the later message, and it doesn't wait either.
   The dequeue side only ever looks at its own next slot's own sequence number; a later slot
   already holding data doesn't help it. (`stalled_producer_blocks_dequeue`)
4. **The ring, two counters, and a lap number.** The capacity-four trace by hand, every cell's
   sequence number after each step. (`hand_trace`)
5. **The three comparisons.** Equal (this cell is free for this turn), less (still holds an
   unconsumed item — full), greater (another thread already took this turn — retry).
6. **Predict.** After the stalled producer above, does the queue as a whole ever recover on its
   own, with no other intervention?
7. **Reveal, takeaway.** No — every dequeue attempt on that slot fails, for as long as the
   producer stays stalled. One compare-and-swap, no lock, and still blocking, not lock-free: a
   suspended thread inside the data structure blocks a specific other thread, which is exactly
   topic 45's definition of blocking. (`stalled_producer_blocks_dequeue`, ten thousand attempts)
8. **Checked against the correctness definition.** Feed the exact recorded history (enqueue
   completed, then dequeue returns empty) to the same brute-force checker topic 45 built: no
   legal sequential order exists. The overlapping version (dequeue begins before the enqueue
   returns) does have one. (`empty_after_completed_enqueue_history`, `is_linearizable`)
9. **Predict.** The LMAX Disruptor divides the same job differently — a Sequence, a Sequencer, a
   Sequence Barrier. Does that division remove the possibility of a stall, or just move it?
10. **Reveal, takeaway.** Just moves it: the Disruptor's own two-phase claim-then-publish has the
    identical failure if a claimed slot is never published — "the consumers stalling and being
    unable to recover without a restart," in the guide's own words. Same lap-counter idea
    (Vyukov's per-slot sequence; the Disruptor's per-slot availability bit), a different division
    of labour.
11. **False sharing and padding.** The cache line as the unit of coherence; two counters on the
    same line cost as much write contention as one. Vyukov's own 64-byte pads, crossbeam's
    `CachePadded`, the Disruptor's padded `Sequence` — measured, padded vs. unpadded, on this
    machine (`examples.c`).
12. **Recap.** Correctness named, progress ranked, and now the smallest real structure that tries
    to earn both — and the one honest number this topic adds: the real machine's own scaling
    curve, which does not always favour the lock-free design. Concurrent hash maps, next.

## Compiled benchmark: machine, compiler, flags

Run via `examples.sh` (`gcc -O2 -pthread -std=c11 -o examples_bin examples.c && ./examples_bin`).

- Machine: 4 vCPUs, `Intel(R) Xeon(R) Processor @ 2.80GHz`, Linux 6.18 (this session's cloud
  sandbox — not a dedicated benchmarking machine; no claim is made beyond what this run showed,
  and the oversubscription past four real cores is called out explicitly in post-notes.md).
- Compiler: `gcc (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0`, flags `-O2 -pthread -std=c11`.
- Output this run produced (quoted in post-notes.md's Lab section):

```
sizeof(unpadded_pair_t) = 16 bytes; sizeof(padded_pair_t) = 128 bytes
false sharing: unpadded 1.712s, padded 0.333s, ratio 5.14x

queue throughput (ops/sec, producers=consumers=N):
N            vyukov          mutex
1          38082504        8527209
2           8401531       11365292
4           5469697       16792304
8           3242417       11555864
```

## Note on this run's own honesty

The false-sharing ratio (padded about five times faster than unpadded) is the clean, expected
result. The queue-throughput table is not: Vyukov's queue wins hugely at one thread each side
(no contention, and a mutex's syscall-adjacent path costs more per operation than one CAS), but
its throughput *falls* as thread count rises, while the mutex-protected queue's throughput
*rises* through four threads each side before falling at eight. This machine has four real
cores; at eight threads each side (sixteen threads total) every thread is badly oversubscribed,
and this implementation's producers and consumers busy-spin on a failed CAS rather than backing
off, which burns cycles other threads need, while glibc's mutex parks a blocked thread via a
futex instead of spinning. This is a real, honest result from a shared cloud sandbox, not a
dedicated benchmarking box, and it is exactly the lesson `CHAPTER.md` asks for: no claim is made
beyond what this one machine showed, and "lock-free" is never claimed to mean "faster" in
general — see FACT-CHECK.md's red team.
