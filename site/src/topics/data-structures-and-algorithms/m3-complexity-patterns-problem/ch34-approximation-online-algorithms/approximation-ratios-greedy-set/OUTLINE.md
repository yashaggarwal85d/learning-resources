# OUTLINE: Approximation ratios and greedy set cover

A full topic, about 14 minutes. First topic of Chapter 34. Every count below is computed
and asserted directly in `examples.py`.

## Learning outcomes

1. State what an approximation ratio promises (a multiplicative worst-case bound against
   the optimum, proved, not measured) and what it does not (nothing about any one input
   being close to that bound).
2. Prove and compute greedy set cover's harmonic-number bound on a concrete family, and
   explain why the bound is tight (it is not a weak proof; Feige's threshold makes it
   essentially the best any polynomial algorithm can do).
3. Prove and compute the maximal-matching 2-approximation for vertex cover, and name the
   one trick both proofs share: compare your own answer to a quantity you can compute in
   polynomial time that is itself a lower bound on OPT.
4. Tell the two guarantees apart by their shape: one grows with the input (log n), one
   does not (a flat constant), even though both are "approximation ratios."

## Storyboard

1. **Hook.** Chapter 33 ended on NP-hard problems with no exact polynomial algorithm in
   sight, unless P = NP. The job still ships. Set cover — pick the fewest sets from a
   collection that together cover every element — is one of them, declared NP-hard here
   (no live DSA topic introduces `np-hard-np-complete` yet; this topic states it in one
   line and moves on, per CHAPTER.md's own fallback). A cheap rule, "always pick the set
   that covers the most elements still missing," cannot find the optimum, but it comes
   with something almost as good: a *proof*, in advance, of how far from the optimum it
   can ever land.
2. **What an approximation ratio actually promises.** A multiplicative bound against the
   optimum, proved for every instance, not measured on a few. The contrast the chapter
   will keep needing: this is not a heuristic's "works well in practice" — it's a theorem.
   (Wikipedia, "Approximation algorithm": "approximation algorithms are efficient
   algorithms that find approximate solutions to optimization problems ... with provable
   guarantees on the distance of the returned solution to the optimal one.")
3. **Greedy set cover, the rule and the charge.** At each step, pick the set covering the
   most still-uncovered elements (Wikipedia, "Set cover problem": "at each stage, choose
   the set that contains the largest number of uncovered elements"). The proof charges
   each newly covered element 1/(size of the gain that covered it); summed over one set's
   elements, those charges telescope into a harmonic sum, so the total picks are bounded
   by H(s), the harmonic number of the largest set's size.
4. **Predict.** On a family built from two "row" sets plus k geometrically growing
   "block" sets (optimum always 2: the two rows), does greedy's ratio against the optimum
   stay bounded by some fixed constant as k grows, or does it grow with k? (It grows: at
   k = 3, 5, 8, 12 the universe has 28, 124, 1,020, 16,380 elements and greedy needs
   exactly 3, 5, 8, 12 picks against an optimum of 2 — ratios 1.5, 2.5, 4.0, 6.0, tracking
   ln(n) = 3.33, 4.82, 6.93, 9.70 upward. A constant-factor guarantee is not available here,
   full stop — not a limitation of this proof, a fact about the problem.)
5. **The measured family, shown.** The four instances side by side: n, greedy's picks,
   the ratio, and ln(n) alongside it — the ratio rides under ln(n) + 1 exactly as the
   harmonic bound promises, at every one of the four scales measured.
   *Takeaway:* "Greedy set cover's ratio isn't a flat number — it grows with ln n, and a
   family exists at every scale that makes it do exactly that."
6. **The bound is essentially the best possible.** Feige (1998) proved no polynomial
   algorithm beats (1 − ε)ln(n) unless P = NP (cited, not reproduced): greedy's harmonic
   bound is not a weak proof waiting to be improved — within lower-order terms, it is the
   ceiling.
7. **Switch problems: vertex cover.** Pick the fewest vertices that touch every edge.
   Also NP-hard (declared, same fallback as step 1). The same style of proof — a
   computable lower bound on OPT — gives a very different *shape* of guarantee this time.
8. **The maximal-matching construction and its proof.** Find any maximal matching M (a
   greedy scan: take an edge, remove both its endpoints and every edge touching them,
   repeat); let C be every endpoint of every edge in M (Wikipedia, "Vertex cover": "we
   find a maximal matching M with a greedy algorithm and construct a vertex cover C that
   consists of all endpoints of the edges in M"). Two short facts finish the proof: C
   covers every edge, because M is maximal (Wikipedia: "suppose that an edge e is not
   covered by C; then M ∪ {e} is a matching ... a contradiction"); and OPT itself must
   contain at least one endpoint of every edge in M, because M's edges share no endpoints
   — so |M| ≤ OPT, and C has exactly 2|M| vertices, at most 2·OPT.
9. **Predict.** Is the factor-2 bound ever actually attained, or only a worst-case
   artifact that real graphs avoid? (Attained exactly: on K_{6,6}, every maximal matching
   has 6 edges, the constructed cover has all 12 endpoints, and the true optimum is 6 —
   every vertex of one side alone covers every edge. Ratio exactly 2.0, measured, not
   approached in a limit.)
10. **Checked against a brute-force optimum, not just the tight example.** 60 random
    graphs of 4-13 vertices, matching and cover built by the greedy rule, optimum found by
    brute force: |M| ≤ OPT and the cover ≤ 2·OPT held on every single one, worst observed
    ratio 2.0 — the bound is not a special case of K_{m,m}, it is the actual ceiling on
    ordinary graphs too.
    *Takeaway:* "Every proof in this chapter follows the same trick: find a quantity you
    can compute in polynomial time that's a lower bound on OPT, then compare your answer
    to that, never to OPT itself."
11. **The two guarantees, side by side.** Set cover's ratio grows with the input (log n);
    vertex cover's does not (a flat 2). Both are "approximation ratios," both are proved
    the same way, and telling them apart by their *shape*, not just their number, is the
    skill this topic is really teaching.
12. **Recap and handoff.** A proof that bounds your answer against a computable
    lower bound on OPT. Two more guarantees of the same shape come next — first-fit-
    decreasing for bin packing and longest-processing-time for scheduling, on the two
    problems Chapter 33 named NP-hard without an exact answer. Bin packing and makespan
    scheduling, next.

## Why no compiled benchmark

Every count here — the growing-ratio family's sizes and greedy picks, the harmonic
numbers, the K_{6,6} matching/cover sizes, the 60-trial random-graph check against a
brute-force optimum — is a small, deterministic computation checked directly in Python
(`examples.py`); nothing here needed a real system's source code, so there is no
real-system claim to verify beyond the two Wikipedia pages' own stated theorems, which
are cross-checked by the direct proof derivation, not taken on faith.

## Concept ledger

- **Introduces:** `approximation-ratio`, `greedy-set-cover`, `harmonic-bound-charging`,
  `maximal-matching-vertex-cover`, `lower-bound-on-opt`.
- **Uses:** `big-o-theta-omega`, `amortized-cost` (Chapter 1, live); `binary-heap`
  (Chapter 6, live, for the bucket-queue implementation named in passing).
- **Declared** (the introducing chapter's plan exists but no topic is live yet, so this
  topic states each in one line and does not re-teach it): `np-hard-np-complete`,
  `karp-reduction`, `reduction-direction`, `strong-np-hardness` (Chapter 33's vocabulary;
  every proof here starts from "this is NP-hard, so no exact polynomial algorithm unless
  P = NP"); `maximal-vs-maximum-matching`, `vertex-cover` as a decision problem (Chapter
  20, not live — this topic declares the maximal/maximum distinction itself, citing
  Wikipedia's "Matching (graph theory)" page, and moves the id to `uses` once Chapter 20
  ships); `lower-bound-scope`, `adversary-argument` (Chapter 1 topic 4 — **checked: topic
  4 is not live either** in the current registry, so declared here too, in one line, for
  the "a lower bound you can compute" idea this topic and topic 112 both lean on).

## Bridge and handoff

- **Bridge from Chapter 33** (declared, not live — see above): the chapter's last word is
  that an NP-hard problem has no exact polynomial algorithm unless P = NP. This topic
  opens on exactly that, restated in one line, then moves to what an engineer does next.
- **Handoff to topic 110** (bin packing and makespan scheduling): the same lower-bound
  trick, applied to two problems Chapter 33 names, with a different proof shape again
  (an additive constant on top of a ratio).

## Changes from the chapter plan

- Chapters 32, 33 and 20 (whose concept ids this topic's plan expected to `use`) are not
  live in the registry as of this build (confirmed via `next-topic.mjs dsa --all`: the
  live cursor sits at Chapter 15). Every id CHAPTER.md listed as conditional on those
  chapters is declared here instead, exactly as CHAPTER.md's own "Ids not introduced by
  any live DSA topic" section anticipates.
- The set cover ratio statement on Wikipedia's "Set cover problem" page renders as
  stripped MathML in the plain-text fetch (the formula doesn't survive HTML-to-text
  extraction) — the ratio's value (H(s), the harmonic number) is read from the rendered
  page by eye and verified independently by deriving and checking the bound directly in
  `examples.py`, rather than quoted as a broken formula fragment. See `SOURCES.md`.
