# Sources — Structured shutdown with tokens and trackers

## `tokio_util::sync::CancellationToken` docs

URL: https://docs.rs/tokio-util/latest/tokio_util/sync/struct.CancellationToken.html
Fetched: 2026-10-23, cached at `sources/cancellation-token.txt`.

> A token which can be used to signal a cancellation request to one or more tasks.

> Tasks can call CancellationToken::cancelled() in order to obtain a Future which will be resolved when cancellation is requested.

> Cancellation can be requested through the CancellationToken::cancel method.

## `tokio_util::task::TaskTracker` docs

URL: https://docs.rs/tokio-util/latest/tokio_util/task/struct.TaskTracker.html
Fetched: 2026-10-23, cached at `sources/task-tracker.txt`.

> A task tracker used for waiting until tasks exit.

> This is usually used together with CancellationToken to implement graceful shutdown. The CancellationToken is used to signal to tasks that they should shut down, and the TaskTracker is used to wait for them to finish shutting down.

> The TaskTracker must be closed using the close method.

> The TaskTracker must be empty, that is, all tasks that it is tracking must have exited.

> When a call to wait returns, it is guaranteed that all tracked tasks have exited and that the destructor of the future has finished running.

## `tokio::signal::unix` module docs

URL: https://docs.rs/tokio/latest/tokio/signal/unix/index.html
Fetched: 2026-10-23, cached at `sources/signal-unix.txt`.

> Unix-specific types for signal handling.

> Creates a new listener which will receive notifications when the current process receives the specified signal kind.
