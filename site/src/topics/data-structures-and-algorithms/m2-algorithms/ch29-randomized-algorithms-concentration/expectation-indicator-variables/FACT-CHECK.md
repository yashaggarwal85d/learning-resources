# Fact-check — dsa.expectation-indicator-variables

| # | Claim | Status | Source |
|---|---|---|---|
| 1 | Linearity of expectation: E[X + Y] = E[X] + E[Y] for any random variables X and Y, with no independence required | Confirmed | SOURCES.md §2 |
| 2 | E[XY] = E[X]·E[Y] requires X and Y independent — a different property from linearity, which needs none | Confirmed | SOURCES.md §2 |
| 3 | The expected number of fixed points of a uniform random permutation of n items is exactly 1, for every n ≥ 1 | Confirmed | SOURCES.md §4 |
| 4 | That result follows from linearity of expectation over n indicator variables, each with probability 1/n | Confirmed | SOURCES.md §4 |
| 5 | Randomized quicksort: two ranked elements i < j are compared iff the first pivot chosen from the j − i + 1 elements ranked between them is one of the two endpoints, giving Pr = 2/(j − i + 1) | Confirmed | SOURCES.md §3 |
| 6 | Summing that probability over every pair gives the exact expected comparison count 2(n + 1)Hₙ − 4n | Confirmed | SOURCES.md §3 |
| 7 | That closed form agrees with the live topic `dsa.asymptotic-notation`'s own recurrence-based derivation of the same expression | Confirmed by direct comparison | `asymptotic-notation`'s `OUTLINE.md`/`post-notes.md` (grepped: states 2(n+1)Hₙ − 4n, measures 10,986 at n=1,000 — this topic's own 10,985.91 agrees to rounding) |
| 8 | 2(n+1)Hₙ − 4n is bounded above by 2n log n = O(n log n) | Confirmed | SOURCES.md §3 |
| 9 | Coupon collector: expected number of draws with replacement to see all n coupons is n·Hₙ | Confirmed | SOURCES.md §1 |
| 10 | That result follows by splitting the wait into n geometric phases and summing by linearity | Confirmed | SOURCES.md §1 |
| 11 | n = 50 gives about 225 expected draws | Confirmed | SOURCES.md §1 |
| 12 | The expected number of trials in the coupon collector problem grows as Θ(n log n) | Confirmed | SOURCES.md §1 |
| 13 | Sattolo's variant of Fisher–Yates (random index strictly below i, not ≤ i) produces a single-cycle permutation and therefore has zero fixed points | Confirmed | SOURCES.md §5 |
| 14 | Quicksort expectation (24.44, 647.85, 10,985.91), the 200-run simulation (10,978), 2n ln n (13,816), coupon-collector expectation (29.3, 225.0, 2,364.6) and its 2,000-run simulation (226.4), the fixed-point simulation (1.001 over 20,000 ten-item shuffles), Sattolo's zero fixed points (20,000 four-item runs), and the urn linearity check (1.2, matching an exhaustive enumeration) | Confirmed by direct computation | `examples.py`, run and asserted |

## Red team

- **Is the quicksort "pair" argument double-counting anything?** Each unordered pair {i, j}
  with i < j is counted exactly once in the sum `Σ_{1≤i<j≤n} 2/(j−i+1)` (the sum runs over
  pairs, not ordered pairs), and X_ij is defined as a single 0/1 indicator for that pair being
  compared — not once per comparison. Verified against `quicksort_comparisons` in
  `examples.py`, which counts actual comparisons during a real (randomized) partition run, not
  via the indicator sum, and the simulated mean (10,978 over 200 runs) lands within normal
  sampling noise of the exact 10,985.91 computed independently from the closed form. Two
  different computations, same answer: the pair argument is not over- or under-counting.

- **Does the fixed-point result actually need "no independence," or is it a red herring?**
  Checked directly: are the indicators I_1 (position 1 fixed) and I_2 (position 2 fixed)
  independent for a uniform random permutation of 4 items? Pr[I_1 = 1] = 1/4. Pr[I_1 = 1,
  I_2 = 1] = 2!/4! = 1/12 ≠ 1/4 × 1/4 = 1/16. They are not independent (1/12 ≠ 1/16), so this
  is a genuine example of linearity holding across dependent terms, not an accidental case of
  disguised independence.

- **The urn example's exact match is not a coincidence of rounding.** `examples.py` computes
  the expected count of red balls in two draws without replacement two ways: by linearity
  (Pr[X1 red] + Pr[X2 red] = 3/5 + 3/5 = 1.2, using the fact that the second draw's marginal
  probability of being red is still 3/5 by symmetry even though it depends on the first draw)
  and by exhaustively enumerating all 5×4 = 20 ordered two-draw sequences and averaging the red
  count directly. Both give exactly 1.2 (`assert abs(...) < 1e-9`), a hard equality check, not
  a simulation that could land close by chance.

- **Predict-distractor plausibility.** Step 2's wrong options (n log₂ n, n²/4, "exactly
  n log₂ n + n") are each a plausible guess: n log₂ n is the comparison-sort lower bound a
  learner might over-apply here; n²/4 is what a learner expecting quicksort's *worst* case
  might guess; "exactly n log₂ n + n" is a specific-looking wrong answer with no basis. The
  correct option (2n ln n, to first order) is stated as an approximation, not the exact value,
  because the exact value (10,985.91) is what the reveal actually derives — the predict asks
  for the right order of growth, and the reveal supplies the exact correction on top of it.

- **The coupon-collector phase argument's probability.** Phase i (after i − 1 distinct coupons
  seen) succeeds when a draw lands on one of the n − (i − 1) unseen coupons, probability
  (n − i + 1)/n — checked against `coupon_collector_simulate`'s direct draw-until-complete loop
  at n = 50 over 2,000 runs (mean 226.4), consistent with the exact 225.0 within normal
  sampling noise for a sum of n geometric variables whose own variances also sum.
