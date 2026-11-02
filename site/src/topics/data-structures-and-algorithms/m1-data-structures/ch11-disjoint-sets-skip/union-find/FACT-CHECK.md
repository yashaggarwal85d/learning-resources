# Fact-check — dsa.union-find

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | A naive parent-pointer union (no rank, no size, no compression) can build a chain of n nodes, so `Find` is Θ(n) in the worst case. | Erickson, *Algorithms*, Lecture 11 | Verified, quoted |
| 2 | Union by depth/rank bounds a set's size to at least 2^depth(leader); since there are only n elements, the maximum depth is lg n, so both `Find` and `Union` run in Θ(log n) worst case under this rule alone. | Erickson, Lecture 11 | Verified, quoted (Erickson's induction proof, not re-derived from scratch) |
| 3 | With union by rank and path compression, `Find` runs in O(α(n)) amortized time. | Erickson, Lecture 11 (citing Seidel and Sharir's top-down analysis) | Verified, quoted |
| 4 | The matching Ω(α(m,n)) lower bound holds for any pointer-based disjoint-set structure; the proof is attributed to Tarjan. | Erickson, Lecture 11, footnote | Verified, quoted (footnote names author/title/journal; the footnote's own proof is out of scope of the lecture and of this topic) |
| 5 | The amortized cost of weighted quick-union with path compression is bounded by the inverse Ackermann function and is less than 5 for any conceivable value of n that arises in practice. | Sedgewick-Wayne, booksite §1.5 | Verified, quoted |
| 6 | Plain path compression on (unweighted) quick-union already gives a logarithmic amortized cost by itself. | Sedgewick-Wayne, booksite §1.5 | Verified, quoted |
| 7 | α(n) ≤ 3 "for all even remotely imaginable values of n," under Erickson's own exact definition of α (which differs by a small additive/compositional offset from the plain inverse-Ackermann function Sedgewick-Wayne bounds at < 5). | Erickson, Lecture 11 | Verified, quoted; **not used as the on-screen number** — see below |
| 8 | Path halving and splitting are one-pass alternatives to two-pass path compression, and the chapter plan's claim that they "carry the same O(α(n)) bound" traces to Tarjan and van Leeuwen 1984. | Chapter plan (CHAPTER.md), citing Tarjan and van Leeuwen 1984 | **Dropped** — paper is ACM-paywalled, no free text found; see Changes below |
| 9 | Galler and Fischer (1964) introduced the parent-pointer forest structure this topic draws. | Chapter plan, citing Galler and Fischer 1964 | **Named only, not quoted** — paper is ACM-paywalled |
| 10 | On the chapter-10 edge list (A,B,4)(A,C,2)(A,B,7)(B,C,3)(B,D,5)(C,D,1)(C,E,6)(D,E,2)(D,F,8)(E,F,3), fed in that order, exactly five edges merge two components and five find both endpoints already together. | This topic's own examples.py, run against ch10's own edge list | Measured in this sandbox |
| 11 | On the same edge list sorted by weight (Kruskal's order), the five edges accepted (merging components) are C–D, A–C, D–E, B–C, E–F. | This topic's own examples.py | Measured in this sandbox |

## Currency check

- Both fetched sources are read live at research time (31 October 2026): Erickson's notes carry
  their own "most recent revision" pointer and a 2018 copyright on the PDF itself (the lecture
  content — union-by-rank, path compression, the Ackermann hierarchy — is classical and has not
  changed; nothing here depends on a version number the way a software README would).
  Sedgewick-Wayne's booksite page is the 4th-edition companion, likewise classical content, no
  version drift risk.
- The chapter plan's own citation path for Erickson's notes (`.../notes/08-unionfind.pdf`) 404s;
  the live path is `.../notes/11-unionfind.pdf` (same author, same lecture, renumbered). Recorded
  in SOURCES.md so a later topic citing the same notes doesn't repeat the dead link.
- Tarjan 1975, Tarjan-van Leeuwen 1984 and Galler-Fischer 1964 are all behind the ACM Digital
  Library paywall; no preprint, author copy or free mirror was found for any of the three. Per the
  skill's "a source you could not open doesn't count" rule, no claim is sourced to them beyond
  what Erickson's notes independently quote and attribute (claim 4's lower bound, properly
  attributed through Erickson's own footnote, not through reading Tarjan 1979 directly either).

## Red team

1. **Does claim 2's "union by depth" really mean the same thing as the chapter plan's "union by
   rank"?** Erickson's depth-based rule and the standard rank-based rule differ in a technical
   detail (depth of the *shallower* tree's root changes on a tie; rank tracks an upper bound on
   depth rather than depth itself, so it stays correct even after compression changes real depths),
   but the bound and proof shape are the same, and Erickson's notes present "union by rank" by that
   exact name a few pages later as the version used with path compression (the depth version is
   presented first, without compression, as the simpler case). The reel teaches rank, as the
   chapter plan asks, and cites Erickson's depth proof as the same argument under the name he uses
   for the no-compression case.
2. **Is "α(n) < 5" (claim 5) in tension with "α(n) ≤ 3" (claim 7)?** They are not the same function:
   Sedgewick-Wayne's "< 5" is the plain inverse-Ackermann bound as usually stated for union-find's
   amortized cost; Erickson's "≤ 3" is for his own α(n), which he defines as offset by 2 from the
   third row of the Ackermann hierarchy — a different exact function with a looser classical
   constant attached by convention. Showing a specific number on screen without naming which
   exact function it bounds would be a precision error, so the reel uses Sedgewick-Wayne's
   number (the one the chapter plan's own placeholder already anticipated, "to verify") and drops
   Erickson's differently-defined constant rather than picking one arbitrarily or stating both and
   confusing the viewer.
3. **Counter-example check on the adversarial chain (step 1/3 of the storyboard):** does *any*
   union order on n elements under the naive rule give a chain, or only a specific one? Erickson's
   own worst-case construction (`WorstCaseSequence`: always union the new singleton into the
   existing set) gives a chain in the threaded-tree version; for the plain parent-pointer version
   taught here, the equivalent adversarial order is "always make the newest tree's root the parent
   of the oldest tree's root," verified directly in examples.py on 16 elements (depth reaches 15).
   Not every order gives a chain — a balanced merge order gives O(log n) depth even with no rule at
   all — which the narration states explicitly in step 3 so the predict's wrong answer ("structures
   are usually balanced") is addressed, not just marked wrong.
4. **Does the entity-resolution use (step 8) overstate what union–find alone decides?** No: the
   claim is narrowly that union–find performs the merge *once a match decision is already made*,
   and the over-merge limit (no `Split`) is stated as the reason matching, blocking and
   golden-record logic belong to Data Engineering §8.3, not to this topic — consistent with
   CHAPTER.md's own scope line pointing there by name.

## Corrections applied to OUTLINE.md

- Dropped the "halving and splitting carry the same bound (Tarjan and van Leeuwen 1984)" claim;
  kept the one-pass definitions themselves (they follow from the algorithms, not from the paper).
- Replaced the chapter plan's placeholder "α(n) is at most 4" with "under 5," Sedgewick-Wayne's
  exact quoted constant, and noted why Erickson's "≤ 3" is a different function rather than a
  disagreement.
- No other claim required a correction; the storyboard in OUTLINE.md already reflects both fixes.
