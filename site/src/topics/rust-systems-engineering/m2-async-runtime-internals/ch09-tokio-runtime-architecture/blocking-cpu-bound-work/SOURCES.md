# Sources — Blocking and CPU-bound work

## `tokio::task::spawn_blocking` docs

URL: https://docs.rs/tokio/latest/tokio/task/fn.spawn_blocking.html
Fetched: 2026-10-23, cached at `sources/spawn-blocking.txt`.

> This function runs the provided closure on a thread dedicated to blocking operations.

> Tokio will spawn more blocking threads when they are requested through this function until the upper limit configured on the Builder is reached. After reaching the upper limit, the tasks are put in a queue.

> When running many CPU-bound computations, a semaphore or some other synchronization primitive should be used to limit the number of computations executed in parallel. Specialized CPU-bound executors, such as rayon, may also be a good fit.

> Note that if you are using the single threaded runtime, this function will still spawn additional threads for blocking operations. The current-thread scheduler's single thread is only used for asynchronous code.

## `tokio::task::block_in_place` docs

URL: https://docs.rs/tokio/latest/tokio/task/fn.block_in_place.html
Fetched: 2026-10-23, cached at `sources/block-in-place.txt`.

> Calling this function informs the executor that the currently executing task is about to block the thread, so the executor is able to hand off any other tasks it has to a new worker thread before that happens.

> Be aware that although this function avoids starving other independently spawned tasks, any other code running concurrently in the same task will be suspended during the call to block_in_place.

> Note that this function cannot be used within a current_thread runtime because in this case there are no other worker threads to hand off tasks to.

> This function panics if called from a current_thread runtime.
