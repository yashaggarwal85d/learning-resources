# Outline — Schema Registry and compatibility modes

1. **Hook: a field removed, a dashboard broken three days later.** A producer removes a field it
   believes is unused, under backward-only compatibility, which silently permits it; consumers
   that still read that field see nulls until a dashboard breaks three days later.
2. **Setup: a schema registry is the contract.** A replay trusts a record's fields still mean
   what they meant when written. A registry is the mechanism that's supposed to guarantee that,
   across every producer and consumer ever deployed against a topic.
3. **Predict: would full-transitive have caught it?** Same evolution, checked under a stricter
   mode instead of backward-only. (predict)
4. **Reveal: backward, forward, full, transitive.** The four modes, defined by which direction of
   compatibility they check and how many prior versions.
5. **Reveal: the same evolution, two different gates.** Removing a field passes backward
   (consumers ignore what they don't look for) but a different evolution — adding a required
   field — fails it; the specific gate matters.
6. **Predict: which format detects a reused field number?** Avro, Protobuf, and JSON Schema,
   given the same evolution (renaming a field). (predict)
7. **Reveal: three formats, three different native behaviors.** Avro resolves by field name with
   defaults; Protobuf resolves by field number, so renaming is safe but reuse is not; JSON Schema
   has no native evolution model at all — the registry layers its own rules on top.
8. **Reveal: subject-naming strategies, and schema ids in the wire.** TopicNameStrategy, RecordNameStrategy,
   and TopicRecordNameStrategy change how many compatibility checks apply to one topic; a wire
   record carries a small schema id, not the whole schema.
9. **Prove it.** Every figure comes from this topic's own real run: the compatibility checker,
   the field-number-reuse check, the wire-format round trip, and the subject-naming comparison.
10. **Recap.** Pick the compatibility mode for the upgrade order, know what each format actually
    permits, pick a naming strategy, and know what a data contract adds beyond a schema check.

Predict steps: 3 and 6 (first one within the first four steps). Takeaways planned on steps 5, 7,
and 8 (≥3, none on the step immediately after a predict step).
