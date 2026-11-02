# Fact-check — Schema Registry and compatibility modes

| Claim | Source | Status |
|---|---|---|
| Backward compatibility lets consumers using the new schema read data written with the old schema (add optional fields, remove fields) | Confluent Schema Registry docs | Confirmed, quoted verbatim |
| Forward compatibility lets consumers using the old schema read data written with the new schema (remove optional fields, add fields) | Confluent Schema Registry docs | Confirmed, quoted verbatim |
| Full compatibility is both directions; transitive checks against every prior version, not just the last one | Confluent Schema Registry docs | Confirmed, quoted verbatim |
| Avro resolves a reader/writer schema mismatch by field name, falling back to a declared default | Apache Avro 1.11.1 Specification | Confirmed, quoted verbatim |
| Protobuf field numbers should never be reused; reuse makes wire-format decoding ambiguous | Protocol Buffers proto3 Language Guide | Confirmed, quoted verbatim |
| TopicNameStrategy, RecordNameStrategy, and TopicRecordNameStrategy derive a subject name differently, changing how many compatibility checks apply per topic | Confluent Schema Registry docs | Confirmed, quoted verbatim |
| A wire-format record carries a 4-byte schema id, not the whole schema | Confluent Schema Registry docs | Confirmed, quoted verbatim |
| Data-contract rules (quality checks, SLAs, ownership) layer on top of a schema-compatible evolution and catch things a schema check alone misses | CHAPTER.md; Chapter 3's `data-contract-specification` (used by reference, not yet built in this site) | Named, not independently re-sourced — consistent with CHAPTER.md's own "Leaves out" note |

## Red-team

- **Does "renaming a field is safe in Protobuf" actually appear as a quoted sentence?** No — it's
  stated in SOURCES.md as a direct consequence of the quoted field-number rules (Protobuf's wire
  format is keyed by number, not name), not as a second, separately quoted claim. The reel
  teaches it as a derived consequence, not an independent fact.
- **Is JSON Schema's "no native evolution model" overclaimed?** No — this is stated at the level
  CHAPTER.md itself specifies ("the registry layers its own compatibility rules on top"), without
  claiming a specific JSON Schema spec quote this session didn't fetch; the reel names this as a
  contrast point (weaker, convention-based checking) rather than citing a JSON Schema spec
  passage.
- **Is the data-contract clause under-sourced?** It's intentionally not re-sourced — CHAPTER.md's
  own "Leaves out" note says the full data-contract mechanics are Chapter 3 topic 22's territory,
  used by name here, not retaught or re-cited.

## Corrections

None. All claims trace to this topic's own three primary sources (Confluent, Avro, Protobuf) or
are named from already-scoped chapter material per CHAPTER.md's own "Leaves out" note.
