# Fact-check — de.transactional-outbox-pattern

## Claims against sources

1. **"id Contains the unique ID of the event. In an outbox message, this value is a header. You
   can use this ID, for example, to remove duplicate messages."**
   Source: Debezium docs, Outbox Event Router (SOURCES.md quote 1). Direct match. Measured
   directly: `the_outbox_router_routes_by_aggregatetype_and_uses_id_for_dedup` confirms each
   decoded outbox row's own `id` column is available as the `dedup_key` a hand-built router
   function returns.

2. **"aggregatetype Contains a value that the SMT appends to the name of the topic... in a
   default configuration, the route.by.field SMT option is set to aggregatetype and the
   route.topic.replacement SMT option is set to outbox.event.${routedByValue}."**
   Source: Debezium docs, Outbox Event Router (SOURCES.md quotes 2-3). Direct match. Measured
   directly: the same function confirms two real decoded rows of different `aggregatetype`
   values route to `outbox.event.order` and `outbox.event.shipment` respectively.

3. **"The SMT automatically filters out DELETE operations on an outbox table."**
   Source: Debezium docs, Outbox Event Router (SOURCES.md quote 4). Direct match. Measured
   directly: `cleanup_deletes_old_outbox_rows_invisibly_once_the_slot_has_already_captured_them`
   confirms a real decoded DELETE on the outbox table produces zero routed events, since the
   hand-built router only ever routes insert-kind rows.

4. **"A message event captures a generic logical decoding message that is written directly to
   the WAL by using the pg_logical_emit_message function."**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 5). Direct match. Named only
   in `post-notes.md`'s Internals section — the table-free variant CHAPTER.md names alongside
   the table-based router this topic's own measured example uses.

5. **"Emits a logical decoding message. This can be used to pass generic messages to logical
   decoding plugins through WAL."**
   Source: PostgreSQL 18 docs, System Administration Functions (SOURCES.md quote 6). Direct
   match. Named only, confirming the underlying function Debezium's own message-event
   mechanism is built on.

6. **"The Outbox extension's goal is to provide a Quarkus application with a reusable, highly
   configurable component that facilitates the use of the Outbox pattern paired with Debezium's
   CDC connector pipeline..."**
   Source: Debezium docs, Outbox Quarkus Extension (SOURCES.md quote 7). Direct match. Named
   only — a third, library-based way teams actually write to an outbox, alongside the SMT and
   the message-based variant.

## Predict questions red-teamed

- **Step 2** ("is the event recoverable"): the wrong option claims the database still knows the
  publish is owed. Checked against the measured mechanism directly: the decoded stream after
  the crash contains zero outbox inserts, confirming nothing was ever written anywhere that
  could later be consulted to notice, let alone recover, the missing announcement.

- **Step 10** ("Prove it"): the wrong option claims the router's own delete-filtering makes
  cleanup timing irrelevant. Checked against the measured cleanup function directly: filtering
  protects only against a delete itself leaking through as a fake event, which is entirely
  separate from whether the row's own insert was captured by the slot before the row was
  removed — a risk the delete-filtering behavior does nothing to address.

## Scope check against CHAPTER.md / syllabus

The raw syllabus line for this topic splits at its own single semicolon into two clauses:
avoiding dual writes via an outbox table and the outbox event router; and ordering, payload
design, outbox cleanup, and why it beats application-level publish-after-commit. Both are
covered — the first by direct measurement of the dual-write crash, its outbox fix, and the
router's own routing and dedup behavior against this sandbox's own PostgreSQL cluster, and the
second by direct measurement of ordering across interleaved aggregates and cleanup safety
relative to slot capture. No claim here depends on the Debezium router's full options beyond
what the pattern needs (named only, per CHAPTER.md's own "Leaves out"), consumer-side
deduplication or Kafka transactions (Chapter 9 topics 13 and 11), sagas and durable execution
(Chapter 11), or the CDC machinery of topics 10-19, all named in "Leaves out."
