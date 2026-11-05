# Outline: Local search and metaheuristics

## Storyboard (10 steps)

1. **Opening.** Every guarantee so far in this chapter was proved. This topic is about the other kind of answer: the things with no guarantee at all, placed after the things with one, on purpose.
2. **The problem and the number.** A query joins twelve tables. The number of left-deep join orders alone is twelve factorial, four hundred seventy-nine million and change (computed in examples.py). Bushy trees are far more. No exhaustive search finishes this in reasonable time.
3. **Local search defined, on the traveling salesman problem.** A tour, a neighborhood of one small change away, a move to a better neighbor, repeated until none exists: a local optimum. 2-opt's move: remove two edges, reconnect the other way, reversing one segment — the move that uncrosses a crossing tour.
4. **2-opt's own limit, measured.** A twelve-point instance (four loose clusters), its true optimum found by exhaustive dynamic programming. Over a hundred random starting tours, 2-opt reaches the true optimum less than half the time; it always stops, but never guarantees where.
5. **Predict: does giving up and restarting fix it?** Before showing simulated annealing's own numbers, ask whether letting the search occasionally accept a worse move could actually help escape this.
6. **Simulated annealing.** Occasionally accept a worse move, with a probability that falls as a temperature is lowered (Kirkpatrick, Gelatt and Vecchi's own formula). On the identical instance, annealing reaches the true optimum far more often than plain 2-opt — but the topic measures this, it does not assume it.
7. **Genetic search, and a surprise.** A population of tours, selection by fitness, crossover, mutation. On this same instance, with these particular settings, the genetic algorithm actually does worse than plain 2-opt — not because genetic algorithms are bad, but because none of these searches comes with a universal ranking.
8. **PostgreSQL's GEQO, read from its own documentation.** Below `geqo_threshold` (default twelve), PostgreSQL searches every join order exhaustively. At or above it, it hands the problem to a genetic algorithm that treats join order exactly like a traveling-salesman tour — encoding a join tree as an integer string, crossing over two such strings, deprecating mutation outright so no repair step is ever needed.
9. **The honest caveat, in the documentation's own words.** PostgreSQL's own page admits the fit is imperfect: a TSP substring's cost doesn't depend on the rest of the tour, but a join order's cost does. The engineering call: give up the guarantee when the exhaustive search costs more than the risk of a worse plan, and say so.
10. **Recap and handoff.** Every algorithm in this topic can get stuck, and none of them says where. That absence of a promise is itself the lesson. Next: a kind of problem where even the input itself is not entirely known in advance — online paging.

## Learning outcomes

- Run 2-opt by hand on a small tour and say why it stops, and what it does and does not guarantee.
- Describe simulated annealing and a genetic algorithm as each changing one thing about plain local search, and say what each gives up.
- State when giving up a worst-case guarantee is the right engineering call, and read PostgreSQL's `geqo_threshold` documentation as a real instance of that call.

## Concept ledger

- **Introduces:** `local-search`, `neighborhood-and-local-optimum`, `two-opt`, `simulated-annealing`, `genetic-algorithm`, `metaheuristic`, `heuristic-without-guarantee`, `traveling-salesman-problem`.
- **Uses:** `np-hard-np-complete` (Chapter 33, declared), `approximation-ratio`, `lower-bound-on-opt` (topic 109: what a guarantee is, and so what is being given up).
- **Declared:** `traveling-salesman-problem` is introduced here (no earlier live DSA topic has it); `np-hard-np-complete` declared since Chapter 33 is not live.

## Bridge and handoff

- **Bridge:** "First-Fit Decreasing and Longest-Processing-Time-first are each a few lines and each carries a proof. Most problems do not have one, and many of the ones that matter most are searches over a space too large to enumerate, where the best known approach is to start somewhere reasonable and keep improving it until nothing nearby is better. That gives up the guarantee entirely, and the honest question is when giving it up is the right call. Local search and metaheuristics, next."
- **Handoff:** "Everything in this chapter so far assumed the whole input was in front of the algorithm. Some decisions do not get that luxury: a cache has to evict a page now, before it knows which pages will be asked for next, and the choice cannot be taken back. Online paging, next."

## Changes from the chapter plan

- The chapter plan calls for reading primary papers for Croes (1958), Flood (1956), Kirkpatrick–Gelatt–Vecchi (1983), and Černý (1985) directly. Those papers were not independently fetched; every attribution and date in this topic is instead taken word for word from the Wikipedia pages for 2-opt and Simulated annealing, which themselves cite and quote those papers, and the topic does not state a claim beyond what those pages say.
- The chapter plan calls for a k-opt generalization and a Lin–Kernighan discussion; neither is built as a separate step. 2-opt alone, measured honestly against the true optimum, carries the topic's point about local search's missing guarantee; k-opt and Lin–Kernighan are named once in post-notes as the family this topic does not develop.
- The chapter plan's example uses "12 random points" uniformly distributed; this build uses twelve points in four loose clusters instead, because uniform random points in a small square gave 2-opt a near-100% success rate at finding the true optimum on repeated trials, which does not demonstrate the chapter's point. The clustered instance (examples.py, seed 3) gives 2-opt a measured 45% success rate, a genuine spread worth showing.
- The genetic algorithm built for this topic is the builder's own simple order-crossover implementation on the TSP instance, not a reproduction of PostgreSQL's GEQO itself (GEQO runs on query-plan trees, not TSP tours, and its own documentation says the analogy is imperfect). The topic states this distinction directly, and does not claim the measured genetic-algorithm numbers describe GEQO's own behavior.
- DPccp, the dynamic program PostgreSQL uses below `geqo_threshold`, is named once in post-notes, not built or taught.
