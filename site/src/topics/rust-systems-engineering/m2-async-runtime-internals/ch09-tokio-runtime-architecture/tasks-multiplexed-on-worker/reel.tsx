import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A task is multiplexed onto a small, fixed worker pool, never mapped 1:1 onto a real thread;
// a worker fully occupied by a non-yielding call stalls everything else scheduled there,
// measured directly. tokio is this chapter's first real, chapter-wide crate dependency.
const reel: Reel = {
  steps: [
    {
      title: 'Does spawning a hundred tasks on two worker threads start a hundred real OS threads?',
      body: (
        <>
          A hundred tasks, spawned onto a runtime built with exactly two real worker threads.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'Yes — one real thread per task' },
          { label: 'No — all hundred are multiplexed onto the same two real threads', correct: true },
          { label: 'Only if each task awaits something' },
        ],
        explain: (
          <>
            No. A task is a lightweight state machine, not a thread; a great many of them multiplex onto a small, fixed pool of real ones.
          </>
        ),
      },
      Visual: S.MultiplexPredict,
    },
    {
      title: 'No — a task is a lightweight state machine, not a thread',
      body: (
        <>
          A fixed row of two real worker threads, a hundred task dots flowing through them.
        </>
      ),
      duration: 2.6,
      Visual: S.MultiplexReveal,
    },
    {
      title: "If one worker is fully occupied by a call that never yields, what happens to a trivial task that also needs it?",
      body: (
        <>
          A single-worker runtime, a task doing a real, non-yielding blocking call, a second, instant task queued right behind it.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'The runtime finds it a thread of its own' },
          { label: 'It waits until the busy worker is free', correct: true },
          { label: 'It runs on the calling thread instead' },
        ],
        explain: (
          <>
            It waits. There is only the one real worker thread, and it is fully occupied — nothing conjures a second one.
          </>
        ),
      },
      Visual: S.StallPredict,
    },
    {
      title: 'Measured: a trivial task waited the full length of the blocking call',
      body: (
        <>
          The exact wait, measured directly: the moment the trivial task was created, versus the moment it actually started running.
        </>
      ),
      duration: 3.0,
      takeaway: 'A worker fully occupied by a non-yielding call stalls every other task that needs it — measured, not described.',
      Visual: S.StallMeasuredReveal,
    },
    {
      title: 'Current-thread or multi-thread: is this a style choice?',
      body: (
        <>
          Two ways to build a runtime: one with its own fixed worker pool, one with none of its own at all.
        </>
      ),
      duration: 2.4,
      predict: {
        options: [
          { label: 'Yes — either works for any program' },
          { label: "No — it's a workload-shape decision with a real consequence", correct: true },
          { label: 'Only the multi-thread runtime actually runs' },
        ],
        explain: (
          <>
            No. One keeps its own pool running regardless; the other runs only while a specific call actively drives it.
          </>
        ),
      },
      Visual: S.RuntimeChoicePredict,
    },
    {
      title: 'A multi-thread runtime is always running; a current-thread one only runs while block_on drives it',
      body: (
        <>
          The docs' own words, naming the real difference directly.
        </>
      ),
      duration: 3.0,
      takeaway: 'A multi-thread runtime spawns its own pool, always running; current-thread has none, running only while block_on drives it.',
      Visual: S.RuntimeChoiceReveal,
    },
    {
      title: 'Can a value that isn’t safe to send between threads be spawned as a task?',
      body: (
        <>
          A value never designed to be sent between threads, held across a task's own pause point.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'Yes — spawn works for any future' },
          { label: 'No — spawn requires the future to be Send', correct: true },
          { label: 'Only on the current-thread runtime' },
        ],
        explain: (
          <>
            No. Handing work to the fixed worker pool the ordinary way requires the result be safe to move between threads.
          </>
        ),
      },
      Visual: S.NotSendSpawnPredict,
    },
    {
      title: "rustc's own diagnostic: tokio::spawn refuses it outright",
      body: (
        <>
          A real compile error, naming the exact value that cannot be sent between threads.
        </>
      ),
      duration: 3.0,
      takeaway: 'tokio::spawn requires its future be Send, since a multi-threaded runtime may move a task between workers.',
      Visual: S.SpawnFailReveal,
    },
    {
      title: 'LocalSet runs that identical future for real, on the one thread that calls it',
      body: (
        <>
          The exact same non-portable value, now run through a LocalSet instead — producing its result correctly.
        </>
      ),
      duration: 3.0,
      takeaway: 'LocalSet runs the exact future tokio::spawn refuses, by guaranteeing it only ever runs on the thread that calls it.',
      Visual: S.LocalSetReveal,
    },
    {
      title: 'Recap: tasks multiplexed, a real stall, and LocalSet proven for !Send',
      body: (
        <>
          A task is multiplexed, not mapped 1:1. A stalled worker stalls everything behind it, measured directly. Runtime choice is workload-shaped. LocalSet runs what spawn refuses.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
