- **Replication slot**: a named, crash-safe stream of changes for one database, which never
  forgets a position its own consumer hasn't confirmed.
- **`restart_lsn`**: the oldest point in the log a slot still might need; what the server cannot
  remove on the slot's behalf.
- **Retained WAL**: the write-ahead log the server is holding specifically because a slot might
  still need it, measured as the gap between the current position and `restart_lsn`.
- **Heartbeat**: a periodic, otherwise-meaningless event a consumer can confirm, used to move a
  slot's position forward even when nothing it actually cares about has changed.
- **`max_slot_wal_keep_size`**: a configured limit on how much WAL a slot may force the server to
  retain, past which the server may remove WAL the slot needed.
- **Invalidated slot**: a slot the server has declared unusable, whose consumer must start over
  from a fresh snapshot.
- **Disk-full**: the production incident this topic exists to let someone see coming, instead
  of discovering it from an alert that fires too late.
