# Sources — ARIES steal/no-force recovery

## Mohan, Haderle, Lindsay, Pirahesh & Schwarz, "ARIES: A Transaction Recovery Method" (ACM TODS, 1992)
URL: https://web.stanford.edu/class/cs345d-01/rl/aries.pdf
Fetched: 2026-10-24, cached at `sources/aries.txt`.
> fuzzy checkpoints, selective and deferred restart, fuzzy image copies, media recovery, and high concurrency lock modes

> A log record's update is redone if the affected page's page-LSN is less than the log record's LSN. No logging is performed when updates are redone.

> in ARIES, a CLR'S update is never undone and hence CLRS are viewed as redo-only log records.

## PostgreSQL: WAL Configuration (checkpoints)
URL: https://www.postgresql.org/docs/current/wal-configuration.html
Fetched: 2026-10-24, cached at `sources/wal-configuration.txt`.
> Checkpoints are points in the sequence of transactions at which it is guaranteed that the heap and index data files have been updated with all information written before that checkpoint. At checkpoint time, all dirty data pages are flushed to disk and a special checkpoint record is written to the WAL file.

> In the event of a crash, the crash recovery procedure looks at the latest checkpoint record to determine the point in the WAL (known as the redo record) from which it should start the REDO operation.
