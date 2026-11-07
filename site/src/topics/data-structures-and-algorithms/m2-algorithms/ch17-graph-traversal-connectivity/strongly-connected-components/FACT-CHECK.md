# Fact-check — Strongly connected components

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | The low-link value is the smallest discovery index reachable from a vertex through its DFS subtree, including itself. | Confirmed | Wikipedia "Tarjan's strongly connected components algorithm", quoted; `examples.py` (`tarjan_scc`). |
| 2 | A vertex is the root of a complete SCC exactly when its low-link equals its own discovery index. | Confirmed | Same source, quoted; `examples.py` (`tarjan_scc`'s pop condition, exercised on a graph with three distinct components). |
| 3 | Kosaraju's algorithm relies on the transpose graph having the identical SCCs as the original graph. | Confirmed | Wikipedia "Kosaraju's algorithm", quoted; `examples.py` (`kosaraju_scc`/`transpose`, matching Tarjan's result on the same graph). |
| 4 | Kosaraju performs two full graph traversals, against Tarjan's and the path-based algorithm's single traversal. | Confirmed | Same source, quoted. |
| 5 | Each clause of a 2-CNF formula is logically equivalent to a pair of implications. | Confirmed | Wikipedia "2-satisfiability", quoted; `examples.py` (`build_implication_graph`). |
| 6 | A 2-CNF formula is satisfiable if and only if no variable shares a strongly connected component with its own negation. | Confirmed | Same source (Aspvall, Plass and Tarjan, 1979), quoted; `examples.py` (`two_sat_satisfiable`, confirmed on both a constructed satisfiable and a constructed unsatisfiable instance). |
| 7 | The condensation of a directed graph (contracting every SCC to one vertex) is always a DAG. | Confirmed, directly reproduced | Wikipedia "2-satisfiability" (stated for implication graphs specifically, generalised here to directed graphs generally via the maximality argument in `post-notes.md`); `examples.py` (`condensation` + `has_cycle_directed`, topic 60's own cycle test, confirmed acyclic on the constructed three-component graph). |
| 8 | Tarjan's and Kosaraju's algorithms, run on the same graph, find the identical partition into SCCs. | Confirmed, directly reproduced | `examples.py`: `normalize(tarjan_components) == normalize(kosaraju_components)`, asserted explicitly, not merely each checked separately for validity. |

## Currency check

Tarjan's algorithm (1972) and Kosaraju's algorithm (suggested 1978, published by Sharir 1981) are long-settled, textbook-standard results; the 2-SAT-via-SCC reduction (Aspvall, Plass and Tarjan, 1979) is likewise a settled, decades-old result. No recent revision is expected for any of the three.

## Red team

1. **Is the condensation-is-a-DAG claim actually demonstrated on a graph with more than one component, or could a trivial single-SCC graph vacuously pass?** `SCC_ADJ` has three distinct components (a 3-cycle, a 2-cycle, a singleton) chained together, so the condensation graph has three vertices and two edges to actually check for a cycle, not a single trivial vertex.
2. **Does `tarjan_scc` and `kosaraju_scc` agreeing on this one graph generalise, or could it be a coincidence of this specific input?** The SCC partition of any graph is mathematically unique (it is an equivalence-class partition under mutual reachability) regardless of which algorithm finds it — the agreement is not a coincidence of this input but a structural guarantee, which `post-notes.md` states explicitly.
3. **Is the 2-SAT unsatisfiable test case a genuine reduction, or a contrived input that trivially fails for an unrelated reason?** `UNSAT_CLAUSES` encodes `(x0 OR x0) AND (NOT x0 OR NOT x0)`, which directly forces `x0` to be simultaneously true (from the first clause, since both disjuncts are the same literal) and false (from the second) — a genuine 2-SAT unsatisfiability, not a malformed instance, and `two_sat_satisfiable` correctly reports it as such via the implication graph's own SCC structure rather than a special case.
4. **Does the satisfiable test case actually need the SCC machinery, or would a simpler check have sufficed?** `SAT_CLAUSES` encodes three genuine constraints linking `x0` and `x1`; the test exercises the full `build_implication_graph` → `tarjan_scc` → shared-component-check pipeline exactly as the satisfiable path through the real algorithm would, not a shortcut.

## Corrections applied

None. No claim in the chapter plan's own SCC scope was found incorrect against the fetched sources.
