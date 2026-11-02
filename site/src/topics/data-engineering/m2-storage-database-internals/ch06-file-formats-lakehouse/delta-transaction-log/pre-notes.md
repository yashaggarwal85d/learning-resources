# Before this topic

- **Snapshot-based table metadata** — the shared idea this topic now shows a second time: an
  immutable, versioned table state, committed atomically. §6.3's shared foundations (topics
  10-20) teach this once, in the abstract, across whichever format made each point clearest.
- **Incremental reads and change feeds** — the closing topic of §6.3's shared foundations,
  whose own handoff opens the "second mechanism" arc this topic continues: the same
  shared-foundations ideas, now shown through two real, concretely different systems.
- **Iceberg metadata tree and scan planning** — the first of those two systems, already covered:
  a snapshot's state as a real, readable tree of files (`metadata.json`, a manifest list,
  manifests). This topic is the contrasting shape: not a tree, but a flat, ordered log.
- **Branches, tags and write-audit-publish** — the topic immediately before this one, closing the
  Iceberg arc. Its own handoff is this topic's bridge: the same commit-and-history idea, now
  built from a visibly different mechanism.
- **Optimistic commits and conflict resolution** — the atomic-pointer-move primitive that both
  Iceberg's snapshot pointer and Delta's next-version-number commit ultimately rest on.
- A Delta table's `_delta_log` directory, and the vocabulary this topic actually teaches —
  commits, checkpoints, `_last_checkpoint`, log compaction, version checksums, and table
  features — are new; nothing about partitioning, column statistics, or file layout changes.
