---
id: dsa.prim-s-algorithm
title: Prim's algorithm
---

<section data-section="outcomes">

## After this topic you can

- Run Prim's algorithm by hand with a heap, show the heap's own contents at each step, and
  justify each edge by the cut property.
- State the array version's and the heap version's costs and the density at which the choice
  flips, and check the flip against a measurement.
- Pick between Kruskal and Prim for a given graph, by density, by whether edges arrive
  sorted or streamed, and by memory layout, and say why.

</section>

<section data-section="internals">

## Into the internals

### Why lazy and eager cost different amounts for the identical answer

Both versions of Prim's algorithm compute the identical tree; they differ only in how much
work the priority queue does to get there. The lazy version pushes an entry for every edge
leaving a newly added vertex, including edges to vertices already in the tree, and discards
those stale entries only when it pops them. The eager version checks first, so it only ever
holds one entry per outside vertex: the cheapest edge into the tree seen so far, updated by a
decrease-key when a better edge turns up. On this topic's own ten-edge graph the difference is
small; on a graph with far more edges per vertex, the lazy version's queue can grow to hold
every edge ever pushed, while the eager version's queue never exceeds one entry per vertex.

### Why the array version's cost never depends on the edge count

The array version scans every vertex not yet in the tree, once per vertex added, regardless of
how many edges connect them. Adding more edges to the same six vertices changes which keys get
updated during each scan, but never changes how many cells get scanned. That is exactly why its
cost is Θ(n²): fixed by the vertex count alone, which is also why it is the right implementation
once the edge count gets large enough that counting edges, not vertices, becomes the expensive
thing to do.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs lazy Prim, eager Prim, and the array version on the chapter's own graph from
A, confirming the identical tree (weight eleven, the same edges Kruskal's own run keeps) and the
identical order of vertices added (A, C, D, E, B, F) under all three implementations. It confirms
the array version's own cost (twenty-one comparisons) is fixed by the vertex count, verified
again at two different edge counts on a two-hundred-vertex random graph. It then derives the
array-against-heap crossover (roughly n squared over log base two of n) and measures it directly
by sweeping the edge count on random graphs until a heap-cost proxy first exceeds the array's own
fixed cost, landing in the same broad range as the derived ratio predicts.

</section>

<section data-section="production">

## In production

NetworkX's own documentation lists `'prim'` alongside `'kruskal'` and `'boruvka'` as a shipped,
selectable algorithm for `minimum_spanning_tree`. Neither claim is extended beyond what the
page's own current text states.

</section>

<section data-section="frontier">

## The frontier

The Fibonacci-heap bound of O(m + n log n) (Fredman and Tarjan, 1987) is named only; this topic
builds and measures only the binary-heap versions. Borůvka's algorithm, the randomized
linear-time Karger–Klein–Tarjan algorithm, Chazelle's inverse-Ackermann-type algorithm, and
Pettie and Ramachandran's optimal algorithm are named only, per `CHAPTER.md`'s own instruction,
and built in neither this topic nor the last; a reader curious about them starts from the
citations in `references.md`. Jarník's own priority over Prim (a letter to Borůvka, published
the following year) is named per Erickson's own account; the exact year of Jarník's paper is not
independently verified this session.

</section>

<section data-section="questions">

## More questions

- The array version's cost is fixed at Θ(n²) by the vertex count alone. At what edge count does
  that stop being wasteful and start being the cheaper choice, and does that threshold change if
  the graph is not just dense but complete?
- Prim and Dijkstra are "the identical loop with a different key." What exactly breaks if Prim's
  own key (an edge's own weight) is swapped for Dijkstra's key (the path length so far), and
  nothing else about the loop changes?

</section>

<section data-section="next">

## Where this goes next

A minimum spanning tree was certified by one lemma about cuts: look at any cut, and the
lightest edge crossing it is safe. The next chapter keeps the cuts and changes what the edges
mean. Now an edge is a pipe with a capacity, a cut is a bottleneck whose size is the capacity
crossing it, and the question is how much can flow from a source to a sink. The answer is again
a theorem about cuts, and the algorithm that reaches it has to keep a second, undo-shaped copy
of the graph. Max-flow min-cut, next.

</section>
