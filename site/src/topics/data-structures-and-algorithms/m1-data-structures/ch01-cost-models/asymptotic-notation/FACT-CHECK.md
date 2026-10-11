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
