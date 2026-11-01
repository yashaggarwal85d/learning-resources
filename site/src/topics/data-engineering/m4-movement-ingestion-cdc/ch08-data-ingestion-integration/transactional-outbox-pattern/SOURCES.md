# Sources — de.transactional-outbox-pattern

## Debezium docs: Outbox Event Router

URL: https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html
Fetched: 2026-11-01.

Quotes:
> id Contains the unique ID of the event. In an outbox message, this value is a header. You can use this ID, for example, to remove duplicate messages.

> aggregatetype Contains a value that the SMT appends to the name of the topic to which the connector emits an outbox message. The default behavior is that this value replaces the default ${routedByValue} variable in the route.topic.replacement SMT option.

> in a default configuration, the route.by.field SMT option is set to aggregatetype and the route.topic.replacement SMT option is set to outbox.event.${routedByValue}.

> The SMT automatically filters out DELETE operations on an outbox table.

Items: the default outbox table columns (`id`, `aggregatetype`, `aggregateid`, `type`,
`payload`), the id-as-dedup-key claim this topic's own `_route` function reproduces directly,
the `aggregatetype`-based routing to `outbox.event.${routedByValue}`, and the DELETE-filtering
behavior this topic's own cleanup measurement confirms against a real decoded delete.

## Debezium docs: PostgreSQL connector (logical decoding messages)

URL: https://debezium.io/documentation/reference/stable/connectors/postgresql.html
Fetched: 2026-11-01 (already fetched for earlier topics in this chapter; re-used here for this
clause).

Quotes:
> A message event captures a generic logical decoding message that is written directly to the WAL by using the pg_logical_emit_message function.

Items: the lighter, table-free variant of the outbox pattern CHAPTER.md names alongside the
table-based router, named only since this topic's own measured example uses the table-based
form.

## PostgreSQL 18 documentation: System Administration Functions (`pg_logical_emit_message`)

URL: https://www.postgresql.org/docs/18/functions-admin.html
Fetched: 2026-11-01.

Quotes:
> Emits a logical decoding message. This can be used to pass generic messages to logical decoding plugins through WAL.

Items: the function Debezium's own message-event mechanism is built on, named only alongside
the Debezium PostgreSQL connector's own description of it.

## Debezium docs: Outbox Quarkus Extension

URL: https://debezium.io/documentation/reference/stable/integrations/outbox.html
Fetched: 2026-11-01.

Quotes:
> The Outbox extension's goal is to provide a Quarkus application with a reusable, highly configurable component that facilitates the use of the Outbox pattern paired with Debezium's CDC connector pipeline to reliably and asynchronously share data with any consumer of said data.

Items: named only — the Quarkus-specific library CHAPTER.md names alongside the SMT and the
`pg_logical_emit_message` variant as a third way teams actually write to an outbox.
