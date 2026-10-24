---
title: "Isolation levels and their anomalies"
---

## Outcomes

- Build a real write-skew history: two on-call doctors, a shared invariant, and two concurrent transactions that each individually preserve it but together violate it.
- Measure that a real snapshot-isolation commit rule (same-key writes only) genuinely lets both transactions through, with the shared invariant genuinely ending up violated.
- Measure that a real, stricter check implementing Adya's own rw-antidependency relation genuinely detects the identical history as unsafe, by finding a two-edge cycle.
- Measure that the same stricter check correctly leaves two entirely unrelated transactions alone, confirming it isn't simply always true.
- State, from PostgreSQL's own documentation, the real definition of a serialization anomaly and the real two-account-class example PostgreSQL's own docs use to show it.

## Internals

The dependency-graph check here implements exactly one relation from Adya's own formalism: a rw-antidependency edge, running from a transaction to the one whose write invalidated a value it read. The "dangerous structure" this topic measures, a cycle of two such edges running in opposite directions between the identical pair of transactions, is the same shape the Cahill et al. (SIGMOD 2008) Serializable Snapshot Isolation algorithm watches for in practice; this topic's own prototype measures the detection rule directly, without implementing that algorithm's own locking and abort machinery.

## In production

PostgreSQL's own documentation states the serialization anomaly directly: the result of successfully committing a group of transactions, inconsistent with every possible one-at-a-time ordering of them. Its own worked example uses two account classes and two sums, instead of this topic's own two doctors, but the anomaly's shape is identical: two transactions, each individually correct given what it read, together producing a result no serial order could have produced. PostgreSQL's own Repeatable Read level is, by its own documentation, its real implementation of snapshot isolation, so this topic's own commit-rule claim is about a real, shipped isolation level, not an abstract definition.

## The frontier

The syllabus names Serializable Snapshot Isolation itself (Cahill et al., SIGMOD 2008) and its PostgreSQL implementation (Ports and Grittner, VLDB 2012) as further material beyond this topic's own core detection rule; this topic measures the rw-antidependency cycle that algorithm is built around, naming the full algorithm in prose rather than separately implementing its locking and retry behavior. All of this topic's own measured claims run entirely on plain in-memory Rust structs, with no file, network, or root access needed.

## Where this goes next

This topic measured which concurrent histories an isolation level allows or forbids; it says nothing about how long the versions those histories created are allowed to stick around afterward, which is exactly where the next topic, version garbage collection and long snapshots, begins.
