# Sources — Work stealing and cooperative budgeting

## `tokio::runtime` module docs

URL: https://docs.rs/tokio/latest/tokio/runtime/index.html
Fetched: 2026-10-23, cached at `sources/runtime-module.txt`.

> If both the local queue and global queue is empty, then the worker thread will attempt to steal tasks from the local queue of another worker thread. Stealing is done by moving half of the tasks in one local queue to another local queue.

> The multi thread runtime uses the lifo slot optimization: Whenever a task wakes up another task, the other task is added to the worker thread's lifo slot instead of being added to a queue.

> if a worker thread uses the lifo slot three times in a row, it is temporarily disabled until the worker thread has scheduled a task that didn’t come from the lifo slot.

## `tokio::task::coop` module docs

URL: https://docs.rs/tokio/latest/tokio/task/coop/index.html
Fetched: 2026-10-23, cached at `sources/task-coop.txt`.

> If a task runs for a long period of time without yielding back to the executor, it can starve other tasks waiting on that executor to execute them, or drive underlying resources.

> To account for this, Tokio has explicit yield points in a number of library functions, which force tasks to return to the executor periodically.

> The future will never be forced to yield by Tokio. Using this exposes your service to starvation if the unconstrained future never yields otherwise.

## "Making the Tokio scheduler 10x faster" (Tokio blog)

URL: https://tokio.rs/blog/2019-10-scheduler
Fetched: 2026-10-23, cached at `sources/scheduler-blog.txt`.

> When a task transitions to the runnable state, instead of pushing it to the back of the run queue, it is stored in a special "next task" slot. The processor will always check this slot before checking the run queue.

> the steal operation will attempt to claim half of the queue instead of a single task.
