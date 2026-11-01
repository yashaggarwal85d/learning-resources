- **DDL**: a statement that changes a table's own shape (adding, dropping or retyping a column)
  rather than its data.
- **Schema version**: one specific shape of a table, numbered as it changes, that a change
  event's own data is interpreted against.
- **Schema registry**: a service that stores every schema version a topic has used and checks
  a new one against its own compatibility rule before anyone is handed an event built from it.
- **Nullable column**: a column a row doesn't have to provide a value for, which is why adding
  one is the easy, additive case.
- **Widening**: a retype that only enlarges what a column can hold, so a reader built for the
  old, narrower type can keep reading the new values without any loss.
- **Backward-compatible**: a schema change an old reader can still make sense of, without
  needing to change anything about how it reads.
- **Re-snapshot**: taking a fresh, incremental copy of a table because its own stream history
  can no longer be reinterpreted correctly under its new shape.
