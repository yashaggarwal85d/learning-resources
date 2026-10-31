<section data-section="outcomes">

## Outcomes

The delete-after-write race is reproduced for real: the exact interleaving from the hook, run
against this course's own cache-aside layer, leaves the cache holding a stale value while the
database already holds the new one. A lease, invalidated by the writer's own delete, closes that
exact race, measured directly rather than argued for. Delete is shown to be the right write-path
operation because it is idempotent, where update is not. CDC-driven invalidation (reading the
database's own commit log) and TAO's own per-field "critical" read are both named from their own
documentation.

</section>

<section data-section="lab">

## Lab

`examples.py` runs the delete-after-write race twice. First, without a lease: a reader's old,
captured read lands in the cache after the writer has already updated the database and deleted
the key, leaving the cache measurably stale (`result != database[key]`). Second, with a minimal
reproduction of Memcache's own lease mechanism: the identical interleaving now has the writer's
delete invalidate the reader's lease token, and the reader's stale write-back is measured being
rejected, leaving the cache correctly cold instead.

This topic also hosts the chapter lab's other two legs (the skipped stampede topic's own
syllabus material, assigned here per `CHAPTER.md`'s own Lab field): an unprotected baseline where
every one of many concurrent readers on an expired key causes its own backing-store fetch; a
single-flight-coalescing cache where the identical readers share one fetch; and a probabilistic
early-expiration function whose refresh chance is measured rising smoothly as a key nears its
TTL, rather than jumping all at once at the exact expiry instant.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming deleting the cache on write is sufficient by itself.** The race this topic's hook
names is a real, documented failure mode even with delete-on-write already in place; leases (or
an equivalent fencing mechanism) are the fix the writer's own delete alone does not provide.

**Trusting every write path to remember to call the invalidation code.** The closing scenario is
a real production pattern: a new write path ships without wiring in cache invalidation at all.
CDC-driven invalidation is immune to this specific failure because it reacts to what the database
itself committed, not to whether application code remembered to call anything.

</section>

<section data-section="frontier">

## Frontier

Memcache's own leases documentation goes further than this topic's lab reproduces: the same
token mechanism is also tuned to mitigate thundering herds, by rate-limiting how often a server
hands out a fresh lease for one key, so that concurrent readers wait briefly for the first
leaseholder to refill the cache rather than all stampeding the database at once — named here
directly from the source, not reproduced, since this topic's own lab isolates the
race-prevention half of leases from the thundering-herd half (the next section's own stampede
topic covers that half directly).

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every pattern in this section so far has been described abstractly, independent of any one real
cache engine. The next topic is one real engine's actual internals: Redis and Valkey.

</section>
