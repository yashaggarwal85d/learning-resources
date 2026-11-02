<section data-section="outcomes">

## Outcomes

Name where Raft or Paxos actually runs inside a real data stack (Kafka's KRaft, etcd, per-range
Raft in CockroachDB/TiKV, Multi-Paxos per DynamoDB partition), from each system's own
documentation; state what a commit under consensus costs in round trips; explain, operationally
rather than theoretically, what losing quorum looks like and why a data system stops accepting
writes rather than risk a split-brain.

</section>

<section data-section="internals">

## Internals

A majority quorum's safety doesn't rely on any single majority being special — it relies on an
overlap property. Draw any two majorities from the same fixed group of members, and by the
pigeonhole principle they must share at least one member. That shared member either agreed to only
one of two conflicting values, so both majorities can never have committed different values at the
same point in the log. This is the entire reason a majority suffices and unanimity isn't needed:
unanimity buys nothing extra on top of the overlap guarantee a majority already provides, while
costing full availability the moment even one member is unreachable.

etcd's own documentation is explicit that keeping its entire dataset in a single replication group
is a deliberate trade for simplicity and low latency, made because the data size it targets (up to
a few GB) fits comfortably in one group. CockroachDB and TiKV make the opposite trade at a larger
scale: many small per-range groups, each independently electing its own leader and tracking its
own heartbeats, so that losing one group's quorum is a local event rather than a cluster-wide one
— at the real operational cost of running far more leader elections and heartbeat streams overall.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a quorum loss as "just slow" rather than "refused."** A client retrying against a group
below quorum sees timeouts, which can look superficially like normal slowness — but no write is
silently queued or guessed at; it is refused, by design, until quorum is restored.

**Assuming a cross-shard transaction costs what a normal write costs.** This topic's own second
predict addresses this directly: a transaction touching two consensus groups needs its own
prepare-then-commit round trips on top of each group's own round trip — treating it as "just
another write" for latency budgeting purposes under-counts the real cost.

</section>

<section data-section="frontier">

## Frontier

The algorithmic difference between Raft and Paxos — and Multi-Paxos's own specific variant, as
DynamoDB documents using it per partition — is covered as background theory in Chapter 14, not
re-derived here; this topic's own scope is entirely where that theory runs operationally and what
it costs, not how the underlying agreement protocol itself works. Deeper build-level treatment of
consensus (implementing a Raft-like protocol from scratch) sits in *Rust Systems Engineering*
Chapter 26 and the M7 Capstone C, named here as a cross-reference per `CHAPTER.md` rather than
built out in this topic.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every mechanism in this section — replication, partitioning, consensus — is a building block. The
next topic closes the section by showing a real system (Spanner's pattern) built from all of them
at once.

</section>
