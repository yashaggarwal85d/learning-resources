# Before this topic

- **Snapshot-based table metadata** — a snapshot is an immutable list of files plus schema,
  committed by one atomic pointer move. This topic's tag and branch are both just names for
  that same pointer, pointing at different snapshots (or the same one, at first).
- **Iceberg metadata tree and scan planning** — the real `metadata.json` / manifest-list /
  manifest tree that any ref (`main`, a tag, a branch) ultimately resolves to. Creating a branch
  doesn't create a new tree; it creates a new name for an existing point in the same tree.
- **Iceberg statistics and Puffin files** — the immediately preceding topic, whose handoff line
  is this topic's own bridge: snapshots are already addressable by id, and this topic gives some
  of them stable, human-meaningful names instead.
- **Optimistic commits and conflict resolution** — the same single-atomic-pointer-move mechanism
  that makes a normal commit safe is what makes fast-forwarding `main` to a validated branch safe:
  it's one more pointer move, not a special case.
- A **snapshot reference** (the vocabulary this topic actually teaches) is Iceberg's name for any
  named pointer at a snapshot — `main` itself is one, and so is every tag and branch.
- Nothing about partitioning, column statistics, or file layout changes here; a tag or branch
  points at the same kind of snapshot already covered, just under a different, human name.
