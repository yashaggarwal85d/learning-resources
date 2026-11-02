<section data-section="outcomes">

## Outcomes

Perform real time-travel queries by snapshot id and by timestamp, and a real rollback, on a
snapshot chain built directly in this sandbox. Expire old snapshots and remove the data files they
alone referenced, with the reclaimed storage measured directly. State why a hard, GDPR-style
delete isn't actually gone until the snapshot referencing the original file is expired and
vacuumed — and reproduce that conflict for real. Reproduce a too-aggressive cleanup window
corrupting a reader still mid-read on a snapshot that cleanup just expired.

</section>

<section data-section="one-rule-two-formats">

## One chain, two kinds of forgetting

Time travel, rollback, expiry and vacuum all read from and act on the exact same snapshot chain —
there's no separate bookkeeping for "history" versus "the live table." Iceberg's own maintenance
docs put it plainly: a data file isn't deleted until no snapshot that could still be time-traveled
to or rolled back to needs it any more. Delta's own utility-commands docs say the identical thing
in different words: VACUUM is what actually removes files past the retention threshold, and doing
so is explicitly what ends time travel to anything older than that threshold. Two different
formats, the same one dependency graph underneath.

</section>

<section data-section="production">

## Production

**A hard delete is a two-step process, not one.** A delete commit only changes what the *current*
snapshot shows. The row's original file is still sitting on disk and still fully time-travelable
until the snapshot that references it is deliberately expired and vacuumed — Databricks' own GDPR
guidance is explicit that this second step is required, not optional, for a deletion request to
actually be complete.

**The retention window is a single dial with two opposing failure modes.** Set it too long, and
storage never gets reclaimed and a legally-required deletion never actually finishes. Set it too
short — shorter than the slowest concurrent reader or writer — and Delta's own docs warn that
VACUUM can fail a live read or, worse, corrupt the table outright.

</section>

<section data-section="frontier">

## Frontier

The table in `examples.py` is a real local directory tree with real JSON snapshot files and real
binary data files, not Iceberg's or Delta's actual on-disk metadata/manifest format — disclosed in
the script's own docstring. What transfers is the real mechanism, not either format's exact file
layout. This topic's rollback moves the current pointer straight to an old snapshot (Iceberg's own
documented behavior); Delta's RESTORE instead creates a new version, a real but different
mechanism this topic doesn't separately reproduce. The "GDPR delete" demo stands in for a real
column-level redaction, not an actual row-level `DELETE`/`MERGE` statement. The too-short-versus-
long-enough retention scenarios are simulated by code path, not an actual wall-clock race between
concurrent processes. Delta's quoted default retention figures — VACUUM's 7 days, table history's
30 days — are spoken, not shown as on-screen digits, since neither is a literal value this topic's
own code computes or asserts.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every snapshot this chapter has shown so far assumed the files underneath it stay a reasonable
size. The next topic is what happens when they don't: small files and compaction.

</section>
