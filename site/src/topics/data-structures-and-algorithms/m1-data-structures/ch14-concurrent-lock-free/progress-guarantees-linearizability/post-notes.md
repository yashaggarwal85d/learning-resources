<section data-section="outcomes">

## Outcomes

- Enumerate every interleaving of two read-add-write threads on a shared counter, classify each
  by where it leaves the counter, and state the exact rule (a read falling inside the other's
  read-to-write span) that separates the correct orders from the lost updates.
- Place a structure on the progress ladder — blocking, obstruction-free, lock-free, wait-free —
  from what a stalled thread does to everyone else, and build a compare-and-swap retry loop that
  demonstrates the lock-free/wait-free distinction directly.
- Decide whether a recorded history of overlapping operations is linearizable, by searching for a
  legal sequential order consistent with real time, and explain why linearizability composes
  (locality) while serializability does not.

</section>

<section data-section="internals">

## Internals

Two threads each running read, add one, write back on a shared counter can interleave their six
total steps in twenty distinct orders. `examples.py` enumerates all twenty and classifies each by
its final value: eighteen end at one, only two end at the correct two. The rule that predicts this
exactly, with no exceptions, is real-time: a schedule is correct precisely when neither thread's
own read falls inside the other thread's stretch from its read to its write. A mutual-exclusion
lock makes every interleaving correct, by construction — and introduces a different failure
entirely: whichever thread holds the lock can be suspended, descheduled, or simply slow, and
every other thread waiting on it blocks for exactly as long as that lasts, unbounded. `examples.py`
models this directly: a suspended holder blocks the other thread for ten thousand straight
attempts.

Compare-and-swap (`CAS(address, expected, new)`) reads a value, computes the new one, and writes
it only if nothing has changed the location since the read; otherwise it retries from the read.
This never needs a lock, but it does not promise every thread finishes. `examples.py`'s own
adversarial schedule has one thread's swap succeed on every attempt while the other fails all one
thousand of its own attempts — the system as a whole keeps moving (lock-free) even though one
thread, on this schedule, never gets anywhere (not wait-free). A hardware atomic add, modeled as a
single indivisible step, sits above both: it finishes in one step regardless of any other thread
at all, the wait-free guarantee Herlihy's 1991 paper defines as completing "in a finite number of
steps, regardless of the execution speeds of the other processes." Obstruction-freedom (Herlihy,
Luchangco and Moir 2003) sits between blocking and lock-free — progress only for a thread running
in isolation, with "no progress requirement when any interference is detected" otherwise — and is
named here, not built: this chapter's own counter only demonstrates blocking, lock-free and
wait-free directly.

Linearizability (Herlihy and Wing 1990) draws each operation as an interval from its call to its
return; two operations whose intervals overlap are concurrent, and real time alone does not order
them. A history is linearizable when it can be extended to a complete history equivalent to some
legal sequential order that still respects every pair the real-time order already decided (their
L1 and L2). `examples.py`'s brute-force checker verifies this by searching permutations
consistent with real-time precedence: an enqueue of a value that overlaps a dequeue returning
that same value has a legal order (linearizable), while a dequeue returning "empty" right after a
completed, non-overlapping enqueue has none at all (not linearizable — a sequential queue, used
by one thread at a time, could never behave that way). The property that makes this usable at
scale is locality: "a system is linearizable if each individual object is linearizable," so a
queue and a map in the same program are each checked alone. Linearizability is also nonblocking
("processes invoking totally-defined operations are never forced to wait") — the definition
itself never forces a pending operation to block another. Serializability, the transaction
world's correctness condition, is not local in this same sense; linearizability is, in Herlihy and
Wing's own words, "a special case of strict serializability where transactions are restricted to
consist of a single operation applied to a single object."

</section>

<section data-section="lab">

## Lab

`examples.py` builds every example as a deterministic, single-threaded replay — never real
racing threads — per `CHAPTER.md`'s own instruction that a pure-Python thread benchmark would be
dominated by the interpreter's own global lock and show nothing about lock-free scaling. It
enumerates and classifies all twenty interleavings of the two-thread counter; builds a `Lock`
class and shows a suspended holder blocking the other thread for ten thousand straight attempts;
builds a `cas()` primitive and an adversarial schedule where one thread succeeds immediately while
the other fails all one thousand of its own retries; and implements a general brute-force
linearizability checker (`is_linearizable`), applying it to a linearizable overlapping
enqueue/dequeue history and a non-linearizable "empty after a completed enqueue" history. This
checker is the tool the next topic (bounded multi-producer multi-consumer ring queues) reuses
directly on its own recorded histories.

</section>

<section data-section="production">

## Production failures this topic warns about

A counter without any coordination at all is not a rare-edge-case bug — on this topic's own
enumeration, eighteen of twenty possible interleavings of just two threads lose an update,
meaning the bad outcome is the overwhelming majority of schedules, not a corner case that happens
"sometimes." A system that wraps that same counter in a lock and calls the problem solved has
traded a silent correctness bug for a silent latency bug: the lock holder being suspended,
descheduled, or paged out turns into every other thread waiting for exactly that long, and that
wait is invisible in a single-threaded benchmark the same way the lock-free failure mode is
invisible until a thread actually gets starved on a real adversarial schedule.

</section>

<section data-section="frontier">

## Frontier

Three structures this chapter's own syllabus names are cut from the curriculum and get no reel
(`syllabus/review-notes/dsa-cuts.md`): Treiber stacks and the ABA problem (compare-and-swap's own
classic failure, where a value removed and then put back fools a retrying thread into thinking
nothing changed — named here, next to compare-and-swap, because that is exactly where it belongs),
safe memory reclamation (the problem of a thread freeing memory another thread might still be
reading), and testing concurrent structures (model checkers like loom, which this topic's own
brute-force checker is a small, direct relative of). None of the three is built in this topic or
anywhere else in the chapter. The memory-model detail behind "what an acquire or a release
actually means" lives in Rust Systems Engineering's Chapter 7 (acquire/release publication and
sequential consistency), used here only as a one-sentence contract. Data Engineering's own
planned linearizability topic (not yet live) teaches the same correctness criterion for
replicated registers across machines — a different mechanism (leader election and replication
instead of compare-and-swap), the same underlying definition; neither depends on the other.

</section>

<section data-section="where-next">

## Where this goes next

A queue is linearizable when every operation seems to take effect at one instant between its call
and its return, and it is lock-free when some thread always finishes. Neither says how to build
one, and the obvious design, one lock, gives up exactly the progress guarantee just ranked here.
The next topic builds the smallest real structure that tries to do better: a bounded queue many
producers and many consumers share, with one compare-and-swap per operation. Bounded
multi-producer multi-consumer ring queues, next.

</section>
