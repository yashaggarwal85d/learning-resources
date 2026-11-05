# FACT-CHECK: Approximation ratios and greedy set cover

Self-review as adversarial fact-checker, 2026-11-05. Each claim re-derived from the
fetched source texts in `sources/` or from `examples.py`'s own direct computation.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | An approximation algorithm's guarantee is a proved multiplicative worst-case bound, not an empirical one. | Confirmed | `sources/approximation-algorithm-wikipedia.txt`: "approximation algorithms are efficient algorithms that find approximate solutions to optimization problems ... with provable guarantees on the distance of the returned solution to the optimal one," contrasted with "heuristics such as annealing or genetic algorithms, which find reasonably good solutions on some inputs, but provide no clear indication at the outset on when they may succeed or fail." |
| 2 | Greedy set cover's rule is "pick the set covering the most uncovered elements." | Confirmed | `sources/set-cover-wikipedia.txt`: "at each stage, choose the set that contains the largest number of uncovered elements." |
| 3 | Greedy set cover's running time is linear in the sum of input set sizes via a bucket queue. | Confirmed | Same source: "This method can be implemented in time linear in the sum of sizes of the input sets, using a bucket queue to prioritize the sets." Not independently re-implemented with a bucket queue in `examples.py` (the examples use a simple O(elements × sets) scan, adequate at this topic's small scale); the reel states the running-time claim as the source's own, not as a measured number. |
| 4 | Greedy's approximation ratio is H(s), the harmonic number of the largest covered set's size, and this can grow without bound as the family scales. | Confirmed and independently re-derived | The source's own ratio formula renders as stripped MathML in the plain-text fetch (see `OUTLINE.md` → "Changes from the chapter plan"), so the ratio's growth is re-derived directly: `examples.py`'s growing-ratio family gives greedy picks 3, 5, 8, 12 against an optimum of 2 (ratios 1.5, 2.5, 4.0, 6.0) at n = 28, 124, 1,020, 16,380, strictly increasing and tracking ln(n) = 3.33, 4.82, 6.93, 9.70 upward — a direct, asserted demonstration that no fixed constant bounds the ratio. |
| 5 | Feige (1998) proved the ln(n) bound is essentially the best any polynomial algorithm can achieve (no (1 − ε)ln(n) approximation unless P = NP). | Confirmed (citation only, not reproduced) | `sources/set-cover-wikipedia.txt`'s reference list: "Feige, Uriel (1998), 'A threshold of ln n for approximating set cover', Journal of the ACM, 45 (4): 634–652." The reel states this as the source's citation, not as a proof derived here — the inapproximability proof itself (a PCP-based reduction) is out of scope for this topic, named only. |
| 6 | Vertex cover is NP-hard, and no better than factor-2 approximation is known for general graphs (and none below 2 exists if the unique games conjecture holds). | Confirmed | `sources/vertex-cover-wikipedia.txt`: "It is NP-hard... it cannot be approximated up to a factor smaller than 2 if the unique games conjecture is true. On the other hand, it has several simple 2-factor approximations," and later, "No better constant-factor approximation algorithm than the above one is known." |
| 7 | The endpoints of any maximal matching form a vertex cover, and that cover is at most 2× the optimal cover. | Confirmed | Same source: "The endpoints of any maximal matching form a vertex cover," with the proof quoted in full in `SOURCES.md` ("suppose that an edge e is not covered by C... a contradiction," and "an optimal cover contains at least one endpoint of each edge in M; in total, the set C is at most 2 times as large as the optimal vertex cover"). |
| 8 | On K_{m,m}, the factor-2 bound is attained exactly, not just approached. | Confirmed by direct computation | `examples.py`: for m = 6, every maximal matching found has exactly 6 edges, the constructed cover has 12 vertices, and the true optimum (one side's 6 vertices) is 6 — ratio exactly 2.0, asserted. |
| 9 | The 2-approximation bound holds on graphs in general, not only the K_{m,m} tight example. | Confirmed by direct computation | `examples.py`: 60 random graphs of 4-13 vertices, cover and matching built greedily, optimum found by brute force; `assert len(cover) <= 2 * len(optimum)` holds on every trial (worst observed ratio 2.0, never exceeded). |
| 10 | "Maximal" and "maximum" matching are different, and the vertex cover proof needs only the cheaper (maximal) one. | Confirmed | `sources/matching-wikipedia.txt`: "A maximal matching is a matching M of a graph G that is not a subset of any other matching," and "Every maximum matching is maximal, but not every maximal matching is a maximum matching" — the vertex cover construction (step 8 of the storyboard) explicitly uses a maximal matching "found by a greedy algorithm," never the harder maximum matching. |

## Red team

- **Could the growing-ratio family's greedy choice ever pick a row set first instead of a
  block?** No: at every step the largest remaining block (size 2^j for the largest
  unpicked j) exceeds either row set's remaining gain (at most 2^(j+1) − 2, since a row
  set's elements not yet in a picked block total less than the full next block) —
  verified directly by `examples.py`'s `greedy_set_cover`, which always selects by
  maximum current gain and is asserted to return exactly the k blocks, never a row.
- **Could a maximal matching found by a different greedy order give a worse-than-2×
  cover?** `examples.py` shuffles the edge order with five different random seeds across
  the 60 trials and the K_{6,6} case; the ≤ 2·OPT bound held regardless of which maximal
  matching the shuffle happened to find, consistent with the proof (it holds for *every*
  maximal matching, not a specially chosen one).
- **Near-miss checked:** a *minimum* maximal matching (the smallest matching that is
  still maximal, not literally "any" one) could in principle give a smaller cover than
  2·OPT, but it is also harder to find; the topic's claim and `examples.py` both use an
  arbitrary (greedily, cheaply found) maximal matching, matching the source's own
  "greedy algorithm" framing, not the harder minimum-maximal variant.

## Corrections applied to OUTLINE.md

None — every claim in the storyboard held on re-derivation; no correction was needed
this pass.
