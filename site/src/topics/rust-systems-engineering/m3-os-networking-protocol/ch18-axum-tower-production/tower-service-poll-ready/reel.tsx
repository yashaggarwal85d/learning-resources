import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// poll_ready and call are two separate steps, and that split is the backpressure
// contract itself. Layers compose around that same contract, each bounding a
// different real thing; Buffer's own queue can hide the backlog a hard cap exists
// to prevent, unless it is sized on purpose.
const reel: Reel = {
  steps: [
    {
      title: "A real tower::Service can report that it isn't ready several times before it finally says yes. If a caller calls it anyway, while it's still reporting not ready, what does the trait's own contract actually allow to happen?",
      body: (
        <>
          A real service reporting not ready, then ready, with a caller waiting on it.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "It always just works, since poll_ready is only a performance hint" },
          { label: "It's allowed to panic outright, since calling before a real ready result breaks the contract", correct: true },
          { label: 'It silently queues the call until the service becomes ready on its own' },
        ],
        explain: (
          <>
            It's allowed to panic. The contract isn't a suggestion.
          </>
        ),
      },
      Visual: S.ContractPredict,
    },
    {
      title: 'Measured: the real service reported not ready several times in a row, and only once it had genuinely become ready did a caller actually call it',
      body: (
        <>
          A real poll loop, genuinely waiting through real not-ready results.
        </>
      ),
      duration: 3.0,
      Visual: S.ContractReveal,
    },
    {
      title: "Wrap that same kind of service with four different Tower layers at once, a concurrency cap, a load shedder, a rate limiter, and a deadline, then send a whole batch of calls through all four together. How many of those four layers actually change what happens to that batch, rather than just watching it pass by?",
      body: (
        <>
          Four layers stacked around one service, a batch of calls arriving together.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Only one of them really changes anything; the rest are just logging' },
          { label: 'All four, each one bounding a different real thing about that batch', correct: true },
          { label: 'None of them, since a layer can only wrap a service, never change its behavior' },
        ],
        explain: (
          <>
            All four. Each one bounds a genuinely different axis.
          </>
        ),
      },
      Visual: S.LayersPredict,
    },
    {
      title: 'Measured: the concurrency cap genuinely capped how many calls ran at once, the load shedder genuinely rejected a call immediately instead of waiting, the rate limiter genuinely spaced calls out over real time, and the deadline genuinely cancelled a call that ran too long',
      body: (
        <>
          Four real, measured outcomes, one per layer, shown together.
        </>
      ),
      duration: 3.0,
      takeaway: 'A layer wraps one service inside another without touching its code, and each layer bounds a different real thing.',
      Visual: S.LayersReveal,
    },
    {
      title: "Put a bounded queue in front of a service whose own concurrency is capped at just one, then send several calls in all at once. Does that queue reject the extra calls, the same way the load shedder did?",
      body: (
        <>
          A queue in front of a concurrency-capped service, several calls arriving together.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, it rejects them immediately, the same way the load shedder does' },
          { label: "No, it accepts every one of them up front into its own queue, no matter what the inner service can actually run", correct: true },
          { label: 'It accepts them, but only once the caller itself checks the inner service is ready' },
        ],
        explain: (
          <>
            It accepts all of them. The queue hides what the inner service can't.
          </>
        ),
      },
      Visual: S.BufferPredict,
    },
    {
      title: 'Measured: the queue accepted every call immediately, while the service hiding behind it still ran only one call at a time underneath, a real, hidden backlog, not a rejection',
      body: (
        <>
          Every call accepted up front, the inner concurrency still genuinely capped.
        </>
      ),
      duration: 3.0,
      takeaway: 'A queue in front of a service can hide the very backlog a hard cap exists to prevent.',
      Visual: S.BufferReveal,
    },
    {
      title: "Go back to the very first question: a caller calls a real service without ever checking whether it's ready first. What does the trait's own documentation actually say is allowed to happen?",
      body: (
        <>
          The same unready service, called directly without waiting.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "It must still work correctly; that's the whole point of the trait" },
          { label: "It's permitted to panic outright, since the contract was broken", correct: true },
          { label: "It returns a graceful error instead, by the trait's own design" },
        ],
        explain: (
          <>
            Permitted to panic. The trait's own words settle it directly.
          </>
        ),
      },
      Visual: S.PanicPredict,
    },
    {
      title: "The trait's own words settle it directly: an implementation is permitted to panic outright if a call arrives before it has genuinely reported ready",
      body: (
        <>
          The trait's own documentation, quoted directly.
        </>
      ),
      duration: 2.8,
      Visual: S.PanicReveal,
    },
    {
      title: 'Asking if it is ready and asking it to do the work are two separate steps on purpose, that is the backpressure contract itself, and every layer wrapping a service composes around exactly that same contract',
      body: (
        <>
          The two-step contract and the layered stack, shown as one shared idea.
        </>
      ),
      duration: 2.8,
      takeaway: 'Readiness is the backpressure contract itself, and every layer composes around that same contract.',
      Visual: S.LessonReveal,
    },
    {
      title: 'Recap: a service that says not yet, and callers, and layers, that actually listen',
      body: (
        <>
          A real service that reports not ready, and a caller that genuinely waits for ready before calling. Four Tower layers, each bounding a different real thing about a batch of calls. A queue that can accept work the inner service cannot yet run, a real hidden backlog unless sized on purpose. And the trait's own documented permission to panic if that contract is ever broken.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
