# Sources: Consensus inside data systems (`de.consensus-inside-data-systems`)

## Raft Consensus Algorithm (raft.github.io)

URL: https://raft.github.io/
Version: Raft project site, retrieved 2026-10-30

> Consensus involves multiple servers agreeing on values. Once they reach a decision on a value, that decision is final.

> Typical consensus algorithms make progress when any majority of their servers is available; for example, a cluster of 5 servers can continue to operate even if 2 servers fail. If more servers fail, they stop making progress (but will never return an incorrect result).

## KRaft (Apache Kafka documentation)

URL: https://kafka.apache.org/44/operations/kraft/
Version: Apache Kafka docs, retrieved 2026-10-30

> In KRaft mode each Kafka server can be configured as a controller, a broker, or both using the process.roles property.

> In KRaft mode, specific Kafka servers are selected to be controllers. The servers selected to be controllers will participate in the metadata quorum. Each controller is either an active or a hot standby for the current active controller.

> A majority of the controllers must be alive in order to maintain availability. With 3 controllers, the cluster can tolerate 1 controller failure; with 5 controllers, the cluster can tolerate 2 controller failures.

## etcd versus other key-value stores (etcd documentation)

URL: https://etcd.io/docs/v3.6/learning/why/
Version: etcd docs, retrieved 2026-10-30

> etcd replicates all data within a single consistent replication group.

> Since there's only a single replication group, the modification request only needs to go through the raft protocol to commit.

## Replication Layer (CockroachDB documentation)

URL: https://docs.cockroachlabs.com/docs/stable/architecture/replication-layer
Version: CockroachDB docs, retrieved 2026-10-30

> Ensuring consistency with nodes offline, though, is a challenge many databases fail. To solve this problem, CockroachDB uses a consensus algorithm to require that a quorum of replicas agrees on any changes to a range before those changes are committed.

> The leader, which is elected by Raft and long-lived, coordinates all writes to the Raft group. It heartbeats followers periodically and keeps their logs replicated. In the absence of heartbeats, followers become candidates after randomized election timeouts and proceed to hold new leader elections.

Internal cross-reference: this topic names where Raft and Paxos actually run inside the real
systems `de.shard-keys-hot-shards` (topic 22) and `de.cap-pacelc-practice` (topic 20) already
discussed from the outside (resharding cutovers, PACELC's partition-time trade); Raft and Paxos's
own algorithmic content is assumed as background theory from Chapter 14, per `CHAPTER.md`.
