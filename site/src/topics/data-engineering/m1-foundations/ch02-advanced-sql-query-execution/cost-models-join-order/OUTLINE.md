# Outline — Cost models and join-order search (`de.cost-models-join-order`)

## Learning outcomes (from CHAPTER.md entry 20)
- Compute a Seq Scan's estimated cost by hand from `pg_class` and the five cost constants.
- Explain why join-order search space grows the way it does, with a real computed count, not a hand-waved "it's big."
- Predict when a small `join_collapse_limit`/`from_collapse_limit` will stop the planner from fixing a badly-ordered query, and use `join_collapse_limit = 1` deliberately to pin a join order.
- State what `geqo_threshold` controls and what trade-off GEQO makes (less planning time, no optimality guarantee).

## Bridge / handoff
- **Bridge** (from topic 19): "An estimate is only useful once it is compared against the alternatives. Next: the cost formulas that turn a row count into a plan's price, and the search that explores enough of the plan space without exploring all of it."
- **Handoff** (to topic 21, join algorithms): "The order of the joins is decided. Next: what actually happens inside each one — nested loop, hash, or sort-merge — and how cardinality, sort order and memory decide which."

## Running example
`cost_demo` schema in the `shop` database (same database topic 19 measured `orders` in): `j1` (100,000 rows, `flag` true for 50 of them) through `j12` (each 100,000 rows, plain `id` 1..100,000 primary key), chained by `id` equality — a controllable, honest stand-in for "a query that joins many tables," built specifically to let join order and FROM-item count vary while keeping every other variable (row counts, selectivity) fixed and known. `orders` itself (topic 19's 2,400,000-row table) is reused once, for the Seq Scan formula check, so the topic opens on a table the learner has already seen.

## Engagement arc
Two predict/reveal pairs (the formula; the collapse-limit effect) plus two closing "Prove it" questions — same density as topic 19.

## Storyboard

1. **Hook.** Two EXPLAIN totals for what looks like the same question — 23,837.70 and 1,697.40 — same nine tables, same data, same meaning. One number is 14× the other. Nothing about the data changed.
2. **Predict: the Seq Scan formula.** `orders` has 46,484 pages and 2,400,000 rows (topic 19's own measured numbers). `seq_page_cost` is 1.0, `cpu_tuple_cost` is 0.01. What does `EXPLAIN SELECT * FROM orders` report as its total cost?
3. **Reveal.** 70,484 — pages × seq_page_cost + rows × cpu_tuple_cost, exactly, both from PostgreSQL's own documented formula and the real EXPLAIN output.
4. **Mechanism: the five cost constants.** `seq_page_cost`=1.0, `random_page_cost`=4.0 (4× — random reads cost more, but caching assumptions keep it from being naively "disk is faster sequential" math), `cpu_tuple_cost`=0.01, `cpu_index_tuple_cost`=0.005, `cpu_operator_cost`=0.0025 — arbitrary units, consistent with each other, and it's the plan with the lowest total that the planner picks.
5. **Mechanism: join order is also a search.** Choosing which table to scan is one decision; choosing the order to join N tables is another, and the number of orders to choose among explodes — verified by brute-force enumeration against the closed-form count: 8 tables → 17.3 million orders, 12 → 28.2 trillion, 14 → 64.8 quadrillion.
6. **Predict: the collapse limit.** The same 9-table query, written in a bad order (big unfiltered tables first, the one selective filter last). Default `join_collapse_limit` is 8. Will the planner fix the order anyway?
7. **Reveal.** With the limit small enough to block full reordering (`=1`, preserving the literal written order): cost 23,837.70. Let it reorder freely (`=20`): cost 1,697.40 — same tables, same data, 14× apart, purely from whether the setting let the planner rewrite what was written.
8. **Mechanism: from/join_collapse_limit.** The documented default (8), what `=1` buys (a pinned join order for when you know better than the planner), and why collapsing explicit JOINs into a flat FROM list is what lets the planner reorder at all.
9. **Predict: past the threshold.** 12 or more FROM items, `geqo_threshold` default 12. What happens to the plan and the time spent finding it?
10. **Reveal.** Measured planning-time curve forcing exhaustive search: 36 ms (8 tables) → 224 ms (10) → 1.74 s (12) → 5.14 s (13) → 36.1 s (14) — and a 16-table attempt that took the server down before it returned a plan. GEQO, engaged automatically at 12+: 132 ms and 125 ms at the same two sizes, landing on the exact same cost both times.
11. **Mechanism: how GEQO searches.** The genetic-algorithm mechanics by name — join orders encoded as integer strings, a steady-state population, edge-recombination crossover, "more fit" meaning lower estimated cost — and the documented caveat: faster, not guaranteed-best.
12. **Mechanism: interesting orders.** A real measured pair: `orders`, `WHERE order_id < 1000 ORDER BY order_id`, no index → explicit Sort node, cost 60,084.45; with an index on `order_id` → no Sort node at all, cost 53.19. Covers the syllabus's "interesting orders" clause directly, rather than leaving it out of scope.
13. **Recap.** Three questions before trusting a plan's shape: what do the cost constants assume about this hardware, would a smaller collapse limit have stopped the planner from finding this order, and is this query long past the point where GEQO took over?
14. **Prove it · 1 of 2.** Given relpages/reltuples and the constants, compute a Seq Scan cost by hand.
15. **Prove it · 2 of 2.** Given a bad literal join order and a collapse limit, predict whether the planner can fix it.

## Claims list (source for each)

| # | Claim | Source |
|---|---|---|
| 1 | Seq Scan cost = pages×seq_page_cost + rows×cpu_tuple_cost | using-explain.txt |
| 2 | Default cost constants (1.0 / 4.0 / 0.01 / 0.005 / 0.0025) | runtime-config-query.txt |
| 3 | Topmost line's total cost is what the planner minimizes | using-explain.txt |
| 4 | Join-order count grows exponentially; exhaustive impractical beyond ~10 tables | geqo-intro.txt, explicit-joins.txt |
| 5 | System R-style near-exhaustive search; can take enormous time/memory | geqo-intro.txt |
| 6 | join_collapse_limit/from_collapse_limit defaults (8); `=1` pins literal order | runtime-config-query.txt, explicit-joins.txt |
| 7 | geqo_threshold default 12; GEQO trades optimality for planning time | runtime-config-query.txt, explicit-joins.txt |
| 8 | GEQO mechanics: integer-string encoding, steady-state GA, edge recombination crossover, fitness = lower cost | geqo-pg-intro.txt |
| 9 | Seq Scan formula verified on `orders` (70,484) | examples.py, this topic's SOURCES.md |
| 10 | Collapse-limit cost gap (23,837.70 vs 1,697.40) | examples.py, SOURCES.md |
| 11 | Planning-time curve, exhaustive vs GEQO | examples.py, SOURCES.md |
| 12 | Join-order tree count, brute-force-verified formula | examples.py |
| 13 | A scan's own output order can avoid an explicit Sort step ("interesting order") | using-explain.txt, examples.py |

## Post-notes headings (planned)
Outcomes; Into the internals (how the planner actually fills in the DP table / what "collapse" structurally does to the join tree; GEQO's TSP framing and its own documented doubt about that framing); In production (reading a slow-to-plan query, when to reach for `join_collapse_limit=1`, when GEQO is already doing its job); Next (handoff to topic 21).

## Concept ledger
Introduces: `planner-cost-constants`, `join-order-search`, `collapse-limit`, `geqo`. Uses: `planner-paths`, `cardinality-estimation`. Declared: `sql-select`.

## Changes from the chapter plan
None — followed CHAPTER.md entry 20 as written (which this session also wrote, immediately before starting research, per section 1 of the skill: entry 20 did not exist yet since topic 19 was the chapter's last entry).
