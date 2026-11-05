# FACT-CHECK: Bin packing and makespan scheduling

Self-review as adversarial fact-checker, 2026-11-05.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Bin packing is NP-hard; its decision version is NP-complete. | Confirmed | `sources/bin-packing-wikipedia.txt`: "Computationally, the problem is NP-hard, and the corresponding decision problem... is NP-complete." |
| 2 | First-Fit-Decreasing sorts items descending, then runs First-Fit. | Confirmed | Same source: "First-fit-decreasing (FFD) orders the items by descending size, then calls First-Fit." |
| 3 | FFD(I) ≤ 11/9·OPT(I) + 6/9, and this bound is tight (Dósa 2007). | Confirmed, independently re-derived | The formula itself renders as stripped MathML; confirmed word for word from the citation's own title ("...FFD(I) ≤ 11/9OPT(I) + 6/9"), and independently re-derived in `examples.py`: the standard 30-item tight family gives FFD = 11 against a volume lower bound of 9, consistent with (not a proof of) OPT = 9. |
| 4 | A small instance exists where FFD is strictly non-optimal and the true optimum is provable by brute force. | Confirmed by direct computation | `examples.py`: items [3, 6, 5, 3, 4, 5, 3, 5], capacity 12 — FFD uses 4 bins, brute force proves the optimum is 3. |
| 5 | LPT sorts jobs descending, assigns each to the least-loaded machine; order is the only difference from plain list scheduling. | Confirmed | `sources/lpt-wikipedia.txt`: "Order the jobs by descending order... Schedule each job in this sequence into a machine in which the current load... is smallest," and "the difference is that LS loops over the jobs in an arbitrary order, while LPT pre-orders them." |
| 6 | LPT's makespan bound is 4/3 − 1/(3m), proved by Graham (1969), and Graham's own family attains it exactly. | Confirmed, independently re-derived | Formula renders as stripped MathML; value re-derived directly: `examples.py`'s Graham family at m = 2, 3, 4, 5 gives ratios 1.1667, 1.2222, 1.25, 1.2667 against brute-force-verified optima, each matching 4/3 − 1/(3m) to floating-point precision. |
| 7 | Identical-machines scheduling is NP-hard, by reduction from the partition problem. | Confirmed | `sources/multiprocessor-scheduling-wikipedia.txt`: "is NP-hard even for identical machines, by reduction from the partition problem." |
| 8 | Arbitrary-order list scheduling's bound is 2 − 1/m, strictly worse than LPT's 4/3 − 1/(3m) for m > 1. | Confirmed, independently re-derived | Formula renders as stripped MathML; re-derived directly on the classic worst-case instance (m(m−1) unit jobs then one job of size m): `examples.py` gives ratio exactly 1.5 at m = 2 and 1.6667 at m = 3, matching 2 − 1/m exactly (brute-force-verified optimum); LPT on the identical job set finds the true optimum instead. |
| 9 | Apache Spark's `FilePartition.scala` implements "Next Fit Decreasing," not First-Fit-Decreasing. | Confirmed | `sources/spark-filepartition.txt`: the comment "// Assign files to partitions using 'Next Fit Decreasing'" directly precedes the close-partition-on-overflow loop, which only ever checks the *current* (most recent) partition, never earlier ones — the defining difference from First-Fit, which checks every open bin. |
| 10 | The 11/9 FFD guarantee does not automatically transfer to Spark's next-fit relative. | Confirmed by direct comparison, with a caveat | `examples.py`: on the one skewed instance tested, Spark's next-fit variant and true FFD (with the same open-cost accounting) both used 7 partitions — they tied on this instance, so it does not itself demonstrate a gap; the claim that next-fit *can* do strictly worse than FFD on other inputs is a known general property of next-fit algorithms (cited, not independently reproduced here), and the topic states the distinction without implying this one instance proves it. |

## Red team

- **Could the Johnson family's FFD run (11 bins) depend on epsilon's exact value
  (1/100)?** No: `examples.py` uses exact fractions throughout (`fractions.Fraction`),
  and the comparisons in FFD's bin-fitting logic only depend on the *ordering* and
  *relative* sizes the construction guarantees (one half plus epsilon exceeds any pair of
  the smaller items, etc.), which holds for any sufficiently small positive epsilon —
  verified by re-running the same script with epsilon = 1/1000 (not committed, confirmed
  the same 11-bin result during this fact-check pass).
- **Could the Graham family's exact brute-force optimum be wrong for m = 5 (48 million
  assignments checked)?** The brute force is a complete enumeration (`itertools.product`
  over all machine assignments), not a heuristic — it is slow, not approximate, so a
  wrong answer would require a logic bug, not an incomplete search. Cross-checked against
  the closed-form optimum CHAPTER.md's own planning table states (6, 9, 12, 15 for
  m = 2, 3, 4, 5) — exact match.
- **Near-miss checked:** confusing LPT (which sorts first) with plain list scheduling
  (which doesn't) is the easiest error in this topic — step 8 of the storyboard runs both
  on the *identical* job set specifically to make the one difference (sorted or not)
  the only variable, rather than comparing across different instances.

## Corrections applied to OUTLINE.md

None — every claim held on re-derivation; no correction was needed this pass.
