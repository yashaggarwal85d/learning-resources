# Fact-check — de.ordering-transaction-boundaries

## Claims against sources

1. **"For every transaction BEGIN and END, Debezium generates an event that contains... id
   String representation of the unique transaction identifier composed of Postgres transaction
   ID itself and LSN of given operation separated by colon, i.e. the format is txID:LSN."**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 1). Direct match. Reproduced by
   construction, not merely quoted: `transaction_metadata_lets_a_consumer_reassemble_the_commit`
   builds `transaction_id = f"{xid}:{lsn}"` directly from the slot's own real `lsn` and `xid`
   columns, confirming `":" in txn["id"]`.

2. **"event_count (for END events) Total number of events emmitted by the transaction.
   data_collections (for END events) An array of pairs of data_collection and event_count
   elements that indicates the number of events that the connector emits for changes that
   originate from a data collection."**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 2). Direct match. Measured
   directly: the same function asserts `txn["event_count"] == 4` and
   `txn["data_collections"] == {orders_fqn: 1, items_fqn: 3}` against a real one-commit,
   one-order/three-items transaction.

3. **"Debezium registers and receives metadata only for transactions that occur after you
   deploy the connector. Metadata for transactions that occur before you deploy the connector
   is not available."**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 3). Direct match. Named only in
   `post-notes.md`'s Internals section — this topic's own slot is always created before any
   transaction it measures, so the deploy-time limitation is disclosed, not exercised.

4. **"For a given table, the change event's key has a structure that contains a field for each
   column in the primary key of the table at the time the event was created."**
   Source: Debezium docs, PostgreSQL connector, "Change event keys" (SOURCES.md quote 4). Direct
   match. Reproduced by construction: `per_key_order_survives_when_the_stream_is_split_by_key`
   keys every decoded change by the source row's own primary key (`id`) and confirms each key's
   own queue lists its three values in exactly commit order, regardless of how the keys were
   interleaved in the source stream.

5. **"A logical slot will emit each change just once in normal operation."**
   Source: PostgreSQL docs, Logical Decoding Concepts (SOURCES.md quote 5). Direct match. Named
   alongside the stronger, directly measured fact this topic needs: nothing is emitted at all
   until commit, confirmed by `uncommitted_changes_are_never_emitted`, which shows an uncommitted
   insert returning `[]` from a second connection's own read of the slot.

6. **"An output plugin may also define functions to support streaming of large, in-progress
   transactions. The stream_start_cb, stream_stop_cb, stream_abort_cb, stream_commit_cb, and
   stream_change_cb are required, while stream_message_cb and stream_truncate_cb are optional."**
   Source: PostgreSQL docs, Logical Decoding Output Plugin Callbacks (SOURCES.md quote 6).
   Direct match. Named only in `post-notes.md`'s Frontier section — this sandbox's own
   `test_decoding` plugin is exercised throughout without enabling this option, since
   CHAPTER.md names it as something a CDC consumer must understand it may be handed, not
   something this topic builds.

7. **"Previously transactions that exceeded logical_decoding_work_mem were written to disk until
   the transaction completed. Enhance the logical replication API to allow streaming large
   in-progress transactions."**
   Source: PostgreSQL 14 Release Notes (SOURCES.md quote 7). Direct match. Named only, for the
   same reason as quote 6 — enabling it needs an output plugin this topic's own measurements
   don't use.

## Predict questions red-teamed

- **Step 2** ("does order break the same way"): the wrong option claims a cross-table commit
  breaks the same way a single row's own changes would. Checked against both Debezium's own
  change-event-key documentation and the measured per-key proof directly: a single row's own
  changes carry an explicit key tying them together; a transaction spanning two tables has no
  equivalent key once its changes are split into two separate per-table streams.

- **Step 10** ("whose job is it to make that transaction atomic again"): the wrong option claims
  Kafka's own per-topic ordering already covers a multi-topic transaction. Checked against both
  Kafka's own documented partition-ordering scope (used by name, owned by Chapter 9 topic 7) and
  the measured orphan-join proof directly: Kafka's guarantee holds only inside one partition,
  never across the two separate topics a two-table commit was split into, so recovering that
  transaction's atomicity is bookkeeping the consumer does for itself.

## Scope check against CHAPTER.md / syllabus

The full syllabus line for this topic splits at its own semicolons into four clauses: per-key
order via primary-key partitioning, loss of cross-table and cross-partition order, transaction
metadata to reassemble transactions downstream, and what "exactly-once" means when a transaction
spans many topics. All four are covered by direct measurement against this sandbox's own
PostgreSQL 16 cluster, confirmed by running the full syllabus-line substring check
(`coverage.json`'s `syllabus` array leaves nothing uncovered). No claim here depends on Kafka's
own partition-ordering guarantee (Chapter 9 topic 7, used by name only), Kafka transactions
(Chapter 9 topic 11), the delivery guarantee and offsets of CDC (topic 18), or event time and
watermarks in stream processing (Chapter 9 topic 17), all named in "Leaves out."
