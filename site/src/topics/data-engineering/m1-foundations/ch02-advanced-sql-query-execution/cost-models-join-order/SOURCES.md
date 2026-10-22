# Sources

Quotes are copied word for word from the fetched text in `sources/` (`node scripts/sources.mjs fetch <url> <path>`), checked with `node scripts/sources.mjs check`.

## PostgreSQL 18 docs, §14.1 "Using EXPLAIN" (`using-explain.txt`)

URL: https://www.postgresql.org/docs/current/using-explain.html
Version: PostgreSQL 18 (current stable)

> The very first line (the summary line for the topmost node) has the estimated total execution cost for the plan; it is this number that the planner seeks to minimize.

> The costs are measured in arbitrary units determined by the planner's cost parameters (see Section 19.7.2). Traditional practice is to measure the costs in units of disk page fetches; that is, seq_page_cost is conventionally set to 1.0 and the other cost parameters are set relative to that.

> It's important to understand that the cost of an upper-level node includes the cost of all its child nodes.

> It's also often used for queries that have an ORDER BY condition that matches the index order, because then no extra sorting step is needed to satisfy the ORDER BY.

> These numbers are derived very straightforwardly. If you do:

> SELECT relpages, reltuples FROM pg_class WHERE relname = 'tenk1';

> you will find that tenk1 has 345 disk pages and 10000 rows. The estimated cost is computed as (disk pages read * seq_page_cost) + (rows scanned * cpu_tuple_cost). By default, seq_page_cost is 1.0 and cpu_tuple_cost is 0.01, so the estimated cost is (345 * 1.0) + (10000 * 0.01) = 445.

## PostgreSQL 18 docs, §19.7.2 "Planner Cost Constants" (`runtime-config-query.txt`)

URL: https://www.postgresql.org/docs/current/runtime-config-query.html#RUNTIME-CONFIG-QUERY-CONSTANTS
Version: PostgreSQL 18 (current stable)

> Sets the planner's estimate of the cost of a disk page fetch that is part of a series of sequential fetches. The default is 1.0.

> Sets the planner's estimate of the cost of a non-sequentially-fetched disk page. The default is 4.0.

> Sets the planner's estimate of the cost of processing each row during a query. The default is 0.01.

> Sets the planner's estimate of the cost of processing each index entry during an index scan. The default is 0.005.

> Sets the planner's estimate of the cost of processing each operator or function executed during a query. The default is 0.0025.

## PostgreSQL 18 docs, §19.7.4 "Other Planner Options" (`runtime-config-query.txt`)

URL: https://www.postgresql.org/docs/current/runtime-config-query.html#RUNTIME-CONFIG-QUERY-OTHER
Version: PostgreSQL 18 (current stable)

> The planner will merge sub-queries into upper queries if the resulting FROM list would have no more than this many items. Smaller values reduce planning time but might yield inferior query plans. The default is eight.

> The planner will rewrite explicit JOIN constructs (except FULL JOINs) into lists of FROM items whenever a list of no more than this many items would result. Smaller values reduce planning time but might yield inferior query plans.

> By default, this variable is set the same as from_collapse_limit, which is appropriate for most uses. Setting it to 1 prevents any reordering of explicit JOINs. Thus, the explicit join order specified in the query will be the actual order in which the relations are joined.

> Use genetic query optimization to plan queries with at least this many FROM items involved. (Note that a FULL OUTER JOIN construct counts as only one FROM item.) The default is 12.

## PostgreSQL 18 docs, §14.3 "Controlling the Planner with Explicit JOIN Clauses" (`explicit-joins.txt`)

URL: https://www.postgresql.org/docs/current/explicit-joins.html
Version: PostgreSQL 18 (current stable)

> When a query only involves two or three tables, there aren't many join orders to worry about. But the number of possible join orders grows exponentially as the number of tables expands. Beyond ten or so input tables it's no longer practical to do an exhaustive search of all the possibilities, and even for six or seven tables planning might take an annoyingly long time. When there are too many input tables, the PostgreSQL planner will switch from exhaustive search to a genetic probabilistic search through a limited number of possibilities. (The switch-over threshold is set by the geqo_threshold run-time parameter.) The genetic search takes less time, but it won't necessarily find the best possible plan.

> Constraining the planner's search in this way is a useful technique both for reducing planning time and for directing the planner to a good query plan. If the planner chooses a bad join order by default, you can force it to choose a better order via JOIN syntax — assuming that you know of a better order, that is.

## PostgreSQL 18 docs, §61.1 "Query Handling as a Complex Optimization Problem" (`geqo-intro.txt`)

URL: https://www.postgresql.org/docs/current/geqo-intro.html
Version: PostgreSQL 18 (current stable)

> Among all relational operators the most difficult one to process and optimize is the join. The number of possible query plans grows exponentially with the number of joins in the query.

> The normal PostgreSQL query optimizer performs a near-exhaustive search over the space of alternative strategies. This algorithm, first introduced in IBM's System R database, produces a near-optimal join order, but can take an enormous amount of time and memory space when the number of joins in the query grows large. This makes the ordinary PostgreSQL query optimizer inappropriate for queries that join a large number of tables.

## PostgreSQL 18 docs, §61.3 "Genetic Query Optimization (GEQO) in PostgreSQL" (`geqo-pg-intro.txt`)

URL: https://www.postgresql.org/docs/current/geqo-pg-intro.html
Version: PostgreSQL 18 (current stable)

> The GEQO module approaches the query optimization problem as though it were the well-known traveling salesman problem (TSP). Possible query plans are encoded as integer strings. Each string represents the join order from one relation of the query to the next.

> Usage of a steady state GA (replacement of the least fit individuals in a population, not whole-generational replacement) allows fast convergence towards improved query plans.

> Usage of edge recombination crossover which is especially suited to keep edge losses low for the solution of the TSP by means of a GA;

> In the initial stage, the GEQO code simply generates some possible join sequences at random.

> Join sequences with lower estimated cost are considered "more fit" than those with higher cost. The genetic algorithm discards the least fit candidates. Then new candidates are generated by combining genes of more-fit candidates — that is, by using randomly-chosen portions of known low-cost join sequences to create new sequences for consideration.

## Measured directly (this topic's own schema, real PostgreSQL 16 instance)

URL: n/a — executed locally, not a web source
Version: PostgreSQL 16.15 (the CI/sandbox build available to this session; PostgreSQL 18, the chapter's engine of record, uses the same documented cost formula, collapse-limit mechanics and GEQO algorithm for every behaviour measured below)

Notes (not quotes — this topic's own executed measurements; see `examples.py` for the exact numbers asserted). Schema `cost_demo` in the `shop` database used by topic 19: `j1` (100,000 rows, `flag` true for 1 in 2,000 — 50 rows) through `j12` (each 100,000 rows, `id` 1..100,000, primary key), chained by `id` equality.

- **Seq Scan formula, real table.** `orders` (topic 19's table, now 2,400,000 rows after its own bulk load): `relpages`=46,484, `reltuples`=2,400,000. Hand computation: `46484 * 1.0 + 2400000 * 0.01 = 70484`. `EXPLAIN SELECT * FROM orders;` → `Seq Scan on orders (cost=0.00..70484.00 rows=2400000 width=48)` — exact match.
- **`join_collapse_limit`, same 9-table query written in a deliberately bad order** (`j9 JOIN j8 ON ... JOIN j1`, filter on `j1.flag` applied last): `join_collapse_limit = 1` (preserve the literal written order) → total cost **23837.70** (a chain of Hash Joins over the full 100,000-row tables before the filter ever applies). `join_collapse_limit = 20` (let the planner reorder freely) → total cost **1697.40** (reorders to start from the 50-row filtered `j1`, then index-nested-loops the rest). Same query, same data, written order unchanged — only the collapse limit changed.
- **Same 9 tables, written in the good order** (`j1 JOIN j2 ON ... JOIN j9`), default `join_collapse_limit = 8`: total cost **1700.90** — close to the unconstrained optimum (1697.40) because the query was already written well.
- **`geqo_threshold`, planning-time curve, exhaustive search forced (`SET geqo = off`), comma-list `FROM` with a chain of equality joins and the same `j1.flag` filter:**

  | FROM items (n) | planning time | plan cost |
  |---|---|---|
  | 8 | 36 ms | 1687.56 |
  | 10 | 224 ms | 1714.24 |
  | 12 | 1,740 ms | 1740.93 |
  | 13 | 5,141 ms | 1754.27 |
  | 14 | 36,147 ms | 1767.61 |
  | 16 | did not return — the backend had to be restarted before the server would accept new connections again | — |

- **Same n=12 and n=13 queries, GEQO engaged (default `geqo_threshold = 12`, `geqo = on`):** n=12 → 132 ms, cost **1740.92** (matches the exhaustive-search cost exactly); n=13 → 125 ms, cost **1754.26** (matches exactly). GEQO found the same-cost plan roughly 13× (n=12) and 41× (n=13) faster here — this topic's own measurement, not a documented guarantee; the docs state plainly that GEQO "won't necessarily find the best possible plan" every time.
- **Join-order tree count, verified by brute-force enumeration against the closed-form count `(2n-2)!/(n-1)!`** (both computed in Python, agreeing for n=2..6 before trusting the formula for larger n): n=8 → 17,297,280; n=10 → 17,643,225,600; n=12 → 28,158,588,057,600; n=14 → 64,764,752,532,480,000; n=16 → 202,843,204,931,727,360,000.
- **An "interesting order" avoiding a Sort, real measurement.** `SELECT order_id, amount FROM orders WHERE order_id < 1000 ORDER BY order_id`. Before any index on `order_id`: `Gather Merge (cost=59999.51..60084.45 ...) -> Sort (cost=58999.48..59000.39 ...) -> Parallel Seq Scan`, total cost **60084.45**. After `CREATE INDEX orders_order_id_idx ON orders(order_id)`: `Index Scan using orders_order_id_idx (cost=0.43..53.19 ...)`, total cost **53.19** — the Sort node disappears entirely because the index already produces rows in the order the query asked for. Same table, same query, same WHERE and ORDER BY; only the access path's own output order changed.
