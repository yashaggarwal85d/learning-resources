Last verified against these sources: 24 October 2026. Real measurements run in this sandbox
(`examples.py`, against this sandbox's own PostgreSQL cluster, via the `pageinspect` extension):
both heap tuples present on a real page after one `UPDATE`, with the old tuple's own `t_xmax`
equal to the new tuple's own `t_xmin`; real page-count growth for a table and its index under
repeated, non-HOT updates; a `REPEATABLE READ` transaction's own reads staying unchanged through
a concurrent commit. InnoDB's and Oracle's own undo-log mechanics, and Oracle's own
"snapshot too old" failure, are disclosed, sourced-only claims, since neither engine can be run
or reproduced against this sandbox.

- PostgreSQL docs, "13.1. Introduction" (Concurrency Control): [postgresql.org](https://www.postgresql.org/docs/current/mvcc-intro.html). The MVCC model and its own stated guarantee.
- PostgreSQL docs, "66.6. Database Page Layout": [postgresql.org](https://www.postgresql.org/docs/current/storage-page-layout.html). `t_xmin`, `t_xmax`, `t_ctid` in the engine's own words.
- PostgreSQL docs, "9.27. System Information Functions and Operators": [postgresql.org](https://www.postgresql.org/docs/current/functions-info.html). `pg_current_snapshot()` and `pg_xact_status()`.
- MariaDB Documentation, "InnoDB Undo Log": [mariadb.com](https://mariadb.com/docs/server/server-usage/storage-engines/innodb/innodb-undo-log). No private copies; the undo log holds old versions.
- MariaDB Documentation, "START TRANSACTION ... WITH CONSISTENT SNAPSHOT": [mariadb.com](https://mariadb.com/docs/server/ha-and-performance/standard-replication/enhancements-for-start-transaction-with-consistent-snapshot). The InnoDB read view.
- MariaDB Documentation, "PRIMARY KEY Constraints": [mariadb.com](https://mariadb.com/docs/server/architecture/server-constraints/primary-key-constraints). InnoDB's own clustered-index design.
- Oracle Database 23ai Concepts, "Data Concurrency and Consistency": [docs.oracle.com](https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/data-concurrency-and-consistency.html). Undo data, CR clones, and the documented cause of "snapshot too old."
- Oracle Database Error Messages, "ORA-01555": [docs.oracle.com](https://docs.oracle.com/error-help/db/ora-01555/). The current, official cause and action.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=mvcc-append-versions-vs:%20).
