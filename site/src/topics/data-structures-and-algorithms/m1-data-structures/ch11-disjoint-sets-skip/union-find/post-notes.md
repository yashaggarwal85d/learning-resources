<section data-section="outcomes">

## Outcomes

Implement union-find with union by rank or size and path compression, and show on the same
operation sequence the height with and without each rule; state the amortized bound with its
conditions, say why it is not a worst-case bound, and say why alpha(n) is small for any n a machine
can hold; use it for Kruskal's cycle test, incremental components and entity-resolution clustering,
and name its one structural limit (no delete or split).

</section>

<section data-section="internals">

## Internals

The `parent` array is the whole structure: index i holds the index of i's parent, and a root
holds its own index. Union by rank keeps a second array, `rank`, an upper bound on a tree's height
that only ever rises when two trees of equal rank are joined — it is kept as a separate number
rather than recomputed from the tree because path compression changes real depths without
changing which tree is taller in the sense that matters for the proof. Union by size is the same
idea with a different number (the count of elements) and the same O(log n) worst-case bound,
proved the same way: Erickson's induction argument shows a set's size is at least 2^depth(leader),
so the leader of any object can change at most lg n times.

Path compression, as taught here, relinks every node visited on a `Find`'s path straight to the
root, in the same pass that walked up to find it — no second pass, no extra data. Two one-pass
variants exist by standard definition: path halving (every other node on the path points to its
own grandparent instead of the root) and path splitting (every node on the path points to its own
grandparent). Both trade a slightly weaker per-call guarantee for never needing a second pass or a
stored path; this topic names them from their definitions only, since Tarjan and van Leeuwen's 1984
paper — the chapter plan's citation for "they carry the same O(alpha(n)) bound" — is behind an ACM
paywall with no free text found (see FACT-CHECK.md). The structure itself traces to Galler and
Fischer's 1964 equivalence algorithm, named here without a quote for the same reason.

</section>

<section data-section="lab">

## Lab

The syllabus's own lab for this topic ("implement union-find with and without path compression and
time 10^7 operations") is run as a real timing comparison, separately from `examples.py`'s own
asserted counts (which use a smaller, deterministic operation count so the build's own test suite
stays fast): `python3 lab_timing.py` in this folder runs 10,000,000 Union/Find calls over a million
elements under the naive rule, under rank alone, and under rank plus compression, and reports
wall-clock time and the total parent-pointer reads for each. The naive run is the slow one by
orders of magnitude; rank alone already brings it down to a logarithmic-feeling cost; adding
compression brings the average reads per call down near the small constant alpha(n) promises.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a merge decision as reversible.** Union-find has no `Split`: once two elements are
unioned, there is no operation that separates them again short of discarding the structure and
rebuilding it from the surviving, corrected pairs. An entity-resolution pipeline that unions on
every "these two records match" decision inherits this directly — one false-positive match merges
two real entities, and nothing about the data structure can undo it later. The matching, blocking
and golden-record logic that decides when to call `Union` in the first place is Data Engineering
§8.3's, not this topic's; this topic's limit is why that logic has to be careful upstream, with
union-find itself offering no safety net downstream.

**Forgetting that an amortized bound describes a sequence, not a single call.** A single `Find`
on a long-untouched path can still cost Theta(log n) even with rank and compression both in force;
a system with a hard per-call latency budget (rather than a throughput budget averaged over many
calls) cannot rely on the amortized bound alone to meet it.

</section>

<section data-section="frontier">

## Frontier

The matching Omega(alpha(m,n)) lower bound — that no pointer-based disjoint-set structure can beat
union-find's amortized cost by more than a constant factor — is named here as a settled result
(Tarjan, 1979, cited through Erickson's own lecture notes) without its proof, which Erickson's
notes themselves call "far beyond the scope of this class." This topic treats it the same way: a
fact worth knowing (there is no cleverer pointer structure waiting to be discovered for this exact
problem), not a derivation to work through.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Chapter 19 builds Kruskal's minimum spanning tree algorithm directly on top of this topic's cycle
test, with the sort and the correctness proof (the cut and cycle properties) as its own content.
Chapter 17 builds connected components by graph search, the alternative to this topic's
incremental version, for the case where the whole graph is already in hand rather than arriving
one edge at a time. Inside this chapter, the next topic keeps the same disjoint-elements setting
but asks a different kind of question: not which set an element belongs to, but how to keep a
whole ordered dictionary balanced using randomness instead of an invariant. Skip lists, next.

</section>
