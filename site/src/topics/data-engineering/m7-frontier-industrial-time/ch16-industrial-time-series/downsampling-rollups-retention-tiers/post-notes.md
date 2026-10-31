<section data-section="outcomes">

## Outcomes

A naive average of unequal-count hourly averages shown disagreeing with the raw, count-weighted
mean, fixed by storing sum and count instead of an average. Hourly rollups with min, max, sum,
count and a mergeable digest, merged into a daily rollup that reproduces the raw computation
exactly. A late reading shown forcing a recompute of exactly the one bucket it belongs to, leaving
every other bucket untouched. A three-tier retention plan's storage arithmetic worked out, with
query routing by time range including a range that spans two tiers and has to stitch them. A
single real spike shown nearly erased by a mean rollup and preserved exactly by a max rollup kept
alongside it. A range query shown scanning far fewer rows from a rollup than from raw data for the
same time window.

</section>

<section data-section="lab">

## Lab

`examples.py` runs every computation directly: a synthetic day of readings with one restart hour
at a far lower sample count than the rest, exposing the naive-average error; hourly rollups merged
into a daily one and checked against the raw sum, count and mean exactly; a simplified mergeable
digest checked to agree on a quantile whether built from the union directly or by merging two
smaller digests; a late reading applied to an already-materialized bucket and checked to change
its max, count and mean; a three-tier storage-bytes calculation checked to cost less per retained
day for a minute rollup than for raw data at a realistic sampling rate; a query router checked to
pick raw, the minute rollup, or both tiers depending on the requested range; a bucket with one
injected spike checked to keep a near-baseline mean alongside an exact max; and a DuckDB row-count
comparison checked to scan fewer rows from a rollup than from raw over the same range.

</section>

<section data-section="production">

## Production failures this topic warns about

**Storing an average in a rollup instead of sum and count.** The hook's daily dashboard is the
production shape of this bug: once stored as an average, a bucket's original sample count is gone,
and every later rollup computed from it inherits the error with no way to detect or correct it.

**A dashboard that silently switches retention tier as the query window widens.** A chart showing
one second of real variation at a short zoom and a flattened hourly mean at a long zoom is not
reporting the same claim about the world at both zooms — without a visible tier indicator, a
reader has no way to know a spike they saw at one zoom has vanished at another.

</section>

<section data-section="frontier">

## Frontier

Chapter 5's `quantile-sketches` and `hyperloglog-distinct-counting` are named by CHAPTER.md as the
production answer to "how does a mergeable summary actually work" — as of this topic's build,
neither exists yet in `registry.ts` (Chapter 5 only extends through §5.5). `examples.py`'s
`SimpleMergeableDigest` demonstrates only the mergeability property those sketches provide, fully
disclosed as a simplified stand-in, not a claim about t-digest, KLL or HyperLogLog internals (see
`OUTLINE.md`). Prometheus's recording rules and Thanos's own compactor are both named and quoted
in `SOURCES.md` for their own versions of this chapter's ideas, but neither was run in this
environment.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Rollups keep fewer points. Compression keeps the same points in fewer bits. The next topic is how
that works for timestamps and floating-point values, where regularity buys a large reduction in
one published system and almost nothing in another.

</section>
