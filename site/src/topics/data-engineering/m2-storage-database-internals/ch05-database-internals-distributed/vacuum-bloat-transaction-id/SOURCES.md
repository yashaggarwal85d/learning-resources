# Sources — de.vacuum-bloat-transaction-id

## Postgres 18, Routine Vacuuming (24.1)

URL: https://www.postgresql.org/docs/current/routine-vacuuming.html
Version: PostgreSQL 18 documentation (fetched 2026-10-24)

> In PostgreSQL, an UPDATE or DELETE of a row does not immediately remove the old version of the row. This approach is necessary to gain the benefits of multiversion concurrency control (MVCC, see Chapter 13): the row version must not be deleted while it is still potentially visible to other transactions. But eventually, an outdated or deleted row version is no longer of interest to any transaction. The space it occupies must then be reclaimed for reuse by new rows, to avoid unbounded growth of disk space requirements. This is done by running VACUUM.

> The standard form of VACUUM removes dead row versions in tables and indexes and marks the space available for future reuse. However, it will not return the space to the operating system, except in the special case where one or more pages at the end of a table become entirely free and an exclusive table lock can be easily obtained.

> Vacuum maintains a visibility map for each table to keep track of which pages contain only tuples that are known to be visible to all active transactions (and all future transactions, until the page is again modified). This has two purposes. First, vacuum itself can skip such pages on the next run, since there is nothing to clean up.

> Second, it allows PostgreSQL to answer some queries using only the index, without reference to the underlying table. Since PostgreSQL indexes don't contain tuple visibility information, a normal index scan fetches the heap tuple for each matching index entry, to check whether it should be seen by the current transaction. An index-only scan, on the other hand, checks the visibility map first. If it's known that all tuples on the page are visible, the heap fetch can be skipped.

> PostgreSQL's MVCC transaction semantics depend on being able to compare transaction ID (XID) numbers: a row version with an insertion XID greater than the current transaction's XID is "in the future" and should not be visible to the current transaction. But since transaction IDs have limited size (32 bits) a cluster that runs for a long time (more than 4 billion transactions) would suffer transaction ID wraparound: the XID counter wraps around to zero, and all of a sudden transactions that were in the past appear to be in the future — which means their output become invisible. In short, catastrophic data loss. (Actually the data is still there, but that's cold comfort if you cannot get at it.) To avoid this, it is necessary to vacuum every table in every database at least once every two billion transactions.

> The reason that periodic vacuuming solves the problem is that VACUUM will mark rows as frozen, indicating that they were inserted by a transaction that committed sufficiently far in the past that the effects of the inserting transaction are certain to be visible to all current and future transactions.

> If these warnings are ignored, the system will refuse to assign new XIDs once there are fewer than three million transactions left until wraparound:
>
> ERROR: database is not accepting commands that assign new transaction IDs to avoid wraparound data loss in database "mydb"
> HINT: Execute a database-wide VACUUM in that database.
>
> In this condition any transactions already in progress can continue, but only read-only transactions can be started. Operations that modify database records or truncate relations will fail.

> Resolve old prepared transactions. You can find these by checking pg_prepared_xacts for rows where age(transactionid) is large. Such transactions should be committed or rolled back.
>
> End long-running open transactions. You can find these by checking pg_stat_activity for rows where age(backend_xid) or age(backend_xmin) is large. Such transactions should be committed or rolled back, or the session can be terminated using pg_terminate_backend.
>
> Drop any old replication slots. Use pg_replication_slots to find slots where age(xmin) or age(catalog_xmin) is large. In many cases, such slots were created for replication to servers that no longer exist, or that have been down for a long time.

> PostgreSQL has an optional but highly recommended feature called autovacuum, whose purpose is to automate the execution of VACUUM and ANALYZE commands. When enabled, autovacuum checks for tables that have had a large number of inserted, updated or deleted tuples.

> Tables whose relfrozenxid value is more than autovacuum_freeze_max_age transactions old are always vacuumed (this also applies to those tables whose freeze max age has been modified via storage parameters; see below). Otherwise, if the number of tuples obsoleted since the last VACUUM exceeds the "vacuum threshold", the table is vacuumed.

Contents:
- 24.1.1 Vacuuming Basics — why VACUUM runs (reclaim space, update planner stats, update visibility map, prevent XID/multixact wraparound).
- 24.1.2 Recovering Disk Space — standard VACUUM vs VACUUM FULL; space marked reusable but not returned to the OS.
- 24.1.3 Updating Planner Statistics — ANALYZE, out of this topic's scope.
- 24.1.4 Updating the Visibility Map — what the visibility map tracks and the two things it enables (skip pages on next vacuum; index-only scans).
- 24.1.5 Preventing Transaction ID Wraparound Failures — the XID counter, freezing, FrozenTransactionId, the warning/error thresholds, the exact three recovery steps (prepared transactions, long-running transactions, replication slots), autovacuum_freeze_max_age.
- 24.1.5.1 Multixacts and Wraparound — multixact IDs for row-level locking by multiple transactions; out of this topic's scope (declared, not taught).
- 24.1.6 The Autovacuum Daemon — launcher/worker processes, the vacuum-threshold formula, why autovacuum workers don't normally block other commands (but an anti-wraparound autovacuum isn't interrupted).

## Postgres 18, Heap-Only Tuples (HOT) (66.7)

URL: https://www.postgresql.org/docs/current/storage-hot.html
Version: PostgreSQL 18 documentation (fetched 2026-10-24)

> To help reduce the overhead of updates, PostgreSQL has an optimization called heap-only tuples (HOT). This optimization is possible when:
>
> The update does not modify any columns referenced by the table's indexes, not including summarizing indexes. The only summarizing index method in the core PostgreSQL distribution is BRIN.
>
> There is sufficient free space on the page containing the old row for the updated row.

> In such cases, heap-only tuples provide two optimizations:
>
> New index entries are not needed to represent updated rows, however, summary indexes may still need to be updated.
>
> When a row is updated multiple times, row versions other than the oldest and the newest can be completely removed during normal operation, including SELECTs, instead of requiring periodic vacuum operations. (Indexes always refer to the page item identifier of the original row version. The tuple data associated with that row version is removed, and its item identifier is converted to a redirect that points to the oldest version that may still be visible to some concurrent transaction. Intermediate row versions that are no longer visible to anyone are completely removed, and the associated page item identifiers are made available for reuse.)

> You can increase the likelihood of sufficient page space for HOT updates by decreasing a table's fillfactor. If you don't, HOT updates will still happen because new rows will naturally migrate to new pages and existing pages with sufficient free space for new row versions. The system view pg_stat_all_tables allows monitoring of the occurrence of HOT and non-HOT updates.

Contents:
- The two preconditions for a HOT update (no indexed column changed; enough free space on the page).
- The two optimizations HOT provides (skip new index entries; opportunistic pruning of dead intermediate versions outside VACUUM).
- fillfactor and pg_stat_all_tables as the tuning/observability knobs.

## Postgres 18, Log-Shipping Standby Servers — Replication Slots (26.2.6)

URL: https://www.postgresql.org/docs/current/warm-standby.html#STREAMING-REPLICATION-SLOTS
Version: PostgreSQL 18 documentation (fetched 2026-10-24)

> Replication slots provide an automated way to ensure that the primary server does not remove WAL segments until they have been received by all standbys, and that the primary does not remove rows which could cause a recovery conflict even when the standby is disconnected.

> Similarly, hot_standby_feedback on its own, without also using a replication slot, provides protection against relevant rows being removed by vacuum, but provides no protection during any time period when the standby is not connected.

> Beware that replication slots can cause the server to retain so many WAL segments that they fill up the space allocated for pg_wal.

Contents:
- 26.2.6 Replication Slots — a replication slot holds back both WAL recycling and the rows vacuum would otherwise remove, even while the standby it was made for is disconnected or gone.

## Sentry: Transaction ID Wraparound in Postgres (2015 production outage)

URL: https://blog.sentry.io/transaction-id-wraparound-in-postgres
Version: David Cramer, July 23, 2015 (fetched 2026-10-24)

> On Monday, July 20th, Sentry was down for most of the US working day. We deeply regret any issues this may have caused for your team and have taken measures to reduce the risk of this happening in the future.

> The internet is full of awful advice from users suggesting you should turn off autovacuum, or run it manually at low traffic times, or simply adjust its schedule to run less often. To know why that's ill-advised, you first need to understand the consequences of autovacuum not running.

> Once you've reached this value, the semantics of MVCC can no longer function correctly. As mentioned earlier, the XID counter is used to issue unique values that identify an individual transaction. Since there are no longer any unique XID values available to identify new transactions, the database must halt to prevent XID re-use — otherwise, transactions that occurred in the past could suddenly appear to be in the future, leading to all kinds of strange and undesirable behavior (such as deleted rows reappearing, updated rows reverting to previous states, referential integrity or constraint violations, among others.) To protect you from this, Postgres will stop accepting commands when there are fewer than one million transactions left before the maximum XID value is reached.

> Sentry is a very write-heavy application. On top of that, we have some very large relational tables (both in number of rows, as well as physical size on disk). Due to these concerns we've gone back and forth on tuning autovacuum to avoid this very situation.

> Once Postgres kicks in its XID wraparound protection, unless you're willing to accept data loss, your only option is to stop accepting writes and vacuum the relations.

> By querying Postgres' internal statistics we identified that the autovacuums actually had finished on all of the relations except one. That relation however is a massive one. It's a very large table which stores a mapping of events to their rollups, and we require one of these entries for every single event Sentry receives.

> At this stage, we made the decision that we were willing to risk all data in the table if it meant we could recover immediately. In this case, the risk was minor. It's used for features that aren't critical, and if nothing else we had full backups via replicas.
>
> With our best estimations, we made the call to truncate the table. Five minutes later, the system was fully restored.

> We previously ran with too high a value for autovacuum_freeze_max_age and the default of 3 autovacuum workers. Additionally, we had been running with far too much delay in vacuuming which meant lower load on the system, but more idle time in maintenance.

Contents:
- The outage: a write-heavy, large-table workload hit XID wraparound protection and went fully read-only for most of a working day.
- Why "just disable autovacuum" is the exact wrong fix — it is what caused the exposure in the first place.
- The actual recovery: waiting for autovacuum to finish, then (because one huge, non-critical table's autovacuum had stalled) truncating that one table to restore writes in minutes rather than hours.
- The post-incident fix: tuning autovacuum_freeze_max_age, autovacuum_max_workers, and removing excess cost-delay — i.e. the production dial every one of the sources above documents, turned the wrong way, and the specific knobs turned back.
