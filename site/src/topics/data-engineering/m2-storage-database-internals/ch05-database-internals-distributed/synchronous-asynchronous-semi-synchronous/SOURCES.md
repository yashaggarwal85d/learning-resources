# Sources: Synchronous, asynchronous and semi-synchronous replication (`de.synchronous-asynchronous-semi-synchronous`)

## 26.2.8. Synchronous Replication / 26.3. Failover (PostgreSQL documentation)

URL: https://www.postgresql.org/docs/current/warm-standby.html#SYNCHRONOUS-REPLICATION
Version: PostgreSQL 18 documentation, retrieved 2026-10-24

> PostgreSQL streaming replication is asynchronous by default. If the primary server crashes then some transactions that were committed may not have been replicated to the standby server, causing data loss.

> Synchronous replication offers the ability to confirm that all changes made by a transaction have been transferred to one or more synchronous standby servers.

> When requesting synchronous replication, each commit of a write transaction will wait until confirmation is received that the commit has been written to the write-ahead log on disk of both the primary and standby server.

> Waiting doesn't utilize system resources, but transaction locks continue to be held until the transfer is confirmed.

## 26.3. Failover (PostgreSQL documentation)

URL: https://www.postgresql.org/docs/current/warm-standby-failover.html
Version: PostgreSQL 18 documentation, retrieved 2026-10-24

> If the primary server fails then the standby server should begin failover procedures.

> To trigger failover of a log-shipping standby server, run pg_ctl promote or call pg_promote().

## Semisynchronous Replication (MariaDB documentation)

URL: https://mariadb.com/kb/en/semisynchronous-replication/
Version: MariaDB Server Documentation, retrieved 2026-10-24

> With regular asynchronous replication, replicas request events from the primary's binary log whenever the replicas are ready. The primary does not wait for a replica to confirm that an event has been received.

> Semisynchronous replication waits for just one replica to acknowledge that it has received and logged the events.

> If the primary crashes, then failover should be lossless, because all transactions committed on the primary would have been replicated to the replica.

> If the primary crashes, then failover may involve some data loss, because the primary may have committed transactions that had not yet been acknowledged by the replicas.

> If the replica does not acknowledge the transaction before a certain amount of time has passed, then a timeout occurs and the primary switches to asynchronous replication.
