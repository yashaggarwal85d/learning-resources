# Sources: Partitioning schemes: range, hash, consistent hashing (`de.partitioning-schemes-range-hash`)

## Distribution Layer (CockroachDB documentation)

URL: https://www.cockroachlabs.com/docs/stable/architecture/distribution-layer
Version: CockroachDB documentation, retrieved 2026-10-30

> To make all data in your cluster accessible from any node, CockroachDB stores data in a monolithic sorted map of key-value pairs. This key-space describes all of the data in your cluster, as well as its location, and is divided into what we call “ranges”, contiguous chunks of the key-space, so that every key can always be found in a single range.

> Efficient scans: By defining the order of data, it’s easy to find data within a particular range during a scan.

> Each table and its secondary indexes initially map to a single range, where each key-value pair in the range represents a single row in the table (also called the primary index because the table is sorted by the primary key) or a single row in a secondary index. As soon as a range reaches , it splits into two ranges.

## Dynamo (Apache Cassandra documentation)

URL: https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html
Version: Apache Cassandra documentation, retrieved 2026-10-30

> Cassandra partitions data over storage nodes using a special form of hashing called consistent hashing. In naive data hashing, you typically allocate keys to buckets by taking a hash of the key modulo the number of buckets. For example, if you want to distribute data to 100 nodes using naive hashing you might assign every node to a bucket between 0 and 100, hash the input key modulo 100, and store the data on the associated bucket. In this naive scheme, however, adding a single node might invalidate almost all of the mappings.

> Cassandra instead maps every node to one or more tokens on a continuous hash ring, and defines ownership by hashing a key onto the ring and then "walking" the ring in one direction, similar to the Chord algorithm. The main difference of consistent hashing to naive data hashing is that when the number of nodes (buckets) to hash into changes, consistent hashing only has to move a small fraction of the keys.

## Consistent Hashing and Random Trees (Karger et al., STOC 1997)

URL: https://www.cs.princeton.edu/courses/archive/fall09/cos518/papers/chash.pdf
Version: STOC 1997, retrieved 2026-10-30

> Consistent hashing may help solve such problems. Like most hashing schemes, consistent hashing assigns a set of items to buckets so that each bin receives roughly the same number of items. Unlike standard hashing schemes, a small change in the bucket set does not induce a total remapping of items to buckets.

## Rendezvous hashing (Wikipedia, restating Thaler & Ravishankar)

URL: https://en.wikipedia.org/wiki/Rendezvous_hashing
Version: retrieved 2026-10-30

> Rendezvous hashing (HRW) is much simpler conceptually and in practice. It also distributes objects uniformly over all sites, given a uniform hash function. Unlike consistent hashing, HRW requires no precomputing or storage of tokens.

> The HRW assignment can be computed independently by any client, since it depends only on the identifiers for the set of sites

The original paper ("A Name-Based Mapping Scheme for Rendezvous", Thaler & Ravishankar, University of Michigan Technical Report CSE-TR-316-96) is hosted at `cs.rutgers.edu`'s course-notes mirror, which serves a broken TLS chain in this sandbox — the same domain-wide `.edu` limitation already documented for Terry et al.'s paper (`de.replication-lag-session-guarantees`'s own `SOURCES.md`). Wikipedia's own rendezvous-hashing article restates the algorithm's own definition and history precisely, with a direct citation chain to the original paper and its follow-up (Thaler & Ravishankar, IEEE/ACM Transactions on Networking, 1998), and is used here the same way Jepsen was used for Terry et al.: quoted directly, with the original paper cited bibliographically.
