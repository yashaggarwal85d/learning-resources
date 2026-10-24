# Sources — Snapshot visibility over version chains

## PostgreSQL Docs: 13.1. Introduction (Concurrency Control)
URL: https://www.postgresql.org/docs/current/mvcc-intro.html
Fetched: 2026-10-24, cached at `sources/mvcc-intro.txt`.
> The main advantage of using the MVCC model of concurrency control rather than locking is that in MVCC locks acquired for querying (reading) data do not conflict with locks acquired for writing data, and so reading never blocks writing and writing never blocks reading.

## PostgreSQL Docs: 5.6. System Columns
URL: https://www.postgresql.org/docs/current/ddl-system-columns.html
Fetched: 2026-10-24, cached at `sources/system-columns.txt`.
> The identity (transaction ID) of the inserting transaction for this row version. (A row version is an individual state of a row; each update of a row creates a new row version for the same logical row.)

> The identity (transaction ID) of the deleting transaction, or zero for an undeleted row version. It is possible for this column to be nonzero in a visible row version. That usually indicates that the deleting transaction hasn't committed yet, or that an attempted deletion was rolled back.

## PostgreSQL Docs: 13.2. Transaction Isolation
URL: https://www.postgresql.org/docs/current/transaction-iso.html
Fetched: 2026-10-24, cached at `sources/transaction-iso.txt`.
> a query in a repeatable read transaction sees a snapshot as of the start of the first non-transaction-control statement in the transaction, not as of the start of the current statement within the transaction
