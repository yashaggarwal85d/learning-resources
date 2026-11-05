---
id: dsa.p-np-polynomial-reductions
title: P, NP and polynomial reductions
---

<section data-section="outcomes">

## After this topic you can

- State P, NP, certificate and verifier in your own words and, for a given decision problem,
  write down its certificate and the verifier's cost.
- Carry out a Karp reduction in the correct direction (from the known-hard problem to the new
  one), check both halves of the iff, and say what a reduction in the other direction would and
  would not show.
- Say what NP-hard and NP-complete mean, why they are statements about the worst case and about
  a conjectured gap, and what to try instead of an exact algorithm.

</section>

<section data-section="internals">

## Into the internals

### Why the direction is the whole subject

A Karp reduction's definition is symmetric-looking on the page — a function f with x ∈ A iff
f(x) ∈ B — but its *use* is not. Reducing A to B only transfers a guarantee: a fast algorithm
for B would give a fast algorithm for A. To show a new problem B is hard, the function has to
start at a problem A already believed hard and map toward B. Reducing B to A instead only shows
B is no harder than A, which says nothing useful once A is itself suspected of being hard. The
mistake is common precisely because both directions produce a function that satisfies the same
formal definition; only the direction of the inference changes.

### Why the self-reduction's call count is not a coincidence

The one-plus-the-vertex-count call count is not particular to this one graph. At every step the
invariant "a witness of the target size still exists" is maintained, and a vertex is kept only
when removing it would break that invariant. At the end, no remaining vertex can be removed
without breaking it, which forces the remaining set to have no edges at all — if two survivors
were connected, at least one of them would be droppable, contradicting that neither was. The
argument works for any decision-only oracle with this structure, not just independent set.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs every number in this topic directly: bin packing in its three forms with a
verified packing, the independent-set candidate count and verify cost on sixty vertices and a
target of thirty, the self-reduction's witness construction and call count on ten random
twelve-vertex graphs, the independent-set-to-vertex-cover reduction checked on every graph of
six vertices or fewer and every target size, a vacuous reduction from two-colourability checked
on twenty random graphs, and the syllabus's own lab reduction — three-SAT to independent set, by
a triangle per clause and an edge between every literal and its negation — checked against
brute-force satisfiability on thirty random three-CNF formulas. Re-run the exhaustive check at
seven vertices instead of six and confirm it still finds zero mismatches (slower, but still
small enough to finish). Re-run the self-reduction on a denser random graph and confirm the call
count is still exactly one plus the vertex count.

</section>

<section data-section="production">

## In production

**PostgreSQL's own query planner** documents the production consequence of this chapter's
subject directly: the number of possible join orders grows exponentially as the number of
tables expands, and beyond roughly ten tables the planner gives up on exhaustive search and
switches to a genetic, probabilistic search instead — a real system built around exactly the
blow-up this topic names. **Cook's 1971 paper and Karp's 1972 paper**, the two papers this whole
field traces back to, are not read directly here, but their existence and headline results are
confirmed through two independent tertiary sources, and the practice of citing a result through
a reliable secondary account rather than overclaiming direct access to a hard-to-reach primary
source is itself a habit worth keeping.

</section>

<section data-section="frontier">

## The frontier

The chain of gadgets that makes every classic NP-complete problem hard — Cook–Levin's own proof,
then SAT reducing to three-SAT, then three-SAT reducing to independent set, clique, Hamiltonian
cycle and subset sum in turn — is named once as the *(skipped)* topic this one stands in front
of. This topic builds and checks exactly one link in that chain (three-SAT to independent set,
in the lab) rather than the whole sequence. Fine-grained complexity (SETH, 3SUM, APSP, and
conditional lower bounds built on them) is named once in topic 108's post-notes as the next
layer beyond classical NP-hardness, and is not built here either.

</section>

<section data-section="next">

## Where this goes next

A reduction transfers hardness in one direction, and the whole subject is knowing which. But
every problem so far had numbers in it that were harmless: a vertex count, a clause count. Give
a problem real numbers (a capacity, a size, a weight) and a new question appears that this reel
could not ask: the same word "polynomial" means two different things depending on whether you
measure a number by its value or by how many digits it takes to write. That is why one
NP-complete problem, knapsack, has a dynamic program that looks fast, and another, bin packing,
can never have one unless P equals NP. Pseudo-polynomial time and strong NP-hardness, next.

</section>
