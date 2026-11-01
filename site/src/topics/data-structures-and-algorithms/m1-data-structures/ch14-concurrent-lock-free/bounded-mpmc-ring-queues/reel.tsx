import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Bounded MPMC ring queues. The previous topic's own handoff's exact next question: the
// smallest real structure that tries to earn both a correctness criterion and a place on the
// progress ladder. Every schedule shown is replayed deterministically in examples.py; the one
// compiled benchmark (false sharing, throughput against a mutex) is run via examples.sh.
const reel: Reel = {
  steps: [
    {
      title: 'A ring, many producers, many consumers',
      body: (
        <>
          Four producer threads and four consumer threads share a fixed-size ring. A lock around
          the whole ring is correct, and once enough threads are waiting on it, that lock is the
          bottleneck. A different design needs only one compare-and-swap per operation, and no
          lock at all.
        </>
      ),
      duration: 4.8,
      fig: 'one ring, several producers, several consumers',
      Visual: S.Hook,
    },
    {
      title: 'What does the consumer see?',
      body: (
        <>
          One producer claims the next free slot, then is suspended before it writes anything
          into it. A second producer claims the slot right after, writes its own message, and
          returns. A consumer calls dequeue. What does it get back — the second producer's
          message, "empty", or does it simply wait?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: "The second producer's own message" },
          { label: 'It waits until the first producer finishes' },
          { label: '"Empty" — even though a later slot already has data', correct: true },
          { label: 'An error, since the slots were claimed out of order' },
        ],
        explain: (
          <>
            Empty. The consumer only ever looks at its own next slot, in strict order — it has no
            way to know, and no reason to check, that a later slot already holds something.
          </>
        ),
      },
      fig: 'claimed and stalled, then claimed and published next door',
      Visual: S.StalledHandoffPredict,
    },
    {
      title: 'Empty, not the message, not a wait',
      body: (
        <>
          The dequeue side only ever reads the cell its own counter currently points to. That
          cell's own number says whether a value is sitting there yet — and nothing about any
          other cell changes what this one says.
        </>
      ),
      duration: 4.6,
      fig: 'measured: every one of the attempts returns empty',
      Visual: S.EmptyNotMessage,
    },
    {
      title: 'The ring, two counters, and a lap number',
      body: (
        <>
          Each cell carries its own sequence number, starting equal to its own position. Two
          shared counters track the next slot to claim for writing and the next to claim for
          reading. A cell's sequence number is a lap counter: it says whose turn the cell is.
        </>
      ),
      duration: 4.4,
      fig: 'four cells, each holding its own number',
      takeaway: "A later slot already holding data doesn't help a consumer stuck on an earlier one that doesn't.",
      Visual: S.RingAndCounters,
    },
    {
      title: 'Equal, less, greater',
      body: (
        <>
          Compare a cell's own number against the position a thread is holding. Equal means this
          cell is free for this thread's turn right now. Less means it still holds an item from
          the lap before — full, for a writer, or already taken, for a reader. Greater means
          another thread already took this exact turn — reload and try again.
        </>
      ),
      duration: 4.6,
      fig: 'equal: free now. less: not yet free. greater: already gone.',
      Visual: S.ThreeComparisons,
    },
    {
      title: 'Does it ever recover on its own?',
      body: (
        <>
          The first producer above never comes back. It never writes, and it never updates its
          slot's own number. Left alone, with nothing else intervening, does the queue ever
          recover from this by itself?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes — the other threads eventually route around it' },
          { label: "No — that one slot stays stuck, and so does any consumer waiting on it", correct: true },
          { label: 'Yes, once the ring wraps around to that slot again' },
          { label: 'No — the entire ring stops accepting new writes immediately' },
        ],
        explain: (
          <>
            No. Nothing about the data structure itself can notice a stalled thread or do
            anything about it — the slot simply stays claimed and unpublished until that thread
            resumes, however long that takes.
          </>
        ),
      },
      fig: 'left alone, indefinitely',
      Visual: S.RecoversOnItsOwnPredict,
    },
    {
      title: 'One compare-and-swap, still blocking',
      body: (
        <>
          Measured directly: ten thousand straight dequeue attempts on that one stalled slot, and
          every single one comes back empty. One compare-and-swap, no lock anywhere in sight —
          and still blocking, not lock-free, by the exact definition from last time: a suspended
          thread holds up a specific other thread, indefinitely.
        </>
      ),
      duration: 5,
      fig: 'measured: ten thousand attempts, ten thousand empties',
      takeaway: 'A design with no lock can still be blocking — "no lock" and "lock-free" are not the same promise.',
      Visual: S.StillBlocking,
    },
    {
      title: 'Checked against the definition, not just read off the code',
      body: (
        <>
          Record that exact history: the second producer's enqueue completed entirely, then the
          consumer's dequeue began and returned empty. Feed it to the same brute-force checker
          from last time. No legal sequential order exists for it at all.
        </>
      ),
      duration: 4.8,
      fig: 'checked: no legal order for this one, a legal order for the overlapping version',
      Visual: S.CheckedHistory,
    },
    {
      title: 'Does dividing the labor differently change this?',
      body: (
        <>
          The LMAX Disruptor splits the same job among a Sequence, a Sequencer, and a Sequence
          Barrier, with its own two-phase claim, then publish. Does organizing it this way remove
          the possibility of a stall, or just move it somewhere else?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Removes it — the Sequence Barrier checks for stalls directly' },
          { label: 'Just moves it — a claimed, unpublished slot still stalls dependent consumers', correct: true },
          { label: 'Removes it, but only for a single producer' },
          { label: 'Neither — the Disruptor has no claim-then-publish step at all' },
        ],
        explain: (
          <>
            Just moves it. The guide's own warning says so directly: a claimed slot that is never
            published results in the consumers stalling, with no way to recover without a
            restart.
          </>
        ),
      },
      fig: 'claim the slot, then publish — or never do the second part',
      Visual: S.ClaimThenPublishPredict,
    },
    {
      title: 'Same lap counter, different place',
      body: (
        <>
          Vyukov's per-slot sequence number and the Disruptor's per-slot published-lap bit are
          the same idea, held in a different place in the design. Padding guards both: a
          sixty-four-byte gap around each shared counter, so two threads writing their own
          counters never fight over one cache line.
        </>
      ),
      duration: 5,
      fig: 'one idea, two designs, the same failure if a slot is never published',
      takeaway: "Dividing the work differently doesn't remove a stall's cost — it only decides who waits for it.",
      Visual: S.SameLapCounter,
    },
    {
      title: 'False sharing, measured',
      body: (
        <>
          Two counters, each bumped by its own thread, sitting on the same cache line: every
          write by one thread invalidates the other's copy, even though the two threads never
          touch the same variable. Pad them onto separate lines, and that cost disappears.
        </>
      ),
      duration: 4.6,
      fig: 'measured on this machine: padded counters finish well ahead of unpadded ones',
      Visual: S.FalseSharingMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          Correctness has a name, and progress has a ladder — neither one says how to build a
          structure that earns both. This one does, with one compare-and-swap, and its own
          honest scaling curve on a real machine, which doesn't always favor it. A table is
          harder in a different way: it has to grow while it's being used. Concurrent hash maps,
          next.
        </>
      ),
      duration: 4.6,
      fig: 'one compare-and-swap; blocking, not lock-free; a real, honest curve',
      Visual: S.Recap,
    },
  ],
};

export default reel;
