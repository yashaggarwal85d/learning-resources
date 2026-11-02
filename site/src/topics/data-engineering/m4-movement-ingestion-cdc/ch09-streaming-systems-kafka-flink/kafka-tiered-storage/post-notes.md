<section data-section="outcomes">

## Outcomes

A toy segment-placement model separates two events that are easy to conflate: a segment's copy to
object storage (triggered the moment the segment rolls closed) and its deletion from local disk
(triggered later, once local retention expires). A toy read-cost comparison measures, rather than
assumes, that a remote-only offset costs far more to fetch than a local one through the identical
API. A toy cleanup-policy check confirms a compacted topic is rejected the moment tiered storage is
enabled on it.

</section>

<section data-section="lab">

## Lab

This topic has no lab leg of its own. `examples.py` builds a segment-placement simulation, a
local-vs-remote read-cost comparison, and a compacted-topic rejection check, and asserts every
number this topic's reel shows.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming local and total retention are the same knob.** Shrinking `local.retention.ms` without
separately bounding `retention.ms` does not shrink how long data survives — it only moves more of
it into the remote tier sooner.

**Enabling tiered storage on a compacted topic.** Kafka rejects this outright; compaction's
in-place segment rewriting is incompatible with the remote copy's immutability assumption.

**Treating a cold read as free because the API looks the same.** A fetch against remote-only data
succeeds identically to a local one, but at real extra latency — a backfill or recovery job
reading a wide historical range should budget for that, not assume uniform read cost.

</section>

<section data-section="frontier">

## Frontier

Fully leaderless, diskless designs (WarpStream, Aiven Inkless, and similar) go further than tiered
storage by removing local disk from the hot path entirely; named here as a sourced pointer, not
retaught, since it is its own syllabus topic.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

The log itself, and everything it stores, replicates and tiers, is only half the story. The other
half is making sure what you read out of it is correct even when producers retry, consumers crash,
and sinks fail partway through a write. That's the next topic.

</section>
