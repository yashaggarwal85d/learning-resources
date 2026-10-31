# Outline — de.redis-valkey-internals

## Outcomes (from CHAPTER.md)

Explain Redis/Valkey's single-threaded event loop with I/O threads as its own concurrency model,
directly against Chapter 4's asyncio event loop for contrast; contrast RDB and AOF persistence;
explain async replication's own real failover data-loss risk, demonstrated against this
sandbox's real instance; name Redis Cluster's 16,384 hash slots as a concrete instance of topic
21's hash partitioning; state the real 2024–2025 licensing history as a genuine
platform-selection factor.

## 9-step storyboard (full, ~15 min)

1. **Hook.** A real Redis instance, in this sandbox, running every command on a single thread —
   and yet handling tens of thousands of operations a second. How does single-threaded code reach
   that throughput?
2. **Predict: is Redis's speed despite being single-threaded, or because of it.** (Correct:
   largely because of it — a single thread never pays for locks, context switches, or
   coordination between cores; the cost it avoids is bigger than the parallelism it gives up.)
3. **Reveal: the event loop, with optional I/O threads.** Command execution itself stays on one
   thread; I/O threads are an opt-in, off-by-default extra for socket reads and writes only —
   named directly against Chapter 4's own asyncio event loop. No takeaway (reel test's reference
   step).
4. **Reveal: RDB vs AOF.** RDB snapshots the whole dataset periodically; AOF logs every write.
   Measured directly against this sandbox's real instance: an unclean restart loses whatever
   changed since the last RDB snapshot. Takeaway.
5. **Reveal: async replication's real failover loss.** Reproduced for real against this
   sandbox's own replica: a write acknowledged by the master is not yet visible on the replica,
   and if the master fails at that instant, that acknowledged write is gone. Takeaway.
6. **Reveal: Redis Cluster's 16,384 hash slots.** A concrete instance of topic 21's own hash
   partitioning: every key maps to one of a fixed 16,384 slots, each owned by one node. Takeaway.
7. **Reveal: the licensing history.** BSD, until 2024's move to RSALv2/SSPL; the BSD-licensed
   Valkey fork, formed the same year under the Linux Foundation; Redis 8 adding AGPLv3 in 2025.
   Takeaway.
8. **Recap.**
9. **Prove it.** A team needs a cache that must never lose an acknowledged write, even across a
   crash. Which of this topic's own defaults would they have to change, and to what?
   (Correct: AOF with an aggressive fsync policy instead of relying on RDB snapshots alone — RDB
   alone accepts losing whatever changed since the last snapshot by design.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (the single-threaded event loop and opt-in I/O threads, against Chapter 4's
asyncio loop; RDB vs AOF; async replication's own failover risk; Cluster's 16,384 hash slots);
Lab (a real cache-aside layer against this sandbox's real Redis instance, with a real hot-key
expiry under concurrent readers measured directly, hosting the chapter lab's own legs); Production
(the failover data-loss risk this topic measures, and the "Prove it" step's own AOF fix);
Frontier (why Valkey's own roadmap diverges from Redis's after the 2024 fork); Where this goes
next (a cache in front of a database is one read-side pattern; analytical serving layers are a
different one).

## Bridge / handoff

Bridge (answers topic 26's handoff verbatim): "Every pattern in this section so far has been
described abstractly, independent of any one real cache engine. This topic is one real engine's
actual internals: Redis/Valkey's own event loop, persistence model, replication, and the real
licensing history that now decides which of the two you actually choose."

Handoff: "A cache in front of a database is one read-side pattern. The next topic is a different
one this chapter hasn't yet connected to Chapter 3's own warehouse material: pre-aggregated,
analytical serving layers."

## Concept ledger

Introduces: `redis-valkey-internals`. Uses: `cache-patterns-eviction`. Declared: the asyncio
event loop from Chapter 4, used directly for contrast.

## Claims list (for FACT-CHECK.md)

1. Redis's own documentation/source: command execution is single-threaded by default; I/O
   threads are an opt-in, off-by-default extra layered on top, for socket reads/writes only.
2. Redis's own documentation: RDB snapshots the dataset periodically (losing whatever changed
   since the last snapshot on an unclean stop); AOF logs every write operation for replay.
3. Redis's own documentation: replication is asynchronous by default, and an acknowledged write
   can still be lost during a failover.
4. Redis's own specification: Redis Cluster's key space is split into 16,384 fixed hash slots,
   each owned by one node at a time.
5. Redis's and the Linux Foundation's own announcements: the 2024 move to RSALv2/SSPL, the
   BSD-licensed Valkey fork formed the same year under the Linux Foundation, and Redis 8 adding
   AGPLv3 in May 2025.
6. (This course) async replication's own failover data-loss risk, reproduced for real against a
   real Redis instance and a real connected replica, computed directly in examples.py.
