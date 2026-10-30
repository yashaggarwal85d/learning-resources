## Dynamo: Amazon's Highly Available Key-value Store (DeCandia et al., SOSP 2007)

URL: https://www.read.seas.harvard.edu/~kohler/class/08w-dsi/decandia07dynamo.pdf
Version: SOSP 2007

> conflicting versions along with a context. The put(key, context,
object) operation determines where the replicas of the object
should be placed based on the associated key, and writes the
replicas to disk. The context encodes system metadata about the
object that is opaque to the caller and includes information such as
the version of the object.

> Dynamo uses vector clocks [12] in order to capture causality
between different versions of the same object. A vector clock is
effectively a list of (node, counter) pairs. One vector clock is
associated with every version of every object. One can determine
whether two versions of an object are on parallel branches or have
a causal ordering, by examine their vector clocks. If the counters
on the first object's clock are less-than-or-equal to all of the nodes
in the second clock, then the first is an ancestor of the second and
can be forgotten. Otherwise, the two changes are considered to be
in conflict and require reconciliation.

> Along with each (node, counter) pair, Dynamo stores a timestamp
that indicates the last time the node updated the data item. When
the number of (node, counter) pairs in the vector clock reaches a
threshold (say 10), the oldest pair is removed from the clock.
Clearly, this truncation scheme can lead to inefficiencies in
reconciliation as the descendant relationships cannot be derived
accurately.

> To illustrate the use of vector clocks, let us consider the example
shown in Figure 3. A client writes a new object. The node (say
Sx) that handles the write for this key increases its sequence
number and uses it to create the data's vector clock. The system
now has the object D1 and its associated clock [(Sx, 1)].

> Now assume some client reads both D3 and D4 (the context will
reflect that both values were found by the read). The read's
context is a summary of the clocks of D3 and D4, namely [(Sx, 2),
(Sy, 1), (Sz, 1)].

> A node that is aware of D3 and
receives D4 will find that there is no causal relation between
them. In other words, there are changes in D3 and D4 that are not
reflected in each other. Both versions of the data must be kept and
presented to a client (upon a read) for semantic reconciliation.

Contents (for the coverage map): the full worked D1–D5 vector-clock example (Figure 3): each coordinator's write incrementing its own entry, a descendant's clock dominating its ancestor's, and two concurrent clocks (D3, D4) neither dominating the other; R/W quorum configuration (named, not this topic's subject); the shopping-cart reconciliation framing that motivates application-side merge.

## Dotted Version Vectors: Logical Clocks for Optimistic Replication (Preguiça, Baquero, Almeida, Fonte, Gonçalves, 2010)

URL: https://arxiv.org/pdf/1011.5808
Version: arXiv:1011.5808, submitted 26 Nov 2010

> However, this approach cannot track causality
among updates submitted to the same server. In the
example, when the update w from the client C2 is
submitted to replica Rb, it will get registered with
the version vector {(b, 2)} and appear to dominate
the previous committed value v with vector {(b, 1)}.
By comparing the version vectors of both updates,
they will not be considered concurrent.

> In practice a last writer wins policy was enforced
with respect to concurrent updates handled in the
same replica node, and, in this case, one concurrent
update was lost.

> In this paper we have introduced dotted version vectors, a novel solution for tracking causal dependencies
among update events. The base idea of our solution is
to efficiently encode the causal history of an update
performed by some client, as a version vector that
encodes the causal history of the previously observed
state and a single event identifier assigned in the server
that receives the update.

Contents (for the coverage map): the formal dotted-version-vector definition (a mapping from identifiers to integers or (m, n) pairs, written as a triple (id, m, n)), used here only to source the plain-English "single event identifier" framing quoted above, not reproduced as notation; the claim that dotted version vectors track causality with information linear in the number of servers, bounded by replication degree, improving on Dynamo's own truncation.

## Causal Context (Riak KV documentation)

URL: https://docs.riak.com/riak/kv/2.2.3/learn/concepts/causal-context/index.html
Version: Riak KV 2.2.3 documentation (fetched 2026-10-30)

> If you set the allow_mult parameter to true for a bucket type, all non-CRDT writes to that bucket type will create siblings in the case of concurrent writes (and occasionally under other
scenarios, e.g. healed network partitions).

> Vector clocks can detect concurrent updates to the same object but they
can't identify which value was associated with each update. If an object
stored in the bucket frequent_updates with the key update_me is
updated by five different clients concurrently and tagged with the same
vector clock, then five values should be created as siblings. However,
depending on the order of delivery of those updates to the different
replicas, sibling values may be duplicated, which can in turn lead to
sibling explosion and thus undue
latency.

> DVVs, on the other hand, identify each value with the update that
created it. If five clients concurrently update the object above (in the
bucket frequent_updates, with the key update_me), each of these
updates will be marked with a dot (a minimal vector clock) that indicates the specific event that introduced it.

> Rather than being potentially unbounded, the
number of sibling values will be proportional to the number of
concurrent updates.

Contents (for the coverage map): siblings as Riak's name for kept, unmerged concurrent versions; `allow_mult` as the setting controlling whether siblings are created at all, versus falling back to timestamp resolution; the direct statement that vector clocks alone cannot distinguish which concurrent update produced which sibling, which is exactly what causes duplicate-sibling explosion, and that DVVs' per-update dot fixes it by bounding siblings to the number of genuinely concurrent updates.

## Time, Clocks, and the Ordering of Events in a Distributed System — internal cross-reference, not re-fetched

URL: internal-not-fetched-lamport-clocks-happens-before-topic
Version: already fetched and quoted for topic 3 (`../lamport-clocks-happens-before/SOURCES.md`); this topic only reuses the `happens-before-partial-order`, `lamport-scalar-clock` and `clock-condition-total-order` concepts topic 3 introduced, with no new claim of its own from that source.
