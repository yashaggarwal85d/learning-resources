# Sources: 2PC in production databases (`de.2pc-production-databases`)

## PREPARE TRANSACTION (PostgreSQL documentation)

URL: https://www.postgresql.org/docs/current/sql-prepare-transaction.html
Version: PostgreSQL 18 documentation, retrieved 2026-10-24

> PREPARE TRANSACTION prepares the current transaction for two-phase commit. After this command, the transaction is no longer associated with the current session; instead, its state is fully stored on disk, and there is a very high probability that it can be committed successfully, even if a database crash occurs before the commit is requested.

> From the point of view of the issuing session, PREPARE TRANSACTION is not unlike a ROLLBACK command: after executing it, there is no active current transaction, and the effects of the prepared transaction are no longer visible.

> Its purpose is to allow an external transaction manager to perform atomic global transactions across multiple databases or other transactional resources. Unless you're writing a transaction manager, you probably shouldn't be using PREPARE TRANSACTION.

> Once prepared, a transaction can later be committed or rolled back with COMMIT PREPARED or ROLLBACK PREPARED, respectively. Those commands can be issued from any session, not only the one that executed the original transaction.

> It is unwise to leave transactions in the prepared state for a long time. This will interfere with the ability of VACUUM to reclaim storage, and in extreme cases could cause the database to shut down to prevent transaction ID wraparound

> Keep in mind also that the transaction continues to hold whatever locks it held. The intended usage of the feature is that a prepared transaction will normally be committed or rolled back as soon as an external transaction manager has verified that other databases are also prepared to commit.

## Distributed Transaction Processing: The XA Specification (X/Open Company Ltd., 1991)

URL: https://pubs.opengroup.org/onlinepubs/009680699/toc.pdf
Version: X/Open CAE Specification, December 1991, retrieved 2026-10-24

> TMs and RMs use two-phase commit with presumed rollback, as defined by the referenced OSI DTP specification (model).

> In Phase 1, the TM asks all RMs to prepare to commit (or prepare) transaction branches. This asks whether the RM can guarantee its ability to commit the transaction branch.

> If an RM can commit its work, it records stably the information it needs to do so, then replies affirmatively. A negative reply reports failure for any reason.

> In Phase 2, the TM issues all RMs an actual request to commit or roll back the transaction branch, as the case may be. (Before issuing requests to commit, the TM stably records the fact that it decided to commit, as well as a list of all involved RMs.)

> The TM rolls back the global transaction if any RM responds negatively to the Phase 1 request, or if the AP directs the TM to roll back the global transaction. Therefore, any negative response vetoes the global transaction.

> An affirmative return from xa_prepare () guarantees that a subsequent xa_commit() or xa_rollback () succeeds, even if the RM experiences a failure after responding to xa_prepare ().

## Spanner: Google's Globally-Distributed Database (Corbett et al., OSDI 2012)

URL: https://static.googleusercontent.com/media/research.google.com/en//archive/spanner-osdi2012.pdf
Version: Published in the Proceedings of OSDI 2012, retrieved 2026-10-24

> The transaction manager is used to implement a participant leader; the other replicas in the group will be referred to as participant slaves.

> One of the participant groups is chosen as the coordinator: the participant leader of that group will be referred to as the coordinator leader, and the slaves of that group as coordinator slaves. The state of each transaction manager is stored in the underlying Paxos group (and therefore is replicated).

> Running two-phase commit over Paxos mitigates the availability problems.

> Having the client drive two-phase commit avoids sending data twice across wide-area links.
