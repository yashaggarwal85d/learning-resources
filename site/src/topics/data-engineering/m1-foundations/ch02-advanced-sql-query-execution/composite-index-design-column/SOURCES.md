Fetched: 2026-10-22.

## PostgreSQL 18 documentation, §11.3 "Multicolumn Indexes"
URL: https://www.postgresql.org/docs/18/indexes-multicolumn.html
> A multicolumn B-tree index can be used with query conditions that involve any subset of the index's columns, but the index is most efficient when there are constraints on the leading (leftmost) columns.

> The exact rule is that equality constraints on leading columns, plus any inequality constraints on the first column that does not have an equality constraint, will always be used to limit the portion of the index that is scanned.

> If a B-tree index scan can apply the skip scan optimization effectively, it will apply every column constraint when navigating through the index via repeated index searches. This can reduce the portion of the index that has to be read, even though one or more columns (prior to the least significant index column from the query predicate) lacks a conventional equality constraint.

> This generally happens when the query planner expects that repeated WHERE x = N AND y = 7700 searches for every possible value of N (or for every x value that is actually stored in the index) is the fastest possible approach, given the available indexes on the table.

> Multicolumn indexes should be used sparingly. In most situations, an index on a single column is sufficient and saves space and time. Indexes with more than three columns are unlikely to be helpful unless the usage of the table is extremely stylized.

## PostgreSQL 18 documentation, §11.4 "Indexes and ORDER BY"
URL: https://www.postgresql.org/docs/18/indexes-ordering.html
> In addition to simply finding the rows to be returned by a query, an index may be able to deliver them in a specific sorted order. This allows a query's ORDER BY specification to be honored without a separate sorting step.

> An important special case is ORDER BY in combination with LIMIT n: an explicit sort will have to process all the data to identify the first n rows, but if there is an index matching the ORDER BY, the first n rows can be retrieved directly, without scanning the remainder at all.

## PostgreSQL 18 documentation, §11.1 "Introduction"
URL: https://www.postgresql.org/docs/18/indexes-intro.html
> After an index is created, the system has to keep it synchronized with the table. This adds overhead to data manipulation operations.

## PostgreSQL 18 documentation, §E.6.3.1.2 "Indexes" (Release 18 notes)
URL: https://www.postgresql.org/docs/18/release-18.html
> Allow skip scans of btree indexes (Peter Geoghegan)

> This allows multi-column btree indexes to be used in more cases such as when there are no restrictions on the first or early indexed columns (or there are non-equality ones), and there are useful restrictions on later indexed columns.

## Measured directly
URL: n/a — executed locally, not a web source.

**Equality-before-range column order, PostgreSQL 16.15.** A 2,000,000-row table (`idx_demo`) with `a` (1,000 distinct values) and `b` (100,000 distinct values). The same query, `WHERE a = 500 AND b BETWEEN 10000 AND 50000`, run against two single-purpose indexes built one at a time on the identical data: an index on `(a, b)` (equality column leading) answers it with `Buffers: shared hit=1 read=5` and `Execution Time: 0.264 ms`; an index on `(b, a)` (range column leading) answers the exact same query with `Buffers: shared hit=1 read=2183` and `Execution Time: 30.579 ms` — over 400 times the buffer reads and over 100 times the wall-clock time, from column order alone, with `enable_seqscan` forced off in both runs so the planner can't just avoid the slow index by seq-scanning instead.

**Using index order to avoid an explicit sort, PostgreSQL 16.15.** The same `idx_demo` table with an index on `(a, b)`. `SELECT id FROM idx_demo ORDER BY a, b LIMIT 10` (an order the index already produces) runs as a plain `Limit` over an `Index Scan`, no sort node, `Buffers: shared hit=8 read=5`, `Execution Time: 0.095 ms`. `SELECT id FROM idx_demo ORDER BY b, a LIMIT 10` (an order the same index cannot produce, since `b` isn't the leading column) runs instead as a parallel sequential scan feeding a `Sort` node, `Buffers: shared hit=14454 read=6237`, `Execution Time: 177.600 ms`.

**B-tree skip scan, PostgreSQL 16.15 vs. 18.6, same sandbox.** A fresh 2,000,000-row table (`skip_demo`) with `x` (10 distinct values) and `y` (2,000,000 distinct values), indexed on `(x, y)`, built identically on both versions. `SELECT count(*) FROM skip_demo WHERE y = 770000` — a query with no predicate at all on the leading column `x` — on PostgreSQL 16.15: `Buffers: shared hit=178 read=5290`, `Execution Time: 40.896 ms`, the full index scanned once per the single query predicate. On PostgreSQL 18.6, the identical query and index: `Buffers: shared hit=15 read=25`, `Execution Time: 0.198 ms`, with the plan reporting `Index Searches: 12` — roughly one re-search per distinct value of `x` (which has 10 distinct values; 12 is close, not exact, since skip scan's own boundary searches add a couple more), exactly the skip-scan mechanism the release notes and multicolumn-indexes page describe, not a difference in the data or the query.

**Write and storage cost of extra indexes, PostgreSQL 16.15.** Two otherwise-identical 500,000-row tables, each loaded with the same `INSERT ... SELECT`: `write_demo_0` (no indexes) loads in `1084.241 ms`; `write_demo_3` (three single-column indexes, one per non-text column, built before the load) loads the identical data in `5189.528 ms` — about 4.8 times slower. `pg_relation_size`/`pg_indexes_size` after loading: `write_demo_3`'s table itself is 37 MB, the same as `write_demo_0`'s; its three indexes together add another 13 MB with nothing in the query workload to show for it yet.
