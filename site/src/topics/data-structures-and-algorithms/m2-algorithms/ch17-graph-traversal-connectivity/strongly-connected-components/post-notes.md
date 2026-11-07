---
id: dsa.strongly-connected-components
title: Strongly connected components
---

<section data-section="outcomes">

## After this topic you can

- Implement Tarjan's single-pass low-link SCC algorithm and Kosaraju's two-pass algorithm, and state what each costs over the other.
- Build the condensation DAG of a graph's SCCs and confirm directly that it has no cycle.
- Reduce a small 2-SAT instance to an implication graph and decide satisfiability by its SCCs.

</section>

<section data-section="internals">

## Into the internals

### Why the condensation is always a DAG

Strongly connected components are, by definition, maximal sets of mutually reachable vertices: no SCC can be enlarged while staying mutually reachable. If the condensation graph (one vertex per SCC) had a cycle, then every SCC on that cycle could reach every other SCC on it, both forward and backward along the cycle — which would make all of them mutually reachable with each other, and therefore part of one larger SCC all along. That contradicts each one being maximal on its own. So a cycle in the condensation is impossible, for any directed graph, not only the one built in this topic's own example.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs Tarjan's algorithm and Kosaraju's algorithm on the identical six-vertex graph (a 3-cycle, a 2-cycle reachable from it, and a singleton reachable from that) and confirms both return the exact same partition into three components. The condensation graph is built directly from that partition and checked for a cycle using the identical directed-cycle test from topic 60 — confirmed acyclic, not merely asserted. A small satisfiable 2-SAT instance and a small unsatisfiable one are each reduced to an implication graph, run through Tarjan's algorithm, and checked against the shared-SCC test for every variable.

</section>

<section data-section="production">

## In production

Finding SCCs at scale is the first step in several real pipelines: dead-code and unreachable-state elimination in compilers (an SCC with no path to the program's entry point can be dropped entirely), detecting deadlock cycles in resource-allocation graphs, and clustering web graphs or social graphs into tightly-linked communities before running anything more expensive on each piece separately.

</section>

<section data-section="frontier">

## The frontier

Articulation points, bridges and biconnectivity, a skipped syllabus topic from this chapter, extend the low-link idea this topic builds to undirected graphs — finding single points of failure in a network rather than mutually-reachable groups. Lowest common ancestor, also skipped, is a rooted-tree query over the same depth-first search tree topic 59's and 60's traversals build, unrelated to SCCs specifically but sharing their DFS foundation.

</section>

<section data-section="questions">

## More questions

- Tarjan's algorithm pops a component the moment a vertex's low-link equals its own discovery index. What would go wrong if the algorithm instead checked this condition before finishing all of that vertex's neighbours, rather than after?
- The 2-SAT reduction only decides satisfiability. What additional step, built on the same SCCs, recovers an actual satisfying assignment when one exists?

</section>

<section data-section="next">

## Where this goes next

Finding one key, one boundary, one order statistic was Chapter 16's business. This chapter answered a different kind of question about a graph with no weights at all: which vertices are reachable, in what order, and which groups of vertices can all reach each other. Every answer cost exactly one traversal, because every edge counted for one step and no more. The next chapter puts a cost on each edge and asks a question neither breadth-first nor depth-first search can answer on its own: not merely a path, but the cheapest one. Dijkstra's algorithm, next.

</section>
