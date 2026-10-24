# Sources — Group commit and commit latency

## PostgreSQL: Asynchronous Commit
URL: https://www.postgresql.org/docs/current/wal-async-commit.html
Fetched: 2026-10-24, cached at `sources/wal-async-commit.txt`.
> Asynchronous commit is an option that allows transactions to complete more quickly, at the cost that the most recent transactions may be lost if the database should crash.

> The risk that is taken by using asynchronous commit is of data loss, not data corruption.

## PostgreSQL: Write Ahead Log (runtime configuration)
URL: https://www.postgresql.org/docs/current/runtime-config-wal.html
Fetched: 2026-10-24, cached at `sources/runtime-config-wal.txt`.
> Setting commit_delay adds a time delay before a WAL flush is initiated. This can improve group commit throughput by allowing a larger number of transactions to commit via a single WAL flush, if system load is high enough that additional transactions become ready to commit within the given interval.

> the first process that becomes ready to flush waits for the configured interval, while subsequent processes wait only until the leader completes the flush operation.
