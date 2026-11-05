# Outline — Dijkstra's algorithm

## Learning outcomes

- Run Dijkstra's algorithm on a weighted graph and confirm its settled distances match a brute-force shortest-path computation.
- Construct a graph where a negative edge breaks Dijkstra's own guarantee, and explain why.
- Compare lazy deletion against decrease-key on the same graph, and state the trade-off between them.

## Reel steps (storyboard)

1. **Opening.** A weighted road-network-shaped graph, more than one path between some pairs. Hook: fastest way from one city to every other, without reconsidering a city once settled, as long as no road ever shortens a trip.
2. **PredictNegative.** A graph with one negative edge, asking whether the algorithm still finds correct distances. Answer: no — a vertex can be settled before a later relaxation through the negative edge would have improved it.
3. **DijkstraMechanism.** The pop-settle-relax cycle on the main weighted graph, one vertex settled per round. Takeaway: settling the closest unsettled vertex first is what makes each pop final immediately.
4. **NegativeFailure.** Wikipedia's own exact counterexample graph, the vertex settled wrong. Takeaway: non-negative weights are what make settling a vertex early safe at all.
5. **LazyVsDecreaseKey.** Lazy deletion's duplicate pushes vs. decrease-key's single entry, same final distances. Second predict: which does strictly more queue work. Answer: lazy deletion, via stale pops it must later discard.
6. **Recap.** The main graph fully settled, handoff to Bellman-Ford. Takeaway: Dijkstra needs non-negative weights for the same reason it never revisits a settled vertex.

## Engagement arc

- Hook (step 1): a road network, fastest-time-to-everywhere, answered without ever reconsidering a city.
- First predict (step 2, within first four steps): does one negative edge break the algorithm.
- Second predict (step 5): does lazy deletion do strictly more queue work than decrease-key.
- Takeaways: steps 3, 4, 6 (three).
- Recap (step 6): the chapter's own closing idea (non-negative weights are the whole proof), handoff to Bellman-Ford.

## Narrator's line of thought, by step

1. Names the problem (fastest route to everywhere) and states the one condition the whole chapter will spend four topics testing.
2. Poses the negative-edge predict directly, before any mechanism is shown, so the mechanism (step 3) explains why the answer is no.
3. Names the pop-settle-relax cycle as the single mechanism the whole algorithm is built from.
4. Proves the predict's answer by direct construction on Wikipedia's own counterexample graph, not by assertion.
5. Poses the lazy-deletion-vs-decrease-key predict, then explains the mechanism (stale pops) behind the answer.
6. Closes on why the restriction is the whole proof, and hands off to the algorithm that drops it.

## Post-notes headings

- Internals: why non-negative weights are not a footnote, but the whole proof.
- Lab: `examples.py`'s checks (brute-force-confirmed distances, the reproduced counterexample, lazy-deletion vs. decrease-key's queue-work gap).
- Production: road routing, network routing protocols, logistics scheduling.
- Frontier: A* search, bidirectional search and contraction hierarchies, the frontier beyond Dijkstra's bounds — all named once.
- Where this goes next: handoff to Bellman-Ford and negative cycles.

## Examples to execute and what each asserts

- `dijkstra(WEIGHTED_ADJ, 5, 0)` matches `brute_force_shortest_paths` exactly: `[0, 3, 1, 4, 7]`.
- `dijkstra(NEGATIVE_COUNTEREXAMPLE_ADJ, 3, 0)[1] == 2`, while the true shortest path `s→b→a` costs `5 + (-10) = -5`, strictly less — the documented failure, reproduced directly.
- `dijkstra_lazy` and `dijkstra_decrease_key` on `WEIGHTED_ADJ` reach identical final distances; `lazy_stale_pops > 0` and `lazy_pushes + lazy_stale_pops > decrease_key_ops` — lazy deletion's own extra bookkeeping, demonstrated not assumed.

## Bridge and handoff

- Bridge: topic 62's handoff, word for word.
- Handoff: to topic 64 (Bellman-Ford and negative cycles), word for word as stated in CHAPTER.md.

## Concept ledger

- Introduces: `dijkstra-algorithm`, `relaxation`, `label-setting`, `lazy-deletion`, `decrease-key`.
- Uses: `breadth-first-search` (topic 59, the unweighted special case this generalises), `binary-heap`/`priority-queue` (Chapter 6), `adjacency-list` (Chapter 10).
- Declared: none.

## Claims list

1. Dijkstra's algorithm settles the closest unsettled vertex via a priority queue, repeating until the queue is empty — this topic's own stated mechanism, built directly; `examples.py` (`dijkstra`).
2. A single negative-weight edge can make the algorithm settle a vertex at an incorrect distance before a later, shorter route through that edge is ever considered — Wikipedia "Dijkstra's algorithm", quoted (the exact 3-node counterexample: s→a weight 2, s→b weight 5, b→a weight −10); `examples.py` (`dijkstra` on `NEGATIVE_COUNTEREXAMPLE_ADJ`).
3. Dijkstra's algorithm requires non-negative edge weights in general — Wikipedia "Shortest path problem", quoted.
4. With a binary heap, the algorithm runs in O((|E|+|V|)log|V|) worst case, simplified to O(|E|log|V|) for connected graphs — Wikipedia "Dijkstra's algorithm", quoted.
5. A lazy-insertion variant (push new entries rather than decrease-key) preserves the same worst-case bound while keeping a smaller queue in practice — same source, quoted; `examples.py` (`dijkstra_lazy` vs. `dijkstra_decrease_key`, confirmed via stale-pop and push counts).

## Changes from the chapter plan

The original Dijkstra (1959) paper and a CLRS-equivalent secondary source for the complexity bound and lazy-deletion/decrease-key contrast, as CHAPTER.md suggested starting from, were not fetched directly; Wikipedia's own "Dijkstra's algorithm" and "Shortest path problem" articles cover every scope clause with verbatim, verifiable quotes (the exact negative-edge counterexample, the complexity bound, and the lazy-insertion variant description), so they were used as the primary sources instead, consistent with this topic's own scope clauses being stated in terms of the same counterexample and bound Wikipedia documents directly.
