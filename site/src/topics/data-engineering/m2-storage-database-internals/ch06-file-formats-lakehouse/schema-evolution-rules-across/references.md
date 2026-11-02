Last verified: 30 October 2026. Every number on screen is executed and asserted directly
(`examples.py`, pure Python, no external service needed — this sandbox has neither `fastavro` nor
`pyarrow` installed, so each format's own resolution rule is hand-rolled directly from its spec):
a missing Avro field's resolved default vs. a missing-with-no-default field's raised error; a
real name's UTF-8 bytes decoded as a reused Protobuf field's int32; and one renamed-plus-inserted
Parquet schema change matched three ways (by name, by position, by field ID), with the exact
values each strategy returns.

- Apache Avro, "Specification — Schema Resolution": [avro.apache.org](https://avro.apache.org/docs/1.11.1/specification/). Apache Avro 1.11.1. The record, enum, union and alias resolution rules this topic's own Avro example is built on.
- Protocol Buffers, "Language Guide (proto 3)": [protobuf.dev](https://protobuf.dev/programming-guides/proto3/). Retrieved 2026-10-30. The field-number and `reserved` rules this topic's own Protobuf example is built on.
- Apache Parquet Format, `parquet.thrift` (`SchemaElement`): [github.com](https://raw.githubusercontent.com/apache/parquet-format/master/src/main/thrift/parquet.thrift). `master` branch, retrieved 2026-10-30. The `field_id` field this topic's by-field-ID matching strategy relies on, read directly from Parquet's own Thrift schema.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=schema-evolution-rules-across:%20).
