Last verified: 31 October 2026. Every number on screen is executed and asserted directly
(`examples.py`, pure Python, no external library installed in this sandbox): a 200-row synthetic
shop dataset, five hand-rolled encoders, with three of them (`DELTA_BINARY_PACKED`,
`DELTA_BYTE_ARRAY`, `BYTE_STREAM_SPLIT`) first self-checked against the Parquet specification's own
published worked examples before being run on this topic's own columns.

- Apache Parquet Format, `Encodings.md`: [github.com](https://github.com/apache/parquet-format/blob/master/Encodings.md). `master` branch, fetched 2026-10-31. Dictionary encoding and its fallback, the RLE/bit-packing hybrid's scope, `DELTA_BINARY_PACKED`'s two-step algorithm, `DELTA_BYTE_ARRAY`, `BYTE_STREAM_SPLIT`, and ALP's conceptual summary.
- FSST, `README.md` (Boncz, Leis, Neumann): [github.com](https://github.com/cwida/fsst/blob/master/README.md). `master` branch, fetched 2026-10-31. What FSST targets that dictionary encoding does not — high-cardinality strings, random access, compressed-domain equality.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=columnar-encodings-dictionary-rle:%20).
