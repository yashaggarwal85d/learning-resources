- **MERGE**: a single statement that inserts, updates or deletes rows in a target table
  depending on whether each source row already has a match, run periodically against an
  append-only change log to materialize the current state.
- **Merge-on-read (MOR)**: a table where a change is written immediately as a small new file
  (plus, for an update or delete, a marker naming the row it replaces), with the current value
  assembled by merging those files together at read time.
- **Copy-on-write (COW)**: the opposite strategy — a change rewrites the entire file a row
  lives in — named here only to say a streaming upsert target is MOR, not COW.
- **Delete file**: the small file (or marker) a merge-on-read write produces, naming a row in an
  existing data file that a later read should skip.
- **Compaction**: physically rewriting data and delete files together so a read no longer has
  to merge them, at a cost that grows with how many delete files piled up.
- **Upsert**: an insert that becomes an update when a row with the same key already exists,
  exactly what both landing strategies this topic measures produce.
- **LSN**: the source database's own log sequence number, the position this topic's own MERGE
  compares to decide which of two changes to a key is actually the newer one.
- **Freshness**: how long after a change happens the landed table actually reflects it — the
  cost each landing strategy trades against.
