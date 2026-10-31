# Sources: Shard keys, hot shards and resharding (`de.shard-keys-hot-shards`)

## Reshard (Vitess documentation)

URL: https://vitess.io/docs/reference/vreplication/reshard/
Version: Vitess docs, retrieved 2026-10-30

> Reshard is used to create and manage workflows to horizontally shard an existing keyspace.

> While switching write traffic, we temporarily make the source databases read-only, and wait for the targets to catchup.

## Distribution Layer (CockroachDB documentation)

URL: https://docs.cockroachlabs.com/docs/stable/architecture/distribution-layer
Version: CockroachDB docs, retrieved 2026-10-30

> Once a range reaches that limit, we split it into two smaller ranges (composed of contiguous key spaces).

> During this range split, the node creates a new Raft group containing all of the same members as the range that was split.

## DynamoDB burst and adaptive capacity (AWS documentation)

URL: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/burst-adaptive-capacity.html
Version: AWS documentation, retrieved 2026-10-30

> Adaptive capacity works by automatically and instantly increasing throughput capacity for partitions that receive more traffic.

> If your application drives consistently high traffic to a single item, adaptive capacity might rebalance your data so that a partition contains only that single, frequently accessed item.

## General guidelines for secondary indexes in DynamoDB (AWS documentation)

URL: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-indexes-general.html
Version: AWS documentation, retrieved 2026-10-30

> A global secondary index is considered "global" because queries on the index can span all of the data in the base table, across all partitions.

> A local secondary index is "local" in the sense that every partition of a local secondary index is scoped to a base table partition that has the same partition key value.

Internal cross-reference: this topic uses `de.partitioning-schemes-range-hash`'s own consistent-hashing
and range-partitioning mechanisms as the substrate shard-key choice sits on top of, and hands off to
`de.consensus-inside-data-systems` for the protocol that keeps a resharded cluster's membership agreed on.
