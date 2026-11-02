<section data-section="outcomes">

## Outcomes

Restate and extend topic 7's "sorting decides whether stats prune at all" at the table level with
a real measurement. Contrast a linear sort order against a real Z-order space-filling curve for a
genuine multi-column predicate, with real pruning measured for each. Name Delta's liquid
clustering, Iceberg's sort orders, and Hudi's clustering as the three format-level mechanisms, and
state the incremental-vs-full-reclustering cost trade-off with a real measurement of each.

</section>

<section data-section="one-rule-two-formats">

## Layout decides whether a statistic prunes

A sort order and a Z-order both produce real per-group statistics — the difference is what those
statistics can actually tell a multi-column query. Iceberg's own spec is explicit that a sort
order is just an ordered list of columns: the order in which they're listed is the order the sort
is applied, which is exactly why a predicate on a non-leading column gets no help from it. Delta's
and Databricks' own docs describe Z-ordering and liquid clustering as solving precisely this —
colocating rows so a predicate on *any* of the clustered columns benefits, not just the first one.

</section>

<section data-section="production">

## Production

**Reclustering is a real commit with a real cost, and that cost has two modes.** Delta's own docs
are explicit: ordinary reclustering only rewrites what's needed to accommodate new or out-of-place
data, while `OPTIMIZE FULL` rewrites everything and "might take hours" on a large table that
hasn't been clustered on the current columns before.

**Z-ordering needs the statistics it's colocating for.** Databricks' own docs warn that Z-ordering
a column without stats collected on it is "ineffective and uses unnecessary compute resources" —
the clustering and the data-skipping statistics are two halves of the same mechanism.

</section>

<section data-section="frontier">

## Frontier

The 256-row dataset in `examples.py` is a synthetic, deliberately small and dense Cartesian
product, disclosed in the script's own docstring — chosen so a real Z-order's groups align to
clean, human-checkable 4×4 boxes, not a claim about any real dataset's skew. The "arrival order"
layout is a fixed, deterministic permutation standing in for real streaming order, not a claim
that real arrival order always has zero locality. The incremental-vs-full reclustering
demonstration models Delta's own documented behavior specifically, not Hudi's or Iceberg's own
incremental-clustering implementations in detail, though both are named and sourced. This topic's
executed demonstration uses Z-order rather than a Hilbert curve's more complex recursive
construction — both are named per the syllabus line, but only Z-order is separately coded.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A well-laid-out table of snapshots is still just a sequence of point-in-time states. The next
topic is reading that sequence itself as data: incremental reads and change feeds.

</section>
