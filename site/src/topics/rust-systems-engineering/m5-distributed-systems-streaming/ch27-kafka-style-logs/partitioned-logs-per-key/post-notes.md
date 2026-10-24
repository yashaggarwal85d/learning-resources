---
title: "Partitioned logs and per-key ordering"
---

## Outcomes

- Build a real toy multi-partition log: several partitions, each a real, ordered, append-only vector, and a real key-based partitioning function routing each write by `hash(key) % N`.
- Measure that per-key order is genuinely preserved while the partition count stays fixed: every write to a given key lands in the identical partition, in the identical relative order it was written.
- Measure that changing the partition count genuinely reroutes at least one existing key to a different partition.
- Measure that a rerouted key genuinely loses its single-partition order guarantee: its own history splits across the old and the new partition.
- State, from Confluent's own documentation and from the Apache Kafka project's own design document, the real rules this topic's own code measures directly.

## Internals

The routing function here is a plain FNV-1a hash over the key's own bytes, taken modulo the partition count, chosen specifically over Rust's own std `DefaultHasher` because std's own hasher output is explicitly not guaranteed stable across Rust versions; a toy meant to measure a real, repeatable routing rule needs a hash whose output never silently changes under it. The resize scenario keeps every already-written entry exactly where it already lives and only routes new writes by the new count, mirroring how a real partitioned log actually behaves on a resize: existing segments stay put, and only new writes see the new count.

## In production

Confluent's own documentation states the routing rule directly: a single topic log is broken into multiple partitions, and events sharing a key are written to the same partition, so any consumer of a given partition always reads its own events in exactly the order they were written. The Apache Kafka project's own design document describes the log itself in concrete, lower-level terms: the message log a broker maintains is just a directory of files, and log compaction works by a pool of background threads recopying whole log segment files, removing records whose key already appears closer to the head of the log. Real production systems also add a sparse offset index per segment, letting a consumer seek near a target offset without scanning every message in between; that index is a real optimization on top of the same append-only file structure this topic's own code mirrors, not a separate guarantee about ordering.

## The frontier

A production partitioned log also supports partition reassignment tooling that migrates an existing key's own data to its new partition during a resize, rather than leaving it permanently split the way this topic's own toy model does; that migration step is a real operational process this topic does not measure, since the syllabus's own point is the guarantee's own default failure mode, not the tooling built to paper over it. All of this topic's own measured claims run entirely on plain in-memory Rust vectors and a plain hash function, with no file, network, or root access needed.

## Where this goes next

Per-key ordering decides what a single partition promises about the order writes land in; it says nothing yet about what a consumer that crashes mid-way through handling one of those writes is allowed to do about it.
