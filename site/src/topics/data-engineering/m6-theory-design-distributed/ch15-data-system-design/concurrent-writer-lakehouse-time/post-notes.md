<section data-section="outcomes">

## Outcomes

Several writers now touch the same lakehouse table: the CDC merge, a backfill, a compaction
job, a schema migration. This topic designs for that: every commit is one atomic swap of a
single metadata pointer, so a writer succeeds, retries, or fails by whether it touched files
another writer also touched — not by luck. Laying writers out on disjoint partitions is the
decision that keeps conflicts rare, in place of a faster retry loop that only repeats the same
collision. A schema-evolution policy is a written decision — who may change the schema, how,
under which review — rather than a default every writer quietly assumes. A retention policy and
a legal-hold tag coexist without touching each other: the tag keeps one snapshot past general
expiry, satisfying an audit, while the policy still clears everything else on schedule. And
maintenance — compaction, snapshot expiry, orphan-file removal — is a writer too, scheduled
against the ingest it would otherwise starve, not left to run whenever it fires.

</section>

<section data-section="internals">

## Internals

None claimed independently here. The commit protocols, snapshot structures, catalog
implementations and maintenance procedures (Chapter 6 §6.3) are each named only as a choice
pointing to its home chapter — this topic doesn't re-derive their mechanics. Erasure itself
belongs to Chapter 13, the optimistic-versus-pessimistic concurrency theory to Chapter 5, and
the CDC merge itself to topic 14.

</section>

<section data-section="lab">

## Lab

None of its own as a separate syllabus lab leg. The writer-conflict simulation (conflict rate
for overlapping versus disjoint partition layouts, with a retry policy) and the retention-cost
estimate for a pinned history are this topic's executable evidence. `examples.py`'s own lab:
`writers_conflict()` and `conflict_rate()` compute the collision and its frequency;
`retry_outcome()` shows a retry resolving or exhausting against the same files;
`retention_cost()` prices a legal hold; `maintenance_overlaps_ingest()` checks a maintenance
window against the writers it would otherwise starve.

</section>

<section data-section="production">

## Production failures this topic warns about

**Writers sharing partitions by accident.** Two writers that happen to touch the same files
collide on every overlapping commit; the fix is laying them out on disjoint partitions before
they ship, not retrying harder after the fact.

**A retention policy with no exception path.** A single fixed expiry window clears an
audit-required snapshot along with everything else unless a legal-hold tag is applied to it
specifically, before the sweep reaches it.

</section>

<section data-section="frontier">

## Frontier

None claimed. Optimistic concurrency via an atomic metadata swap and tag-based retention are
established lakehouse practice — Iceberg and Delta both ship them — not an emerging technique.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

One of those writers is about to be the biggest the table has seen: a reprocessing of five
years of history. It must not break the production readers, starve the live ingest, or leave
the table half-rewritten if it dies. The next design is a resumable multi-terabyte historical
backfill.

</section>
