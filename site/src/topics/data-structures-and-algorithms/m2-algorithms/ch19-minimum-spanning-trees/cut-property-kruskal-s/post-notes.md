---
id: dsa.cut-property-kruskal-s
title: Cut property and Kruskal's algorithm
---

<section data-section="outcomes">

## After this topic you can

- State and prove the cut property and the cycle property by an exchange argument, and say
  what changes when weights tie.
- Run Kruskal's algorithm by hand on a weighted graph, with union-find answering each cycle
  test, and state its cost with the sort identified as the dominant term.
- Say why a minimum spanning tree differs from a shortest-path tree on the same graph, with
  the numbers (eleven against twelve).

</section>

<section data-section="internals">

## Into the internals

### Why the cut property and the cycle property are mirrors of each other

The cut property says a lightest crossing edge is safe; the cycle property says a strictly
heaviest cycle edge is unsafe. Both come from the identical exchange argument run in opposite
directions: swap a heavier crossing edge out for a lighter one (the cut property's proof),
or swap a heavier cycle edge out for a lighter one that reconnects the same two pieces (the
cycle property's proof). Neither property is more fundamental than the other; a correctness
proof can use whichever one the algorithm's own bookkeeping makes easier to apply, and
Kruskal's own proof is usually stated with the cycle property, reading each rejected edge as
the heaviest edge on the cycle it would have closed.

### Why ties don't break the proof

The cut property's proof only needs the chosen edge to be *a* lightest crossing edge, not
*the unique* lightest one. With a tie, every edge achieving the minimum weight is safe for
some MST, which is exactly why a graph with ties can have more than one minimum spanning
tree (all of the same weight) while the proof keeps working for any one of them, with any
consistent tie-breaking rule.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs Kruskal's algorithm on the chapter's own ten-edge graph, confirming the
exact accepted and rejected edges and the minimum spanning tree's weight. It demonstrates the
cut property directly (a chosen cut's lightest crossing edge, confirmed to be one of the MST's
own edges) and the cycle property directly (a triangle's heaviest edge, confirmed absent from
the MST). It counts every spanning tree of the graph by brute force, reproducing
`CHAPTER.md`'s own planning figures (eighty-nine counting the parallel edge, fifty-five
without it), confirms the minimum spanning tree is unique at weight eleven with the next-best
spanning tree at weight twelve, demonstrates the tie-trap on a small four-cycle example, and
confirms a uniform shift of every weight (making some negative) changes no accepted edge.

</section>

<section data-section="production">

## In production

SciPy's own documentation states that `scipy.sparse.csgraph.minimum_spanning_tree` is
computed using Kruskal's algorithm; NetworkX's own documentation offers all three named
algorithms (Kruskal, Prim, Borůvka) with Kruskal as the default. Neither claim is extended
beyond what each page's own current text states.

</section>

<section data-section="frontier">

## The frontier

Borůvka's algorithm, the randomized linear-time Karger–Klein–Tarjan algorithm, and
single-linkage clustering read as an MST cut are named only, per `CHAPTER.md`'s own
instruction, and built in neither this topic nor the next; a reader curious about them starts
from the citations in the next topic's own post-notes. The general exchange-argument
technique, matroids, and the counter-examples where greedy fails (coin systems, 0/1 knapsack)
belong to a later chapter on exchange arguments and matroids.

</section>

<section data-section="questions">

## More questions

- The cut property is stated for a cut that *respects* the edges already picked. What
  actually goes wrong in the proof if the cut does not respect them — pick a concrete cut
  that cuts through an already-accepted edge and see where the exchange argument breaks?
- This topic counted eighty-nine spanning trees on a six-vertex graph with ten edges, by
  brute force. At what graph size does brute-force counting become impractical, and what
  does the Matrix-Tree theorem buy you that brute force does not?

</section>

<section data-section="next">

## Where this goes next

Kruskal's algorithm sorts every edge and lets union-find veto the ones that close a cycle,
so it needs the whole edge list before it starts. Nothing in the cut property demands that.
The cut can just as well be the tree you already have against everything else, with the
cheapest edge leaving it taken next. That one tree growing outward from a single vertex, and
the priority queue that makes it fast, is Prim's algorithm, next.

</section>
