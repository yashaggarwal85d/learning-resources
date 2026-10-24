# Sources — WAL flush points and I/O measurement

## PostgreSQL: Write-Ahead Logging (WAL)

URL: https://www.postgresql.org/docs/current/wal-intro.html
Fetched: 2026-10-23, cached at `sources/postgres-wal-intro.txt`.

> Using WAL results in a significantly reduced number of disk writes, because only the WAL file needs to be flushed to disk to guarantee that a transaction is committed, rather than every data file changed by the transaction.

> when the server is processing many small concurrent transactions, one fsync of the WAL file may suffice to commit many transactions.

## PostgreSQL: WAL Configuration

URL: https://www.postgresql.org/docs/current/wal-configuration.html
Fetched: 2026-10-23, cached at `sources/postgres-wal-configuration.txt`.

> Normally, WAL buffers should be written and flushed by an XLogFlush request, which is made, for the most part, at transaction commit time to ensure that transaction records are flushed to permanent storage.

> the purpose of commit_delay is to allow the cost of each flush operation to be amortized across concurrently committing transactions

## Linux kernel: Explicit volatile write back cache control

URL: https://docs.kernel.org/block/writeback_cache_control.html
Fetched: 2026-10-23, cached at `sources/writeback-cache-control.txt`.

> Many storage devices, especially in the consumer market, come with volatile write back caches. That means the devices signal I/O completion to the operating system before data actually has hit the non-volatile storage.

> The REQ_FUA flag can be OR ed into the r/w flags of a bio submitted from the filesystem and will make sure that I/O completion for this request is only signaled after the data has been committed to non-volatile storage.
