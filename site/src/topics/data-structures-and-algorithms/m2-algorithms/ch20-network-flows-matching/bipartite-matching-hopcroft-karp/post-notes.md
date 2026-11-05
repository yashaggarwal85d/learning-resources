---
id: dsa.bipartite-matching-hopcroft-karp
title: Bipartite matching and Hopcroft-Karp
---

<section data-section="outcomes">

## After this topic you can

- Model an assignment problem as a unit-capacity flow, and say why integrality turns the flow
  into a matching.
- Run an alternating-path augmentation by hand, including one that reroutes earlier pairs, and
  run one Hopcroft-Karp phase by hand: layers, disjoint shortest paths, flip all.
- Explain why the number of phases stays small, and extract a minimum vertex cover from a
  maximum matching to certify it.

</section>

<section data-section="internals">

## Into the internals

### Why a single alternating path can rearrange several existing pairs at once

Flipping an alternating path does not just add one new pair; every edge on the path swaps which
set it belongs to, matched or unmatched. On the chapter's own task-machine graph, rescuing the
one free task reassigns three machines that were already correctly matched to something else,
in a single chain. Nothing about those three earlier pairs was wrong; the path simply proves a
better overall arrangement exists that uses them differently.

### Why disjoint shortest paths, not just any paths, make a phase correct

A Hopcroft-Karp phase flips many augmenting paths at once, but only because it first restricts
itself to paths of the identical, shortest length, and only ever vertex-disjoint ones. Two
augmenting paths that shared a vertex could not both be flipped without breaking the matching
property; restricting to the shortest length is what guarantees the next phase's shortest path
is strictly longer than this one, which is the fact the whole phase-count argument rests on.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs the greedy scan and the one-augmentation-at-a-time algorithm on the chapter's
own task-machine graph, confirming a greedy matching of three against a true maximum of four,
and reproduces the exact zig-zag reroute by hand: the single augmenting path from the still-free
task reassigns three existing pairs in a chain. It builds the minimum vertex cover from the
final alternating search on both the task-machine graph (a trivial cover, every task, size four)
and the Hall-obstruction graph (the pointed cover `{m1, t3}`, size two). On a random graph of one
thousand tasks and one thousand machines, `examples.py`'s own run reaches a matching of several
hundred: Hopcroft-Karp reaches it in three phases, while the one-augmentation-at-a-time baseline
needs one search per matched task, hundreds of searches, to reach the identical matching.

</section>

<section data-section="production">

## In production

SciPy's own `maximum_bipartite_matching` documentation states plainly that it "implements the
Hopcroft–Karp algorithm," not a generic call into its own `maximum_flow` routine, and states
König's theorem directly: "the cardinality of the matching is also the number of vertices
appearing in a minimum vertex cover of the graph." NetworkX's own `hopcroft_karp_matching` is
documented as an alias of its own `maximum_matching`, so a caller there need not know which
specific algorithm is actually running underneath.

</section>

<section data-section="frontier">

## The frontier

Dinitz's own blocking-flow algorithm, from which this topic's layered phase is adapted, is named
only; the Hungarian algorithm (weighted bipartite assignment), min-cost flow (including the
syllabus's own cluster-scheduling lab, left unreproduced since min-cost flow is a skipped topic),
general matching with Edmonds' blossoms, and stable matching (Gale–Shapley) are all named only,
per `CHAPTER.md`'s own instruction, and built in neither this topic nor the last. König's theorem
does not hold in general, non-bipartite graphs; odd cycles break the alternating-path search
there, and repairing it needs blossom contraction, named only. An unweighted version of the
syllabus's own cluster-scheduling lab (assign tasks to machines by maximum matching, against the
greedy scan, at a scale `examples.py` can run) sits here instead of the weighted one; the
weighted lab belongs to the skipped min-cost-flow topic.

</section>

<section data-section="questions">

## More questions

- The task-machine graph's own minimum vertex cover (every task, size four) is trivial because
  every task happens to be matched. What has to be true of a bipartite graph for its minimum
  vertex cover to always equal "every left vertex," regardless of which edges exist?
- Hopcroft-Karp's own phase count argument never mentions the actual edge count directly, only
  the vertex count. Does a sparser graph, with fewer edges per vertex, ever need *more* phases
  than a denser one on the same number of vertices, or does sparsity only ever help?

</section>

<section data-section="next">

## Where this goes next

Hopcroft and Karp beat the general method by noticing what a unit-capacity network allows: many
augmenting paths of the same length can be found and flipped together, and a count of phases
replaces a count of paths. That habit, looking at the structure of a problem and taking a
different route from the general one, is what the next chapter is about. It steps back from
graphs to the two paradigms behind most algorithms in this course. One splits a problem, solves
the pieces and combines them, and reads its cost off a recurrence. The other makes the locally
best choice and proves it safe, the way a cut did for spanning trees and failed to for flows.
Divide-and-conquer design, next.

</section>
