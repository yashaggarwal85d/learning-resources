# Sources: Optimistic vs pessimistic concurrency control (`de.optimistic-vs-pessimistic-concurrency`)

## 13.3. Explicit Locking (PostgreSQL documentation)

URL: https://www.postgresql.org/docs/current/explicit-locking.html
Version: PostgreSQL 18 documentation, retrieved 2026-10-24

> FOR UPDATE causes the rows retrieved by the SELECT statement to be locked as though for update. This prevents them from being locked, modified or deleted by other transactions until the current transaction ends.

> other transactions that attempt UPDATE, DELETE, SELECT FOR UPDATE, SELECT FOR NO KEY UPDATE, SELECT FOR SHARE or SELECT FOR KEY SHARE of these rows will be blocked until the current transaction ends; conversely, SELECT FOR UPDATE will wait for a concurrent transaction that has run any of those commands on the same row, and will then lock and return the updated row (or no row, if the row was deleted).

> Within a REPEATABLE READ or SERIALIZABLE transaction, however, an error will be thrown if a row to be locked has changed since the transaction started.

> PostgreSQL doesn't remember any information about modified rows in memory, so there is no limit on the number of rows locked at one time. However, locking a row might cause a disk write, e.g., SELECT FOR UPDATE modifies selected rows to mark them locked, and so will result in disk writes.

## 13.4. Data Consistency Checks at the Application Level (PostgreSQL documentation)

URL: https://www.postgresql.org/docs/current/applevel-consistency.html
Version: PostgreSQL 18 documentation, retrieved 2026-10-24

> When non-serializable writes are possible, to ensure the current validity of a row and protect it against concurrent updates one must use SELECT FOR UPDATE, SELECT FOR SHARE, or an appropriate LOCK TABLE statement.

> Also of note to those converting from other environments is the fact that SELECT FOR UPDATE does not ensure that a concurrent transaction will not update or delete a selected row. To do that in PostgreSQL you must actually update the row, even if no values need to be changed. SELECT FOR UPDATE temporarily blocks other transactions from acquiring the same lock or executing an UPDATE or DELETE which would affect the locked row, but once the transaction holding this lock commits or rolls back, a blocked transaction will proceed with the conflicting operation unless an actual UPDATE of the row was performed while the lock was held.

## On Optimistic Methods for Concurrency Control (Kung & Robinson, ACM TODS, 1981)

URL: https://www.eecs.harvard.edu/~htk/publication/1981-tods-kung-robinson.pdf
Version: ACM Transactions on Database Systems, Vol. 6, No. 2, June 1981, pages 213-226, retrieved 2026-10-24

> Most current approaches to concurrency control in database systems rely on locking of data objects as a control mechanism. In this paper, two families of nonlocking concurrency controls are presented. The methods used are "optimistic" in the sense that they rely mainly on transaction backup as a control mechanism, "hoping" that conflicts between transactions will not occur.

> It is required that any transaction consist of two or three phases: a read phase, a validation phase, and a possible write phase (see Figure 1). During the read phase, all writes take place on local copies of the nodes to be modified. Then, if it can be established during the validation phase that the changes the transaction made will not cause a loss of integrity, the local copies are made global in the write phase.

> If, in a locking approach, locking is only necessary in the worst case, then in an optimistic approach validation will fail also only in the worst case. If validation does fail, the transaction will be backed up and start over again as a new transaction. Thus a transaction will have a write phase only if the preceding validation succeeds.
