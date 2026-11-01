Last verified: 1 November 2026. The dual-write-loss proof, the outbox fix, the routing and
dedup measurement, the ordering measurement, and the cleanup-safety measurement
(`examples.py`) are direct runs against this sandbox's own real PostgreSQL 16 cluster, using a
real hand-built outbox table read by a real test_decoding consumer. Debezium's own Outbox Event
Router implementation, the `pg_logical_emit_message` table-free variant, and the Quarkus outbox
extension are quoted from their own documentation rather than reproduced, since running any of
them needs a JVM and Kafka this sandbox doesn't have.

- Debezium docs, Outbox Event Router: [debezium.io](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html). The default columns, id-based dedup, aggregatetype routing, and DELETE filtering.
- Debezium docs, PostgreSQL connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/postgresql.html). Logical decoding message events, named only.
- PostgreSQL 18 docs, System Administration Functions: [postgresql.org](https://www.postgresql.org/docs/18/functions-admin.html). pg_logical_emit_message, named only.
- Debezium docs, Outbox Quarkus Extension: [debezium.io](https://debezium.io/documentation/reference/stable/integrations/outbox.html). The Quarkus-native way to write to an outbox, named only.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=transactional-outbox-pattern:%20).
