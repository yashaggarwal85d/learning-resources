# Sources — Tasks multiplexed on worker threads

## `tokio::runtime` module docs

URL: https://docs.rs/tokio/latest/tokio/runtime/index.html
Fetched: 2026-10-23, cached at `sources/runtime-module.txt`.

> A multi thread runtime has a fixed number of worker threads, which are all created on startup.

> The current-thread scheduler provides a single-threaded future executor. All tasks will be created and executed on the current thread.

> Most applications should use the multi-thread scheduler, except in some niche use-cases, such as when running only a single thread is required.

## `tokio::task::LocalSet` docs

URL: https://docs.rs/tokio/latest/tokio/task/struct.LocalSet.html
Fetched: 2026-10-23, cached at `sources/localset.txt`.

> In some cases, it is necessary to run one or more futures that do not implement Send and thus are unsafe to send between threads. In these cases, a local task set may be used to schedule one or more !Send futures to run together on the same thread.

> To spawn !Send futures, we can use a local task set to schedule them on the thread calling Runtime::block_on. When running inside of the local task set, we can use task::spawn_local, which can spawn !Send futures.
