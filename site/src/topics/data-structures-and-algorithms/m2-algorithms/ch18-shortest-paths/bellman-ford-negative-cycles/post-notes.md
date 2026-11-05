---
id: dsa.bellman-ford-negative-cycles
title: Bellman-Ford and negative cycles
---

<section data-section="outcomes">

## After this topic you can

- Run Bellman-Ford on a graph with a negative edge but no negative cycle, and confirm the distances stabilise within the guaranteed number of rounds.
- Detect a negative cycle from a currency-arbitrage-shaped graph and extract the actual cycle of edges that proves it.
- Measure SPFA's relaxation count against plain Bellman-Ford's on both a favourable graph and an adversarial one built to hit SPFA's own worst case.

</section>

<section data-section="internals">

## Into the internals

### Why a |V|-th improving round proves a negative cycle

Every simple path in a graph has at most |V| − 1 edges, so after |V| − 1 rounds of relaxing every edge, every shortest path that exists as a simple path has already been found — no further round can improve anything along it. If one more full round still finds an edge that would improve some vertex's distance, that improvement cannot be explained by any simple path, since none remain to discover. The only structure left that could still be paying off is a cycle, and only a negative-weight one keeps paying off indefinitely. That is the entire proof, and it is why Bellman-Ford's negative-cycle check costs exactly one extra round, not a new algorithm.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs Bellman-Ford on a five-vertex chain built so the worst possible relaxation order forces every one of the guaranteed rounds to be used before the distances stabilise, confirming the bound is tight. It then builds a three-currency arbitrage graph (USD, EUR, GBP) by weighting each edge with the negative logarithm of its exchange rate, confirms the round-trip rate exceeds one (a genuine profitable loop), and confirms Bellman-Ford detects it as a negative cycle and extracts the exact cycle of currencies by following predecessor pointers. Finally it compares plain Bellman-Ford against the queue-driven SPFA variant on a favourable graph (SPFA uses noticeably fewer relaxations) and on a constructed adversarial chain of "diamonds," where SPFA's own relaxation count grows past plain Bellman-Ford's.

</section>

<section data-section="production">

## In production

Negative-cycle detection via Bellman-Ford underlies real currency and commodity arbitrage detection, cycle-cancelling techniques in network flow optimisation, and any system that needs a structural guarantee — not just a best-effort check — that no sequence of operations can keep improving forever.

</section>

<section data-section="frontier">

## The frontier

The all-pairs version of this chapter's question — every vertex's distance to every other, all at once — is next: running Bellman-Ford or Dijkstra from every single vertex would work, but a graph with negative edges would need Bellman-Ford's own slower rounds run once per vertex. Floyd-Warshall and Johnson's algorithm answer this without paying that cost from scratch.

</section>

<section data-section="questions">

## More questions

- The arbitrage graph in this topic has exactly one profitable cycle. Would a graph with several unrelated profitable cycles change how the predecessor-trail-following extraction behaves?
- SPFA's adversarial construction compounds a correction at every stage. What property of a graph makes that compounding impossible, guaranteeing SPFA's favourable case instead?

</section>

<section data-section="next">

## Where this goes next

Bellman-Ford answers the single-source question for any graph with a well-defined answer at all, negative edges included. The all-pairs version of the same question — every vertex's distance to every other, all at once — could run either algorithm from every single source in turn, but a graph with negative edges would need Bellman-Ford's own slower rounds run once per vertex. There is a way to pay that cost only once. Floyd-Warshall and Johnson's algorithm, next.

</section>
