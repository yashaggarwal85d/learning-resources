---
id: dsa.topological-sort
title: Topological sort
---

<section data-section="outcomes">

## After this topic you can

- Run Kahn's algorithm and reverse-DFS-finish-order topological sort on the same DAG and confirm both orders are valid.
- Explain why each algorithm detects a cycle as a natural failure rather than a separate check.
- Produce the lexicographically smallest topological order with a heap-based Kahn's algorithm, and say what it costs over the plain queue version.

</section>

<section data-section="internals">

## Into the internals

### Why neither algorithm needs a bolted-on cycle check

Kahn's algorithm only ever moves a vertex from "waiting" to "done" when its in-degree reaches zero. In a cycle, every vertex in that cycle has at least one incoming edge from another vertex in the same cycle, so none of them can ever reach in-degree zero on their own — the queue simply runs dry with vertices left over. Reverse-DFS-finish-order relies on the fact that a DAG's DFS produces no back edges; if the graph has a cycle, DFS finds a back edge during the very same pass that computes finish times, and that back edge is the cycle witness. Both tests are a direct consequence of the algorithm's own mechanics on an acyclic input, not a separate pass added afterward.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs Kahn's algorithm and reverse-DFS-finish-order on the identical five-vertex DAG and confirms both orders are independently valid (every edge points from an earlier position to a later one), without requiring the two orders to match vertex-for-vertex. The same two algorithms are run on a four-vertex cyclic graph and both correctly report a cycle — Kahn's queue drains short of the full vertex count, and DFS's own cycle flag fires. A heap-based variant of Kahn's algorithm is run on a graph built so a plain FIFO queue and the heap actually disagree, confirming the heap always produces the lexicographically smallest of all valid orders.

</section>

<section data-section="production">

## In production

A topological order is the precondition for critical-path scheduling on a DAG of tasks: once every task is ordered so nothing runs before something it depends on, the project's critical path is found by one more linear sweep over that order, tracking the longest weighted path reaching each vertex. Data Engineering's own chapter on DAG-based pipeline scheduling builds that sweep in full; this topic only supplies the ordering it depends on.

</section>

<section data-section="frontier">

## The frontier

Articulation points, bridges and biconnectivity, and lowest common ancestor are both skipped syllabus topics from this chapter that sit near strongly connected components, the topic right after this one — both are explored in that topic's own frontier note.

</section>

<section data-section="questions">

## More questions

- Kahn's algorithm and reverse-DFS-finish-order can give different valid orders on the same DAG. Can you construct a DAG where every valid topological order is the identical sequence, no matter which algorithm or tie-break rule produces it?
- The lexicographically smallest order uses a min-heap. What change to the heap would instead produce the lexicographically *largest* valid order?

</section>

<section data-section="next">

## Where this goes next

A topological order says which vertices can come before which. It says nothing about which vertices can reach each other at all, in a graph that is not a DAG and has no topological order to give — a graph with cycles, where whole groups of vertices can each reach every other member of the group and nothing outside it. Finding those groups is the chapter's last structural question. Strongly connected components, next.

</section>
