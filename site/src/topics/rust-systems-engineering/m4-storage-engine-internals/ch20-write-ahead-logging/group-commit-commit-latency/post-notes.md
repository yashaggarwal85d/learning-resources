---
title: "Group commit and commit latency"
---

## Outcomes

- Build a real, minimal leader/follower group-commit implementation: the earliest-ready transaction becomes the leader, waits for others to join, and a single flush covers the whole batch.
- Measure that group commit genuinely uses one flush for a whole batch of transactions, where committing without any grouping costs one flush per transaction.
- Measure that commit latency, not execution time, is what differs across transactions sharing one batch.
- Measure that asynchronous commit's own risk window is real: a crash between its acknowledgment and its actual flush genuinely reveals a false promise.
- State, from PostgreSQL's own documentation, what asynchronous commit actually trades away, and how its own leader/follower mechanism for `commit_delay` works.

## Internals

A false promise is defined precisely: the acknowledgment tick is at or before the crash tick, while the durable tick is strictly after it. That precision matters, because a transaction that was never acknowledged ahead of its own flush — a synchronous one — must never be flagged, regardless of when the crash happens to land. The whole simulation runs on a discrete logical tick counter, not real wall-clock timing or real threads, so every measurement here is exactly reproducible.

## In production

PostgreSQL's own words state the leader/follower mechanism directly: the first process ready to flush waits out the configured interval, while every later-arriving process only waits for that leader's own flush to finish. Its own asynchronous commit trades durability for latency plainly: faster, at the cost that the most recent transactions may be lost if the database crashes — but the risk is data loss, never corruption.

## The frontier

The syllabus names p99 commit latency as the metric flush contention can dominate; this topic's own five-transaction batch measures the same underlying mechanism, the spread in individual commit latencies within one batch, at a scale small enough to show directly, rather than reproducing a full percentile calculation over a large simulated workload. All three of this topic's own measured claims run entirely on in-memory Rust structures and a logical tick counter, with no file, network, or root access needed.

## Where this goes next

A durable, recoverable log says nothing yet about how a single record is actually found among billions without scanning every page; that needs a real, crash-safe index structure.
