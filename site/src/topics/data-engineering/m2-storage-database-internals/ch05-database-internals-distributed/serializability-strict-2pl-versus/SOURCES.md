# Sources: Serializability: strict 2PL versus SSI (`de.serializability-strict-2pl-versus`)

Cahill, Röhm & Fekete's own SIGMOD 2008 paper ("Serializable Isolation for Snapshot Databases")
is hosted only on mirrors that are unreachable from this sandbox (a UW course mirror redirects
to an institutional login wall; a UMN mirror genuinely TLS-fails, the same failure already seen
and documented in topic 12). Per the skill's source-substitution rule, it is replaced below by
PostgreSQL's own `README-SSI`, the design document shipped in the Postgres source tree itself
(written for Postgres 9.1's own SSI implementation, "based on the work of Cahill et al."), which
states the same dangerous-structure algorithm directly and cites Cahill et al.'s own paper by
name. This also directly serves the chapter plan's second named source (Ports & Grittner, 2012,
"Serializable Snapshot Isolation in PostgreSQL"): `README-SSI` *is* that implementation's own
documentation, maintained in Postgres's own repository.

## README-SSI (PostgreSQL source tree)

URL: https://raw.githubusercontent.com/postgres/postgres/master/src/backend/storage/lmgr/README-SSI
Version: `master` branch, retrieved 2026-10-24

> The primary technique which has been used is Strict Two-Phase Locking (S2PL), which operates by blocking writes against data which has been read by concurrent transactions and blocking any access (read or write) against data which has been written by concurrent transactions. A cycle in a graph of blocking indicates a deadlock, requiring a rollback. Blocking and deadlocks under S2PL in high contention workloads can be debilitating, crippling throughput and response time.

> This technique, known as Serializable Snapshot Isolation (SSI) has many of the advantages of snapshot isolation. In particular, reads don't block anything and writes don't block reads. Essentially, it runs snapshot isolation but monitors the read-write conflicts between transactions to identify dangerous structures in the transaction graph which indicate that a set of concurrent transactions might produce an anomaly, and rolls back transactions to ensure that no anomalies occur. It will produce some false positives (where a transaction is rolled back even though there would not have been an anomaly), but will never let an anomaly occur. In the two known prototype implementations, performance for many workloads (even with the need to restart transactions which are rolled back) is very close to snapshot isolation and generally far better than an S2PL implementation.

> In S2PL, each transaction locks any data it accesses. It holds the locks until committing, preventing other transactions from making conflicting accesses to the same data in the interim. Some transactions may have to be rolled back to prevent deadlock. But successful transactions can always be viewed as having occurred sequentially, in the order they committed.

> As of 9.1, serializable transactions in PostgreSQL are implemented using Serializable Snapshot Isolation (SSI), based on the work of Cahill et al.

> SSI is based on the observation [2] that each snapshot isolation anomaly corresponds to a cycle that contains a "dangerous structure" of two adjacent rw-conflict edges:

> Tin ------> Tpivot ------> Tout

> SSI works by watching for this dangerous structure, and rolling back a transaction when needed to prevent any anomaly. This means it only needs to track rw-conflicts between concurrent transactions, not wr- and ww-dependencies. It also means there is a risk of false positives, because not every dangerous structure is embedded in an actual cycle. The number of false positives is low in practice, so this represents an acceptable tradeoff for keeping the detection overhead low.

> Any transaction which must be rolled back to prevent serialization anomalies will fail with SQLSTATE 40001, which has a standard meaning of "serialization failure".

> This SSI implementation makes an effort to choose the transaction to be canceled such that an immediate retry of the transaction will not fail due to conflicts with exactly the same transactions.

## 13.2. Transaction Isolation (PostgreSQL documentation)

URL: https://www.postgresql.org/docs/current/transaction-iso.html
Version: PostgreSQL 18 documentation, retrieved 2026-10-24

> Applications using this level must be prepared to retry transactions due to serialization failures.

> When an application receives this error message, it should abort the current transaction and retry the whole transaction from the beginning. The second time through, the transaction will see the previously-committed change as part of its initial view of the database, so there is no logical conflict in using the new version of the row as the starting point for the new transaction's update.

> Note that only updating transactions might need to be retried; read-only transactions will never have serialization conflicts.

> To guarantee true serializability PostgreSQL uses predicate locking, which means that it keeps locks which allow it to determine when a write would have had an impact on the result of a previous read from a concurrent transaction, had it run first. In PostgreSQL these locks do not cause any blocking and therefore can not play any part in causing a deadlock.
