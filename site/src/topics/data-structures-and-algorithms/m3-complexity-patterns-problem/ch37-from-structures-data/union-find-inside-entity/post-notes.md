<section data-section="outcomes">

## What this topic leaves you able to do

Cluster a stream of scored record pairs into entities with union-find, tracking a record's
entity id as unions land; explain, with a measured threshold sweep, why raising a match
threshold produces a step function in cluster count rather than a smooth decline, and why
union-find has no operation to undo an over-merge; say what a distributed engine does instead
of a shared parent array, and point to a measured cost in rounds for doing it that way.

</section>

<section data-section="internals">

## Into the internals

### A threshold is not a dial on the graph, it's a dial on which edges exist

Nothing about union-find changes as the threshold moves. What changes is the edge list itself:
a pair below the threshold is simply never passed to `union`. The "smooth versus step" question
the hook raises is really a question about the distribution of pair scores, not about the
clustering algorithm — a graph with scores spread evenly across every value would show a smooth
curve; this one, built with two deliberately weak bridges and nothing in between, cannot.

### Why "no split" is a property of the structure, not an oversight

Union-find's `union` discards the information needed to undo it: once two roots are joined,
nothing records which specific edge caused the join, or whether some other edge would have
joined them anyway. This is the same trade that makes `find` and `union` cheap — tracking
enough history to support a split would mean keeping something closer to the full edge list in
memory per component, defeating the one-parent-entry-per-record design the chapter plan calls
out as union-find's advantage over a graph search here.

### The same two lines of code, two different meanings of "component"

The match-graph clustering and the lineage blast-radius example in this topic run the identical
`UnionFind.union` loop over a different edge list. Nothing in the algorithm distinguishes "these
records are the same entity" from "these datasets share ancestry." The meaning lives entirely
in what the vertices and edges represent, which is exactly why the same structure recurs across
such different problems.

</section>

<section data-section="lab">

## The lab

`examples.py` builds one 24-record match graph (three groups of eight, two deliberately weak
bridging pairs) and measures, not asserts from a formula: the exact cluster sizes at six swept
thresholds (24, then 16/8, then 8/8/8 — a genuine two-step cliff, verified by running the
clustering at each threshold rather than assumed from the graph's construction); one record's
entity id traced pair by pair as unions land in score-descending order; a small lineage graph's
connected components (sizes 6 and 3); and a label-propagation loop on the identical match graph,
measured at ten rounds to converge to the same clustering union-find finds in one pass.

</section>

<section data-section="production">

## In production

Real entity-resolution pipelines add two things this topic's small graph skips entirely: a
blocking step (compared briefly in pre-notes, not built, since Data Engineering's §8.3 covers
it) to avoid scoring every pair against every other pair, and a chosen threshold that is itself
the product of an evaluation process, not read off a single sweep like this topic's six test
points. GraphFrames' real `connectedComponents` also adds a `broadcastThreshold` this topic's
small graph never approaches, since it only matters once components are large enough that
naive broadcasting of component assignments becomes expensive.

</section>

<section data-section="frontier">

## At the frontier

Kiveris et al.'s 2014 paper (named, not read, per the chapter plan) is the literature this
topic's own ten-rounds measurement gestures at: once a graph has billions of edges and no
single machine can hold it, the question is no longer "how many rounds" in the abstract but
"how many rounds, and how much data moves per round" — a trade-off this topic's own
twenty-four-record measurement is far too small to speak to directly, which is exactly why the
paper exists as a citation rather than a claim this topic makes itself.

</section>

<section data-section="questions">

## Questions worth sitting with

This topic's match graph has exactly two bridging pairs, chosen to be weak on purpose. A real
matcher's score distribution is rarely this clean — scores cluster near the threshold far more
often than they sit comfortably above or below it. If every pair in a real match graph scored
within a few points of the threshold, would the cluster-count curve still look like a clean
step function, or would it start to look smoother — and what would that imply about how
sensitive a chosen threshold actually is in practice?

</section>

<section data-section="next">

## Next

Union-find groups records that were never in any particular order. The next structures are
about keeping order itself, on disk, at the scale of a database: the index layer of a storage
engine, where the search trees of the early chapters are the same B+-tree and LSM tree, with
their keys, pages and filters changed to suit what a database must remember. Search trees
inside storage engines, next.

</section>
