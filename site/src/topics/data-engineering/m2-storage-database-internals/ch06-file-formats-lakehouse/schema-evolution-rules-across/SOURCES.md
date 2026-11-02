# Sources — de.schema-evolution-rules-across

## Apache Avro 1.11.1 Specification, "Schema Resolution"

URL: https://avro.apache.org/docs/1.11.1/specification/
Version: Apache Avro 1.11.1

> if the reader’s record schema has a field that contains a default value, and writer’s schema does not have a field with the same name, then the reader should use the default value from its field.

> if the reader’s record schema has a field with no default value, and writer’s schema does not have a field with the same name, an error is signalled.

> if the writer’s record contains a field with a name not present in the reader’s record, the writer’s value for that field is ignored.

> Named types and fields may have aliases. An implementation may optionally use aliases to map a writer’s schema to the reader’s.

Contents:
- Record resolution rules: fields matched by name; a reader field missing from the writer uses its default or errors; an extra writer field is ignored.
- Aliases: a reader-side rename mechanism — the alias maps the writer's old name to the reader's new one, as an alternative to this topic's own simulated rename.

## Protocol Buffers, "Language Guide (proto 3)"

URL: https://protobuf.dev/programming-guides/proto3/
Version: fetched 2026-10-30

> Reusing a field number makes decoding wire-format messages ambiguous. The Protobuf wire format is lean and doesn’t provide a way to detect fields encoded using one definition and decoded using another.

> Encoding a field using one definition and then decoding that same field with a different definition can lead to: Developer time lost to debugging A parse/merge error (best case scenario) Leaked PII/SPII Data corruption

> Field numbers should never be reused. Never take a field number out of the reserved list for reuse with a new field definition.

> If you update a message type by entirely deleting a field, or commenting it out, future developers can reuse the field number when making their own updates to the type. This can cause severe issues, as described in Consequences of Reusing Field Numbers. To make sure this doesn’t happen, add your deleted field number to the reserved list. The protoc compiler will generate error messages if any future developers try to use these reserved field numbers.

Contents:
- The wire-format risk of field-number reuse: ambiguous decoding, up to silent data corruption — not a parse error.
- `reserved` as the mechanism that makes protoc itself reject a future reuse of a deleted field number.

## Apache Parquet Format, `parquet.thrift` (SchemaElement)

URL: https://raw.githubusercontent.com/apache/parquet-format/master/src/main/thrift/parquet.thrift
Version: fetched 2026-10-30, `master` branch

> When the original schema supports field ids, this will save the

> original field id in the parquet schema

(One Thrift doc comment, split at the comment's own line-continuation `*`, which the extracted text preserves mid-sentence.)

Contents:
- `SchemaElement.field_id` (field 9, optional i32): the stable identifier this topic's by-field-ID matching strategy relies on, directly from Parquet's own Thrift schema definition.
