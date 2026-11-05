# Outline — Topological sort

## Learning outcomes

- Run Kahn's algorithm and reverse-DFS-finish-order topological sort on the same DAG and confirm both orders are valid.
- Explain why each algorithm detects a cycle as a natural failure rather than a separate check.
- Produce the lexicographically smallest topological order with a heap-based Kahn's algorithm, and say what it costs over the plain queue version.

## Reel steps (storyboard)

1. **Opening.** The DAG `DAG_ADJ`, each vertex labelled by its in-degree. Caption: nothing processed before what it depends on.
2. **PredictCycle.** A directed cycle. Predict: can any valid order exist at all? Answer: no — a cycle rules out every order.
3. **KahnMechanism.** The in-degree queue draining, each removal decrementing neighbours live.
4. **ReverseDFS.** DFS finish order read off and reversed into a second, independently valid order. Takeaway: the two algorithms need not agree.
5. **StuckGraph.** Kahn's algorithm stalling on a cyclic graph, every remaining vertex stuck at positive in-degree. Takeaway: a cycle is each algorithm's own natural failure.
6. **LexicographicHeap.** A plain queue's order against a min-heap's order on the same graph. Predict: always identical, always different, or could either happen? Answer: either — the heap gives the smallest when they differ.
7. **Recap.** The dependency graph once more, fully ordered, handoff to strongly connected components. Takeaway: no order exists without acyclicity.

## Engagement arc

- Hook (step 1): a build system's dependency order, found by traversal, not trial and error.
- First predict (step 2, within first four steps): a cycle rules out every topological order.
- Second predict (step 6): a heap's lexicographic order versus a plain queue's arrival order.
- Takeaways: steps 4, 5, 7 (three).
- Recap (step 7): acyclicity as the only obstruction, handoff to SCCs.

## Narrator's line of thought, by step

1. Names the dependency-order problem in plain terms before any algorithm.
2. Poses the cycle predict as a direct consequence to trace, not a trick.
3. Names Kahn's algorithm as BFS's own queue mechanics, pointed at in-degrees.
4. Names reverse-DFS-finish-order as the same DFS already built, read a particular way.
5. Explains cycle detection as each algorithm's own natural failure, not a bolted-on check.
6. Poses the heap predict, then explains why a queue's arrival order and a heap's label order can diverge.
7. States the one obstruction (acyclicity) and hands off to the chapter's last structural question.

## Post-notes headings

- Internals: why neither algorithm needs a bolted-on cycle check.
- Lab: `examples.py`'s checks (both algorithms on the same DAG and a cyclic graph; the heap-based variant's divergence from a plain queue).
- Production: critical-path scheduling on DAGs, pointer to Data Engineering Ch.11.
- Frontier: articulation points/bridges/biconnectivity and lowest common ancestor, both named once in topic 62's own frontier note.
- Where this goes next: handoff to topic 62.

## Examples to execute and what each asserts

- `kahn_toposort` and `dfs_finish_order` on `DAG_ADJ`: both return a non-None order; `is_valid_topo_order` holds for each, independently.
- Both algorithms on `CYCLIC_ADJ`: both correctly report a cycle (`None`).
- `kahn_toposort_lexicographic` on `MULTI_ORDER_ADJ`: matches the lexicographically smallest of all valid orders (`all_valid_topo_orders`), and differs from the plain-queue order on the same graph (`plain_order != lex_order`).

## Bridge and handoff

- Bridge: topic 60's handoff, word for word.
- Handoff: to topic 62 (strongly connected components), word for word as stated in CHAPTER.md.

## Concept ledger

- Introduces: `topological-sort`, `kahns-algorithm`, `reverse-dfs-finish-order`, `lexicographically-smallest-topo-order`.
- Uses: `breadth-first-search` (topic 59), `depth-first-search`, `discovery-finish-time`, `three-colour-cycle-detection` (topic 60), `binary-heap` (Chapter 6), `directed-acyclic-graph` (Chapter 10).
- Declared: none.

## Claims list

1. A topological order exists iff the graph is a DAG — Wikipedia "Topological sorting", quoted; demonstrated in `examples.py` on both a DAG and a cyclic graph.
2. Kahn's algorithm (1962) removes a zero-in-degree vertex, decrements neighbours, repeats — Wikipedia "Topological sorting", quoted, attributed by name; `kahn_toposort`.
3. Reverse DFS finish order is a valid topological sort of any DAG — Wikipedia "Depth-first search", quoted (reused from topic 60); `dfs_finish_order`.
4. A cycle causes Kahn's queue to drain short of n vertices, and DFS's own back-edge test to fire — both demonstrated directly in `examples.py` on `CYCLIC_ADJ`.
5. A heap-based Kahn's variant, breaking ties by vertex label, gives the lexicographically smallest valid order — Wikipedia "Topological sorting" (Coffman–Graham pointer), quoted; confirmed in `examples.py` against every valid order of a small test graph.

## Changes from the chapter plan

None. The topic follows CHAPTER.md's scope, outcomes, bridge and handoff exactly, with two predict steps (cycle existence, and the heap-versus-queue divergence) satisfying the full-topic minimum.
