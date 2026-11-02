# Fact-check — de.redis-valkey-internals

## Claim 1: command execution is single-threaded by default; I/O threads are an opt-in extra
Source: Redis docs, "Redis benchmark" (SOURCES.md #2), and `redis.conf` (SOURCES.md #1).
> "Redis is, mostly, a single-threaded server from the POV of commands execution (actually modern
> versions of Redis use threads for different things). It is not designed to benefit from multiple
> CPU cores."
> "Setting io-threads to 1 will just use the main thread as usual."
Verdict: Confirmed. Command execution itself stays on one thread; the config file's own default
(`io-threads 4` only takes effect for socket I/O, and `io-threads 1` is explicitly described as
"the main thread as usual") shows the extra threads are a separate, opt-in layer for I/O, not for
command execution.

## Claim 2: RDB snapshots periodically (losing changes since the last snapshot); AOF logs every write
Source: Redis docs, "Redis persistence" (SOURCES.md #3).
> "RDB (Redis Database): RDB persistence performs point-in-time snapshots of your dataset at
> specified intervals."
> "AOF (Append Only File): AOF persistence logs every write operation received by the server.
> These operations can then be replayed again at server startup, reconstructing the original
> dataset."
> "RDB is NOT good if you need to minimize the chance of data loss in case Redis stops working
> (for example after a power outage). ... in case of Redis stopping working without a correct
> shutdown for any reason you should be prepared to lose the latest minutes of data."
Verdict: Confirmed. RDB's own named trade-off (losing "the latest minutes of data" on an unclean
stop) is the real durability gap AOF closes by logging every write instead of snapshotting
periodically.

## Claim 3: async replication is the default; an acknowledged write can still be lost on failover
Source: Redis docs, "Redis replication" (SOURCES.md #4).
> "Redis uses by default asynchronous replication, which being low latency and high performance,
> is the natural replication mode for the vast majority of Redis use cases."
> "acknowledged writes can still be lost during a failover, depending on the exact configuration
> of the Redis persistence."
Verdict: Confirmed, and reproduced directly in `examples.py`: a real write burst acknowledged by
the real master is measurably not yet applied on the real replica (a real, nonzero lag in
replication-offset bytes), which is exactly the window this quote names as a failover-loss risk.

## Claim 4: Redis Cluster splits the key space into 16,384 fixed hash slots
Source: Redis docs, "Redis cluster specification" (SOURCES.md #5).
> "The cluster's key space is split into 16384 slots, effectively setting an upper limit for the
> cluster size of 16384 master nodes (however, the suggested max size of nodes is on the order of
> ~ 1000 nodes)."
Verdict: Confirmed. A fixed, named count of 16,384 slots, each ownable by exactly one node — a
concrete instance of hash partitioning (this chapter's own earlier topic 21 material) rather than
a general description.

## Claim 5: the 2024 licensing move and the Valkey fork; Redis 8 adding AGPLv3 in 2025
Source: Redis, "Redis Adopts Dual Source-Available Licensing" (SOURCES.md #6); the Linux
Foundation, "Linux Foundation Launches Open Source Valkey Community" (SOURCES.md #7); Redis,
"Redis is now available under the AGPLv3 open source license" (SOURCES.md #8).
> "Starting with Redis 7.4, Redis will be dual-licensed under the Redis Source Available License
> (RSALv2) and Server Side Public License (SSPLv1). Consequently, Redis will no longer be
> distributed under the three-clause Berkeley Software Distribution (BSD)."
> "Valkey will continue development on Redis 7.2.4 and will keep the project available for use and
> distribution under the open source Berkeley Software Distribution (BSD) 3-clause license."
> "Adding the OSI-approved AGPL as an additional licensing option for Redis, starting with Redis 8
> (available now);"
Verdict: Confirmed on all three dates and licenses: the 2024 BSD-to-RSALv2/SSPLv1 move, the
same-year BSD-licensed Valkey fork under the Linux Foundation, and Redis 8's May 2025 addition of
AGPLv3 — matching the syllabus's own dated claim.

## Claim 6 (this course): async replication's real failover-loss window, reproduced for real
Source: `examples.py`, run directly against a real Redis master and a real, genuinely connected
Redis replica in this sandbox.
Measured: a real pipelined write burst is acknowledged by the master; the replica process is
frozen with a real SIGSTOP the instant before the burst, so its last-known replication offset
cannot have advanced while frozen. The master's new offset minus that frozen offset is a real,
measured, nonzero lag (several megabytes), and the very last written key is confirmed absent on
the replica at that instant. After SIGCONT, the replica drains the backlog and the lag closes to
zero with the last key now present.
Verdict: Confirmed by direct computation, not asserted from a source. (An earlier attempt tried to
catch this race live with `DEBUG SLEEP` on the replica and an external client's own diagnostic
read; that approach was abandoned because the diagnostic read itself queues behind the sleep on
Redis's single command thread and only returns once the sleep — and the replication catch-up it
was trying to observe — has already finished. Freezing the OS process itself, rather than trying
to time a race against it, is what makes the lag reproduce deterministically.)

## Problem Solving
- `redis.conf`'s own lines are `#`-comment-prefixed per physical line on GitHub's raw host; a
  quote spanning more than one wrapped line there fails `sources.mjs check` because the `#` isn't
  stripped. Fixed by quoting only complete single physical lines from that file.
- The RDB-risk paragraph and the Linux Foundation press release were first quoted with a
  truncating "..." mid-sentence, which `sources.mjs check` rejects; fixed by quoting the complete,
  un-truncated paragraph in both cases.
- The cluster-spec quote's first attempt closed the quote before the trailing parenthetical about
  suggested cluster size, which doesn't match the source's real sentence boundary; fixed by
  including the full parenthetical up to the actual period.
- The AGPLv3 quote's first attempt ended in a period where the source actually ends that clause in
  a semicolon; fixed to match exactly.
