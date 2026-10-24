# Sources — Update strategies: in-place, append, copy-on-write

## PostgreSQL: Heap-Only Tuples (HOT)

URL: https://www.postgresql.org/docs/current/storage-hot.html
Fetched: 2026-10-24, cached at `sources/storage-hot.txt`.

> To allow for high concurrency, PostgreSQL uses multiversion concurrency control (MVCC) to store rows. However, MVCC has some downsides for update queries. Specifically, updates require new versions of rows to be added to tables.

## LevelDB: Implementation notes

URL: https://raw.githubusercontent.com/google/leveldb/main/doc/impl.md
Fetched: 2026-10-24, cached at `sources/leveldb-impl.txt`.

> A log file (*.log) stores a sequence of recent updates. Each update is appended to the current log file.

> The old files are discarded and the new files are added to the serving state.

## LMDB: Lightning Memory-Mapped Database Manager

URL: http://www.lmdb.tech/doc/index.html
Fetched: 2026-10-24, cached at `sources/lmdb-doc.txt`.

> Data pages use a copy-on- write strategy so no active data pages are ever overwritten, which also provides resistance to corruption and eliminates the need of any special recovery procedures after a system crash.

> Unlike other well-known database mechanisms which use either write-ahead transaction logs or append-only data writes, LMDB requires no maintenance during operation. Both write-ahead loggers and append-only databases require periodic checkpointing and/or compaction of their log or database files otherwise they grow without bound.
