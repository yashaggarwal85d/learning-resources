# Sources — Strongly connected components

## Wikipedia — "Tarjan's strongly connected components algorithm"

URL: https://en.wikipedia.org/wiki/Tarjan%27s_strongly_connected_components_algorithm
Version: fetched 2026-11-05

> Each node v is assigned a unique integer v.index, which numbers the nodes consecutively in the order in which they are discovered. It also maintains a value v.lowlink that represents the smallest index of any node on the stack known to be reachable from v through v's DFS subtree, including v itself.

> When each node finishes recursing, if its lowlink is still set to its index, then it is the root node of a strongly connected component, formed by all of the nodes above it on the stack. The algorithm pops the stack up to and including the current node, and presents all of these nodes as a strongly connected component.

Contents:
- The low-link value's own definition, attributed to Tarjan (1972), used verbatim as this topic's definition.
- The pop-on-low-link-equals-index rule that completes one SCC per DFS, the mechanism `tarjan_scc` implements directly.

## Wikipedia — "Kosaraju's algorithm"

URL: https://en.wikipedia.org/wiki/Kosaraju%27s_algorithm
Version: fetched 2026-11-05

> Kosaraju-Sharir's algorithm (also known as Kosaraju's algorithm) is a linear time algorithm to find the strongly connected components of a directed graph. Aho, Hopcroft and Ullman credit it to S. Rao Kosaraju and Micha Sharir.

> Kosaraju suggested it in 1978 but did not publish it, while Sharir independently discovered it and published it in 1981.

> It makes use of the fact that the transpose graph (the same graph with the direction of every edge reversed) has exactly the same strongly connected components as the original graph.

> Provided the graph is described using an adjacency list, Kosaraju's algorithm performs two complete traversals of the graph and so runs in Θ(V+E) (linear) time, which is asymptotically optimal because there is a matching lower bound (any algorithm must examine all vertices and edges). It is the conceptually simplest efficient algorithm, but is not as efficient in practice as Tarjan's strongly connected components algorithm and the path-based strong component algorithm, which perform only one traversal of the graph.

Contents:
- Kosaraju's algorithm's own attribution (Kosaraju 1978, unpublished; Sharir 1981, independent publication) and the transpose-graph fact its second pass relies on.
- The one practical difference this topic measures: Kosaraju needs two full DFS passes and a transpose; Tarjan needs one DFS and an explicit stack.

## Wikipedia — "2-satisfiability"

URL: https://en.wikipedia.org/wiki/2-satisfiability
Version: fetched 2026-11-05

> Each clause in a 2-CNF formula is logically equivalent to an implication from one variable or negated variable to the other.

> Two vertices in a directed graph are said to be strongly connected to each other if there is a directed path from one to the other and vice versa.

> In particular, if a variable and its negation both belong to the same strongly connected component, the instance cannot be satisfied, because it is impossible to assign both of these literals the same value. As Aspvall et al. showed, this is a necessary and sufficient condition: a 2-CNF formula is satisfiable if and only if there is no variable that belongs to the same strongly connected component as its negation.

> The condensation is automatically a directed acyclic graph and, like the implication graph from which it was formed, it is skew-symmetric.

Contents:
- The implication-graph construction: each 2-CNF clause becomes an implication edge, the exact rule `build_implication_graph` follows.
- The satisfiability-iff-no-shared-SCC theorem (Aspvall, Plass and Tarjan, 1979), used directly by `two_sat_satisfiable`.
- The condensation-graph-is-always-a-DAG fact, reused for this topic's own condensation-graph claim (stated generally, not only for implication graphs).
