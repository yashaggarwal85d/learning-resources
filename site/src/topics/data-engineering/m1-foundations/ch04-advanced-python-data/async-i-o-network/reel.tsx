import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real measurements on this sandbox's own CPython 3.13.16 (examples.py), against a local
// asyncio TCP stub standing in for the real network and this sandbox's own running Postgres 16
// cluster: event-loop interleaving, TaskGroup's own structured-concurrency cancellation, a
// semaphore's real backpressure, a blocking call genuinely stalling the loop (and the deadlock
// that bug caused in this very build's own benchmark code, fixed with run_in_executor),
// cancellation/timeout, and the real asymmetry between async and threads for I/O fan-out —
// latency close, memory held per unit of concurrency not close at all. No literal digits appear
// anywhere in this reel.
const reel: Reel = {
  steps: [
    {
      title: 'Thousands of connections, mostly just waiting — one thread has to handle all of it',
      body: (
        <>
          Most of those connections aren't doing anything most of the time — they're waiting on a
          reply that hasn't come back yet. A single thread somehow has to serve all of them at
          once. How?
        </>
      ),
      duration: 4.8,
      fig: 'thousands of waiting connections, one thread — how does it serve all of them at once?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the event loop, quoted directly',
      body: (
        <>
          The core of every asyncio application. It runs tasks and callbacks, performs network
          I/O, and runs subprocesses — all on one thread, by design.
        </>
      ),
      duration: 4.8,
      fig: 'the core of every asyncio app: tasks, callbacks, network i/o, all on one thread',
      Visual: S.RevealEventLoopQuote,
    },
    {
      title: 'Predict: do many separate waits cost as much time added together as run apart?',
      body: (
        <>
          Many separate coroutines, each waiting on its own slow reply, run concurrently on that
          one thread. Does the total time taken add up, or does it stay close to just one wait?
        </>
      ),
      duration: 2.8,
      fig: 'many separate waits, one thread — does the total time add up, or stay close to one wait?',
      predict: {
        options: [
          { label: 'It adds up — one thread can only really do one wait at a time' },
          { label: "It stays close to one wait — the loop interleaves them for free", correct: true },
        ],
        explain: (
          <>
            It stays close to one wait. While one coroutine is waiting on a reply, the loop is
            free to run every other waiting coroutine's own turn — none of them block the others.
          </>
        ),
      },
      Visual: S.PredictInterleaving,
    },
    {
      title: 'Reveal: the lab — interleaving measured for real',
      body: (
        <>
          Many real waits, against a real local stand-in server, run concurrently: the measured
          total time stays close to a single wait — not the sum of every one of them.
        </>
      ),
      duration: 4.8,
      fig: 'many real waits, run concurrently — the measured total stays close to just one',
      Visual: S.RevealInterleavingMeasured,
    },
    {
      title: "Reveal: the lab — TaskGroup's structured concurrency, quoted and measured",
      body: (
        <>
          A sibling task that genuinely fails cancels the rest of the group — measured directly,
          not left running unnoticed the way an unmanaged task would be.
        </>
      ),
      duration: 4.8,
      fig: 'a real sibling failure cancels the rest of the group — measured, not assumed',
      Visual: S.RevealTaskGroupMeasured,
    },
    {
      title: 'Reveal: the lab — a semaphore as real backpressure, quoted and measured',
      body: (
        <>
          The real measured peak of concurrent in-flight requests never goes past the semaphore's
          own limit — a genuine cap, not just a polite suggestion to slow down.
        </>
      ),
      duration: 4.8,
      fig: "a real measured cap on concurrent requests — never past the semaphore's own limit",
      takeaway: "A semaphore caps real concurrency; it doesn't just slow work down, it bounds how much runs at once.",
      Visual: S.RevealSemaphoreMeasured,
    },
    {
      title: 'Predict: does a blocking call inside a coroutine cost only that coroutine?',
      body: (
        <>
          One coroutine calls a genuinely blocking function instead of awaiting something. Does
          that cost fall only on that one coroutine, or does it reach every other coroutine
          sharing the same loop?
        </>
      ),
      duration: 2.8,
      fig: 'one coroutine blocks for real — does the cost stay with it, or reach every other one?',
      predict: {
        options: [
          { label: 'Only that coroutine pays — the others keep running on the same loop' },
          { label: 'Every coroutine on that loop pays — the whole loop stalls', correct: true },
        ],
        explain: (
          <>
            Every coroutine on that loop pays. A genuinely blocking call never hands control back
            to the loop, so nothing else sharing that same thread gets to run until it returns.
          </>
        ),
      },
      Visual: S.PredictBlockingCost,
    },
    {
      title: 'Reveal: the lab — a blocking call measured to stall every sibling, then fixed for real',
      body: (
        <>
          A real blocking call inside a coroutine delays every sibling coroutine's own finish by
          its full duration, measured directly — and moving that exact call to a background
          thread measurably frees them again.
        </>
      ),
      duration: 4.8,
      fig: 'a real blocking call delays every sibling by its own full duration — then measurably fixed',
      takeaway: "The loop is one thread; a call that never yields stalls every coroutine sharing that thread.",
      Visual: S.RevealBlockingMeasured,
    },
    {
      title: 'Reveal: the lab — cancellation and a timeout, quoted and measured',
      body: (
        <>
          A slow task wrapped in a deadline is measured to actually cancel near that deadline,
          not run to its own full length — and the resulting error is real and catchable, not
          silently swallowed.
        </>
      ),
      duration: 4.8,
      fig: 'a slow task, wrapped in a deadline — cancelled near the deadline, measured for real',
      Visual: S.RevealTimeoutMeasured,
    },
    {
      title: 'Reveal: the lab — async vs. threads for the same fan-out, measured both ways',
      body: (
        <>
          The identical network fan-out, timed both ways, comes out close between the two on this
          sandbox's own stand-in server. The real difference measured is memory held per unit of
          concurrency — and the same style of fan-out against a real async database driver, on
          this sandbox's own running database, returns real rows just as directly.
        </>
      ),
      duration: 4.8,
      fig: 'same fan-out, both ways — latency close; memory held per unit of concurrency is not',
      takeaway: 'Async and threads can cost near-identical latency for the same fan-out; the asymmetry is memory held per unit of concurrency.',
      Visual: S.RevealAsyncVsThreadsMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          One loop interleaves many waits for free. TaskGroup cancels a failed group's siblings.
          A semaphore caps real concurrency. A blocking call stalls every coroutine sharing the
          loop. A timeout cancels near its own deadline. Threads and async can cost similar
          latency; memory held per unit of concurrency is where they genuinely differ.
        </>
      ),
      duration: 4.8,
      fig: 'one loop, many waits, a real cap, a real stall, a real deadline, a real memory gap',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A pipeline fans out to a slow, occasionally failing network service, without one failed
          call taking down the whole batch, and without ever overwhelming that service. Which of
          this topic's own mechanisms actually combine to deliver that, together?
        </>
      ),
      duration: 2.8,
      fig: 'fan out to a flaky service, without one failure taking the batch down — which mechanisms combine?',
      predict: {
        options: [
          { label: 'A single mechanism on its own — whichever one handles failures' },
          { label: 'TaskGroup for isolated failures plus a semaphore for the limit, together', correct: true },
        ],
        explain: (
          <>
            Together. TaskGroup alone isolates a failing call from taking down the whole batch,
            but says nothing about load; a semaphore alone caps load, but says nothing about one
            call's own failure. Neither one substitutes for the other.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
