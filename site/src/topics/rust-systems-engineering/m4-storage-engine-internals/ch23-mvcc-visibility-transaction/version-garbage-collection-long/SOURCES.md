# Sources — Version garbage collection and long snapshots

## PostgreSQL Docs: 27.2.3. pg_stat_activity
URL: https://www.postgresql.org/docs/current/monitoring-stats.html
Fetched: 2026-10-24, cached at `sources/monitoring-stats.txt`.
> The current backend's xmin horizon.

## PostgreSQL Docs: 24.1. Routine Vacuuming
URL: https://www.postgresql.org/docs/current/routine-vacuuming.html
Fetched: 2026-10-24, cached at `sources/routine-vacuuming.txt`.
> the row version must not be deleted while it is still potentially visible to other transactions

> an outdated or deleted row version is no longer of interest to any transaction. The space it occupies must then be reclaimed for reuse by new rows, to avoid unbounded growth of disk space requirements

> The standard form of VACUUM removes dead row versions in tables and indexes and marks the space available for future reuse.

> End long-running open transactions. You can find these by checking pg_stat_activity for rows where age(backend_xid) or age(backend_xmin) is large.
