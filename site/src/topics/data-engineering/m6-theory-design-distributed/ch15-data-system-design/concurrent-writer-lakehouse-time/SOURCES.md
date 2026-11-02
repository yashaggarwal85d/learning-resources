# Sources — de.concurrent-writer-lakehouse-time

`CHAPTER.md` names the Apache Iceberg specification, Iceberg's configuration,
branching-and-tagging, maintenance and schema-evolution documentation, and Delta Lake's
concurrency-control documentation as candidates, and leaves the builder to select and verify at
research time. This topic quotes the Iceberg specification itself (the atomic-swap commit
protocol this topic's whole design rests on) and Iceberg's own branching-and-tagging
documentation (the legal-hold tag mechanism), plus Delta Lake's concurrency-control
documentation (the conflict exceptions and the disjoint-partitioning advice) — three sources,
satisfying the ≥2-source rule. Chapter 14's `table-commit-as-cas` (a declared placeholder, that
chapter being unplanned), Chapter 5's concurrency-theory topics, and Chapter 13's erasure topic
are prior topics on this same site, referenced via `uses`/`declared`, not external sources.

## Apache Iceberg Specification

URL: https://iceberg.apache.org/spec/
Fetched: 2026-10-30.

Quotes:
> An atomic swap of one table metadata file for another provides the basis for serializable isolation. Readers use the snapshot that was current when they load the table metadata and are not affected by changes until they refresh and pick up a new metadata location.

Items: the exact mechanism every concurrent-writer design in this topic takes as given — a
commit is a single atomic swap of the metadata pointer, and that swap alone is what makes
concurrent writers either succeed, retry, or fail, rather than silently corrupt each other's
work.

## Apache Iceberg Documentation, "Branching and Tagging"

URL: https://iceberg.apache.org/docs/latest/branching/
Fetched: 2026-10-30.

Quotes:
> Tags can be used for retaining important historical snapshots for auditing purposes.

Items: the named mechanism for the design's own collision between time-travel/audit retention
and erasure-driven expiry — a tag keeps one specific snapshot past the table's general expiry
policy, without changing that policy for every other snapshot.

## Delta Lake Documentation, "Concurrency control"

URL: https://docs.delta.io/latest/concurrency-control.html
Fetched: 2026-10-30.

Quotes:
> This exception occurs when a concurrent operation adds files in the same partition (or anywhere in an unpartitioned table) that your operation reads. The file additions can be caused by INSERT, DELETE, UPDATE, or MERGE operations.

> In all cases marked "can conflict", whether the two operations will conflict depends on whether they operate on the same set of files. You can make the two sets of files disjoint by partitioning the table by the same columns as those used in the conditions of the operations.

Items: (1) `ConcurrentAppendException`, named exactly, as Delta's own typed signal that two
writers touched overlapping files — the mechanism the hook's compaction-versus-merge conflict
actually hits; (2) the disjoint-partitioning advice that is this topic's own "how to partition
writers so conflicts are rare" design decision, stated by the table-format documentation itself
rather than invented.
