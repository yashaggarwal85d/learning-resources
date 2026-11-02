Last verified: 31 October 2026. Every measurement (`examples.py`) is a direct run against this
sandbox's own PostgreSQL 16 cluster, database `learnshop`, table `orders` (fifty thousand rows,
skewed id distribution): a sixteen- and sixty-four-partition parallel range read, an exported and
imported snapshot checked against a real concurrent insert, a `COPY TO` against a row-by-row
`SELECT`, and `pg_stat_user_tables.n_dead_tup` counted around a real long-held transaction and
real `VACUUM` runs.

- Apache Spark docs, "JDBC To Other Databases": [spark.apache.org](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html). What the partition bounds and fetch size actually control.
- PostgreSQL docs, "COPY": [postgresql.org](https://www.postgresql.org/docs/current/sql-copy.html). The bulk path measured against row-by-row reads.
- PostgreSQL docs, "Snapshot Synchronization Functions": [postgresql.org](https://www.postgresql.org/docs/current/functions-admin.html). `pg_export_snapshot` and the consistent multi-table read.
- PostgreSQL docs, "Hot Standby": [postgresql.org](https://www.postgresql.org/docs/current/hot-standby.html). What `hot_standby_feedback` trades away on the primary.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=database-extraction-without-hurting:%20).
