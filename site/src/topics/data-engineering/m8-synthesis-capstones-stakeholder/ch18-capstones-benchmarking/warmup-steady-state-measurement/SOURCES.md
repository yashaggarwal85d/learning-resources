## PostgreSQL — 19.4. Resource Consumption (Documentation: 18)

URL: https://www.postgresql.org/docs/current/runtime-config-resource.html
Version: PostgreSQL 18 documentation, current as of research time (2026-10-30)

> If you have a dedicated database server with 1GB or more of RAM, a reasonable starting value for shared_buffers is 25% of the memory in your system. There are some workloads where even larger settings for shared_buffers are effective, but because PostgreSQL also relies on the operating system cache, it is unlikely that an allocation of more than 40% of RAM to shared_buffers will work better than a smaller amount.

Used for: Postgres's own buffer pool (`shared_buffers`) sits on top of the OS page cache as a
second, distinct cache — both are empty on a cold start, which is the mechanism this topic
reproduces directly.

## RocksDB — Overview of RocksDB (project wiki)

URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/RocksDB-Overview.md
Version: facebook/rocksdb wiki, fetched 2026-10-30 (GitHub's own rendered wiki page returns HTTP 403
in this sandbox; the wiki's own source, served from raw.githubusercontent.com, is the same text)

> In the presence of ongoing writes, compactions are needed for space efficiency, read (query) efficiency, and timely data deletion. Compaction removes key-value bindings that have been deleted or overwritten, and re-organizes data for query efficiency. Compactions may occur in multiple threads if configured.

> The entire database is stored in a set of _sstfiles_. When a _memtable_ is full, its content is written out to a file in Level-0 (L0) of the LSM tree. RocksDB removes duplicate and overwritten keys in the memtable when it is flushed to a file in L0. In _compaction_, some files are periodically read in and merged to form larger files, often going into the next LSM level (such as L1, up to Lmax).

Used for: naming LSM compaction debt as a warm-up cause in a storage engine this sandbox does not
run (Postgres is not an LSM store); read for comparison only, not reproduced.

## Georges, Buytaert & Eeckhout — Statistically Rigorous Java Performance Evaluation (OOPSLA 2007)

URL: https://dri.es/files/oopsla07-georges.pdf
Version: OOPSLA'07, October 21–25, 2007, Montréal, Québec, Canada (author-hosted PDF copy)

> There are two issues with quantifying steady-state performance. The first issue is to determine when steady-state performance is reached.

> For each VM invocation i, determine the iteration si
> where steady-state performance is reached, i.e., once the
> coefficient of variation (CoV)1 of the k iterations (si − k
> to si ) falls below a preset threshold, say 0.01 or 0.02.

> Compute the confidence interval for a given confidence
> level across the computed means from the P

Used for: the general benchmarking-methodology convention this topic's own steady-state detector
and repeated-trial reporting follow (a moving-window stability check, then a confidence interval
across repeated runs) — read for the convention and reproduced at this topic's own, much simpler
scale (wall-clock request latency against Postgres, not JVM iteration counts), never claimed as
this paper's own result.
