# Fact-check — Topological sort

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | A topological order exists if and only if the graph is a DAG. | Confirmed | Wikipedia "Topological sorting", quoted; `examples.py` (both algorithms succeed on `DAG_ADJ`, both fail on `CYCLIC_ADJ`). |
| 2 | Kahn's algorithm (1962) repeatedly removes a zero-in-degree vertex and decrements its neighbours' in-degrees. | Confirmed | Wikipedia "Topological sorting", quoted, attributed by name; `examples.py` (`kahn_toposort`). |
| 3 | Reverse DFS finish order is a valid topological sort of any DAG. | Confirmed | Wikipedia "Depth-first search", quoted (reused from topic 60's own `SOURCES.md`, same fetch); `examples.py` (`dfs_finish_order`). |
| 4 | Kahn's algorithm and reverse-DFS-finish-order need not produce identical orders, only each a valid one. | Confirmed | Derived directly: both orders on `DAG_ADJ` are checked independently by `is_valid_topo_order`, with no equality assertion between them. |
| 5 | A cycle causes Kahn's queue to drain short of n vertices. | Confirmed, directly reproduced | `examples.py` (`kahn_toposort(CYCLIC_ADJ, 4) is None`). |
| 6 | A cycle causes DFS's own back-edge test to fire, with no separate check needed. | Confirmed, directly reproduced | `examples.py` (`dfs_finish_order(CYCLIC_ADJ, 4)` returns `has_cycle=True` from the same grey-neighbour test topic 60 built). |
| 7 | A min-heap-based Kahn's variant, breaking ties by vertex label, gives the lexicographically smallest valid topological order. | Confirmed | Wikipedia "Topological sorting" (the Coffman–Graham pointer), quoted; `examples.py` (`kahn_toposort_lexicographic` matches `min(all_valid_topo_orders(...))` exactly on `MULTI_ORDER_ADJ`). |
| 8 | A plain FIFO queue and the lexicographic heap can actually produce different orders on the same graph. | Confirmed, directly reproduced | `examples.py` (`plain_order != lex_order` on `MULTI_ORDER_ADJ`, asserted explicitly, not merely each checked for validity). |

## Currency check

Kahn's algorithm (1962) and DFS-based topological sort are long-settled, textbook-standard results; no recent revision is expected. The Coffman–Graham algorithm reference is likewise a settled 1972 scheduling result, cited here only for its lexicographic-tie-break building block, not rebuilt.

## Red team

1. **Does the `MULTI_ORDER_ADJ` test graph actually demonstrate a plain-queue-vs-heap divergence, or could both produce the same order vacuously?** The first graph attempted (`{0: [2], 1: [2], 2: [3], 3: []}`) was checked this way and found to give identical orders on both — it was discarded. The final graph (`{0: [1], 1: [], 2: []}`) is built so vertex 2 is enqueued ahead of vertex 1 by a plain FIFO queue (arriving first) while the heap correctly reorders by label; `examples.py` asserts `plain_order != lex_order` explicitly, so the divergence is checked, not assumed.
2. **Is the "lexicographically smallest" claim verified against only one candidate order, or against every valid order of the test graph?** `all_valid_topo_orders` enumerates every permutation of the 3-vertex graph and filters to the valid ones (via `itertools.permutations`), and the test asserts `lex_order == min(all_orders)` against that full enumeration, plus `len(all_orders) > 1` to confirm the test graph genuinely has more than one valid order to distinguish.
3. **Does reusing topic 60's "Reverse postordering produces a topological sorting" quote actually apply here, or is it being stretched beyond its original context?** The quote is Wikipedia's own general statement about DFS postordering on any DAG, not scoped to a specific example in the DFS article — it is the same general claim this topic's reverse-DFS algorithm implements, verified directly by running it on this topic's own `DAG_ADJ` rather than merely citing the quote.
4. **Could the cyclic-graph test (`CYCLIC_ADJ`) be too small to meaningfully exercise both algorithms' failure modes?** It has 4 vertices and one explicit cycle (0→1→2→0) plus a vertex outside the cycle (3) reachable from it — large enough that Kahn's queue must drain several in-degree-zero candidates before stalling, and DFS must traverse into the cycle before finding the back edge, rather than failing trivially on a 2-vertex graph.

## Corrections applied

The first `MULTI_ORDER_ADJ` test graph was replaced after `python3 examples.py` showed it produced identical plain-queue and heap orders, undermining the topic's own claim that the two can diverge — not a sourcing error, but a self-caught test-design flaw, fixed before any build attempt.
