<section data-section="outcomes">

## Outcomes

Contrast strict two-phase locking (lock what you touch, hold every lock until commit, block
conflicting access, roll back on deadlock) with Serializable Snapshot Isolation (run snapshot
isolation unchanged, track rw-conflicts between concurrent transactions, roll back on a
"dangerous structure" — two adjacent rw-conflict edges through a pivot transaction). Explain
Cahill's own SSI algorithm and Ports & Grittner's Postgres implementation, both read directly
from Postgres's own `README-SSI` design document. Rerun topic 12's exact write-skew scenario
under Postgres `SERIALIZABLE` and observe a real serialization failure where topic 12's
`REPEATABLE READ` let both transactions through. Measure a real, rising abort rate as contention
scales from two concurrent transactions to six, and show a real retry loop succeeding on its
first attempt once it reads the post-commit state.

</section>

<section data-section="internals">

## Internals

Postgres has implemented `SERIALIZABLE` as SSI since version 9.1, built directly on Cahill et
al.'s own algorithm (per `README-SSI`'s own words, "based on the work of Cahill et al."). The
same document explains why SSI can leave ordinary snapshot isolation's own machinery completely
untouched: the dangerous structure needs exactly two *adjacent rw-conflict* edges, never a
write-write conflict or a read-after-write dependency, so SSI only has to add one new kind of
tracking — rw-conflicts between concurrent transactions — on top of everything topic 12 already
built. This is also why SSI's own predicate locks, unlike S2PL's locks, never block anything: they
exist purely to detect the dangerous pattern, not to serialize access to data.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming `SERIALIZABLE` means "no code changes needed."** Every application using Postgres's
own `SERIALIZABLE` level must be prepared to catch a real serialization failure (SQLSTATE
`40001`) and retry the whole transaction from the beginning — this is not an edge case, it is the
documented, expected behavior, confirmed directly in this topic's own `retry_until_success`
reproduction.

**Choosing SSI for a workload concentrated on a small number of hot rows.** This topic's own
measured abort rate (about eighty-three percent at six concurrent transactions sharing one
invariant, up from fifty percent at two) shows directly that SSI's own false-positive cost rises
fastest exactly where read/write overlap is densest — precisely the shape of a few very hot rows
under heavy contention, where strict locking's predictable blocking is often the better trade.

</section>

<section data-section="frontier">

## Frontier

Next-key locking, named in the syllabus scope alongside predicate locks, is S2PL's own answer to
phantoms specifically — locking the gaps between index entries, not only the rows that already
exist — named here only as a destination, since Postgres's own `SERIALIZABLE` uses predicate
locks rather than next-key locks for this purpose. Both of this topic's own routes also assume a
single database engine; neither says anything about a transaction whose writes span two separate
engines, which is topic 16's own subject (2PC), after the next topic opens the locking mechanism
both of today's routes are actually built from.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

SSI aborts on a dangerous structure instead of blocking; strict 2PL blocks instead of aborting.
Both routes still rest on one underlying mechanism neither topic has opened yet: locking itself,
and what happens when it deadlocks.

</section>
