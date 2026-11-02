- **WAL**: the write-ahead log, PostgreSQL's own durable, ordered record of every change, written
  before the change is applied to the table itself.
- **LSN**: log sequence number, the position of one byte in the WAL, used to name a point in the
  log precisely.
- **Logical decoding**: turning the WAL's storage-level records back into readable row changes,
  one committed transaction at a time, in commit order.
- **Replication slot**: a named, crash-safe stream of changes for one database, persisted
  independently of any one connection to it.
- **Output plugin**: the component that decides the format a slot's decoded changes come back
  in. *Where you meet it:* `test_decoding`, used directly in this topic's own measurements.
- **Publication**: a named group of tables whose changes a publication makes available to
  logical replication.
- **`REPLICA IDENTITY`**: the per-table setting that decides how much of a row's old value a
  decoded update carries, from nothing to every column.
- **Hot standby**: a replica that can serve reads while continuously applying a primary's own
  WAL.
- **Failover**: promoting a standby to primary when the original primary stops working.
