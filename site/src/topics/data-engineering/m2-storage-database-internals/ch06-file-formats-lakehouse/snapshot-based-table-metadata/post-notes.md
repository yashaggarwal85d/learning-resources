<section data-section="outcomes">

## Outcomes

Define a snapshot as an explicit, immutable list of data files plus schema and statistics, built
directly in this sandbox from a real small table. Explain the commit as one atomic pointer move
(a compare-and-swap or a put-if-absent), using the previous topic's conditional-write primitive.
Demonstrate that a reader pinned to a snapshot id never sees a concurrent write in progress,
directly contradicting the previous topic's reproduced partial-read failure.

</section>

<section data-section="one-primitive-two-formats">

## One primitive, two formats

Iceberg and Delta arrived at the identical design from the identical problem, using different
words for the same shape. Iceberg calls it a snapshot and a metadata-file swap; Delta calls it a
table version and a transaction-log entry. Both mean exactly the same thing: an immutable,
complete description of the table at one point in time, and a single atomic operation that moves
"current" from one such description to the next. Neither format edits history. Neither format
lets a reader see a write in progress. Both rely on the same underlying primitive this chapter has
now demonstrated twice — a real conditional write in topic 10, a real compare-and-swap race here
— applied at the scale of an entire table's metadata instead of one object.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a snapshot pointer always moves forward.** This topic's demo deliberately shows two
writers racing from the *same* base snapshot; in production, that race is exactly how a lost
update gets caught before it ever reaches a reader. A system that retries blindly without
re-validating against the new base (the next topic's subject) can still silently discard a
legitimate change — the compare-and-swap catches the race, but catching it is only half the job.

**Treating "atomic swap" as a guarantee the table format itself provides everywhere.** Iceberg's
own spec is explicit that the atomic-swap mechanism depends on what's underneath it — an HDFS
rename, or a metastore's check-and-put. A table built on a storage layer that can't actually do
either atomically has no real atomicity, whatever the table format's own documentation implies.

</section>

<section data-section="frontier">

## Frontier

This topic's compare-and-swap demonstration uses `os.open` with `O_EXCL` on this sandbox's own
local disk, not a real catalog's check-and-put or a real object store's conditional write (already
demonstrated for real, at the HTTP level, in the previous-but-one topic). POSIX guarantees
`O_EXCL` is atomic within one filesystem — the same atomicity shape a metastore or a conditional
write provides, applied here to a local directory as a stand-in, disclosed directly in
`examples.py`'s own docstring. The two-writer race itself is a deliberately scripted sequence, not
a genuine simultaneous race between two OS processes; it verifies that the *losing* attempt fails
deterministically, which is the real guarantee this topic claims, not a simulation of exact
concurrent timing.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

An atomic pointer move only works if exactly one writer wins it when two race for the same move.
That's the optimistic-commit protocol itself — specifically, what counts as a safe retry versus a
genuine conflict.

</section>
