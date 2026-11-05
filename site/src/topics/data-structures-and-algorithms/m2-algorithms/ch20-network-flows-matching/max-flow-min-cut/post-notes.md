---
id: dsa.max-flow-min-cut
title: Max-flow min-cut and Ford–Fulkerson
---

<section data-section="outcomes">

## After this topic you can

- Run Ford–Fulkerson by hand on a small network, show the residual graph at each step, and
  carry out one augmentation that undoes earlier flow.
- State and prove max-flow min-cut from the algorithm's own last residual graph, and read the
  minimum cut straight off it.
- Say why the integer-capacity running time is pseudo-polynomial, what goes wrong with
  irrational capacities, and what a real library does about both.

</section>

<section data-section="internals">

## Into the internals

### Why a forward-only view can get stuck below the true maximum

A dispatcher that only ever looks for a route with spare forward capacity can report "no more
routes" while two more units could still ship, because that view never considers pulling flow
back the way it came. The residual graph fixes this by keeping, on every edge that already
carries flow, a second number: how much of that flow could still be undone. An algorithm that
searches the residual graph rather than the raw capacities sees a path the forward-only view
never could, because that path crosses one edge backwards.

### Why the cut the algorithm ends on is a certificate, not just an answer

When no augmenting path remains, the vertices reachable from the source in the final residual
graph form a cut by construction: every edge crossing from that set outward must be full (an
unsaturated one would still be reachable), and every edge crossing back must be empty (a flow
on it would make its reverse residual, and hence its tail, reachable too). A flow whose value
equals some cut's capacity is automatically a maximum flow and that cut is automatically a
minimum one, by the same one-line conservation argument this chapter reused from Chapter 19.
The algorithm does not search for a proof after the fact; stopping *is* the proof.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs the chapter's own greedy dispatcher's four routes on the chapter's own
six-depot network, reaching a flow of seven with no forward-only route left, then finds the
one residual-graph path the forward-only view could never see and pushes it, reaching nine. A
second run follows the chapter's own five-augmentation order directly to the same nine. Both
runs read off the identical minimum cut (capacity nine) from the final residual graph. A third
run reproduces SciPy's own documented example, independent of the chapter's own network,
confirming a maximum flow of twenty-three. A fourth run builds the Edmonds–Karp pathological
network at a far smaller scale than the chapter's own hook, confirming that an arbitrary choice
of augmenting path can take thousands of augmentations where a breadth-first choice takes two.

</section>

<section data-section="production">

## In production

SciPy's own `maximum_flow` raises `ValueError` if the capacity values are not integers, stating
that it requires "all capacities are integral to ensure convergence" — independent confirmation
of this chapter's own irrational-capacity non-termination claim. NetworkX's own `maximum_flow`
accepts a `flow_func` parameter and notes that its default, `preflow_push`, "may change from
version to version," so a caller who needs a specific algorithm's own guarantees must name it.

</section>

<section data-section="frontier">

## The frontier

Edmonds and Karp's own two augmenting-path rules (fattest path, shortest path) and their own
running-time bounds, Dinitz's blocking-flow algorithm and level graphs, push–relabel's preflows
and height labels, Stoer–Wagner's and Karger's global minimum cut, and the almost-linear-time
flows frontier are all named only, per `CHAPTER.md`'s own instruction, and built in neither this
topic nor the next. A reader curious about any of them starts from the citations in
`references.md`. Zwick's own non-terminating irrational-capacity network is drawn and named only;
this topic does not attempt to reproduce its own residual-capacity bookkeeping.

</section>

<section data-section="questions">

## More questions

- The algorithm's own stopping rule (no augmenting path left) and the cut it reads off at that
  point are two different-looking things that turn out to be the identical fact. What would have
  to be true of a graph for the algorithm to stop with *two* different minimum cuts available to
  read off, rather than one?
- This topic's own examples all end with an acyclic flow. Could a maximum flow ever need a cycle
  of flow around it to reach its own maximum value, or can cycles always be cancelled away for free?

</section>

<section data-section="next">

## Where this goes next

Ford–Fulkerson ends with a flow and a cut that prove each other optimal, and integrality
guarantees that with whole-number capacities the flow is made of whole units. That is exactly
what a pairing problem needs, because a pairing either uses an edge or does not. Give every edge
capacity one, put a source in front of one side and a sink behind the other, and a maximum flow
is a largest set of pairs. How fast can that be done, and what does the cut look like when the
capacities are all one? Bipartite matching and Hopcroft–Karp, next.

</section>
