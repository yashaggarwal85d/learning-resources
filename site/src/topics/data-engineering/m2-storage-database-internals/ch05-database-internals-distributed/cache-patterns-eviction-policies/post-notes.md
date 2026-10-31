<section data-section="outcomes">

## Outcomes

Cache-aside and read-through are the same miss-path mechanics with ownership moved from the
application to the cache itself; write-through and write-behind trade write latency against
exactly the loss risk write-behind accepts. A TTL is shown bounding staleness, not curing it. A
real, measured comparison between plain LRU and a frequency-gated admission policy, run against
an identical skewed request stream in `examples.py`, shows the admission-gated policy reaching a
meaningfully higher hit rate — not an assumed one.

</section>

<section data-section="lab">

## Lab

`examples.py` runs two real measurements. First, a minimal write-behind cache reproduces the
hook's own failure directly: a write is acknowledged and queued, then the simulated crash drops
the queue before it drains, leaving the backing store with nothing. Second, a plain LRU cache and
a frequency-gated admission-plus-LRU policy (the course's own stand-in for Caffeine's frequency
sketch) are run against an identical, heavily skewed stream of requests, and their hit rates are
measured and compared directly, with an assertion on the margin between them rather than only on
direction.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a bigger cache, or a different eviction rule, fixes a low hit rate.** The closing
scenario is a real production pattern: a team changes eviction policy expecting an improvement
and sees almost none, because every key was already being let into the cache regardless of how
rarely it recurred. No eviction rule can undo damage done at admission.

**Treating a TTL as a correctness fix rather than a staleness bound.** A TTL only forces a future
read to ask again; it does nothing about the value already being served wrong in the meantime,
which is the gap the next topic's consistency and invalidation material exists to close.

</section>

<section data-section="frontier">

## Frontier

Caffeine's own W-TinyLFU goes further than this topic's simplified admission filter measures: a
real frequency sketch is probabilistic and bounded in memory, aging its counts over time rather
than growing a counter per key forever, and the admission LRU it gates sits in front of a
Segmented LRU rather than a single plain LRU — named here directly from Caffeine's own wiki, not
reproduced, since this topic's own lab uses a single counter per key to keep the comparison
legible.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

An eviction policy alone says nothing about whether a cached value is still correct. The next
topic is the harder problem: cache consistency and invalidation.

</section>
