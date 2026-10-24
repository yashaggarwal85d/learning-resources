Last verified against these sources: 24 October 2026. Real measurements run in this sandbox
(`examples.py`, against this sandbox's own PostgreSQL 16 cluster): a real LSN read before and
after a write, subtracted directly for an exact byte count; `pg_stat_wal`'s own `wal_fpi`
counter checked before and after a real checkpoint plus two real page changes; eight concurrent
threads' own commits measured under two different `commit_delay` settings; `wal_sync_method`
read directly. InnoDB's own doublewrite buffer and the 2018 fsyncgate lesson are disclosed,
sourced-only claims, since neither can be run or reproduced against this sandbox.

- PostgreSQL docs, "WAL Internals": [postgresql.org](https://www.postgresql.org/docs/16/wal-internals.html). The LSN itself, in the engine's own words.
- PostgreSQL docs, "Write Ahead Log": [postgresql.org](https://www.postgresql.org/docs/16/runtime-config-wal.html). `wal_sync_method`'s own options, `commit_delay`'s group-commit effect, and `full_page_writes`'s own trigger condition.
- PostgreSQL docs, "Reliability": [postgresql.org](https://www.postgresql.org/docs/16/wal-reliability.html). A torn page described directly, and PostgreSQL's own defense against it.
- PostgreSQL wiki, "Fsync Errors": [wiki.postgresql.org](https://wiki.postgresql.org/wiki/Fsync_Errors). The 2018 fsyncgate retrospective and PostgreSQL's own fix.
- MariaDB Knowledge Base (mirrored), "InnoDB Doublewrite Buffer": [docs.w3cub.com](https://docs.w3cub.com/mariadb/innodb-doublewrite-buffer/). InnoDB's own defense against the identical torn-page problem.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=write-ahead-logging-fsync:%20).
