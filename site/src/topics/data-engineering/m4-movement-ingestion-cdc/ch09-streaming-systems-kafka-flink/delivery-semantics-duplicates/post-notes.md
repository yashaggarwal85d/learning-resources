<section data-section="outcomes">

## Outcomes

A toy producer-retry model confirms that a lost ack plus a blind retry, without idempotence,
writes a real duplicate. A toy consumer-crash model confirms that a crash between processing and
committing an offset leads to real reprocessing on restart. An effect-count table, run across the
same crash under each semantics, shows the three promises landing at zero, two, and exactly one
copy respectively — measured, not asserted.

</section>

<section data-section="lab">

## Lab

This topic has no lab leg of its own; the two crash windows it demonstrates are the ones topics
10-13 each close in turn.

</section>

<section data-section="production">

## Production failures this topic warns about

**Claiming "exactly-once" without naming the boundary.** The claim only means something once
every hop — producer, broker, consumer, sink — is accounted for; naming just the broker is an
incomplete answer to a question about the whole pipeline.

**Assuming a sink is automatically safe to retry into.** An at-least-once pipeline writing into a
non-idempotent, non-transactional sink reliably produces duplicate effects downstream, with no
broker-side setting able to fix it.

**Treating offset-commit-before-processing as free safety.** It trades reprocessing risk for drop
risk — a crash after committing but before processing silently skips a record instead.

</section>

<section data-section="frontier">

## Frontier

The specific mechanisms that close each crash window — the idempotent producer, transactions,
dedup keys — are the next several topics' job, not retaught here. The deeper theoretical treatment
of exactly-once and related consistency properties belongs to Chapter 14 (named, not retaught).

</section>

<section data-section="where-this-goes-next">

## Where this goes next

The first crash window — a lost ack causing a producer retry to duplicate a write — has a direct
fix inside the producer itself. That's next.

</section>
