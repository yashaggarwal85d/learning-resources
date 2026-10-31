# Sources — de.resumable-multi-tb-historical

`CHAPTER.md` names Chapter 11 §11.1 and §11.4's own backfill, write-audit-publish and data-diff
material (in-course anchors), Iceberg's branching documentation, Airflow's and Dagster's
backfill documentation, Chapter 14 topic 13's idempotence, and a public engineering write-up of
a large historical reprocessing as candidates, and leaves the builder to select and verify at
research time. This topic quotes Dagster's own backfill documentation (the chunked,
per-partition backfill mechanism this topic's chunking decision is built on) and Iceberg's own
branching documentation (the audit-branch-then-fast-forward mechanism this topic's shadow-and-
swap plan is built on) — two sources, satisfying the ≥2-source rule. Chapter 11's backfill,
concurrency, and write-audit-publish topics, Chapter 4's resilient-clients topic, and topics 6,
14 and 15 are prior topics on this same site, referenced via `uses`, not external sources.

## Dagster Documentation, "Backfilling data"

URL: https://docs.dagster.io/concepts/partitions-schedules-sensors/backfills
Fetched: 2026-10-30.

Quotes:
> Backfilling is the process of running partitions for assets that either don't exist or updating existing records. Dagster supports backfills for each partition or a subset of partitions.

> By default, if you launch a backfill that covers N partitions, Dagster will launch N separate runs, one for each partition.

Items: (1) the exact framing this topic's "independent chunks" decision rests on — a backfill
is naturally structured as per-partition work, not one undifferentiated job; (2) the named
default (one run per partition) that is this topic's own chunk-size design decision made
concrete, rather than invented.

## Apache Iceberg Documentation, "Branching and Tagging"

URL: https://iceberg.apache.org/docs/latest/branching/
Fetched: 2026-10-30.

Quotes:
> Writes are performed on a separate audit-branch independent from the main table history.

> After validation, the main branch can be fastForward to the head of audit-branch to update the main table state.

Items: the exact write-to-shadow-then-atomic-swap mechanism this topic's own validation plan is
built on — a backfill's output lands on a branch nobody reads as live, and promotion is one
atomic fast-forward, not a repair of the live table after the fact.
