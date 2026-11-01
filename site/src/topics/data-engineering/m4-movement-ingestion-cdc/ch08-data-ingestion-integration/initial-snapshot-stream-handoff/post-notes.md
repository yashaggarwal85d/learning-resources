<section data-section="outcomes">

## Outcomes

Export a consistent snapshot and a slot at one position and prove there is no gap and no overlap
with a concurrent writer. Choose a snapshot mode for a new connector, a restarted one and a
recovered one. Explain why a mid-snapshot crash restarts the snapshot and what that costs on a
huge table.

</section>

<section data-section="internals">

## Internals: measured directly, on this sandbox's own PostgreSQL

The exported-snapshot mechanism, the no-gap-and-no-overlap proof, and the kill-mid-snapshot
restart are all measured directly against this sandbox's own PostgreSQL cluster: a real
`CREATE_REPLICATION_SLOT ... EXPORT_SNAPSHOT` call issued over the replication protocol (not the
plain `pg_export_snapshot()` function, which exports a session's own snapshot rather than a
slot's), a real `SET TRANSACTION SNAPSHOT` import in a second session, and a hand-written
snapshot-then-stream loop genuinely killed with a raised exception partway through, then
restarted from zero. A MySQL global read lock or table-level locks are the documented
alternative to an exported snapshot — named from Debezium's MySQL page only, since this sandbox
has no MySQL server (confirmed absent in topic 11). Chunk-based parallel snapshotting
(`snapshot.max.threads`) is named from Debezium's own page as an incubating feature, not built
here, since the actual chunking algorithm is topic 14's own subject. The slot and LSN model
itself is topic 10's; `max_slot_wal_keep_size` and the stalled-consumer incident are topic 12's,
used here as the reason a new consumer needs a handover at all, not re-taught.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a restarted connector resumes a snapshot instead of redoing it.** The hook's own
incident is the production failure directly: a connector killed most of the way through
snapshotting a huge table does not pick up where it stopped. It restarts from row one, because
nothing before the snapshot's very last step was ever recorded as done. A team that doesn't plan
for this on a multi-terabyte table can end up repeating a multi-hour snapshot indefinitely.

**Treating `pg_export_snapshot()` and a slot's own exported snapshot as interchangeable.** The
first is a plain session-level export, valid only until that session's transaction ends. The
second is tied to a specific slot's own starting position and is what actually gives a new
consumer a gap-free, overlap-free handover — confirmed directly in `examples.py` by using the
replication-protocol path, not the SQL function, for every real measurement in this topic.

</section>

<section data-section="frontier">

## Frontier

Chunk-based parallel snapshotting (`snapshot.max.threads`), incubating in Debezium 3.7, divides
a table into primary-key-range chunks snapshotted concurrently across threads — named from
Debezium's own documentation, not built here, since chunking a snapshot while the log keeps
flowing is topic 14's own subject (DBLog-style watermark windows).

</section>

<section data-section="where-this-goes-next">

## Where this goes next

The snapshot has a weakness: a crash in the middle throws it away and it starts again, blocking
the stream meanwhile, and a table added later needs the whole ceremony. The fix was published by
Netflix: snapshot in small chunks while the log keeps flowing.

</section>
