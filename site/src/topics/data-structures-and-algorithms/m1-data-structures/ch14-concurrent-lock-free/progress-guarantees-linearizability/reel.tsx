import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Progress guarantees and linearizability. The previous chapter's own handoff's exact next question: the
// first structure that can be changed by more than one thread needs both a correctness
// criterion and a vocabulary for what a stalled thread does to everyone else. Every schedule
// shown is replayed deterministically in examples.py, never raced on real threads.
const reel: Reel = {
  steps: [
    {
      title: 'A counter nobody waits behind?',
      body: (
        <>
          Two threads each add one to a shared counter that starts at zero. It ends at one, not
          two. A lock fixes that — and now the thread holding the lock gets suspended, and every
          other thread that wants the counter simply waits behind it, for as long as the holder
          is gone. How would you build a counter nobody ever waits behind?
        </>
      ),
      duration: 4.8,
      fig: 'zero, plus one, plus one, lands on one',
      Visual: S.Hook,
    },
    {
      title: 'How many ways lose an update?',
      body: (
        <>
          Each thread's own three steps — read, add one, write — can interleave with the other
          thread's three steps in several different orders. Of all the ways those two
          three-step runs can interleave, how many of them lose an update?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'None of them — reading before writing always protects it' },
          { label: 'About half of them' },
          { label: 'Eighteen out of twenty of them', correct: true },
          { label: 'All of them except the one where they run one after another' },
        ],
        explain: (
          <>
            Eighteen of the twenty. Only the two fully serial orders — one thread's whole run,
            then the other's — land on the correct answer; every order where the two runs
            actually interleave loses an update.
          </>
        ),
      },
      fig: 'every interleaving of two three-step runs',
      Visual: S.InterleavingsPredict,
    },
    {
      title: 'The lost update, counted',
      body: (
        <>
          Replay every single one of those interleavings and classify where the counter lands.
          A schedule is correct precisely when neither thread's own read falls inside the
          other's read-to-write span — and that rule picks out exactly the two correct orders,
          no more and no fewer.
        </>
      ),
      duration: 4.6,
      fig: 'measured: eighteen end at one, two end at two',
      takeaway: 'A read that falls inside another thread’s own read-to-write span is exactly what loses an update.',
      Visual: S.LostUpdateCounted,
    },
    {
      title: 'The lock, and its new failure',
      body: (
        <>
          A mutual-exclusion lock makes every interleaving correct. It also creates a different
          failure: the thread holding the lock can be suspended, descheduled, or simply slow —
          and every other thread that wants the counter waits behind it for exactly as long as
          that takes, however long that turns out to be.
        </>
      ),
      duration: 4.4,
      fig: 'one holder, suspended; everyone else, waiting',
      Visual: S.LockBlocks,
    },
    {
      title: 'Compare-and-swap',
      body: (
        <>
          Read the value, compute what it should become, then swap in the new value only if
          nothing else has changed it since the read. If something else got there first, don't
          overwrite it — read again and retry. A counter built this way never needs a lock.
        </>
      ),
      duration: 4.4,
      fig: 'read, compute, swap if unchanged, else retry',
      Visual: S.CompareAndSwap,
    },
    {
      title: 'Does the system still move?',
      body: (
        <>
          One thread's own compare-and-swap keeps losing to the other's, every single time, for
          a thousand straight attempts. Does the system as a whole ever make progress while
          that's happening?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'No — if one thread never succeeds, nothing moves' },
          { label: "Yes — the thread that keeps winning always finishes", correct: true },
          { label: 'Only once the losing thread eventually gives up' },
          { label: 'No — a thousand failures means the counter is stuck' },
        ],
        explain: (
          <>
            Yes. The winning thread's own compare-and-swap succeeds on every single attempt —
            the system as a whole keeps moving, even though the losing thread, on this schedule,
            never gets anywhere at all.
          </>
        ),
      },
      fig: 'one thread wins every tie, one thread loses every attempt',
      Visual: S.CasStarvationPredict,
    },
    {
      title: 'Lock-free, not wait-free',
      body: (
        <>
          Measured on exactly that adversarial schedule: the losing thread fails every one of a
          thousand straight attempts, while the winning thread succeeds immediately, every
          time. A hardware atomic add finishes in a single step regardless of any other thread
          at all — the ladder's top rung. Blocking, obstruction-free, lock-free, wait-free: all
          four, now lit.
        </>
      ),
      duration: 5,
      fig: 'measured: one thread starved, the other never slowed',
      takeaway: 'Lock-free guarantees the system keeps moving; only wait-free guarantees that every single thread does.',
      Visual: S.ProgressLadder,
    },
    {
      title: 'What does "correct" mean, overlapping?',
      body: (
        <>
          Draw an operation as an interval, from the moment it's called to the moment it
          returns. Two operations whose intervals overlap in time are concurrent — and nothing
          about real time alone says which of them happened "first".
        </>
      ),
      duration: 4.4,
      fig: 'two overlapping intervals, two threads',
      Visual: S.HistoryIntervals,
    },
    {
      title: 'Could a sequential queue do this?',
      body: (
        <>
          An enqueue of a value finishes completely — called and returned — before a dequeue
          even begins. That dequeue returns "empty". Could a sequential queue, used by one
          thread at a time, ever actually behave this way?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes, if the dequeue happens on a different thread' },
          { label: "No — once the enqueue finished, nothing can un-happen it", correct: true },
          { label: 'Yes, if the queue has a maximum capacity' },
          { label: "It depends on which operation's interval is longer" },
        ],
        explain: (
          <>
            No. A sequential queue, used by one thread at a time, could never return empty right
            after an enqueue that already finished — there's simply no point in any sequential
            retelling where that value isn't already sitting in the queue.
          </>
        ),
      },
      fig: 'enqueue finishes; dequeue begins after; returns empty',
      Visual: S.EmptyAfterEnqueuePredict,
    },
    {
      title: 'Linearizable, and not',
      body: (
        <>
          Check a history by searching for any legal sequential order consistent with real
          time. One history, where an enqueue overlaps a dequeue that returns the enqueued
          value, does have such an order — even though the two overlapped. The "empty after a
          completed enqueue" history has none at all: it's rejected outright.
        </>
      ),
      duration: 5,
      fig: 'checked: one history passes, one has no legal order',
      takeaway: 'A concurrent history is linearizable exactly when some legal sequential order respects what real time already decided.',
      Visual: S.Linearizability,
    },
    {
      title: 'Why it composes',
      body: (
        <>
          Linearizability is a local property: a system built from several separately
          linearizable objects is itself linearizable, so a queue and a map in the same program
          can each be checked alone. Serializability, the transaction world's own correctness
          condition, is not local in that same way.
        </>
      ),
      duration: 4.4,
      fig: 'each object checked alone, correctly, for the whole system',
      Visual: S.Locality,
    },
    {
      title: 'Recap',
      body: (
        <>
          A structure's correctness is linearizability. A structure's behavior under a stalled
          thread is its place on the progress ladder. Neither one says how to actually build a
          structure that earns them — the next topic builds the smallest real one that tries.
        </>
      ),
      duration: 4.2,
      fig: 'correctness, named; progress, ranked; nothing built yet',
      Visual: S.Recap,
    },
  ],
};

export default reel;
