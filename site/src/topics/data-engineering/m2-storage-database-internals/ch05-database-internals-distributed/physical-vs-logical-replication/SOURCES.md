# Sources: Physical vs logical replication (`de.physical-vs-logical-replication`)

## Chapter 29. Logical Replication (PostgreSQL documentation)

URL: https://www.postgresql.org/docs/current/logical-replication.html
Version: PostgreSQL 18 documentation, retrieved 2026-10-24

> We use the term logical in contrast to physical replication, which uses exact block addresses and byte-by-byte replication.

> Replicating between different major versions of PostgreSQL.

> Replicating between PostgreSQL instances on different platforms (for example Linux to Windows).

## 26.2.6. Replication Slots (PostgreSQL documentation)

URL: https://www.postgresql.org/docs/current/warm-standby.html#STREAMING-REPLICATION-SLOTS
Version: PostgreSQL 18 documentation, retrieved 2026-10-24

> Replication slots provide an automated way to ensure that the primary server does not remove WAL segments until they have been received by all standbys, and that the primary does not remove rows which could cause a recovery conflict even when the standby is disconnected.

> Beware that replication slots can cause the server to retain so many WAL segments that they fill up the space allocated for pg_wal.

## PostgreSQL 17.0 Release Notes (PostgreSQL documentation)

URL: https://www.postgresql.org/docs/release/17.0/
Version: Released September 2024, retrieved 2026-10-24

> Enable the failover of logical slots

> Add server variable sync_replication_slots to enable failover logical slot synchronization

## Binary Log Formats (MariaDB documentation)

URL: https://mariadb.com/kb/en/binary-log-formats/
Version: MariaDB Server Documentation, retrieved 2026-10-24

> When row-based logging is enabled, DML statements are not logged to the binary log. Instead, each insert, update, or delete performed by the statement for each row is logged to the binary log separately.
