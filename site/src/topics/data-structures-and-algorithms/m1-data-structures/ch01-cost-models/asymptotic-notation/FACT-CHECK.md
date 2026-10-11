# Fact-check: Asymptotic notation and case analysis (2026-10-11)

Adversarial check by an independent agent against sources it opened; computed claims were re-derived.

| Claim | Result | Source / evidence |
|---|---|---|
| Knuth's Ω needs "all n ≥ n0"; Hardy–Littlewood's Ω is the negation of o ("infinitely many n") | Confirmed (Knuth also notes Hardy used one-sided Ω_L, Ω_R) | Knuth 1976, https://danluu.com/knuth-big-o.pdf |
| CLRS 4th ed. definitions of Θ, O, Ω, o, ω | Not verifiable online (book); wording matches standard restatements and Knuth. Section numbers unconfirmed, so cited as "chapter 3" | — |
| Limit test; n vs n(2+sin n) | Confirmed (mathematics) | — |
| 2^(2n) not O(2^n); log bases differ by a constant | Confirmed | — |
| Insertion sort: n−1, n(n−1)/2, expected n(n−1)/4 + n − Hₙ | Confirmed by exhaustive enumeration with exact fractions (n ≤ 8 in examples.py) | examples.py |
| Randomized quicksort expected comparisons 2(n+1)Hₙ − 4n; first pivot on sorted input n(n−1)/2 | Confirmed against the exact recurrence | examples.py |
| w.h.p. wording | Corrected: "for every c there is a d such that the bound d·n·log n fails with probability ≤ n^−c" | Har-Peled, UIUC CS 473 Fall 2023, §9.1 |
| Average-case vs expected-time convention | Standard usage; no single quotable definition found | — |
| Pseudo-polynomial | Corrected: formal definition is polynomial in length and largest number; the "polynomial in value, exponential in bits" gloss is informal | Garey & Johnson (not opened); trial division O(√v) |
| 4294967291 = 2^32−5 and 18446744073709551557 = 2^64−59 are the largest primes below 2^32 and 2^64 | Confirmed by computation and OEIS A013603 differences | https://oeis.org/A013603 |
| Multivariate O definitions | Corrected: most textbooks define one variable only; two that define several differ; Howell found a flaw in one | Rutanen, arXiv 1309.3210 |
| Sort libraries switch to insertion sort for short ranges | libstdc++ threshold 16 confirmed; CPython minrun claim differs between 3.12 and main, so not stated | stl_algo.h; listsort.txt |
| Duplicate detection trade-off (hash set vs in-place heapsort) | Confirmed; heapsort permutes the input, so "O(1) auxiliary space" | — |

All corrections are applied in the reel and Deep dive.

## Additions from the content review (2026-10-11)

| Claim | Result | Source / evidence |
|---|---|---|
| Insertion sort average shown as n²/4 + n − Hₙ in the drawing | Corrected to n(n−1)/4 + n − Hₙ (the enumerated formula) | examples.py |
| "×65,536 in value for 16 more bits" (trial division drawing) | Corrected: 32 more bits multiply the steps by about 65,536 | examples.py (asserted) |
| First-pivot quicksort averages 2(n+1)Hₙ − 4n over random orders | Confirmed by sampling (within 3%) and the standard recurrence | examples.py |
| Log bases inside exponents: 2^(log₂ n) = n, 2^(log₄ n) = √n (replaces an example that compared different arguments, not bases) | Confirmed | examples.py (asserted) |
| Doubling test cannot separate n from n log n (ratio 2.07 from 10⁹ to 2·10⁹) | Confirmed | examples.py (asserted) |
| 2n ln n alone gives 13,816 at n = 1,000 against the exact 10,986 | Confirmed | examples.py (asserted) |
| Smoothed analysis: "the maximum over inputs of the expected performance of an algorithm under small random perturbations of that input"; simplex has polynomial smoothed complexity | Confirmed from the abstract | https://arxiv.org/abs/cs/0111050 |
| Roughgarden's book surveys parameterized analysis, instance optimality, resource augmentation and semi-random models | Confirmed from the introduction chapter | https://arxiv.org/abs/2007.13241 |
| Algorithms with predictions: near-optimal with good predictions, prediction-less worst case when they are bad | Confirmed from the abstract | https://arxiv.org/abs/2006.09123 |
