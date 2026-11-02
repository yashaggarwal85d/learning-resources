Last verified: 31 October 2026. Every number on screen is executed and asserted directly
(`examples.py`, pure Python, no external library installed in this sandbox): a real, hand-written
Parquet file, encoded with the Thrift Compact Protocol by hand and parsed back from its own
bytes — file size, footer offset and length, page-header type bytes, and both the correct and the
wrong INT96 timestamp decode. The file was independently confirmed readable by a real Parquet
implementation (pyarrow, pip-installed only for this one verification, then removed).

- Apache Parquet Format, `README.md`: [github.com](https://github.com/apache/parquet-format/blob/master/README.md). `master` branch, fetched 2026-10-31. The file's own hierarchy (row group → column chunk → page) and the footer-at-the-end design.
- Apache Parquet Format, `parquet.thrift`: [github.com](https://github.com/apache/parquet-format/blob/master/src/main/thrift/parquet.thrift). `master` branch, fetched 2026-10-31. The Thrift struct definitions this topic's own writer and reader implement by hand: `PageHeader`, `DataPageHeader`, `DataPageHeaderV2`, the `INT96` deprecation note, and the legacy INT96 byte-ordering rule.
- Apache Parquet Format, `LogicalTypes.md`: [github.com](https://github.com/apache/parquet-format/blob/master/LogicalTypes.md). `master` branch, fetched 2026-10-31. The `TIMESTAMP` logical type's `isAdjustedToUTC` semantics, and the legacy `ConvertedType` enum's asymmetry (no value exists for local, unadjusted semantics).

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=parquet-file-anatomy:%20).
