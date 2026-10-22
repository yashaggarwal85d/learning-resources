<section data-section="outcomes">

## Outcomes

Each medallion layer's name is only a label; its contract is a specific, stated behavior that has to be actually honored — Bronze: raw and as-is for audit and lineage; Silver: conformed, "just-enough" cleansed, an enterprise view; Gold: consumption-ready and project-specific. Forcing a pipeline through all three stages when it doesn't genuinely need them pays a real cost in added latency and duplicated storage, with no matching benefit. Because different teams apply transformations at different stages, accountability for data quality becomes fragmented, and the Silver layer specifically bears the brunt of that, becoming a named bottleneck from downstream consumers pulling against aggregates they had no say in building. A pipeline with few enough consumers to not need that reuse should collapse or reshape the layers it doesn't actually need, rather than keeping all three out of habit.

</section>

<section data-section="internals">

## Internals: how the layers are actually wired, not just scheduled

A naive medallion pipeline runs three separately scheduled batch jobs, one per layer, each waiting on the previous one to finish — which is exactly where the copy-cost and latency failure mode this topic measured comes from most visibly. Tools like Databricks' Spark Declarative Pipelines (Lakeflow) instead build Bronze, Silver, and Gold as streaming tables and materialized views over the same underlying engine, incrementally refreshed as new data arrives rather than fully rerun on a schedule. That doesn't eliminate the layer-sprawl or ownership-fragmentation failure modes this topic names — those are organizational and design choices, not scheduling ones — but it does change how much the copy-cost and latency failure mode actually costs in practice, without this topic claiming a specific measured number for that difference.

</section>

<section data-section="lab">

## Lab

This topic has no lab of its own (`CHAPTER.md`). Every claim traces to a quote from the term's own originating vendor (Databricks) for each layer's contract, and an independently authored critique (Modern Data 101, not affiliated with Databricks) for the named failure modes (`SOURCES.md`).

</section>

<section data-section="production">

## Production failures this topic warns about

**A pipeline that grew a fourth, fifth, sixth "layer" over time.** Each one added because it seemed convenient at the time, with no stated contract of its own — nobody on the team can say what any of the extra layers actually promise, which is layer sprawl in its most literal form: more stages than the data genuinely needs, each one a real cost with no corresponding benefit.

**Treating the medallion convention as mandatory for every pipeline, regardless of consumers.** A pipeline with exactly one source and one downstream consumer has nobody else to serve with a shared enterprise view — keeping all three layers anyway duplicates the cost this topic measured without ever getting the reuse benefit the convention exists to provide.

</section>

<section data-section="frontier">

## Frontier

The independently authored critique this topic quotes makes a broader argument beyond the specific failure modes named here: a data-product architecture that shifts ownership left, to whoever actually produces the data, packaging it as a discoverable, reliable product from the outset rather than offloading transformation and quality work onto whoever consumes it downstream. Evaluating that alternative's own tradeoffs in full is outside this topic's own scope, but it's the same ownership-fragmentation problem this topic measured, addressed by redesigning who owns quality rather than by renaming or reshaping the three layers.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Medallion architecture settled how data moves through layers once it's already landed. Next: an older, still-relevant architectural debate about how data gets there in the first place — batch and streaming, merged at serving (Lambda) or unified into one stream-only engine (Kappa).

</section>
