import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A critical section's only job is synchronizing a few memory operations. Put I/O inside one and
// the lock serializes that call's own latency too — measured, not asserted (examples.py: ~160ms
// with four 40ms calls serialized, ~40ms once the call moves outside the lock). A two-lock
// deadlock is a real, proven hang (a 3-second subprocess timeout), and lock ordering is the real
// fix. Lock convoys and priority inversion are named and quoted from primary sources but not
// independently executed in this sandbox (see coverage.json's gapReview).
const reel: Reel = {
  steps: [
    {
      title: "A lock's only job is synchronizing memory",
      body: (
        <>
          A critical section exists to protect a few memory operations — a read, a write. That's the whole job.
        </>
      ),
      duration: 2.6,
      Visual: S.CriticalSectionHook,
    },
    {
      title: "Four threads, one 'network call' each, inside the lock",
      body: (
        <>
          Four threads each need a simulated 40ms external call, and each one holds the lock for the whole call.
        </>
      ),
      duration: 2.2,
      predict: {
        options: [
          { label: '~40ms — the calls overlap, like any other wait' },
          { label: '~160ms — the lock serializes every call, one at a time', correct: true },
          { label: 'Instant — locks only serialize memory, not time spent waiting' },
        ],
        explain: (
          <>
            ~160ms. The lock has no idea what's happening inside it — it serializes the whole critical section, external call included.
          </>
        ),
      },
      Visual: S.FourThreadsPredict,
    },
    {
      title: 'Measured: about 160 milliseconds',
      body: (
        <>
          Four 40ms calls, each one waiting its turn behind the lock — not running at once.
        </>
      ),
      duration: 2.8,
      Visual: S.MeasuredReveal,
    },
    {
      title: 'Move the call outside the lock',
      body: (
        <>
          Do the same four calls before the lock is taken. The lock only ever protects the one memory write now.
        </>
      ),
      duration: 3.2,
      takeaway: 'A critical section should hold memory operations only — an outside call inside it serializes that call\'s latency too.',
      Visual: S.MoveOutsideLock,
    },
    {
      title: 'Two locks, two threads, opposite acquisition order',
      body: (
        <>
          Thread 1 takes lock A, then lock B. Thread 2 takes lock B, then lock A.
        </>
      ),
      duration: 2.2,
      predict: {
        options: [
          { label: 'Yes, finishes quickly — the locks are independent' },
          { label: 'Yes, but slowly — one thread eventually backs off' },
          { label: 'No, it hangs forever — a circular wait', correct: true },
          { label: 'Only if one thread happens to run faster' },
        ],
        explain: (
          <>
            It hangs forever. Each thread ends up holding exactly what the other one is waiting for — a circle neither can break out of.
          </>
        ),
      },
      Visual: S.TwoLocksPredict,
    },
    {
      title: 'It never finishes: a real deadlock, proven by timing out',
      body: (
        <>
          Run it under a short timeout. It is still running when the timeout fires — the actual proof a program hangs, not a description of one.
        </>
      ),
      duration: 3.0,
      Visual: S.DeadlockReveal,
    },
    {
      title: 'Same program, one consistent order: it finishes',
      body: (
        <>
          Make both threads take lock A first, every time. The circular wait can no longer form.
        </>
      ),
      duration: 2.8,
      takeaway: 'Lock ordering prevents deadlock by removing the circular wait a cycle of opposite acquisitions needs.',
      Visual: S.LockOrderingFixed,
    },
    {
      title: 'A lock convoy: everyone still moves, just badly',
      body: (
        <>
          Equal-priority threads repeatedly contending for the same lock — a different failure from deadlock entirely.
        </>
      ),
      duration: 3.2,
      takeaway: "Unlike a deadlock, a lock convoy's threads keep progressing — the cost is wasted context switches, not a stall.",
      Visual: S.LockConvoy,
    },
    {
      title: 'Priority inversion: a low-priority holder blocks a high-priority waiter',
      body: (
        <>
          The kernel's own fix: temporarily boost the holder's priority until it releases the lock.
        </>
      ),
      duration: 3.2,
      takeaway: "None of lock ordering, convoys, or priority inversion is checked by Rust's type system — it stops at memory safety.",
      Visual: S.PriorityInversion,
    },
    {
      title: 'Recap: four failure modes, none of them caught by the compiler',
      body: (
        <>
          Never put I/O in a critical section. Order your locks consistently. A convoy still moves; a deadlock never does. Priority inversion needs priority inheritance.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
