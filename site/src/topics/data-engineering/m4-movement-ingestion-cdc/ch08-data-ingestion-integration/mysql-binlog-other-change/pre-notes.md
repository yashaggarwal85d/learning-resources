- **Binlog**: MySQL's own record of every change, read by a CDC connector the way WAL is read on
  PostgreSQL.
- **Row-based logging**: logging a statement's actual column values instead of the SQL text that
  produced them, required to decode a change without re-running the statement.
- **GTID**: global transaction identifier, a name for a transaction that is the same on every
  server it reaches, independent of any one server's own file-and-offset numbering.
- **Binlog retention**: how long MySQL keeps old binlog segments before removing them on a fixed
  schedule, regardless of whether a consumer has read them yet.
- **DDL**: a statement that changes a table's own structure, such as adding a column.
- **Redo log**: Oracle's own durable record of every change, read by LogMiner or XStream the way
  WAL is read on PostgreSQL.
- **Change table**: a table SQL Server's own capture process writes into, queried by a consumer
  instead of streamed to one.
