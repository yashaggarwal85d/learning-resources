Last verified: 24 October 2026. One real measured experiment run in this sandbox (`examples.py`,
against this sandbox's own Postgres cluster): a real physical replication slot, three thousand real
writes with nothing consuming it, WAL retained measured directly, then dropped to zero once a real
consumer caught up — stable across 3 repeated runs.

- PostgreSQL documentation, "Chapter 29. Logical Replication": [postgresql.org](https://www.postgresql.org/docs/current/logical-replication.html). Logical vs. physical replication, named directly.
- PostgreSQL documentation, "26.2.6. Replication Slots": [postgresql.org](https://www.postgresql.org/docs/current/warm-standby.html#STREAMING-REPLICATION-SLOTS). The real retention mechanism and its own WAL-fill warning, measured directly here.
- PostgreSQL 17.0 Release Notes: [postgresql.org](https://www.postgresql.org/docs/release/17.0/). Failover-safe logical slots, sourced only — this sandbox's own cluster runs PostgreSQL 16.
- MariaDB documentation, "Binary Log Formats": [mariadb.com](https://mariadb.com/kb/en/binary-log-formats/). Row-based binary logging, the same idea named elsewhere — substituted for MySQL's own documentation, which this project's own fetch pipeline could not retrieve (see `FACT-CHECK.md`).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=physical-vs-logical-replication:%20).
