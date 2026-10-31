import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured against real PySpark 4.0.1 (local mode) sessions (examples.py): a ~294MB unified
// pool (from a 768MB driver heap, matching (heap - 300MB reserved) * 0.6) holding a cache
// well over half-full (observed 65-82% across runs) gets evicted entirely -- 0 bytes, 0
// partitions in /storage/rdd -- once a single-partition sort needs real execution memory,
// and the sort still spills to memory and disk even after the eviction. The identical
// pressure against a cache sized under the 30% storageFraction-protected minimum leaves it
// completely untouched, byte for byte. A driver heap deliberately too small for a collect()
// produces a genuine "java.lang.OutOfMemoryError: Java heap space" with a full stack trace
// (run as its own subprocess to capture the JVM's own process output). A real Linux cgroup
// memory limit around the same kind of collect(), disclosed in FACT-CHECK.md rather than
// re-run here, produces a genuine kernel "cgroup out of memory: Killed process (java)" in
// dmesg, with zero Java exception anywhere.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          An executor is holding onto some cached data. A new task arrives that genuinely
          needs working memory of its own. Both of them want the same pool. What happens?
        </>
      ),
      duration: 4.5,
      fig: 'cached data and a new task\'s own needs, both drawing from the same pool.',
      Visual: S.Hook,
    },
    {
      title: "Reveal: the pool's own split",
      body: (
        <>
          Measured: it's one region, not two separate pots. A fixed slice of the heap is set
          aside first, and what's left is split between execution and storage by a single
          position, not a hard wall.
        </>
      ),
      duration: 4.8,
      fig: 'one unified pool, split by position, not by a fixed wall between two pots.',
      Visual: S.RevealPoolSplit,
    },
    {
      title: "Predict: does a cache past the floor hold its ground?",
      body: (
        <>
          Let a cache grow well past whatever minimum it's supposed to be guaranteed. Then let
          a real task show up needing memory. Does the cache hold its ground?
        </>
      ),
      duration: 2.8,
      fig: 'a cache well past its own floor, under real pressure. Does it hold?',
      predict: {
        options: [
          { label: 'Yes — once a cache is established it keeps at least some of its space' },
          { label: 'No — it can be evicted entirely if the other side needs the room', correct: true },
        ],
        explain: (
          <>
            Nothing about already being cached protects memory that was only ever borrowed.
            Past its own guaranteed floor, a cache is exactly as evictable as it was on arrival.
          </>
        ),
      },
      Visual: S.PredictEvictionUnderPressure,
    },
    {
      title: 'Reveal: no — fully evicted, and still spills',
      body: (
        <>
          Measured: every cached piece gets evicted, completely. And even after clearing out
          all of that space, the task doing the work still ends up spilling to disk anyway.
        </>
      ),
      duration: 4.8,
      fig: 'cache fully evicted; the task spills to disk anyway, even with the room freed.',
      Visual: S.RevealEvictedAndSpilled,
    },
    {
      title: 'Elaborate: the protected minimum holds',
      body: (
        <>
          Run the identical pressure again, but this time keep the cache under its own
          guaranteed floor from the start. Nothing moves — not one byte, not one piece, the
          whole way through.
        </>
      ),
      duration: 4.8,
      fig: 'same pressure, cache under its floor: zero bytes moved, every single time.',
      takeaway: "A cache below its own protected minimum survives real pressure untouched; past that floor, it's evictable like anything else borrowed.",
      Visual: S.ElaborateProtectedMinimum,
    },
    {
      title: "Predict: do a heap error and a container kill look the same?",
      body: (
        <>
          Two different ways to run out of memory: a plain heap error, and a container
          deciding the whole process has gone over its limit. From the application's own point
          of view, do they look the same?
        </>
      ),
      duration: 2.8,
      fig: 'a heap error versus a container-level kill. Same symptom from the app\'s side?',
      predict: {
        options: [
          { label: "Yes — either way the application sees a thrown error it can catch" },
          { label: "No — one is a catchable error, the other leaves nothing at all", correct: true },
        ],
        explain: (
          <>
            A heap error happens inside the process that can still report on itself. A
            container-level kill happens to the process, from outside, with nothing left
            running to report anything.
          </>
        ),
      },
      Visual: S.PredictOomVsKill,
    },
    {
      title: 'Reveal: one leaves a trace, one leaves nothing',
      body: (
        <>
          Measured: the heap error is a real exception, with a full trace showing exactly
          where it happened. The container-level kill leaves no exception anywhere — the
          process is simply gone.
        </>
      ),
      duration: 4.8,
      fig: 'heap error: a real exception, full trace. Container kill: no exception at all.',
      Visual: S.RevealOneTraceOneNothing,
    },
    {
      title: 'Elaborate: why they need different fixes',
      body: (
        <>
          A heap error comes from a watcher that only ever sees its own house — the JVM's own
          heap. A container's limit covers ground that watcher can't see at all, so growing
          the heap alone does nothing for a kill it never even noticed coming.
        </>
      ),
      duration: 5,
      fig: 'the JVM watches only its own heap; the container\'s own limit covers more than that.',
      takeaway: "A heap error and a container kill come from different watchers seeing different ground; fixing one rarely touches the other.",
      Visual: S.ElaborateWhyDifferentFixes,
    },
    {
      title: 'Reveal: both failure signatures, side by side',
      body: (
        <>
          Measured together, from the same kind of pressure: one leaves an exception and a
          trace to read; the other leaves a dead process and nothing else at all.
        </>
      ),
      duration: 5,
      fig: 'same root cause, two signatures: one leaves a trace, one leaves a dead process.',
      Visual: S.RevealSideBySide,
    },
    {
      title: 'Recap',
      body: (
        <>
          One pool, shared by two uses with a protected floor between them; and two different
          ways of running out of room entirely, each one needing its own fix.
        </>
      ),
      duration: 5,
      fig: 'one pool, one floor, two separate kinds of running out of room.',
      takeaway: 'Execution and storage share one pool with a protected floor; a heap error and a container kill need different fixes.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
