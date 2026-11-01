# OUTLINE: Progress guarantees and linearizability (`dsa.progress-guarantees-linearizability`)

## Storyboard (12 steps, ~15 min)

1. **Hook.** Two threads each add one to a shared counter starting at zero; it ends at one, not
   two. A lock fixes it — and the thread holding the lock gets suspended, and every other thread
   waits behind it. How would you build a counter nobody ever waits behind?
2. **Predict (within first four steps).** "Of the twenty ways to interleave two three-step
   increments (read, add one, write), how many of them lose an update?" Correct: eighteen of
   the twenty — only the two fully serial orders get it right.
3. **Reveal: the lost update, counted.** All twenty interleavings, replayed and classified.
   **Takeaway.**
4. **The lock, and its new failure.** A mutual-exclusion lock makes every interleaving correct —
   and creates a different one: the thread holding it can be suspended, and every other thread
   that wants the counter simply waits, for as long as the holder is gone.
5. **Compare-and-swap.** Read, compute, then atomically swap in the new value only if nothing
   else changed it first; on failure, retry. A counter built this way needs no lock at all.
6. **Predict.** "One thread's compare-and-swap keeps losing to the other's, every single time,
   for a thousand attempts in a row. Does the system as a whole ever make progress?" Correct:
   yes — some thread (the one winning) always finishes, even though the losing thread can be
   starved.
7. **Reveal: lock-free, not wait-free.** Measured: the losing thread fails every one of a
   thousand straight attempts under an adversarial schedule, while the winning thread succeeds
   immediately. A hardware atomic add finishes in one single step regardless of any other
   thread — the ladder's top rung, now fully lit: blocking, obstruction-free (named, not built
   on this counter), lock-free, wait-free. **Takeaway.**
8. **What does "correct" even mean, with time overlapping?** A history of operations, each an
   interval from its call to its return; two operations that overlap in time are concurrent, and
   nothing says which happened "first".
9. **Predict.** "An enqueue of x finishes completely — call and return — before a dequeue even
   begins. That dequeue returns 'empty'. Could a sequential queue, used by one thread at a time,
   ever behave this way?" Correct: no — once the enqueue is done, nothing can un-happen it.
10. **Reveal: linearizable, and not.** One history where an enqueue overlaps a dequeue that
    returns the enqueued value — checked, and a legal sequential order exists, even though the
    two overlapped in real time. The checker then rejects the "empty after a completed enqueue"
    history outright: no sequential order can produce it. **Takeaway.**
11. **Why it composes.** Linearizability is a *local* property: a system built from several
    separately-linearizable objects is itself linearizable, so a queue and a map in one program
    can each be checked alone. Contrasted, in one sentence, with serializability, which is not.
12. **Recap.** A structure's correctness is linearizability; a structure's behavior under a
    stalled thread is its place on the progress ladder. Neither says how to build one — the next
    topic builds the smallest real structure that tries.

## Engagement arc

- Hook: a fresh problem, named directly by Chapter 13's own handoff (a structure that can be
  changed, under concurrent access).
- First predict: step 2, within the first four steps.
- Second predict: step 6 (CAS starvation vs. system-wide progress).
- Third predict: step 9 (the "empty after a completed enqueue" question).
- Takeaways: steps 3, 7, 10.
- Surprising number: step 3's eighteen-of-twenty; step 7's thousand-for-a-thousand starvation.
- Recap: step 12, naming the handoff to bounded MPMC ring queues.

## Post-notes section headings (planned)

`Outcomes`, `Internals`, `Lab`, `Production failures this topic warns about`, `Frontier`,
`Where this goes next`.

## Bridge / handoff (word for word from `CHAPTER.md`)

- **Bridge:** topic 44's own handoff, word for word: "A compressed posting list is a block of
  bytes that no one ever changes, and that is why a hundred threads can decode it at once with
  no coordination at all: nothing they touch can be altered under them. Every structure that can
  be changed is a different matter. The first time two threads write to the same queue, map or
  counter, the question is no longer how fast it is but what it means for it to be correct, and
  the answer has a name and a formal definition. Progress guarantees and linearizability, next."
- **Handoff:** "A queue is linearizable when every operation seems to take effect at one instant
  between its call and its return, and it is lock free when some thread always finishes. Neither
  says how to build one, and the obvious design, one lock, gives up exactly the progress
  guarantee you just ranked. The next topic builds the smallest real structure that tries to do
  better: a bounded queue many producers and many consumers share, with one compare and swap per
  operation. It will also show that building it forces a choice between two things this topic
  only named: what the queue says when it looks empty, and what happens when a thread stops
  halfway. Bounded multi-producer multi-consumer ring queues, next."

## Running example and measured values

`examples.py` replays every example as a deterministic, single-threaded schedule, per
`CHAPTER.md`'s own instruction (a pure-Python thread benchmark would be dominated by the
interpreter's global lock and would show nothing real about progress guarantees). The lost-update
counter: all twenty interleavings of two three-step (read, add one, write) threads, enumerated
and classified — eighteen end at one, two end at two, matching `CHAPTER.md`'s own planning values
exactly; a schedule is correct exactly when neither thread's read falls between the other's read
and write, verified to coincide exactly with "ends at two" across all twenty. The lock: a holder
that never releases blocks the other thread for ten thousand straight attempts. The CAS retry
loop: an adversarial schedule where thread B's single CAS lands immediately every time, so
thread A fails every one of a thousand straight attempts of its own — lock-free (B always
finishes) but not wait-free (A can starve). The atomic add: completes in exactly one step. The
linearizability checker: a brute-force search over every ordering of a small operation history
consistent with real-time precedence, checked against a FIFO queue's sequential specification —
applied to one overlapping-operations history (linearizable) and one non-overlapping history
where a dequeue returns "empty" after a completed enqueue (not linearizable, exactly the failure
the next topic's bounded queue can actually produce).

## Changes from the chapter plan

- None. `examples.py`'s own enumeration and checker reproduced every one of `CHAPTER.md`'s
  planning values exactly on the first run: 18/20 and 2/20 for the lost update, and both
  histories' linearizability verdicts.
