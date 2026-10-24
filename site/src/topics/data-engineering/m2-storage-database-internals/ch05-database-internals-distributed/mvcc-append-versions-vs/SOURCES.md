# Sources — MVCC: append versions vs undo logs

## pg-mvcc-model — PostgreSQL 18 documentation (13.1. Introduction)
URL: https://www.postgresql.org/docs/current/mvcc-intro.html
Fetched: 2026-10-24, cached at `sources/pg-mvcc-intro.txt`.

> PostgreSQL provides a rich set of tools for developers to manage concurrent access to data. Internally, data consistency is maintained by using a multiversion model (Multiversion Concurrency Control, MVCC). This means that each SQL statement sees a snapshot of data (a database version) as it was some time ago, regardless of the current state of the underlying data. This prevents statements from viewing inconsistent data produced by concurrent transactions performing updates on the same data rows, providing transaction isolation for each database session.

> The main advantage of using the MVCC model of concurrency control rather than locking is that in MVCC locks acquired for querying (reading) data do not conflict with locks acquired for writing data, and so reading never blocks writing and writing never blocks reading.

## pg-heap-tuple-header — PostgreSQL 18 documentation (66.6.1. Table Row Layout)
URL: https://www.postgresql.org/docs/current/storage-page-layout.html
Fetched: 2026-10-24, cached at `sources/pg-storage-page-layout.txt`.

> All table rows are structured in the same way. There is a fixed-size header (occupying 23 bytes on most machines), followed by an optional null bitmap, an optional object ID field, and the user data.

Table 66.4's field list (quoted item by item for the coverage map): `t_xmin` — TransactionId, 4 bytes, "insert XID stamp"; `t_xmax` — TransactionId, 4 bytes, "delete XID stamp"; `t_ctid` — ItemPointerData, 6 bytes, "current TID of this or newer row version".

## pg-snapshot-functions — PostgreSQL 18 documentation (9.27.8. Transaction ID and Snapshot Information Functions)
URL: https://www.postgresql.org/docs/current/functions-info.html
Fetched: 2026-10-24, cached at `sources/pg-functions-info.txt`.

> Returns a current snapshot, a data structure showing which transaction IDs are now in-progress. Only top-level transaction IDs are included in the snapshot; subtransaction IDs are not shown; see Section 67.3 for details.

> Reports the commit status of a recent transaction. The result is one of in progress, committed, or aborted, provided that the transaction is recent enough that the system retains the commit status of that transaction.

## innodb-undo-log — MariaDB Documentation (InnoDB Undo Log)
URL: https://mariadb.com/docs/server/server-usage/storage-engines/innodb/innodb-undo-log
Fetched: 2026-10-24, cached at `sources/mariadb-innodb-undo-log.txt`.

> When a transaction writes data, it always inserts them in the table indexes or data (in the buffer pool or in physical files). No private copies are created. The old versions of data being modified by active InnoDB transactions are stored in the undo log. The original data can then be restored, or viewed by a consistent read.

> The purge thread deletes the rows in the undo log which are not needed by any existing view. The rows for which a most recent version exists are deleted, as well as the delete-marked rows.

## innodb-read-view — MariaDB Documentation (START TRANSACTION ... WITH CONSISTENT SNAPSHOT)
URL: https://mariadb.com/docs/server/ha-and-performance/standard-replication/enhancements-for-start-transaction-with-consistent-snapshot
Fetched: 2026-10-24, cached at `sources/mariadb-consistent-snapshot.txt`.

> MariaDB's InnoDB storage engine uses a mechanism called MVCC (Multi-Version Concurrency Control) to handle concurrent data access. A core component of MVCC is the read view.

> A read view can be thought of as an instantaneous snapshot of the database. When a transaction uses a read view, it sees only the data that was committed at the moment the "snapshot" was taken. It ignores any changes made by transactions that had not yet committed, as well as any changes from transactions that started after the read view was created.

## oracle-undo-read-consistency — Oracle Database 23ai Concepts (Data Concurrency and Consistency)
URL: https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/data-concurrency-and-consistency.html
Fetched: 2026-10-24, cached at `sources/oracle-concepts-consistency.txt`.

> Oracle AI Database achieves read consistency through undo data.

> Whenever a user modifies data, Oracle AI Database creates undo entries, which it writes to undo segments. The undo segments contain the old values of data that have been changed by uncommitted or recently committed transactions. Thus, multiple versions of the same data, all at different points in time, can exist in the database.

> As the database retrieves data blocks on behalf of a query, the database ensures that the data in each block reflects the contents of the block when the query began. The database rolls back changes to the block as needed to reconstruct the block to the point in time the query started processing.

> The database copies current data blocks to a new buffer and applies undo data to reconstruct previous versions of the blocks. These reconstructed data blocks are called consistent read (CR) clones.

## oracle-snapshot-too-old — Oracle Database 23ai Concepts (Read-Only Isolation Level)
URL: https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/data-concurrency-and-consistency.html
Fetched: 2026-10-24, cached at `sources/oracle-concepts-consistency.txt`.

> Oracle AI Database achieves read consistency by reconstructing data as needed from the undo segments. Because undo segments are used in a circular fashion, the database can overwrite undo data. Long-running reports run the risk that undo data required for read consistency may have been reused by a different transaction, raising a snapshot too old error. Setting an undo retention period, which is the minimum amount of time that the database attempts to retain old undo data before overwriting it, appropriately avoids this problem.

## innodb-clustered-pk — MariaDB Documentation (PRIMARY KEY Constraints)
URL: https://mariadb.com/docs/server/architecture/server-constraints/primary-key-constraints
Fetched: 2026-10-24, cached at `sources/mariadb-pk-constraints.txt`.

> InnoDB uses the primary key as a clustered index, which means that InnoDB stores table data in the order determined by the primary key.

## ora-01555-reference — Oracle Database Error Messages (ORA-01555)
URL: https://docs.oracle.com/error-help/db/ora-01555/
Fetched: 2026-10-24, cached at `sources/oracle-ora-01555.txt`.

> snapshot too old: rollback segment number string with name "string" too small

> rollback records needed by a reader for consistent read are overwritten by other writers

> If in Automatic Undo Management mode, increase undo_retention setting. Otherwise, use larger rollback segments

Last verified: 2026-10-24. Expert sign-off: pending.
