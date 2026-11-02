<section data-section="outcomes">

## Outcomes

Contrast range partitioning (ordered scans, a real hot-tail problem demonstrated directly) with
hash partitioning (even spread, no range scans); explain consistent hashing with virtual nodes and
rendezvous hashing as two ways to limit data movement on membership change, assuming the algorithm
itself from the Data Structures & Algorithms track; contrast client-side, proxy and coordinator
request routing; state explicitly why partitioning and replication are independent axes, not two
names for the same thing.

</section>

<section data-section="internals">

## Internals

CockroachDB's own ranges start at a single range per table and split once they exceed a size
threshold, which is the mechanism behind the hot tail this topic measures: a table's newest range
is always the one actively absorbing inserts with monotonically increasing keys, and splitting
doesn't fix that — it just creates a new tail range that inherits the exact same problem. Rendezvous
(HRW) hashing's own advantage over a consistent-hash ring isn't movement cost (both move a similarly
small, bounded fraction of keys on a membership change, as `examples.py` confirms) — it's that HRW
needs no shared, precomputed ring state at all: every client computes an owner independently from
just the key and the current node list, which makes it simpler to keep correct across clients that
might not agree on exactly which nodes exist at a given instant. Request routing is a genuinely
separate concern from partitioning or replication: a client-side router needs the full partition map
cached locally (fast, but stale maps cause misrouted requests); a proxy centralizes that map in one
hop a client always trusts; a coordinator-node model (Cassandra's own default) lets any node answer
any request by internally forwarding it to the node that actually owns the key, trading one extra
hop for not requiring clients to know the topology at all.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming adding capacity fixes a hot tail.** This topic's own "Prove it" scenario is the direct
warning: a range-partitioned table keyed by an auto-incrementing ID concentrates every new write on
one partition no matter how many idle nodes sit around it. The fix is a different key design (a
hash prefix, a reversed timestamp, or a genuinely different shard key — the subject of the next
topic), not more nodes.

**Choosing hash partitioning for a table that needs range scans.** This topic's own measured
contrast (`hash_partitioning_cannot_do_an_efficient_range_scan`) shows a small, ordered scan under
hash partitioning touches nearly every partition in the cluster — the exact opposite of what range
partitioning gives for free. Picking hash partitioning for even spread without checking the query
patterns trades a write problem for a read one.

</section>

<section data-section="frontier">

## Frontier

Virtual nodes themselves (how many per physical node, and the trade-off between finer-grained load
balancing and more ring metadata to track) are the Data Structures & Algorithms track's own
territory, assumed here rather than re-taught. Bounded-load consistent hashing (capping how much
any one node can receive, even under a skewed key distribution) is named in the DSA track's own
`dsa.consistent-hashing-rings` and not repeated here.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Partitioning's own clean theory runs into a real practical failure the moment one key gets far more
traffic than the rest. The next topic is exactly that: shard keys and the hot shards a bad one
creates.

</section>
