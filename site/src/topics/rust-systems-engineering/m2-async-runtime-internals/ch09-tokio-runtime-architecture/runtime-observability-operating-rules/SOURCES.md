# Sources — Runtime observability and operating rules

## `tokio::runtime::RuntimeMetrics` docs

URL: https://docs.rs/tokio/latest/tokio/runtime/struct.RuntimeMetrics.html
Fetched: 2026-10-23, cached at `sources/runtime-metrics.txt`.

> Handle to the runtime's metrics.

> This handle is internally reference-counted and can be freely cloned. A RuntimeMetrics handle is obtained using the Runtime::metrics method.

> Returns the number of tasks currently scheduled in the runtime's global queue.

## `tokio::sync::Semaphore` docs

URL: https://docs.rs/tokio/latest/tokio/sync/struct.Semaphore.html
Fetched: 2026-10-23, cached at `sources/semaphore.txt`.

> Counting semaphore performing asynchronous permit acquisition.

> A semaphore maintains a set of permits. Permits are used to synchronize access to a shared resource. A semaphore differs from a mutex in that it can allow more than one concurrent caller to access the shared resource at a time.

> When acquire is called and the semaphore has remaining permits, the function immediately returns a permit. However, if no remaining permits are available, acquire (asynchronously) waits until an outstanding permit is dropped.

## `console-subscriber` crate docs (tokio-console)

URL: https://docs.rs/console-subscriber/latest/console_subscriber/
Fetched: 2026-10-23, cached at `sources/console-subscriber.txt`.

> tokio-console is a debugging and profiling tool for asynchronous Rust applications, which collects and displays in-depth diagnostic data on the asynchronous tasks, resources, and operations in an application.

> Currently, the only runtime that implements this instrumentation is Tokio version 1.7.0 and newer.

> The tokio_unstable cfg flag, which enables experimental APIs in Tokio, must be enabled.
