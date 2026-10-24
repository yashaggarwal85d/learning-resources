## PostgreSQL buffer manager README (src/backend/storage/buffer/README, REL_16_STABLE)

URL: https://raw.githubusercontent.com/postgres/postgres/REL_16_STABLE/src/backend/storage/buffer/README
Version: REL_16_STABLE

The primary source for the clock-sweep algorithm.

> Each buffer header contains a usage counter, which is incremented (up to a small limit value) whenever the buffer is pinned.

> The "clock hand" is a buffer index, nextVictimBuffer, that moves circularly through all the available buffers.

Why plain clock sweep is skipped for a big scan, and the buffer-ring strategy that replaces it.

> When running a query that needs to access a large number of pages just once, such as VACUUM or a large sequential scan, a different strategy is used. A page that has been touched only by such a scan is unlikely to be needed again soon, so instead of running the normal clock sweep algorithm and blowing out the entire buffer cache, a small ring of buffers is allocated using the normal clock sweep algorithm and those buffers are reused for the whole scan.

> For sequential scans, a 256KB ring is used. That's small enough to fit in L2 cache, which makes transferring pages from OS cache to shared buffer cache efficient.

> VACUUM uses a ring like sequential scans, however, the size of this ring is controlled by the vacuum_buffer_usage_limit GUC. Dirty pages are not removed from the ring. Instead, WAL is flushed if needed to allow reuse of the buffers.

> Bulk writes work similarly to VACUUM. Currently this applies only to COPY IN and CREATE TABLE AS SELECT.

## pg_buffercache — inspect PostgreSQL buffer cache state

URL: https://www.postgresql.org/docs/16/pgbuffercache.html
Version: PostgreSQL 16

> Clock-sweep access count

## 20.4. Resource Consumption

URL: https://www.postgresql.org/docs/16/runtime-config-resource.html#GUC-SHARED-BUFFERS
Version: PostgreSQL 16

The double-caching framing, in the owner's own words.

> because PostgreSQL also relies on the operating system cache, it is unlikely that an allocation of more than 40% of RAM to shared_buffers will work better than a smaller amount

The ring-size knob exposed as a documented setting.

> Specifies the size of the Buffer Access Strategy used by the VACUUM and ANALYZE commands.

> Higher settings can allow VACUUM and ANALYZE to run more quickly, but having too large a setting may cause too many other useful pages to be evicted from shared buffers.

## 28.2. The Cumulative Statistics System

URL: https://www.postgresql.org/docs/16/monitoring-stats.html#MONITORING-PG-STATIO-ALL-TABLES-VIEW
Version: PostgreSQL 16

The real, queryable buffer-hit counters this topic measures with.

> Number of disk blocks read from this table

> Number of buffer hits in this table

## 19.4. Resource Consumption (io_method)

URL: https://www.postgresql.org/docs/18/runtime-config-resource.html#GUC-IO-METHOD
Version: PostgreSQL 18

The async I/O subsystem this sandbox's own PostgreSQL 16 cluster does not have, disclosed as sourced-only.

> worker (execute asynchronous I/O using worker processes)

> io_uring (execute asynchronous I/O using io_uring, requires a build with --with-liburing / -Dliburing)

> The default is worker.

## E.6. Release 18

URL: https://www.postgresql.org/docs/18/release-18.html
Version: PostgreSQL 18

> An asynchronous I/O (AIO) subsystem that can improve performance of sequential scans, bitmap heap scans, vacuums, and other operations.

## open(2) — Linux manual page

URL: https://man7.org/linux/man-pages/man2/open.2.html
Version: Linux man-pages

The O_DIRECT flag this topic contrasts with ordinary double-cached reads.

> Try to minimize cache effects of the I/O to and from this file. In general this will degrade performance, but it is useful in special situations, such as when applications do their own caching.
