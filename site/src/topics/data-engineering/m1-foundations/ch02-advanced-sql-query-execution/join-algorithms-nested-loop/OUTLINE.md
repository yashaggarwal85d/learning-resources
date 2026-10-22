# Outline — Join algorithms: nested-loop, hash, sort-merge (`de.join-algorithms-nested-loop`)

## Learning outcomes (from CHAPTER.md entry 21)
- Name the three join algorithms and state which physical property (an index, existing sort order, or neither) each one needs.
- Predict which of the three a given join will prefer from its cardinalities and filter selectivity alone.
- Recognize a hash join spilling to disk from `EXPLAIN (ANALYZE)`'s own batch count, and explain why `work_mem` is the lever.
- Explain why a hash join needs an equality condition and a nested loop never does.

## Bridge / handoff
- **Bridge** (from topic 20): "The order of the joins is decided. Next: what actually happens inside each one — nested loop, hash, or sort-merge — and how cardinality, sort order and memory decide which."
- **Handoff** (to topic 22, hash vs. sort aggregation): "A join is decided. The same build/probe vs. sorted-input choice happens one level up, for GROUP BY — next."

## Running example
`join_demo` schema in the `shop` database (same database topics 19–20 measured in): `customers` (100,000 rows, primary key `customer_id`) and `orders2` (2,000,000 rows, `customer_id` indexed, foreign key to `customers`) — sized so a single-customer filter is extremely selective and a full join touches every row of the larger table, letting the same two tables demonstrate both ends of the cardinality spectrum.

## Engagement arc
Four predict/reveal pairs (nested-loop-vs-hash on the filtered join; hash-vs-nested-loop-vs-merge on the full join; the `work_mem` spill; the inequality predicate) plus two closing "Prove it" questions — one more predict moment than topic 20, matching a topic that compares three algorithms pairwise across two very different query shapes.

## Storyboard

1. **Hook.** The same two tables, two different queries. One customer's orders: 9.681 ms. Every order joined to its customer: 383.6 ms — and the planner didn't pick the same strategy both times.
2. **Predict: the selective join.** One customer out of 100,000, a handful of their rows out of 2,000,000. `orders2.customer_id` is indexed. Which join algorithm will the planner pick?
3. **Reveal.** Nested Loop, 9.681 ms — the outer side (one customer) runs the inner side's index lookup once. Forced into Hash Join instead on the same query: 141.187 ms, about 14.6× slower.
4. **Mechanism: nested loop.** For each outer row, run the inner scan again; an index on the inner side turns "run the inner scan again" into "one index lookup," which is why it wins when the outer side is tiny.
5. **Mechanism: hash join.** Build an in-memory hash table on one side, then scan the other side and probe it — one pass each, no repeated inner scans, but it needs an equality condition and the table has to fit in memory (or `work_mem`).
6. **Predict: the full join.** Every row of `orders2`, joined to `customers`. No filter at all. Which algorithm wins now?
7. **Reveal.** Hash Join by default, 339.6–383.6 ms. Forced Nested Loop: 431.269 ms. Forced Merge Join (both sides sorted): 543.876 ms — the most expensive of the three, measured as it came out, not adjusted to flatter merge join.
8. **Mechanism: merge join.** Requires both inputs already sorted on the join key — by an index, or by an explicit sort step the planner adds. No hash table, no repeated inner scans, but paying for the sort (or relying on one already being free) decides whether it's worth it.
9. **Mechanism: what decides.** Cardinality and selectivity (tiny outer + an index → nested loop wins), existing sort order (already sorted → merge join can skip its own sort), memory (a hash table has to fit), and predicate type (hash and merge both need equality; nested loop is the only one that doesn't care).
10. **Predict: shrinking work_mem.** The full join, forced to Hash Join, with `work_mem` cut from its 4MB default down to 64kB. What changes?
11. **Reveal.** 1 batch at the default (383.577 ms) becomes 64 batches at 64kB (413.237 ms) — the hash table no longer fits, so it spills to temporary disk files across many batches. Slower, but not catastrophically — a ~7.7% increase, not a cliff.
12. **Mechanism: work_mem.** The per-operation memory budget before a sort or hash table starts writing to disk; hash-based operations get extra headroom via `hash_mem_multiplier`, but once that's exhausted too, batches are how a hash join keeps running instead of running out of memory.
13. **Predict: the inequality predicate.** Same tables, but the join condition is now a range, not an equality — and `enable_nestloop` is turned off. Does the planner manage to avoid a nested loop anyway?
14. **Reveal.** No — it's still a Nested Loop. `EXPLAIN` shows the alternative plans priced at an inflated cost instead of disappearing. Hash join and merge join both need an equality condition; nested loop is the only algorithm that was ever an option here, documented default or not.
15. **Recap.** Three questions before trusting a join's algorithm: does one side have an index the other side can drive into, is either side already sorted on the join key, and is this an equality condition at all.
16. **Prove it · 1 of 2.** Given a tiny, highly selective outer side and an index on the inner table's join column, predict the winning algorithm.
17. **Prove it · 2 of 2.** Given a hash join whose `EXPLAIN (ANALYZE)` reports more than one batch, identify what that means and which setting controls it.

(17 numbered beats above collapse to 15 reel steps: steps 4 and 5 both land as "mechanism" steps with no predict, and steps 16–17 are the two closing "Prove it" steps — see reel.tsx for the final step list and exact titles.)

## Claims list (source for each)

| # | Claim | Source |
|---|---|---|
| 1 | Nested loop: outer scan runs the inner scan once per outer row; cost = outer cost + rows × inner cost | using-explain.txt |
| 2 | Hash join: rows of one table entered into an in-memory hash table, the other table scanned and probed | using-explain.txt |
| 3 | Merge join requires both inputs sorted on the join key, by index or explicit sort | using-explain.txt |
| 4 | enable_hashjoin / enable_mergejoin / enable_nestloop, all default on, as the "crude but useful" way to force alternate plans | using-explain.txt, runtime-config-query.txt |
| 5 | "It is impossible to suppress nested-loop joins entirely" | runtime-config-query.txt |
| 6 | work_mem: per-operation memory budget for sorts and hash tables before spilling to disk, default 4MB | runtime-config-resource.txt |
| 7 | Hash-based operations get extra memory via hash_mem_multiplier | runtime-config-resource.txt |
| 8 | Nested loop wins the highly selective filtered join (9.681ms vs. 141.187ms forced hash) | examples.py, this topic's SOURCES.md |
| 9 | Hash join wins the full unfiltered join (339.6-383.6ms vs. 431.269ms nested loop, 543.876ms merge join) | examples.py, SOURCES.md |
| 10 | work_mem spill: 1 batch (383.577ms) to 64 batches (413.237ms) when work_mem drops to 64kB | examples.py, SOURCES.md |
| 11 | Inequality predicate forces nested loop even with enable_nestloop=off | examples.py, SOURCES.md |

## Post-notes headings (planned)
Outcomes; Into the internals (block vs. index nested loops and why PostgreSQL's own cost formula rewards an inner index; grace/hybrid hash join partitioning, which this topic's batch count is one instance of; why sort-merge's cost is dominated by whether the sort is free); In production (reading a batch count, when to bump work_mem vs. accept the spill, equality vs. inequality joins as a planning decision you can't configure away); Next (handoff to topic 22, hash vs. sort aggregation).

## Concept ledger
Introduces: `nested-loop-join`, `hash-join`, `merge-join`, `work-mem-spill`. Uses: `planner-cost-constants`, `join-order-search`. Declared: `sql-select`.

## Changes from the chapter plan
None — followed CHAPTER.md entry 21 as written (which this session also wrote, immediately before starting research, per section 1 of the skill: entry 21 did not exist yet since topic 20 was the chapter's last entry).
