# Fact-check — de.debezium-architecture-event-model

## Claims against sources

1. **"Tested versions What the 3.7 series is tested against. Java 17+ for connectors; 21+ for
   Debezium Server, Operator, Outbox and Quarkus extension Kafka Connect 3.1 and later"**
   Source: Debezium docs, Release Series 3.7 (SOURCES.md quote 1). Direct match. Named only, per
   `pre-notes.md`'s own term list and `post-notes.md`'s Internals section.

2. **"Most commonly, you deploy Debezium by means of Apache Kafka Connect... Source connectors
   such as Debezium that send records into Kafka Sink connectors that propagate records from
   Kafka topics to other systems"**, **"Another way to deploy Debezium is by using the Debezium
   server... streams change events from a source database to a variety of messaging
   infrastructures,"** and **"Yet an alternative way for using the Debezium connectors is the
   Debezium engine... as a library embedded into your custom Java applications."**
   Source: Debezium docs, Architecture (SOURCES.md quotes 2-4). Direct match. These are the
   three deployment shapes this topic's own step 3 ("Reveal: three deployment shapes") states
   directly, named only since running any of the three needs a JVM and Kafka this sandbox
   doesn't have.

3. **"Change events can be serialized to different formats like JSON or Apache Avro and then
   will be sent to one of a variety of messaging infrastructures such as Amazon Kinesis, Google
   Cloud Pub/Sub, or Apache Pulsar."**
   Source: Debezium docs, Architecture (SOURCES.md quote 3). Direct match.

4. **"Redis (Stream)"** listed as a Debezium Server sink target.
   Source: Debezium docs, Store Debezium state / Debezium Server page (SOURCES.md quote 5).
   Direct match. Confirms the syllabus line's own "Redis" mention names a real, documented sink.

5. **"The event flattening SMT extracts the after field from a Debezium change event in a Kafka
   record. The SMT replaces the original change event with only its after field to create a
   simple Kafka record."**
   Source: Debezium docs, New Record State Extraction (SOURCES.md quote 6). Direct match.
   Measured directly: this topic's own hand-built `_unwrap` function reproduces exactly this
   mechanism, confirmed against a real rebuilt envelope in
   `unwrapping_keeps_only_after_and_drops_before_op_and_source_unless_added_back`.

6. **"Instead of dropping the record that contains the before row data, you can configure the
   event flattening SMT to do one of the following:"**
   Source: Debezium docs, New Record State Extraction (SOURCES.md quote 7). Direct match.
   Named only — this topic's own `add_metadata` parameter on `_unwrap` stands in for this
   configurable option.

7. **"Configure the connector to use upsert mode so that data written to the sink database is
   idempotent, and replaying an event always produces the same final row state."**
   Source: Debezium docs, JDBC sink connector (SOURCES.md quote 8). Direct match. Measured
   directly: `applying_the_unwrapped_envelope_via_upsert_is_idempotent_on_replay` applies the
   identical record twice via a real `INSERT ... ON CONFLICT DO UPDATE` and confirms the row's
   final state and row count are unchanged by the replay.

8. **"If you want to the connector to remove rows, you must explicitly set delete.enabled=true
   in the connector configuration."**
   Source: Debezium docs, JDBC sink connector (SOURCES.md quote 9). Direct match. Named only in
   `post-notes.md`'s Internals section.

9. **"When schema.evolution is set to basic, the connector automatically creates or alters the
   destination database table according to the structure of the incoming event."**
   Source: Debezium docs, JDBC sink connector (SOURCES.md quote 10). Direct match. Named only.

10. **"The name of the Kafka topic where source connector offsets are stored"**
    Source: Confluent docs, Kafka Connect configuration reference, substituting for the
    unreadable Apache Kafka page (SOURCES.md quote 11). Direct match. Named only, tying the
    Kafka Connect deployment shape back to topic 18's own offset-storage measurement.

## Predict questions red-teamed

- **Step 2** ("read against insert"): the wrong option claims column values alone are enough
  to tell a re-snapshot read apart from an insert. Checked against the measured `_unwrap`
  function directly: its own output never carries anything derived from `op`, so the
  information needed to distinguish the two cases is structurally absent from the unwrapped
  record, not merely difficult to infer.

- **Step 10** ("Prove it"): the wrong option claims a sink stays consistent under replay
  regardless of insert mode. Checked against the JDBC sink connector's own documentation
  directly: idempotence is tied explicitly to upsert mode being configured, and this topic's
  own measured proof in step 8 demonstrates the mechanism — an upsert that updates an existing
  key rather than inserting a duplicate — that a plain insert-only mode simply does not have.

## Scope check against CHAPTER.md / syllabus

The raw syllabus line for this topic splits at its own semicolons into four clauses: Debezium
3.x and its three deployment shapes; the change-event envelope; single-message transforms; and
the JDBC sink connector. All four are covered — the first by direct quotation of Debezium's
own architecture and release documentation (since running any of the three shapes needs a JVM
and Kafka this sandbox doesn't have), the second and third by direct measurement against this
sandbox's own PostgreSQL cluster's logical-decoding primitives and a hand-built envelope and
unwrap function, and the fourth by a real upsert applied to a real sink table. No claim here
depends on the transactional outbox router (topic 20), Flink CDC (topic 21), landing in table
formats (topic 22), each engine's own capture mechanism (topics 10-11), Kafka internals
(Chapter 9), or Kafka Connect exactly-once (topic 18), all named in "Leaves out."
