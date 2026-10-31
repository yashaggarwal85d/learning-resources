<section data-section="outcomes">

## Outcomes

The worst-case and the actual series count computed for a synthetic plant label scheme, showing the
gap real equipment fitment opens up against a naive cross product. A postings index built and
intersected for a multi-label query, checked against a brute-force scan exactly, with a regex
matcher shown unable to use the same shortcut. An unbounded label (a batch ID) shown multiplying
the series count by its own distinct-value count, and the resulting memory-cost blowup computed
directly. A scan-based columnar model (DuckDB, standing in for a ClickHouse/InfluxDB-3-style engine)
shown answering the same high-cardinality predicate as an ordinary scan, with no per-series index to
blow up.

</section>

<section data-section="lab">

## Lab

`examples.py` runs every computation directly: a synthetic plant label scheme (sites, lines,
equipment, sensor types, status) with equipment fitted to only a subset of possible sensors;
worst-case and actual series counts compared; a real postings index built as a sorted series-ID
list per label/value pair and intersected for a multi-label equality query, checked against a
brute-force scan; a regex-style prefix matcher measured separately, with no postings shortcut
available to it; a batch-ID label added to every sensor series, checked to multiply the series
count by exactly the number of distinct batch values; a per-series memory estimate scaled by the
same multiplier; and the identical point-lookup and high-cardinality queries run again against a
DuckDB-backed columnar table to compare the postings model against a scan-based one.

</section>

<section data-section="production">

## Production failures this topic warns about

**Adding a label without counting its distinct values first.** The hook's one-line change is the
production shape of this failure: a label's cost isn't visible in the line that adds it, only in
the multiplication it performs on every series that already carries the other labels.

**Treating a dimension of a fact as part of a series' identity.** A batch or lot ID describes one
reading's context, not a different kind of sensor — folding it into the series' own label set turns
a bounded dimension into an unbounded multiplier on the index the system actually has to maintain.

</section>

<section data-section="frontier">

## Frontier

Chapter 5's `hyperloglog-distinct-counting` and `probabilistic-membership-filters` are named by
CHAPTER.md as the cheap way to estimate cardinality before building the exact index — as of this
topic's build, neither exists yet in `registry.ts` (Chapter 5 only extends through §5.5). Chapter 15
topic 25's `per-series-state-cold-start-churn` is likewise named for the per-series state cost this
topic prices, and Chapter 15 only extends through §15.3 — topic 25 doesn't exist yet either. This
topic's own postings index and series-count arithmetic are exact, not probabilistic, so neither gap
affects what's actually built; see `OUTLINE.md` and `SOURCES.md` for both. InfluxDB 3's "unlimited
cardinality" claim is named and quoted but not independently run — no InfluxDB 3 instance exists in
this environment, so DuckDB stands in as the scan-based comparison engine.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A series count, a codec and an index are three of the pieces of a storage engine. The next topic
puts them together: how Prometheus, TimescaleDB and InfluxDB 3 actually lay out a write, a block
and a compaction, and where each of them puts the line between memory and disk.

</section>
