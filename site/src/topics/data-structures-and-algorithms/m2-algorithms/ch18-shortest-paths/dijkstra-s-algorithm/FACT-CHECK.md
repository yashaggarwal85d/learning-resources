# Fact-check — Dijkstra's algorithm

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Dijkstra's algorithm settles the closest unsettled vertex via a priority queue, relaxing its outgoing edges, repeating until the queue is empty. | Confirmed | This topic's own stated mechanism; `examples.py` (`dijkstra`), matching `brute_force_shortest_paths` exactly on `WEIGHTED_ADJ`. |
| 2 | A single negative-weight edge can make the algorithm settle a vertex at an incorrect distance before a later, shorter route through that edge is considered. | Confirmed, directly reproduced | Wikipedia "Dijkstra's algorithm", quoted (exact 3-node counterexample: s→a weight 2, s→b weight 5, b→a weight −10); `examples.py` (`dijkstra` on `NEGATIVE_COUNTEREXAMPLE_ADJ` settles vertex 1 at 2, while the true shortest path costs −5). |
| 3 | Dijkstra's algorithm requires non-negative edge weights in general. | Confirmed | Wikipedia "Shortest path problem", quoted. |
| 4 | With a binary heap, the algorithm runs in O((\|E\|+\|V\|)log\|V\|) worst case, simplified to O(\|E\|log\|V\|) for connected graphs. | Confirmed | Wikipedia "Dijkstra's algorithm", quoted. |
| 5 | A lazy-insertion variant (push new entries as discovered rather than decrease-key) preserves the same worst-case bound while keeping a smaller queue in practice. | Confirmed | Same source, quoted. |
| 6 | Lazy deletion does strictly more total priority-queue work than decrease-key on the same graph, because of entries that go stale and must be discarded. | Confirmed, directly reproduced | `examples.py`: `dijkstra_lazy` and `dijkstra_decrease_key` reach identical final distances on `WEIGHTED_ADJ`; `lazy_stale_pops > 0` and `lazy_pushes + lazy_stale_pops > decrease_key_ops`, asserted and passing. |

## Currency check

Dijkstra's algorithm (1959) is a long-settled, textbook-standard result; the non-negative-weight restriction, the complexity bound, and the lazy-deletion-vs-decrease-key contrast are likewise settled, decades-old material. No recent revision is expected for any claim here.

## Red team

1. **Does the negative-edge counterexample genuinely reproduce Dijkstra's documented failure, or could an unguarded relaxation silently "fix" the wrong answer?** The first implementation of `dijkstra` relaxed edges into already-visited vertices without a guard, which silently corrected the distance to the true answer (−5) instead of reproducing the documented wrong one (2) — caught by the assertion failing, fixed by adding `if visited[v]: continue` before relaxing, matching the standard algorithm's own settled-vertex invariant. The corrected version now reproduces the exact documented failure.
2. **Is the lazy-deletion-vs-decrease-key comparison demonstrating a real divergence, or could `lazy_pushes >= decrease_key_ops` hold only because both happen to tie?** An earlier, weaker assertion (`lazy_pushes >= decrease_key_ops`) held trivially at 6 == 6 on this graph, demonstrating nothing. Replaced with `lazy_stale_pops > 0` and `lazy_pushes + lazy_stale_pops > decrease_key_ops`, which only holds when lazy deletion's extra bookkeeping (pushes plus the stale pops it later discards) genuinely exceeds decrease-key's clean operation count — confirmed passing (6 pushes + 2 stale pops = 8, against decrease-key's 6 operations).
3. **Is the main graph (`WEIGHTED_ADJ`) rich enough to need Dijkstra's priority-queue ordering, or would a simpler fixed-order relaxation have given the same answer?** The graph has two distinct paths to vertex 1 (direct, weight 4; via vertex 2, weight 1+2=3) and two to vertex 3 (via 1, weight 3+1=4; via 2, weight 1+5=6) — a fixed visitation order that processed vertex 1 before vertex 2 would commit to a worse distance for vertex 1 unless revisited, so the priority-queue's closest-first order is actually exercised, not vacuously satisfied.
4. **Does the counterexample's failure depend on which vertex gets popped first among ties, making it fragile to implementation details?** No tie exists in the counterexample: vertex a's direct distance (2) is strictly less than vertex b's (5), so a is popped and settled first under any correct priority-queue implementation, not merely this one's particular tie-breaking.

## Corrections applied

Two implementation bugs were found and fixed during fact-checking, both in `examples.py`, not in any claim: the missing `visited[v]` guard in `dijkstra` (see red team #1) and the too-weak lazy-deletion assertion (see red team #2). No claim in the chapter plan's own scope was found incorrect against the fetched sources.
