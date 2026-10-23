# Outline — de.async-i-o-network

1. **Hook.** Thousands of network connections sitting there, mostly waiting on a reply that
   hasn't arrived yet. One single thread needs to handle all of it. How?
2. **Reveal: the event loop, quoted directly.** The core of every asyncio application — it runs
   tasks and callbacks, and performs network I/O, all on one thread.
3. **Predict (within first four).** Twenty separate coroutines, each waiting on its own slow
   network reply. Does the total time taken scale up twenty times, or stay close to just one
   wait?
4. **Reveal: the lab — interleaving measured for real.** Twenty real waits against a real local
   server, run concurrently: the measured total time stays close to a single wait, not twenty.
5. **Reveal: the lab — TaskGroup's structured concurrency, quoted and measured.** A sibling task
   that genuinely fails cancels the rest of the group — not left running unnoticed.
6. **Reveal: the lab — a semaphore as real backpressure, quoted and measured.** A real measured
   cap on concurrent in-flight requests that never exceeds the semaphore's own limit. Takeaway on
   backpressure being a real limit, not just a slowdown.
7. **Predict.** A coroutine calls a genuinely blocking function instead of awaiting something.
   Does that cost only that one coroutine its own time, or does it cost every other coroutine on
   the same loop too?
8. **Reveal: the lab — a blocking call measured to stall every sibling, then fixed for real.** A
   real blocking call inside a coroutine delays every other coroutine on the loop by its own
   full duration; moving it to `run_in_executor()` measurably frees them. Takeaway on what
   "the loop" actually means when something blocks it.
9. **Reveal: the lab — cancellation and a timeout, quoted and measured.** A slow task wrapped in
   `asyncio.timeout()` is measured to cancel near its own deadline, and `TimeoutError` is real and
   catchable, not swallowed.
10. **Reveal: the lab — async vs. threads for the same I/O fan-out, measured both ways.** Latency
    for the identical fan-out comes out close between the two on this sandbox's own stub server;
    the real, measured difference is memory held per unit of concurrency — and the same fan-out
    style, run instead against a real async PostgreSQL driver on this sandbox's own running
    database, returns real rows just as directly. Takeaway on where the actual asymmetry is.
11. **Recap.**
12. **Prove it.** A pipeline needs to fan out to a slow, flaky network service without one failing
    call taking down the whole batch, and without overwhelming the service. Which of this
    topic's own mechanisms actually combine to do that?
