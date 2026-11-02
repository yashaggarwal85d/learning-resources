# Sources: Replication lag and session guarantees (`de.replication-lag-session-guarantees`)

## Read Your Writes (Jepsen)

URL: https://jepsen.io/consistency/models/read-your-writes
Version: retrieved 2026-10-30

> Read your writes (also known as read my writes) requires that if a process performs a write w, and that same process performs a subsequent read r, then r must observe w's effects.

> Note that read your writes does not apply to operations performed by different processes. There is no guarantee, for instance, that if process 1 writes a value successfully, that process 2 will subsequently observe that write.

Jepsen restates the read-your-writes session guarantee that Terry et al. originally defined ("Managing Update Conflicts in Bayou, a Weakly Connected Replicated Storage System", SOSP 1995). Terry et al.'s own paper is cited bibliographically, not quoted: `cs.utexas.edu`, `cs.cornell.edu`, and `cs.umd.edu` all serve it behind a broken TLS chain in this sandbox (domain-wide, confirmed 2026-10-30), and Jepsen's definition is already an approved source type restating the same guarantee precisely.

## Monotonic Reads (Jepsen)

URL: https://jepsen.io/consistency/models/monotonic-reads
Version: retrieved 2026-10-30

> Monotonic reads ensures that if a process performs read r1, then r2, then r2 cannot observe a state prior to the writes which were reflected in r1; intuitively, reads cannot go backwards.

> Monotonic reads does not apply to operations performed by different processes, only reads by the same process.

Also restates one of Terry et al.'s four session guarantees, for the same sourcing reason as above.

## 26.2. Log-Shipping Standby Servers (PostgreSQL documentation)

URL: https://www.postgresql.org/docs/current/warm-standby.html
Version: PostgreSQL 18 documentation, retrieved 2026-10-30

> The primary and standby server work together to provide this capability, though the servers are only loosely coupled. The primary server operates in continuous archiving mode, while each standby server operates in continuous recovery mode, reading the WAL files from the primary.

> Recovery performance is sufficiently good that the standby will typically be only moments away from full availability once it has been activated. As a result, this is called a warm standby configuration which offers high availability.

> A server enters standby mode if a standby.signal file exists in the data directory when the server is started.

> On a hot standby, the status of the WAL receiver process can be retrieved via the pg_stat_wal_receiver view. A large difference between pg_last_wal_replay_lsn and the view's flushed_lsn indicates that WAL is being received faster than it can be replayed.

## 27.2.4. pg_stat_replication (PostgreSQL documentation)

URL: https://www.postgresql.org/docs/current/monitoring-stats.html
Version: PostgreSQL 18 documentation, retrieved 2026-10-30

> The pg_stat_replication view will contain one row per WAL sender process, showing statistics about replication to that sender's connected standby server.

> The lag times reported in the pg_stat_replication view are measurements of the time taken for recent WAL to be written, flushed and replayed and for the sender to know about it.

> The reported lag times are not predictions of how long it will take for the standby to catch up with the sending server assuming the current rate of replay.

Internal cross-reference: `de.physical-vs-logical-replication` (this chapter, §5.2) — physical WAL streaming mechanics this topic assumes. Multi-node leader-kill failover timing (a real second host this sandbox lacks) is named and sourced only, per the chapter's own honest-gap pattern — not built or quoted here.
