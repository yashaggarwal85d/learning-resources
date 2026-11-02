# Fact-check — de.query-based-vs-log

## Claims against sources

1. **"Logical decoding is the process of extracting all persistent changes to a database's
   tables into a coherent, easy to understand format."**
   Source: PostgreSQL docs, Logical Decoding Concepts (SOURCES.md quote 1). Direct match. This
   topic's own measurements read exactly this: `pg_create_logical_replication_slot` with the
   `test_decoding` plugin, then `pg_logical_slot_get_changes` against the sandbox's real
   PostgreSQL 16 cluster, not a simulation of the mechanism.

2. **"PostgreSQL normally purges write-ahead log (WAL) segments after some period of time. This
   means that the connector does not have the complete history of all changes."**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 2). Direct match. Used only to
   name the "operationally coupled to the source" cost (step 10); this topic does not measure
   WAL retention or slot pinning directly, since that is topic 12's own lab subject, and says so
   in "Leaves out."

3. **"A poll reports the state it happens to catch — a log reports every state a row passed
   through, in order."**
   Measured directly: `polling_misses_intermediate_states` runs four real statements against
   order `900001` (insert, then three status updates) and shows a single `SELECT` sees only
   `refunded`, while a real logical replication slot's own decoded changes list all four states
   in commit order (`new`, `paid`, `shipped`, `refunded`).

4. **"A poll can't tell a row that never existed from one that existed and was deleted — the log
   always can."**
   Measured directly: `polling_misses_deletes` inserts and deletes order `900002` inside the
   same interval; a watermark-based poll query finds zero rows (identical to what it would find
   if the row had simply never existed), while the real replication slot shows exactly one
   `DELETE` event for that id.

5. **"A trigger doubles every write it captures — the log captures the identical changes for
   free, from WAL the server already wrote."**
   Measured directly: `trigger_based_capture_write_amplification` creates a real `AFTER INSERT
   OR UPDATE` trigger on `orders`, applies four real writes to order `900003`, and counts
   exactly four corresponding rows written to the shadow table by the trigger — a one-to-one,
   not a one-to-many, write amplification, confirmed as exactly double the base write volume.

6. **Log read cost scales with the number of changes, not the size of the table.**
   Measured directly: `log_read_cost_is_proportional_to_changes_not_table_size` compares the
   real `orders` table's full row count (over fifty thousand rows) against three real changes
   made to one test row; the replication slot returns exactly three change events, regardless
   of how large the table being watched actually is.

## Predict questions red-teamed

- **Step 2** ("does a trigger-based shadow table see the intermediate states a poll misses"):
  the wrong option claims a trigger only fires on a transaction's final state, confusing
  per-statement and per-transaction firing. Checked against PostgreSQL's own trigger semantics
  and against `trigger_based_capture_write_amplification`'s own measurement: an `AFTER UPDATE`
  trigger fires once per row-affecting statement, inside that statement's own transaction, which
  is exactly how four separate updates to the same row produce four separate shadow-table rows,
  not one.

- **Step 10** ("what reading the log costs that polling and triggers don't"): the wrong option
  claims reading WAL is entirely free. Checked against the Debezium quote directly: WAL is
  purged after a retention window, so a consumer's own position in that log (a slot) is a real,
  ongoing cost — it pins storage on the source for as long as the consumer hasn't caught up,
  which is exactly the trade `CHAPTER.md` hands to topic 12's own slot-retention incident.

## Scope check against CHAPTER.md / syllabus

The raw syllabus line (`syllabus/data-engineering.md` §8.2) splits into three clauses: polling
and triggers (load, missed deletes, missed intermediate states, write amplification); reading
the replication log (complete, ordered, low overhead); operationally coupled to the source. All
three are covered by direct measurement or, for the coupling cost, by direct quotation of the
mechanism's own documented limit. No claim here depends on topic 10's engine-specific internals
(WAL structure, slots, output plugins, `REPLICA IDENTITY`) or topic 12's slot-retention incident,
both named in "Leaves out" and left untaught here.
