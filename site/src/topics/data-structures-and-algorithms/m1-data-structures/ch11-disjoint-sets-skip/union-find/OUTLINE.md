# Outline — dsa.union-find

## Outcomes (from CHAPTER.md)

Implement union–find with union by rank or size and path compression or halving, and show on the
same operation sequence the height with and without each rule; state the amortized bound with its
conditions, say why it is not a worst-case bound, and say why α(n) is small for any n a machine can
hold; use it for Kruskal's cycle test, incremental components and entity-resolution clustering, and
name its one structural limit (no delete or split).

## 10-step storyboard

1. **Hook.** Ten million "do these two records describe the same entity" pairs arrive from an
   entity-resolution pipeline, and after every pair the system must say whether the two records
   already belong to one cluster. Relabelling a whole cluster costs O(n) per merge; a graph search
   per query is no better. With the obvious structure — every record points to its cluster's
   representative — an adversarial merge order (always attach the new record to the end of the
   longest existing chain) builds one chain of n nodes, so every lookup walks the whole chain.
2. **Reveal: the three operations on a parent-pointer forest.** `MakeSet`, `Find` (walk parent
   pointers to the root), `Union` (point one root at the other); drawn as Erickson's "reversed
   trees" — the `parent` array as a row of cells, the forest beside it. No takeaway (reel test's
   reference step).
3. **Predict: after the adversarial merge order on 16 elements, how deep is the tree, and what
   does one `Find` on the deepest node cost.** (Correct: depth 15, cost Θ(n) — the naive rule gives
   no bound at all; the tempting wrong answer is "O(log n), trees are usually balanced," which
   ignores that the caller picks the merge order, not the structure.)
4. **Reveal: union by rank (or size) bounds the height at log₂ n.** The chapter-10 edge list feeds
   in as a ticker (ten edges, five merge two components, five find both endpoints already
   together); beside it, the same 16-element adversarial sequence replayed under rank: depth never
   exceeds 4. The proof in one frame: a tree's rank only rises when it is joined to another tree of
   at least its own rank, so a tree of rank r has at least 2^r nodes, and no rank can exceed log₂ n.
   Takeaway.
5. **Reveal: path compression.** A `Find` on the deepest node of a chain swings every visited node
   straight to the root in the same pass; drawn as the whole chain collapsing in one beat. Rank
   alone already bounds worst-case `Find` at O(log n); compression is layered on top of it, not a
   replacement for it. Takeaway.
6. **Predict: averaged over a million operations with rank and compression together, is the
   typical cost per operation closer to O(log n), O(1), or "it depends on the input order."**
   (Correct: neither "always O(1)" nor "depends on input" — it is bounded by a function of n that
   grows so slowly it is under 5 for any n that could ever occur in practice, regardless of input
   order; the tempting wrong answers are "exactly O(1)" — a single call can still cost Θ(log n) —
   and "depends on the adversary," which was true for the naive rule but not once rank bounds the
   height.)
7. **Reveal: the O(α(n)) amortized bound.** Stated with its two conditions (union by rank or size,
   plus compression) and what it does not say (a single `Find` can still be Θ(log n); the bound is
   amortized, not worst-case); α(n) named and drawn as a number that never exceeds 5 for any
   remotely imaginable n, with the matching Ω(α(m,n)) lower bound named as proven but not shown.
   Takeaway.
8. **Reveal: three uses of the same structure.** The chapter-10 edge list in sorted order, accept
   only edges whose endpoints are still in different sets (Kruskal's cycle test — the sort and
   correctness proof are Chapter 19's); the same stream read as "which component is each vertex
   in," maintained incrementally with no graph search per query; the entity-resolution pairs from
   the hook as union calls, with the one-way-door limit named (a false merge can never be undone,
   because union–find has no split). Takeaway.
9. **Recap.** Three operations, one invariant (rank bounds height), one trick (compression), one
   number (α(n)) that makes "amortized" concrete instead of abstract.
10. **Prove it.** The pipeline from the hook discovers one merge was a mistake — two records that
    were clustered together are not actually the same entity. Can union–find undo it? (Correct:
    no — there is no `Split` operation; the fix is a new data structure built from scratch on the
    corrected pairs, which is exactly union–find's one structural limit, named in step 8.)

## Engagement arc

- Predicts: step 3 (within the first four steps), step 6, and the closing "Prove it" (step 10) —
  three predicts, as a full topic needs at least two.
- No takeaway on step 2 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 7, 8 (four takeaways).
- Surprising number: step 7's α(n) < 5 for any n that could ever occur.
- Recap: step 9.

## Narrator's line of thought, step by step

1. Opens on why the obvious fix (just relabel) doesn't scale, and why "search the graph" is the
   same cost in different clothes — the professor names the two bad options before the good one.
2. Names the three operations as a vocabulary, not a result yet; points out the one-way pointer
   (no pointer down to children) as the thing that makes `Find` cheap to define and `Union` cheap
   to perform, at the cost of saying nothing yet about how deep that walk gets.
3. Poses the predict as "you choose the order, I choose the structure" — an adversary framing,
   since the point is that no fixed rule beats an adversary without a rule to prevent it.
4. Walks the doubling argument aloud as a size argument before naming it rank, since "a tree can
   only get taller by being joined to one at least as tall" is the whole proof in one sentence.
5. Names what compression buys that rank alone doesn't: not a better worst-case bound on this one
   call, but every future call through the same nodes.
6. Frames the predict as a trap between two tempting extremes (exactly constant vs. input-
   dependent), both wrong for the same reason: the question conflates one call with many.
7. Says the number aloud as "inverse Ackermann," then immediately translates it: not a term to
   memorize, a promise that it will never in practice exceed 5, and separates that from the
   un-shown fact that a single call can still be slow.
8. Treats the three uses as the same question asked three times in different words — "same set or
   not" — and ends on the limit as the reason this structure is not the whole entity-resolution
   story, only its cheapest building block.
9. Recap stays in the professor's own words, not a re-read of the takeaways.
10. Poses the final question as a consequence the learner should now be able to derive themselves,
    not a new fact.

## Post-notes headings

Outcomes; Internals (the `parent` array layout, rank vs. size as the union rule, path halving and
splitting as one-pass alternatives, both described from their standard definition since Tarjan and
van Leeuwen's paper itself is not fetchable — see FACT-CHECK.md); Lab (the syllabus's "implement
union–find with and without path compression and time 10^7 operations," run and reported here);
Production (entity resolution's over-merge failure mode, pointed to Data Engineering §8.3 by name);
Frontier (the Ω(α(m,n)) lower bound, named with its citation, proof out of scope); Where this goes
next (Kruskal in Chapter 19, connected components in Chapter 17, skip lists next in this chapter).

## Bridge / handoff

Bridge (word for word, Chapter 10 topic 37's handoff): "Compressed sparse row answers how a
graph's own edges are laid out in memory, and reordering answers how to lay that same memory out
so the layout actually helps. The next chapter asks a different kind of structural question about
graphs: not how fixed connections sit in memory, but how to track which vertices end up in the
same component as a graph of edges is built up one at a time — the structure behind Kruskal's
minimum spanning tree, connected components, and entity-resolution clustering. Union–find, next."

Handoff (word for word, CHAPTER.md's plan): "Union–find answers one question, same set or not,
and answers it with no notion of order at all: its trees are shaped by rank, not by key. Most of
the structures in this course keep keys in order, and every ordered structure so far has paid for
its balance with an invariant that rotations or splits must restore. The next topic balances with
coin flips instead, and nothing ever has to be restored. Skip lists, next."

## Concept ledger

Introduces: `disjoint-set-union`, `union-by-rank-or-size`, `path-compression`,
`path-halving-splitting`, `iterated-logarithm`, `inverse-ackermann-bound`, `cycle-test-by-union`.
Uses: `edge-list` (Chapter 10 topic 36), `amortized-cost`, `potential-method` (Chapter 1 topic 6),
`big-o-theta-omega`.
Declared: `logarithms`.

## Changes from the chapter plan

- Path halving and splitting are described from their standard one-pass definition (every node on
  the find path points to its grandparent, in one pass vs. two) without citing Tarjan and van
  Leeuwen 1984 for "they carry the same bound": the paper is behind an ACM paywall with no free
  text found, so that specific claim is cut rather than asserted from memory. The one-pass
  rationale (no second pass, no recursion stack) is kept since it follows from the algorithms'
  definitions alone, not from the paper's proof.
- The on-screen number for α(n)'s practical ceiling is "under 5" (Sedgewick and Wayne's exact
  stated constant), not the chapter plan's placeholder "at most 4": Erickson's notes independently
  derive "≤ 3" for a slightly different exact definition of α, and neither source states "4." Using
  the one source that states a specific constant for a specific function avoids conflating the two
  definitions on screen.
- Galler and Fischer 1964 is named once in post-notes as the structure's origin, without a quote
  (ACM-paywalled); Erickson's notes present the same parent-pointer forest directly and are the
  structure's source for everything taught on screen.

## Claims list (for FACT-CHECK.md)

1. Erickson: a naive parent-pointer union can build a chain, so `Find` is Θ(n) worst case.
2. Erickson: union by depth/rank bounds a set's size to at least 2^depth(leader), so max depth ≤
   lg n, giving Θ(log n) worst-case `Find` and `Union`.
3. Erickson: with union by rank and path compression, `Find` runs in O(α(n)) amortized time
   (Seidel and Sharir's top-down analysis).
4. Erickson: the matching Ω(α(m,n)) lower bound is proved by Tarjan (1979), for any pointer-based
   disjoint-set structure.
5. Sedgewick-Wayne: the amortized cost of weighted quick-union with path compression is bounded by
   the inverse Ackermann function and is less than 5 for any conceivable n that arises in practice.
6. Sedgewick-Wayne / Erickson: plain path compression (no weighting) on quick-union already gives
   a logarithmic amortized cost by itself (Sedgewick-Wayne's weaker exercise claim, used only to
   motivate why rank/size is added on top, not as the headline bound).
7. Chapter-10 edge list and its merge/already-together split under Kruskal's sorted-by-weight
   order: computed fresh in this topic's examples.py against ch10's own examples.py, not assumed.

## Progress

Research done (SOURCES.md, verified). Outline/storyboard done, this file. Next: FACT-CHECK.md
(section 5), coverage.json (section 6), then examples.py / reel.tsx / scenes.tsx / narration.json /
post-notes.md / pre-notes.md / prerequisites.mdx / registry entry (section 7).
