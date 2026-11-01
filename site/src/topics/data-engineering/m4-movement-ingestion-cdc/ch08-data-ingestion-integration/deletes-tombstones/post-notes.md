<section data-section="outcomes">

## Outcomes

Name the two records of a Debezium delete and what each one is for. Choose between a soft and a
hard delete for a table and say what each costs a downstream cursor extract. Apply a delete to a
lakehouse table by `MERGE`. Show the retention-window race and size a sink's maximum lag against
it.

</section>

<section data-section="internals">

## Internals: measured directly, on this sandbox's own PostgreSQL, and a hand-built compaction model

The before-image and cursor-visibility claims are measured directly against this sandbox's own
real PostgreSQL 16 cluster: the identical `DELETE` statement decodes with only the key under a
table's default `REPLICA IDENTITY` and with the whole row under `FULL`; a soft-deleted row shows
up to a high-watermark cursor query exactly like any other update, while a hard-deleted row
leaves that same query nothing to find. A single real `MERGE` statement, run against a real
landing table, removes exactly one deleted row's own key while leaving every other row
untouched. The retention-window race needs a real Kafka broker this sandbox doesn't have, so it
is measured instead against a hand-built model that implements Kafka's own documented rule
exactly — keep only the latest offset per key, and drop a tombstone entirely once it is older
than the retention window — never a simplified stand-in for it: a consumer that resumes before
the window closes still finds the tombstone and applies the delete correctly; one that resumes
after finds nothing at all for that key and never corrects its own already-stale state.
Debezium's own event-flattening SMT (its drop, tombstone and rewrite handling modes, and the
`__deleted` field a rewritten record carries) and the JDBC sink's own `delete.enabled` setting
are named from their own documentation rather than reproduced, since running either needs a JVM
and Kafka this sandbox doesn't have.

</section>

<section data-section="production">

## Production failures this topic warns about

**Bootstrapping a new consumer from a compacted topic without checking how old the data is.**
The hook's own incident is the production failure directly: a brand-new sink reading a compacted
topic from the beginning has no way to tell whether a key's absence means "never existed" or
"deleted, and the proof has already been cleaned up." Both look identical from the compacted log
alone.

**Assuming a cursor-based extract sees every change a table has had.** A team relying on a
high-watermark cursor for incremental extraction (topic 3) correctly catches every soft delete,
and can wrongly assume hard deletes behave the same way. Measured directly here: they don't — a
hard delete is invisible to that same query, with nothing in the table itself left to find.

</section>

<section data-section="frontier">

## Frontier

A merge-on-read table format can record a deleted row as a delete file or a deletion vector
instead of rewriting the data files it lives in, named only here since the delete-file formats
themselves are Chapter 6's own subject.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every record in this chapter has carried a position, an LSN or a GTID, and a Kafka offset is a
second one. Which of them a restart trusts, and what a replay can and cannot promise, is the
next topic.

</section>
