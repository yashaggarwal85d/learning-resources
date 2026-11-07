## Cassandra: Dataset Partitioning (Dynamo architecture docs)

URL: https://cassandra.apache.org/doc/stable/cassandra/architecture/dynamo.html
Version: stable docs, fetched 2026-11-07

> Dataset Partitioning: Consistent Hashing

> Consistent Hashing using a Token Ring

> consistent hashing only has to move a small fraction of the keys.

> Multiple Tokens per Physical Node (vnodes)

Notes: Cassandra names its ring "consistent hashing using a token ring" directly in a section
heading, and gives virtual nodes (several tokens per physical node) as the fix for the
imbalance a single token per node has at small cluster sizes.

## Redis Cluster specification

URL: https://raw.githubusercontent.com/redis/redis-doc/master/docs/reference/cluster-spec.md
Version: `master`, fetched 2026-11-07

> The cluster's key space is split into 16384 slots, effectively setting an upper limit

> Each master node in a cluster handles a subset of the 16384 hash slots.

> HASH_SLOT = CRC16(key) mod 16384

> because multi-key commands are only limited to *near* keys, data is never moved between nodes
> except when resharding.

> `CLUSTER SETSLOT` slot MIGRATING node

Notes: Redis Cluster's key space is a fixed table of 16,384 slots, not a ring; a key's slot is
computed directly by a hash modulo the slot count, and ownership of whole slots is what moves
during a resharding operation, via an explicit per-slot migrating/importing handshake.

## Kafka BuiltInPartitioner.java

URL: https://raw.githubusercontent.com/apache/kafka/trunk/clients/src/main/java/org/apache/kafka/clients/producer/internals/BuiltInPartitioner.java
Version: `trunk`, fetched 2026-11-07

> return Utils.toPositive(Utils.murmur2(serializedKey)) % numPartitions;

Notes: `partitionForKey` computes a keyed record's partition directly as a hash of the key,
modulo the current partition count — plain modulo hashing, not consistent hashing; changing
`numPartitions` remaps essentially every key, the behavior this topic's three-way chart
measures against the ring and the fixed-slot table.

## HAProxy configuration manual: hash-balance-factor

URL: https://docs.haproxy.org/2.9/configuration.html
Version: 2.9.15, fetched 2026-11-07

> the control for the maximum number of concurrent requests to
> send to a server, expressed as a percentage of the average number
> of concurrent requests across all of the active servers.

> If the first-choice server is disqualified, the algorithm will choose another
> server based on the request hash, until a server with additional capacity is
> found.

> Setting <factor> to 0 (the default) disables the feature.

Notes: HAProxy's `hash-balance-factor`, used together with `hash-type consistent`, is a direct
implementation of bounded-load consistent hashing: a server disqualified for being over its
share of the average load is skipped in favor of the next server the same request hash would
choose, repeated until one with spare capacity is found. The feature is off by default
(factor 0).

## Chapter 3 (consistent hashing and the ring) and Chapter 10 (anti-entropy repair), this repo

URL: (internal) site/src/topics/registry.ts — Chapter 3 entries
Version: as live on `main`, read 2026-11-07

Notes: the textbook ring, virtual nodes, minimal remapping and bounded-load algorithm are
assumed taught already (Chapter 3) and only reused, never re-derived, per CHAPTER.md's scope
line for this topic.
