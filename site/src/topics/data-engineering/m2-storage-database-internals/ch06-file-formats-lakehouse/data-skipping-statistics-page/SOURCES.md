# Sources — de.data-skipping-statistics-page

## Apache Parquet Format, `parquet.thrift`

URL: https://raw.githubusercontent.com/apache/parquet-format/master/src/main/thrift/parquet.thrift
Version: apache/parquet-format, `master` branch, fetched 2026-10-31

> Statistics per row group and per page

> All fields are optional.

> Writers SHOULD always write this field even if it is zero (i.e. no null value)

> Readers MUST distinguish between null_count not being present and null_count == 0.

> column chunk. For example, instead of storing "Blart Versenwald III", a writer

> may set min_value="B", max_value="C". Such more compact values must still be

> valid values within the column's logical type.

Contents:
- Confirms `Statistics` exists at both row-group and page granularity — the two levels this topic's own skipping demo exercises.
- The `null_count` presence rule, used directly in this topic's own row-group statistics.
- The exact truncation example this topic's own `truncate_correct`/`truncate_buggy` functions are built to reproduce, including the bug class (a truncated bound that is no longer valid).

## Parquet Page Index (`PageIndex.md`)

URL: https://raw.githubusercontent.com/apache/parquet-format/master/PageIndex.md
Version: apache/parquet-format, `master` branch, fetched 2026-10-31

> In Parquet, a *page index* is optional metadata for a
> ColumnChunk, containing statistics for DataPages that can be used to skip those pages when scanning in ordered and unordered columns.

> ColumnIndex: this allows navigation to the pages of a column based on column
> values and is used to locate data pages that contain matching values for a
> scan predicate

> For ordered columns, this allows a reader to find matching pages by performing
> a binary search in `min_values` and `max_values`. For unordered columns, a
> reader can find matching pages by sequentially reading `min_values` and
> `max_values`.

Contents:
- The page index's own purpose: page-level skipping, on top of row-group-level statistics.
- Why a sorted column's page index is faster to use (binary search) than an unsorted one (sequential scan) — the sort/cluster claim this topic measures directly.

## Parquet Bloom Filter (`BloomFilter.md`)

URL: https://raw.githubusercontent.com/apache/parquet-format/master/BloomFilter.md
Version: apache/parquet-format, `master` branch, fetched 2026-10-31

> when there are too many
> distinct values, writers sometimes choose not to add dictionaries because of the extra
> space they occupy. This leaves columns with large cardinalities and widely separated min
> and max without support for predicate pushdown.

> is a compact data structure that
> overapproximates a set. It can respond to membership queries with either "definitely no" or
> "probably yes", where the probability of false positives is configured when the filter is
> initialized. Bloom filters do not have false negatives.

> A filter that uses 1024 blocks and has had 26,214 hash values
> `insert`ed will have a false positive probability of around 1.26%.

Contents:
- Why bloom filters exist at all: high-cardinality columns where min/max statistics and dictionaries both fail to help.
- The core bloom-filter guarantee (no false negatives, probabilistic false positives) this topic's own SBBF implementation is checked against.
- The spec's own worked example this topic's own SBBF is sized to match and whose false-positive rate it measures empirically.
