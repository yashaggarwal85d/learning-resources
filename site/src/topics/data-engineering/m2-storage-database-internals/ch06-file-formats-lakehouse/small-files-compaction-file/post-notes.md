<section data-section="outcomes">

## Outcomes

Name the real sources of small files — streaming micro-batches, high-partition-count writes,
merge-on-read delete/log files — and reproduce a streaming micro-batch pattern directly in this
sandbox. Measure the real cost many small files impose: real extra manifest-metadata bytes and
real extra per-file open/LIST overhead, both scaling with file count alone. Run a real bin-pack
compaction and measure the improvement, verified byte for byte. State the real scheduling
trade-off and name managed-maintenance offerings next to the self-run-job alternative.

</section>

<section data-section="one-rule-two-formats">

## File count is its own cost

Iceberg's own maintenance docs name the mechanism directly: more data files means more manifest
metadata and a real penalty just from opening each file, independent of how much data is inside
it. Delta's own optimizations docs describe the fix the same way from the other side: bin-packing
coalesces small files into larger, evenly-balanced ones, and the operation is idempotent — running
it twice does nothing the second time. Two different formats, the same one cost and the same one
fix.

</section>

<section data-section="production">

## Production

**Compaction is a real commit, not free maintenance.** Bin-packing a partition reads and rewrites
real files, which means it competes with anything else writing to that same partition — exactly
why Iceberg's own `rewriteDataFiles` action supports committing in batches rather than all at once,
and why a managed offering exists at all.

**Someone or something still has to run it.** AWS's own words: S3 Tables "automatically perform
compaction... without any manual intervention," and Databricks' predictive optimization
automatically runs `OPTIMIZE`, "eliminating manual maintenance." The self-run alternative —
Iceberg's `rewriteDataFiles`, Delta's `OPTIMIZE` — still exists, and is the only option outside a
managed table service.

</section>

<section data-section="frontier">

## Frontier

The real files in `examples.py` are a simplified stand-in for a table's actual Parquet data files
and Iceberg/Delta manifest format, disclosed in the script's own docstring — a fixed-width
manifest entry exists so the measured byte reduction is exact, not an approximation of either
format's real manifest layout. The "open/LIST overhead" figure is a deterministic cost-model proxy
for Iceberg's documented file-open cost and the AWS S3 Tables post's own measured 8.5x
read-request difference, not a timed wall-clock measurement — consistent with this site's standing
rule against flaky timing assertions. The zlib compression comparison is a real, measured stand-in
for "worse compression," not a reproduction of Parquet's column-level dictionary encoding. The
scheduling trade-off itself is stated from the sources, not demonstrated by a new live-race
measurement, for the same flaky-timing reason topic 17 already disclosed. Spark-side output
control over file counts at write time is named in the syllabus line but deferred in depth to
§7.2, consistent with CHAPTER.md's own scope note for this topic.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

File size is only half of what makes a statistic useful for pruning. The other half is whether the
rows inside each file are actually sorted or clustered by the columns a query filters on.

</section>
