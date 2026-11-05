# Sources — Topological sort

## Wikipedia — "Topological sorting"

URL: https://en.wikipedia.org/wiki/Topological_sorting
Version: fetched 2026-11-05

> Precisely, a topological sort is a graph traversal in which each node v is visited only after all its dependencies are visited. A topological ordering is possible if and only if the graph has no directed cycles, that is, if it is a directed acyclic graph (DAG).

> One of these algorithms, first described by Kahn (1962), works by choosing vertices in the same order as the eventual topological sort.

> If the graph is a DAG, a solution will be contained in the list L (although the solution is not necessarily unique). Otherwise, the graph must have at least one cycle and therefore a topological sort is impossible.

> Reflecting the non-uniqueness of the resulting sort, the structure S can be simply a set or a queue or a stack. Depending on the order that nodes n are removed from set S, a different solution is created. A variation of Kahn's algorithm that breaks ties lexicographically forms a key component of the Coffman–Graham algorithm for parallel scheduling and layered graph drawing.

Contents:
- Topological sort's own definition (every node visited only after its dependencies) and the DAG-iff-topological-order-exists equivalence — the topic's opening fact.
- Kahn's own algorithm (1962), attributed by name, with its in-degree-queue mechanics.
- The cycle-as-failure-mode fact: Kahn's algorithm fails to drain its queue exactly when the graph has a cycle.
- The lexicographically-smallest-order variant (breaking ties by vertex label), named as a building block of the Coffman–Graham scheduling algorithm — the topic's citation for the heap-based variant.

## Wikipedia — "Depth-first search" (reused from topic 60's own `SOURCES.md`)

URL: https://en.wikipedia.org/wiki/Depth-first_search
Version: fetched 2026-11-05 (same fetch as topic 60; quote re-verified against the cached text)

> Reverse postordering produces a topological sorting of any directed acyclic graph. This ordering is also useful in control-flow analysis as it often represents a natural linearization of the control flows.

Contents:
- The exact claim this topic's second algorithm relies on: reverse DFS finish order (reverse postordering) is a valid topological sort of any DAG.
