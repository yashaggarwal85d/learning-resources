---
id: dsa.floyd-warshall-johnson-s
title: Floyd-Warshall and Johnson's algorithm
---

<section data-section="outcomes">

## After this topic you can

- Compute all-pairs shortest distances with Floyd-Warshall on a graph with negative edges and no negative cycle, and confirm the result against a brute-force computation.
- Reconstruct an actual shortest path (not just its length) from the predecessor matrix Floyd-Warshall builds alongside the distances.
- Run Johnson's algorithm (reweighting plus Dijkstra from every vertex) on the same graph and confirm it matches Floyd-Warshall's distances exactly.

</section>

<section data-section="internals">

## Into the internals

### Why reweighting can never change which route is cheapest

Johnson's algorithm reweights every edge `(u, v)` by `h(u) − h(v)`, where `h` is each vertex's own shortest distance from an added source vertex. Any route from `u` to `v` picks up the identical total adjustment, `h(u) − h(v)`, no matter which edges it actually uses, because every intermediate vertex's own `h` value cancels against the next edge's adjustment along the way. Since every candidate route between the same two endpoints shifts by that one identical constant, the comparison between them — which one sums to less — never changes. That is the entire reason Dijkstra's answer on the reweighted graph, adjusted back by the same constant, reproduces the original shortest distance exactly.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs Floyd-Warshall on a five-vertex graph with two negative edges but no negative cycle, and confirms its distances match an independent Bellman-Ford run from every vertex (topic 64's own algorithm). It reconstructs an actual shortest path from the predecessor matrix and confirms its total weight matches the distance matrix exactly, and that the reconstructed path is strictly cheaper than the graph's one direct edge between the same two vertices. The identical recurrence, run with boolean reachability instead of weights, computes the transitive closure and is confirmed against an independent depth-first reachability search. Finally, Johnson's algorithm (an added source vertex, a Bellman-Ford pass, edge reweighting, then Dijkstra from every vertex) is confirmed to match Floyd-Warshall's distances exactly on the identical graph.

</section>

<section data-section="production">

## In production

All-pairs shortest paths underlie network diameter and centrality measurements, routing-table precomputation in small-to-medium networks, and any system that needs every pair's distance available for repeated lookup rather than recomputed per query; Johnson's algorithm specifically is the practical choice once a graph's edge count makes running Dijkstra from every vertex cheaper than Floyd-Warshall's fixed cost.

</section>

<section data-section="frontier">

## The frontier

Faster all-pairs algorithms using fast matrix multiplication exist for dense graphs with restricted edge weights (small integers), trading a higher constant factor for a better asymptotic bound — worthwhile only on graphs large enough that the constant factor stops dominating.

</section>

<section data-section="questions">

## More questions

- The waypoint loop in Floyd-Warshall's recurrence must be the outermost of the three nested loops. What would go wrong if it were the innermost instead?
- Johnson's algorithm needs its added source vertex connected to every other vertex. What would go wrong if it were connected to only some of them?

</section>

<section data-section="next">

## Where this goes next

Every algorithm so far has answered a question between two vertices, or from one vertex to every other. A directed graph with no cycle at all — a schedule, a build, a plan — makes the question easier than any of them needed to be: relax every edge exactly once, in the one order topic 61 already builds, and every shortest and longest path falls out for free, with no priority queue, no repeated rounds, and no cycle to ever worry about. DAG shortest and longest paths, next.

</section>
