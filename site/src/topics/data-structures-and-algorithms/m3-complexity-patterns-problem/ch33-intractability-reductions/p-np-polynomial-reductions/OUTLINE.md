# Storyboard — dsa.p-np-polynomial-reductions

**Learning outcomes** (from CHAPTER.md):
1. State P, NP, certificate and verifier in your own words and, for a given decision problem,
   write down its certificate and the verifier's cost.
2. Carry out a Karp reduction in the correct direction (from the known-hard problem to the new
   one), check both halves of the iff, and say what a reduction in the other direction would and
   would not show.
3. Say what NP-hard and NP-complete mean, why they are statements about the worst case and about
   a conjectured gap, and what to try instead of an exact algorithm.

**Running data** (all computed/asserted in `examples.py`):
- Bin packing in three forms (decision, search, optimization) on a small list of item sizes,
  with a verifier checking a candidate packing in time linear in the item count.
- Independent set on sixty vertices, target size thirty: the number of candidate sets computed
  via `math.comb`, and the verify cost (pairwise checks) pinned at four hundred thirty-five.
- The self-reduction: a decision-only oracle for independent set turned into an actual witness
  on random graphs of twelve vertices, using exactly thirteen oracle calls every time (one plus
  the vertex count), verified by direct call counting.
- The Karp reduction independent set → vertex cover, checked by exhaustion on every graph of six
  vertices or fewer and every target size: zero mismatches across all pairs checked.
- A vacuous wrong-direction reduction from two-colourability (a problem in P) to independent set,
  checked against twenty random graphs: the reduction exists and decides nothing about
  independent set itself.
- The post-notes lab: three-SAT → independent set (a triangle per clause, an edge between every
  literal and its negation), checked against brute-force satisfiability on thirty random
  three-CNF formulas.

**Engagement arc:** 15 steps, full topic, about 16 min. Two predicts (steps 2 and 9; the first
within the first four). Three takeaways (steps 6, 11, 14; none on step 3, the first non-predict
step after the hook and first predict).

## Per-step storyboard

1. **Opening/hook.** A graph on sixty vertices and one question: is there a set of thirty of
   them with no two adjacent? Hand someone a candidate set and they confirm or refuse it in a
   few hundred checks, a few microseconds. Finding one means searching among far more candidates
   than anyone could check one at a time, and nobody knows a fundamentally better way.
2. **Predict.** Given only a yes/no procedure for "is there an independent set of size thirty",
   how many times must you call it to actually find one? Options: exactly one call; one call,
   then one more per vertex; one call per candidate set; cannot be done with yes/no alone.
   (Correct: one call, then one more per vertex — the self-reduction.)
3. **Reveal — P, NP, certificate, verifier.** A decision problem answers only yes or no. P is
   every decision problem some procedure solves quickly. NP is every decision problem where a
   yes answer comes with a certificate a separate procedure — the verifier — can check quickly.
4. **Consequences of the definitions.** Every problem in P is already in NP, because solving it
   from scratch is itself a valid proof. Whether NP sits inside P too is the open P-versus-NP
   question. NP is an abbreviation for nondeterministic polynomial time, not "not polynomial."
5. **Decision, search, optimization.** The same bin-packing question in three forms, and why the
   theory is built on the decision form: it is the simplest answer to compare and to reduce.
6. **The self-reduction, walked through.** One call confirms a witness of the target size exists;
   then each vertex is tried for removal in turn, kept only if removing it breaks the answer.
   Takeaway here.
7. **The Karp reduction, defined.** A quick function mapping every yes-instance of A to a
   yes-instance of B and every no-instance to a no-instance; to show B is hard, it must run from
   a problem already known to be hard toward the new one, never the reverse.
8. **One worked reduction, checked by exhaustion.** Independent set → vertex cover: the same
   graph, the vertex count minus the target size. Checked on every graph of six vertices or
   fewer and every target size, not merely argued once.
9. **Predict.** A reduction is built the wrong way: a new problem is reduced *to* a known-hard
   one. What does that show? Options: the new problem is just as hard; nothing useful either
   way; the new problem is no harder than the known one; it is not a valid reduction at all.
   (Correct: the new problem is no harder than the known one — the common, botched reading.)
10. **Reveal — the vacuous wrong-direction reduction.** That mistaken direction is not just
    unhelpful, it is empty: any problem solvable quickly reduces this way to almost any target,
    by solving the easy question and outputting one of two fixed, pre-decided instances.
11. **NP-hard, NP-complete.** NP-hard: every problem in NP reduces to it, in the correct
    direction. NP-complete: NP-hard and itself in NP. Both are worst-case, conditional
    statements. Takeaway here.
12. **Cook–Levin, and the list of twenty-one.** Circuit satisfiability is NP-hard, proven with no
    reduction behind it — the one fact the whole chain rests on. Every other classic NP-complete
    problem inherits its hardness through a chain of reductions; the following year's paper
    assembled a list of twenty-one such problems.
13. **NP-hard problems hiding in data systems.** Bin packing is the running example, shown hard.
    A query planner's join-order search space grows exponentially as the table count rises — the
    same shape of blow-up, which a planner has to work around rather than search exhaustively.
14. **What this reel does not do.** One reduction, built and checked completely, stands in for
    the full chain of gadgets that makes every classic NP-complete problem hard. What to actually
    do about a hard problem is still ahead. Takeaway here.
15. **Recap and handoff.** A reduction transfers hardness in one direction, and knowing which is
    the whole subject. Every number met so far was harmless — a count. Give a problem real
    numbers next, and "polynomial" stops meaning one single thing.

**Post-notes headings:** outcomes; internals (why a Karp reduction's direction is the one thing
most often gotten backward, derived from what the definition actually promises; why the
self-reduction's call count is exactly one plus the vertex count, not a coincidence of this
example); lab (the three-SAT → independent set construction from Erickson's chapter, implemented
and checked against brute-force satisfiability on random formulas, exactly the syllabus's own
lab bullet's first half); production (Cook, Karp and Levin's own papers, confirmed via the
Cook–Levin and Karp's-21 Wikipedia pages; PostgreSQL's own documented join-order blow-up);
frontier (the chain of gadgets from Cook–Levin through 3-SAT to independent set, clique,
Hamiltonian cycle and subset sum, named only; fine-grained complexity, named only in topic 108);
next (topic 108, pseudo-polynomial time and strong NP-hardness).

**Bridge:** word for word, Chapter 32 topic 106's handoff, from `registry.ts`: "MapReduce shows
what many machines buy: a job that is a handful of rounds of independent work finishes in a
handful of rounds, however many machines you add. It also shows what they cannot buy. A
computation with a long chain of dependencies still needs that many rounds, and a problem for
which the best known algorithm takes exponential time stays exponential on ten thousand
machines, because dividing exponential work by a million leaves it exponential. This course has
already met such problems, in passing: a join order, a packing, a schedule. The next chapter
says exactly what makes a problem that kind, and how to recognise one before you spend a month
on it. P, NP and polynomial reductions, next."

**Handoff** (word for word, from CHAPTER.md): "A reduction transfers hardness in one direction,
and the whole subject is knowing which. But every problem so far had numbers in it that were
harmless: a vertex count, a clause count. Give a problem real numbers (a capacity, a size, a
weight) and a new question appears that this reel could not ask: the same word 'polynomial'
means two different things depending on whether you measure a number by its value or by how many
digits it takes to write. That is why one NP-complete problem, knapsack, has a dynamic program
that looks fast, and another, bin packing, can never have one unless P equals NP.
Pseudo-polynomial time and strong NP-hardness, next."

**Concept ledger:** introduces `decision-problem`, `search-problem`, `optimization-problem`,
`complexity-class-p`, `complexity-class-np`, `certificate-verifier`, `karp-reduction`,
`reduction-direction`, `np-hard-np-complete`, `p-vs-np-open`, `satisfiability`. Uses
`big-o-theta-omega`, `best-worst-average-case` (Chapter 1), `lower-bound-scope`,
`decision-tree-model` (topic 4). Declares none new beyond its own introduced ids.

**Changes from the chapter plan:**
- The PostgreSQL "Genetic Query Optimizer" page (§61.1) named by the chapter plan for the
  join-order growth fact did not render its body text through the fetcher (only its table of
  contents did). The builder uses the "Controlling the Planner with Explicit JOIN Clauses" page
  instead, which states the same fact in the PostgreSQL documentation's own words: the number of
  possible join orders grows exponentially as the number of tables expands.
- Cook (STOC 1971) and Karp (1972) are confirmed via two Wikipedia pages (the Cook–Levin theorem
  page and the Karp's-21-problems page, both of which cite the original papers and state their
  headline results) rather than by opening the original papers themselves, exactly as CHAPTER.md
  anticipated ("citations from memory, to be verified and read at research time").
- The dollar amount of the Clay Mathematics Institute's prize is not stated on screen: the PDF's
  own rendering of the figure is garbled by the fetcher (a currency symbol and digits dropped
  entirely), and CHAPTER.md says the amount need not be stated unless read cleanly at research
  time.
- The syllabus's own Lab bullet's second half ("time exact solutions as instance size grows") is
  not built: it depends on a SAT solver library, and the chapter plan's own "Notes for the
  release run" names this as resting on the skipped gadget topic. The first half — the
  three-SAT → independent set construction, checked against brute-force satisfiability — is
  built in `examples.py` and named in post-notes.
