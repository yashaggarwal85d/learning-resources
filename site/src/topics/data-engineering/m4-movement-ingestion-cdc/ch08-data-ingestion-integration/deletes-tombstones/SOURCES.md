# Sources — de.deletes-tombstones

## Debezium docs: event flattening (New Record State Extraction)

URL: https://debezium.io/documentation/reference/stable/transformations/event-flattening.html
Fetched: 2026-11-01.

Quotes:
> A database DELETE operation causes Debezium to generate two Kafka records: A record that contains "op": "d", the before row data, and some other fields. A tombstone record that has the same key as the deleted row and a value of null. This record is a marker for Apache Kafka. It indicates that log compaction can remove all records that have this key.

> drop The SMT removes both the DELETE event and TOMBSTONE from the stream.

> Keep the record in the stream and edit it to have a value field that contains the key/value pairs that were in the before field with an added "__deleted": "true" entry.

Items: the exact two-record structure of a Debezium delete this topic's own
`a_postgres_delete_decodes_with_a_before_image` names directly, and the drop/tombstone/rewrite
handling modes this topic's own hand-built flattening logic reproduces.

## Confluent docs: Kafka log compaction (substituting for an unreadable Apache Kafka page)

URL: https://docs.confluent.io/kafka/design/log_compaction.html
Fetched: 2026-11-01.

Note: CHAPTER.md names the Apache Kafka 4.4 "Design" page as this clause's own source, but, as
with an earlier topic in this chapter, kafka.apache.org serves only a client-rendered redirect
shell to a plain fetch — confirmed directly, the same way, before substituting this source.
Confluent's own design documentation covers the identical log-compaction mechanism in plain,
readable HTML, and is used here in its place, disclosed rather than hidden.

Quotes:
> A message with a key and a null payload (note that a string value of null is not sufficient) will be treated as a delete from the log.

> Additionally, all delete markers for deleted records will be seen, provided the consumer reaches the head of the log in a time period less than the topic's delete.retention.ms setting (the default is 24 hours).

> In other words: since the removal of delete markers happens concurrently with reads, it is possible for a consumer to miss delete markers if it lags by more than delete.retention.ms.

Items: the tombstone definition and the retention-window race this topic's own hand-built
compaction and late-consumer measurement reproduces directly.

## Debezium docs: JDBC sink connector

URL: https://debezium.io/documentation/reference/stable/connectors/jdbc.html
Fetched: 2026-11-01.

Quotes:
> delete.enabled false Specifies whether the connector processes DELETE or tombstone events and removes the corresponding row from the database.

Items: named only — the real sink setting a consumer needs to actually remove a row, which
this topic's own hand-built sink logic stands in for, since running the actual JDBC sink
connector needs a JVM and Kafka this sandbox doesn't have.

## Debezium docs: PostgreSQL connector

URL: https://debezium.io/documentation/reference/stable/connectors/postgresql.html
Fetched: 2026-11-01.

Quotes:
> In this example, the before field contains only the primary key column because the table's REPLICA IDENTITY setting is DEFAULT.

> tombstones.on.delete true Controls whether a delete event is followed by a tombstone event.

Items: the exact `REPLICA IDENTITY` tie-back to topic 10 this topic's own measurement confirms
directly (a delete's before-image under `DEFAULT` carries only the key, under `FULL` the whole
row), and the connector-level setting named alongside it.
