Last verified: 24 October 2026. One real measured experiment run in this sandbox (`examples.py`,
against this sandbox's own Postgres cluster): 200 real commits run under `synchronous_commit = off`
and `synchronous_commit = on`, the identical acknowledgement-wait mechanism the documentation
describes for synchronous replication, measured locally — stable across 5 repeated runs.

- PostgreSQL documentation, "26.2.8. Synchronous Replication" / "26.3. Failover": [postgresql.org](https://www.postgresql.org/docs/current/warm-standby.html#SYNCHRONOUS-REPLICATION). Synchronous replication's own acknowledgement and wait mechanics, and failover basics.
- MariaDB documentation, "Semisynchronous Replication": [mariadb.com](https://mariadb.com/kb/en/semisynchronous-replication/). The semi-synchronous middle ground and its own timeout fallback to asynchronous — substituted for MySQL's own documentation, which this project's own fetch pipeline could not retrieve (see `FACT-CHECK.md`).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=synchronous-asynchronous-semi-synchronous:%20).
