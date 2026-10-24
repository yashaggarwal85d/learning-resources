<section data-section="outcomes">

## Outcomes

Explain snapshot isolation's own mechanism: every read inside a transaction comes from one fixed
snapshot taken at its own start, and a commit fails if anything the transaction wrote was changed
by someone else since that snapshot — first-committer-wins. State which of topic 11's anomalies
this prevents by construction (read skew, lost update) and why two specific ones survive it
(write skew, the read-only transaction anomaly), both because the mechanism only ever compares a
written row against its own snapshot, never a constraint spanning two different rows. Name three
real vendor-naming traps, quoted from each vendor's own current documentation: Postgres's own
Repeatable Read is snapshot isolation; Oracle's own Serializable is snapshot isolation too; MySQL
InnoDB's Repeatable Read mixes a snapshot read with a locking read in the same transaction. A real
write-skew anomaly (the "on-call doctors" pattern) is reproduced against this sandbox's own
Postgres cluster under Repeatable Read, alongside a real prevented read skew and a real caught
write-write conflict.

</section>

<section data-section="internals">

## Internals

Snapshot isolation's own conflict rule is narrower than it first sounds: it is not "has anything
relevant changed," it is "has this specific row I wrote changed since my snapshot." That is
exactly why `repeatable_read_write_write_conflict_first_committer_wins` catches a real conflict —
both transactions touch the same row — while `write_skew_on_call_doctors` never does: the two
transactions each update their own row, and no row in the table is ever written by both of them.
The invariant that breaks (at least one doctor on call) exists only across the two rows together,
and nothing in the mechanism ever looks at two rows together. This is the single idea the whole
topic turns on, and it is why the two experiments produce such different real outcomes
(`SerializationFailure` for one, a silent successful commit for the other) from what looks, on the
surface, like the same shape of problem.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting a vendor's own name for an isolation level.** Postgres calling its own default-upgrade
level "Repeatable Read" and Oracle calling its own snapshot mechanism "Serializable" are not
synonyms for what the SQL standard defines those words to mean — an application built assuming
the standard's own guarantee, on a database that actually provides snapshot isolation under that
name, is exposed to write skew the whole time, measured directly in this topic.

**A business rule that spans more than one row.** Any invariant phrased as "at least one of
these," "the sum of these," or "no more than N of these" is exactly the shape write skew breaks,
because every individual commit still looks correct against the rule when checked alone. The
fix this topic names (materializing the conflict onto a shared row) only closes the specific
query pattern it was written for.

</section>

<section data-section="frontier">

## Frontier

Serializable Snapshot Isolation (Cahill, Röhm & Fekete, 2008; Ports & Grittner's own 2012 paper
on Postgres's implementation) is named here only as a destination, not explained: it is exactly
this topic's own snapshot mechanism, with an added layer of dependency tracking that detects the
dangerous read-write pattern write skew depends on and aborts one of the two transactions instead
of letting both commit. Strict two-phase locking, the other real route to the same guarantee, is
also named only as a destination. Both are topic 13's own subject, which reruns this topic's
exact doctors scenario under each and shows the different ways they close the gap.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Write skew survives snapshot isolation. The next topic is the two real ways to close that gap
entirely and reach full serializability — one of which is snapshot isolation itself, made
serializable.

</section>
