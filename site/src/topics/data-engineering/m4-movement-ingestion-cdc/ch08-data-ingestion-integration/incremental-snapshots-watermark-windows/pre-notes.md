- **Primary key**: the column a chunk is ordered and split by, so each chunk is a contiguous
  range of keys rather than an arbitrary slice of rows.
- **Chunk**: one bounded range of a table's rows, read into memory between one pair of
  watermarks and processed as a single unit.
- **Watermark**: a marker written into the log at a specific moment, used to bracket a chunk's
  own read rather than to carry any data of its own.
- **Signal table**: a small table on the source database that a write to triggers an action,
  such as starting or stopping one table's own snapshot.
- **READ event**: the event a snapshot emits for one row, carrying that row's value as of the
  moment the chunk containing it was read.
- **Supersede**: when a change streamed from the log overrules a chunk's own buffered copy of
  the same row, because the change happened more recently than the chunk's read.
- **Buffer**: the in-memory holding area for a chunk's own rows between its two watermarks,
  where superseded rows are dropped before anything is emitted.
