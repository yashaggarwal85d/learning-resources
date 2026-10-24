<section data-section="outcomes">

## Outcomes

Explain Postgres's own append-only MVCC directly against a real updated row inspected on this
sandbox's own cluster: an `UPDATE` never overwrites a tuple in place, it inserts a new one with
its own `xmin` and sets the old tuple's `xmax`, and a reader decides visibility from a snapshot
(which transaction IDs were in progress) plus a separate commit-log lookup (`pg_xact_status`),
never from the header alone. The old tuple's own `t_ctid` field becomes a forwarding pointer —
"current TID of this or newer row version" — chaining toward whichever version is newest.
Contrast InnoDB's and Oracle's own undo-log family, sourced directly from their own
documentation: one physical copy of the row, updated in place, with the value it overwrote
pushed out to a separate undo log (InnoDB) or undo segment (Oracle), reconstructed on demand into
what Oracle's own docs call a "consistent read (CR) clone." State precisely how the two families'
real costs diverge: Postgres pays at write time and after (every update leaves a dead tuple
behind, previewing the next topic's own vacuum), while the undo-log family pays at read time
(reconstruction work) and bounds how far back a read can reach. Explain Oracle's own `ORA-01555`
"snapshot too old" as the direct, structural consequence of that bound: once other writers' new
undo has overwritten what a long-running reader still needs, there is nothing left to reconstruct
from, and the read fails outright — a failure mode Postgres has no equivalent of by this same
mechanism, because its own old versions are not a bounded, circular log.

</section>

<section data-section="lab">

## Lab

This topic's own `examples.py` runs three real measurements directly against this sandbox's own
Postgres cluster. First, `pageinspect`'s `heap_page_items` reads a real page directly after one
`UPDATE`, showing both the old and new heap tuple at once, with the old tuple's own `t_xmax`
equal to the new tuple's own `t_xmin`, and the old tuple's own `t_ctid` forwarding to the new
tuple's real location. Second, repeated updates to one row whose updated column is itself
indexed — chosen specifically so Postgres's own HOT optimization can't silently reuse a page's
dead space, which the first version of this experiment discovered the hard way — grow the table
and its index by a real, measured page count with no vacuum running. Third, two real connections:
one opens a `REPEATABLE READ` transaction and reads a value; a second, independent connection
updates and commits a new value to the same row; the first connection's own reads stay unchanged
until it starts a fresh transaction of its own.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating `undo_retention` as a cap instead of a target.** Oracle's own documentation calls
`undo_retention` the minimum amount of time the database *attempts* to retain old undo data, not
a guarantee. A long-running report that occasionally hits `ORA-01555` and gets "fixed" by raising
this one setting is still exposed the moment write volume grows or the report runs a little
longer — the structural bound hasn't moved, only the point where it bites.

**Assuming Postgres has no equivalent cost just because it has no equivalent failure.** Postgres
never throws a "snapshot too old" error by this topic's own mechanism, but a long-running
Postgres reader isn't free: every update anyone makes to a row that reader's snapshot still needs
to see leaves a dead tuple that can't be reclaimed until that reader finishes. The next topic
(vacuum, bloat and transaction-ID wraparound) is the direct consequence of exactly this.

</section>

<section data-section="frontier">

## Frontier

This chapter's own later topic (§5.3, distributed SQL architecture) extends MVCC with
timestamps across multiple machines (TrueTime, hybrid logical clocks) rather than a single
cluster's own in-progress list — named here from the syllabus's own later entry, not taught or
measured in this topic, since this topic's own scope is the two single-node families.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Postgres's own append-only MVCC never overwrites a row in place — which means every update
leaves an old version behind. The next topic is the maintenance job that has to clean that up:
vacuum.

</section>
