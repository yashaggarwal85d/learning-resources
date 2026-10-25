<section data-section="outcomes">

## Outcomes

Contrast ARIES's three-pass analysis/redo/undo recovery with Postgres's redo-only approach and
explain why Postgres can skip the undo pass. Explain the checkpoint-frequency trade-off
(recovery time versus write amplification and full-page-write volume) backed by a real
measurement. Name physical replication, point-in-time recovery, and logical decoding as three
things built directly on the WAL this and the previous topic established.

</section>

<section data-section="lab">

## Lab

This topic's own `examples.py` runs two real measurements directly against this sandbox's own
Postgres 16 cluster, both reading `pg_control_checkpoint()`'s `redo_lsn`, `pg_current_wal_lsn()`,
and `pg_stat_wal`'s own `wal_fpi` counter: a two-thousand-row table checkpointed after every one
of ten identical update rounds, and the same table checkpointed only once before the same ten
rounds. Each run reports the real full-page-image count and the real live replay-gap byte count,
measured by direct `pg_lsn` subtraction rather than estimated.

</section>

<section data-section="production">

## Production failures this topic warns about

**Setting `checkpoint_timeout`/`max_wal_size` too loose on a system that actually needs fast
recovery.** The documented trade-off this topic measures is real: a longer checkpoint interval
genuinely reduces full-page-write volume, but it also genuinely widens how much WAL a crash
recovery has to replay — this topic's own run found that gap nearly seven times larger for a
checkpoint interval stretched across the same workload. A production system tuned purely to
minimize WAL volume, without checking what that does to its own recovery-time target, can end up
with a crash recovery that takes far longer than anyone planned for.

**Assuming an engine's recovery model matches ARIES's by default.** The three-pass
analysis/redo/undo structure is the one taught in most database-systems courses, but Postgres's
own documentation describes a single redo-only pass. A production assumption that "every
database undoes losers the same way ARIES does" is wrong for Postgres specifically, and could
lead to incorrect expectations about what state is visible immediately after a crash.

</section>

<section data-section="frontier">

## Frontier

Postgres's own replication and logical-decoding documentation describes machinery well past this
topic's own scope: synchronous replication modes that wait for a standby's own reply before
releasing a commit, and replication slots that persist a logical decoding client's own position
across a crash. Named here from the same sources fetched for this topic, not measured, since the
syllabus's own scope here is the WAL-as-substrate claim, not replication or CDC mechanics in
depth — those get their own chapters later (Data Engineering Ch.8 for CDC).

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every mechanism so far assumed one path to a row: a direct page read. The next topic is the
structure that makes finding the right page fast in the first place — the B-tree.

</section>
