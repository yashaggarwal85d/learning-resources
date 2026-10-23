Last verified against these sources: 23 October 2026. Real measurements on this sandbox's own
CPython (`examples.py`) against a local asyncio stub server and this sandbox's own Postgres 16
cluster. Expert sign-off: pending.

- Python Software Foundation, "Event loop": [docs.python.org](https://docs.python.org/3/library/asyncio-eventloop.html). The event loop's own definition, and `run_in_executor()` as the documented way to avoid blocking it.
- Python Software Foundation, "Coroutines and tasks": [docs.python.org](https://docs.python.org/3/library/asyncio-task.html). `TaskGroup`'s structured concurrency and `asyncio.timeout()`'s cancellation-to-`TimeoutError` behavior.
- Python Software Foundation, "Synchronization Primitives": [docs.python.org](https://docs.python.org/3/library/asyncio-sync.html). The semaphore's own counter mechanics.
- psycopg documentation, "Concurrent operations": [psycopg.org](https://www.psycopg.org/psycopg3/docs/advanced/async.html). `AsyncConnection`/`AsyncCursor` and connection-sharing semantics.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=async-i-o-network:%20).
