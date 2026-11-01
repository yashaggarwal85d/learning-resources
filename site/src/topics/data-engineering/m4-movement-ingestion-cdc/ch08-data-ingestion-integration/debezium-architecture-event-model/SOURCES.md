# Sources — de.debezium-architecture-event-model

## Debezium docs: Release Series 3.7

URL: https://debezium.io/releases/3.7/
Fetched: 2026-11-01.

Quotes:
> Tested versions What the 3.7 series is tested against. Java 17+ for connectors; 21+ for Debezium Server, Operator, Outbox and Quarkus extension Kafka Connect 3.1 and later

Items: the Java-version split across deployment shapes, and the latest-stable release this
topic names.

## Debezium docs: Architecture

URL: https://debezium.io/documentation/reference/stable/architecture.html
Fetched: 2026-11-01.

Quotes:
> Most commonly, you deploy Debezium by means of Apache Kafka Connect. Kafka Connect is a framework and runtime for implementing and operating: Source connectors such as Debezium that send records into Kafka Sink connectors that propagate records from Kafka topics to other systems

> Another way to deploy Debezium is by using the Debezium server. The Debezium server is a configurable, ready-to-use application that streams change events from a source database to a variety of messaging infrastructures.

> Change events can be serialized to different formats like JSON or Apache Avro and then will be sent to one of a variety of messaging infrastructures such as Amazon Kinesis, Google Cloud Pub/Sub, or Apache Pulsar.

> Yet an alternative way for using the Debezium connectors is the Debezium engine. In this case, Debezium will not be run via Kafka Connect, but as a library embedded into your custom Java applications.

Items: the three deployment shapes this topic's own Outcomes line asks a reader to choose
between: Kafka Connect, Debezium Server, and the embedded Debezium Engine.

## Debezium docs: Store Debezium state (Debezium Server page, for the Redis Stream sink)

URL: https://debezium.io/documentation/reference/stable/operations/debezium-server.html
Fetched: 2026-11-01.

Quotes:
> Redis (Stream)

Items: confirms Redis Stream as one of Debezium Server's own documented sink targets,
alongside the Kinesis/Pub/Sub/Pulsar sinks the Architecture page names.

## Debezium docs: New Record State Extraction (event flattening)

URL: https://debezium.io/documentation/reference/stable/transformations/event-flattening.html
Fetched: 2026-11-01 (already fetched for topic 17; re-used here for this clause).

Quotes:
> The event flattening SMT extracts the after field from a Debezium change event in a Kafka record. The SMT replaces the original change event with only its after field to create a simple Kafka record.

> Instead of dropping the record that contains the before row data, you can configure the event flattening SMT to do one of the following:

Items: the unwrap transform's own mechanism this topic's own hand-built `_unwrap` function
reproduces directly, and the cost of unwrapping (the before record dropped unless kept).

## Debezium docs: JDBC sink connector

URL: https://debezium.io/documentation/reference/stable/connectors/jdbc.html
Fetched: 2026-11-01 (already fetched for topic 17; re-used here for this clause).

Quotes:
> Configure the connector to use upsert mode so that data written to the sink database is idempotent, and replaying an event always produces the same final row state.

> If you want to the connector to remove rows, you must explicitly set delete.enabled=true in the connector configuration.

> When schema.evolution is set to basic, the connector automatically creates or alters the destination database table according to the structure of the incoming event.

Items: the exact idempotent-upsert claim this topic's own measured sink-replay function
confirms directly, and `delete.enabled`/`schema.evolution` named alongside it.

## Confluent docs: Kafka Connect configuration reference (substituting for an unreadable Apache Kafka page)

URL: https://docs.confluent.io/platform/current/installation/configuration/connect/
Fetched: 2026-11-01 (already fetched for topic 18; re-used here for the Connect user guide
clause CHAPTER.md's own Sources line also names for this topic).

Note: CHAPTER.md names Kafka's own Connect user guide as a source for this topic too, but, as
with earlier topics in this chapter, kafka.apache.org serves only a client-rendered redirect
shell to a plain fetch — confirmed directly, the same way, before substituting this source.

Quotes:
> The name of the Kafka topic where source connector offsets are stored

Items: named only — the same offset-storage mechanism topic 18 measured, referenced here only
for the Kafka Connect deployment shape's own operational detail.
