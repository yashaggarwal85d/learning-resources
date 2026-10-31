Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy Avro-style compatibility checker, a toy Protobuf field-number check, a toy
wire-format encoder/decoder, and a toy subject-naming comparison, no real Schema Registry
available): an evolution that passed backward but failed transitive, a field reuse correctly
flagged unsafe, a schema id that round-tripped cleanly through the wire format, and a naming
comparison that scoped checks differently per strategy. The compatibility-mode definitions,
Avro's reader/writer resolution rules, Protobuf's field-number rules, the subject-naming
strategies, and the wire-format layout are disclosed, sourced-only claims from each project's own
documentation.

- Schema Evolution and Compatibility for Schema Registry (Confluent Platform docs):
  [docs.confluent.io/.../schema-evolution.html](https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html).
  The four compatibility modes this topic's reveal cites.
- Formats, Serializers, and Deserializers for Schema Registry (Confluent Platform docs):
  [docs.confluent.io/.../serdes-develop/](https://docs.confluent.io/platform/current/schema-registry/fundamentals/serdes-develop/index.html).
  The three subject-naming strategies and the wire-format layout.
- Specification (Apache Avro 1.11.1 docs):
  [avro.apache.org/docs/1.11.1/specification/](https://avro.apache.org/docs/1.11.1/specification/).
  Avro's reader/writer schema resolution rules this topic's format comparison cites.
- Language Guide (proto 3) (Protocol Buffers docs):
  [protobuf.dev/programming-guides/proto3/](https://protobuf.dev/programming-guides/proto3/).
  Protobuf's field-number rules this topic's format comparison cites.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=schema-registry-compatibility:%20).
