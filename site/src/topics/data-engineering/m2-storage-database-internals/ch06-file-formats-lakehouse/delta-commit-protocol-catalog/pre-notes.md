# Before this topic

- **Object storage as a database substrate** — the exact conditional-write primitive this topic
  reuses directly: `If-None-Match`/`If-Match` as real put-if-absent and compare-and-swap, a real
  412 for the loser. This topic names that primitive as Delta's own commit mechanism.
- **Optimistic commits and conflict resolution** — the two-writer race shape this topic redraws
  for Delta specifically: a loser that revalidates and either retries (an append) or fails
  permanently (a conflicting delete), the identical shape now shown as Delta's own concrete
  mechanism.
- **The Delta transaction log** — the topic immediately before this one: a real `_delta_log` of
  JSON commits, checkpoints, and table features. This topic is what makes writing one of those
  commits atomic in the first place.
- **Snapshot-based table metadata** — the shared idea both Iceberg's compare-and-swap and Delta's
  next-version-number commit ultimately rest on: an immutable, versioned table state, committed
  atomically. This topic names Delta's own specific atomic-write mechanism.

A commit's atomicity, an isolation level's effect on which concurrent operations may commit, and
the catalog-managed-tables timeline are new; nothing about checkpoints, log compaction, or table
features changes from the previous topic.
