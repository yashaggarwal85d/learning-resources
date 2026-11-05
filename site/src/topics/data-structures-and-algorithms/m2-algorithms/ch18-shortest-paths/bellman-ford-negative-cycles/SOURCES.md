# Sources — Bellman-Ford and negative cycles

## Wikipedia — "Bellman–Ford algorithm"

URL: https://en.wikipedia.org/wiki/Bellman%E2%80%93Ford_algorithm
Version: fetched 2026-11-05 (oldid=1381060493)

> The Bellman–Ford algorithm is an algorithm that computes shortest paths from a single source vertex to all of the other vertices in a weighted digraph.

> It is slower than Dijkstra's algorithm for the same problem, but more versatile, as it is capable of handling graphs with negative edge weights.

> However, Dijkstra's algorithm uses a priority queue to greedily select the closest vertex that has not yet been processed, and performs this relaxation process on all of its outgoing edges; by contrast, the Bellman–Ford algorithm simply relaxes all the edges, and does this

> repeat |V|−1 times:

> If a graph contains a "negative cycle" (i.e. a cycle whose edges sum to a negative value) that is reachable from the source, then there is no cheapest path: any path that has a point on the negative cycle can be made cheaper by one more walk around the negative cycle. In such a case, the Bellman–Ford algorithm can detect and report the negative cycle.

> The edge (u, v) that is found in step 3 must be reachable from a negative cycle, but it isn't necessarily part of the cycle itself, which is why it's necessary to follow the path of predecessors backwards until a cycle is detected.

> When the algorithm is used to find shortest paths, the existence of negative cycles is a problem, preventing the algorithm from finding a correct answer. However, since it terminates upon finding a negative cycle, the Bellman–Ford algorithm can be used for applications in which this is the target to be sought – for example in cycle-cancelling techniques in network flow analysis.

> A variation of the Bellman–Ford algorithm described by Moore (1959), reduces the number of relaxation steps that need to be performed within each iteration of the algorithm. If a vertex v has a distance value that has not changed since the last time the edges out of v were relaxed, then there is no need to relax the edges out of v a second time. In this way, as the number of vertices with correct distance values grows, the number whose outgoing edges that need to be relaxed in each iteration shrinks, leading to a constant-factor savings in time for dense graphs. This variation can be implemented by keeping a collection of vertices whose outgoing edges need to be relaxed, removing a vertex from this collection when its edges are relaxed, and adding to the collection any vertex whose distance value is changed by a relaxation step. In China, this algorithm was popularized by Fanding Duan, who rediscovered it in 1994, as the "shortest path faster algorithm".

> Bellman, Richard (1958). "On a routing problem". Quarterly of Applied Mathematics. 16: 87–90.

> Ford, Lester R. Jr. (August 14, 1956). Network Flow Theory. Paper P-923. Santa Monica, California: RAND Corporation.

Contents:
- The algorithm's own general description and attribution (Bellman 1958, Ford 1956) — used directly for this topic's hook and attribution.
- The |V|−1 relaxation-round mechanism and why Dijkstra's priority queue is replaced with relaxing every edge, this topic's own "`|V| − 1` relaxation rounds" clause.
- The general negative-cycle definition and detection claim, and the predecessor-trail-following mechanism for extracting the actual cycle once detected — this topic's "negative-cycle detection and extraction" clause (the currency-arbitrage framing is this topic's own worked example, built from the general negative-weight-cycle mechanism this source documents; no fetchable primary or secondary source was found connecting currency arbitrage specifically to Bellman–Ford, documented in `OUTLINE.md`).
- The queue-based Moore/SPFA variant (re-relax only a vertex whose own distance has just improved) and its retained O(|V|·|E|) worst-case bound — this topic's "the queue-based SPFA variant and its worst case" clause.

## Wikipedia — "Shortest path problem"

URL: https://en.wikipedia.org/wiki/Shortest_path_problem
Version: fetched 2026-11-05

> Dijkstra's algorithm solves the single-source shortest path problem with only non-negative edge weights.

Contents:
- Restated here only to contrast with Bellman-Ford's own wider scope (handles negative edges, where Dijkstra's algorithm, topic 63, cannot) — the same source topic 63 itself cites.
