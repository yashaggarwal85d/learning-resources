# Outline — Bellman-Ford and negative cycles

## Learning outcomes

- Run Bellman-Ford on a graph with a negative edge but no negative cycle, and confirm the distances stabilise within the guaranteed number of rounds.
- Detect a negative cycle from a currency-arbitrage-shaped graph and extract the actual cycle of edges that proves it.
- Measure SPFA's relaxation count against plain Bellman-Ford's on both a favourable graph and an adversarial one built to hit SPFA's own worst case.

## Reel steps (storyboard)

1. **Opening.** A loop of three currency conversions that pays for itself and more. Hook: a real possibility for a few seconds on a real exchange, exactly what a negative cycle means.
2. **PredictNegativeCycle.** Does one more clean round of relaxation prove no negative cycle exists? Answer: yes — a negative cycle always finds one more improving edge.
3. **RelaxationMechanism.** Relax every edge, every round, repeated a number of times tied to the vertex count minus one. Takeaway: relaxing every edge replaces Dijkstra's priority queue.
4. **WorstOrderTightness.** A chain built so the bound is needed in full, not just sufficient. Takeaway: the bound is exactly tight on some graph.
5. **ArbitrageDetection.** The currency loop as a negative-log-weighted graph, detected and traced back. Takeaway: the negative logarithm is what makes the question answerable at all.
6. **SPFAPredict.** Second predict: does the queue-driven variant ever cost as much as plain Bellman-Ford in the worst case? Answer: no difference in worst case — demonstrated by an adversarial construction where it costs strictly more on this instance.
7. **Recap.** Handoff to Floyd-Warshall and Johnson's. Takeaway: relaxation is the shared mechanism; only the order and stopping rule differ.

## Engagement arc

- Hook (step 1): a currency loop that pays for itself, exactly what a negative cycle means.
- First predict (step 2, within first four steps): does a clean final round prove no negative cycle.
- Second predict (step 6): does the queue-driven variant ever match plain Bellman-Ford's worst case.
- Takeaways: steps 3, 4, 5, 7 (four).
- Recap (step 7): relaxation as the one shared mechanism, handoff to Chapter 18's all-pairs topic.

## Narrator's line of thought, by step

1. Names the problem (a profitable loop) before any algorithm, framing the whole topic around negative cycles.
2. Poses the negative-cycle predict directly, before the mechanism, so the mechanism (step 3) and proof (step 4) explain why the answer is yes.
3. Names the relax-every-edge, repeat mechanism as the single operation the whole algorithm is built from.
4. Proves the bound is tight by direct construction, not assertion.
5. Builds the currency-arbitrage worked example from the general negative-cycle mechanism already shown, demonstrating the detection-and-extraction clause directly.
6. Poses the SPFA predict, then explains the mechanism (late corrections compounding) behind the answer.
7. Closes on relaxation as the one shared idea, hands off to the all-pairs chapter topic.

## Post-notes headings

- Internals: why a |V|-th improving round proves a negative cycle.
- Lab: `examples.py`'s checks (the tight worst-order bound, the arbitrage detection and extraction, SPFA's favourable and adversarial relaxation counts).
- Production: currency/commodity arbitrage detection, cycle-cancelling in network flow optimisation.
- Frontier: handoff framing for the all-pairs question (named, not built here).
- Where this goes next: handoff to Floyd-Warshall and Johnson's algorithm.

## Examples to execute and what each asserts

- `bellman_ford(WORST_ORDER_ADJ, 5, 0)` matches `brute_force_shortest_paths` exactly, and needs all 4 permitted rounds to stabilise (`worst_rounds == WORST_ORDER_N - 1`).
- `bellman_ford_with_predecessors` on `ARBITRAGE_ADJ` (USD/EUR/GBP, edge weights = negative log of exchange rate) detects a negative cycle (`arb_cycle_vertex is not None`) whose round-trip rate is confirmed `> 1.0`; `extract_cycle` recovers all three currencies.
- `spfa` vs. `bellman_ford_count_relaxations` on `STAR_ADJ`: SPFA does strictly fewer relaxations (the favourable case).
- The same comparison on `build_spfa_adversary`'s six-stage diamond chain: SPFA does strictly *more* relaxations than plain Bellman-Ford (`spfa_adv_relax > bf_adv_relax`), demonstrating the worst case degrading to the same bound.

## Bridge and handoff

- Bridge: topic 63's handoff, word for word.
- Handoff: to topic 65 (Floyd-Warshall and Johnson's algorithm), word for word as stated in CHAPTER.md.

## Concept ledger

- Introduces: `bellman-ford-algorithm`, `relaxation-round`, `negative-cycle-detection`, `spfa`.
- Uses: `relaxation` (topic 63, the one shared mechanism), `queue` (Chapter 2), `edge-list` (Chapter 10).
- Declared: none.

## Claims list

1. Bellman-Ford relaxes every edge, repeated |V|−1 times, in contrast to Dijkstra's priority-queue selection — Wikipedia "Bellman–Ford algorithm", quoted; `examples.py` (`bellman_ford`).
2. Since the longest simple path has at most |V|−1 edges, that many rounds suffice; a |V|-th round that still improves something implies a negative cycle — same source, quoted; `examples.py` (`WORST_ORDER_ADJ` needing all 4 rounds; general detection logic in `bellman_ford`/`bellman_ford_with_predecessors`).
3. A negative cycle means there is no cheapest path, since a walk around it can always be repeated for more profit; Bellman-Ford can detect and report one — same source, quoted; `examples.py` (`ARBITRAGE_ADJ`).
4. Extracting the actual cycle requires following predecessor pointers backward until a vertex repeats, since the flagged vertex need not itself be on the cycle — same source, quoted; `examples.py` (`extract_cycle`).
5. The Moore/SPFA variant re-relaxes only a vertex whose distance has just changed, retaining the same O(|V|·|E|) worst-case bound as plain Bellman-Ford — same source, quoted; `examples.py` (`spfa` vs. `bellman_ford_count_relaxations` on both `STAR_ADJ` and the adversarial diamond chain).
6. Dijkstra's algorithm requires non-negative weights, which Bellman-Ford does not — Wikipedia "Shortest path problem", quoted (restated from topic 63 for contrast).

## Changes from the chapter plan

CHAPTER.md's suggested primary sources (Bellman 1958, Ford's 1956 RAND report) are paywalled/not freely fetchable; Wikipedia's "Bellman–Ford algorithm" article quotes both papers' own citations directly and covers every scope clause (the |V|−1 bound, negative-cycle detection, the Moore/SPFA variant) with verifiable quotes, so it was used as the primary source instead, consistent with topic 63's own handling of its suggested-but-unfetchable sources. No Wikipedia or other freely-fetchable source was found connecting currency arbitrage specifically to Bellman-Ford's graph algorithm (checked "Bellman–Ford algorithm", "Arbitrage", and "Triangular arbitrage"); the currency-arbitrage framing is this topic's own worked example, built directly from the general negative-cycle mechanism the primary source documents, per CHAPTER.md's own instruction to build it as a worked example.
