# Fact-check — Bellman-Ford and negative cycles

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Bellman-Ford relaxes every edge, repeated |V|−1 times, in contrast to Dijkstra's priority-queue selection. | Confirmed | Wikipedia "Bellman–Ford algorithm", quoted; `examples.py` (`bellman_ford`), matching `brute_force_shortest_paths` exactly. |
| 2 | Since the longest simple path has at most |V|−1 edges, that many relaxation rounds suffice; a |V|-th round that still improves something implies a negative cycle. | Confirmed, directly reproduced | Same source, quoted; `examples.py` (`WORST_ORDER_ADJ`, a chain needing exactly all 4 of its 4 permitted rounds — the bound shown tight, not merely sufficient). |
| 3 | A negative cycle means there is no cheapest path, since a walk around it can always be repeated for more profit; Bellman-Ford can detect and report one. | Confirmed, directly reproduced | Same source, quoted; `examples.py` (`ARBITRAGE_ADJ`, a genuine profitable round trip with rate product 1.0139, detected as a negative cycle by `bellman_ford_with_predecessors`). |
| 4 | Extracting the actual cycle requires following predecessor pointers backward until a vertex repeats, since the flagged vertex need not itself be on the cycle. | Confirmed, directly reproduced | Same source, quoted; `examples.py` (`extract_cycle`, recovering all three currencies from the arbitrage graph). |
| 5 | The Moore/SPFA variant re-relaxes only a vertex whose distance has just changed, retaining the same O(\|V\|·\|E\|) worst-case bound as plain Bellman-Ford. | Confirmed, directly reproduced | Same source, quoted; `examples.py` (`spfa` beats plain Bellman-Ford on `STAR_ADJ`, but is beaten by it on the constructed adversarial diamond chain — `spfa_adv_relax > bf_adv_relax`). |
| 6 | Dijkstra's algorithm requires non-negative weights, which Bellman-Ford does not. | Confirmed | Wikipedia "Shortest path problem", quoted (restated from topic 63 for contrast). |

## Currency check

Bellman-Ford (1958), Ford's independent 1956 report, and Moore's 1959 variant (later popularised in China as SPFA by Duan, 1994) are long-settled, textbook-standard results. No recent revision is expected for any claim here.

## Red team

1. **Does the "worst order" chain genuinely need all |V|−1 rounds, or could a different (non-adversarial) edge-processing order have converged faster on the identical graph?** Yes, by construction: the Wikipedia article's own figure caption states the identical graph converges in a single round under the best edge order. `WORST_ORDER_ADJ`'s dict key order (3, 2, 1, 0, 4) was chosen specifically so the edge list visits each edge one step "ahead of" the vertex that can use it that round — verified computationally (`worst_rounds == WORST_ORDER_N - 1 == 4`), not assumed.
2. **Is the currency-arbitrage graph a genuine arbitrage opportunity, or a contrived instance where the "profit" is an artifact of the specific rates chosen?** `round_trip_rate = 0.90 * 0.86 * 1.31 = 1.0139`, confirmed `> 1.0` by direct computation — multiplying the three quoted exchange rates genuinely returns more than one unit of currency per round trip, a real (if small) arbitrage condition, not a rounding artifact.
3. **Does `extract_cycle` correctly find the cycle, or could it return a path that merely passes through the cycle without being the cycle itself?** The function walks predecessors until a vertex repeats, which — per the source's own stated caveat, quoted in `SOURCES.md` — is necessary precisely because the initially flagged vertex need not be on the cycle itself. The test confirms the extracted set is exactly `{USD, EUR, GBP}`, the full three-vertex cycle, not a subset or a vertex outside it.
4. **Is the SPFA adversarial construction a genuine worst-case demonstration, or does its relaxation count exceed Bellman-Ford's only because the graph has more total edges?** Both algorithms run on the identical graph (`adversary_adj`), so the edge count is held constant between them; the comparison (`spfa_adv_relax > bf_adv_relax`, 63 vs. 36 relaxations on six stages) isolates the algorithmic difference, not a graph-size difference. The same graph's final distances are confirmed identical between both algorithms and brute-force relaxation, so the extra SPFA work is pure overhead, not a correctness difference.
5. **Is the star-graph "favourable case" comparison fair, or does it use a different graph entirely from the adversarial one, making the two incomparable?** They are deliberately different graphs (that is the point — one graph favours SPFA's skip-if-unchanged heuristic, the other defeats it), and each comparison is self-contained (both algorithms run on the same graph within each test), so no cross-graph confusion affects either individual result.

## Corrections applied

An early version of the SPFA-worst-case construction used a dense forward DAG (all i<j edges, uniform weight), which turned out to give SPFA exactly half of Bellman-Ford's relaxation count regardless of density — the same ratio as the favourable star-graph case, demonstrating nothing. Replaced with the "diamond chain" construction (`build_spfa_adversary`), engineered so each stage's correction arrives after that vertex's children are already relaxed with a wrong value, which was verified computationally to make SPFA's relaxation count exceed Bellman-Ford's outright at six stages. No claim itself was found incorrect against the fetched sources.
