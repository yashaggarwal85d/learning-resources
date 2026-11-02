<section data-section="outcomes">

## Outcomes

A toy batch-delivery comparison shows that without idempotence, a batch that fails and gets
retried can be delivered after a later batch that succeeded immediately — exactly backwards from
send order — while with idempotence enabled, delivered order always matches send order. A toy
repartition check hashes real keys before and after a partition-count change: most keys land on a
new partition, while a few, by chance, land exactly where they started, both measured directly
rather than assumed.

</section>

<section data-section="lab">

## Lab

This topic has no lab leg of its own. `examples.py` builds a non-idempotent-versus-idempotent
batch-reorder comparison and a key-to-partition hash check across a real partition-count change,
and asserts every number this topic's reel shows.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming ordering across partitions.** Kafka makes no promise at all about the relative order
of records in different partitions — if a consumer needs two events ordered relative to each
other, they must share a key, and therefore a partition.

**Leaving `enable.idempotence` off with retries and multiple in-flight requests enabled.** This
is precisely the configuration under which a retried batch can be delivered out of order; the
fix is either idempotence or capping in-flight requests at one, not disabling retries.

**Assuming a key always maps to the same partition.** Adding partitions to an existing topic
changes the default partitioner's mapping for that key going forward. Existing data isn't moved,
but new writes for the same key can land somewhere new, breaking any assumption that "same key,
same partition" holds forever.

</section>

<section data-section="frontier">

## Frontier

Windowed and event-time ordering — a different, higher-level notion of order layered on top of
the raw per-partition guarantee this topic covers — is a later chapter's job, not measured here.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A log that keeps everything forever costs money, and most of that cost is disk the broker itself
has to hold. Letting old data live on cheaper storage, without changing what a consumer sees, is
the next topic.

</section>
