# Sources

Quotes are copied word for word from the fetched text in `sources/` (`node scripts/sources.mjs fetch <url> <path>`), checked with `node scripts/sources.mjs check`.

## PostgreSQL 18 docs, §14.1 "Using EXPLAIN" (`using-explain.txt`)

URL: https://www.postgresql.org/docs/current/using-explain.html
Version: PostgreSQL 18 (current stable)

> In this plan, we have a nested-loop join node with two table scans as inputs, or children.

> The nested-loop join node will run its second, or "inner" child once for each row obtained from the outer child.

> The costs of the loop node are then set on the basis of the cost of the outer scan, plus one repetition of the inner scan for each outer row (10 * 7.90, here), plus a little CPU time for join processing.

> Here, the planner has chosen to use a hash join, in which rows of one table are entered into an in-memory hash table, after which the other table is scanned and the hash table is probed for matches to each row.

> Merge join requires its input data to be sorted on the join keys. In this example each input is sorted by using an index scan to visit the rows in the correct order; but a sequential scan and sort could also be used.

> One way to look at variant plans is to force the planner to disregard whatever strategy it thought was the cheapest, using the enable/disable flags described in Section 19.7.1. (This is a crude tool, but useful. See also Section 14.3.)

## PostgreSQL 18 docs, §19.7.1 "Planner Method Configuration" (`runtime-config-query.txt`)

URL: https://www.postgresql.org/docs/current/runtime-config-query.html#RUNTIME-CONFIG-QUERY-ENABLE
Version: PostgreSQL 18 (current stable)

> Enables or disables the query planner's use of hash-join plan types. The default is on.

> Enables or disables the query planner's use of merge-join plan types. The default is on.

> Enables or disables the query planner's use of nested-loop join plans. It is impossible to suppress nested-loop joins entirely, but turning this variable off discourages the planner from using one if there are other methods available. The default is on.

## PostgreSQL 18 docs, §19.4.1 "Memory" (`runtime-config-resource.txt`)

URL: https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-WORK-MEM
Version: PostgreSQL 18 (current stable)

> Sets the base maximum amount of memory to be used by a query operation (such as a sort or hash table) before writing to temporary disk files. If this value is specified without units, it is taken as kilobytes. The default value is four megabytes (4MB).

> Sort operations are used for ORDER BY, DISTINCT, and merge joins. Hash tables are used in hash joins, hash-based aggregation, memoize nodes and hash-based processing of IN subqueries.

> Hash-based operations are generally more sensitive to memory availability than equivalent sort-based operations. The memory limit for a hash table is computed by multiplying work_mem by hash_mem_multiplier.

## Measured directly (this topic's own schema, real PostgreSQL 16 instance)

URL: n/a — executed locally, not a web source
Version: PostgreSQL 16.15 (the CI/sandbox build available to this session; PostgreSQL 18, the chapter's engine of record, uses the same documented join algorithms and `enable_*`/`work_mem` mechanics measured below)

Notes (not quotes — this topic's own executed measurements; see `examples.py` for the exact numbers asserted). Schema `join_demo` in the `shop` database used by topics 19–20: `customers` (100,000 rows, primary key `customer_id`) and `orders2` (2,000,000 rows, `customer_id` indexed, foreign key to `customers`).

- **Highly selective filtered join, default planner.** `SELECT * FROM customers c JOIN orders2 o ON c.customer_id = o.customer_id WHERE c.customer_id = 42;` (one customer, matching a handful of rows out of 2,000,000): planner chose **Nested Loop**, using the index on `orders2.customer_id` for the inner side. Measured execution time **9.681 ms**.
- **Same filtered join, forced off the planner's own choice.** `SET enable_nestloop = off; SET enable_mergejoin = off;` (both disabled together, after an initial run that only disabled `enable_nestloop` was caught choosing Merge Join instead of Hash Join and re-run correctly): planner forced into **Hash Join**. Measured execution time **141.187 ms** — about 14.6× slower than the Nested Loop plan on the identical filtered query.
- **Full unfiltered join, default planner.** `SELECT * FROM customers c JOIN orders2 o ON c.customer_id = o.customer_id;` (every row of `orders2` matched against `customers`): planner chose **Hash Join** by default. Measured execution time across two separate runs: **339.6 ms** and **383.6 ms**.
- **Same full join, forced Nested Loop.** `SET enable_hashjoin = off; SET enable_mergejoin = off;`: planner forced into **Nested Loop**. Measured execution time **431.269 ms** — slower than the default Hash Join.
- **Same full join, forced Merge Join.** `SET enable_hashjoin = off; SET enable_nestloop = off;`: planner forced into **Merge Join** (both inputs sorted — `customers` already ordered by its primary key, `orders2` sorted explicitly on `customer_id`). Measured execution time **543.876 ms** — the most expensive of the three measured plans on this join, reported as measured rather than adjusted to fit a tidier story.
- **`work_mem` spill, same full join forced to Hash Join.** Default `work_mem` (4MB): hash join ran in **1 batch**, matching the 383.6 ms run above. `SET work_mem = '64kB';` same query, same forced Hash Join: the hash table no longer fit in memory, and `EXPLAIN (ANALYZE)` reported **64 batches** — execution time **413.237 ms**, versus 383.577 ms at 1 batch. The hash join got slower once it had to spill to temporary disk files across many batches, though the increase (≈7.7%) was far smaller than the nested-loop-vs-hash-join gap on the filtered query above.
- **Inequality predicate, nested loop unsuppressible.** `SELECT * FROM customers c JOIN orders2 o ON o.customer_id > c.customer_id - 1 AND o.customer_id < c.customer_id + 1 WHERE c.customer_id = 42;` — an inequality-shaped join condition on the same tables, with `SET enable_nestloop = off;`. The planner still produced a **Nested Loop** plan; `EXPLAIN` showed the alternative paths priced at an inflated cost (on the order of `1e10`) rather than disappearing, directly matching the documented "It is impossible to suppress nested-loop joins entirely" (§19.7.1) rather than just citing it.
