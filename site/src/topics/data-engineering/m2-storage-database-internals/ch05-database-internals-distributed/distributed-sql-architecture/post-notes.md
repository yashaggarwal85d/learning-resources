<section data-section="outcomes">

## Outcomes

Describe the Spanner pattern precisely (a range-sharded keyspace, a consensus group per range,
MVCC with timestamps via TrueTime or a hybrid logical clock, 2PC across ranges) as the composition
of topics 21-23's own mechanisms; name CockroachDB, TiDB and YugabyteDB as real systems following
this pattern and Aurora DSQL's documented alternative (optimistic concurrency, conflict checks
only at commit); state the real latency price distributed SQL pays for this and when "shard a
boring Postgres yourself" wins instead.

</section>

<section data-section="internals">

## Internals

A hybrid logical clock's job is narrower than it sounds: it doesn't need to track real time
accurately — it only needs to never let two causally-related events tie or go backward. The
logical component exists entirely to absorb exactly the kind of skew this topic's own
`examples.py` feeds it; a physical clock reading that repeats or regresses just advances the
logical counter instead of the timestamp going backward. TrueTime's commit-wait adds a second,
separate guarantee on top: without it, two transactions could be assigned timestamps in an order
that doesn't match the order they actually happened in real time. Waiting out the clock's own
stated uncertainty window before making a commit visible is what closes that gap — and it's worth
noting Spanner's own design lets a read-only transaction skip this wait entirely by reading at an
already-safe, already-passed timestamp, a detail this topic names but doesn't build out.

Aurora DSQL's optimistic concurrency control isn't "no coordination" — it's coordination moved to
a different point in time. A pessimistic scheme (like Spanner's own lock table) pays its
coordination cost upfront, blocking a conflicting transaction the moment it touches contended
data. An optimistic scheme pays nothing upfront and instead risks real, wasted work: both
transactions proceed as if uncontested, and only the commit-time check actually detects the
conflict, rejecting whichever transaction lost the race.

</section>

<section data-section="production">

## Production failures this topic warns about

**Reaching for a distributed SQL system by default.** This topic's own Prove It names the
failure directly: every measured cost (the per-range consensus round trip, the two-phase commit,
the commit-wait window) exists to solve a problem — data spread across machines — that a dataset
fitting comfortably on one machine never had in the first place.

**Assuming optimistic concurrency control eliminates contention costs.** It moves the cost, not
removes it — a workload with real, frequent conflicts on the same rows pays in wasted, redone
work under OCC exactly where a pessimistic scheme would have paid in blocked time instead.

</section>

<section data-section="frontier">

## Frontier

TiDB and YugabyteDB are named alongside CockroachDB as following the identical range-sharded,
per-range-consensus pattern, but this topic doesn't build out every difference between the three
(TiDB's separate storage and compute tiers, YugabyteDB's own Raft implementation choices). Aurora
DSQL's own documented limits around optimistic concurrency — exactly which operations can trigger
an OC000 conflict, and how retries should be structured around it — are named from its own
documentation but not exhausted here. The M6 case study the syllabus cross-references (a deeper,
build-level treatment of this pattern) sits outside this topic's own scope entirely.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every mechanism in this chapter so far protected a write. The next section turns to the read side
most of that protection exists for in the first place: caching, starting with the patterns and
eviction policies every cache is built from.

</section>
