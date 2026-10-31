<section data-section="outcomes">

## Outcomes

A toy broker model confirms that a replayed sequence number is recognized and rejected, that the
same sequence number on a different partition is accepted as an independent write, and that a
write arriving under a stale epoch is fenced off regardless of its sequence number. All three
outcomes are measured directly against the model's own state, not asserted.

</section>

<section data-section="lab">

## Lab

This topic has no lab leg of its own; it sets up the transaction-vs-no-transaction comparison the
next topic hosts.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming idempotence protects a record across two different producers.** Two producer instances
writing what looks like the same logical record each get their own PID — idempotence does nothing
to deduplicate between them.

**Assuming idempotence survives a restart on its own.** A new session gets a new epoch; nothing
about the previous session's sequence numbers carries forward unless the application supplies its
own stable, cross-restart identity.

**Treating a duplicate-rejected error as fatal.** It's the expected, safe outcome of a retry
landing after its original already succeeded — the one to treat as fatal is an out-of-sequence
error, which signals real data loss.

</section>

<section data-section="frontier">

## Frontier

Multi-partition atomicity across a single logically-related write, and the consume-transform-
produce loop, are the next topic's job (transactions) — the next-scope-up mechanism, not retaught
here. Application-level, cross-session deduplication by event id is a later topic.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Idempotence covers one producer, one partition, one session. A single logical write that touches
several partitions — or reads from Kafka and writes back to it — needs all of those writes to
succeed or fail together. That's a transaction, the next topic.

</section>
