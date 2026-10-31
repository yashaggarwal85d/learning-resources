<section data-section="outcomes">

## Outcomes

A toy coordinator model confirms that a write under a stale epoch is fenced off outright, never
queued or merged. A toy log model confirms that an aborted transaction's records stay physically
present but are filtered out for a `read_committed` reader while remaining visible under
`read_uncommitted`. Both outcomes are measured directly against the models' own state, not
asserted.

</section>

<section data-section="lab">

## Lab

This topic hosts the kill-mid-commit leg of the 9.2 chapter lab: killing a consume-transform-
produce step between writing output and committing its input offset, with and without a
transaction wrapping the two together, then diffing the sink against ground truth.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a restart merges with its old instance.** A restart under the same transactional id
is fenced off from, never merged with, whatever the previous instance was still writing — any
write still arriving under the old epoch is rejected outright.

**Assuming an aborted write is gone from the log.** It remains physically present; only a
`read_committed` reader filters it out at read time. A `read_uncommitted` reader, or a tool
reading the raw log, sees it.

**Leaving a transaction open indefinitely.** Before KIP-890's server-side defence, a hung
transaction pinned the last stable offset and blocked every `read_committed` consumer behind it.

</section>

<section data-section="frontier">

## Frontier

A Kafka transaction only keeps Kafka itself consistent. Making a Kafka write atomic with a
write to a non-Kafka system — a database, a file, an API — needs its own two-phase-commit or
idempotent-upsert pattern, the next topic's job. Application-level deduplication when no
transaction is available at all is a later topic.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A transaction keeps everything inside Kafka consistent. The moment the far end of a pipeline is
not Kafka — a database, a file, an API — a Kafka transaction alone can't make that write atomic
with anything. That's the next topic.

</section>
