# Fact-check — Floyd-Warshall and Johnson's algorithm

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Floyd-Warshall finds shortest paths in a weighted digraph with positive or negative weights but no negative cycles, in one execution for all pairs. | Confirmed | Wikipedia "Floyd–Warshall algorithm", quoted; `examples.py` (`floyd_warshall`), matching `brute_force_all_pairs` exactly. |
| 2 | The algorithm is Robert Floyd's 1962 formulation, essentially the same as Bernard Roy's 1959 and Stephen Warshall's 1962 transitive-closure algorithms. | Confirmed | Same source, quoted. |
| 3 | The algorithm compares many possible paths between each pair, via a triple-nested loop over waypoints. | Confirmed, directly reproduced | Same source, quoted (pseudocode); `examples.py` (`floyd_warshall`'s triple loop over k, i, j). |
| 4 | Warshall's own transitive-closure formulation replaces addition with logical AND and minimum with logical OR on a Boolean matrix. | Confirmed, directly reproduced | Same source, quoted; `examples.py` (`transitive_closure`, matching an independent DFS-based reachability check). |
| 5 | Path reconstruction uses a `prev` matrix recording each pair's penultimate vertex, not a stored path per pair. | Confirmed, directly reproduced | Same source, quoted; `examples.py` (`reconstruct_path`, confirmed to recover a path strictly cheaper than the graph's one direct edge between the same endpoints). |
| 6 | Johnson's algorithm computes all-pairs shortest paths via Bellman-Ford-computed reweighting followed by Dijkstra from every vertex, named for Donald B. Johnson (1977). | Confirmed, directly reproduced | Wikipedia "Johnson's algorithm", quoted; `examples.py` (`johnsons`), matching `floyd_warshall`'s distances exactly on the identical graph. |
| 7 | Johnson's algorithm's total time can be faster than Floyd-Warshall's specifically on a sparse graph. | Confirmed | Same source, quoted. |

## Currency check

Floyd (1962), Roy (1959), Warshall (1962), and Johnson (1977) are long-settled, textbook-standard results. No recent revision is expected for any claim here.

## Red team

1. **Does `floyd_warshall` actually need the dynamic program, or could the test graph be solved by a simpler method that happens to agree?** `WEIGHTED_EDGES` has two negative edges and multiple route choices between several pairs (e.g. 0 to 2 can go directly at cost 8, or via 4 and 3 at a strictly cheaper negative cost) — the dynamic program is confirmed against an independently-coded brute-force all-pairs Bellman-Ford, not merely checked for self-consistency.
2. **Is the reconstructed path in `reconstruct_path` genuinely the shortest one, or merely some valid path that happens to exist?** Its total weight is asserted equal to `fw_dist[0][2]` (the actual shortest distance Floyd-Warshall computed), and separately asserted strictly less than the direct edge's own weight of eight — both checked computationally, not assumed from the algorithm's correctness alone.
3. **Does `transitive_closure` actually exercise the dynamic program's logic, or does every vertex trivially reach every other regardless of the recurrence?** The graph is confirmed to have every vertex reach every other (`assert all(all(row) for row in closure)`), which is a real structural fact about this particular five-vertex graph (checked against an independent DFS-based `brute_force_reachability`), not an artifact of a vacuous boolean default.
4. **Could Johnson's algorithm in `examples.py` be accidentally falling back to Floyd-Warshall's own distances rather than genuinely computing through reweighting and per-vertex Dijkstra?** `johnsons` is a fully separate code path (its own Bellman-Ford pass for potentials, explicit reweighting with an assertion that every reweighted edge is non-negative, then `dijkstra_from` run once per source vertex) — the match against `fw_dist` is a cross-check between two independently implemented algorithms, not a shared computation.
5. **Is the sparse-graph trade-off claim demonstrated numerically in this topic, or only asserted from the source?** It is stated and sourced as a general asymptotic trade-off (Johnson's algorithm scales with edge count, Floyd-Warshall's does not), consistent with how the chapter plan scopes this clause as a stated trade-off rather than a worked numerical comparison on one small graph, where the vertex count is too small for either algorithm's asymptotic behavior to show a measurable difference.

## Corrections applied

None. No claim in the chapter plan's own scope was found incorrect against the fetched sources, and both algorithms' implementations matched each other and independent brute-force checks on first run.
