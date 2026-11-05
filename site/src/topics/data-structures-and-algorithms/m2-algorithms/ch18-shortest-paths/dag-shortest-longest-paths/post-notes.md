---
id: dsa.dag-shortest-longest-paths
title: DAG shortest and longest paths
---

<section data-section="outcomes">

## After this topic you can

- Compute shortest distances on a DAG by relaxing edges in topological order, in a single linear pass, and confirm the result against Bellman-Ford's answer on the same graph.
- Compute the longest path in the same DAG by negating edge weights, and explain why this trick is only valid because the graph is acyclic.
- Build a small task-dependency DAG and read its critical path off as the longest path from start to end.

</section>

<section data-section="internals">

## Into the internals

### Why negating weights to find a longest path only works on an acyclic graph

Negating every edge weight turns a cycle of positive total weight into a cycle of negative total weight — and a shortest path through a negative cycle has no well-defined answer at all, since looping around it keeps lowering the total forever. A directed acyclic graph has no cycle to begin with, so negation there can never create one, and the shortest-path pass on the negated graph is always safe. On any other graph, the trick breaks exactly where the cycle does, which is also exactly why the longest path problem is NP-hard on general graphs but trivial here.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds a six-vertex DAG and relaxes it in topological order, confirming the result matches an independent Bellman-Ford-style relaxation (`brute_force_all_paths_shortest`) exactly. The identical graph, relaxed in a deliberately non-topological order instead, produces a strictly larger (wrong) distance at one vertex, with no error raised — demonstrating the ordering requirement directly rather than merely asserting it. Negating every weight and re-running the same pass finds a longest path strictly longer than the shortest one between the same two vertices, confirmed against a hand-traceable predecessor chain. A seven-task dependency DAG's critical path (`start -> design -> build-frame -> paint -> ship`) is read directly off that same longest-path computation, with its total duration confirmed by summing the individual task durations along that exact path.

</section>

<section data-section="production">

## In production

This exact single pass over a topological order is what runs, usually without anyone naming it, inside build systems computing the critical path through a dependency graph of build steps, task schedulers and project-management tools reporting a project's minimum completion time, and compilers scheduling instructions or evaluating spreadsheet formula dependencies — any system where "what must happen before what" is already acyclic by construction.

</section>

<section data-section="frontier">

## The frontier

None newly introduced by this topic. Topic 63's own frontier section already names A* search, bidirectional search, contraction hierarchies, and research beyond Dijkstra's own asymptotic bounds — the three syllabus items skipped across this chapter, all goal-directed or asymptotic refinements of label-setting rather than anything this topic's acyclic case needs.

</section>

<section data-section="questions">

## More questions

- The wrong-order counterexample settles one vertex too early. What is the smallest change to the bad order that would have avoided the mistake on that particular graph?
- A task-dependency graph's critical path is its longest path. What does its *shortest* path from start to end actually mean, if anything, in a project-scheduling context?

</section>

<section data-section="next">

## Where this goes next

Shortest and longest paths answered the question "what is the cheapest way from this vertex to the rest". The same weighted graph holds a different question, one about the whole network at once: not a route, but the cheapest set of links that leaves every vertex still connected. Cut property and Kruskal's algorithm, next.

</section>
