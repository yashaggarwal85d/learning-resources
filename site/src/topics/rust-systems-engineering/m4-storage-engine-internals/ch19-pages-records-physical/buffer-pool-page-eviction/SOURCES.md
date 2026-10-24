# Sources — Buffer pool and page eviction

## PostgreSQL: pg_buffercache

URL: https://www.postgresql.org/docs/current/pgbuffercache.html
Fetched: 2026-10-24, cached at `sources/pgbuffercache.txt`.

> Is the page dirty?

> Clock-sweep access count

> Number of backends pinning this buffer

> The pg_buffercache_evict_relation() function allows all unpinned shared buffers in the relation to be evicted from the buffer pool given a relation identifier.

## LeanStore

URL: https://raw.githubusercontent.com/leanstore/leanstore/master/README.md
Fetched: 2026-10-24, cached at `sources/leanstore-readme.txt`.

> [LeanStore](https://db.in.tum.de/~leis/papers/leanstore.pdf) is a high-performance OLTP storage engine optimized for many-core CPUs and NVMe SSDs.

> Lightweight buffer manager with pointer swizzling [ICDE'18]

## Crotty, Leis & Pavlo, "Are You Sure You Want to Use MMAP in Your Database Management System?" (CIDR 2022)

URL: https://www.cidrdb.org/cidr2022/papers/p13-crotty.pdf
Fetched: 2026-10-24, cached at `sources/cidr2022-paper.txt`.

> Traditionally, DBMSs implement the movement of pages between secondary storage and memory in a buffer pool, which interacts with secondary storage using system calls like read and write.

> with the DBMS maintaining complete control over how and when it transfers pages.

> The core issue is that, due to transparent paging, the OS can flush a dirty page to secondary storage at any time, irrespective of whether the writing transaction has committed.
