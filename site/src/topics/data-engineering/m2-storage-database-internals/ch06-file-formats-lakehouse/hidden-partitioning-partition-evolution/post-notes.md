<section data-section="outcomes">

## Outcomes

Build a real Iceberg table with an `identity`/`bucket[N]`/`truncate[W]`/`day(ts)` partition spec
in this sandbox and run a query that filters on the source column directly, never naming the
partition transform, and show it still prunes correctly. Evolve the partition spec (`day(ts)` to
`hour(ts)` plus `bucket(4, id)`) without rewriting old data, and show old and new data both
pruning correctly because each manifest is planned under the spec it was written with. Name v3's
multi-argument transforms as the current extension.

</section>

<section data-section="one-rule-two-formats">

## A query names a column; a table names its own rule

The Partitioning docs state the design goal directly: "Because Iceberg doesn't require
user-maintained partition columns, it can hide partitioning." This topic shows the mechanical
consequence of that goal holding even across a spec change — a manifest doesn't ask "what is the
table's partition scheme today?" It carries its own answer, set once, at write time, and planning
reads that answer back rather than assuming the current default applies retroactively.

</section>

<section data-section="production">

## Production

**A spec evolution is forward-only.** The spec is explicit: changing a partition spec "produces
a new spec identified by a unique spec ID that is added to the table's list of partition specs."
Nothing about an old spec is deleted or rewritten — the table simply accumulates specs over its
life, the same way it accumulates snapshots.

**Reads never consult a table-wide "current" partitioning.** The table's `partition-spec` field
is explicitly marked deprecated for reading, in favor of `partition-specs` and `default-spec-id`:
"this is used by writers to partition data, but is not used when reading because reads use the
specs stored in manifest files."

</section>

<section data-section="frontier">

## Frontier

The table in `examples.py` is real — a real `pyiceberg` table whose spec is evolved with the
real `update_spec()` API, not a simulation. The table defaults to format version 2 in this
sandbox, so v3's multi-argument transforms are named from the spec's own writing rules, not
executed. `identity` and `truncate[W]` are named but not built; only `day`, `hour`, and
`bucket[N]` are exercised. File paths and UUIDs are real-system randomness, so the script
asserts counts and structure, verified byte-identical across 3 runs — disclosed in the script's
own docstring and FACT-CHECK.md's red-team section.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Hidden partitioning prunes whole files by partition tuple. The next topic is how a single file's
own rows get deleted without rewriting it: position and equality deletes.

</section>
