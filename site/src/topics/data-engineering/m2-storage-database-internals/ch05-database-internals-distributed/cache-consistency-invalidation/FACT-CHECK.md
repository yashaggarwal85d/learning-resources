# Fact-check — de.cache-consistency-invalidation

## Claim 1: deletes, not updates, are the correct write-path operation
Source: Nishtala et al., "Scaling Memcache at Facebook" (SOURCES.md #1).
> "For write requests, the web server issues SQL statements to the database and then sends a
> delete request to memcache that invalidates any stale data. We choose to delete cached data
> instead of updating it because deletes are idempotent."
Verdict: Confirmed. Idempotency is the explicit, stated reason: a delete sent twice (or out of
order relative to another delete) leaves the cache in the same cold state either way, while an
update sent twice, or out of order relative to another update, can leave the cache holding
whichever value happened to land last — not necessarily the newest one.

## Claim 2: leases arbitrate a stale concurrent write
Source: Nishtala et al. (SOURCES.md #1).
> "Intuitively, a memcached instance gives a lease to a client to set data back into the cache
> when that client experiences a cache miss. ... Verification can fail if memcached has
> invalidated the lease token due to receiving a delete request for that item."
Verdict: Confirmed, and reproduced directly in `examples.py`'s `LeaseCache`: a reader's lease
token, issued on a miss, is invalidated the moment a delete for that key arrives, so the
reader's later stale write-back (carrying the now-invalid token) is rejected rather than stored.

## Claim 3: CDC-driven invalidation reads the database's own commit log
Source: Nishtala et al. (SOURCES.md #1).
> "We deploy invalidation daemons (named mcsqueal) on every database. Each daemon inspects the
> SQL statements that its database commits, extracts any deletes, and broadcasts these deletes
> to the memcache deployment in every frontend cluster in that region."
Verdict: Confirmed. This moves the responsibility for invalidation out of application code (which
can forget) and into infrastructure that reads what the database itself already committed — the
exact property the topic's own "Prove it" step relies on (a forgotten explicit-invalidation call
wouldn't be caught by it, but CDC reading the commit log directly would be).

## Claim 4: per-field staleness, the TAO case study
Source: Bronson et al., "TAO: Facebook's Distributed Data Store for the Social Graph"
(SOURCES.md #2).
> "TAO reads may be marked critical, in which case they will be proxied to the master region.
> We could use critical reads during an authentication process, for example, so that replication
> lag doesn't allow use of stale credentials."
Verdict: Confirmed. TAO's own default is eventual consistency for reads, with a per-request
"critical" marker escalating specific reads (named here as authentication) to the consistent
source — a per-field (or per-request) decision, not a single global consistency setting applied
uniformly to the whole store.

## Claim 5 (this course): the delete-after-write race and the lease fix, reproduced for real
Source: `examples.py`, run directly.
Measured: with the exact interleaving the hook describes and no lease, the cache ends up holding
the stale value ("Alice") while the database already holds the new one ("v2") — confirmed by the
script's own `assert result != database[key]`. With a lease in place, the identical interleaving's
stale write-back is rejected (`accepted is False`) and the cache is left correctly cold rather
than holding stale data.
Verdict: Confirmed by direct computation, not asserted from a source.

## Problem Solving
- The CDC-driven-invalidation quote's first attempt included a footnote marker ("[7]") merged
  into the source text right where the quote needed to continue ("commits [7]. We deploy
  invalidation daemons") — the known footnote-marker gotcha. Fixed by starting the quote after
  the marker instead of trying to quote around it.
- Both usenix.org PDF URLs fetched cleanly on the first attempt; no gated-host substitution was
  needed for this topic.
