<section data-section="outcomes">

## Outcomes

Read a real `metadata.json`, manifest list, and manifest from a table built in this sandbox and
trace the full tree by hand: `metadata.json` → manifest list → manifests → data files. Explain
sequence numbers and how scan planning prunes manifests first, by partition summary, then files,
by column metrics — measured directly on a real partitioned table. Reproduce manifest bloat from
many small commits and run a real `rewrite_manifests` to fix it.

</section>

<section data-section="one-rule-two-formats">

## A tree, pruned level by level

A snapshot's manifest list and its manifests exist for exactly one reason the spec states
directly: to let planning "avoid reading manifests that are not required for an operation." The
manifest list prunes whole manifests using coarse, per-manifest partition stats; the surviving
manifests then prune individual files using per-file partition tuples and column metrics. Both
cuts happen before a single data file is opened — the tree is an index over the table's own data,
read the same way any index gets consulted before the rows it points to.

</section>

<section data-section="production">

## Production

**Manifest bloat is a write-pattern problem, not a bug.** The maintenance docs are explicit:
manifests "are automatically compacted in the order they are added," which works well when writes
align with read filters — hourly-partitioned writes read by time range — and badly otherwise. A
streaming source committing one small batch at a time leaves one manifest per commit, by design,
until something rewrites them.

**`rewrite_manifests` is the fix, one level above file compaction.** It re-groups the same files
into fewer, larger manifests without touching the data files themselves — the direct analogue,
one level up the tree, of the small-file compaction topic 18 covered for data.

</section>

<section data-section="frontier">

## Frontier

The table in `examples.py` is real — a real `pyiceberg` `SqlCatalog`, real Avro manifest and
manifest-list files, a real `metadata.json` — not a simulation. `pyiceberg` 0.12.0 has no public
`rewrite_manifests` action, unlike Spark's; the rewrite demo instead reproduces the mechanism from
pyiceberg's own real manifest-writing (`write_manifest`, `write_manifest_list`) and snapshot-commit
primitives, verified end to end by reloading the table fresh afterward and confirming every
original row is still readable. This is functionally equivalent to a canned `rewriteManifests`
call but built from lower-level primitives, disclosed in the script's own docstring and in
FACT-CHECK.md's red-team section. Column-level pruning within a single partition, equality and
position deletes, and deletion vectors are introduced by name from the spec but not exercised
here, since this table has no deletes — out of scope for this topic's executed demonstration.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

This metadata tree already lets a query prune by partition tuple without touching data — but
only if the table doesn't make the query name the partition column itself. That's hidden
partitioning.

</section>
