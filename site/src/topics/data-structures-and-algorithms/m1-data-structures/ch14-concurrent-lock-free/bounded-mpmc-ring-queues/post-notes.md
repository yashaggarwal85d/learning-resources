<section data-section="outcomes">

## Outcomes

- Trace enqueue and dequeue on a capacity-four ring by hand, giving every cell's sequence number
  after each step, and say what each comparison (equal, less, greater) means for each side.
- Explain why a claimed-but-unpublished slot makes a bounded MPMC queue blocking rather than
  lock-free, and check the exact history (a completed enqueue, then an empty dequeue) against a
  brute-force linearizability checker rather than asserting the verdict from reading the code.
- Compare Vyukov's per-slot sequence number against the LMAX Disruptor's Sequence/Sequencer/
  Sequence Barrier design, say what each one's padding does and does not fix, and read a real
  measured scaling curve against a mutex baseline without claiming more than the machine showed.

</section>

<section data-section="internals">

## Internals

Vyukov's bounded MPMC queue (verified against two independent, license-attributed vendored
copies of his own code, since the live page and its Wayback Machine mirror are both unreachable
in this environment — see `SOURCES.md`) is a power-of-two ring of cells, each holding an atomic
sequence number initialized to its own index, with two shared atomic counters
(`enqueue_pos`/`dequeue_pos`). Enqueue reads `enqueue_pos`, compares the target cell's own
sequence number against that position: equal means the cell is free for this turn, so CAS
`enqueue_pos` forward and publish (write the data, then store `pos + 1` into the sequence number
as a release); less means the cell still holds an unconsumed item — full; greater means another
producer already took this turn — reload and retry. Dequeue is the mirror image, comparing
against `pos + 1` and, on success, storing `pos + capacity` as the next lap's free marker.
`examples.py`'s `hand_trace()` replays exactly this on a capacity-four ring and matches
`CHAPTER.md`'s own planning arithmetic at every step.

A producer that wins the CAS claiming a slot and then stalls before writing data or storing the
new sequence number leaves that slot claimed but never published. `examples.py`'s
`stalled_producer_blocks_dequeue()` models this directly: a second producer claims and publishes
the next slot, and ten thousand straight dequeue attempts on the stalled slot all return empty —
the dequeue side is strictly FIFO on `dequeue_pos`, so a later, published slot never helps a
consumer stuck on an earlier one. This is blocking, not lock-free, by the exact definition from
the previous topic: a single suspended thread holds up a specific other thread indefinitely, even
though the design has no mutex anywhere in it. Recorded as a formal history — the second
producer's enqueue completes entirely before the dequeue begins and returns empty — and fed to
the same brute-force checker the previous topic built, it has no legal sequential order at all; the
overlapping version of the same two operations (the dequeue begins before the enqueue returns)
does have one. Both verdicts are asserted in `examples.py`, reusing the checker's own logic rather
than a new one.

The LMAX Disruptor divides the identical coordination problem differently: a **Sequence** (an
atomic counter with its own padding), a **Sequencer** ("the real core of the Disruptor"), a
**Sequence Barrier** (holding "references to the main published Sequence from the Sequencer and
the Sequences of any dependent consumer" and the logic to say what is available to read), and a
**Wait Strategy**. Publication is explicitly two-phase: "claim the slot in the ring buffer and
then publish the available data" — and the guide's own warning says a claimed-but-unpublished
slot "will result in the consumers stalling and being unable to recover without a restart," the
identical failure mode Vyukov's queue has, independently derived here rather than assumed to
transfer.

False sharing follows directly from how a cache actually moves memory: "cache-lines ... typically
32-256 bytes in size, the most common cache-line being 64 bytes," the unit "at which cache
coherency protocols operate," so "if two variables are in the same cache line, and they are
written to by different threads, then they present the same problems of write contention as if
they were a single variable." Vyukov's own vendored code pads the buffer pointer and each counter
with 64 bytes on every side; crossbeam wraps its own counters in `CachePadded`; the Disruptor's
`Sequence` carries the same padding for the same reason. `examples.c`'s own measurement (two
atomic counters, each bumped by its own dedicated thread, fifty million times each) found padded
counters finishing about five times faster than unpadded ones on this machine — see Lab.

</section>

<section data-section="lab">

## Lab

Per `CHAPTER.md`'s own instruction, every exact, asserted claim in this topic — the capacity-four
trace, the ten-thousand-attempt stall, both linearizability verdicts — comes from `examples.py`,
replayed deterministically in a single thread, never raced on real threads (a pure-Python thread
benchmark would be dominated by the interpreter's own global lock and would show nothing about
this queue's real behaviour). Every timing number instead comes from `examples.c`, a real,
compiled benchmark run via `examples.sh` (`gcc -O2 -pthread -std=c11`), implementing both
Vyukov's queue and a mutex-protected ring of the same capacity. On this session's machine (four
vCPUs, `Intel(R) Xeon(R) Processor @ 2.80GHz`, recorded in full in `OUTLINE.md`): false sharing
measured at roughly five times slower unpadded than padded; queue throughput measured at one,
two, four and eight producer-and-consumer threads each — Vyukov's queue starts far ahead of the
mutex at one thread each side (no contention, one CAS beats a lock's syscall-adjacent path), but
its own throughput *falls* as thread count rises, while the mutex-protected queue's throughput
rises through four threads each side before falling at eight. This machine has four real cores;
past that, every thread is oversubscribed, and this benchmark's own producers and consumers
busy-spin on a failed CAS rather than backing off, burning cycles other threads need, while
glibc's mutex parks a blocked thread via a futex instead of spinning. The syllabus's own lab
(implement the bounded MPMC queue, verify it with a linearizability checker, benchmark against a
`Mutex<VecDeque>` at one to thirty-two threads and explain the curve) is answered at the scale
this machine actually supports; the Treiber stack and hazard-pointer reclamation half of the
syllabus lab is not built (skipped topics, named below).

</section>

<section data-section="production">

## Production failures this topic warns about

A claimed-but-unpublished slot is not a corner case this topic invented to make a point: the
Disruptor's own user guide warns about the identical failure in its own production design,
independently of Vyukov's queue, which means any bounded ring built on this per-slot-turn idea —
whichever structure holds the turn marker — needs an answer for a producer that stops partway
through publishing (a timeout, a watchdog, or an explicit acceptance that the design is blocking
and sized accordingly). This topic's own measured throughput table is itself a production warning
of a different kind: a lock-free design's raw CAS-retry loop can lose to a well-tuned mutex under
oversubscription specifically because busy-spinning wastes cycles a blocked-and-parked thread
would have freed for someone else — "lock-free" is a correctness and liveness property, not a
performance guarantee, and a production system choosing between the two needs its own measurement
on its own hardware, not a borrowed curve from a different machine's different core count.

</section>

<section data-section="frontier">

## Frontier

Michael-Scott queues (Michael and Scott, PODC 1996, citation checked, not read this session) are
the unbounded, linked, lock-free alternative to this topic's bounded, array-based, blocking
design — named once here, per the skipped-topic rule, because the two solve for genuinely
different constraints (fixed memory and backpressure versus unbounded growth), not because one
strictly beats the other. Chapter 2's own `backpressure` vocabulary is revisited here: a bounded
queue's "full" is a signal, and Vyukov's design failing outright on overflow is the non-blocking
form of that same block-policy choice. The memory-model detail behind the release store and
acquire load this algorithm's sequence number depends on lives in Rust Systems Engineering's
Chapter 7 (declared here, not re-taught); the mechanism of false sharing, the coherence protocol
itself, and profiling it with hardware performance counters belong to Rust Systems Engineering's
Chapter 29 "Cache lines and false sharing," named by pointer only.

</section>

<section data-section="where-next">

## Where this goes next

A bounded queue is the structure where threads hand each other work, and its whole difficulty
fits in one array of cells, each with a number saying whose turn it is. A map is harder in a way
that has nothing to do with turns: it has to grow while it is being used. The table every thread
is probing has to become a bigger table, and no thread may see a half-moved bin or be asked to
wait for all the others. Concurrent hash maps, next.

</section>
