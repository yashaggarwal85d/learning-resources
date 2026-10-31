# Before you watch

- **Executor.** The JVM process (one per worker, in cluster mode) that runs a task and holds
  whatever it caches or shuffles. Where you meet it: the single process whose heap this whole
  topic is about dividing up.
- **Driver.** The process coordinating a Spark job; in local mode, the one and only "executor"
  this topic's own measurements run inside, since local mode has no separate executor
  processes at all.
- **Task.** One unit of parallel work a stage runs. Where you meet it: the thing whose own
  execution-memory demand is what this topic's eviction measurements put under pressure.
- **Cache / persist.** Keeping a DataFrame's already-computed result in memory (or disk)
  across multiple uses, instead of recomputing it each time. Where you meet it: the storage
  side of this topic's central borrowing mechanism.
- **Shuffle.** Redistributing data across workers by a key — one of the operations that
  consumes execution memory, the other side of this topic's central borrowing mechanism.
