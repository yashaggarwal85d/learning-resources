# Sources — de.variant-type-shredding

## Apache Parquet Format, `VariantEncoding.md`

URL: https://raw.githubusercontent.com/apache/parquet-format/master/VariantEncoding.md
Version: apache/parquet-format, `master` branch, fetched 2026-10-31

> A Variant value in Parquet is represented by a group with 2 fields, named `value` and `metadata`.

> A Variant represents a type that contains one of:

> Primitive: A type and corresponding value (e.g. INT, STRING)

> Array: An ordered list of Variant values

> Object: An unordered collection of string/Variant pairs (i.e. key/value pairs). An object may not contain duplicate keys.

> If `sorted_strings` is set to 1, strings in the dictionary must be unique and sorted in lexicographic order.

> If the value is set to 0, readers may not make any assumptions about string order or uniqueness.

> For objects, field IDs and offsets must be listed in the order of the corresponding field names, sorted lexicographically (using unsigned byte ordering for UTF-8).

> Note that the field values themselves are not required to follow this order.

## Apache Parquet Format, `VariantShredding.md`

URL: https://raw.githubusercontent.com/apache/parquet-format/master/VariantShredding.md
Version: apache/parquet-format, `master` branch, fetched 2026-10-31

> Since data is often partially homogeneous, it can be beneficial to extract certain fields into separate Parquet columns to further improve performance.

> Shredding enables the use of Parquet's columnar representation for more compact data encoding, column statistics for data skipping, and partial projections.

> Both `value` and `typed_value` are optional fields used together to encode a single value.

> This layout enables readers to skip data based on the field statistics for `value` and `typed_value`.

> Statistics for `typed_value` columns can be used for file, row group, or page skipping when `value` is always null (missing).

> Shredding is an optional feature of Variant, and readers must continue to be able to read a group containing only `value` and `metadata` fields.

> Different files may contain conflicting shredding schemas.
