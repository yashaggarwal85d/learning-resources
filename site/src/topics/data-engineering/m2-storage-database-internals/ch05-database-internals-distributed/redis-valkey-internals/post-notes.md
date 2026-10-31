<section data-section="outcomes">

## Outcomes

Redis's own command execution is confirmed single-threaded, with I/O threads an opt-in, off by
default extra for socket reads and writes only — named directly against Chapter 4's own asyncio
event loop. RDB and AOF's own documented trade-off (a periodic snapshot that can lose recent
writes, versus a write-by-write log that doesn't) is contrasted directly from Redis's own
documentation. Async replication's own real failover-loss window is reproduced for real against
this sandbox's own master and a real, genuinely frozen-and-resumed replica. Redis Cluster's fixed
hash-slot key space is named as a concrete instance of this chapter's own earlier hash-partitioning
material. The real 2024–2025 licensing history (the move to RSALv2/SSPL, the BSD-licensed Valkey
fork, and Redis 8's later AGPLv3 option) is stated as a genuine platform-selection factor.

</section>

<section data-section="internals">

## Internals

Command execution always runs on Redis's own single thread; I/O threads, when turned on, only
read and write sockets, never execute a command themselves — the same event-loop shape Chapter
4's asyncio model used, with commands standing in for coroutines. RDB persistence snapshots the
whole dataset at set intervals, so an unclean stop loses whatever changed since the last snapshot;
AOF persistence instead logs every write operation for replay, closing that specific gap. Async
replication, Redis's own default, lets a replica apply a write after the primary has already
acknowledged it — the real, measured gap this topic's own lab leg reproduces. Redis Cluster splits
its entire key space into a fixed set of slots, each owned by exactly one node at a time.

</section>

<section data-section="lab">

## Lab

`examples.py` hosts the §5.5 chapter lab's cache-aside-layer and hot-key-expiry-under-concurrency
legs directly, against this sandbox's own real Redis instance and real PostgreSQL cluster: a
cache-aside `fetch_price` function is measured causing zero backing-store queries while a cached
key stays warm, and more than one query the instant it expires under concurrent readers — the real
spike this chapter's own cache-aside material predicts.

The same file also reproduces async replication's own real failover-loss window without racing a
timing window that this sandbox's hardware can't guarantee: a real replica process, already fully
synced, is frozen with a real `SIGSTOP` the instant before a real pipelined write burst is sent to
the master, so the replica's last-known replication offset cannot have advanced while frozen. The
master's new offset minus that frozen offset is a real, measured, nonzero lag, and the burst's very
last key is confirmed absent from the replica at that instant; a real `SIGCONT` then lets the
replica drain the backlog and the lag measurably closes to zero.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting RDB alone for durability.** RDB's own documented trade-off is real: anything written
since the last snapshot is gone on an unclean stop. A team that needs to survive a crash without
losing acknowledged writes has to move to AOF with an aggressive fsync policy instead, as this
topic's own closing scenario asks directly.

**Assuming a replica is caught up the instant a write is acknowledged.** Async replication's own
real, measured lag means a failover at the wrong instant can lose a write the application already
believes succeeded — not a theoretical risk, but one this topic reproduces with a real master and
a real replica.

</section>

<section data-section="frontier">

## Frontier

Valkey's own roadmap, run by its own open community under the Linux Foundation rather than by one
company, has since diverged from Redis's in ways this topic's own sources don't track in detail
(release cadence, feature parity, and governance decisions each fork makes independently) — named
here as a real, ongoing divergence worth watching rather than measured directly, since it is still
unfolding rather than settled history the way the 2024 fork itself already is.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A cache in front of a database is one read-side pattern. The next topic is a different one this
chapter hasn't yet connected to Chapter 3's own warehouse material: pre-aggregated, analytical
serving layers.

</section>
