## Redis source, `redis.conf` (unstable branch)

URL: https://raw.githubusercontent.com/redis/redis/unstable/redis.conf
Version: Redis source, unstable branch, fetched 2026-10-31

> io-threads 4

> Setting io-threads to 1 will just use the main thread as usual.

Used for: I/O threads as an opt-in, off-by-default setting layered on top of the normal
single-threaded command execution, in the engine's own words, directly from its own default
config file.

## Redis docs — "Redis benchmark"

URL: https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/benchmarks/
Version: Redis documentation, fetched 2026-10-31

> Redis is, mostly, a single-threaded server from the POV of commands execution (actually modern versions of Redis use threads for different things). It is not designed to benefit from multiple CPU cores.

Used for: Redis's own statement that command execution itself is single-threaded, the core of
its concurrency model, with threading reserved for other, separate work (I/O, persistence).

## Redis docs — "Redis persistence"

URL: https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/
Version: Redis documentation, fetched 2026-10-31

> RDB (Redis Database): RDB persistence performs point-in-time snapshots of your dataset at specified intervals.

> AOF (Append Only File): AOF persistence logs every write operation received by the server. These operations can then be replayed again at server startup, reconstructing the original dataset.

> RDB is NOT good if you need to minimize the chance of data loss in case Redis stops working (for example after a power outage). You can configure different save points where an RDB is produced (for instance after at least five minutes and 100 writes against the data set, you can have multiple save points). However you'll usually create an RDB snapshot every five minutes or more, so in case of Redis stopping working without a correct shutdown for any reason you should be prepared to lose the latest minutes of data.

Used for: RDB and AOF's own definitions and RDB's own named durability trade-off against AOF.

## Redis docs — "Redis replication"

URL: https://redis.io/docs/latest/operate/oss_and_stack/management/replication/
Version: Redis documentation, fetched 2026-10-31

> Redis uses by default asynchronous replication, which being low latency and high performance, is the natural replication mode for the vast majority of Redis use cases.

> acknowledged writes can still be lost during a failover, depending on the exact configuration of the Redis persistence.

Used for: async replication as the default, and the engine's own explicit admission that an
acknowledged write can still be lost on a failover — the real risk this topic names.

## Redis docs — "Redis cluster specification"

URL: https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/
Version: Redis documentation, fetched 2026-10-31

> The cluster's key space is split into 16384 slots, effectively setting an upper limit for the cluster size of 16384 master nodes (however, the suggested max size of nodes is on the order of ~ 1000 nodes).

Used for: the 16,384 hash slots, a concrete instance of hash partitioning (topic 21's own
material), in the engine's own specification.

## Redis — "Redis Adopts Dual Source-Available Licensing" (2024)

URL: https://redis.io/blog/redis-adopts-dual-source-available-licensing/
Version: Redis blog, fetched 2026-10-31

> Starting with Redis 7.4, Redis will be dual-licensed under the Redis Source Available License (RSALv2) and Server Side Public License (SSPLv1). Consequently, Redis will no longer be distributed under the three-clause Berkeley Software Distribution (BSD).

Used for: the 2024 move away from BSD to the dual RSALv2/SSPLv1 source-available licenses, in
Redis's own announcement.

## The Linux Foundation — "Linux Foundation Launches Open Source Valkey Community" (2024)

URL: https://www.linuxfoundation.org/press/linux-foundation-launches-open-source-valkey-community
Version: Linux Foundation press release, fetched 2026-10-31

> Today, the Linux Foundation announced its intent to form Valkey, an open source alternative to the Redis in-memory, NoSQL data store. Project contributors quickly gathered maintainer, community, and corporate support to regroup in response to the recent license change announced by Redis Inc. Valkey will continue development on Redis 7.2.4 and will keep the project available for use and distribution under the open source Berkeley Software Distribution (BSD) 3-clause license.

Used for: the BSD-licensed Valkey fork, formed under the Linux Foundation directly in response
to Redis's 2024 licensing change, in the Linux Foundation's own announcement.

## Redis — "Redis is now available under the AGPLv3 open source license" (2025)

URL: https://redis.io/blog/agplv3/
Version: Redis blog, dated May 01, 2025, fetched 2026-10-31

> Adding the OSI-approved AGPL as an additional licensing option for Redis, starting with Redis 8 (available now);

Used for: Redis 8 adding AGPLv3 in May 2025, in the engine's own announcement, confirming the
syllabus's own dated claim.
