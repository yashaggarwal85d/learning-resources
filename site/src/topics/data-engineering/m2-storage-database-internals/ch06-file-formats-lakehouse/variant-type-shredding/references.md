Last verified: 31 October 2026. Every number on screen is executed and asserted directly
(`examples.py`, pure Python, no external library installed in this sandbox): a hand-rolled Variant
metadata dictionary and value encoder/decoder built to the specification's own byte layout,
round-tripped against 6 real heterogeneous records, a forced-struct data-loss measurement, and a
field-by-field shredding simulation.

- Apache Parquet Format, `VariantEncoding.md`: [github.com](https://github.com/apache/parquet-format/blob/master/VariantEncoding.md). `master` branch, fetched 2026-10-31. The Variant binary encoding: the metadata dictionary layout and the value/value_header/value_data layout this topic's encoder implements by hand.
- Apache Parquet Format, `VariantShredding.md`: [github.com](https://github.com/apache/parquet-format/blob/master/VariantShredding.md). `master` branch, fetched 2026-10-31. The shredding specification: the `value`/`typed_value` decision table, data skipping on shredded columns, and the reconstruction algorithm this topic's shredding simulation follows.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=variant-type-shredding:%20).
