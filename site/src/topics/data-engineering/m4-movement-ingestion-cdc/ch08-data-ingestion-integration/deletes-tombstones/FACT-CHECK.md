# Fact-check — de.deletes-tombstones

## Claims against sources

1. **"A database DELETE operation causes Debezium to generate two Kafka records: A record that
   contains 'op': 'd', the before row data... A tombstone record that has the same key as the
   deleted row and a value of null. This record is a marker for Apache Kafka. It indicates that
   log compaction can remove all records that have this key."**
   Source: Debezium docs, event flattening (SOURCES.md quote 1). Direct match. This topic's own
   `_compact` function reproduces the exact consequence: once the tombstone's own later offset
   exists for a key, the earlier delete-event record is excluded from the compacted output.

2. **"drop The SMT removes both the DELETE event and TOMBSTONE from the stream."** and **"...an
   added '__deleted': 'true' entry."**
   Source: Debezium docs, event flattening (SOURCES.md quotes 2-3). Direct match. Named only in
   `post-notes.md`'s Internals section — this topic's own hand-written `applying_a_delete...`
   function models the drop-and-reapply outcome directly via its own `op` field rather than
   Debezium's own SMT implementation.

3. **"A message with a key and a null payload... will be treated as a delete from the log."**
   Source: Confluent docs, log compaction, substituting for the unreadable Apache Kafka page
   (SOURCES.md quote 4). Direct match. Reproduced by construction: `_compact`'s own records use
   `value: None` as exactly this tombstone representation.

4. **"...provided the consumer reaches the head of the log in a time period less than the
   topic's delete.retention.ms setting (the default is 24 hours)."**
   Source: Confluent docs, log compaction (SOURCES.md quote 5). Direct match. Measured directly:
   `a_lagging_consumer_misses_the_delete_and_resurrects_the_row` uses the identical 24-hour
   default as its own `retention` constant and confirms the tombstone survives compaction one
   second before that window closes.

5. **"...it is possible for a consumer to miss delete markers if it lags by more than
   delete.retention.ms."**
   Source: Confluent docs, log compaction (SOURCES.md quote 6). Direct match. Measured directly:
   the same function confirms the tombstone is entirely absent from the compacted output one
   second after the window closes, and that a consumer resuming at that point never corrects its
   own stale state.

6. **"delete.enabled... Specifies whether the connector processes DELETE or tombstone events and
   removes the corresponding row from the database."**
   Source: Debezium docs, JDBC sink connector (SOURCES.md quote 7). Direct match. Named only in
   `post-notes.md`'s Internals section — this topic's own real `MERGE` statement against a real
   PostgreSQL landing table stands in for the real sink setting, since running the actual JDBC
   sink connector needs a JVM and Kafka this sandbox doesn't have.

7. **"...the before field contains only the primary key column because the table's REPLICA
   IDENTITY setting is DEFAULT."**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 8). Direct match. Measured
   directly: `a_delete_decodes_with_a_before_image_that_tracks_replica_identity` confirms the
   identical delete carries only the key under `DEFAULT` and the whole row under `FULL`.

8. **"tombstones.on.delete... Controls whether a delete event is followed by a tombstone
   event."**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 9). Direct match. Named only,
   alongside the two-record structure quote 1 already covers.

## Predict questions red-teamed

- **Step 2** ("kept by compaction"): the wrong option claims compaction keeps both of a delete's
  two records. Checked against both the documentation's own "keep only the latest" framing and
  the measured `_compact` function directly: the function's own logic has no branch that treats
  a delete-event record specially, so it is structurally excluded the moment a newer record
  (the tombstone) exists for the same key, regardless of what either record contains.

- **Step 10** ("bounded by what"): the wrong option claims a source's own log retention is the
  number that matters. Checked against the measured retention-race proof directly: once a delete
  has already become a tombstone in a Kafka topic, the source database's own retention setting
  no longer governs anything about that key — only the topic's own `delete.retention.ms` does.

## Scope check against CHAPTER.md / syllabus

The raw syllabus line for this topic splits at its own semicolons into four clauses: delete
events with before-images versus Kafka tombstones that let compaction drop the key; soft versus
hard deletes; carrying deletes into table formats via `MERGE`/delete files; and the
delete-retention window race. All four are covered — the first and third by direct measurement
against this sandbox's own PostgreSQL cluster (the before-image proof, the real `MERGE`), the
second by a direct cursor-query measurement, and the fourth by a hand-built model that
implements Kafka's own documented compaction rule exactly. No claim here depends on the log
cleaner's own mechanics (Chapter 9 topic 6), the delete-file formats and deletion vectors
(Chapter 6), erasure as a legal duty (Chapter 13), or how a landing table applies the merge
(topic 22), all named in "Leaves out."
