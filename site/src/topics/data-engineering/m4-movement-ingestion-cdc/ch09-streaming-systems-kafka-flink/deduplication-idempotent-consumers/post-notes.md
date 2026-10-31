<section data-section="outcomes">

## Outcomes

A toy TTL-bounded store confirms a redelivery inside the window is caught and the same id
outside the window is treated as new. A real, small Bloom filter confirms zero false negatives
against every inserted id and measures a small, nonzero false-positive rate against ids that
were never inserted. A deterministic id confirms it recomputes identically and is caught by a
downstream dedup store. All three are measured directly against the models' own state, not
asserted.

</section>

<section data-section="lab">

## Lab

This topic has no lab leg of its own.

</section>

<section data-section="production">

## Production failures this topic warns about

**Remembering every event id forever.** An unbounded dedup set grows without limit and
eventually exhausts memory — the exact failure this topic's hook reproduces.

**Assuming a dedup window has no gap.** A redelivery arriving after the window has passed is, by
design, no longer caught — silent only if nobody stated the bound out loud.

**Treating a Bloom filter's "might contain" as certain.** A positive answer can be a false
positive; only a negative answer is certain. Code that branches on a positive as though it were
guaranteed can silently drop a genuinely new event.

</section>

<section data-section="frontier">

## Frontier

Chapter 5's own Bloom-filter and probabilistic-structures material (§5.6) covers the underlying
mechanism in full — used here by reference, not re-derived. A watermark-bounded dedup window, as
opposed to a wall-clock TTL, becomes fully available once this chapter's own watermark topic
exists; this topic teaches it as the same trade-off, keyed to stream progress instead of time.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Deduplication assumes the consumer *can* process a record, eventually. Some records can never be
processed — a malformed payload, a reference to a deleted entity — and blocking a whole
partition behind one of them is its own failure. That's the next topic.

</section>
