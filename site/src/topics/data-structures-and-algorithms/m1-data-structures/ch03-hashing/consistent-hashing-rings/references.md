Last verified: 2026-10-23. Expert sign-off: pending.

- Karger, Lehman, Leighton, Levine, Lewin, Panigrahy, "Consistent Hashing and Random Trees" (STOC 1997) — the original ring-placement mechanism (items and buckets mapped onto "the unit interval," an item owned by its closest bucket) and the paper's own reason for needing more than one point per bucket. [source](https://www.cs.princeton.edu/courses/archive/fall09/cos518/papers/chash.pdf)
- Mirrokni, Thorup, Zadimoghaddam, "Consistent Hashing with Bounded Loads" (arXiv:1608.01350, SODA 2018) — the real, cited guarantee: a configurable balancing parameter capping the busiest server's load while moving only an expected constant number of clients per join or leave. [source](https://arxiv.org/pdf/1608.01350)
- Apache Cassandra, Dynamo-style data-placement architecture documentation (current stable docs) — real production ring-and-clockwise terminology, and a real, dated virtual-node count (256 tokens per node under the older random-allocation scheme). [source](https://cassandra.apache.org/doc/stable/cassandra/architecture/dynamo.html)

Canonical numbers (the fraction of keys that move when a ten-machine ring grows to eleven, averaged
over many independent joins, and the per-machine imbalance with one point per machine versus many
virtual points per machine, on the identical key set) are computed and asserted directly in this
topic's `examples.py`, on this machine, in one run.

Related tracks (see Prerequisites): topic 20 (Resizing and incremental rehashing) for the
single-machine resize this topic's ring join is measured against; topic 16 (Practical hash
functions and HashDoS) for the hash function this topic now applies to machines as well as keys;
*Data Engineering* §5.3 for sharding a distributed store across many machines, building on this
topic's placement mechanism.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=consistent-hashing-rings:%20).
