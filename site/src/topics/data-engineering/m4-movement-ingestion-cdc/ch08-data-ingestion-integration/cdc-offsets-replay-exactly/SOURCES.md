# Sources — de.cdc-offsets-replay-exactly

## KIP-618: Exactly-Once Support for Source Connectors

URL: https://cwiki.apache.org/confluence/display/KAFKA/KIP-618%3A+Exactly-Once+Support+for+Source+Connectors
Fetched: 2026-11-01.

Quotes:
> In order to support exactly-once delivery guarantees for source connectors, the framework should be expanded to atomically write source records and their source offsets to Kafka, and to prevent zombie tasks from producing data to Kafka.

> exactly.once.source.support STRING disabled HIGH Whether to enable exactly-once support for source connectors in the cluster by writing source records and their offsets in a Kafka transaction, and by proactively fencing out old task generations before bringing up new ones.

Items: the atomic-write-plus-fencing design this topic names as Kafka Connect's own exactly-once
source support, and the configuration property this topic's own narration and reel quote by name.

## Debezium docs: Exactly-once delivery (EOS)

URL: https://debezium.io/documentation/reference/stable/configuration/eos.html
Fetched: 2026-11-01.

Quotes:
> Currently, Debezium does not implement an internal deduplication layer to enforce exactly-once semantics.

> it remains unclear whether the implementation is fully correct or if there are edge cases where exactly-once semantics might be violated.

> two Jepsen reports, one for Redpanda and another for Bufstream

> Debezium provides at-least-once delivery guarantees.

> The following Debezium source connectors support participation in Kafka Connect's exactly-once delivery: MariaDB MongoDB MySQL Oracle PostgreSQL SQL Server

> several related issues in Apache Kafka remain open: KAFKA-17734 KAFKA-17754 KAFKA-17582 Because Kafka Connect exactly-once delivery relies on Kafka transactions, it's reasonable to assume that these issues might also affect Kafka Connect's exactly-once guarantees.

Items: the explicit no-dedup-layer statement and the documented doubt about correctness, with its
Jepsen and open-issue citations, that this topic's own naive-vs-deduping consumer measurement
exists to make concrete, and the connector support list named directly.

## Debezium docs: PostgreSQL connector — Behavior when things go wrong

URL: https://debezium.io/documentation/reference/stable/connectors/postgresql.html
Fetched: 2026-11-01 (already fetched for topics 16–17; re-used here for this clause).

Quotes:
> Debezium provides exactly once delivery of every change event record. If a fault does happen then the system does not lose any events. However, while it is recovering from the fault, it's possible that the connector might emit some duplicate change events. In these abnormal situations, Debezium, like Kafka, provides at least once delivery of change events.

Items: the at-least-once-by-default statement this topic's own crash-and-replay measurement
makes concrete on a real decoded stream.

## Confluent docs: Kafka Connect configuration reference (substituting for an unreadable Apache Kafka page)

URL: https://docs.confluent.io/platform/current/installation/configuration/connect/
Fetched: 2026-11-01.

Note: CHAPTER.md names Kafka's own Connect user guide as this clause's source, but, as with
earlier topics in this chapter, kafka.apache.org serves only a client-rendered redirect shell to
a plain fetch — confirmed directly, the same way, before substituting this source. Confluent's
own configuration reference documents the identical Kafka Connect worker properties in plain,
readable HTML, and is used here in its place, disclosed rather than hidden.

Quotes:
> Whether to enable exactly-once support for source connectors in the cluster by using transactions to write source records and their source offsets, and by proactively fencing out old task generations before bringing up new ones.To enable exactly-once source support on a new cluster, set this property to 'enabled'. To enable support on an existing cluster, first set to 'preparing' on every worker in the cluster, then set to 'enabled'. A rolling upgrade may be used for both changes.

Items: the two-rolling-upgrade enablement path for an existing cluster (`preparing` then
`enabled`) that this topic's own narration and reel describe.

## Confluent docs: Kafka sink connector configuration reference

URL: https://docs.confluent.io/platform/current/installation/configuration/connect/sink-connect-configs.html
Fetched: 2026-11-01.

Quotes:
> Behavior for tolerating errors during connector operation. 'none' is the default value and signals that any error will result in an immediate connector task failure; 'all' changes the behavior to skip over problematic records.

Items: named only — the separate, unrelated failure-tolerance knob CHAPTER.md's Sources line
also names for this clause, kept distinct from the offset-commit behaviour this topic measures.

## PostgreSQL 18 documentation: Logical Decoding Concepts

URL: https://www.postgresql.org/docs/18/logicaldecoding-explanation.html
Fetched: 2026-11-01.

Quotes:
> A logical slot will emit each change just once in normal operation. The current position of each slot is persisted only at checkpoint, so in the case of a crash the slot might return to an earlier LSN, which will then cause recent changes to be sent again when the server restarts. Logical decoding clients are responsible for avoiding ill effects from handling the same message more than once.

Items: the exact repeated-delivery mechanism (position persisted only at checkpoint, a crash
rewinds it, the client is responsible for the consequences) that this topic's own
`a_crash_before_the_periodic_offset_commit_replays_already_produced_records` measures directly
with `pg_logical_slot_peek_changes` standing in for an unadvanced position.
