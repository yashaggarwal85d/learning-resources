# Sources — Consistent hashing rings

## Karger, Lehman, Leighton, Levine, Lewin, Panigrahy, "Consistent Hashing and Random Trees" (STOC 1997)

URL: https://www.cs.princeton.edu/courses/archive/fall09/cos518/papers/chash.pdf
Version: the paper's own PDF, as hosted by Princeton's COS 518 course archive, fetched 2026-10-23

> The function rB maps buckets randomly to the unit interval, and rI
does the same for items.

> In other words, i is mapped to the
bucket "closest" to i.

> we actually need to have more than one point in the unit interval associated with each bucket.

Contents:
- The original ring-placement mechanism, in the paper's own terms: items and buckets (machines) are both mapped onto the same continuous range ("the unit interval"), and an item belongs to whichever bucket's point is closest to it — the same idea this topic draws as a circular ring with clockwise placement.
- The original statement of the virtual-node idea, directly from the paper that introduced consistent hashing: a single point per bucket isn't enough, so each bucket needs "more than one point" — the paper's own reason for replicating each bucket's position multiple times, before any secondary source's retelling of "virtual nodes."

## Mirrokni, Thorup, Zadimoghaddam, "Consistent Hashing with Bounded Loads" (arXiv, SODA 2018)

URL: https://arxiv.org/pdf/1608.01350
Version: arXiv:1608.01350, fetched 2026-10-23

> with n clients and n servers, we get a guaranteed max-load of 2, while only moving an expected constant number of clients each time a client or server is added or removed.

> the system designer can specify a balancing parameter c = 1+ε, guaranteeing that the maximum load is at most

Contents:
- The paper's own actual stated guarantee, read in full rather than simplified past correctness: a configurable balancing parameter c = 1+ε bounds the maximum load any one server can carry, while still moving only an expected constant number of clients per join/leave — the real extension this topic's syllabus clause names, cited to the paper itself.

## Apache Cassandra, "Dynamo" architecture documentation (current, stable docs)

URL: https://cassandra.apache.org/doc/stable/cassandra/architecture/dynamo.html
Version: Cassandra's current stable documentation, fetched 2026-10-23

> Cassandra instead maps every node to one or more tokens on a continuous
hash ring, and defines ownership by hashing a key onto the ring and then
"walking" the ring in one direction, similar to the Chord algorithm.

> we "walk" the ring in a clockwise fashion until we
encounter three distinct nodes, at which point we have found all the
replicas of that key.

> The Dynamo paper advocates for the use of "virtual nodes" to solve this
imbalance problem. Virtual nodes solve the problem by assigning multiple
tokens in the token ring to each physical node.

> the default number of tokens per node had to be quite high, at 256.

Contents:
- A real, current, named production system's own description of ring placement using the exact "walk the ring... clockwise" language this topic's visual metaphor is built on, not an invented framing.
- A real, dated, concrete virtual-node count from a production system's own documentation: 256 tokens per node under Cassandra's older random-allocation scheme, verified against the source's own current text rather than a remembered or assumed number — and the source's own note that a newer, deterministic allocator needs far fewer.
