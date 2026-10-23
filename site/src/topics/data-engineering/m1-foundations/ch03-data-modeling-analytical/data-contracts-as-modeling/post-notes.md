<section data-section="outcomes">

## Outcomes

A data contract under the Open Data Contract Standard is a structured document, not a verbal
promise: its schema ties a dataset's business meaning and physical layout into one artifact,
with a field's `businessName` sitting alongside its physical type. Quality rules and SLAs are
their own named, specified sections, pinned to the schema they check rather than floating free.
Ownership is tracked directly in the contract's own team structure, with "Owner" appearing as an
explicit, named role in the standard's own worked example — not an assumption left to whoever
originally wrote the pipeline. Enforcement belongs at the point a producer emits data, not
downstream, because a downstream-only check has already let every consumer in between see the
bad data first. The specification itself keeps evolving: its own current default version has
already moved past the one this chapter's syllabus line names, a disclosed discrepancy rather
than a silently taught stale fact.

</section>

<section data-section="lab">

## Lab

This topic has no lab of its own (`CHAPTER.md`). Every sourced claim traces to a quote from the
Open Data Contract Standard's own specification pages (`SOURCES.md`). The producer-boundary
enforcement claim is this topic's own reasoned argument, flagged as such in `FACT-CHECK.md`.

</section>

<section data-section="production">

## Production failures this topic warns about

**A team that wrote a schema with no `businessName` or description field, leaving its meaning
to tribal knowledge.** The physical type alone tells a consumer nothing about what the field
actually represents — exactly the gap ODCS's own tied-together schema is designed to close.

**A team that only runs quality checks in the downstream warehouse, after ingestion.** By the
time that check fires, every pipeline stage and every consumer between the producer and the
warehouse has already processed the bad data — catching it there is detection, not the
prevention a contract is supposed to provide.

</section>

<section data-section="frontier">

## Frontier

ODCS is one standard among several approaches to data contracts (schema-registry-enforced
contracts in streaming systems, dbt's own model contracts, vendor-specific formats). Evaluating
those alternatives is outside this topic's own scope, but they answer the same underlying
question this topic names — what a contract has to specify, and where enforcement actually has
to happen — with different concrete mechanics.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A contract specified what a data product's schema and semantics actually are. Next: the layer
that compiles a business metric's own definition — built on top of exactly that schema — to SQL
the same way for every tool that asks for it.

</section>
