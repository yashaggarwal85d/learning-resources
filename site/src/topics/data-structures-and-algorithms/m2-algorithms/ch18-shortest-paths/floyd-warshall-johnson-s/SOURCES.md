# Sources — Floyd-Warshall and Johnson's algorithm

## Wikipedia — "Floyd–Warshall algorithm"

URL: https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm
Version: fetched 2026-11-05

> In computer science, the Floyd–Warshall algorithm (also known as Floyd's algorithm, the Roy–Warshall algorithm, the Roy–Floyd algorithm, or the WFI algorithm) is an algorithm for finding shortest paths in a directed weighted graph with positive or negative edge weights (but with no negative cycles).

> A single execution of the algorithm will find the lengths (summed weights) of shortest paths between all pairs of vertices. Although it does not return details of the paths themselves, it is possible to reconstruct the paths with simple modifications to the algorithm. Versions of the algorithm can also be used for finding the transitive closure of a relation, or (in connection with the Schulze voting system) widest paths between all pairs of vertices in a weighted graph.

> The Floyd–Warshall algorithm is an example of dynamic programming, and was published in its currently recognized form by Robert Floyd in 1962.

> it is essentially the same as algorithms previously published by Bernard Roy in 1959

> and also by Stephen Warshall in 1962

> The Floyd–Warshall algorithm compares many possible paths through the graph between each pair of vertices.

> for k from 1 to |V|
> for i from 1 to |V|
> for j from 1 to |V|
> if dist[i][j] > dist[i][k] + dist[k][j]
> dist[i][j] = dist[i][k] + dist[k][j]
> end if

> Transitive closure of directed graphs (Warshall's algorithm). In Warshall's original formulation of the algorithm, the graph is unweighted and represented by a Boolean adjacency matrix. Then the addition operation is replaced by logical conjunction (AND) and the minimum operation by logical disjunction (OR).

> The Floyd–Warshall algorithm typically only provides the lengths of the paths between all pairs of vertices. With simple modifications, it is possible to create a method to reconstruct the actual path between any two endpoint vertices.

> The array prev[u][v] holds the penultimate vertex on the path from u to v (except in the case of prev[v][v], where it always contains v even if there is no self-loop on v):

Contents:
- The algorithm's own general description, non-negative-cycle restriction, and attribution (Floyd 1962, Roy 1959, Warshall 1962) — this topic's hook and attribution.
- The triple-nested-loop pseudocode itself, computing shortest distances by considering each vertex in turn as an allowed intermediate — this topic's "O(n³) DP over intermediate vertices" clause.
- Warshall's own transitive-closure formulation (Boolean matrix, AND/OR in place of add/min) — this topic's "transitive closure" clause.
- The path-reconstruction mechanism (a `prev` matrix of penultimate vertices, updated alongside the distance matrix) — this topic's "path reconstruction" clause.

## Wikipedia — "Johnson's algorithm"

URL: https://en.wikipedia.org/wiki/Johnson%27s_algorithm
Version: fetched 2026-11-05

> Johnson's algorithm is a way to find the shortest paths between all pairs of vertices in an edge-weighted directed graph. It allows some of the edge weights to be negative numbers, but no negative-weight cycles may exist. It works by using the Bellman–Ford algorithm to compute a transformation of the input graph that removes all negative weights, allowing Dijkstra's algorithm to be used on the transformed graph.

> It is named after Donald B. Johnson, who first published the technique in 1977.

> First, a new node q is added to the graph, connected by zero-weight edges to each of the other nodes.

> Second, the Bellman–Ford algorithm is used, starting from the new vertex q, to find for each vertex v the minimum weight h(v) of a path from q to v. If this step detects a negative cycle, the algorithm is terminated.

> Finally, q is removed, and Dijkstra's algorithm is used to find the shortest paths from each node s to every other vertex in the reweighted graph. The distance in the original graph is then computed for each distance D(u, v), by adding h(v) − h(u) to the distance returned by Dijkstra's algorithm.

> Thus, when the graph is sparse, the total time can be faster than the Floyd–Warshall algorithm, which solves the same problem in time

Contents:
- The algorithm's own general description, restriction (no negative cycles), and attribution (Johnson, 1977) — this topic's hook and attribution.
- The exact reweighting mechanism (an added source vertex, a Bellman-Ford pass to compute each vertex's potential, every edge reweighted by it, then Dijkstra from every vertex) — this topic's "Johnson's potential reweighting" clause.
- The sparse-graph trade-off against Floyd-Warshall's fixed cost — this topic's own measured comparison.
