# Outline — Strongly connected components

## Learning outcomes

- Implement Tarjan's single-pass low-link SCC algorithm and Kosaraju's two-pass algorithm, and state what each costs over the other.
- Build the condensation DAG of a graph's SCCs and confirm directly that it has no cycle.
- Reduce a small 2-SAT instance to an implication graph and decide satisfiability by its SCCs.

## Reel steps (storyboard)

1. **Opening.** A graph with visibly clustered SCCs, drawn in distinct shades. Caption: indistinguishable from full reachability at a glance.
2. **PredictCondensation.** The same graph, asking whether its condensation is always/sometimes/never a DAG. Answer: always — maximality rules out a cycle.
3. **TarjanMechanism.** A single DFS pass with a live low-link number, a pop the instant low-link equals discovery index.
4. **KosarajuMechanism.** Two labelled passes: finish order, then DFS on the transpose in that order. Takeaway: Tarjan's one pass vs. Kosaraju's two.
5. **CondensationGraph.** The graph's SCCs contracted to points, confirmed acyclic directly. Takeaway: the condensation of any directed graph is acyclic.
6. **TwoSAT.** A satisfiable instance beside an unsatisfiable one, asking what a shared SCC between a variable and its negation means. Answer: always unsatisfiable.
7. **Recap.** The same graph once more, handoff to Dijkstra's algorithm. Takeaway: every structural fact cost exactly one traversal.

## Engagement arc

- Hook (step 1): telling full reachability apart from clustered reachability, at scale, costs one more DFS.
- First predict (step 2, within first four steps): the condensation-is-always-a-DAG question.
- Second predict (step 6): what a shared SCC between a literal and its negation means for satisfiability.
- Takeaways: steps 4, 5, 7 (three).
- Recap (step 7): the chapter's own closing idea (every traversal cost one pass), handoff to Chapter 18.

## Narrator's line of thought, by step

1. Names the problem (telling full vs. clustered reachability apart) before any algorithm.
2. Poses the condensation predict as a direct consequence of maximality, not a trick.
3. Names Tarjan's low-link value and the pop rule as the single mechanism behind the whole algorithm.
4. Names Kosaraju's two-pass construction and states its one practical cost against Tarjan's.
5. Proves the condensation claim by direct construction and the chapter's own earlier cycle test, not by assertion.
6. Poses the 2-SAT predict, then explains why a shared SCC forces an impossible shared value.
7. Closes the chapter's own running claim (every structural fact cost one traversal) and hands off to weighted shortest paths.

## Post-notes headings

- Internals: why the condensation is always a DAG.
- Lab: `examples.py`'s checks (both algorithms agree on the SCC partition; the condensation's direct acyclicity check; the satisfiable/unsatisfiable 2-SAT pair).
- Production: dead-code elimination, deadlock-cycle detection, graph clustering.
- Frontier: articulation points/bridges/biconnectivity and lowest common ancestor, both named once.
- Where this goes next: handoff to Chapter 18 (Dijkstra's algorithm).

## Examples to execute and what each asserts

- `tarjan_scc` and `kosaraju_scc` on `SCC_ADJ`: both return the identical partition `[[0,1,2],[3,4],[5]]` after normalising.
- `condensation` of that partition, checked with `has_cycle_directed` (topic 60's own test): no cycle.
- `two_sat_satisfiable` on a constructed satisfiable instance: `True`; on a constructed unsatisfiable instance (forcing one variable both true and false): `False`.

## Bridge and handoff

- Bridge: topic 61's handoff, word for word.
- Handoff: to Chapter 18 (Dijkstra's algorithm), word for word as stated in CHAPTER.md.

## Concept ledger

- Introduces: `strongly-connected-components`, `low-link-value`, `tarjan-scc`, `kosaraju-scc`, `condensation-graph`, `two-sat-via-scc`.
- Uses: `depth-first-search`, `discovery-finish-time`, `edge-classification`, `iterative-dfs-explicit-stack` (topic 60), `topological-sort` (topic 61), `stack` (Chapter 2), `directed-acyclic-graph` (Chapter 10).
- Declared: none.

## Claims list

1. The low-link value is the smallest discovery index reachable from a vertex through its DFS subtree, including itself — Wikipedia "Tarjan's strongly connected components algorithm", quoted; `tarjan_scc`.
2. A vertex is the root of a complete SCC exactly when its low-link equals its own discovery index — same source, quoted; `tarjan_scc`'s pop condition.
3. Kosaraju's algorithm relies on the transpose graph having the identical SCCs as the original — Wikipedia "Kosaraju's algorithm", quoted; `kosaraju_scc` and `transpose`.
4. Kosaraju performs two full traversals against Tarjan's and the path-based algorithm's one — same source, quoted; stated as this topic's own measured cost contrast.
5. Each 2-CNF clause is logically equivalent to a pair of implications — Wikipedia "2-satisfiability", quoted; `build_implication_graph`.
6. A 2-CNF formula is satisfiable iff no variable shares an SCC with its own negation — same source (Aspvall, Plass and Tarjan, 1979), quoted; `two_sat_satisfiable`, confirmed on both a satisfiable and an unsatisfiable constructed instance.
7. The condensation of an implication graph (and, by the same argument, any directed graph) is always a DAG — same source, quoted; confirmed directly in `examples.py` via `has_cycle_directed` on the constructed condensation.

## Changes from the chapter plan

None. The topic follows CHAPTER.md's scope, outcomes, bridge and handoff exactly, with two predict steps (the condensation question and the 2-SAT shared-SCC question) satisfying the full-topic minimum.
