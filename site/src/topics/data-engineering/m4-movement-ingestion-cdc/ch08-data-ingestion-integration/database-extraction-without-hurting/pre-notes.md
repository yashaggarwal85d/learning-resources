- **JDBC**: the driver protocol a tool like Spark uses to read a database over a network
  connection. *Where you meet it:* the parallel read this topic configures and measures.
- **Partition column, bounds, fetch size**: the settings that decide how a parallel read's work is
  split, and how many rows come back per round trip. *Where you meet it:* the exact settings this
  topic shows deciding a stride, not a filter.
- **`COPY`**: PostgreSQL's own bulk path for moving data between a table and a file or stream.
  *Where you meet it:* measured directly against a row-by-row read.
- **Read replica**: a standby copy of a database, kept current by replication, that queries can be
  sent to instead of the primary. *Where you meet it:* the offload this topic shows is real, with a
  real cost attached.
- **Repeatable-read snapshot**: one transaction's fixed view of the database, unaffected by later
  commits, for as long as that transaction stays open. *Where you meet it:* exported and imported
  across two connections, and measured for its own side effect on cleanup.
- **Dead tuple**: an old row version MVCC leaves behind after an update or delete, waiting for
  vacuum to reclaim it. *Where you meet it:* counted directly, before, during and after a long
  extract.
