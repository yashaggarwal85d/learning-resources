# Sources — de.schema-evolution-change-streams

## Debezium docs: PostgreSQL connector (DDL limitation)

URL: https://debezium.io/documentation/reference/stable/connectors/postgresql.html
Fetched: 2026-11-01.

Quotes:
> The connector relies on and reflects the PostgreSQL logical decoding feature, which has the following limitations: Logical decoding does not support DDL changes.

> The Debezium connector for PostgreSQL does not support schema changes while an incremental snapshot is running.

Items: the exact limitation this topic's own `adding_a_column_is_learned_only_from_the_next_row_event`
measures directly — an `ALTER TABLE` decodes to an empty `BEGIN`/`COMMIT` with zero row events — and
the incremental-snapshot limitation named alongside it, since topic 14's own chunked snapshot is the
mechanism a schema change would collide with mid-run.

## Debezium docs: MySQL connector (schema history topic)

URL: https://debezium.io/documentation/reference/stable/connectors/mysql.html
Fetched: 2026-11-01.

Quotes:
> In a separate database schema history Kafka topic, the connector records all DDL statements along with the position in the binlog where each DDL statement appeared.

Items: named for contrast with PostgreSQL's own silence on DDL — MySQL's binlog carries DDL directly,
so Debezium can record and replay it, which is exactly what PostgreSQL's logical decoding cannot do.

## Debezium docs: JDBC sink connector (schema evolution)

URL: https://debezium.io/documentation/reference/stable/connectors/jdbc.html
Fetched: 2026-11-01.

Quotes:
> When schema.evolution is set to basic, the connector automatically creates or alters the destination database table according to the structure of the incoming event.

> If you configure the JDBC connector to use an Oracle 23 database as the sink target, you cannot rely on schema evolution to automatically create a field that uses the Oracle 23 BOOLEAN data type.

Items: named only — `schema.evolution: basic` is the real sink feature this topic's own hand-written
DuckDB sink logic stands in for, since running the actual Debezium JDBC sink connector needs a JVM
and Kafka this sandbox doesn't have; the Oracle dialect warning is the real "some dialects reject some
combinations" caveat CHAPTER.md names.

## Flink CDC docs: Schema Evolution

URL: https://nightlies.apache.org/flink/flink-cdc-docs-master/docs/core-concept/schema-evolution/
Fetched: 2026-11-01.

Quotes:
> In this mode, all schema change behaviors are forbidden. An exception will be thrown from SchemaOperator once it was captured.

> In this mode, CDC pipeline schema operator will apply all upstream schema change events to downstream sink. If the attempt fails, an exception will be thrown from the SchemaRegistry and trigger a global failover.

> In this mode, schema operator will also try to apply upstream schema change events to downstream sink. However, if specific schema change events are not supported by downstream sink, the failure will be tolerated and SchemaOperator will try to convert all following data records in case of schema discrepancy.

Items: named only — Flink CDC's own `schema.change.behavior` modes (Exception, Evolve, TryEvolve,
Lenient, Ignore) are the contrast CHAPTER.md asks for: a framework that decides a sink's own reaction
to a schema change by a configured policy, rather than this topic's own hand-written, always-applied
sink logic.

## dlt docs: Schema evolution

URL: https://dlthub.com/docs/general-usage/schema-evolution
Fetched: 2026-11-01.

Quotes:
> As the structure of data changes, such as the addition of new columns or changing data types, dlt handles these schema changes, enabling you to adapt to changes without losing velocity.

> Variant column: A new column named inventory_nr__v_text is added as the datatype of the column was changed from "integer" to "string".

Items: named only — dlt's own variant-column strategy for a retyped column (adding a new,
separately-named column rather than altering the old one in place) is a documented alternative to
this topic's own two measured outcomes (a widened column altered in place losslessly, a narrowed one
left unaltered and silently corrupted).
