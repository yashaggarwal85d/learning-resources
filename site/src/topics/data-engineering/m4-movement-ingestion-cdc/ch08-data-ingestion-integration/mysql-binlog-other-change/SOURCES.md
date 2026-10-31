# Sources — de.mysql-binlog-other-change

`CHAPTER.md` names: Debezium's MySQL, Oracle and SQL Server connector pages, Microsoft's SQL
Server CDC documentation, Oracle's LogMiner utility documentation, the MariaDB GTID page, and
the MySQL 8.4 manual's binary-log and GTID pages (disclosed as unfetchable at plan time). This
sandbox has no MySQL, Oracle or SQL Server server to measure directly against — `CHAPTER.md`
itself anticipates this ("the sandbox may not have a second MySQL"; "Lab: none of its own") — so
every claim here is sourced from documentation, and `examples.py` models the documented
mechanics in plain Python rather than claiming a live engine.

## Debezium docs: MySQL connector

URL: https://debezium.io/documentation/reference/stable/connectors/mysql.html
Fetched: 2026-10-31.

Quotes:
> The binlog-format must be set to ROW or row.

> The binlog_row_image must be set to FULL or full.

> binlog_format = ROW binlog_row_image = FULL binlog_expire_logs_seconds = 864000

> After the connector restarts, if the logs have been pruned, the connector's position in the
> logs might no longer available. The connector then fails, and returns an error that indicates
> that a new snapshot is required.

> The connector records its position in the server's binlog, which is different on each server
> in the cluster.

> Because most HA MySQL clusters use GTIDs, replicas are able to track all of the changes that
> occur on any primary server.

> This database schema history topic is for internal connector use only.

Items: the three required settings, the retention-expiry failure mode, the position-naming
collision across servers that GTIDs solve, and why DDL needs a schema-history topic — all
quoted directly rather than measured against a running MySQL.

## Debezium docs: Oracle connector

URL: https://debezium.io/documentation/reference/stable/connectors/oracle.html
Fetched: 2026-10-31.

Quotes:
> Oracle LogMiner is responsible only for reading redo and archive logs from disk and streaming
> the raw changes.

> To use the XStream API, you must have a license for the GoldenGate product.

Items: the two Oracle capture mechanisms CHAPTER.md names, both quoted directly.

## Oracle docs: LogMiner utility

URL: https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-logminer-utility.html
Fetched: 2026-10-31.

Quotes:
> Oracle LogMiner, which is part of Oracle Database, enables you to query online and archived
> redo log files through a SQL interface.

Items: LogMiner's own description of itself, independent of Debezium's framing of it.

## Microsoft docs: Change data capture (SQL Server)

URL: https://learn.microsoft.com/en-us/sql/relational-databases/track-changes/about-change-data-capture-sql-server
Fetched: 2026-10-31.

Quotes:
> Change data capture utilizes the SQL Server Agent to log insertions, updates, and deletions
> occurring in a table.

> When a table is enabled for change data capture, an associated capture instance is created to
> support the dissemination of the change data in the source table.

> Its associated change table is named by appending _CT to the capture instance name.

Items: the SQL Server Agent log-reader job, the capture instance, and the `_CT` table name,
confirming CHAPTER.md's own framing of SQL Server CDC as a table you query rather than a stream
you read.

Not independently fetched: the MariaDB GTID page (`https://mariadb.com/kb/en/gtid/`) renders as
a JavaScript single-page app in this sandbox's fetch, returning no readable article text, so its
content is not quoted here. GTID position-independence is instead sourced entirely from
Debezium's own MySQL page (above), which is sufficient for this topic's claim. The MySQL 8.4
manual's binary-log and GTID pages are named by `CHAPTER.md` as unfetchable at plan time and
remain so; any MySQL-manual-only fact is disclosed as sourced-only in `FACT-CHECK.md`, not
quoted.
