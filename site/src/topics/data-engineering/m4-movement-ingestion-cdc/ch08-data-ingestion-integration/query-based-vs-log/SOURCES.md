# Sources — de.query-based-vs-log

`CHAPTER.md` names PostgreSQL 18 logical decoding concepts, Debezium's PostgreSQL connector
overview, Airbyte's log-based incremental replication page, Meltano's `LOG_BASED` replication
method, and the DBLog paper's own comparison table. This topic quotes two independent primary
sources covering the load-bearing claims; the remaining tools are named in prose in post-notes
without being independently re-measured, since this topic's own direct measurements are against
PostgreSQL's real logical decoding, not a managed tool.

## PostgreSQL docs: Logical Decoding Concepts

URL: https://www.postgresql.org/docs/current/logicaldecoding-explanation.html
Fetched: 2026-10-31.

Quotes:
> Logical decoding is the process of extracting all persistent changes to a database's tables into a coherent, easy to understand format which can be interpreted without detailed knowledge of the database's internal state.

Items: the exact mechanism this topic's own measurements read from directly, via
`pg_create_logical_replication_slot` and `pg_logical_slot_get_changes` against the sandbox's
real PostgreSQL 16 cluster.

## Debezium docs: PostgreSQL connector

URL: https://debezium.io/documentation/reference/stable/connectors/postgresql.html
Fetched: 2026-10-31.

Quotes:
> PostgreSQL normally purges write-ahead log (WAL) segments after some period of time. This means that the connector does not have the complete history of all changes that have been made to the database.

Items: the exact "operationally coupled to the source" cost this topic names — log-based
capture depends on the log's own retention, which the rest of 8.2 (the slot-retention incident,
the initial-snapshot handoff) manages directly.
