import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Order changes meaning: a real buffer-then-concurrency-limit stack admits far
// more concurrent callers than the reverse order, matching ServiceBuilder's own
// documented numbers; a deadline bounds whatever it wraps, and moving it changes
// what it protects; a non-idempotent handler's side effect reruns on every retry
// unless a real idempotency key stops it.
const reel: Reel = {
  steps: [
    {
      title: "tower::ServiceBuilder's own documentation gives a specific example: buffer first, then a concurrency cap, admits a lot more callers at once than the reverse order. Does real code actually behave that way, or is that just a simplification in the docs?",
      body: (
        <>
          The same two layers, in two different orders, around the same slow service.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "It's a simplification; real code behaves the same either way" },
          { label: 'Real code matches the documented numbers closely, almost exactly', correct: true },
          { label: 'The real numbers are close, but far smaller than the documentation claims' },
        ],
        explain: (
          <>
            Almost exactly. The documentation's own numbers hold up for real.
          </>
        ),
      },
      Visual: S.OrderPredict,
    },
    {
      title: 'Measured: with the buffer first, well over a hundred callers were admitted immediately; with the order reversed, only exactly ten were, matching the documentation closely',
      body: (
        <>
          The real, measured counts, side by side.
        </>
      ),
      duration: 3.0,
      Visual: S.OrderReveal,
    },
    {
      title: 'Build a real request pipeline with a deliberately slow authorization step, and a real deadline. Put that deadline around the whole pipeline, auth included. Does a slow auth step get caught by that deadline, the same way a slow handler would?',
      body: (
        <>
          A deadline wrapped around a slow auth step and a fast handler together.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, a deadline only ever applies to the handler, never to auth' },
          { label: 'Yes, the deadline bounds everything inside it, auth included, and genuinely fires', correct: true },
          { label: 'Only if the auth step is the very last thing before the handler' },
        ],
        explain: (
          <>
            Yes. The deadline wraps whatever sits inside it, auth included.
          </>
        ),
      },
      Visual: S.TimeoutOutsidePredict,
    },
    {
      title: 'Measured: the real deadline fired well before the slow auth step would have finished on its own, because it wrapped the auth step too',
      body: (
        <>
          The real, measured early firing.
        </>
      ),
      duration: 3.0,
      takeaway: 'A deadline bounds whatever it wraps; placed around a slow auth step too, it genuinely catches that.',
      Visual: S.TimeoutOutsideReveal,
    },
    {
      title: 'Now put that same deadline only around the fast handler, with the slow auth step run ahead of it, outside its reach. Does the slow auth step still get caught, since the deadline is still there somewhere in the pipeline?',
      body: (
        <>
          The same deadline, moved to wrap only the handler, with auth now outside it.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, the deadline still applies to the whole request, wherever it sits' },
          { label: 'No, the deadline never sees the auth step at all; it runs to completion, unbounded', correct: true },
          { label: 'It depends on which one finishes first' },
        ],
        explain: (
          <>
            No, it's unbounded. The deadline only sees what it actually wraps.
          </>
        ),
      },
      Visual: S.TimeoutInsidePredict,
    },
    {
      title: 'Measured: with the deadline moved inside, the slow auth step ran to completion entirely unbounded, taking far longer than the deadline’s own limit, because the deadline never saw it at all',
      body: (
        <>
          The real, measured unbounded auth step.
        </>
      ),
      duration: 3.0,
      takeaway: 'The same deadline bounds a different thing depending on where it sits; move it, and the protection moves with it.',
      Visual: S.TimeoutInsideReveal,
    },
    {
      title: "Wrap a handler that isn't safe to run twice in a real retry layer, with no idempotency key guarding it. The handler fails twice, then succeeds on the third attempt. How many times does its own side effect actually run?",
      body: (
        <>
          A non-idempotent handler, retried twice before succeeding.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "Once, since only the final, successful attempt's effect actually counts" },
          { label: 'Exactly as many times as it was attempted, every attempt in a row', correct: true },
          { label: "Twice, since the first failed attempt doesn't count" },
        ],
        explain: (
          <>
            Every attempt. Nothing stopped the side effect from running again.
          </>
        ),
      },
      Visual: S.RetryPredict,
    },
    {
      title: "Measured: the handler's own side effect ran three separate times, once per attempt, including the two that failed, since nothing was guarding it from running again",
      body: (
        <>
          The real, measured side-effect count.
        </>
      ),
      duration: 3.0,
      takeaway: "Retrying a handler that isn't safe to run twice means its side effect runs again every time.",
      Visual: S.RetryReveal,
    },
    {
      title: 'Add one real idempotency check to that same handler, with the same two failures and the same retries. How many times does the side effect run now?',
      body: (
        <>
          The same handler, now guarded by a real idempotency key.
        </>
      ),
      duration: 2.8,
      Visual: S.IdempotentReveal,
    },
    {
      title: 'Recap: order, bounds, and a side effect that remembers',
      body: (
        <>
          A real buffer-then-concurrency-limit order admits far more callers immediately than the reverse, matching ServiceBuilder's own documented numbers. A deadline bounds whatever it wraps, and moving it changes what it actually protects. A non-idempotent handler's side effect runs again on every retry, unless a real idempotency key stops it.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
