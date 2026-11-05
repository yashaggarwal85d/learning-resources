---
id: dsa.breadth-first-search
title: Breadth-first search
---

<section data-section="outcomes">

## After this topic you can

- Implement BFS with a FIFO queue and parent pointers, and prove it finds unweighted shortest paths.
- Run multi-source BFS and 0-1 BFS with a deque, and say when each is the right tool over plain BFS or Dijkstra.
- 2-colour a graph by BFS to test bipartiteness, and produce a witnessing odd cycle when it fails.

</section>

<section data-section="internals">

## Into the internals

### Why the frontier's own order proves the shortest-path guarantee

A FIFO queue enforces one invariant across the whole run: every vertex at distance d is dequeued, and every one of its neighbours enqueued, strictly before any vertex at distance d+1 is dequeued. That ordering alone is the proof — a vertex first reached at distance d cannot later be reached by a shorter path, because every vertex at a smaller distance was already fully processed before this one was even enqueued. Nothing about the graph's shape matters; the guarantee comes entirely from the container's own discipline, which is why swapping the FIFO queue for a LIFO stack (depth-first search) breaks the guarantee immediately — a stack's own order has no relationship to distance at all.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs BFS on a constructed 8-vertex graph with several paths of different lengths between two vertices and confirms the shortest one is found, with parent pointers reconstructing it. Multi-source BFS runs on a 20-by-20 grid with three simultaneous sources and is checked, cell by cell, against the minimum of three separate single-source runs — identical distances, with the single-source total costing almost exactly three times the edge examinations of the one multi-source pass. 0-1 BFS runs against plain Dijkstra on sixty vertices with randomly 0/1-weighted edges and the two agree exactly. A 5-cycle and a 6-cycle are 2-coloured by BFS: the 5-cycle fails and returns a genuine witnessing edge where both endpoints land the same colour; the 6-cycle succeeds and colours every edge properly. Finally, a simplified top-down/bottom-up toggle, built to show the shape of direction-optimizing BFS's own saving (not its tuned heuristic or its parallel implementation), measures a sizeable reduction in edges examined on a synthetic low-diameter graph once the frontier crosses a size threshold.

</section>

<section data-section="production">

## In production

Real graph-processing systems at scale (social-network analysis, recommendation pipelines) run BFS or BFS-like traversals on graphs with billions of edges, where the difference between examining every edge in the frontier and examining only a handful per unvisited vertex is the difference between a query that finishes and one that does not. The 0-1 BFS deque trick generalises to k-weight graphs with a bucket queue of k+1 buckets rather than a plain two-ended deque — the same frontier idea, more buckets.

</section>

<section data-section="frontier">

## The frontier

BFS's own history is older than its usual attribution: Konrad Zuse described it (for finding connected components) in his 1945 doctoral thesis, rejected and unpublished until 1972; it was independently reinvented by Edward F. Moore in 1959 to find the shortest way out of a maze, and developed by C. Y. Lee into a wire-routing algorithm published in 1961. Direction-optimizing BFS's bottom-up step needs the graph's inverse when the input is directed, since "does any neighbour of mine belong to the frontier" is a query over incoming edges. Two syllabus topics skipped from this chapter sit near BFS's own territory without being built here: lowest common ancestor (binary lifting, Euler tour plus range-minimum queries) is a query over a rooted BFS or DFS tree, the natural next step once a traversal tree exists; a reader curious about it should start from this topic's own BFS tree and parent pointers.

</section>

<section data-section="questions">

## More questions

- 0-1 BFS uses a deque because every edge weighs 0 or 1. What happens to the trick if edges can weigh 0, 1 or 2 — does a deque still work, or is a different container needed?
- The bipartiteness witness returned here is one odd cycle, not necessarily the shortest one. Is there a cheap way to find the shortest odd cycle through a given edge, using only what BFS already computes?

</section>

<section data-section="next">

## Where this goes next

A breadth-first frontier answers one question well: the fewest edges to reach a vertex. It says nothing about which vertex to visit next when the graph has structure a single widening ring can't see — a dependency that must come before another, a group of vertices that can all reach each other and nothing outside the group. Those answers come from visiting as deep as possible before backtracking, not level by level. Depth-first search and edge classification, next.

</section>
