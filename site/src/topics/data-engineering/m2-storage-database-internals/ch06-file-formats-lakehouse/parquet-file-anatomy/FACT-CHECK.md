# Fact-check — de.parquet-file-anatomy

## Claims table

| # | Claim | Source |
|---|---|---|
| 1 | A Parquet file consists of one or more row groups; a row group has exactly one column chunk per column; a column chunk has one or more pages. | parquet-format README, "Hierarchically, a file consists of one or more row groups..." |
| 2 | A row group is a logical, not a physical, partitioning of rows. | README glossary, "Row group" entry |
| 3 | File metadata (the footer) is written after the data, to allow single-pass writing. | README, "File Metadata is written after the data to allow for single pass writing." |
| 4 | INT96 is a deprecated physical type; new writers should not emit it. | parquet.thrift, `Type` enum comment on `INT96` |
| 5 | DataPageHeaderV2's defining property: repetition/definition levels are always uncompressed, separate from the (optionally compressed) value section. | parquet.thrift, `DataPageHeaderV2` doc comment |
| 6 | The legacy INT96 chronological ordering rule is: compare the last 4 bytes (days) little-endian i32, then the first 8 bytes (nanos) little-endian i64 if equal — confirming the 12-byte layout is 8 bytes nanos-of-day + 4 bytes Julian day, both little-endian. | parquet.thrift, `ColumnOrder`/sort-order comment |
| 7 | `TIMESTAMP(isAdjustedToUTC=true)` means the stored integer is milliseconds/microseconds/nanoseconds since the Unix epoch UTC — an unambiguous instant. | LogicalTypes.md, "Instant semantics" section |
| 8 | `TIMESTAMP(isAdjustedToUTC=false)` means the stored integer represents local calendar fields, not tied to any specific timezone. | LogicalTypes.md, "Local semantics" section |
| 9 | The legacy `ConvertedType` enum's `TIMESTAMP_MILLIS`/`TIMESTAMP_MICROS` only ever map to `isAdjustedToUTC=true` — there is no `ConvertedType` value for local semantics. | LogicalTypes.md, ConvertedType-to-LogicalType mapping table |
| 10 | The hand-rolled file in `examples.py` is independently readable by a real Parquet implementation (pyarrow) with byte-identical row and schema values, confirming it is a genuinely spec-compliant file and not merely self-consistent. | Verified in this session: `pip install pyarrow`, read the file back with `pyarrow.parquet`, confirmed schema + all 4 rows across both row groups, then `pip uninstall pyarrow` (not a runtime dependency of `examples.py`). |

## Currency check

Fetched 2026-10-31 from `apache/parquet-format`'s `master` branch (README.md, `parquet.thrift`, `LogicalTypes.md`) — the canonical, continuously maintained specification repository. INT96's deprecated status and the `isAdjustedToUTC` flag are long-stable parts of the spec (unchanged for several years); no currency risk.

## Red-team

1. **Is the hand-rolled Thrift Compact Protocol writer actually correct, or just self-consistent?** Verified independently: round-tripped the exact file bytes through `pyarrow.parquet.read_table` (pip-installed for this one verification, then uninstalled — this sandbox has neither `pyarrow` nor `fastparquet` installed by default, confirmed again this session) and got back the identical schema and all 4 rows, including both timestamp columns decoding to the correct instant.
2. **Is the "first `total_compressed_size`/`total_uncompressed_size` must include page headers, not just bodies" claim real or just this file's own convention?** It's required by the spec's own comment on `ColumnMetaData.total_compressed_size`: "total byte size of all compressed...pages in this column chunk (including the headers)" (quoted in SOURCES.md's companion topic-3-style sourcing is not repeated here since it was already verified directly against pyarrow's own stricter reader, which failed with "No more data to read" until header bytes were included in the chunk's declared size — an empirical, not just textual, confirmation).
3. **Is the INT96-vs-timezone bug realistic, or an invented worst case?** The 7-hour PDT offset used for the "wrong" decode is a real, computed `zoneinfo.ZoneInfo("America/Los_Angeles")` UTC offset for the written date (2026-10-31, before that year's DST-to-standard-time transition), not a hardcoded or rounded number — `examples.py` asserts the exact offset and the exact resulting drift.
4. **Does skipping page-level Statistics undersell this topic's completeness?** No — statistics, page indexes and bloom filters are explicitly topic 7's own scope (`de.data-skipping-statistics-page`) per this chapter's plan; this topic's own outcomes list (row groups, column chunks, pages, footer, logical/physical types, v1/v2 headers, the INT96 pitfall) does not mention statistics, and introducing them here would duplicate topic 7's content.

Problem Solving: None — a specification-reading and spec-conformance topic, not a debugging task, beyond the one real correctness bug found and fixed while building this topic's own worked example (the page-header-inclusive chunk size, caught by an independent pyarrow read failing and traced to the exact missing bytes — see red-team item 2).
