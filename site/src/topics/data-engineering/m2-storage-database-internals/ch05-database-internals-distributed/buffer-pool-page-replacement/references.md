Last verified against these sources: 24 October 2026. Real measurements run in this sandbox
(`examples.py`, against this sandbox's own PostgreSQL 16 cluster via `pg_buffercache` and
`pg_statio_user_tables`, and against a second, real PostgreSQL 18 cluster via `pg_stat_io`): a
real buffer's usage count checked before and after repeated scans; a real, bigger-than-the-pool
table's resident footprint counted directly after a full scan; a real dirtied buffer's flag
checked before and after a real checkpoint; a warm table's own hit counters checked directly;
PostgreSQL 18's `io_method = worker` confirmed with real, measured `bulkread` activity. Double
caching and `O_DIRECT` are disclosed, sourced-only claims, since neither cluster here runs with
`O_DIRECT`.

- PostgreSQL source, "buffer manager README": [github.com](https://raw.githubusercontent.com/postgres/postgres/REL_16_STABLE/src/backend/storage/buffer/README). The clock-sweep algorithm and the buffer-ring replacement strategy, in the engine's own words.
- PostgreSQL docs, "pg_buffercache": [postgresql.org](https://www.postgresql.org/docs/16/pgbuffercache.html). The usage-count column this topic reads directly.
- PostgreSQL docs, "Resource Consumption": [postgresql.org](https://www.postgresql.org/docs/16/runtime-config-resource.html). `shared_buffers`'s own double-caching framing and the VACUUM ring-size knob.
- PostgreSQL docs, "The Cumulative Statistics System": [postgresql.org](https://www.postgresql.org/docs/16/monitoring-stats.html). `heap_blks_read`/`heap_blks_hit`, the real counters this topic measures with.
- PostgreSQL docs, "Resource Consumption" (PostgreSQL 18): [postgresql.org](https://www.postgresql.org/docs/18/runtime-config-resource.html). The `io_method` setting, confirmed for real on this sandbox's second cluster.
- PostgreSQL docs, "Release 18": [postgresql.org](https://www.postgresql.org/docs/18/release-18.html). The asynchronous I/O subsystem this setting belongs to.
- Linux manual pages, "open(2)": [man7.org](https://man7.org/linux/man-pages/man2/open.2.html). The `O_DIRECT` flag this topic contrasts with ordinary double-cached reads.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=buffer-pool-page-replacement:%20).
