<section data-section="outcomes">

## Outcomes

Place a checkpoint relative to an output write and name which failure each wrong order produces.
Derive a deterministic batch id and show a re-run overwriting rather than appending. Prove a
pipeline idempotent by diffing the output of two runs. State the difference between exactly-once
delivery and exactly-once effect.

</section>

<section data-section="internals">

## Internals: the framework-level version of the same recipe

This topic introduces no new mechanism of its own beyond the three measured here. Kafka Connect's
own source-connector offsets and the transactional producer behind KIP-618 are the identical
recipe — a durable position plus an idempotent, keyed commit — applied at the framework level;
this topic names them as the broker-side instance of the same idea and leaves their internals to
Chapter 9, where the transactional producer itself is taught directly. Topic 3's high-watermark
cursor and topic 5's landing-validation-promotion flow each already needed a version of this
property; this topic is where that shared need finally gets its own name.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a checkpoint as proof of a write rather than proof of an intent.** The hook's own
crash — checkpoint advanced, output never written — is what happens when a pipeline marks a batch
done before confirming the write actually landed. A team that advances a checkpoint anywhere
other than inside the same atomic step as the write it's meant to track inherits this exact risk
on every single crash, not just a rare one.

**Choosing a batch id from a counter or a timestamp instead of the input it covers.** Step 6's own
measurement shows a counter-derived id quietly doubling a partition's row count on a re-run,
with every row individually correct and no row-level check able to catch it. A team that reaches
for an auto-incrementing id for convenience loses the one property that makes a re-run safe: that
the identical input always names the identical destination.

</section>

<section data-section="frontier">

## Frontier

None claimed. Atomic commits, deterministic batch ids and idempotent writes are each
established, long-documented practice — this topic measures their real behaviour directly rather
than describing something new.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A pipeline that can be re-run safely still needs something to re-run from. If the raw bytes it
started with are overwritten or transformed in place, there is nothing left to replay. What the
first layer of a pipeline must keep untouched is the next topic.

</section>
