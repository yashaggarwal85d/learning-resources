import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// spawn_blocking (a dedicated, dynamically-sized blocking pool), block_in_place (hand other
// tasks to a new worker before blocking this one; panics with no other worker to hand off to),
// and the named alternative for genuinely CPU-bound work (rayon, a dedicated runtime,
// thread-per-core shared-nothing runtimes).
const reel: Reel = {
  steps: [
    {
      title: 'A real, 300ms blocking call, made directly inside a spawned task on the only worker. Does a trivial sibling task notice?',
      body: (
        <>
          A genuine, 300ms blocking call, made directly inside a task on a runtime with one real worker.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No — the runtime finds it another thread' },
          { label: 'Yes — the sibling waits the full 300ms', correct: true },
          { label: 'Only if the sibling also blocks' },
        ],
        explain: (
          <>
            Yes. There is still only the one real worker thread, and nothing about this call changes that.
          </>
        ),
      },
      Visual: S.BaselinePredict,
    },
    {
      title: "Measured: the sibling waited the full 300ms, same baseline as the last topic",
      body: (
        <>
          The exact same starting point every fix in this topic gets measured against.
        </>
      ),
      duration: 2.6,
      Visual: S.BaselineReveal,
    },
    {
      title: 'Move that exact same call into spawn_blocking. Does the one worker still stall?',
      body: (
        <>
          The identical blocking call, now wrapped in a call to spawn_blocking.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'Yes — spawn_blocking still uses the worker pool' },
          { label: "No — it runs on its own, separate pool", correct: true },
          { label: 'Only with more than one worker' },
        ],
        explain: (
          <>
            No. spawn_blocking's own pool is a genuinely separate set of real threads.
          </>
        ),
      },
      Visual: S.SpawnBlockingPredict,
    },
    {
      title: "Measured: the sibling ran almost instantly — spawn_blocking's own pool never touched the worker",
      body: (
        <>
          The call didn’t change at all — only where it was allowed to run.
        </>
      ),
      duration: 2.8,
      takeaway: 'spawn_blocking moves a genuinely blocking call to its own pool entirely — the worker never notices it at all.',
      Visual: S.SpawnBlockingReveal,
    },
    {
      title: "block_in_place makes a different promise: can an independent sibling task still run while it blocks?",
      body: (
        <>
          The identical blocking call, now inside task::block_in_place, inside its own spawned task.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No — it blocks everything on that worker' },
          { label: 'Yes — the sibling gets handed to a new worker thread first', correct: true },
          { label: 'Only inside spawn_blocking' },
        ],
        explain: (
          <>
            Yes. The call itself doesn’t move — everything else does, first.
          </>
        ),
      },
      Visual: S.BlockInPlacePredict,
    },
    {
      title: "Measured: the sibling ran almost instantly — handed off to a new worker thread before the call even started",
      body: (
        <>
          Not moved anywhere — handed off to a different real thread before the blocking call began.
        </>
      ),
      duration: 2.8,
      takeaway: 'block_in_place tells the executor to hand an independent sibling off to a new worker before it blocks this one.',
      Visual: S.BlockInPlaceReveal,
    },
    {
      title: 'Can block_in_place be called on a current-thread runtime, the same way it works on a multi-thread one?',
      body: (
        <>
          The identical call to block_in_place, now on a runtime with no additional workers of its own at all.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'Yes — it just blocks that one thread' },
          { label: 'No — it panics outright', correct: true },
          { label: 'It silently does nothing' },
        ],
        explain: (
          <>
            No. Its whole mechanism depends on a worker thread to hand things off to, and there isn’t one.
          </>
        ),
      },
      Visual: S.PanicPredict,
    },
    {
      title: "rustc's own panic: there's no other worker thread to hand anything off to",
      body: (
        <>
          A real, immediate, named failure — not a silent no-op.
        </>
      ),
      duration: 2.8,
      takeaway: 'block_in_place panics on a current-thread runtime — its promise depends on a sibling worker that doesn’t exist there.',
      Visual: S.PanicReveal,
    },
    {
      title: "For CPU-heavy work with no I/O at all, spawn_blocking's pool isn't the only answer",
      body: (
        <>
          rayon, or a dedicated runtime, next to thread-per-core, shared-nothing runtimes.
        </>
      ),
      duration: 2.8,
      Visual: S.AlternativesReveal,
    },
    {
      title: 'Recap: a real stall, two real fixes with two different promises, and a named alternative for CPU-heavy work',
      body: (
        <>
          A direct blocking call stalls the worker. spawn_blocking moves it off entirely. block_in_place hands everything else away first, and panics where it can’t. CPU-heavy work has its own answers.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
