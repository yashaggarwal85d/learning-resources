<section data-section="outcomes">

## Outcomes

Explain projection pruning and row-group min/max/null-count statistics, and show a real selective
query that skips row groups because of them. Read a real page index (ColumnIndex/OffsetIndex) and
show it skipping individual pages within a row group that survived row-group-level pruning. Build
and use a real split-block bloom filter for a high-cardinality equality predicate. Demonstrate
directly why an unsorted column's statistics prune nothing, with the identical query pruning
heavily once the file is sorted. Reproduce a real truncated-binary-statistics skipping failure.

</section>

<section data-section="three-layers-of-proof">

## Three layers of proof

Every skipping trick in this topic answers the same question — can a reader prove, without
reading a value, that it cannot match a predicate? — at a different granularity. Projection
pruning is the coarsest layer and the one this topic spends the least time on: a column a query
never references is never even opened, whatever its statistics say. Row-group statistics
(`Statistics.min_value`/`max_value`/`null_count`, one struct per column chunk) prove it for
whole row groups. The page index (`ColumnIndex`/`OffsetIndex`) proves the identical fact one level
smaller, for individual pages inside a row group that statistics alone couldn't rule out. A
split-block bloom filter proves a weaker, probabilistic version of the same fact for columns where
min/max gives up entirely — a membership test with no false negatives and a small, tunable false
positive rate, built in this topic's own code to the specification's exact block/mask algorithm
and checked against the specification's own stated false-positive example.

</section>

<section data-section="lab">

## Lab: a bug that costs real rows, not just time

This topic's `examples.py` builds a correct and a buggy version of the same truncation trick
`parquet.thrift` itself documents (shrinking `"Blart Versenwald III"` to a shorter, cheaper bound).
The correct version rounds its last kept byte up, so the shortened bound still covers the real
value. The buggy version just cuts the string, producing a bound that is no longer a true upper
bound — and a query that should match the real row gets told to skip the row group entirely. The
difference between those two functions is one line of code and the entire difference between a
space optimization and silent data loss.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting statistics on a column no one ever sorted or clustered.** This topic measures it
directly: the identical query against the identical 1000 values reads 1 row group when sorted and
10 when shuffled. A table that gets wider and more selective queries over time, without anyone
revisiting its write-time sort order, silently loses all of its pruning benefit — nothing breaks,
every query just gets slower.

**Assuming a bloom filter check of "true" means the value is present.** It doesn't, by design — a
bloom filter's own guarantee only rules things out. Code that short-circuits on a bloom filter hit
without checking the actual data is building in the exact false-positive rate this topic measures,
as silent, incorrect results rather than as a performance win.

</section>

<section data-section="frontier">

## Frontier

This topic's bloom filter substitutes a SHA-256-derived hash for the specification's own XXH64,
disclosed directly in `examples.py`'s comments — XXH64 itself is a well-documented, separate
algorithm outside this topic's scope, and the block/mask structure this topic checks is identical
either way. Real engines also combine several of these tricks at once (a bloom filter check before
ever consulting row-group statistics, for instance) — out of scope here, where each trick is shown
in isolation to make its own individual contribution clear.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every skipping trick so far lived inside one Parquet file's own footer. The next section asks what
happens once there isn't one file anymore, but a whole table of them sitting in object storage
with no file you can safely edit in place.

</section>
