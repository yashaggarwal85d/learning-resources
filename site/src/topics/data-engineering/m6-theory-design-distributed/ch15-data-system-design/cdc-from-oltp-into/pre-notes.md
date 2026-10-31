- **CDC**: capturing every row-level change at a source so a downstream system can replay them.
  *Where you meet it:* the hook and the pipeline-strip reveal.
- **Write-ahead log**: the source database's own ordered record of every change, written before
  it's applied. *Where you meet it:* the pipeline-strip reveal.
- **Replication slot**: a source-side marker that tracks how far a consumer has read the
  write-ahead log, and retains what it hasn't confirmed. *Where you meet it:* the
  guarantee-is-hazard reveal and the cap reveal.
- **Snapshot**: a consistent read of a table's full current state, taken once. *Where you meet
  it:* the snapshot-handover reveal.
- **Kafka topic**: an ordered, durable log that carries change events from the connector toward
  the merge. *Where you meet it:* the pipeline-strip reveal.
- **Merge**: a single statement that inserts, updates, or deletes rows by matching a source
  against a target. *Where you meet it:* the pipeline-strip reveal and the compaction reveal.
- **Merge-on-read**: a table layout that records changes as separate delete and data files,
  resolving them at read time until compaction rewrites them. *Where you meet it:* the
  compaction reveal.
- **Compaction**: rewriting a merge-on-read table's small files into fewer, larger ones. *Where
  you meet it:* the compaction reveal.
- **Schema evolution**: a table format's rules for adding, renaming, or dropping a column
  without breaking readers on the old shape. *Where you meet it:* the delete-and-schema reveal.
