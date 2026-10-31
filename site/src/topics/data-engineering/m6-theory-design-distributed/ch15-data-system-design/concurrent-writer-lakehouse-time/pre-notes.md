- **Snapshot**: the state of a table at some past point, kept so it can still be read later.
  *Where you meet it:* the retention-and-audit reveal.
- **Commit**: the single atomic swap of a table's metadata pointer from one state to the next.
  *Where you meet it:* the atomic-swap reveal.
- **Optimistic concurrency**: letting writers proceed without locking, then detecting a
  conflict only at commit time. *Where you meet it:* the atomic-swap and partition-writers
  reveals.
- **Conflict**: two writers whose commits touched the same underlying files. *Where you meet
  it:* the partition-writers reveal.
- **Retry**: re-attempting a commit that lost a conflict, against the table's new state. *Where
  you meet it:* the predict step and the partition-writers reveal.
- **Time travel**: reading a table as it stood at a past snapshot, not just its current state.
  *Where you meet it:* the retention-and-audit reveal.
- **Audit**: a requirement to produce a table's exact past state on demand. *Where you meet it:*
  the hook and the retention-and-audit reveal.
- **Compaction**: rewriting a table's small files into fewer, larger ones. *Where you meet it:*
  the maintenance-is-a-writer reveal.
- **Orphan file**: a data file no snapshot references anymore, safe to remove. *Where you meet
  it:* the maintenance-is-a-writer reveal.
