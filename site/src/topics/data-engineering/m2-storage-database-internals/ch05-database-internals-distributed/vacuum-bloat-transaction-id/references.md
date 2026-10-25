Last verified against these sources: 24 October 2026. Real measurements run in this sandbox
(`examples.py`, against this sandbox's own PostgreSQL 16 cluster): deleting half of 300 rows and
reclaiming the dead tuples with `VACUUM`; 300 updates to an unindexed column leaving a table's
own index size unchanged against 300 updates to the indexed column doubling it; a fresh table's
own `age(relfrozenxid)` reset by `VACUUM FREEZE`; one `REPEATABLE READ` transaction held open
through 600 concurrent updates leaving a `VACUUM` run during that window unable to reclaim
anything, and able to reclaim everything once it is released. Sentry's own 2015 production
outage is a real, dated postmortem, not reproduced here (reaching real XID wraparound needs
billions of transactions).

- PostgreSQL docs, "24.1. Routine Vacuuming": [postgresql.org](https://www.postgresql.org/docs/current/routine-vacuuming.html). Dead tuples, the visibility map, autovacuum's own threshold formula, XID freezing, the warning/error thresholds, the documented recovery order.
- PostgreSQL docs, "66.7. Heap-Only Tuples (HOT)": [postgresql.org](https://www.postgresql.org/docs/current/storage-hot.html). HOT's two preconditions and its two optimizations, in the engine's own words.
- PostgreSQL docs, "26.2. Log-Shipping Standby Servers" (Replication Slots): [postgresql.org](https://www.postgresql.org/docs/current/warm-standby.html#STREAMING-REPLICATION-SLOTS). Why an abandoned slot pins vacuum, not just WAL retention.
- Sentry Blog, "Transaction ID Wraparound in Postgres" (David Cramer, 23 July 2015): [blog.sentry.io](https://blog.sentry.io/transaction-id-wraparound-in-postgres). A real production outage, its improvised recovery, and the post-incident configuration fix.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=vacuum-bloat-transaction-id:%20).
