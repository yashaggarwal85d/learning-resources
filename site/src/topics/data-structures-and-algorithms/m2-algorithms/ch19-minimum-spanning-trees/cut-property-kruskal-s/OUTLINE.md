# OUTLINE: Cut property and Kruskal's algorithm

A full topic, about 14 minutes. First topic of Chapter 19. Every count below is computed
and asserted directly in `examples.py`, reproducing `CHAPTER.md`'s own planning table on
the Chapter 10 graph, read as undirected.

## Storyboard

1. **Hook.** Six sites, ten candidate links, each with a price; the board wants every site
   reachable at the lowest total. Taking the cheapest link first looks obviously right — and
   the same instinct is wrong for coin change, knapsack and the travelling salesman. Why is
   *this* greedy choice right? And is the cheapest network the same as the cheapest routes
   from head office (11, or 12)?
2. **The generic algorithm.** Start with no edges; repeatedly add a *safe* edge (one still
   contained in some MST); stop at n − 1 edges. Every correct MST algorithm is this generic
   algorithm with a different rule for finding a safe edge fast.
3. **The cut property.** For any cut that respects the edges picked so far, a lightest
   crossing edge is safe. Demonstrated directly: cutting the graph as {A, C} against the
   rest, the lightest crossing edge (C–D, weight one) is exactly one of the five edges
   Kruskal's run accepts.
4. **The cycle property.** On any cycle, a strictly heaviest edge belongs to no MST.
   Demonstrated directly: the triangle A–B–C, where the heaviest edge (A–B, weight four) is
   confirmed absent from the computed MST.
5. **Predict.** A tie at the lightest weight: does the cut property still pick out a unique
   edge? (No — with a tie, each of the tied edges is safe for some MST; the chapter's own
   graph has two ties, at weight two and at weight three, and neither creates a second MST,
   confirmed by brute-force enumeration.)
6. **Kruskal's algorithm.** Sort every edge by weight; scan in order; union-find answers
   "does this edge close a cycle?"; accept if not, stop at five edges. Measured directly on
   the chapter's ten edges: five accepted (C–D, A–C, D–E, B–C, E–F, weight eleven total),
   five rejected, each closing a cycle at the point it is reached.
7. **Why the sort dominates.** Kruskal's cost is the sort (m log m) plus near-linear
   union-find; on this chapter's own graph the sort is the whole story. A pre-sorted or
   integer-weight input (this chapter's own radix sort, two topics back) changes the
   picture entirely.
8. **The tie-trap.** A four-cycle with all four edges the same weight has four different
   minimum spanning trees of the same weight — demonstrated directly on a small example
   graph, confirming any consistent tie-breaking rule gives a correct answer.
9. **Spanning-tree counts.** The chapter's own graph, as a multigraph, has eighty-nine
   spanning trees in total; dropping the heavier of the two parallel A–B edges drops that to
   fifty-five — both counted directly by brute force, confirming `CHAPTER.md`'s own planning
   figures. *Takeaway:* "A graph can have dozens of spanning trees of many different
   weights; the cut property is what picks out the one (or the tied few) that are minimum."
10. **MST against the shortest-path tree.** The same graph, two different trees from the
    same starting idea: the shortest-path tree from A weighs twelve; the minimum spanning
    tree weighs eleven. One prices a route from a single vertex; the other prices a whole
    network.
11. **Negative weights change nothing.** Shifting every edge weight by the same amount
    changes no relative order, so Kruskal's run (and the cut property's own argument) is
    untouched — confirmed directly by re-running Kruskal on every weight shifted negative
    and getting the identical accepted set.
12. **Recap and handoff.** The cut property certifies a greedy choice before the rest of
    the answer exists; Kruskal consumes it with the machinery already on hand (sort,
    union-find). The next algorithm uses the identical lemma with a different cut: the tree
    already built, against everything else. Prim's algorithm, next.

## Changes from the chapter plan

- `CHAPTER.md`'s own planning figures (89 spanning trees counting the parallel edge, 55
  without the heavier A–B edge; MST weight 11, unique; next-best 12; shortest-path tree 12)
  are all reproduced exactly by brute-force enumeration in `examples.py`, not asserted from
  the plan's own arithmetic.
- The specific cut used to demonstrate the cut property ({A, C} against the rest) is this
  topic's own choice, not specified in `CHAPTER.md`; it was picked because its lightest
  crossing edge is unique (no tie), making the demonstration unambiguous.
- CLRS's own section numbers and exact statement of the cut property are **not opened this
  session** (paywalled); Wikipedia's own independently fetchable statement of the cut
  property and cycle property, by those names, is this topic's primary source for the
  properties' own wording instead (see `SOURCES.md`'s Red team).
