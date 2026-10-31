<section data-section="outcomes">

## Outcomes

State CAP precisely as a statement about behaviour *during* a partition (PA vs. PC), not a claim
about normal operation; explain what PACELC adds (the normal-case latency-vs-consistency trade, EL
vs. EC); classify real systems (Dynamo/Cassandra as PA/EL, Spanner as PC/EC) and justify the
classification from their own documented designs; name the real failure domains (process, host,
rack, AZ, region) that "a partition" means physically.

</section>

<section data-section="internals">

## Internals

Brewer's own retrospective is explicit that the "2 of 3" formulation is misleading: CAP only
forbids perfect consistency and availability during an actual partition, which is rare, and even
then the choice can be made per-operation, per-subsystem, at very fine granularity — not as one
system-wide decision made once. A system that claims "CA" isn't lying outside a partition; it is
simply describing behavior CAP has nothing to say about until a partition actually happens. Google
itself designs around this: the primary partition usually sits within one datacenter where Paxos
gives global consensus (as in Chubby) without crossing a wide-area partition at all — the
probability of a true partition is kept low enough that a CA-shaped design is a reasonable bet, not
a violation of the theorem. Spanner is the sharpest version of this: it is technically a CP system
(it will sacrifice availability rather than consistency), but because Google's own private network
makes true partitions rare, it is "effectively" CA from an external user's point of view — a
statement about probability, not an exception to the theorem.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating "CA" as a permanent guarantee.** A system built and tested only under normal conditions
can look CA in every demo. The first real partition forces the same choice every CAP-honest system
faces — the only question is whether that choice was made deliberately in advance, or discovered
live, in production, during the outage.

**Assuming a system's partition-time behavior and its normal-case behavior are unrelated.** This
topic's own second predict addresses this directly: a system engineered to give up consistency
under partition (for availability) is very often, by the same underlying design, built to give up
consistency under normal operation too (for latency) — Dynamo does both. Assuming the two choices
are independent misses that they usually come from the same underlying commitment.

</section>

<section data-section="frontier">

## Frontier

PNUTS is the interesting counterexample this topic doesn't build out in full: it decouples the two
PACELC halves, trading consistency for latency under normal operation (EL) but giving up
availability rather than consistency during a partition (PC) — a system whose normal-case and
partition-time choices point in different directions, named here from Abadi's own blog post but
not classified in depth. CockroachDB, TiDB, and other distributed SQL systems built on Raft-style
consensus per range sit in their own PACELC quadrant, covered when distributed SQL architecture is
built directly in a later topic of this section.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every replication topic so far assumed the same data lived on every node. The next topic is the
orthogonal axis: splitting the data itself across nodes, starting with the real schemes for doing
it.

</section>
