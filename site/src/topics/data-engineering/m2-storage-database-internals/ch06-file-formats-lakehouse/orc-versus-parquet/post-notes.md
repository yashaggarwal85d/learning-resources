<section data-section="outcomes">

## Outcomes

Describe ORC's stripe/stream layout (PRESENT/DATA streams, index streams placed first) and its
built-in ROW_INDEX stream (one entry every 10,000 rows, present unconditionally) next to
Parquet's row-group statistics and opt-in page index from topics 4 and 7. Measure, on the same
100,000-row dataset, how many rows a selective query actually reads under each structure's
default granularity. State ORC's ACID-transaction history in Hive (row-level transactions landed
in Hive 0.13, but the integration work was only ever done for ORC) and why that made ORC Hive's
own default. Give the real, sourced reasons Parquet became the lakehouse-wide default instead
(a framework-neutral design, and the table formats of the next section choosing it first), and
name the concrete estates — legacy Hive tables, some Trino deployments — where ORC still appears.

</section>

<section data-section="two-defaults-two-trade-offs">

## Two defaults, two trade-offs

ORC's row index is not a feature a writer turns on — it is simply how an ORC stripe is laid out,
fixed at 10,000 rows per entry. Parquet's matching structure, row-group statistics, exists by
default too, but at whatever row-group size the writer picked, which this topic's own 25,000-row
example shows can be coarser than ORC's fixed default. Parquet's finer, page-level index is the
mirror image: a real, separate structure that beats ORC's fixed granularity once enabled, at a
real metadata cost this topic measures directly (4x the index bytes, for 4x finer pruning). Which
default suits a workload isn't free to decide — it's the same fixed-cost-versus-opt-in trade-off
this chapter's own `variant-type-shredding` topic drew between an unshredded Variant and a
shredded one, one layer up.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a smaller row group always beats ORC's fixed index.** A Parquet writer that sets its
row-group size larger than 10,000 rows — common for write throughput or compression locality —
gets coarser default pruning than ORC's fixed index, not better. Teams migrating ORC-heavy Hive
workloads to Parquet without checking the target row-group size can see selective queries read
more data than they did before, and misdiagnose it as a Parquet regression rather than a
configuration gap.

**Treating ORC as dead weight to delete on sight.** This topic names concrete estates — legacy
Hive tables, some Trino deployments reading them — where ORC is still the format in production,
not a historical curiosity. A migration that assumes "everything lakehouse is Parquet now" can
break a live Hive/Trino read path that nobody flagged as still depending on ORC.

</section>

<section data-section="frontier">

## Frontier

This topic's measurements model one dimension of the comparison (row-pruning granularity and
its index-byte cost) on a toy 100,000-row dataset with a simplified, uniform per-entry statistics
size; a real file's compression ratio, dictionary/RLE encoding choices, and column count all
shift the actual numbers. ORC's own Bloom Filter Index (a further, separate opt-in structure
added from Hive 1.2.0 onward, per `ORCv1.md`'s own "Bloom Filter Index" section) and the full
mechanics of Hive's base/delta compaction cycle are both named in this topic's sources but not
built or measured here — they are the natural next layer for a topic that wanted to go deeper
into either format's own skipping or transaction story.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A single immutable file, Parquet or ORC, still can't answer the next question on its own: what
does "a table," with atomic commits across many files, mean once the storage underneath is an
object store with no file you can edit in place? That's where this chapter turns next.

</section>
