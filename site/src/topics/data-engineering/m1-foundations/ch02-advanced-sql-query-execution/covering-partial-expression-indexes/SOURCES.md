Fetched: 2026-10-22.

## PostgreSQL 18 documentation, §11.9 "Index-Only Scans and Covering Indexes"
URL: https://www.postgresql.org/docs/18/indexes-index-only-scans.html
> PostgreSQL tracks, for each page in a table's heap, whether all rows stored in that page are old enough to be visible to all current and future transactions. This information is stored in a bit in the table's visibility map.

> An index-only scan, after finding a candidate index entry, checks the visibility map bit for the corresponding heap page. If it's set, the row is known visible and so the data can be returned with no further work. If it's not set, the heap entry must be visited to find out whether it's visible, so no performance advantage is gained over a standard index scan.

> In short, while an index-only scan is possible given the two fundamental requirements, it will be a win only if a significant fraction of the table's heap pages have their all-visible map bits set.

> To make effective use of the index-only scan feature, you might choose to create a covering index, which is an index specifically designed to include the columns needed by a particular type of query that you run frequently.

## PostgreSQL 18 documentation, §11.8 "Partial Indexes"
URL: https://www.postgresql.org/docs/18/indexes-partial.html
> A partial index is an index built over a subset of a table; the subset is defined by a conditional expression (called the predicate of the partial index). The index contains entries only for those table rows that satisfy the predicate.

> One major reason for using a partial index is to avoid indexing common values. Since a query searching for a common value (one that accounts for more than a few percent of all the table rows) will not use the index anyway, there is no point in keeping those rows in the index at all. This reduces the size of the index, which will speed up those queries that do use the index.

## PostgreSQL 18 documentation, §11.7 "Indexes on Expressions"
URL: https://www.postgresql.org/docs/18/indexes-expressional.html
> An index column need not be just a column of the underlying table, but can be a function or scalar expression computed from one or more columns of the table.

> In both examples above, the system sees the query as just WHERE indexedcolumn = 'constant' and so the speed of the search is equivalent to any other simple index query.

## Measured directly
URL: n/a — executed locally, not a web source.

**INCLUDE columns and index-only scans, PostgreSQL 16.15.** A 2,000,000-row table (`cov_demo`). `SELECT amount FROM cov_demo WHERE status = 5` against a plain index on `(status)`: `Buffers: shared hit=1 read=20808`, `Execution Time: 158.458 ms` (a `Bitmap Heap Scan`, since `amount` isn't in the index). The identical query against an index on `(status) INCLUDE (amount)`: `Index Only Scan`, `Heap Fetches: 0`, `Buffers: shared hit=1 read=854`, `Execution Time: 29.634 ms` — about 24 times fewer buffer reads and over 5 times faster, from adding one payload column to the index.

**Visibility map dependence, PostgreSQL 16.15, same `cov_demo` table and covering index.** Immediately after `VACUUM ANALYZE`: `Heap Fetches: 0`, `Buffers: shared hit=1 read=854`, `Execution Time: 29.634 ms`. After updating every matching row (`UPDATE cov_demo SET amount = amount + 0.01 WHERE status = 5`), the identical query against the identical index: `Heap Fetches: 444014`, `Buffers: shared hit=2781 read=21780`, `Execution Time: 319.894 ms` — the index-only scan's own advantage disappears the moment the visibility map bits for those pages are cleared, even though the index itself didn't change shape. Running `VACUUM` again restores it: `Heap Fetches: 0`, `Buffers: shared hit=804`, `Execution Time: 56.040 ms`.

**Partial indexes over a hot subset, PostgreSQL 16.15.** A 2,000,000-row table (`orders_partial_demo`) with 39,960 rows (2.0%) having `billed = false`. A partial index, `CREATE INDEX ... ON orders_partial_demo (id) WHERE NOT billed OR billed IS NULL`, built alongside a full index on the same column, `CREATE INDEX ... ON orders_partial_demo (id)`: `pg_relation_size` reports the partial index at 896 kB against the full index's 43 MB — about 49 times smaller, for indexing the identical column, because the partial index excludes the 98% of rows the predicate never matches.

**Expression indexes and the planner's exact-expression match requirement, PostgreSQL 16.15.** A 500,000-row table (`people_expr_demo`) with an index on the expression `(first_name || ' ' || last_name)`. `SELECT * FROM people_expr_demo WHERE (first_name || ' ' || last_name) = 'Name12345 Last12345'` (the exact indexed expression): `Index Scan`, `Buffers: shared hit=1 read=3`, `Execution Time: 0.043 ms`. The semantically identical query written with `concat(first_name, ' ', last_name) = 'Name12345 Last12345'` instead: the planner falls back to a `Seq Scan` even with `enable_seqscan` forced off (the cost penalty alone can't make a nonexistent plan appear), `Buffers: shared hit=3679`, `Execution Time: 399.183 ms` — over 9,000 times slower, from writing the identical computation with a different function.
