---
title: "Acknowledgement points define durability"
---

## Outcomes

- Build a real toy leader-plus-replicas log with three distinct acknowledgement policies: accepted by a subset, durably recorded by the leader alone, persisted by a real quorum.
- Measure that a write acknowledged by a subset smaller than a quorum genuinely gets lost once the leader is destroyed.
- Measure that a write durably recorded by the leader alone also genuinely gets lost on the identical leader destruction, since it never reached any other node.
- Measure that a write persisted by a real quorum genuinely survives the identical leader destruction, with the quorum's own threshold matching the real majority arithmetic exactly.
- State, from Kafka's own documentation on acknowledgement and minimum in-sync replica settings, the real production trade-off between these acknowledgement points.

## Internals

All three policies here run the identical write id through the identical three-node cluster and the identical leader-destruction function, so the measured difference in survival is attributable only to the acknowledgement threshold each policy uses, computed by a genuine majority function rather than a hard-coded constant. Node destruction is modeled as the complete removal of that node's own state, not a process restart with its disk intact, matching the failure model a real quorum is built to tolerate. The deliberately identical threshold used for the subset policy and the leader-only-durable policy is the point: both lose the write identically, because durability on one node is not protection against that one node's own destruction.

## In production

Kafka's own documentation states the weakest of these policies directly: if the leader fails immediately after acknowledging a record but before any follower has replicated it, the record is lost. Its own documentation on `min.insync.replicas` names the real setting that turns a quorum requirement into an enforced guarantee, causing the producer to raise an exception whenever the in-sync replica set falls below that minimum. These are not hypothetical edge cases; they are the documented behavior of a widely deployed production system.

## The frontier

Kafka's own architecture has run on its own consensus protocol (no separate coordination service) since its 4.0 release in March 2025, and the Raft paper's own commitment rule generalizes the quorum reasoning measured here to leader election itself. Both are named in prose rather than separately measured in this topic, whose own job is the simpler, foundational question those further systems are themselves built to answer: which single point counts as acknowledged. All of this topic's own measured claims run entirely on plain in-memory Rust structs and vectors, with no real network I/O or multiple real machines needed.

## Where this goes next

Choosing an acknowledgement point decides what a single write survives; it says nothing yet about whether an entire recorded history of many concurrent reads and writes, gathered while real failures are happening, is even consistent with any honest order at all. That question is the next topic's own.
