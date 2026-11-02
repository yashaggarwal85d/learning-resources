Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`): a cache-aside layer's hot-key-expiry spike measured under concurrent readers
against a real Redis instance and a real PostgreSQL cluster; async replication's own real
failover-loss window reproduced against a real master and a real, frozen-and-resumed replica.

- Redis source, `redis.conf` (unstable branch): [raw.githubusercontent.com](https://raw.githubusercontent.com/redis/redis/unstable/redis.conf). I/O threads as an opt-in, off-by-default config setting, in the engine's own default file.
- Redis docs, "Redis benchmark": [redis.io](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/benchmarks/). Command execution's own single-threaded concurrency model.
- Redis docs, "Redis persistence": [redis.io](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/). RDB and AOF's own definitions and RDB's own named durability trade-off.
- Redis docs, "Redis replication": [redis.io](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/). Async replication as the default, and the engine's own admission that an acknowledged write can still be lost on failover.
- Redis docs, "Redis cluster specification": [redis.io](https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/). The fixed hash-slot key space.
- Redis, "Redis Adopts Dual Source-Available Licensing": [redis.io/blog](https://redis.io/blog/redis-adopts-dual-source-available-licensing/). The 2024 move away from BSD.
- The Linux Foundation, "Linux Foundation Launches Open Source Valkey Community": [linuxfoundation.org](https://www.linuxfoundation.org/press/linux-foundation-launches-open-source-valkey-community). The BSD-licensed Valkey fork.
- Redis, "Redis is now available under the AGPLv3 open source license": [redis.io/blog](https://redis.io/blog/agplv3/). Redis 8's later AGPLv3 licensing option.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=redis-valkey-internals:%20).
