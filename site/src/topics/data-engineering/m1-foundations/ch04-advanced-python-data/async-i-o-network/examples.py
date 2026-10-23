# Real measurements on this sandbox's own CPython 3.13.16. A small local TCP server (asyncio.
# start_server) stands in for the real network, each connection sleeping briefly to simulate
# latency before replying — a controlled stand-in since this sandbox has no real external
# network dependency to hit repeatedly. Six things are measured directly: how many waiting
# coroutines a single event loop genuinely interleaves; TaskGroup's own structured-concurrency
# cancellation when a sibling task fails; a semaphore's real effect as backpressure (bounding
# concurrent connections, not just slowing things down); asyncio.timeout()'s real cancellation
# timing; a blocking call genuinely stalling every other coroutine in the same loop, fixed with
# run_in_executor(); async vs. threads for the identical I/O fan-out (latency, honestly measured
# rather than assumed — at a modest scale the two are close, sometimes favoring threads, since
# this sandbox's simple stub server adds its own per-connection overhead on both sides); the real
# memory cost difference between holding thousands of units of concurrency open as real OS
# threads versus as asyncio tasks, which is where the actual asymmetry shows up; and a real
# asyncio PostgreSQL round trip through psycopg's AsyncConnection against this sandbox's own
# running Postgres 16 cluster.

import asyncio
import threading
import time

import psycopg

PG_DSN = "dbname=postgres user=postgres password=topic27lab host=127.0.0.1 port=5432"


async def _stub_handler(reader, writer, delay=0.05):
    await reader.read(100)
    await asyncio.sleep(delay)
    writer.write(b"ok")
    await writer.drain()
    writer.close()


async def _start_stub_server(delay=0.05):
    server = await asyncio.start_server(lambda r, w: _stub_handler(r, w, delay), "127.0.0.1", 0)
    port = server.sockets[0].getsockname()[1]
    return server, port


async def _stub_request(port):
    reader, writer = await asyncio.open_connection("127.0.0.1", port)
    writer.write(b"go")
    await writer.drain()
    await reader.read(100)
    writer.close()


async def event_loop_interleaving(n=20, delay=0.05):
    """n coroutines each waiting `delay` seconds, run concurrently on one event loop. If the
    loop genuinely interleaves the waits rather than running them one after another, total wall
    time stays close to a single delay, not n times delay."""
    server, port = await _start_stub_server(delay)
    t0 = time.perf_counter()
    await asyncio.gather(*[_stub_request(port) for _ in range(n)])
    t1 = time.perf_counter()
    server.close()
    await server.wait_closed()
    return t1 - t0


async def _ok_after(delay):
    await asyncio.sleep(delay)
    return "done"


async def _fail_after(delay):
    await asyncio.sleep(delay)
    raise ValueError("sibling task failed")


async def taskgroup_structured_concurrency():
    """A TaskGroup where one sibling fails partway through. The syllabus clause under test: the
    group's own documented behavior that a sibling's real exception cancels the rest of the
    group, rather than letting an already-started long task run to completion unnoticed."""
    long_task_cancelled = False
    t0 = time.perf_counter()
    try:
        async with asyncio.TaskGroup() as tg:
            long = tg.create_task(_ok_after(2.0))
            tg.create_task(_fail_after(0.1))
    except ExceptionGroup as eg:
        assert any(isinstance(e, ValueError) for e in eg.exceptions)
    t1 = time.perf_counter()
    long_task_cancelled = long.cancelled()
    return t1 - t0, long_task_cancelled


async def _bounded_worker(port, sem, active, peak):
    async with sem:
        active[0] += 1
        peak[0] = max(peak[0], active[0])
        await _stub_request(port)
        active[0] -= 1


async def semaphore_backpressure(n=30, limit=5, delay=0.05):
    """n requests against the stub server, bounded by an asyncio.Semaphore(limit). The real
    measured peak number of concurrent in-flight requests must never exceed the semaphore's own
    limit, confirmed directly rather than assumed from the primitive's own description."""
    server, port = await _start_stub_server(delay)
    sem = asyncio.Semaphore(limit)
    active = [0]
    peak = [0]
    t0 = time.perf_counter()
    await asyncio.gather(*[_bounded_worker(port, sem, active, peak) for _ in range(n)])
    t1 = time.perf_counter()
    server.close()
    await server.wait_closed()
    return t1 - t0, peak[0]


async def cancellation_timeout(slow_delay=2.0, timeout_s=0.2):
    """A task that would take slow_delay seconds, wrapped in asyncio.timeout(timeout_s). The
    real measured elapsed time must be close to the timeout, not the slow task's own full
    duration, and TimeoutError must actually be raised and catchable outside the context
    manager, exactly as the docs describe."""
    t0 = time.perf_counter()
    timed_out = False
    try:
        async with asyncio.timeout(timeout_s):
            await asyncio.sleep(slow_delay)
    except TimeoutError:
        timed_out = True
    t1 = time.perf_counter()
    return t1 - t0, timed_out


def _blocking_sleep(seconds):
    time.sleep(seconds)


async def blocking_call_stalls_loop(block_seconds=0.3, n_siblings=5, sibling_delay=0.05):
    """A genuinely blocking call (time.sleep, not asyncio.sleep) awaited directly in a
    coroutine, alongside sibling coroutines that would each finish in sibling_delay on their
    own. If the blocking call truly stalls the loop, every sibling's own finish time gets pushed
    back to at least block_seconds, not just its own short delay."""

    async def blocking_coro():
        await asyncio.to_thread(lambda: None)  # warm up the thread pool outside the timed region
        _blocking_sleep(block_seconds)  # called directly: genuinely blocks the loop thread

    async def sibling(finish_times, i):
        await asyncio.sleep(sibling_delay)
        finish_times[i] = time.perf_counter()

    finish_times = [None] * n_siblings
    t0 = time.perf_counter()
    await asyncio.gather(blocking_coro(), *[sibling(finish_times, i) for i in range(n_siblings)])
    stalled_latency = max(t - t0 for t in finish_times)

    async def fixed_blocking_coro():
        await asyncio.get_running_loop().run_in_executor(None, _blocking_sleep, block_seconds)

    finish_times2 = [None] * n_siblings
    t0b = time.perf_counter()
    await asyncio.gather(fixed_blocking_coro(), *[sibling(finish_times2, i) for i in range(n_siblings)])
    fixed_latency = max(t - t0b for t in finish_times2)

    return stalled_latency, fixed_latency


def _thread_request(port, results, i):
    import socket

    s = socket.create_connection(("127.0.0.1", port))
    s.sendall(b"go")
    s.recv(100)
    s.close()
    results[i] = True


async def async_vs_threads_fanout(n=40, delay=0.05):
    """The identical I/O fan-out — n requests against the same stub server — run once with
    asyncio (one thread, many coroutines) and once with a real thread per request (blocking
    sockets). Both approaches fan out real I/O; the comparison is their real measured cost, not
    an assumption about which "should" win."""
    server, port = await _start_stub_server(delay)

    t0 = time.perf_counter()
    await asyncio.gather(*[_stub_request(port) for _ in range(n)])
    t1 = time.perf_counter()
    async_time = t1 - t0

    def _run_threads():
        results = [False] * n
        threads = [threading.Thread(target=_thread_request, args=(port, results, i)) for i in range(n)]
        t0 = time.perf_counter()
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        return time.perf_counter() - t0, results

    # Joining the worker threads directly on the main thread would block the very event loop
    # those threads are connecting to (asyncio.run() runs the loop on the main thread), so the
    # server's own accept/response callbacks would never fire. run_in_executor keeps the loop
    # servicing connections while this thread waits.
    thread_time, results = await asyncio.get_running_loop().run_in_executor(None, _run_threads)
    assert all(results)

    server.close()
    await server.wait_closed()
    return async_time, thread_time


def _rss_mb():
    with open("/proc/self/status") as f:
        for line in f:
            if line.startswith("VmRSS:"):
                return int(line.split()[1]) / 1024
    return None


async def memory_cost_of_concurrency(n=2000, hold_seconds=0.5):
    """The real latency fan-out above measures throughput for a modest number of short
    requests, where thread-creation overhead doesn't dominate. The actual asymmetry the
    syllabus points at is resource cost at real concurrency: hold n units of concurrency open
    at once (not finishing immediately) as real OS threads vs. as asyncio tasks, and measure the
    real memory each approach commits for the identical amount of simultaneous waiting."""

    def _threads_holding():
        base = _rss_mb()
        barrier = threading.Barrier(n + 1)

        def worker():
            barrier.wait()
            time.sleep(hold_seconds)

        threads = [threading.Thread(target=worker) for _ in range(n)]
        for t in threads:
            t.start()
        barrier.wait()
        time.sleep(hold_seconds / 2)  # let every thread actually reach its own sleep
        held_rss = _rss_mb()
        for t in threads:
            t.join()
        return held_rss - base

    thread_rss_delta = await asyncio.get_running_loop().run_in_executor(None, _threads_holding)

    base = _rss_mb()

    async def tasks_holding():
        await asyncio.gather(*[asyncio.sleep(hold_seconds) for _ in range(n)])

    task = asyncio.ensure_future(tasks_holding())
    await asyncio.sleep(hold_seconds / 2)
    task_rss_delta = _rss_mb() - base
    await task

    return thread_rss_delta, task_rss_delta


async def async_postgres_driver(n_queries=20):
    """A real asyncio PostgreSQL round trip through psycopg's AsyncConnection, against this
    sandbox's own running Postgres 16 cluster — fanning out n_queries concurrently on one
    connection's own cursors, confirmed to actually return real rows from the server."""
    async with await psycopg.AsyncConnection.connect(PG_DSN) as aconn:
        t0 = time.perf_counter()

        async def one_query(i):
            async with aconn.cursor() as acur:
                await acur.execute("SELECT %s::int + 1", (i,))
                row = await acur.fetchone()
                return row[0]

        results = await asyncio.gather(*[one_query(i) for i in range(n_queries)])
        t1 = time.perf_counter()
    return t1 - t0, results


if __name__ == "__main__":

    async def main():
        interleaved_time = await event_loop_interleaving()
        print(f"event-loop interleaving: {interleaved_time:.3f}s for twenty 0.05s waits")
        assert interleaved_time < 0.4, "a single event loop must interleave many waits, not serialize them"

        tg_time, long_cancelled = await taskgroup_structured_concurrency()
        print(f"TaskGroup: {tg_time:.3f}s, long sibling cancelled: {long_cancelled}")
        assert long_cancelled, "a sibling's real failure must cancel the rest of the TaskGroup"
        assert tg_time < 1.0, "the group must exit near the failing sibling's own delay, not the long task's"

        sem_time, peak_concurrency = await semaphore_backpressure()
        print(f"semaphore backpressure: {sem_time:.3f}s, peak concurrent requests: {peak_concurrency}")
        assert peak_concurrency <= 5, "the semaphore must genuinely cap concurrency at its own limit"

        timeout_elapsed, timed_out = await cancellation_timeout()
        print(f"cancellation/timeout: {timeout_elapsed:.3f}s, TimeoutError raised: {timed_out}")
        assert timed_out, "asyncio.timeout() must actually raise a catchable TimeoutError"
        assert timeout_elapsed < 1.0, "the timeout must cancel near its own deadline, not the slow task's full duration"

        stalled, fixed = await blocking_call_stalls_loop()
        print(f"blocking call: siblings delayed to {stalled:.3f}s stalled, {fixed:.3f}s via run_in_executor")
        assert stalled > 0.25, "a genuine blocking call must stall sibling coroutines in the same loop"
        assert fixed < 0.15, "run_in_executor must let siblings finish on their own short delay instead"

        async_time, thread_time = await async_vs_threads_fanout()
        print(f"I/O fan-out: async {async_time:.3f}s, threads {thread_time:.3f}s for forty requests")

        thread_rss_delta, task_rss_delta = await memory_cost_of_concurrency()
        print(f"concurrency memory cost: threads +{thread_rss_delta:.1f} MB, asyncio tasks +{task_rss_delta:.1f} MB, holding two thousand units of concurrency open at once")
        assert thread_rss_delta > task_rss_delta * 10, "real OS threads must cost measurably more memory per unit of held concurrency than asyncio tasks"

        pg_time, pg_results = await async_postgres_driver()
        print(f"async postgres: {pg_time:.3f}s for twenty concurrent queries, results correct: {pg_results == list(range(1, 21))}")
        assert pg_results == list(range(1, 21)), "the async driver must return real, correct rows from the server"

        print("async-i-o-network examples: all numbers check out")

    asyncio.run(main())
