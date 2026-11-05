Last verified: 2026-11-05.

- Wikipedia, "Coupon collector's problem" — the n·Hₙ expected draw count, its Θ(n log n)
  growth, and the n = 50 example. [source](https://en.wikipedia.org/wiki/Coupon_collector%27s_problem)
- Wikipedia, "Expected value" — linearity of expectation (any random variables, no
  independence required) and non-multiplicativity (E[XY] needs independence). [source](https://en.wikipedia.org/wiki/Expected_value)
- Ben Lynn, "Probability — Quicksort" — the pair-indicator proof of randomized quicksort's
  expected comparisons, 2(n+1)Hₙ − 4n. [source](https://crypto.stanford.edu/~blynn/pr/qsort.html)
- Wikipedia, "Rencontres numbers" — the expected number of fixed points of a random
  permutation, exactly 1 for every n. [source](https://en.wikipedia.org/wiki/Rencontres_numbers)
- Wikipedia, "Fisher–Yates shuffle" (Sattolo's algorithm section) — the one-line change that
  turns Fisher–Yates into Sattolo's always-zero-fixed-point cyclic variant. [source](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)

Named for attribution only, not read directly (per the chapter plan): Cormen, Leiserson,
Rivest and Stein, *Introduction to Algorithms*, 4th ed. (the chapter on probabilistic analysis
and randomized algorithms); Mitzenmacher and Upfal, *Probability and Computing*, 2nd ed.,
chapters 2–3.

Tried at planning time and again at research time, not usable: Sariel Har-Peled's and
Erickson's randomized-algorithms lecture notes (the named URLs returned errors both times); the
Stanford "Probability — Quicksort" page above is used in their place for the pair-indicator
proof.

This topic's closed form for randomized quicksort's expected comparisons, 2(n+1)Hₙ − 4n, is
checked against the live topic `dsa.asymptotic-notation`'s own recurrence-based derivation of
the same expression (see `FACT-CHECK.md`, claim 7): both agree, to rounding, at n = 1,000
(10,985.91 here, 10,986 there).

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=expectation-indicator-variables:%20).
