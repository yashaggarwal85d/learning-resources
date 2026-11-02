<section data-section="outcomes">

## Outcomes

Trace an `ALTER TABLE` on PostgreSQL through to a sink and say what the decoded stream carries
and what a consumer must infer on its own. Classify adding, dropping and retyping a column as
safe, destructive or dangerous for a given reader. Decide when a change forces a re-snapshot and
explain why widening and reapplying a type sometimes isn't enough.

</section>

<section data-section="internals">

## Internals: measured directly, on this sandbox's own PostgreSQL and a real DuckDB sink

Every claim here is measured directly: against this sandbox's own real PostgreSQL 16 cluster,
reading a `test_decoding` slot, and against a real DuckDB sink reached from the same process. An
`ALTER TABLE` statement, run in its own transaction, decodes to an empty `BEGIN`/`COMMIT` pair
with zero row events, confirming directly that PostgreSQL's logical decoding carries no event
for the DDL itself. Adding a column shows up for the first time only on the row event that
actually carries it; dropping one disappears the same way on the very next row event, and a
naive sink that only ever applies the columns a row event carries is left holding the dropped
field's last value forever, with no later event able to touch it again. A widened column (an
integer retyped to a bigint, carrying a value no 32-bit integer ever could) round-trips exactly
through a sink that widens its own column to match. The identical mechanism, retyping toward a
fraction instead, is applied to a sink deliberately left at its old, narrower type: the write
succeeds and the fractional part is rounded away silently, with no exception anywhere — the
measured version of this topic's own hook. MySQL's own binlog-carried DDL and schema history
topic (Debezium's MySQL connector), the JDBC sink's own `schema.evolution: basic` setting and its
documented dialect rejections, Flink CDC's own configurable schema-change behaviors, and dlt's
own variant-column strategy for a retyped field are all named from their own documentation
rather than reproduced, since running any of Debezium's real connectors needs a JVM and Kafka
this sandbox doesn't have, and this sandbox has no MySQL server either (confirmed absent in
topic 11).

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a narrowed or reinterpreted column fails loudly.** The hook's own incident is the
production failure directly: a retype toward a fraction kept the pipeline running and raised no
error anywhere, while every value it wrote from that moment on was silently wrong. A team that
expects a type mismatch to announce itself with an exception is planning around a failure mode
this topic's own measurement shows doesn't happen that way.

**Treating a dropped column as merely absent from new rows.** A team that assumes a dropped
column simply stops being written, as though nothing had ever gone wrong, misses the sharper
fact: whatever value a sink already held for that column is now permanently unreachable, frozen
at whatever it was the moment the drop happened, with no future event ever able to update or
clear it again.

</section>

<section data-section="frontier">

## Frontier

Flink CDC's own `schema.change.behavior` setting (Exception, Evolve, TryEvolve, Lenient or
Ignore) lets an operator pick, as policy, how a whole pipeline reacts to every kind of schema
change at once, named only from its own documentation, since Flink CDC's own architecture is
topic 21's subject.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A column added is only the most polite change in a stream. The rudest is a row that stops
existing. How a delete is represented, what Kafka does with it, and how a table format applies
it is the next topic.

</section>
