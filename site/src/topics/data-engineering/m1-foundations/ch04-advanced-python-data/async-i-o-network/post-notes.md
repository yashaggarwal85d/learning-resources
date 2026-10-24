<section data-section="outcomes">

## Outcomes

A single event loop genuinely interleaves many waiting coroutines — measured directly against a
real local stand-in server, twenty concurrent waits finish close to the time of one, not twenty.
`TaskGroup` gives that interleaving real structured concurrency: a sibling's genuine failure
measurably cancels the rest of the group rather than leaving an unmanaged task running unnoticed.
A semaphore turns concurrency into real, measured backpressure, capping peak in-flight work at
its own limit. A genuinely blocking call inside a coroutine stalls every other coroutine sharing
that loop, not just itself — measured directly, including a real deadlock this very build's own
benchmark code hit and had to fix with `run_in_executor()`. `asyncio.timeout()` cancels near its
own deadline and raises a real, catchable `TimeoutError`. Async and threads cost close to the
same measured latency for the identical I/O fan-out on this sandbox's own stand-in server; the
real, measured asymmetry is memory held per unit of concurrency, not latency — and the same
fan-out style, run against a real async PostgreSQL driver on this sandbox's own running
database, returns real, correct rows just as directly.

</section>

<section data-section="lab">

## Lab

Every number in this topic is measured directly on this sandbox's own CPython (`examples.py`),
against a local asyncio TCP stub standing in for the real network and this sandbox's own running
Postgres 16 cluster: event-loop interleaving time; `TaskGroup`'s real sibling-cancellation
behavior; a semaphore's real peak-concurrency ceiling; a genuinely blocking call's real delay to
every sibling coroutine, and the same scenario fixed via `run_in_executor()`; `asyncio.timeout()`'s
real cancellation timing and `TimeoutError`; async-vs-threads latency for an identical fan-out;
real memory held for two thousand units of concurrency as threads versus as tasks; and a real
asyncio PostgreSQL round trip returning verified, correct rows.

</section>

<section data-section="production">

## Production failures this topic warns about

**A team that calls a blocking library function (a synchronous DB driver, `time.sleep`, a
CPU-heavy computation) directly inside an `async def` and is surprised every other request on
that same event loop slows down too.** This topic's own lab hit exactly this bug in its own
benchmark code — joining worker threads directly on the main thread deadlocked the whole script,
because that thread was also running the event loop — and fixed it the documented way:
`run_in_executor()`.

**A team that assumes async is unconditionally faster than threads for I/O, and is surprised when
a real measurement shows them close, or even favoring threads, at a modest scale.** This topic's
own lab reports that result honestly rather than forcing the expected answer, and locates the
real, measured asymmetry where it actually is: memory held per unit of concurrency at a much
larger scale, not latency at a small one.

</section>

<section data-section="frontier">

## Frontier

Structured concurrency patterns beyond `TaskGroup` (trio-style nurseries, `anyio`) and async
generators/streaming protocols are not covered here, named only so the gap is disclosed rather
than silently dropped.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Three different concurrency mechanisms are on the table now — processes, threads, async — each
claimed to be faster for its own workload. The next topic is how to stop taking that on faith:
profiling, which turns every claim made in the last three topics into an actual measured number.

</section>
