Sources fetched and quoted for `de.schema-registry-compatibility`.

## Schema Evolution and Compatibility for Schema Registry (Confluent Platform docs)

URL: https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html

> Backward - consumers using new schema can read data written with old schema (add optional
> fields, remove fields)

> Forward - consumers using old schema can read data written with new schema (remove optional
> fields, add fields)

> Full - both backward and forward compatible (add/remove optional fields only)

> Transitive - compatibility checked against all previous versions, not just the last one

> BACKWARD: consumer using schema X can process data produced with schema X or X-1

> BACKWARD_TRANSITIVE: consumer using schema X can process data produced with schema X, X-1, or
> X-2

## Formats, Serializers, and Deserializers for Schema Registry (Confluent Platform docs)

URL: https://docs.confluent.io/platform/current/schema-registry/fundamentals/serdes-develop/index.html

> TopicNameStrategy

> Derives subject name from topic name. (This is the default.)

> RecordNameStrategy

> Derives subject name from record name, and provides a way to group logically related events
> that may have different data structures under a topic.

> TopicRecordNameStrategy

> Derives the subject name from topic and record name, as a way to group logically related
> events that may have different data structures under a topic.

> 4-byte schema ID as returned by Schema Registry.

> The schema ID is encoded with big-endian ordering; that is, standard network byte order.

## Specification (Apache Avro, 1.11.1 docs)

URL: https://avro.apache.org/docs/1.11.1/specification/

> if the writer's record contains a field with a name not present in the reader's record, the
> writer's value for that field is ignored.

> if the reader's record schema has a field that contains a default value, and writer's schema
> does not have a field with the same name, then the reader should use the default value from
> its field.

> if the reader's record schema has a field with no default value, and writer's schema does not
> have a field with the same name, an error is signalled.

## Language Guide (proto 3) (Protocol Buffers docs)

URL: https://protobuf.dev/programming-guides/proto3/

> Field numbers should never be reused.

> Reusing a field number makes decoding wire-format messages ambiguous.

Notes on this topic's research: CHAPTER.md names Chapter 3's `data-contract-specification` as
used by reference for this topic's data-contract clause; that topic is not yet built in this
site, so it is named in prose in `prerequisites.mdx` rather than linked as a `<Resource>`, per
this chapter's established pattern for not-yet-built prerequisites. The Protobuf quotes above
confirm reusing a field number is unsafe; the companion claim that renaming a field (without
changing its number) is safe follows directly from Protobuf's wire format being keyed by field
number rather than field name (shown by the same wire-format material), and is taught here as a
direct consequence of the quoted rule rather than as a second, separately quoted sentence.
