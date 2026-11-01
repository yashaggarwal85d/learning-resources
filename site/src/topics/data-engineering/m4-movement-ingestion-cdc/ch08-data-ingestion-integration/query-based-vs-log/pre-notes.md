- **CDC**: change data capture, reading what changed in a source instead of its full current
  state.
- **Polling**: running a query on a schedule to check for changes, the continuous form of a
  cursor.
- **Trigger**: a database procedure that fires on every insert, update or delete, used here to
  copy a change into a shadow table the instant it happens.
- **Write amplification**: a single logical write producing more than one physical write.
  *Where you meet it:* a trigger's own shadow-table copy, measured directly.
- **Intermediate state**: a value a row held briefly between two writes, invisible to anything
  that only checks the row's current value.
- **Replication log**: the database's own ordered record of every committed change, read here
  through PostgreSQL's logical decoding.
- **Before-image**: a row's value immediately before a change, available from the log when a
  table is configured to keep it.
