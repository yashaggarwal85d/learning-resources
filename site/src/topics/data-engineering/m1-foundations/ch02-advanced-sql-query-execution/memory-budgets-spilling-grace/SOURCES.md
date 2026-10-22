# Sources

Quotes are copied word for word from the fetched text in `sources/` (`node scripts/sources.mjs fetch <url> <path>`), checked with `node scripts/sources.mjs check`.

## PostgreSQL 18 docs, §19.4 "Resource Consumption" (`runtime-config-resource.txt`)

URL: https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-WORK-MEM
Version: PostgreSQL 18 (current stable)

> Sets the base maximum amount of memory to be used by a query operation (such as a sort or hash table) before writing to temporary disk files. If this value is specified without units, it is taken as kilobytes. The default value is four megabytes (4MB). Note that a complex query might perform several sort and hash operations at the same time, with each operation generally being allowed to use as much memory as this value specifies before it starts to write data into temporary files. Also, several running sessions could be doing such operations concurrently. Therefore, the total memory used could be many times the value of work_mem; it is necessary to keep this fact in mind when choosing the value. Sort operations are used for ORDER BY, DISTINCT, and merge joins. Hash tables are used in hash joins, hash-based aggregation, memoize nodes and hash-based processing of IN subqueries.

> Hash-based operations are generally more sensitive to memory availability than equivalent sort-based operations. The memory limit for a hash table is computed by multiplying work_mem by hash_mem_multiplier. This makes it possible for hash-based operations to use an amount of memory that exceeds the usual work_mem base amount.

> Used to compute the maximum amount of memory that hash-based operations can use. The final limit is determined by multiplying work_mem by hash_mem_multiplier. The default value is 2.0, which makes hash-based operations use twice the usual work_mem base amount.

## PostgreSQL 18 docs, §14.1 "Using EXPLAIN" (`using-explain.txt`)

URL: https://www.postgresql.org/docs/current/using-explain.html
Version: PostgreSQL 18 (current stable)

> If the query requires joining, aggregation, sorting, or other operations on the raw rows, then there will be additional nodes above the scan nodes to perform these operations.

## PostgreSQL 18 source, `src/backend/executor/nodeHash.c` (REL_18_0) (`nodeHash-source.txt`)

URL: https://raw.githubusercontent.com/postgres/postgres/REL_18_0/src/backend/executor/nodeHash.c
Version: PostgreSQL 18.0 source tree, tag REL_18_0

> do nothing if we've decided to shut off growth

> It's a skew tuple, so put it into that hash table

> we never decrease the number of buckets

## Measured directly (this topic's own schema, real PostgreSQL 16 instance)

URL: n/a — executed locally, not a web source

PostgreSQL 16.15, `mem_demo` (2,000,000 rows, `sort_key`/`join_key`/`skew_key` columns), `mem_join_small` (500,000 rows), `mem_join_skew` (495,001 distinct values), via `sudo -u postgres psql -d shop`, `EXPLAIN (ANALYZE, BUFFERS)`, `max_parallel_workers_per_gather = 0` unless noted.

- `ORDER BY sort_key` (no LIMIT), `work_mem = 256MB`: `Sort Method: quicksort  Memory: 111653kB`, Execution Time 828.871–849.199 ms (two runs).
- Same query, `work_mem = 4MB` (the default): `Sort Method: external merge  Disk: 35248kB`, Execution Time 757.355–785.415 ms (two runs) — *faster* than the fully in-memory run, not slower.
- Same query, `work_mem = 128kB`: `Sort Method: external merge  Disk: 35288kB`, Execution Time 1016.723–1065.678 ms (two runs).
- Same query, `work_mem = 64kB`: `Sort Method: external merge  Disk: 35296kB`, Execution Time 1028.168–1089.428 ms (two runs).
- `mem_demo JOIN mem_join_small ON join_key` (`enable_mergejoin = off`, `enable_nestloop = off`), `work_mem = 256MB`: `Buckets: 524288  Batches: 1  Memory Usage: 21675kB`, Execution Time 1451.970 ms.
- Same join, `work_mem = 4MB`: `Buckets: 262144  Batches: 4  Memory Usage: 6440kB`, Execution Time 1429.936 ms.
- Same join, `work_mem = 1MB`: `Buckets: 65536  Batches: 16  Memory Usage: 1610kB`, Execution Time 1204.486 ms.
- Same join, `work_mem = 256kB`: `Buckets: 16384  Batches: 64  Memory Usage: 403kB`, Execution Time 1184.550 ms.
- Same join, `work_mem = 64kB`: `Buckets: 4096  Batches: 256  Memory Usage: 102kB`, Execution Time 1244.820 ms.
- Same join, `work_mem = 4MB`, `hash_mem_multiplier = 1.0`: `Buckets: 131072  Batches: 8  Memory Usage: 3221kB`, Execution Time 1475.117 ms.
- Same join, `work_mem = 4MB`, `hash_mem_multiplier = 4.0`: `Buckets: 524288  Batches: 2  Memory Usage: 12874kB`, Execution Time 1481.917 ms.
- Concurrency: two sessions each running the `work_mem = 4MB` sort above, started together; polling `SELECT count(*), pg_size_pretty(sum(size)) FROM pg_ls_tmpdir();` during overlap showed combined temp usage of 37 MB then 69 MB (approaching 2× one session's own ~35 MB spill) before both finished (each: `Sort Method: external merge  Disk: 35248kB`, Execution Time 764.315–832.159 ms).
- `mem_demo.skew_key`: one value (`1`) carries 20,000 of 2,000,000 rows (1%); every other value carries 1–4 rows. A hash join on `skew_key` at `work_mem = 64kB` still ran as `Buckets: 4096  Batches: 256`, with no separate skew-bucket indicator in `EXPLAIN`'s own output — PostgreSQL's most-common-value skew optimization (confirmed in `nodeHash.c`, not a GUC) isn't independently observable through `EXPLAIN` on this version; noted as a gap in `FACT-CHECK.md` rather than claimed as measured.
