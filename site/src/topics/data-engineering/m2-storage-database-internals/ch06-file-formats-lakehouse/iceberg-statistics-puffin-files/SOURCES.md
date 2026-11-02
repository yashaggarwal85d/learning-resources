## Apache Iceberg, Table Spec (column metrics truncation, table/partition statistics)

URL: https://iceberg.apache.org/spec/
Version: latest (fetched 2026-11-02)

> Regardless of tight_stats, bounds for string and binary are never tight because they may be truncated when written, and bounds for geometry and geography are never tight because they are a bounding box rather than exact minimum and maximum values.

> Table statistics files are valid Puffin files. Statistics are informational. A reader can choose to
ignore statistics information. Statistics support is not required to read the table correctly. A table can contain
many statistics files associated with different table snapshots.

> ID of the Iceberg table's snapshot the statistics file is associated with.

> Ordered list of fields, given by field ID, on which the statistic was calculated.

> Partition statistics files are based on partition statistics file spec.

> Partition statistics are not required for reading or planning and readers may ignore them.

> Each table snapshot may be associated with at most one partition statistics file.

Contents: a file's `lower_bound`/`upper_bound` column metrics in a manifest are never tight for
string and binary columns because they may be truncated when written — statistics are kept at the
whole-table level too, in Puffin files registered in table metadata and explicitly informational
(a reader may ignore them without breaking correctness); partition statistics files are the
partition-level equivalent, equally optional.

## Apache Iceberg, Puffin Spec (file structure, Theta sketch blob type)

URL: https://iceberg.apache.org/puffin-spec/
Version: latest (fetched 2026-11-02)

> Magic is four bytes 0x50, 0x46, 0x41, 0x31 (short for: Puffin Fratercula
arctica, version 1),

> FooterPayload: optionally compressed, UTF-8 encoded JSON payload describing the
blobs in the file, with the structure described below

> A serialized form of a "compact" Theta sketch produced by the Apache
DataSketches library. The sketch is obtained by
constructing Alpha family sketch with default seed, and feeding it with individual
distinct values converted to bytes using Iceberg's single-value serialization.

> ndv: estimate of number of distinct values, derived from the sketch,
 stored as non-negative integer value represented using decimal digits
 with no leading or trailing spaces.

Contents: a Puffin file is Magic bytes, one or more blobs, then a Footer (Magic, a JSON
FooterPayload describing every blob's type/offset/length/properties, the payload's size, flags,
Magic again) — the exact byte layout this topic's real Puffin file is built to. The
`apache-datasketches-theta-v1` blob type names the real library and sketch family a production
writer uses; its `ndv` property is the sketch's own distinct-count estimate, stored as plain text.

## Trino, Iceberg connector (collecting statistics)

URL: https://trino.io/docs/current/connector/iceberg.html
Version: Trino 484 (fetched 2026-11-02)

> The Iceberg connector can collect column statistics using ANALYZE
statement.

> On wide tables, collecting statistics for all columns can be expensive. It is
also typically unnecessary - statistics are only useful on specific columns,
like join keys, predicates, or grouping keys.

Contents: Trino's own Iceberg connector collects column statistics via `ANALYZE`, and recommends
narrowing it to the columns a query plan actually needs stats for — join keys, predicates,
grouping keys — rather than every column on a wide table.

## Trino, Cost-based optimizations

URL: https://trino.io/docs/current/optimizer/cost-based-optimizations.html
Version: Trino 484 (fetched 2026-11-02)

> With cost-based join enumeration, Trino uses Table statistics
provided by connectors to estimate the costs for different join orders and
automatically picks the join order with the lowest computed costs.

> If you are using AUTOMATIC join enumeration and statistics are not
available or a cost can not be computed for any other reason, the
ELIMINATE_CROSS_JOINS strategy is used instead.

> This allows you to improve cluster concurrency and prevent bad plans when the
cost-based optimizer misestimates the size of the joined tables.

> In order for the Trino optimizer to use the cost based strategies,
the connector implementation must provide Table statistics.

Contents: Trino's cost-based join enumeration depends directly on the connector-supplied table
statistics to pick a join order; missing or uncomputable statistics force a fallback to a weaker,
purely structural strategy, and statistics that misestimate table size risk a genuinely bad plan
rather than just a suboptimal one.
