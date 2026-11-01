# Fact-check — de.schema-evolution-change-streams

## Claims against sources

1. **"The connector relies on and reflects the PostgreSQL logical decoding feature, which has
   the following limitations: Logical decoding does not support DDL changes."**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 1). Direct match. Measured
   directly: `adding_a_column_is_learned_only_from_the_next_row_event` confirms an `ALTER TABLE`
   statement decodes to an empty `BEGIN`/`COMMIT` pair with zero row events in between.

2. **"The Debezium connector for PostgreSQL does not support schema changes while an incremental
   snapshot is running."**
   Source: Debezium docs, PostgreSQL connector (SOURCES.md quote 2). Direct match. Named only in
   `post-notes.md`'s Internals section, alongside topic 14's own chunked-snapshot mechanism,
   which is the thing a mid-run schema change would collide with.

3. **"In a separate database schema history Kafka topic, the connector records all DDL
   statements along with the position in the binlog where each DDL statement appeared."**
   Source: Debezium docs, MySQL connector (SOURCES.md quote 3). Direct match. Named only, for
   direct contrast with PostgreSQL's own measured silence on DDL — this sandbox has no MySQL
   server (confirmed absent in topic 11), so MySQL's own binlog-DDL capture is not reproduced.

4. **"When schema.evolution is set to basic, the connector automatically creates or alters the
   destination database table according to the structure of the incoming event."**
   Source: Debezium docs, JDBC sink connector (SOURCES.md quote 4). Direct match. Named only in
   `post-notes.md`'s Internals section — this topic's own hand-written DuckDB sink logic stands
   in for the real feature, since running the actual JDBC sink connector needs a JVM and Kafka
   this sandbox doesn't have.

5. **"If you configure the JDBC connector to use an Oracle 23 database as the sink target, you
   cannot rely on schema evolution to automatically create a field that uses the Oracle 23
   BOOLEAN data type."**
   Source: Debezium docs, JDBC sink connector (SOURCES.md quote 5). Direct match. Named only, as
   the real "some dialects reject some combinations" caveat CHAPTER.md's own scope line names.

6. **Flink CDC's own `schema.change.behavior` enum (Exception, Evolve, TryEvolve, Lenient,
   Ignore) and what each one does to a schema change event.**
   Source: Flink CDC docs, Schema Evolution (SOURCES.md quotes 6-8). Direct match. Named only —
   Flink CDC's own architecture is topic 21's subject, so this topic names the policy options
   without building or running the framework itself.

7. **dlt's own variant-column strategy: adding a new, separately-named column rather than
   altering an existing one in place when a type changes.**
   Source: dlt docs, Schema evolution (SOURCES.md quotes 9-10). Direct match. Named only, as a
   documented alternative to this topic's own two measured retype outcomes (widen in place,
   losslessly; leave unaltered, lossily).

## Predict questions red-teamed

- **Step 2** ("loud error or silence"): the wrong option claims a consumer gets an explicit error
  back for a dropped field. Checked against both the DDL-silence documentation and the measured
  add/drop proof directly: nothing in the decoded stream or in this topic's own sink logic raises
  an exception when a field is simply absent from a row event; the row event is parsed by the
  columns it actually carries, never by a fixed expected set.

- **Step 10** ("whose decision is that, exactly"): the wrong option claims a sink decides row by
  row whether a new column is allowed. Checked against the measured add-column proof and basic
  reasoning about ordering directly: a sink only ever sees a row after some upstream decision has
  already let that row's own schema version exist, so a sink cannot structurally be the gate a
  schema registry's own compatibility check is.

## Scope check against CHAPTER.md / syllabus

The raw syllabus line for this topic has exactly one semicolon, splitting into two clauses:
capturing DDL, schema history and propagating adds/drops/retypes through a registry into sinks;
and incompatible changes that require re-snapshot. Both are covered — the first by direct
measurement against this sandbox's own PostgreSQL cluster and a real DuckDB sink (the no-DDL-
event proof, the add/drop measurement, and the widen/narrow pair), the second by naming the
exact repair mechanism topic 14 already built. No claim here depends on the compatibility-mode
lattice (Chapter 9 topic 16), the expand/contract rollout (Chapter 11 topic 14), lakehouse
column-ID schema evolution (Chapter 6 topic 16), or data contracts (Chapter 3 topic 22 and
Chapter 11 topic 19), all named in "Leaves out."
