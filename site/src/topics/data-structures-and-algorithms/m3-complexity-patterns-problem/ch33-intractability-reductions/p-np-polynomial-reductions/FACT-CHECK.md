# Fact-check — dsa.p-np-polynomial-reductions

| # | Claim | Status | Source |
|---|---|---|---|
| 1 | P is the set of decision problems solvable in polynomial time | Confirmed | SOURCES.md §1 |
| 2 | NP is the set of decision problems where a yes answer has a certificate checkable in polynomial time | Confirmed | SOURCES.md §1 |
| 3 | Every problem in P is also in NP | Confirmed | SOURCES.md §1 |
| 4 | NP is an abbreviation for Nondeterministic Polynomial-time, not "not polynomial" | Confirmed | SOURCES.md §1 |
| 5 | A Karp (many-one) reduction is the standard definition complexity theorists prefer for NP-hardness | Confirmed | SOURCES.md §1 |
| 6 | Formally, no optimization or construction problem is Karp-NP-hard (many-one reductions apply only to decision problems) | Confirmed | SOURCES.md §1 |
| 7 | The Cook–Levin theorem: circuit satisfiability is NP-hard | Confirmed | SOURCES.md §1 |
| 8 | An independent set's complement is a vertex cover of the same graph, and vice versa | Confirmed | SOURCES.md §1 |
| 9 | The 3-SAT → independent set construction: one vertex per literal, a triangle per clause, an edge between a variable and its negation | Confirmed | SOURCES.md §1 |
| 10 | The Clay Mathematics Institute lists P-versus-NP as the first of its seven Millennium Prize Problems | Confirmed | SOURCES.md §1 |
| 11 | PostgreSQL's planner: the number of possible join orders grows exponentially as the number of tables expands | Confirmed | SOURCES.md §2 |
| 12 | Bin packing's decision form is NP-complete | Confirmed | SOURCES.md §3 |
| 13 | Bin packing is strongly NP-complete, by reduction from the strongly NP-complete 3-partition problem | Confirmed | SOURCES.md §3 |
| 14 | Cook (1971) published "The complexity of theorem proving procedures"; Karp's 1972 paper supplied a list of 21 NP-complete problems and the many-one-reduction notion of completeness | Confirmed (via tertiary source, per CHAPTER.md's own instruction) | SOURCES.md §4 |
| 15 | Karp's 1972 paper, "Reducibility Among Combinatorial Problems," used Cook's 1971 theorem to show 21 problems are NP-complete | Confirmed (via tertiary source) | SOURCES.md §5 |
| 16 | Karloff, Suri and Vassilvitskii / Kleinberg and Tardos / Garey and Johnson / CLRS: named as alongside references, not opened | Not independently verified; named only, per the chapter plan | Not opened; see SOURCES.md's "Named, not read" note |
| 17 | Every numeric claim on screen (the candidate count and verify cost for n=sixty/k=thirty, the self-reduction's call count, the Karp-reduction exhaustive check's zero mismatches, the vacuous-reduction check, the 3-SAT lab check) | Confirmed by direct computation | `examples.py`, run and asserted |

## Red team

- **Does the self-reduction actually produce a valid witness, or is the call count merely
  asserted?** `examples.py` runs the construction on ten random twelve-vertex graphs, and for
  each one asserts both that the returned set has the target size and that it is genuinely
  independent (no edge between any two of its members) — not merely that the call count matches.
- **Is the independent-set-to-vertex-cover reduction checked completely, or only on a handful of
  examples?** The check runs on every graph on one through six vertices (every edge subset) and
  every target size from zero through the vertex count, confirming the iff in both directions on
  every single instance, not a sample.
- **Is the vacuous wrong-direction reduction a genuine reduction, or a strawman?** It is checked
  the same way a real reduction would be: the mapped answer (from a fixed, pre-decided
  independent-set instance) is compared against the true answer to the original two-colourability
  instance across twenty random graphs, and the two always agree — the reduction is valid by the
  letter of the definition, which is exactly the point: validity alone proves nothing about
  hardness.
- **Is the 3-SAT → independent set lab reduction a faithful instance of Erickson's construction,
  or a simplification?** It is the construction exactly as read from the source (one vertex per
  literal occurrence, an edge within each clause's three literals and an edge between a variable
  and its negation), checked against brute-force satisfiability on thirty random three-CNF
  formulas with four variables and four clauses each — small enough for brute force to be
  trustworthy, large enough to exercise both a satisfiable and an unsatisfiable case across the
  random sample.
- **Predict-distractor plausibility.** Step 2's distractors ("exactly one call," "one call per
  candidate set," "cannot be done") each describe a different, plausible but wrong intuition
  about what a decision-only oracle can and cannot do; the correct answer is exactly the
  self-reduction the next few steps build and run for real. Step 9's distractors test the exact
  reverse of the common mistake the topic is built around — "shows only that the new problem is
  no harder" is the correct, least intuitive answer, and "proves nothing useful either way" is
  the closest tempting wrong answer, since a reduction in the wrong direction does establish
  *something*, just not hardness.
- **Does the topic overclaim about Cook, Karp or Levin's original papers?** No specific sentence
  is attributed to the 1971 or 1972 papers themselves; every attribution is sourced to one of two
  Wikipedia pages that themselves cite and summarize the originals, and the topic's own text says
  "confirmed via a tertiary source" in its internal documentation rather than claiming to have
  read the originals.
