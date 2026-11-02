<section data-section="outcomes">

## Outcomes

Explain why a manifest's `lower_bound`/`upper_bound` for a string or binary column is never
exact, and show it truncated on a real long value. Build a real Puffin sidecar file in this
sandbox holding a table-level NDV sketch, and explain how a cost-based optimizer consumes
statistics like it. Name partition statistics files as the partition-level equivalent. State
concretely what missing or wrong statistics cost a query plan.

</section>

<section data-section="truncation-and-sketch">

## Two kinds of statistics, two different honesty levels

Per-file column metrics are opportunistic: cheap to read off a manifest, but string and binary
bounds are truncated, so they're a safe range for pruning files, never a literal minimum or
maximum. Table-level statistics take the opposite trade: a dedicated sidecar file, built once,
paid for in a small known estimation error instead of truncation.

</section>

<section data-section="production">

## Production

**A cost-based optimizer is only as good as its statistics.** Trino's own documentation is
direct about this: missing or uncomputable statistics force a fallback to a weaker join strategy,
and statistics that misestimate a join's size risk a genuinely bad plan, not just a suboptimal
one. Collecting statistics is itself a cost — Trino recommends it only for the columns a plan
actually needs: join keys, predicates, grouping keys.

</section>

<section data-section="frontier">

## Frontier

The Puffin file built in `examples.py` is byte-exact to the file format's Magic/Blob/Footer
structure, and is registered on the table through pyiceberg's real, public
`update_statistics()` API — the same call path a real statistics writer would use. Its sketch
payload, however, is this script's own from-scratch Theta/KMV implementation, not the real
Apache DataSketches library's wire bytes the spec names for this blob type — disclosed directly
in FACT-CHECK.md, since this repo's baseline environment doesn't depend on that library. No
partition statistics file is built; it's named from the spec's own text only.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Iceberg's own snapshot history is already addressable by id. The next topic is giving some of
those snapshots stable, human-meaningful names instead: branches and tags.

</section>
