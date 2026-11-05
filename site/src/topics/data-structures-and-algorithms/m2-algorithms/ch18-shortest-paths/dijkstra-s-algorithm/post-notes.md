---
id: dsa.dijkstra-s-algorithm
title: Dijkstra's algorithm
---

<section data-section="outcomes">

## After this topic you can

- Run Dijkstra's algorithm on a weighted graph and confirm its settled distances match a brute-force shortest-path computation.
- Construct a graph where a negative edge breaks Dijkstra's own guarantee, and explain why.
- Compare lazy deletion against decrease-key on the same graph, and state the trade-off between them.

</section>

<section data-section="internals">

## Into the internals

### Why non-negative weights are not a footnote, but the whole proof

Dijkstra's algorithm settles a vertex — treats its current distance as final — the moment it is popped from the priority queue. That is only safe if no edge discovered later can ever produce a shorter path to an already-settled vertex. With every edge weight non-negative, extending a path can never make it shorter, so the closest unsettled vertex really is final the instant it is popped. A single negative edge breaks that guarantee completely: a longer-looking path that later passes through a negative edge can beat a shorter-looking one that never gets reconsidered. The restriction is not a performance tweak — it is the one fact the entire correctness argument rests on.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs Dijkstra's algorithm on a five-vertex weighted graph and confirms its distances match an independent brute-force relaxation. It then reproduces Wikipedia's own exact negative-edge counterexample (three vertices, a direct edge of weight two, and a longer-looking route through a weight-five edge followed by a weight-negative-ten edge) and confirms Dijkstra settles the wrong vertex at the wrong distance, exactly as the source describes. Finally it runs lazy deletion and decrease-key on the identical graph, confirming both reach the same final distances while lazy deletion pushes strictly more total queue entries once its stale, later-discarded pops are counted.

</section>

<section data-section="production">

## In production

Dijkstra's algorithm, or a close variant of it, runs under road-routing services (shortest drive time, not merely fewest turns), network routing protocols that pick the cheapest path by some cost metric, and any scheduling or logistics system computing the cheapest way to connect one point to many others when every connection cost is known in advance and never negative.

</section>

<section data-section="frontier">

## The frontier

A* search, a skipped syllabus topic from this chapter, is a direct generalisation of Dijkstra's algorithm: the same priority-queue mechanism, but biased by a heuristic estimate of the remaining distance to a single fixed goal, so it explores fewer vertices when a good heuristic exists. Bidirectional search and contraction hierarchies, also skipped, speed up the same point-to-point question further by searching from both ends at once or by precomputing shortcuts over the graph; the broader question of what lies beyond Dijkstra's own worst-case bounds is an open research area in its own right.

</section>

<section data-section="questions">

## More questions

- The counterexample graph has exactly one negative edge. Would adding a second, unrelated negative edge elsewhere in the graph make the failure any more or less likely?
- Lazy deletion's extra cost is bounded by how many times any single vertex's distance improves after it is first pushed. What property of a graph would make that number large?

</section>

<section data-section="next">

## Where this goes next

Dijkstra's algorithm settles the closest vertex first, and that greedy choice is only safe because no edge can ever make a path shorter by being added to it. The moment even one edge weight can be negative, that safety breaks, and the closest-first order stops being trustworthy. Handling that case — and detecting when it makes the very question unanswerable — is next. Bellman-Ford and negative cycles, next.

</section>
