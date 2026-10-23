import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A future does no work until polled, and that laziness is the backpressure; a pending future
// must arrange its own wakeup, or it hangs for real. Both outcomes are executed by examples.py
// (current stable rustc, edition 2024; no external crate — std::task::Wake has long been stable).
const reel: Reel = {
  steps: [
    {
      title: 'A value that does nothing until something asks',
      body: (
        <>
          A future represents work that might not have finished yet — but unlike a thread, nothing about it runs just from existing.
        </>
      ),
      duration: 2.8,
      Visual: S.InertFutureHook,
    },
    {
      title: 'Build a future by hand — does creating it do any work at all?',
      body: (
        <>
          A hand-written future, no async sugar anywhere. Nothing has called its one required method yet.
        </>
      ),
      duration: 2.4,
      predict: {
        options: [
          { label: 'Yes — some setup always runs on construction' },
          { label: "No — nothing runs until it's polled", correct: true },
          { label: 'Only if it captures variables from its environment' },
        ],
        explain: (
          <>
            No. A future is a value, not an action — constructing it is just building a struct. Nothing executes until something calls poll.
          </>
        ),
      },
      Visual: S.BuildByHandPredict,
    },
    {
      title: 'Nothing. Polling is the only thing that ever runs it',
      body: (
        <>
          The Future trait has exactly one required method, and it is the only thing that ever moves the computation forward.
        </>
      ),
      duration: 2.8,
      Visual: S.PollOnlyReveal,
    },
    {
      title: 'That laziness is the backpressure',
      body: (
        <>
          A system can hold far more constructed futures than it could ever run at once, because none of them cost anything until polled.
        </>
      ),
      duration: 3.0,
      takeaway: 'Constructing a future does no work; nothing runs until something polls it, which is itself the backpressure mechanism.',
      Visual: S.LazinessBackpressureReveal,
    },
    {
      title: 'Pending without a plan to be asked again — what happens?',
      body: (
        <>
          A future returns Pending and stores no waker, calls no waker, arranges nothing at all.
        </>
      ),
      duration: 2.4,
      predict: {
        options: [
          { label: 'It gets polled again soon anyway' },
          { label: 'It may simply never be polled again', correct: true },
          { label: 'The runtime detects the mistake and reports it' },
        ],
        explain: (
          <>
            It may never be polled again. The whole contract depends on the pending future itself arranging the wakeup — nothing else is watching.
          </>
        ),
      },
      Visual: S.NoWakeupPredict,
    },
    {
      title: 'It hangs. Timed out on purpose to prove it',
      body: (
        <>
          Run through the real executor, under a generous timeout, and it simply never returns — the hang is real, not a described risk.
        </>
      ),
      duration: 3.0,
      takeaway: 'A pending future must arrange its own waker call, or the executor has no reason left to poll it again.',
      Visual: S.HangsForRealReveal,
    },
    {
      title: 'The fix: store the waker, call it when the work finishes',
      body: (
        <>
          A conduit thread does the real waiting; the future just stores the waker it was given and trusts that thread to call it.
        </>
      ),
      duration: 3.0,
      takeaway: 'A future waiting on real work stores its waker, and whatever finishes that work calls it — the entire handoff.',
      Visual: S.StoreWakerFixReveal,
    },
    {
      title: "A waker is built from an Arc, using the standard library's own Wake trait",
      body: (
        <>
          Wrap the executor's wakeup data in an Arc, implement one method, and the standard library turns it into a real waker.
        </>
      ),
      duration: 3.0,
      takeaway: "Wake is the ordinary way to build a waker: wrap the wakeup data in an Arc, waking means re-queueing it.",
      Visual: S.WakeTraitReveal,
    },
    {
      title: 'Future, waker, scheduler, poll — run end to end, no hidden thread',
      body: (
        <>
          Every piece from this topic, wired together: the result lands exactly once, and nothing but the executor ever calls poll.
        </>
      ),
      duration: 3.0,
      takeaway: 'The whole architecture is future, waker, scheduler, poll — a real loop where nothing but the executor ever calls poll.',
      Visual: S.FullLoopReveal,
    },
    {
      title: 'Recap: the contract proven both ways',
      body: (
        <>
          Laziness is backpressure. Pending is a real promise. A waker is built from an Arc. The loop has no hidden thread anywhere in it.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
