---
id: dsa.depth-first-search-edge
title: Depth-first search and edge classification
---

<section data-section="outcomes">

## After this topic you can

- Compute discovery/finish times for a DFS and classify every edge as tree, back, forward or cross from them alone.
- Detect a cycle in a directed graph by three-colouring and in an undirected graph by a parent check, and explain why the two tests differ.
- Convert a recursive DFS to an explicit-stack iterative one, and reproduce the recursion-depth failure the conversion fixes.

</section>

<section data-section="internals">

## Into the internals

### Why forward and cross edges can't exist in an undirected graph

A non-tree edge in a directed DFS can point to an ancestor (back), an already-finished descendant (forward), or an unrelated vertex (cross). In an undirected graph, every edge is traversed from both endpoints eventually, so a non-tree edge discovered from one side was already available as a tree-edge candidate from the other side the first time either endpoint was visited — which forces it to be a back edge (to an ancestor still on the stack) rather than a forward edge (to an already-finished descendant, which would have had to use this same edge to finish in the first place) or a cross edge (to an unrelated subtree, which an undirected graph's single shared edge list rules out). This is exactly why the chapter's shared notation states it once and every later topic (strongly connected components, in particular) treats forward/cross edges as directed-graph-only concepts.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds a 5-vertex directed graph with a tree edge, a back edge that closes a real cycle, and a cross edge, computes discovery/finish times, and confirms the parenthesis property holds for every pair of vertices directly (not merely asserted from the theorem). A second small graph is built specifically to contain a forward edge, since the first graph has none. An undirected graph is run through the same DFS and its edge types are confirmed to be only tree and back, never forward or cross. Both cycle tests (three-colour for directed, parent-check for undirected) are run on a cyclic and an acyclic instance each. Finally, a recursive DFS on a 50,000-vertex chain is run with Python's recursion limit lowered to a realistic 1,000, reproducing a genuine `RecursionError`, and the identical input is then run through the iterative, explicit-stack version, which completes and visits every vertex.

</section>

<section data-section="production">

## In production

The explicit-stack conversion this topic builds generalises beyond DFS to any recursive tree or graph algorithm whose call depth can exceed a language's own recursion limit — a parser walking a deeply nested expression, a recursive descent into a deeply nested JSON document, or any other algorithm shaped like "visit a node, then recurse into its children" hits the identical failure and the identical fix.

</section>

<section data-section="frontier">

## The frontier

Eulerian paths and circuits, a skipped syllabus topic from this chapter, sit near DFS's own territory: Hierholzer's algorithm for finding an Eulerian circuit is itself a DFS-like traversal with a specific edge-reuse rule, and it is the natural next read for someone who has just built edge classification here. Articulation points and bridges (also skipped) extend the low-link idea topic 62 builds for strongly connected components to undirected graphs, finding single points of failure rather than mutually-reachable groups.

</section>

<section data-section="questions">

## More questions

- The parenthesis property says two vertices' discovery/finish intervals are never partially overlapping. What would it mean, structurally, for two vertices to have partially overlapping intervals — can you construct a traversal order where that happens?
- This topic's cycle detection finds that a cycle exists. Extending it to report the actual cycle (the sequence of vertices) needs one more piece of bookkeeping — what is it?

</section>

<section data-section="next">

## Where this goes next

A directed graph with no back edges — no cycle anywhere — has a DFS finish order that is itself a valid answer to a question BFS was never asked: in what order can every vertex be processed so that nothing is processed before the things it depends on. That order falls out of the traversal just built, almost for free. Topological sort, next.

</section>
