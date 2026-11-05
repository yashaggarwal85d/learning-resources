# Outline — Floyd-Warshall and Johnson's algorithm

## Learning outcomes

- Compute all-pairs shortest distances with Floyd-Warshall on a graph with negative edges and no negative cycle, and confirm the result against a brute-force computation.
- Reconstruct an actual shortest path (not just its length) from the predecessor matrix Floyd-Warshall builds alongside the distances.
- Run Johnson's algorithm (reweighting plus Dijkstra from every vertex) on the same graph and confirm it matches Floyd-Warshall's distances exactly.

## Reel steps (storyboard)

1. **Opening.** A network of a few hundred cities, every pair's fastest route wanted at once. Hook: one dynamic program, or the single-source algorithm run from every city.
2. **PredictSparse.** Does running the single-source algorithm from every vertex beat the fixed dynamic program on a sparse graph? Answer: yes, its cost is tied to edge count.
3. **DPMechanism.** The distance matrix filled one waypoint at a time. Takeaway: allowing one more waypoint per round is the entire mechanism.
4. **PathReconstruction.** A predecessor matrix, followed backward to recover the actual route. Takeaway: a distance alone never says which route achieves it.
5. **TransitiveClosure.** The identical sweep, booleans instead of weights.
6. **JohnsonsMechanism.** Second predict: does reweighting ever change which route is cheapest? Answer: no, every route shifts by the identical constant.
7. **Recap.** Handoff to DAG shortest/longest paths. Takeaway: the all-pairs question needed no new primitive.

## Engagement arc

- Hook (step 1): an all-pairs question, two routes to the identical answer.
- First predict (step 2, within first four steps): which approach does less work on a sparse graph.
- Second predict (step 6): does reweighting ever change which route is cheapest.
- Takeaways: steps 3, 4, 7 (three).
- Recap (step 7): neither algorithm needed a new primitive, handoff to Chapter 18's closing topic.

## Narrator's line of thought, by step

1. Names the all-pairs question and both routes to its answer before any mechanism.
2. Poses the sparse-graph predict directly, framing the entire Johnson's-vs-Floyd-Warshall trade-off as a single comparison.
3. Names the waypoint-by-waypoint mechanism as the one operation the whole dynamic program is built from.
4. Explains why a second matrix is necessary, not merely convenient, for path reconstruction.
5. Shows the identical mechanism generalizes to an unweighted question, reinforcing step 3's claim that the recurrence is the one idea.
6. Poses the reweighting predict, then explains the constant-shift argument behind the answer.
7. Closes on the composition principle (no new primitives) and hands off to the chapter's final topic.

## Post-notes headings

- Internals: why reweighting can never change which route is cheapest.
- Lab: `examples.py`'s checks (Floyd-Warshall vs. brute-force Bellman-Ford, path reconstruction, transitive closure vs. brute-force reachability, Johnson's vs. Floyd-Warshall).
- Production: network diameter/centrality, routing-table precomputation, the sparse-graph trade-off.
- Frontier: fast-matrix-multiplication all-pairs algorithms, named once.
- Where this goes next: handoff to DAG shortest and longest paths.

## Examples to execute and what each asserts

- `floyd_warshall(WEIGHTED_N, WEIGHTED_EDGES)` matches `brute_force_all_pairs` (Bellman-Ford from every vertex) exactly.
- `reconstruct_path` from the predecessor matrix: weight matches the distance matrix exactly, and is strictly cheaper than the graph's one direct edge between the same two vertices.
- `transitive_closure` matches `brute_force_reachability` (an independent DFS from every vertex) exactly.
- `johnsons(WEIGHTED_N, WEIGHTED_EDGES)` matches `floyd_warshall`'s distances exactly; reweighted edges confirmed all non-negative.

## Bridge and handoff

- Bridge: topic 64's handoff, word for word.
- Handoff: to topic 66 (DAG shortest and longest paths), word for word as stated in CHAPTER.md.

## Concept ledger

- Introduces: `floyd-warshall-algorithm`, `transitive-closure`, `path-reconstruction`, `johnson-s-algorithm`, `potential-reweighting`.
- Uses: `dijkstra-algorithm` (topic 63), `bellman-ford-algorithm` (topic 64), `dynamic-programming`, `adjacency-matrix` (Chapter 10).
- Declared: none.

## Claims list

1. Floyd-Warshall finds shortest paths in a weighted digraph with positive or negative weights but no negative cycles, in one execution for all pairs — Wikipedia "Floyd–Warshall algorithm", quoted; `examples.py` (`floyd_warshall`).
2. The algorithm is Robert Floyd's 1962 formulation, essentially the same as Bernard Roy's 1959 and Stephen Warshall's 1962 transitive-closure algorithms — same source, quoted.
3. The algorithm compares many possible paths between each pair, via a triple-nested loop over waypoints — same source, quoted (pseudocode); `examples.py` (`floyd_warshall`'s triple loop).
4. Warshall's own transitive-closure formulation replaces addition with AND and minimum with OR on a boolean matrix — same source, quoted; `examples.py` (`transitive_closure`).
5. Path reconstruction uses a `prev` matrix of penultimate vertices, not a stored path per pair — same source, quoted; `examples.py` (`reconstruct_path`).
6. Johnson's algorithm computes all-pairs shortest paths via Bellman-Ford-computed reweighting followed by Dijkstra from every vertex, named for Donald B. Johnson (1977) — Wikipedia "Johnson's algorithm", quoted; `examples.py` (`johnsons`).
7. Johnson's algorithm's total time can be faster than Floyd-Warshall's on a sparse graph — same source, quoted; this topic's own `PredictSparse` framing.

## Changes from the chapter plan

CHAPTER.md's suggested primary sources (Floyd 1962 and Warshall 1962's original ACM papers; Johnson 1977's original JACM paper) are paywalled/not freely fetchable; Wikipedia's "Floyd–Warshall algorithm" and "Johnson's algorithm" articles quote both papers' own citations directly and cover every scope clause with verifiable quotes, so they were used as the primary sources instead, consistent with topics 63 and 64's own handling of their suggested-but-unfetchable sources.
