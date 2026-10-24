# Sources: Locking, deadlocks and lock escalation (`de.locking-deadlocks-lock-escalation`)

Db2's own `maxlocks` configuration-parameter page returned HTTP 403 to this sandbox's direct
fetch tooling (confirmed independent of the browsing tool used to retrieve its real page text, a
bot-protection response rather than the page being offline); its quotes below are the genuine,
current text of that live page.

## 13.3. Explicit Locking (PostgreSQL documentation)

URL: https://www.postgresql.org/docs/current/explicit-locking.html
Version: PostgreSQL 18 documentation, retrieved 2026-10-24

> Remember that all of these lock modes are table-level locks, even if the name contains the word "row"; the names of the lock modes are historical. To some extent the names reflect the typical usage of each lock mode — but the semantics are all the same. The only real difference between one lock mode and another is the set of lock modes with which each conflicts

> ACCESS EXCLUSIVE (AccessExclusiveLock)

> Conflicts with locks of all modes (ACCESS SHARE, ROW SHARE, ROW EXCLUSIVE, SHARE UPDATE EXCLUSIVE, SHARE, SHARE ROW EXCLUSIVE, EXCLUSIVE, and ACCESS EXCLUSIVE). This mode guarantees that the holder is the only transaction accessing the table in any way.

> Acquired by the DROP TABLE, TRUNCATE, REINDEX, CLUSTER, VACUUM FULL, and REFRESH MATERIALIZED VIEW (without CONCURRENTLY) commands. Many forms of ALTER INDEX and ALTER TABLE also acquire a lock at this level.

> Only an ACCESS EXCLUSIVE lock blocks a SELECT (without FOR UPDATE/SHARE) statement.

> The use of explicit locking can increase the likelihood of deadlocks, wherein two (or more) transactions each hold locks that the other wants. For example, if transaction 1 acquires an exclusive lock on table A and then tries to acquire an exclusive lock on table B, while transaction 2 has already exclusive-locked table B and now wants an exclusive lock on table A, then neither one can proceed. PostgreSQL automatically detects deadlock situations and resolves them by aborting one of the transactions involved, allowing the other(s) to complete.

> The best defense against deadlocks is generally to avoid them by being certain that all applications using a database acquire locks on multiple objects in a consistent order.

## 19.12. Lock Management (PostgreSQL documentation)

URL: https://www.postgresql.org/docs/current/runtime-config-locks.html
Version: PostgreSQL 18 documentation, retrieved 2026-10-24

> This is the amount of time to wait on a lock before checking to see if there is a deadlock condition. The check for deadlock is relatively expensive, so the server doesn't run it every time it waits for a lock. We optimistically assume that deadlocks are not common in production applications and just wait on the lock for a while before checking for a deadlock.

## Transaction Locking and Row Versioning Guide (SQL Server documentation)

URL: https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide
Version: Microsoft Learn, retrieved 2026-10-24

> The Database Engine uses intent locks to protect placing a shared (S) lock or exclusive (X) lock on a resource lower in the lock hierarchy. Intent locks are named "intent locks" because they're acquired before a lock at the lower level and, therefore, signal intent to place locks at a lower level.

> Intent locks include intent shared (IS), intent exclusive (IX), and shared with intent exclusive (SIX).

> Lock escalation is the process of converting many fine-grained locks into fewer coarse-grain locks, reducing system overhead while increasing the probability of concurrency contention.

> When the Database Engine checks for possible escalations at every 1,250 newly acquired locks, a lock escalation will occur if and only if a Transact-SQL statement has acquired at least 5,000 locks on a single reference of a table.

> If the lock escalation attempt succeeds and the full table lock is acquired, then all HoBT, page (PAGE), or row-level (RID, KEY) locks held by the transaction on the heap or index are released.

## Deadlocks Guide (SQL Server documentation)

URL: https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide
Version: Microsoft Learn, retrieved 2026-10-24

> The Database Engine deadlock monitor periodically checks for tasks that are in a deadlock. If the monitor detects a cyclic dependency, it chooses one of the tasks as a victim and terminates its transaction with an error.

> In the illustration, transaction T1 has a dependency on transaction T2 for the Part table lock resource. Similarly, transaction T2 has a dependency on transaction T1 for the Supplier table lock resource. Because these dependencies form a cycle, there's a deadlock between transactions T1 and T2.

> When the lock monitor initiates deadlock search for a particular thread, it identifies the resource on which the thread is waiting. The lock monitor then finds the owners for that particular resource and recursively continues the deadlock search for those threads until it finds a cycle.

> If the lock monitor thread finds deadlocks, the deadlock detection interval drops from 5 seconds to as low as 100 milliseconds depending on the frequency of deadlocks.

## maxlocks - Maximum percent of lock list before escalation configuration parameter (Db2 documentation)

URL: https://www.ibm.com/docs/en/SSHRBY/com.ibm.db2.luw.admin.config.doc/doc/r0000268.html
Version: Db2 documentation, retrieved 2026-10-24

> This parameter defines a percentage of the lock list held by an application that must be reached before the database manager performs escalation of locks for that application.

> When the number of locks held by any one application reaches this percentage of the total lock list size, lock escalation occurs for the locks that application holds. Lock escalation also occurs if the lock list runs out of space.

## Deadlock prevention algorithms (Wikipedia)

URL: https://en.wikipedia.org/wiki/Deadlock_prevention_algorithms
Version: retrieved 2026-10-24

> If a lower-priority transaction waits for a (either committed or uncommitted) unaborted higher-priority transaction, the lower priority transaction gets aborted.

> If a higher-priority transaction waits for an uncommitted unaborted lower priority transaction, the lower priority transaction gets aborted.
