<section data-section="outcomes">

## Outcomes

Compare the five named tools on what they own, how they price and how they handle drift.
Compute a MAR-priced bill for a given change pattern. Decide, with numbers, whether to build or
buy a connector for a given source.

</section>

<section data-section="internals">

## Internals: five tools, two measured directly

This topic measures Fivetran's own documented MAR rule and dlt's own documented schema-contract
modes directly, against synthetic data at the shop's own scale. Airbyte's credit-based pricing
and its sync-mode documentation, Meltano's Singer-based state model, and Kafka Connect's
`errors.tolerance` and dead-letter-queue configuration are named from their own documentation in
prose, not re-measured here, since none of them can run inside this topic's own `examples.py`
without a live managed service or broker. The twelve failure modes counted in step 8 are this
chapter's own, drawn directly from topics 2 through 7, not an external citation.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a backfill as free because the destination table didn't grow.** The hook's own
scenario — a tripled bill with a flat row count — is exactly what MAR-based pricing does to a
full reprocess of even a small table. A team that reasons about cost from table size alone,
rather than from how many rows a given run will touch, inherits this exact surprise on every
backfill, migration or full-refresh run.

**Reaching for the loosest schema-drift policy by default.** `evolve` accepts every change
silently, which keeps a pipeline running but can let a column no one asked for land in a
warehouse unnoticed. A team that never considers `freeze`, `discard_row` or `discard_value` for
a source where silent drift is actually dangerous inherits whichever failure mode `evolve`
happens to produce, by default rather than by choice.

</section>

<section data-section="frontier">

## Frontier

None claimed. Usage-based pricing, schema contracts and the five named connector frameworks are
each established, long-documented practice.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

One failure this whole section kept returning to has no fix inside a cursor: the row that was
deleted, or changed twice between runs, leaving nothing behind for a cursor to find. The source
database already records every change, in order, for its own recovery. Reading that record
instead is the next section.

</section>
