<section data-section="outcomes">

## Choosing between a JSON string column, an inferred struct and VARIANT

A JSON string column costs the least up front (no schema, no parsing at write time) but pays a
real, measured extraction cost on every single read, forever. An inferred struct is the fastest
to read but commits to one type per field before any data arrives -- measured directly, a value
that doesn't match that type comes back NULL, silently. VARIANT sits between them: parsed once,
at write time, into self-describing binary that tolerates any field's type varying row to row,
at an extraction cost measurably lower than re-parsing JSON text but higher than a struct's
direct column access.

</section>

<section data-section="The read/write trade-off shredding introduces">

## The read/write trade-off shredding introduces

Shredding promotes one specific, frequently-read VARIANT field into its own typed Parquet
column, alongside the rest of the value staying as ordinary VARIANT binary. Sourced directly
from Spark's own release notes: VARIANT reached general availability with shredding in Spark
4.1, a release after this chapter's pinned 4.0.1, which has no automatic shredding-schema
inference. The shape of the trade-off is the chapter's established one -- a struct's read speed
for the field that earns it, in exchange for a write that now has to populate an extra column --
applied to exactly the one or two fields a workload actually reads often, not the whole value.

</section>

<section data-section="production failures">

## Choosing a struct when the data wasn't actually fixed-shape

The failure this topic measures isn't a crash. It's quieter: a struct cast that silently turns
a field's value into NULL the moment real data disagrees with the schema someone inferred from
a sample. A pipeline built on an inferred struct can run clean for a long time, dropping values
on exactly the rows where the underlying event's shape varied, with nothing in the logs to say
so.

</section>

<section data-section="frontier">

## Where this goes next

VARIANT closes this section, and the chapter's engine-internals material. Section 7.6, native
vectorized execution for Spark, has no reel: this chapter's own generated-code execution model
(the one built back in its earlier topics) is itself being replaced for CPU-bound plans by
native vectorized engines -- Databricks' Photon, Apache Gluten (on the Velox or ClickHouse
backends), Apache DataFusion Comet, and GPU acceleration via NVIDIA's RAPIDS Accelerator --
named and dated here from each project's own documentation, with no reel. The chapter's own
closing topic picks up right after it, stepping outside Spark's execution model entirely to
name what it chose not to be.

</section>
