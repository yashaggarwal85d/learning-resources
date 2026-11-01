# Sources — de.ordering-transaction-boundaries

## Debezium docs: PostgreSQL connector ("Transaction metadata")

URL: https://debezium.io/documentation/reference/stable/connectors/postgresql.html
Fetched: 2026-11-01.

Quotes:
> For every transaction BEGIN and END, Debezium generates an event that contains the following fields: status BEGIN or END. id String representation of the unique transaction identifier composed of Postgres transaction ID itself and LSN of given operation separated by colon, i.e. the format is txID:LSN.

> event_count (for END events) Total number of events emmitted by the transaction. data_collections (for END events) An array of pairs of data_collection and event_count elements that indicates the number of events that the connector emits for changes that originate from a data collection.

> Debezium registers and receives metadata only for transactions that occur after you deploy the connector. Metadata for transactions that occur before you deploy the connector is not available.

Items: the exact `txID:LSN` identity, `event_count` and `data_collections` fields this topic's
own `transaction_metadata_lets_a_consumer_reassemble_the_commit` builds directly from the slot's
own real `xid` and `lsn` columns, never parsed out of decoded text.

## Debezium docs: PostgreSQL connector ("Change event keys")

URL: https://debezium.io/documentation/reference/stable/connectors/postgresql.html
Fetched: 2026-11-01 (reused from this fetch; appears earlier on the same connector page).

Quotes:
> For a given table, the change event's key has a structure that contains a field for each column in the primary key of the table at the time the event was created.

Items: the primary-key-based change-event key this topic's own per-key ordering measurement
reproduces directly, keying each decoded change by the source row's own primary key.

## PostgreSQL docs: Logical Decoding Concepts

URL: https://www.postgresql.org/docs/current/logicaldecoding-explanation.html
Fetched: 2026-11-01.

Quotes:
> A logical slot will emit each change just once in normal operation.

Items: named alongside this topic's own measured confirmation that nothing is emitted until
commit (`uncommitted_changes_are_never_emitted`).

## PostgreSQL docs: Logical Decoding Output Plugin Callbacks

URL: https://www.postgresql.org/docs/18/logicaldecoding-output-plugin.html
Fetched: 2026-11-01.

Quotes:
> An output plugin may also define functions to support streaming of large, in-progress transactions. The stream_start_cb, stream_stop_cb, stream_abort_cb, stream_commit_cb, and stream_change_cb are required, while stream_message_cb and stream_truncate_cb are optional.

Items: the streaming-of-in-progress-transactions callback interface, named only — this
sandbox's `test_decoding` plugin is exercised throughout this topic without enabling that
option, since CHAPTER.md names it as something "a CDC consumer must understand it may be
handed," not something this topic builds.

## PostgreSQL 14 Release Notes

URL: https://www.postgresql.org/docs/release/14.0/
Fetched: 2026-11-01.

Quotes:
> Previously transactions that exceeded logical_decoding_work_mem were written to disk until the transaction completed. Enhance the logical replication API to allow streaming large in-progress transactions (Tomas Vondra, Dilip Kumar, Amit Kapila)

Items: the PostgreSQL 14 addition that lets a long in-progress transaction's changes stream to a
subscriber before that transaction commits — named only, not exercised, since enabling it needs
an output plugin built against the `stream_*` callbacks, which `test_decoding` does not use by
default in this topic's own measurements.
