# Sources — de.database-extraction-without-hurting

`CHAPTER.md` names Spark's own "JDBC to other databases" page (partitioning options, `fetchsize`)
and PostgreSQL's own docs for `COPY`, `pg_export_snapshot`, `SET TRANSACTION SNAPSHOT`, hot-standby
conflicts and `hot_standby_feedback` as the primary sources, all read during planning. This topic
quotes Apache Spark's current JDBC data-source page and PostgreSQL's current documentation — two
sources, satisfying the ≥2-source rule. Chapter 5's vacuum/xmin-horizon mechanism, Chapter 5's
snapshot-isolation topic, and Chapter 4's connection-pooling topic are prior topics on this same
site and this chapter's own running example, used and not re-taught, not external sources.

## Apache Spark, "JDBC To Other Databases" (SQL Data Sources guide, current docs)

URL: https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html
Fetched: 2026-10-31.

Quotes:
> Notice that lowerBound and upperBound are just used to decide the partition stride, not for filtering the rows in table.

> The JDBC fetch size, which determines how many rows to fetch per round trip.

Items: (1) the exact claim this topic's partition-skew demonstration is built on — the bounds set
the stride only, so every row is partitioned and returned, which is why a clustered key sends
nearly all of them into one partition; (2) the `fetchsize` option's own description, named on
screen as the setting that helps a driver whose own default round-trip size is small.

## PostgreSQL (current documentation): `COPY`, `pg_export_snapshot`, hot-standby conflicts

URL: https://www.postgresql.org/docs/current/sql-copy.html
Fetched: 2026-10-31.

Quotes:
> COPY moves data between PostgreSQL tables and standard file-system files.

Items: the plain statement of what `COPY` is, behind this topic's measured `COPY TO` throughput
against row-by-row `SELECT`.

## PostgreSQL (current documentation): snapshot-export and hot-standby-feedback

URL: https://www.postgresql.org/docs/current/functions-admin.html
Fetched: 2026-10-31.

Quotes:
> Saves the transaction's current snapshot and returns a text string identifying the snapshot. This string must be passed (outside the database) to clients that want to import the snapshot.

Items: the mechanism this topic's consistent-multi-table-snapshot demonstration runs for real —
one transaction exports its snapshot, a second imports it and sees the same data despite a
concurrent commit in between.

## PostgreSQL (current documentation): hot standby query conflicts

URL: https://www.postgresql.org/docs/current/hot-standby.html
Fetched: 2026-10-31.

Quotes:
> The first option is to set the parameter hot_standby_feedback, which prevents VACUUM from removing recently-dead rows and so cleanup conflicts do not occur.

Items: the named trade-off this topic states for read-replica offloading — the same mechanism
that holds back cleanup for a replica's long query is the one this topic measures directly for a
long-running extract on the primary itself.
