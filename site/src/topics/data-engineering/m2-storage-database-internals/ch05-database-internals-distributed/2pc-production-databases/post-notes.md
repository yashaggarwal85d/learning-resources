<section data-section="outcomes">

## Outcomes

Trace a real prepare/commit exchange as a database actually runs it, against this sandbox's own
Postgres cluster; explain exactly what a coordinator failure leaves participants in — an in-doubt
transaction that keeps its locks and resolves only when some other session tells it to — named but
not formally modeled here (Chapter 14's job); name XA as the real cross-vendor standard those
commands implement and what its own presumed-rollback rule guarantees; explain, at a naming level,
how a distributed SQL system hides this same exchange behind consensus-replicated participants.

</section>

<section data-section="internals">

## Internals

`PREPARE TRANSACTION` ends the issuing session's own transaction the moment it runs — from that
session's point of view it behaves like a `ROLLBACK`, with no active transaction left and no
visible effect. What's left behind is a transaction with its state fully written to disk, still
holding whatever locks it held, waiting for exactly one more instruction: `COMMIT PREPARED` or
`ROLLBACK PREPARED`, issuable from any session at all. This topic's own two experiments only
reach the length of an ordinary prepared-transaction window (seconds); they don't reproduce the
actual coordinator-crash scenario Chapter 14 formally models, where the coordinator itself is
gone for an unbounded, unknown amount of time.

</section>

<section data-section="production">

## Production failures this topic warns about

**Leaving a transaction prepared and forgetting about it.** PostgreSQL's own documentation is
explicit: a long-lived prepared transaction interferes with `VACUUM`'s ability to reclaim storage,
and in extreme cases can force the database to shut down to prevent transaction ID wraparound. The
intended usage is that an external transaction manager resolves a prepared transaction as soon as
every participant has confirmed — not that it sits there indefinitely.

**Treating a coordinator's silence as a safe signal to guess.** A prepared participant that
hasn't heard back can't safely decide on its own which way to resolve — it already gave an
affirmative guarantee it could commit, so resolving the wrong way risks breaking the rest of the
transaction. The correct behavior, and the behavior this topic's own measurement shows directly,
is to keep holding the locks and wait for an explicit instruction, however long that takes.

</section>

<section data-section="frontier">

## Frontier

Sagas and the outbox pattern, this syllabus's own neighboring *(skipped)* entry, exist precisely
because 2PC's own in-doubt window is unacceptable for some systems — they trade 2PC's atomicity for
compensating actions that never hold a cross-service lock at all, named here only as a destination,
not built. Having the client itself drive two-phase commit, rather than routing it through a
dedicated coordinator process, is Spanner's own further optimization (avoiding sending data twice
across wide-area links) and is named, not built, here.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A single engine's own transactions are done. The next section spreads that single engine across
machines entirely — starting with the replication vocabulary every later topic in it assumes.

</section>
