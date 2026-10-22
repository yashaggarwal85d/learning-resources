# Chapter 2 plan: Advanced SQL and Query Execution (Data Engineering, Milestone 1)

This is the contract for every topic of Chapter 2. Builders keep to their own entry and read the entries next to theirs. Don't edit this file except to append the next topic's entry in syllabus order, immediately after drafting it.

- **Planned:** 14 October 2026, from `syllabus/data-engineering.md` §2.1–§2.4, continuing straight on from the shipped/held Chapter 1 (`site/src/topics/data-engineering/m1-foundations/ch01-cs-foundations/CHAPTER.md`).
- **Registry fields shared by every topic:** `domain: 'data-engineering'`, `milestone: { number: 1, title: 'Foundations' }`, `chapter: { number: 2, title: 'Advanced SQL and query execution', section: '2.1' | '2.2' | '2.3' | '2.4' }`, `slug` = the folder below `site/src/topics/`. The registry `title` is the syllabus title (the entry's heading) unless the entry names a different **Registry title**; `syllabusTitle` is always the heading's title word for word. An entry with no **Declared** line declares nothing. Every topic here is drafted with `status: 'held'` (it ships only once Chapter 1's own holds are released, in order).
- **Engine of record:** PostgreSQL (current stable: 18, released September 2025) is the default engine for every runnable example and every `EXPLAIN` shown, because it is free, it is what the Chapter 1 I/O-cost topic already used, and its docs are precise about version-by-version changes. DuckDB is the second engine wherever the syllabus names it explicitly (vectorized execution, ASOF JOIN, analytical labs). A topic names any other engine (Snowflake, Spark, Trino, MySQL) only for a feature PostgreSQL and DuckDB don't have, and always states the version.

---

## The chapter

### The problem it solves

Chapter 1 priced the machine a query runs on. This chapter prices and explains the query itself: SQL's actual, often counter-intuitive semantics (bag not set, three-valued NULLs, what EXISTS really tests), the richer constructs real analytical work needs (window functions, recursive CTEs, grouping sets, as-of joins), and — because a data engineer is the one person in the room expected to read a query plan — exactly what happens between typing SQL and getting an answer: parsing, rewriting, cardinality estimation, cost-based join-order search, the physical join and aggregation algorithms, memory budgets and spilling, and the execution engine (interpreted, vectorized or compiled) that actually runs the chosen plan. It closes with the physical-design levers (indexes, partitioning, zone maps, materialized views) that change what a plan costs without changing what the query means. The learner leaves able to predict a query's result exactly (not "probably"), read its EXPLAIN output and know which of six or seven causes is slowing it down, and choose an index or a rewrite that fixes it.

### Order of ideas, and why

1. **§2.1 Relational semantics and advanced query constructs (topics 1–9).** What a query *means* comes before what it *costs*: bag semantics and the algebra (1) → NULLs and three-valued logic, the single biggest source of silently wrong answers (2) → semi/anti-joins, which are EXISTS/NOT IN read correctly (3) → recursive CTEs for hierarchies and graphs (4) → grouping sets/ROLLUP/CUBE for multi-level aggregation (5) → LATERAL and correlated subqueries, the per-row escape hatch (6) → nested/semi-structured data, because modern tables are not flat (7) → UDFs and why they blind the optimizer, which motivates everything in §2.3 (8) → MERGE and concurrent writers, where semantics meets concurrency (9). Each of these is a piece of SQL meaning that §2.2 and §2.3 will take as given.
2. **§2.2 Window functions and temporal joins (10–15).** One construct family, used constantly in analytics, gets its own section: frame semantics (10) → how an engine actually executes a window, which previews §2.3's cost thinking (11) → ranking and dedup built on it (12) → gaps-and-islands/sessionization (13) → running and moving statistics (14) → point-in-time/as-of joins, which need frames, ranking and the recursive-CTE idea of a "latest row" together (15).
3. **§2.3 Query optimizer and execution plans (16–27).** Now that the queries themselves are understood, trace one through the engine: parse to plan tree (16) → rewrites and decorrelation, which is how semi/anti-joins and LATERAL from §2.1 get turned into fast operators (17) → CTE inlining, a rewrite decision with its own fence/no-fence trade-off (18) → cardinality estimation, the numbers every later cost decision depends on (19) → cost models and join-order search, which consume those numbers (20) → the physical join algorithms the search chooses between (21) → aggregation strategies, hash vs sort, mirroring the join choice (22) → memory budgets and spilling, what happens when 20–22's choices don't fit in memory (reusing Chapter 1's I/O model) (23) → execution models (iterator/vectorized/compiled), which decide how fast the chosen plan actually runs per tuple (24) → parallel and distributed plans, scaling 16–24 across cores and machines (25) → adaptive execution, which revisits 19–20's estimates at run time when they were wrong (26) → reading EXPLAIN, which closes the section by naming every number 16–26 produces (27).
4. **§2.4 Physical design and SQL performance (28–32).** Last, the storage-side knobs that change what §2.3's plans cost without changing what §2.1's queries mean: composite indexes (28) → covering/partial/expression indexes, refinements of the same idea (29) → partitioning and partition pruning, which §2.3's rewrite and cost sections already assumed existed (30) → zone maps/BRIN, a lighter-weight alternative for naturally ordered data (31) → materialized views and incremental maintenance, which trade write cost now for read cost later (32). This hands off to Chapter 3 (data modeling), which decides which of these shapes to build in the first place.

### One running example: the shop's analytics warehouse

Same fictional online shop as Chapter 1 (no real company, no real person); its OLTP tables now get the analytical companions this chapter's topics query. A topic may scale a number up or down if it says how that relates to this table. Every number shown on screen is computed or asserted in that topic's own code sample.

| Table | Shape (fixed; don't change these numbers) |
|---|---|
| `orders` | Unchanged from Chapter 1: 100,000,000 rows, columns `order_id`, `customer_id`, `status` (`pending`, `paid`, `shipped`, `delivered`, `refunded`, `cancelled`), `amount` (`DECIMAL(12,2)`), `event_time`, `shipped_at` (NULL until shipped), `referred_by_customer_id` (NULL when there is no referrer — the NULL used by the NOT IN trap). Index on `status` from Chapter 1. 2% of orders are `refunded`. Two columns added for topic 7: `tags` (a `text[]` of zero to three promo tags, e.g. `{bogo,winter_sale}`) and `discount_amounts` (a parallel `numeric[]`, one discount per tag, same length as `tags`); `metadata` (`jsonb`, free-form checkout context: device, UTM parameters, client app version). |
| `order_items` | 300,000,000 rows (an average of 3 items per order): `order_item_id`, `order_id` (FK, indexed), `product_id`, `quantity`, `unit_price`. |
| `products` | 50,000 rows: `product_id`, `category` (200 categories), `name`, `current_price`. |
| `product_components` | A self-referencing bill-of-materials table added for topic 4: `product_id`, `component_product_id`, `quantity`. About 2,000 rows — most products are plain items with no rows here; a few hundred are bundles/kits whose components may themselves be bundles (nested one or two levels deep). Used for the recursive-CTE parts-explosion example. |
| `price_history` | One row per price change per product, about 400,000 rows: `product_id`, `price`, `valid_from` (timestamp). Used by the as-of join (topic 15). |
| `customers` | 2,000,000 rows: `customer_id`, `country`, `signup_date`. Matches the "about 100 MB" dimension size from Chapter 1 at this row count and column set. |
| `page_views` | The "100M-row clickstream" the §2.2 lab names: 100,000,000 rows, columns `customer_id`, `event_time`, `page`, `event_type` (`view`, `add_to_cart`, `purchase`). Used by sessionization (topic 13) and the lab's point-in-time join. |
| Cluster | Unchanged from Chapter 1: 100 machines, 10 Gbit/s each — reused by the parallel/distributed plans topic (25) for exchange operators over `orders` ⋈ `customers`. |

Each topic's slice of the example is given in its entry.

### Shared notation and terms

- **Carries over from Chapter 1 unchanged:** sizes in powers of two (KiB/MiB/GiB/TiB) with PostgreSQL's own "8 KB page" kept where it quotes the engine; time in ns/µs/ms/s; `T(n) = α + n/β`; the I/O-model letters **N** (items), **M** (items fitting in memory), **B** (items per block); logarithms as log_b; `big-o`/`logarithms`/`io-model`/`scan-cost`/`external-sort-passes`/`hash-join`/`hash-aggregation`/`hash-spill`/`sort-merge-join`/`sort-aggregation` are all already introduced (Chapter 1, topics 14–16) and reused, not retaught, in §2.3.
- **Relational algebra symbols** (topic 1 introduces, every later topic may use without re-explaining): σ (selection/`WHERE`), π (projection/`SELECT` list), ⋈ (join), ∪ / ∩ / − (union/intersect/except), γ (group-by/aggregation). A query is read as a tree of these operators, root at the top, same shape the optimizer uses (topic 16).
- **Bag vs set:** a *bag* (multiset) keeps duplicates; a *set* does not. SQL tables and query results are bags by default; `DISTINCT`, `UNION` (no `ALL`), `INTERSECT` and `EXCEPT` (no `ALL`) are the set-deduplicating operators. Topic 1 fixes this; it is used, not re-derived, in every later topic that touches `GROUP BY` or a set operator.
- **Three-valued logic:** `TRUE`, `FALSE`, `UNKNOWN`. A `WHERE` or `JOIN ON` keeps a row only when its condition is `TRUE`; `UNKNOWN` is treated like `FALSE` for filtering but not for `NOT` (`NOT UNKNOWN` is still `UNKNOWN`). Topic 2 fixes this.
- **Cost-model letters for §2.3**, fixed by topic 20 and reused through 26: a plan's **estimated cost** is in arbitrary cost units (PostgreSQL's `seq_page_cost`/`cpu_tuple_cost` scale, not wall-clock); **estimated rows** and **actual rows** are kept apart on screen, following `EXPLAIN (ANALYZE)`'s own columns; **sel** denotes a predicate's selectivity, a fraction in [0, 1].
- **Window-function vocabulary**, fixed by topic 10 and reused through 15: *partition*, *frame*, *peer group* (rows tied on the `ORDER BY` key), `ROWS`/`RANGE`/`GROUPS` framing, `PRECEDING`/`FOLLOWING`/`CURRENT ROW`/`UNBOUNDED`.
- **Spoken numbers:** narration has no digits, symbols or code names (same automatic check as Chapter 1). SQL keywords are spoken as words a person would say them aloud ("select", "group by"), not spelled out letter by letter unless that's how they're actually pronounced (e.g. "S Q L" is acceptable if that's the chosen house pronunciation — state it once in the first topic that says it and keep it consistent).
- **Versions to state, not assume:** PostgreSQL 18 (September 2025) is the baseline; a topic that needs a specific point release (e.g. a feature new in 17 or 18) says so. DuckDB, Snowflake, Spark and BigQuery features are each dated to the version that introduced them.

### The canonical numbers (one owner)

Topics reuse Chapter 1's canonical latency/bandwidth table (owned by its topic 6) without restating it. This chapter adds its own small set of engine constants, each sourced where first used and not re-sourced after:

| Constant | Value | First used by, and source |
|---|---|---|
| PostgreSQL `work_mem` default | 4 MB | Topic 23 (memory budgets), PostgreSQL docs, Resource Consumption |
| PostgreSQL `join_collapse_limit` / `from_collapse_limit` default | 8 | Topic 20 (join-order search), already cited by Chapter 1's held I/O topic |
| PostgreSQL `geqo_threshold` default | 12 FROM items | Topic 20, same source |
| PostgreSQL default statistics target | 100 (per-column histogram/MCV buckets) | Topic 19 (cardinality estimation), PostgreSQL docs, `default_statistics_target` |

### One visual language for the chapter's reels

Builds on Chapter 1's grammar (`crema`/`latte`/`taupe`/`caramel`/`cinnamon`/`cherry`, the same `Stack`/`Svg`/`T`/`Bar`/`C` kit) and adds one new convention this chapter needs:

- **A plan tree is drawn root-at-top, leaves-at-bottom**, operators as boxes connected by edges that carry row-count estimates in `latte` and actual counts in `crema` once they diverge (the `EXPLAIN (ANALYZE)` gap, topic 27's central picture). A caramel highlight marks the operator a topic is explaining; a cherry highlight marks a misestimate or a spill.
- **A table is a strip of rows**; a bag keeps visibly duplicate rows (two identical strips side by side), a set collapses them into one strip with a counted-away ghost in `taupe` (topic 1).
- **NULL is drawn as an empty cell with a dashed border**, never as the text "NULL" where a value would otherwise be shown, so three-valued logic's UNKNOWN can be its own small marker beside TRUE/FALSE (topic 2).
- Full topics keep Chapter 1's reel shape (problem → predict → mechanism in steps → "Back to the problem" → "Prove it"). Refreshers (none are marked `(refresher)` in §2.1–§2.4 of this chapter per the syllabus — this chapter's shortest entries are still full topics, ~10–12 min) keep the same shape at reduced length.

### The chapter labs: who hosts what

| Lab part (syllabus words) | Host topic, Deep dive section |
|---|---|
| §2.1 "SQL semantics trap suite... transpile with SQLGlot" | Topic 2 (NULLs) hosts the NOT IN / COUNT(col) vs COUNT(*) parts, and the SQLGlot transpile-and-diff step as the suite's closing step; topic 5 (grouping sets) hosts the GROUPING() vs data NULLs part; topic 4 (recursive CTEs) hosts the planted-cycle BOM part; topic 9 (MERGE) hosts the two-session race part. |
| §2.2 "sessionize... latest-record dedup... point-in-time join three ways" | Topic 13 (gaps-and-islands/sessionization) hosts sessionization; topic 12 (ranking/dedup) hosts the latest-record dedup; topic 15 (as-of joins) hosts the three-way point-in-time join comparison. |
| §2.3 "Join Order Benchmark... fix with statistics... force join orders... shrink work_mem... DuckDB/Spark plan comparison" | Topic 19 (cardinality estimation) hosts the JOB-and-statistics part; topic 20 (cost models/join order) hosts forcing alternative join orders; topic 23 (memory/spilling) hosts the `work_mem` shrink; topic 25 (parallel/distributed plans) hosts the DuckDB/Spark plan-shape comparison. |
| §2.4 "index design for a 5-query workload... BRIN vs B-tree... incrementally maintained view" | Topic 28 (composite indexes) hosts the 5-query index-design part; topic 31 (zone maps/BRIN) hosts the BRIN vs B-tree comparison; topic 32 (materialized views) hosts the incremental-view freshness measurement. |

---

## The topics, in syllabus order

Folder prefix for every topic: `site/src/topics/data-engineering/m1-foundations/ch02-advanced-sql-query-execution/`. Concept ids are kebab-case. A concept is in `uses` only if a topic above it (in this chapter or Chapter 1) introduces it, and `declared` lists knowledge from another track or that every reader of this course has.

---

### 1. Relational algebra and bag semantics (`de.relational-algebra-bag-semantics`): full, §2.1

- **Folder:** `relational-algebra-bag-semantics`. About 12 min. Opens the chapter on its own problem frame.
- **Scope:**
  - "selection, projection, join, aggregation and set operators... as algebra over multisets": the operator table (σ, π, ⋈, ×, ∪/∩/−, γ) as the tree every query compiles to.
  - "UNION vs UNION ALL, INTERSECT/EXCEPT [ALL]": union-compatibility, precedence/associativity, and the worked double-flagged-order example.
  - "the equivalences optimizers exploit": selection pushdown, projection pushdown, join commutativity/associativity — named here, used without re-derivation by topic 17 (rewrites) and topic 20 (join-order search).
  - "where bag semantics break set intuition (why UNION pays for a dedup)": idempotence failing for bags, and the PostgreSQL planner's own source showing `UNION ALL` as a plain Append vs `UNION` as Append + HashAggregate or Sort+Unique.
  - Leaves NULLs and three-valued logic to topic 2, decorrelation/rewrite mechanics to topic 17, and cost-based join-order search to topic 20.
- **Outcomes:**
  - Translate a query into an operator tree and back.
  - State why SQL is bag-, not set-, based, and where it switches.
  - Use selection/projection pushdown and join commutativity/associativity to predict a legal rewrite; name idempotence as a law that fails for bags.
  - Predict when `UNION` pays for a dedup pass that `UNION ALL` doesn't, and choose the right operator.
- **Introduces:** `relational-algebra`, `bag-semantics`, `set-operators-bags`, `algebraic-equivalences`. **Uses:** none. **Declared:** `sql-select`.
- **Bridge:** "Chapter one priced the machine. Next chapter: SQL, starting with what a query really computes: relational algebra over bags."
- **Handoff:** "Every operator here assumed every value was present. Next: the value that means 'unknown,' and the three-valued logic it forces on every predicate."
- **Prerequisites panel:** basic SQL SELECT/WHERE/JOIN/GROUP BY (declared); Chapter 1 topic 22 (Before this, for the handoff/bridge seam only).
- **Visual idea:** a table drawn as a strip of rows where a bag keeps visibly duplicate rows (two identical strips) and a set collapses them into one strip with a counted-away ghost in taupe. A plan-tree frame shows the same `UNION ALL` query as a bare Append, and the same query as `UNION` with a HashAggregate or Sort+Unique node stacked on top in cherry-adjacent caramel (the "extra pass").
- **Lab:** none of its own; its mechanism (the bag/set distinction and the Append-vs-dedup planner fact) is exercised directly in its own "Try it," not deferred to a chapter lab.
- **Sources:** CMU 15-445/645 Fall 2024 Lecture 1 notes (Pavlo); PostgreSQL 18 docs §7.4; PostgreSQL source `prepunion.c` (`generate_union_paths`) and `nodeSetOp.c`; Codd 1970 (for framing).

### 2. NULLs and three-valued logic (`de.nulls-three-valued-logic`): full, §2.1

- **Folder:** `nulls-three-valued-logic`. About 13 min.
- **Scope:**
  - "UNKNOWN propagation through predicates": the AND/OR/NOT truth tables, quoted from PostgreSQL docs.
  - "`IS [NOT] DISTINCT FROM`": the fix for comparing possibly-null values without degrading to UNKNOWN.
  - "NULLs in aggregates, GROUP BY, joins, UNIQUE constraints and ORDER BY": five clauses, five different rules, laid out side by side.
  - "the classic silent bugs (vanishing rows, COUNT(col) vs COUNT(*))": the `NOT IN` trap (sourced to PostgreSQL's own `IN`/`NOT IN` docs) and the count-column-vs-count-star gap.
  - Leaves the anti-join mechanism (`NOT EXISTS` as the `NOT IN` fix) to topic 3, and `GROUPING()` vs data NULLs to topic 5.
- **Outcomes:**
  - Recite the three-valued truth tables and predict a compound predicate's value.
  - Use `IS [NOT] DISTINCT FROM` correctly.
  - State NULL's rule in each of five clauses without conflating them.
  - Diagnose and fix the `NOT IN` vanishing-rows bug and a `COUNT(col)`/`COUNT(*)` mismatch.
- **Introduces:** `three-valued-logic`, `is-distinct-from`, `null-in-clauses`, `not-in-null-trap`. **Uses:** `relational-algebra`, `bag-semantics`. **Declared:** `sql-select`.
- **Bridge:** "Every operator here assumed every value was present. Next: the value that means 'unknown,' and the three-valued logic it forces on every predicate." (Answers topic 1's handoff.)
- **Handoff:** "Every rule here was about one missing value at a time. Next: what happens when a row might match several others at once, and you only want to know whether any of them exist."
- **Prerequisites panel:** topic 1 (Before this); basic SQL (declared).
- **Visual idea:** a three-way traffic light (true/false/unknown) replacing the usual two-way one; a predicate tree lights each leaf and shows the result propagating up, with UNKNOWN rendered as a distinct dim colour, not the same as the FALSE red. For the NOT IN trap, a chain of "not equal to" links turns one unknown link into the whole chain going dim.
- **Lab:** hosts the §2.1 chapter lab's `NOT IN`/NULL and `COUNT(col)` vs `COUNT(*)` parts, plus the suite's closing SQLGlot cross-dialect transpile-and-diff step.
- **Sources:** PostgreSQL 18 docs §9.1 (Logical Operators), §9.2 (Comparison Functions), §7.3.3 (DISTINCT), §7.5 (Sorting Rows), §9.21 (Aggregate Functions), `CREATE TABLE` (NULLS NOT DISTINCT), §9.24.2–9.24.3 (IN/NOT IN); PostgreSQL 15 release notes; SQLGlot README (GitHub).

### 3. Semi-joins, anti-joins and existence (`de.semi-joins-anti-joins-existence`): full, §2.1

- **Folder:** `semi-joins-anti-joins-existence`. About 13 min.
- **Scope:**
  - "EXISTS / IN / NOT EXISTS / NOT IN vs LEFT JOIN … IS NULL": the semi-join/anti-join definitions and the four SQL spellings' different safety classes.
  - "why NOT IN over a NULL-bearing subquery returns nothing": re-derived here from the planner's proof obligation, not just the truth table (topic 2's angle).
  - "how planners turn these into semi-, anti- and null-aware anti-join operators": PostgreSQL's `convert_EXISTS_sublink_to_join` (unconditional) vs `convert_ANY_sublink_to_join` (nullability-gated for NOT IN), and the `SubPlan` fallback.
  - Leaves decorrelation of more general subqueries to topic 17, and the cost-based choice of join algorithm (nested loop/hash/merge) implementing a semi/anti-join to topic 21.
- **Outcomes:**
  - Define semi-join and anti-join and why neither duplicates rows.
  - Choose correctly among the four existence spellings.
  - Explain the planner's nullability proof for NOT IN → anti-join.
  - Read `Semi`/`Anti` join types (and their absence) in EXPLAIN.
- **Introduces:** `semi-join`, `anti-join`, `null-aware-anti-join-rewrite`. **Uses:** `relational-algebra`, `bag-semantics`, `three-valued-logic`, `not-in-null-trap`. **Declared:** `sql-select`.
- **Bridge:** "Every rule here was about one missing value at a time. Next: what happens when a row might match several others at once, and you only want to know whether any of them exist." (Answers topic 2's handoff.)
- **Handoff:** "So far every question has been about one table at a time. Next: climbing a hierarchy, one level at a time, until there are no more levels left to climb."
- **Prerequisites panel:** topics 1–2 (Before this).
- **Visual idea:** a left table's rows each with a bundle of lines reaching into a right table; a semi-join collapses each bundle to a single checkmark regardless of bundle size, an anti-join lights only the rows with no bundle at all. A second frame shows the planner as a gate: EXISTS passes through unconditionally, NOT IN must present a NOT NULL certificate or get redirected to a slower, correct side path.
- **Lab:** none of the chapter lab's named parts; its own "Try it" exercises the EXPLAIN-driven proof directly.
- **Sources:** PostgreSQL source `subselect.c` (`convert_ANY_sublink_to_join`, `convert_EXISTS_sublink_to_join`), `joinpath.c`, `explain.c`; PostgreSQL 18 release notes (Right Semi Join); PostgreSQL 18 docs §9.24.

### 4. Recursive CTEs and graph traversal (`de.recursive-ctes-graph-traversal`): full, §2.1

- **Folder:** `recursive-ctes-graph-traversal`. About 14 min.
- **Scope:**
  - "fixpoint evaluation via a working table": the exact non-recursive-term/working-table/intermediate-table loop, quoted from PostgreSQL's docs.
  - "hierarchy and bill-of-materials explosion": the new `product_components` table (added to this chapter's running example), exploded with quantities multiplied down the tree.
  - "reachability... cycle detection with the standard SEARCH/CYCLE clauses (PostgreSQL 14+) or path arrays": the referral-graph reachability query over `orders.referred_by_customer_id`, which can genuinely cycle on bad data; path arrays as the portable mechanism, `SEARCH`/`CYCLE` as PostgreSQL 14+ sugar for it; DuckDB's lack of the sugar and its own hand-written equivalent.
  - "termination and row blow-up risks": the explicit distinction between a true cycle (must be prevented) and a cycle-free but combinatorially large DAG (bounded, not a bug, needs a depth/row cap instead).
  - Leaves window-function-based "latest row" techniques to §2.2, and general subquery decorrelation to topic 17.
- **Outcomes:**
  - Trace the working-table fixpoint loop.
  - Write a BOM explosion and a reachability query.
  - Use `SEARCH`/`CYCLE` or a hand-written path array for defined order and termination.
  - Distinguish a true cycle from a row-count blow-up and apply the right fix to each.
- **Introduces:** `recursive-cte-fixpoint`, `bom-explosion`, `graph-reachability-sql`, `cte-cycle-detection`. **Uses:** `relational-algebra`, `bag-semantics`. **Declared:** `sql-select`, `graph-basics`.
- **Bridge:** "So far every question has been about one table at a time. Next: climbing a hierarchy, one level at a time, until there are no more levels left to climb." (Answers topic 3's handoff.)
- **Handoff:** "Every question so far has produced one row per group, or one row per path. Next: splitting one aggregate into several, at several levels, all in a single pass over the data."
- **Prerequisites panel:** topic 3 (not a hard dependency, shares the referral column); basic SQL and graph vocabulary (declared).
- **Visual idea:** a working-table conveyor belt: a small batch of rows feeds the recursive term, which produces the next batch, which replaces the belt's contents, until a batch arrives empty and the belt stops. A second frame shows a path growing node by node, turning cherry the instant it would step onto a node already on itself.
- **Lab:** hosts the §2.1 chapter lab's recursive-CTE part — a BOM explosion over `product_components` with a deliberately planted cycle, fixed with the `CYCLE` clause or a path array.
- **Sources:** PostgreSQL 18 docs §7.8.2 (Recursive Queries, including SEARCH/CYCLE and the LIMIT trick); PostgreSQL 14 release notes (SEARCH/CYCLE introduced); DuckDB docs, "Recursive CTEs" / "Graph Traversal".

### 5. Grouping sets, ROLLUP, CUBE and pivots (`de.grouping-sets-rollup-cube-pivots`): full, §2.1

- **Folder:** `grouping-sets-rollup-cube-pivots`. About 13 min.
- **Scope:**
  - "multi-level aggregation in one pass": `GROUPING SETS`, with `ROLLUP` (prefixes) and `CUBE` (power set) as its two shorthands, quoted and expanded exactly from PostgreSQL docs.
  - "GROUPING() to tell subtotal NULLs from data NULLs": the ambiguity stated verbatim from the docs, resolved with the `GROUPING()` bitmask, demonstrated on the nullable `referred_by_customer_id` column from topics 2–3.
  - "PIVOT/UNPIVOT vs conditional aggregation (FILTER (WHERE …), CASE) and their dialect portability": `FILTER` as the portable default, `CASE` as the older-engine fallback, native `PIVOT` (Snowflake, BigQuery) and `tablefunc`'s `crosstab()` as the non-portable alternatives.
  - Also covers the `DISTINCT ROLLUP`/`GROUPING SETS` duplicate-removal syntax for combined grouping items.
  - Leaves window-function ranking/dedup to §2.2, and the planner's own handling of grouping-set query plans to §2.3.
- **Outcomes:**
  - Predict `ROLLUP`/`CUBE`'s grouping-set expansion.
  - Use `GROUPING()` to disambiguate subtotal NULLs from data NULLs.
  - Build a pivot with `FILTER`/`CASE`, and know which engines offer native `PIVOT`.
  - Spot and remove duplicate grouping sets.
- **Introduces:** `grouping-sets`, `rollup-cube`, `grouping-function`, `conditional-aggregation-pivot`. **Uses:** `bag-semantics`, `three-valued-logic`, `null-in-clauses`. **Declared:** `sql-select`.
- **Bridge:** "Every question so far has produced one row per group, or one row per path. Next: splitting one aggregate into several, at several levels, all in a single pass over the data." (Answers topic 4's handoff.)
- **Handoff:** "Every total so far summed rows that were already sitting next to each other in one table. Next: pulling in one extra row, from the table beside it, computed just once, right where you need it."
- **Prerequisites panel:** topic 2 (Before this, for the nullable-column trap); basic GROUP BY (declared).
- **Visual idea:** a folding ladder of subtotal rows, each rung one grouping set, with ignored columns shown as a greyed-out cell distinct from a genuinely-empty data cell (two different textures, same visual "blank"). A pivot frame shows a tall narrow strip of rows folding sideways into a short wide strip of columns.
- **Lab:** hosts the §2.1 chapter lab's `GROUPING()` vs data-NULLs part.
- **Sources:** PostgreSQL 18 docs §7.2.4 (GROUPING SETS/CUBE/ROLLUP), §9.21 Table 9.66 (GROUPING()), §4.2.7 (FILTER), §F.43 (tablefunc/crosstab); Snowflake SQL reference (PIVOT); Google Cloud BigQuery query syntax reference (PIVOT/UNPIVOT).

### 6. LATERAL joins and correlated subqueries (`de.lateral-joins-correlated-subqueries`): full, §2.1

- **Folder:** `lateral-joins-correlated-subqueries`. About 13 min. Closes §2.1's run of pure-semantics topics.
- **Scope:**
  - "LATERAL / CROSS APPLY as a per-row table function in FROM": the exact per-row evaluation model, quoted from PostgreSQL docs.
  - "top-N-per-group via LATERAL + LIMIT": the pattern a plain join cannot express, previewing topic 12's window-function alternative.
  - "when the planner can decorrelate and when it falls back to per-row execution (→ §2.3)": the `is_simple_subquery()` pull-up boundary (blocked by sorting/limiting/grouping/aggregation), sourced from PostgreSQL's planner, as the sharpest possible preview of topic 17.
  - Also covers `LEFT JOIN LATERAL ... ON true` and its contrast with topic 3's anti-join, and the SQL Server `CROSS APPLY`/`OUTER APPLY` translation.
  - Leaves general decorrelation (Neumann & Kemper, BTW 2015) to topic 17.
- **Outcomes:**
  - State LATERAL's per-row evaluation rule.
  - Write a top-N-per-group LATERAL query.
  - Translate LATERAL to/from CROSS APPLY/OUTER APPLY.
  - Name the planner's pull-up boundary for correlated subqueries.
- **Introduces:** `lateral-join`, `top-n-per-group`, `subquery-pullup-boundary`. **Uses:** `relational-algebra`, `semi-join`, `anti-join`. **Declared:** `sql-select`.
- **Bridge:** "Every total so far summed rows that were already sitting next to each other in one table. Next: pulling in one extra row, from the table beside it, computed just once, right where you need it." (Answers topic 5's handoff.)
- **Handoff:** "This whole section has been about what a query means. Next: what SQL means for data that is not flat at all."
- **Prerequisites panel:** topic 3 (Before this, for the anti-join contrast).
- **Visual idea:** an outer row casting a single spotlight into the inner table; only the rows the spotlight currently touches are visible, and the spotlight sweeps to the next outer row once its sorted-and-capped picks are taken. A locked-vs-unlocked padlock marks whether the planner could flatten the item into a plain join.
- **Lab:** none of the chapter lab's named parts; its own "Try it" compares the LATERAL and window-function plan shapes directly.
- **Sources:** PostgreSQL 18 docs §7.2.1.5 (LATERAL Subqueries); PostgreSQL source `prepjointree.c` (`is_simple_subquery`); Microsoft Learn, T-SQL FROM/APPLY reference.

### 7. Nested and semi-structured data in SQL (`de.nested-semi-structured-data-sql`): full, §2.1

- **Folder:** `nested-semi-structured-data-sql`. About 14 min. Adds `tags`/`discount_amounts` (arrays) and `metadata` (jsonb) to `orders` for this chapter's running example.
- **Scope:**
  - "arrays, structs and maps": PostgreSQL arrays, composite (ROW) types as SQL's struct, jsonb as the de facto map since there's no native MAP type.
  - "UNNEST/explode and its cardinality traps": the exact single- vs multi-argument `unnest()` semantics, and the two-separate-unnest-calls Cartesian-product trap, tied back to topic 1's × operator.
  - "SQL/JSON path and JSON_TABLE (PostgreSQL 17)": the arrow operators, then `JSON_TABLE`'s path-driven relational view, which is built on `LATERAL` (topic 6).
  - "binary semi-structured types (Snowflake and Databricks VARIANT, the Parquet/Iceberg v3 variant type with shredding) vs JSON text": sourced to the Parquet format's own Variant Shredding specification.
  - Leaves wire-format serialization (Parquet/Avro/Protobuf proper) to §6.1, and vector/embedding types to Ch.17.
- **Outcomes:**
  - Read/write arrays, composite types and jsonb.
  - Predict `unnest()`'s cardinality trap and avoid it.
  - Use arrow operators and `JSON_TABLE`.
  - Explain the architectural reason binary variant types with shredding outperform JSON text.
- **Introduces:** `unnest-cardinality`, `json-table`, `binary-variant-shredding`. **Uses:** `relational-algebra`, `bag-semantics`, `lateral-join`. **Declared:** `sql-select`.
- **Bridge:** "This whole section has been about what a query means. Next: what SQL means for data that is not flat at all." (Answers topic 6's handoff.)
- **Handoff:** "Every construct so far ran inside the database engine itself. Next: what happens when the logic that decides a row's fate is a function you wrote, not a built-in operator."
- **Prerequisites panel:** topics 1 and 6 (Before this).
- **Visual idea:** two parallel ribbons (tags, discounts) that either zip link-by-link (correct) or fan out into a full grid of every-pairing-with-every (the Cartesian trap, in cherry). A JSON document frame shows a path drilling in versus `JSON_TABLE` unfolding the whole shape into a little table beside it. A shredded-vs-text frame shows one query lighting only the one Parquet column it needs vs. having to light an entire opaque text blob.
- **Lab:** none of the chapter lab's named parts; its own "Try it" exercises the cardinality trap with a row-count assertion.
- **Sources:** PostgreSQL 18 docs §9.19 (array functions), §7.2.1.4 (table functions, WITH ORDINALITY), §9.16 (JSON functions, JSON_TABLE); PostgreSQL 17 release notes; Snowflake docs (VARIANT); Databricks docs (VARIANT type); Apache Parquet format `VariantShredding.md`.

### 8. User-defined functions and optimizer opacity (`de.user-defined-functions-optimizer-opacity`): full, §2.1

- **Folder:** `user-defined-functions-optimizer-opacity`. About 13 min. Last pure-semantics topic of §2.1.
- **Scope:**
  - "scalar, table and aggregate UDFs": the three kinds and their PostgreSQL syntax.
  - "why opaque UDFs block pushdown, costing and parallelism": the exact PostgreSQL defaults (`VOLATILE`, `PARALLEL UNSAFE`, uncosted) quoted verbatim, with their compounding consequences.
  - "inlining (PostgreSQL SQL-function inlining, SQL Server's 'Froid' scalar-UDF inlining)": `inline_function()`'s exact conditions, and Froid's APPLY-operator algebrization (reusing topic 6's LATERAL/APPLY), with its measured "one to three orders of magnitude" improvement.
  - "vectorized Arrow-batch Python UDFs vs row-at-a-time ones": the Databricks-sourced "3x to over 100x" figure, tied back to Chapter 1's `vectorized-execution`.
  - Leaves cost-based filter/join ordering in full to topic 20, and query rewriting/decorrelation in full to topic 17.
- **Outcomes:**
  - Classify and write the three UDF kinds.
  - Name the three opacity penalties and their PostgreSQL defaults.
  - Explain SQL-function inlining and Froid's algebrization.
  - Choose vectorized over row-at-a-time UDFs with the structural reason why.
- **Introduces:** `udf-kinds`, `function-volatility-parallel-safety`, `sql-function-inlining`, `vectorized-udf`. **Uses:** `lateral-join`, `relational-algebra`. **Declared:** `sql-select`.
- **Bridge:** "Every construct so far ran inside the database engine itself. Next: what happens when the logic that decides a row's fate is a function you wrote, not a built-in operator." (Answers topic 7's handoff.)
- **Handoff:** "Writing meaning into a query is one thing. Next: what happens when two different sessions try to write the same row at once."
- **Prerequisites panel:** topic 6 (Before this, for Froid's APPLY mechanism).
- **Visual idea:** a function call as a sealed black box sitting in the plan tree; three padlocks on it (no folding, no parallel workers, no real cost) that open one at a time as each property is declared. A second frame shows an imperative function's steps rearranging themselves into a small relational tree (Froid), and a row-vs-batch frame shows one bucket crossing a boundary one coin at a time versus one big crate crossing once.
- **Lab:** none of the chapter lab's named parts; its own "Try it" exercises each default's EXPLAIN effect directly.
- **Sources:** PostgreSQL 18 docs `CREATE FUNCTION`; PostgreSQL source `clauses.c` (`inline_function`); Ramachandra et al., "Froid," PVLDB 11(4), 2017; Databricks engineering blog, "Introducing Pandas UDF for PySpark" (2017).

### 9. MERGE, upsert and concurrent writers (`de.merge-upsert-concurrent-writers`): full, §2.1

- **Folder:** `merge-upsert-concurrent-writers`. About 13 min. Closes §2.1.
- **Scope:**
  - "MERGE vs INSERT … ON CONFLICT: matching semantics, duplicate-source-row errors": the WHEN MATCHED/NOT MATCHED branching and the exact duplicate-source-row error behavior, quoted from PostgreSQL docs.
  - "why PostgreSQL's MERGE can still hit unique violations under concurrency while ON CONFLICT is race-safe": the §13.2 Transaction Isolation quote stating this outright, mechanically explained.
  - "RETURNING with MERGE (PostgreSQL 17) and OLD/NEW (PostgreSQL 18)": both version-dated and demonstrated on the official `wines` example.
  - "lakehouse MERGE as file rewrites (→ §6.3)": a forward pointer only, sourced to Delta Lake's own file-rewrite warning.
  - Leaves the full lakehouse MERGE cost model (copy-on-write vs merge-on-read, write amplification) to §6.3.
- **Outcomes:**
  - Write MERGE and ON CONFLICT and know what each matches on.
  - Explain why MERGE can still race on INSERT while ON CONFLICT cannot.
  - Use merge_action() and OLD/NEW in RETURNING.
  - Explain why lakehouse MERGE rewrites files.
- **Introduces:** `merge-statement`, `upsert-atomicity`, `merge-returning-old-new`, `lakehouse-merge-rewrite`. **Uses:** `bag-semantics`. **Declared:** `sql-select`.
- **Bridge:** "Writing meaning into a query is one thing. Next: what happens when two different sessions try to write the same row at once." (Answers topic 8's handoff.)
- **Handoff (to §2.2's first topic, Window frame semantics):** "Every clause this section covered answers one question at a time. Next: a construct that looks at its neighbors on purpose, one window at a time."
- **Prerequisites panel:** basic SQL, joins and transactions (declared).
- **Visual idea:** two sessions as two timelines converging on one row; ON CONFLICT's timeline shows a single, unbroken atomic lock-step merge into one of two guaranteed outcomes, while MERGE's timeline shows a visible gap between its snapshot read and its own INSERT, with a cherry collision when a second session's commit lands inside that gap. A file-rewrite frame shows one touched row forcing a whole Parquet file to be copied and rewritten.
- **Lab:** hosts the §2.1 chapter lab's two-session MERGE race part, closing the suite.
- **Sources:** PostgreSQL 18 docs `MERGE`, `INSERT` (ON CONFLICT), §13.2 (Transaction Isolation); PostgreSQL 17 and 18 release notes; Delta Lake docs, "Table deletes, updates, and merges".

### 10. Window frame semantics (`de.window-frame-semantics`): full, §2.2

- **Folder:** `window-frame-semantics`. About 14 min. Opens §2.2.
- **Scope:**
  - "PARTITION BY / ORDER BY, ROWS vs RANGE vs GROUPS, peer groups and the default-frame trap with ties": the exact default-frame statement from PostgreSQL docs, demonstrated as a genuine running-total bug on tied `event_time` values.
  - "the EXCLUDE clause": CURRENT ROW/GROUP/TIES/NO OTHERS, quoted and demonstrated.
  - "named windows": the `WINDOW` clause and the `OVER w` vs `OVER (w ...)` distinction.
  - "staging 'nested' windows through CTEs because window calls cannot nest": PostgreSQL's own parser error and the two-level CTE fix.
  - Leaves window execution internals (sort reuse, segment trees) to topic 11, and ranking/top-N built on frames to topic 12.
- **Outcomes:**
  - Write PARTITION BY/ORDER BY/frame correctly.
  - Predict the default-frame tie trap and fix it.
  - Use EXCLUDE and named windows.
  - Stage a "nested" window computation through a CTE.
- **Introduces:** `window-partition-order`, `frame-rows-range-groups`, `default-frame-tie-trap`, `window-no-nesting`. **Uses:** `bag-semantics`, `null-in-clauses`. **Declared:** `sql-select`.
- **Bridge:** "Every clause this section covered answers one question at a time. Next: a construct that looks at its neighbors on purpose, one window at a time." (Answers topic 9's handoff.)
- **Handoff:** "Defining the neighborhood is one job. Next: what the engine actually does, physically, to deliver an answer for every single row in it."
- **Prerequisites panel:** topic 2 (Before this, for the zero-rows-is-NULL rule).
- **Visual idea:** a filmstrip of rows with a sliding bracket marking the current frame; on a tie, two adjacent brackets visibly merge into one wide bracket (the default-RANGE trap, in cherry) versus staying two separate narrow brackets under ROWS. A "no nesting" frame shows one window-function layer stacked directly on another refusing to compile, then succeeding once a CTE boundary is drawn between them.
- **Lab:** none of the chapter lab's named parts; its own "Try it" reproduces and fixes the tie trap directly.
- **Sources:** PostgreSQL 18 docs §4.2.8 (Window Function Calls); PostgreSQL source `parse_agg.c` (`transformWindowFuncCall`).

### 11. Window function execution internals (`de.window-function-execution-internals`): full, §2.2

- **Folder:** `window-function-execution-internals`. About 14 min.
- **Scope:**
  - "partition-and-sort cost and sort reuse across compatible windows": PostgreSQL's `select_active_windows` sort-reuse ordering, crediting Cao et al. PVLDB 2012 as the originating idea.
  - "segment trees and removable cumulative aggregation for arbitrary frames (Leis et al., PVLDB 2015)": all four aggregation algorithms (naive, cumulative, removable cumulative, segment tree) from the paper, in order of sophistication.
  - "parallel evaluation and skewed partitions": inter-/intra-partition parallelism from the same paper, tied back to Chapter 1's hash-join key-skew material.
  - "why a window beats an equivalent self-join": the paper's own quadratic-complexity argument against the correlated-subquery/self-join formulation.
  - Leaves ranking/top-N built on these frames to topic 12.
- **Outcomes:**
  - Explain the self-join/window complexity gap.
  - Name the four frame-aggregation algorithms and their triggers.
  - Explain sort reuse across compatible windows.
  - Describe inter-/intra-partition parallelism and the skew failure mode.
- **Introduces:** `window-vs-self-join-cost`, `frame-aggregation-algorithms`, `window-sort-reuse`, `window-partition-parallelism`. **Uses:** `window-partition-order`, `frame-rows-range-groups`, `key-skew`, `radix-partitioning`. **Declared:** `sql-select`.
- **Bridge:** "Defining the neighborhood is one job. Next: what the engine actually does, physically, to deliver an answer for every single row in it." (Answers topic 10's handoff.)
- **Handoff:** "Everything so far has climbed one row at a time. Next: counting positions, and picking exactly one winner when several rows tie for first."
- **Prerequisites panel:** topic 10 (Before this); Chapter 1 topic 15 (reading, for the skew parallel).
- **Visual idea:** a ladder of four aggregation strategies, each rung handling a wilder frame shape, with a quadratic-vs-linear cost curve racing a self-join against a window pass. A parallel frame shows even-sized partitions finishing together while one oversized partition's lone worker still grinds on alone.
- **Lab:** none of the chapter lab's named parts; its own "Try it" measures the self-join-vs-window gap and the sort-reuse plan directly.
- **Sources:** Leis, Kundhikanjana, Kemper, Neumann, "Efficient Processing of Window Functions in Analytical SQL Queries," PVLDB 8(10), 2015; Cao et al., PVLDB 5(11), 2012; PostgreSQL source `planner.c` (`select_active_windows`).

### 12. Ranking, top-N and deterministic dedup (`de.ranking-top-n-deterministic-dedup`): full, §2.2

- **Folder:** `ranking-top-n-deterministic-dedup`. About 13 min.
- **Scope:**
  - "ROW_NUMBER vs RANK vs DENSE_RANK under ties": the exact "with gaps"/"without gaps" definitions, quoted from PostgreSQL docs.
  - "tie-breakers for reproducible output": why an incomplete ORDER BY makes ranking non-deterministic, and the one-column fix.
  - "QUALIFY (Snowflake, BigQuery, DuckDB, Databricks; not ISO) as the idiomatic filter": confirmed directly on all four engines' current docs; the Teradata-origin claim is not asserted since it could not be verified against a primary source.
  - "top-N-per-partition optimizations": the ranking-function/QUALIFY pattern compared structurally against topic 6's LATERAL+LIMIT pattern.
  - Leaves gaps-and-islands/sessionization (built on LAG/LEAD) to topic 13.
- **Outcomes:**
  - Choose correctly among ROW_NUMBER/RANK/DENSE_RANK.
  - Add a tie-breaker for deterministic output.
  - Write QUALIFY where available and its CTE equivalent where not.
  - Compare the two top-N-per-group plan shapes and pick between them.
- **Introduces:** `ranking-functions`, `ranking-tie-breaker`, `qualify-clause`, `top-n-plan-comparison`. **Uses:** `window-partition-order`, `lateral-join`, `window-sort-reuse`. **Declared:** `sql-select`.
- **Bridge:** "Everything so far has climbed one row at a time. Next: counting positions, and picking exactly one winner when several rows tie for first." (Answers topic 11's handoff.)
- **Handoff:** "Rows arrive scattered across time. Next: pulling them back together into one coherent story."
- **Prerequisites panel:** topics 6 and 10 (Before this).
- **Visual idea:** a photo-finish line of rows at a tie, splitting into three different scoreboards (distinct numbers, shared-with-gap, shared-without-gap) depending on which function is asked. A second frame racing the two top-N plan shapes side by side, one re-sorting per group, one sorting once and trimming after.
- **Lab:** none of the chapter lab's named parts; its own "Try it" demonstrates tie non-determinism and the two top-N plans directly.
- **Sources:** PostgreSQL 18 docs §9.22 Table 9.67; Snowflake, BigQuery, DuckDB and Databricks SQL references for QUALIFY.

### 13. Gaps-and-islands and sessionization (`de.gaps-islands-sessionization`): full, §2.2

- **Folder:** `gaps-islands-sessionization`. About 13 min. Hosts the §2.2 chapter lab's sessionization part.
- **Scope:**
  - "LAG/LEAD change detection": the exact definitions, quoted from PostgreSQL docs.
  - "the row-number-difference trick": the fixed-condition island technique.
  - "running-sum session IDs with inactivity thresholds": the flag-then-cumulative-sum technique, demonstrated on `page_views` with a thirty-minute threshold, explicitly reusing topic 10's `ROWS`-frame tie fix.
  - "compressing event streams into state intervals": the closing `GROUP BY customer_id, session_id` collapse.
  - Leaves point-in-time/as-of joins (a different composition of the same primitives) to topic 15.
- **Outcomes:**
  - Use LAG/LEAD for change detection.
  - Build an island id two ways.
  - Sessionize an event stream correctly, with tie-safety.
  - Compress a stream to one row per episode.
- **Introduces:** `lag-lead-change-detection`, `row-number-difference-islands`, `running-sum-session-id`, `event-stream-compression`. **Uses:** `window-partition-order`, `frame-rows-range-groups`, `default-frame-tie-trap`. **Declared:** `sql-select`.
- **Bridge:** "Rows arrive scattered across time. Next: pulling them back together into one coherent story." (Answers topic 12's handoff.)
- **Handoff:** "Grouping events into episodes answers what happened. Next: smoother statistics over the numbers themselves, running and moving, instead of just marking where one episode ends and the next begins."
- **Prerequisites panel:** topic 10 (Before this, for the ROWS-frame fix).
- **Visual idea:** a timeline of dots (events) with gaps marked; a flag lights at each gap-exceeding row, and a running counter beneath the timeline climbs in steps exactly at those lit flags, then the whole timeline folds into a short row of labeled brackets (sessions).
- **Lab:** hosts the §2.2 chapter lab's sessionization part.
- **Sources:** PostgreSQL 18 docs §9.22 Table 9.67 (LAG/LEAD); §4.2.8 (frame/tie behavior, full detail in topic 10).

### 14. Running and moving statistics (`de.running-moving-statistics`): full, §2.2

- **Folder:** `running-moving-statistics`. About 13 min.
- **Scope:**
  - "cumulative and sliding aggregates": the growing-vs-fixed-width frame distinction, tied directly to topic 11's cumulative/removable-cumulative algorithms.
  - "time-range frames (RANGE with INTERVAL)": the exact RANGE/INTERVAL rule and example from PostgreSQL docs, contrasted against ROWS's row-count-not-time semantics.
  - "ordered-set aggregates (PERCENTILE_CONT/DISC … WITHIN GROUP)": both definitions quoted verbatim, plus their array forms.
  - "NTILE and CUME_DIST": quoted definitions.
  - "exact vs approximate percentiles (→ §5.6)": a forward pointer only, motivated by the full-sort cost an exact ordered-set aggregate always pays.
  - Leaves approximate percentile algorithms themselves to §5.6.
- **Outcomes:**
  - Distinguish cumulative from moving aggregates.
  - Write a genuine calendar-based RANGE/INTERVAL frame.
  - Choose correctly between PERCENTILE_CONT and PERCENTILE_DISC.
  - Use NTILE/CUME_DIST and explain why exact percentiles motivate approximate ones.
- **Introduces:** `cumulative-vs-moving-aggregate`, `range-interval-frame`, `percentile-cont-disc`, `ntile-cume-dist`. **Uses:** `frame-rows-range-groups`, `frame-aggregation-algorithms`. **Declared:** `sql-select`.
- **Bridge:** "Grouping events into episodes answers what happened. Next: smoother statistics over the numbers themselves, running and moving, instead of just marking where one episode ends and the next begins." (Answers topic 13's handoff.)
- **Handoff:** "Comparing a row to its own neighbors is one kind of question. Next: comparing a row to the exact value another table held, at that very moment in time."
- **Prerequisites panel:** topic 11 (Before this).
- **Visual idea:** two frames sliding across a timeline, one counting a fixed number of dots (ROWS) and one spanning a fixed ruler-length of calendar time (RANGE/INTERVAL), visibly covering different numbers of dots on a dense vs sparse day. A percentile frame shows a continuous curve (interpolated) beside a staircase (discrete), landing on the same approximate point but one on a real dot and one between two dots.
- **Lab:** none of the chapter lab's named parts; its own "Try it" demonstrates the ROWS-vs-RANGE divergence directly.
- **Sources:** PostgreSQL 18 docs §4.2.8 (RANGE/INTERVAL), §9.21 (percentile ordered-set aggregates), §9.22 Table 9.67 (NTILE/CUME_DIST).

### 15. Point-in-time and as-of joins (`de.point-in-time-as-of-joins`): full, §2.2

- **Folder:** `point-in-time-as-of-joins`. About 14 min. Closes §2.2.
- **Scope:**
  - "joining each event to the latest value at or before its timestamp": the equality-plus-inequality-plus-closest shape, explicitly not an equi-join.
  - "range-join plans vs native ASOF JOIN (DuckDB, Snowflake, ClickHouse)": all three native syntaxes confirmed directly, contrasted against the correlated-subquery and LATERAL hand-rolled versions.
  - "leakage-free training sets (→ Ch.17)": a forward pointer only, with the temporal-leakage mechanism explained in full here.
  - "bitemporal as-of queries (→ §3.2)": a forward pointer only, with the valid-time/transaction-time boundary stated but not solved here.
  - Leaves the full bitemporal model to §3.2 and ML feature-store point-in-time correctness to Ch.17.
- **Outcomes:**
  - Explain why an as-of join needs an inequality, not an equality.
  - Write it three ways and translate native syntax across engines.
  - Explain temporal leakage and the as-of join's role in preventing it.
  - State the valid-time/transaction-time boundary that separates as-of from bitemporal.
- **Introduces:** `as-of-join`, `point-in-time-join-plans`, `temporal-leakage`, `bitemporal-boundary`. **Uses:** `lateral-join`, `top-n-per-group`, `window-vs-self-join-cost`. **Declared:** `sql-select`.
- **Bridge:** "Comparing a row to its own neighbors is one kind of question. Next: comparing a row to the exact value another table held, at that very moment in time." (Answers topic 14's handoff.)
- **Handoff (to §2.3's first topic, From SQL text to plan tree):** "Every clause so far answered what a query means. Next: what actually happens between typing that query and getting an answer back."
- **Prerequisites panel:** topic 6 (Before this).
- **Visual idea:** a timeline of price changes (sparse ticks) beside a denser timeline of orders; each order drops a line down to the nearest price tick at or before it, lighting that tick in caramel. A leakage frame shows a training example's line reaching forward past its own moment to a cherry "future" tick, versus correctly landing on the tick at or before it.
- **Lab:** hosts the §2.2 chapter lab's point-in-time-join part, closing the section's lab.
- **Sources:** DuckDB docs, "FROM Clauses" (ASOF JOIN); ClickHouse docs, "JOIN" (ASOF JOIN); Snowflake SQL reference, "ASOF JOIN".

### 16. From SQL text to plan tree (`de.sql-text-to-plan-tree`): full, §2.3

- **Folder:** `sql-text-to-plan-tree`. About 13 min. Opens §2.3.
- **Scope:**
  - "parse → bind/analyze → rewrite → optimize → execute": the exact five-stage pipeline, quoted from PostgreSQL's internals manual, with the FuncCall-to-FuncExpr/Aggref bind example.
  - "logical vs physical plans": the query tree as topic 1's algebra tree, and PostgreSQL's "paths" as its physical-alternatives mechanism.
  - "operator trees and the physical properties (sort order, partitioning) operators require and provide": the index-scan-provides-a-sort-order example, generalizing topic 11's window-sort-reuse idea to the whole plan.
  - Leaves rewrite details (pushdown, decorrelation) to topic 17, CTE inlining to topic 18, cardinality estimation to topic 19, and cost-based search to topic 20.
- **Outcomes:**
  - Name the five pipeline stages and what each knows.
  - Distinguish logical from physical plans.
  - Read a plan tree bottom-up.
  - Predict when a required sort is satisfied for free.
- **Introduces:** `query-pipeline-stages`, `logical-vs-physical-plan`, `planner-paths`, `physical-properties`. **Uses:** `relational-algebra`, `window-sort-reuse`. **Declared:** `sql-select`.
- **Bridge:** "Every clause so far answered what a query means. Next: what actually happens between typing that query and getting an answer back." (Answers topic 15's handoff.)
- **Handoff:** "Right now, every plan has only ever meant exactly what it said. Next: the rewrites that quietly turn one legal plan into a cheaper, equally legal one."
- **Prerequisites panel:** topic 1 (Before this); topic 11 (reading).
- **Visual idea:** a pipeline of five gates, each one lighting up with a little more knowledge than the last (grammar only → names resolved → views unfolded → one path chosen → rows flowing out). A plan-tree frame shows the same algebra tree from topic 1 with each node now labeled by its chosen physical method, and a sort-order ribbon flowing up from a leaf, absorbed by a parent that needed it instead of a separate Sort box appearing.
- **Lab:** none of the chapter lab's named parts; its own "Try it" demonstrates the free-sort-order and view-flattening behaviors directly.
- **Sources:** PostgreSQL 18 docs §51.1, §51.3, §51.5 (Overview of PostgreSQL Internals).

### 17. Query rewrites and subquery unnesting (`de.query-rewrites-subquery-unnesting`): full, §2.3

- **Folder:** `query-rewrites-subquery-unnesting`. About 15 min.
- **Scope:**
  - "predicate and projection pushdown, constant folding": recapped from topics 1 and 8, as free syntactic rewrites.
  - "join elimination": PostgreSQL's `join_is_removable` condition, quoted verbatim.
  - "outer-to-inner join conversion": PostgreSQL's `reduce_outer_joins`, both the LEFT-to-INNER and the LEFT-to-ANTI directions, the latter closing the loop on topic 3.
  - "decorrelation of arbitrary subqueries (Neumann & Kemper, BTW 2015) that turns per-row subqueries into joins": the formal dependent-join definition, simple unnesting (predicate pull-up) and general unnesting (dependent-join push-down), tied to topic 6's LATERAL and topic 8's Froid.
  - Leaves CTE-specific rewrite decisions to topic 18.
- **Outcomes:**
  - Name the five rewrites.
  - State the join-elimination and outer-join-strength-reduction conditions precisely.
  - Describe a correlated subquery as a dependent join and name the two unnesting strategies.
- **Introduces:** `join-elimination`, `outer-join-strength-reduction`, `dependent-join`, `query-unnesting`. **Uses:** `relational-algebra`, `semi-join`, `anti-join`, `lateral-join`, `planner-paths`. **Declared:** `sql-select`.
- **Bridge:** "Right now, every plan has only ever meant exactly what it said. Next: the rewrites that quietly turn one legal plan into a cheaper, equally legal one." (Answers topic 16's handoff.)
- **Handoff:** "All of this ran purely on proof, no numbers involved. Next: a different kind of rewrite, one that decides whether a shortcut helps or hurts by actually running it, or not."
- **Prerequisites panel:** topics 3 and 6 (Before this).
- **Visual idea:** a join node dissolving into nothing once proven redundant; a LEFT JOIN's outer "wing" (the null-extended rows) folding away as a filter proves it was always going to be discarded, in one direction becoming a plain join and in the other becoming an anti-join. A dependent-join frame shows a nested loop re-running per outer row, then straightening into a single flat join as the correlation is pushed down and resolved.
- **Lab:** none of the chapter lab's named parts; its own "Try it" triggers all three provable rewrites directly in EXPLAIN.
- **Sources:** PostgreSQL source `analyzejoins.c` (`join_is_removable`), `prepjointree.c` (`reduce_outer_joins`); Neumann & Kemper, "Unnesting Arbitrary Queries," BTW 2015.

### 19. Cardinality estimation and statistics (`de.cardinality-estimation-statistics`): full, §2.3

*(Topic 18, CTE inlining vs materialization, shipped live without an entry appended here — a gap from that session, not fixed retroactively; its real registry entry, reel and post-notes were read directly in its place, per section 1 of the make-topic skill.)*

- **Folder:** `cardinality-estimation-statistics`. About 15 min.
- **Scope:**
  - "histograms, most-common values, n_distinct": `pg_class`/`pg_statistic` (via `pg_stats`), the equal-frequency histogram bucket/interpolation formula (`scalarltsel`), the in-MCV and off-MCV equality formulas (`eqsel`), `n_distinct`'s sign convention.
  - "the independence and uniformity assumptions": clause selectivities multiplying for `AND`; the uniform spread inside a histogram bucket and across the off-MCV remainder.
  - "correlated columns and extended statistics (CREATE STATISTICS)": why correlation breaks independence and single-column stats can't see it; `CREATE STATISTICS ... (dependencies, mcv)`, measured fixing a real 2.04× underestimate to within 1%.
  - "sampling, stale statistics after bulk loads": ANALYZE's random sampling; a real 1.6× underestimate from a bulk load with no re-ANALYZE, and the fix.
  - "how errors compound through joins": `eqjoinsel`'s no-MCV case; this topic's own two measured errors compounding to ≈3.3× rather than averaging out.
  - "learned estimators as frontier": one cited example (Kipf et al., MSCN, CIDR 2019), one sentence, left to the Deep dive.
  - Leaves turning these estimates into a plan's price, and searching the plan space, to topic 20.
- **Outcomes:**
  - Reconstruct a planner's row estimate by hand from `pg_stats`.
  - Name the independence and uniformity assumptions and recognize when real data breaks each.
  - Fix a correlated-columns misestimate with `CREATE STATISTICS`; tell it apart from a stale-statistics misestimate that needs `ANALYZE` instead.
  - Explain why join-input estimation errors compound rather than cancel.
- **Introduces:** `cardinality-estimation`, `histogram-selectivity`, `mcv-selectivity`, `independence-assumption`, `extended-statistics`. **Uses:** `planner-paths`. **Declared:** `sql-select`.
- **Bridge:** "Whether to look inside a query is settled. Next: the numbers the optimizer leans on to choose, and how it estimates them." (Answers topic 18's handoff.)
- **Handoff:** "An estimate is only useful once it is compared against the alternatives. Next: the cost formulas that turn a row count into a plan's price, and the search that explores enough of the plan space without exploring all of it."
- **Prerequisites panel:** topics 16 and 18 (Before this).
- **Visual idea:** two `EXPLAIN` readouts side by side, estimated and actual, agreeing in white or splitting apart in cherry; a number line's equal-frequency histogram buckets with a pen locating and interpolating inside one; six status bars sized to their real frequency, one thin and locked onto; a measured remainder splitting into equal slivers for the uniformity assumption; a `CREATE STATISTICS` line typing in and closing a cherry gap into a pale-blue near-exact match; two independently measured misses sliding together into one compounded bar.
- **Lab:** hosts the §2.3 lab's "fix some with extended statistics" part directly (its own measured correlated-columns example); the Join Order Benchmark and 100×+ estimate-error hunt belong to topic 20, which this topic's post-notes point to.
- **Sources:** PostgreSQL 18 docs §14.2 ("Statistics Used by the Planner") and §69.1 ("Row Estimation Examples"), CREATE STATISTICS, §53.29 (pg_stats); Kipf et al., "Learned Cardinalities" (arXiv:1809.00677, CIDR 2019); this topic's own measurements on a real PostgreSQL 16 instance (see its `SOURCES.md`).

### 20. Cost models and join-order search (`de.cost-models-join-order`): full, §2.3

- **Folder:** `cost-models-join-order`. About 15 min.
- **Scope:**
  - "I/O + CPU cost formulas": the five planner cost constants (`seq_page_cost`=1.0, `random_page_cost`=4.0, `cpu_tuple_cost`=0.01, `cpu_index_tuple_cost`=0.005, `cpu_operator_cost`=0.0025) and the documented Seq Scan formula (`disk pages * seq_page_cost + rows scanned * cpu_tuple_cost`), verified by hand against a real table.
  - "bottom-up dynamic programming (System R)": PostgreSQL's own description of its exhaustive planner as the System R algorithm; the number of join-order trees as a function of table count, verified directly by brute-force enumeration against the closed-form count, not assumed.
  - "top-down transformation search (Volcano/Cascades)": named only, as the other lineage other engines use — no claim about its internals is made without a primary source to quote, so this stays a pointer in the Deep dive, not a reel claim.
  - "search-space explosion": a real exhaustive-planning time curve measured on this topic's own schema (8, 10, 12, 13, 14 FROM items), including the point (16) where exhaustive planning exhausted the server itself.
  - "PostgreSQL's collapse limits (default 8)": `join_collapse_limit`/`from_collapse_limit`, measured forcing a literal bad join order (`join_collapse_limit=1`) against letting the planner reorder it (`join_collapse_limit=20`) on the same 9-table query — a real ~14× cost gap.
  - "GEQO genetic search from 12 FROM items (`geqo_threshold`)": the genetic algorithm's own documented mechanics (integer-string encoding, steady-state GA, edge recombination crossover) and a real measured comparison against forced exhaustive search at the same table counts (same cost, 13–40× less planning time on this topic's query; PostgreSQL's own docs are quoted that this isn't guaranteed every time).
  - Leaves how each individual join actually executes (nested-loop, hash, sort-merge) to topic 21.
- **Outcomes:**
  - Compute a Seq Scan's estimated cost by hand from `pg_class` and the five cost constants.
  - Explain why join-order search space grows the way it does, with a real computed count, not a hand-waved "it's big."
  - Predict when a small `join_collapse_limit`/`from_collapse_limit` will stop the planner from fixing a badly-ordered query, and use `join_collapse_limit = 1` deliberately to pin a join order.
  - State what `geqo_threshold` controls and what trade-off GEQO makes (less planning time, no optimality guarantee).
- **Introduces:** `planner-cost-constants`, `join-order-search`, `collapse-limit`, `geqo`. **Uses:** `planner-paths`, `cardinality-estimation`. **Declared:** `sql-select`.
- **Bridge:** "An estimate is only useful once it is compared against the alternatives. Next: the cost formulas that turn a row count into a plan's price, and the search that explores enough of the plan space without exploring all of it." (Answers topic 19's handoff.)
- **Handoff:** "The order of the joins is decided. Next: what actually happens inside each one — nested loop, hash, or sort-merge — and how cardinality, sort order and memory decide which."
- **Prerequisites panel:** topics 16 and 19 (Before this).
- **Visual idea:** a Seq Scan's cost ticking up tuple by tuple against the hand-computed formula; a join-order tree count climbing from millions to quadrillions as table count rises by ones; two totals for the same 9-table query, one locked to a bad literal order and one let loose to reorder, splitting apart in cherry; a planning-time bar chart climbing steeply past 12 tables, with a GEQO bar sitting low and flat beside it.
- **Lab:** hosts the §2.3 lab's "force alternative join orders" part directly (`join_collapse_limit = 1` on a real query); the Join Order Benchmark's 100×+ estimate-error hunt stays with topic 19's post-notes pointer and is not repeated here.
- **Sources:** PostgreSQL 18 docs §19.7.2 ("Planner Cost Constants"), §14.1 ("Using EXPLAIN"), §14.3 ("Controlling the Planner with Explicit JOIN Clauses"), §61.1 and §61.3 ("Query Handling as a Complex Optimization Problem", "Genetic Query Optimization (GEQO) in PostgreSQL"); this topic's own measurements on a real PostgreSQL 16 instance (see its `SOURCES.md`).

### 21. Join algorithms: nested-loop, hash, sort-merge (`de.join-algorithms-nested-loop`): full, §2.3

- **Folder:** `join-algorithms-nested-loop`. About 15 min.
- **Scope:**
  - "block and index nested loops": nested loop with an index on the inner side, measured winning a selective join by a wide margin.
  - "build/probe hash joins": the hash table built on the smaller side, probed by the larger; measured winning an unfiltered equi-join.
  - "merge joins over sorted inputs": requires both inputs sorted on the join key (by an index or an explicit sort); measured as the most expensive of the three on this topic's own join, which is also an honest finding, not softened to make merge join look better than it measured.
  - "how cardinalities, existing sort order, memory and equality vs inequality predicates decide the choice": the same join forced through all three algorithms via `enable_hashjoin`/`enable_mergejoin`/`enable_nestloop`, `work_mem` reduced to force a hash join to spill to disk (measured batch count and the resulting slowdown), and an inequality join predicate measured forcing nested loop even with it disabled — "impossible to suppress nested-loop joins entirely," confirmed directly.
  - Leaves the aggregation side of the same build/probe vs. sorted-input split (hash vs. sort aggregation) to topic 22.
- **Outcomes:**
  - Name the three join algorithms and state which physical property (an index, existing sort order, or neither) each one needs.
  - Predict which of the three a given join will prefer from its cardinalities and filter selectivity alone.
  - Recognize a hash join spilling to disk from `EXPLAIN (ANALYZE)`'s own batch count, and explain why `work_mem` is the lever.
  - Explain why a hash join needs an equality condition and a nested loop never does.
- **Introduces:** `nested-loop-join`, `hash-join`, `merge-join`, `work-mem-spill`. **Uses:** `planner-cost-constants`, `join-order-search`. **Declared:** `sql-select`.
- **Bridge:** "The order of the joins is decided. Next: what actually happens inside each one — nested loop, hash, or sort-merge — and how cardinality, sort order and memory decide which." (Answers topic 20's handoff.)
- **Handoff:** "A join is decided. The same build/probe vs. sorted-input choice happens one level up, for GROUP BY — next."
- **Prerequisites panel:** topics 19 and 20 (Before this).
- **Visual idea:** a tiny filtered outer looping into an index on a huge inner table, next to the same join forced through a hash table sized for all of it; a hash table's single clean bucket row splitting into dozens of smaller batches once `work_mem` shrinks; two already-sorted streams zipping together for a merge join; an inequality predicate's join staying a nested loop no matter which other algorithm is switched off.
- **Lab:** none of the chapter lab's named parts; its own "Try it" reproduces the nested-loop-vs-hash cardinality flip and the `work_mem` spill directly.
- **Sources:** PostgreSQL 18 docs §14.1 ("Using EXPLAIN"), §19.7.1 ("Planner Method Configuration"), §19.4 ("Resource Consumption", `work_mem`); this topic's own measurements on a real PostgreSQL 16 instance (see its `SOURCES.md`).

---
