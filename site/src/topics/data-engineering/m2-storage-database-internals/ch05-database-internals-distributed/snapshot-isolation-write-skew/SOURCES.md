# Sources: Snapshot isolation and write skew (`de.snapshot-isolation-write-skew`)

Fekete, Liarokapis, O'Neil, O'Neil & Shasha's own paper, "Making Snapshot Isolation
Serializable" (the chapter plan's named source for write skew's formal treatment), is hosted
only on mirrors with a genuine TLS failure from this sandbox (`curl -v` against
`www-users.cselabs.umn.edu` fails with "unable to get local issuer certificate", independent of
this session's own proxy; a second mirror on `courses.cs.washington.edu` redirects to an
institutional login wall). Per the skill's source-substitution rule, it is replaced below by
Wikipedia's "Snapshot isolation" article, which states the same write-skew mechanism and
balance-pair example this paper is cited for, with Fekete et al.'s own paper named among its
citations. MySQL's own InnoDB isolation-levels page returned HTTP 403 to a direct fetch from
this sandbox (confirmed independent of the browsing tool used to retrieve its real page text);
its quotes below are the genuine, current text of that live page.

## 13.2. Transaction Isolation (PostgreSQL documentation)

URL: https://www.postgresql.org/docs/current/transaction-iso.html
Version: PostgreSQL 18 documentation, retrieved 2026-10-24

> The Repeatable Read isolation level is implemented using a technique known in academic database literature and in some other database products as Snapshot Isolation.

> UPDATE, DELETE, MERGE, SELECT FOR UPDATE, and SELECT FOR SHARE commands behave the same as SELECT in terms of searching for target rows: they will only find target rows that were committed as of the transaction start time. However, such a target row might have already been updated (or deleted or locked) by another concurrent transaction by the time it is found. In this case, the repeatable read transaction will wait for the first updating transaction to commit or roll back (if it is still in progress). If the first updater rolls back, then its effects are negated and the repeatable read transaction can proceed with updating the originally found row. But if the first updater commits (and actually updated or deleted the row, not just locked it) then the repeatable read transaction will be rolled back with the message

> because a repeatable read transaction cannot modify or lock rows changed by other transactions after the repeatable read transaction began.

> Suppose that serializable transaction A computes:

> and then inserts the result (30) as the value in a new row with class = 2. Concurrently, serializable transaction B computes:

> and obtains the result 300, which it inserts in a new row with class = 1. Then both transactions try to commit. If either transaction were running at the Repeatable Read isolation level, both would be allowed to commit; but since there is no serial order of execution consistent with the result, using Serializable transactions will allow one transaction to commit and will roll the other back with this message:

> The Serializable isolation level is implemented using a technique known in academic database literature as Serializable Snapshot Isolation, which builds on Snapshot Isolation by adding checks for serialization anomalies.

## Data Concurrency and Consistency (Oracle Database Concepts)

URL: https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/data-concurrency-and-consistency.html
Version: Oracle Database 19c Concepts, retrieved 2026-10-24

> In the serializable isolation level, a transaction sees only changes committed at the time the transaction—not the query—began and changes made by the transaction itself.

> A serializable transaction operates in an environment that makes it appear as if no other users were modifying data in the database.

> Oracle Database permits a serializable transaction to modify a row only if changes to the row made by other transactions were already committed when the serializable transaction began. The database generates an error when a serializable transaction tries to update or delete data changed by a different transaction that committed after the serializable transaction began:

## 17.7.2.1 Transaction Isolation Levels (MySQL 8.0 Reference Manual)

URL: https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html
Version: MySQL 8.0 Reference Manual, retrieved 2026-10-24

> Consistent reads within the same transaction read the snapshot established by the first read. This means that if you issue several plain (nonlocking) SELECT statements within the same transaction, these SELECT statements are consistent also with respect to each other.

> It is not recommended to mix locking statements (UPDATE, INSERT, DELETE, or SELECT ... FOR ...) with non-locking SELECT statements in a single REPEATABLE READ transaction, because typically in such cases you want SERIALIZABLE.

## Snapshot isolation (Wikipedia)

URL: https://en.wikipedia.org/wiki/Snapshot_isolation
Version: retrieved 2026-10-24

> A transaction executing under snapshot isolation appears to operate on a personal snapshot of the database, taken at the start of the transaction. When the transaction concludes, it will successfully commit only if the values updated by the transaction have not been changed externally since the snapshot was taken. Such a write–write conflict will cause the transaction to abort.

> In a write skew anomaly, two transactions (T1 and T2) concurrently read an overlapping data set (e.g. values V1 and V2), concurrently make disjoint updates (e.g. T1 updates V1, T2 updates V2), and finally concurrently commit, neither having seen the update performed by the other. Were the system serializable, such an anomaly would be impossible, as either T1 or T2 would have to occur "first", and be visible to the other. In contrast, snapshot isolation permits write skew anomalies.

> As a concrete example, imagine V1 and V2 are two balances held by a single person, Phil. The bank will allow either V1 or V2 to run a deficit, provided the total held in both is never negative (i.e. V1 + V2 ≥ 0). Both balances are currently $100. Phil initiates two transactions concurrently, T1 withdrawing $200 from V1, and T2 withdrawing $200 from V2.

> If the database is under snapshot isolation(MVCC), however, T1 and T2 operate on private snapshots of the database: each deducts $200 from an account, and then verifies that the new total is zero, using the other account value that held when the snapshot was taken. Since neither update conflicts, both commit successfully, leaving V1 = V2 = −$100, and V1 + V2 = −$200.

> In spite of its distinction from serializability, snapshot isolation is sometimes referred to as serializable by Oracle.
