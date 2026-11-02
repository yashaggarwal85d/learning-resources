# Before this topic

- **Copy-on-write vs merge-on-read** — the full-rewrite-vs-small-log tradeoff this topic shows
  MERGE itself choosing between, operation by operation rather than table-wide.
- **Deletion vectors across formats** — the exact array-container bitmap this topic reuses
  directly, now written by a MERGE instead of a DELETE.
- **Incremental reads and change feeds** — the outbound CDC stream this topic names as MERGE's own
  output, already built for real; this topic doesn't rebuild it.
- **Delta commit protocol and catalog-managed tables** — the topic immediately before this one:
  a real put-if-absent commit and conflict detection. This topic reuses the same commit log and
  shows a real conflict and retry specific to MERGE and a concurrent compaction.

A real MERGE's two rewrite strategies, a real MERGE-vs-compaction conflict and retry, and Row
Tracking's fresh-vs-stable Row ID split are new; nothing about the commit log's own mechanics
changes from the previous topic.
