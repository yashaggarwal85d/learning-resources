# References

- Apache Cassandra, "Dynamo" (Dataset Partitioning), architecture documentation, stable.
  [Dynamo](https://cassandra.apache.org/doc/stable/cassandra/architecture/dynamo.html) —
  fetched 2026-11-07. Read for the token-ring name and virtual nodes.
- Redis, "Redis Cluster Specification", `redis-doc`, `master` branch.
  [cluster-spec.md](https://raw.githubusercontent.com/redis/redis-doc/master/docs/reference/cluster-spec.md)
  — fetched 2026-11-07. Read for the fixed slot table, the slot hash formula, and the
  migrating/importing resharding handshake.
- Apache Kafka, "BuiltInPartitioner.java", source code, `trunk` branch.
  [BuiltInPartitioner.java](https://raw.githubusercontent.com/apache/kafka/trunk/clients/src/main/java/org/apache/kafka/clients/producer/internals/BuiltInPartitioner.java)
  — fetched 2026-11-07. Read for the keyed partitioner's plain modulo formula.
- HAProxy, "Configuration Manual", 2.9.15.
  [configuration.html](https://docs.haproxy.org/2.9/configuration.html) — fetched 2026-11-07.
  Read for `hash-balance-factor`'s exact bounded-load rule and its default.
- Chapter 3 (consistent hashing rings, and Merkle trees for anti-entropy repair), this site's
  own live topics — read 2026-11-07 for the textbook ring, virtual nodes, minimal remapping and
  bounded-load mechanics this topic assumes rather than repeats.

Last verified: 2026-11-07. Expert sign-off: pending.
