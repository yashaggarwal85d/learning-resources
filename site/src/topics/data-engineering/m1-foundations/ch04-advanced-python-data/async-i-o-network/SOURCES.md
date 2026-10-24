# Sources — de.async-i-o-network

All quotes verified word for word against the fetched text in `sources/` via
`node scripts/sources.mjs check`.

## Python Documentation, "Event loop"
URL: https://docs.python.org/3/library/asyncio-eventloop.html

> The event loop is the core of every asyncio application. Event loops run asynchronous tasks and callbacks, perform network IO operations, and run subprocesses.

> There is no asynchronous file I/O in asyncio; use loop.run_in_executor() to read and write regular files without blocking the event loop.

## Python Documentation, "Coroutines and tasks"
URL: https://docs.python.org/3/library/asyncio-task.html

> The asyncio.TaskGroup class provides a more modern alternative to create_task().

> The first time any of the tasks belonging to the group fails with an exception other than asyncio.CancelledError, the remaining tasks in the group are cancelled.

> If long_running_task takes more than 10 seconds to complete, the context manager will cancel the current task and handle the resulting asyncio.CancelledError internally, transforming it into a TimeoutError which can be caught and handled.

## Python Documentation, "Synchronization Primitives"
URL: https://docs.python.org/3/library/asyncio-sync.html

> A semaphore manages an internal counter which is decremented by each acquire() call and incremented by each release() call. The counter can never go below zero; when acquire() finds that it is zero, it blocks, waiting until some task calls release().

## psycopg documentation, "Concurrent operations"
URL: https://www.psycopg.org/psycopg3/docs/advanced/async.html

> Psycopg Connection and Cursor have counterparts AsyncConnection and AsyncCursor supporting an asyncio interface.

> An AsyncConnection can be used by several asyncio.Task at the same time. However, as with threads, all the AsyncCursor on the same connection will share the same session and will have their access to the connection serialized.
