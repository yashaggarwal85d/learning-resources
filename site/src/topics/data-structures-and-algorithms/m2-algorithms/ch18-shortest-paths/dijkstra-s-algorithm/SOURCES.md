# Sources — Dijkstra's algorithm

## Wikipedia — "Dijkstra's algorithm"

URL: https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
Version: fetched 2026-11-05

> For example, if there is a directed graph with 3 nodes: s -> a with weight 2, s -> b with weight 5, b -> a with weight -10.

> Since Dijkstra's algorithm uses a greedy strategy, it selects vertex a first, as its tentative distance of 2 is smaller than that of vertex b, which is 5. The algorithm therefore considers the shortest distance to a to be finalized at 2. However, the path s→b→a has a total weight of 5+(−10)=−5, which is shorter. Thus, Dijkstra's algorithm produces an incorrect result when negative-weight edges are present.

> With a self-balancing binary search tree or binary heap, the algorithm requires Θ((|E|+|V|)log⁡|V|) time in the worst case; for connected graphs this time bound can be simplified to Θ(|E|log⁡|V|).

> In common presentations of Dijkstra's algorithm, initially all nodes are entered into the priority queue. This is, however, not necessary: the algorithm can start with a priority queue that contains only one item, and insert new items as they are discovered (instead of doing a decrease-key, check whether the key is in the queue; if it is, decrease its key, otherwise insert it).

> This variant has the same worst-case bounds as the common variant, but maintains a smaller priority queue in practice, speeding up queue operations.

Contents:
- The exact counterexample graph (3 nodes, s→a weight 2, s→b weight 5, b→a weight −10) demonstrating why Dijkstra's algorithm fails with a negative edge — used directly as `NEGATIVE_COUNTEREXAMPLE_ADJ` in `examples.py`.
- The greedy-selection failure mechanism itself: vertex a is finalized too early, before the shorter path through b is ever considered.
- The O((|E|+|V|)log|V|) worst-case bound for a binary-heap-backed priority queue, simplified to O(|E|log|V|) for connected graphs — this topic's own complexity claim.
- The lazy-insertion variant (start with one queue item, insert new entries as discovered rather than decrease-key) and its own worst-case-bound-preserving, practically-smaller-queue trade-off — this topic's "lazy deletion vs. decrease-key" contrast.

## Wikipedia — "Shortest path problem"

URL: https://en.wikipedia.org/wiki/Shortest_path_problem
Version: fetched 2026-11-05

> Dijkstra's algorithm solves the single-source shortest path problem with only non-negative edge weights.

Contents:
- The general statement of Dijkstra's own restriction (non-negative edge weights only), independent of any particular counterexample, used alongside the "Dijkstra's algorithm" article's own worked failure case.
