Last verified: 31 October 2026. This sandbox has no MySQL, Oracle or SQL Server server
(`CHAPTER.md` itself: "the sandbox may not have a second MySQL"; "Lab: none of its own"). Every
measurement (`examples.py`) models the documented mechanics in plain Python — row image, GTID
naming, retention expiry, DDL versus schema history — rather than running a live connector.

- Debezium docs, MySQL connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/mysql.html). The row image, GTID and retention facts this topic's own model is built from.
- Debezium docs, Oracle connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/oracle.html). LogMiner and XStream, named directly.
- Oracle docs, "Using LogMiner to Analyze Redo Log Files": [docs.oracle.com](https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-logminer-utility.html). LogMiner's own description of itself.
- Microsoft docs, "About change data capture (SQL Server)": [learn.microsoft.com](https://learn.microsoft.com/en-us/sql/relational-databases/track-changes/about-change-data-capture-sql-server). The capture instance and the `_CT` change table.

Not independently fetched: the MariaDB GTID page renders as a JavaScript app in this sandbox's
fetch; GTID position-independence is sourced entirely from Debezium's MySQL page instead. The
MySQL 8.4 manual's binary-log and GTID pages remain unfetchable, as `CHAPTER.md` itself
discloses.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=mysql-binlog-other-change:%20).
