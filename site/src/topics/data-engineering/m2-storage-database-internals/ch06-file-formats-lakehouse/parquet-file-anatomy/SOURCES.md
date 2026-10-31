# Sources — de.parquet-file-anatomy

## Apache Parquet Format, README (file structure, hierarchy, glossary)

URL: https://raw.githubusercontent.com/apache/parquet-format/master/README.md
Version: apache/parquet-format, `master` branch, fetched 2026-10-31

> Row group: A logical horizontal partitioning of the data into rows.
> There is no physical structure that is guaranteed for a row group.
> A row group consists of a column chunk for each column in the dataset.

> Column chunk: A chunk of the data for a particular column. They live
> in a particular row group and are guaranteed to be contiguous in the file.

> Page: Column chunks are divided up into pages. A page is conceptually
> an indivisible unit (in terms of compression and encoding). There can
> be multiple page types which are interleaved in a column chunk.

> Hierarchically, a file consists of one or more row groups. A row group
> contains exactly one column chunk per column. Column chunks contain one or
> more pages.

> File Metadata is written after the data to allow for single pass writing.

Contents:
- The four-level file hierarchy (file → row groups → column chunks → pages) and why a row group is a logical, not physical, partitioning.
- The footer-at-the-end design: metadata is written after the data specifically so a writer can stream the file in one pass without seeking back.

## Apache Parquet Format, `parquet.thrift` (physical layout, page headers, enums)

URL: https://raw.githubusercontent.com/apache/parquet-format/master/src/main/thrift/parquet.thrift
Version: apache/parquet-format, `master` branch, fetched 2026-10-31

> INT96 = 3; // deprecated, new Parquet writers should not write data in INT96

> Alternate page format allowing reading levels without decompressing the data

> Repetition and definition levels are uncompressed

> The remaining section containing the data is compressed if is_compressed is true

> compare the last 4 bytes (days) as a little-endian 32-bit signed integer

> if equal last 4 bytes, compare the first 8 bytes as a little-endian

> 64-bit signed integer (nanos)

> While the INT96 type has been deprecated, at the time of writing it is

> still used in many legacy systems. It is optional for writers to emit

Contents:
- INT96's deprecated status, straight from the physical-type enum's own comment.
- DataPageHeaderV2's defining difference from v1: levels are always uncompressed and readable without touching the (optionally compressed) value section.
- The legacy byte layout of an INT96 physical value: 8 bytes of nanoseconds-of-day, then 4 bytes of a Julian day number, both little-endian — used directly to hand-encode and hand-decode this topic's own INT96 column.

## Apache Parquet Format, `LogicalTypes.md` (TIMESTAMP logical type semantics)

URL: https://raw.githubusercontent.com/apache/parquet-format/master/LogicalTypes.md
Version: apache/parquet-format, `master` branch, fetched 2026-10-31

> A `TIMESTAMP` with `isAdjustedToUTC=true` is defined as the number of
> milliseconds, microseconds or nanoseconds (depending on the `unit`
> parameter being `MILLIS`, `MICROS` or `NANOS`, respectively) elapsed since the
> Unix epoch, 1970-01-01 00:00:00 UTC. Each such value unambiguously identifies a
> single instant on the time-line.

> A `TIMESTAMP` with `isAdjustedToUTC=false` represents year, month, day, hour,
> minute, second and subsecond fields in a local timezone, _regardless of what
> specific time zone is considered local_.

> | TIMESTAMP_MILLIS | TimestampType (isAdjustedToUTC = true, unit = MILLIS) |
> | TIMESTAMP_MICROS | TimestampType (isAdjustedToUTC = true, unit = MICROS) |

Contents:
- The explicit instant-vs-local-wall-clock distinction `isAdjustedToUTC` exists to make unambiguous — the exact distinction INT96 has no field for at all.
- The legacy `ConvertedType` enum's `TIMESTAMP_MILLIS`/`TIMESTAMP_MICROS` values both only ever map to `isAdjustedToUTC = true`; a writer wanting local (unadjusted) semantics has no `ConvertedType` value available and must use the newer `LogicalType` struct directly, which this topic's `event_time_modern` column does.
