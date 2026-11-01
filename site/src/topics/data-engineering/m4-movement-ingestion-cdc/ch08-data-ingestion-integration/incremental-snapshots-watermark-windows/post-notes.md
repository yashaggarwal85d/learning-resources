<section data-section="outcomes">

## Outcomes

Run the watermark-window algorithm by hand on a table under concurrent updates and show a
superseded chunk row being dropped. Explain why it needs no lock and why it can pause and
resume. Choose between a signal table, a Kafka signal and a read-only watermark. Trigger a
one-table re-snapshot on a running connector.

</section>

<section data-section="internals">

## Internals: measured directly, on this sandbox's own PostgreSQL

DBLog's own watermark-based chunk-selection algorithm is implemented by hand and measured
directly against this sandbox's own PostgreSQL cluster: a dedicated watermark table, a real
logical-decoding slot, and a chunked copy of a scratch table run under genuine concurrent
updates, deletes and inserts fired between every chunk's own watermarks — diffed against the
source table's live contents at the end, and confirmed to match exactly. A second, independent
run confirms that stopping after a chunk and resuming later from only the last completed
chunk's own position produces the identical final state as a run that never stopped. Debezium's
own buffered-window implementation (the default 1,024-row chunk size, collision resolution, and
the schema-change limitation while a PostgreSQL incremental snapshot runs) is named from its own
documentation rather than reproduced, since running Debezium itself needs a JVM and Kafka this
sandbox doesn't have. The signal table, Kafka signalling topic and read-only watermark variants
are likewise named from Debezium's own documentation, not exercised, since triggering a real
Debezium connector's signal channel needs the same JVM/Kafka this sandbox lacks. The initial
snapshot and the exported-snapshot mechanism are topic 13's own subject, used here as the thing
this chunked approach replaces for a large table, not re-taught.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a chunk's own read is the final value for every row in it.** The hook's own incident
is the production failure directly: a row deleted at nearly the same instant its chunk reads it
can reappear in the output if nothing in the log brackets that chunk's own read window. A team
that builds a chunked copy without the two-marker discipline can resurrect deleted rows under
exactly this kind of timing, intermittently and without any obvious cause.

**Treating a paused incremental snapshot like a paused initial snapshot.** Topic 13 showed a
killed initial snapshot restarting entirely from zero. An incremental snapshot's own chunk
boundaries make a genuinely different guarantee: only the position of the last completed chunk
is ever stored, so a team that assumes a huge chunked snapshot also restarts from scratch after
an interruption is planning around a cost this design doesn't actually have.

</section>

<section data-section="frontier">

## Frontier

Flink CDC's PostgreSQL connector runs its own parallel incremental-snapshot framework, assigning
chunks to multiple readers at once rather than one chunk at a time — named from Flink CDC's own
documentation, not built here, since Flink CDC's own architecture is topic 21's subject.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Snapshot rows and streamed changes now share one stream, so a consumer has to rely on what
order that stream preserves. Within a key, a lot; across tables and partitions, almost nothing;
and a transaction's rows may be scattered. That is the next topic.

</section>
