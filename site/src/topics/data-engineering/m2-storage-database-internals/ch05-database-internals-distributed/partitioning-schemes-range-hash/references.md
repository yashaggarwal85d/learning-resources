Last verified: 30 October 2026. No live lab (per `CHAPTER.md`); six real simulations over real key
distributions (`examples.py`), run and confirmed clean: the hot tail range partitioning produces on
a timestamp-ordered workload, the even spread hash partitioning produces on the identical workload,
the real range-scan cost each pays, and the real data-movement cost naive modulo hashing, consistent
hashing, and rendezvous (HRW) hashing each pay on an identical membership change.

- "Distribution Layer": [cockroachlabs.com](https://www.cockroachlabs.com/docs/stable/architecture/distribution-layer). CockroachDB documentation. Range partitioning as actually implemented, including range splits.
- "Dynamo": [cassandra.apache.org](https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html). Apache Cassandra documentation. Consistent hashing via a token ring, and naive modulo hashing's own remap cost.
- Karger et al., "Consistent Hashing and Random Trees" (STOC 1997): [cs.princeton.edu](https://www.cs.princeton.edu/courses/archive/fall09/cos518/papers/chash.pdf). The original consistent-hashing paper.
- "Rendezvous hashing": [en.wikipedia.org](https://en.wikipedia.org/wiki/Rendezvous_hashing). Restating Thaler & Ravishankar's original paper, which is hosted at a `cs.rutgers.edu` course-notes mirror serving a broken TLS chain in this sandbox — cited bibliographically, not quoted.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=partitioning-schemes-range-hash:%20).
