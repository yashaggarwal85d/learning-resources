# Storyboard — dsa.expectation-indicator-variables

**Learning outcomes** (from CHAPTER.md):
1. Write a count as a sum of indicator variables and compute its expectation without caring how
   the indicators depend on each other.
2. Reproduce the pair argument for randomized quicksort's expected comparisons and the phase
   argument for the coupon collector, and state each result.
3. Say what linearity does *not* give (a tail or a variance), and name the tool that would.

**Running data** (all computed/asserted in `examples.py`):
- Quicksort: exact expectation 2(n+1)Hₙ − 4n = 24.44 at n=10, 647.85 at n=100, 10,985.91 at
  n=1,000; a 200-run seeded simulation lands at 10,978; 2n ln n alone would say 13,816.
- Coupon collector: n·Hₙ = 29.3 at n=10, 225.0 at n=50, 2,364.6 at n=365; a 2,000-run seeded
  simulation at n=50 lands at 226.4.
- Fixed points: exactly 1 for every n (n indicators at probability 1/n each); a 20,000-shuffle
  simulation of ten items lands at 1.001; Sattolo's variant gives 0 fixed points in 20,000
  four-item runs.
- Linearity under dependence: an urn of 3 red, 2 blue, two draws without replacement — the exact
  expected red count by linearity (0.6 + 0.6 = 1.2) matches an exhaustive enumeration over every
  ordered draw sequence, even though the two draws are visibly dependent.

**Engagement arc:** 11 steps, refresher, ~6 min. One predict (step 2, within the first four).
Three takeaways (steps 5, 9, 10 — none on step 4, the step right after the predict's own
reveal at step 3).

## Per-step storyboard

1. **Opening/hook.** Randomized quicksort picks pivots by coin flip, so its cost is a different
   number every run. On a thousand keys the exact expectation is 10,985.91, computed in one
   line with no recurrence; a 200-run simulation lands at 10,978.
2. **Predict.** Is the expected comparison count closer to n log₂ n, 2n ln n, or n²/4?
   Options: n log₂ n; 2n ln n (correct, to first order); n²/4; exactly n log₂ n + n.
3. **Reveal — the tool.** Linearity of expectation: E[X + Y] = E[X] + E[Y] for *any* random
   variables, with no independence required. Shown on a case where the terms are visibly
   dependent: two draws without replacement from an urn still add their marginal expectations.
4. **Indicator variable.** A 0/1 variable I_A with E[I_A] = Pr[A], so a count becomes a sum of
   probabilities. (No takeaway here — immediately after step 3's reveal.)
5. **Worked example — fixed points.** n indicator variables, one per position, each with
   probability 1/n: the expected number of fixed points of a random permutation is exactly 1,
   for every n, however the indicators depend on each other. Takeaway here.
6. **Quicksort pair setup.** Rank the keys 1…n. X_ij = 1 iff the elements ranked i and j are
   ever compared. They are compared iff the first pivot chosen among the j − i + 1 elements
   ranked i…j is one of the two endpoints, so Pr[X_ij = 1] = 2/(j − i + 1).
7. **Reveal — the sum.** Summing 2/(j − i + 1) over every pair gives 2(n + 1)Hₙ − 4n, answering
   step 2's predict: 10,985.91 at n = 1,000, close to the 2n ln n estimate of 13,816 but with
   the −4n and the (n+1) correction visible and exact.
8. **Second derivation, named.** Chapter 1's own topic already derives this same number from a
   recurrence; this is the second way, needing only a probability per pair, not the algorithm's
   recursive structure. (No takeaway — immediately after step 7's reveal of the predict.)
9. **Coupon collector.** n coupons, drawn with replacement until every one is seen: split the
   wait into n phases, phase i a geometric variable with success probability (n − i + 1)/n and
   expectation n/(n − i + 1); summed by linearity, n·Hₙ. At n = 50 that is 225.0 draws, and a
   2,000-run simulation lands at 226.4. Takeaway here.
10. **What linearity does not give.** An expectation is an average over all runs, not a promise
    about any one of them — it says nothing about the tail or the variance. Markov's,
    Chebyshev's and Chernoff's inequalities are named as the next tool, not built here (the
    chapter's own skipped topics). Takeaway here.
11. **Recap and handoff.** Linearity turned three different messy counts — fixed points,
    comparisons, draws — into a sum of probabilities, and it worked even where the pieces
    depended on each other. Handoff to reservoir sampling.

**Post-notes headings:** outcomes; internals (why the pair argument needs no independence
between different pairs sharing an element; the harmonic-number approximation and its error
term); lab (re-run the urn example at a different split and check linearity against exhaustive
enumeration); production (Chapter 3's hash-table chain-length example, one line); frontier
(named-only: Markov/Chebyshev/Chernoff, Las Vegas vs. Monte Carlo, the skipped balls-into-bins
and Karger topics); next (Chapter 29, topic 96).

**Bridge** (word for word, topic 94's handoff, from `registry.ts`): "A sweep sorts its events
once and spends O(log n) on each, and the bound is a promise about every input: the same
number of steps whatever the order the data arrives in. But the runtime of many of the best
algorithms in this milestone is a statement about a distribution: a random pivot, a random
hash, a random sample, with an expected cost and a small chance of doing worse. To say what
that expectation is, and to add up the costs of a thousand random events without tracking how
they depend on each other, you need one piece of arithmetic. Expectation and indicator
variables, next."

**Handoff** (word for word, from CHAPTER.md): "Linearity of expectation turns a messy random
count into a sum of probabilities, and it worked even where the pieces depend on each other.
The next question is not a running time but a distribution: you are handed a stream you can
only read once, you do not know how long it is, you can keep k items, and you must be able to
say that every item has the same chance of being among them. Reservoir sampling, next."

**Concept ledger:** introduces `linearity-of-expectation`, `indicator-variable`,
`harmonic-number`, `quicksort-expected-comparisons`, `coupon-collector`, `expected-fixed-points`.
Uses Chapter 1's `expected-vs-average`, `with-high-probability`, `best-worst-average-case`,
`big-o-theta-omega`; Chapter 3's `hash-function`, `separate-chaining` (one example). Declares
`expectation`, `probability-basics`, `logarithms`.

**Changes from the chapter plan:** none. The Har-Peled and Erickson lecture-notes URLs named in
CHAPTER.md as "to find at research time" still return errors; Ben Lynn's "Probability —
Quicksort" page (crypto.stanford.edu/~blynn/pr/qsort.html) is used in their place for the
pair-indicator proof, since it gives the identical argument and closed form and is directly
fetchable (recorded in `SOURCES.md`).
