# Sources: Asymptotic notation and case analysis

Checked 2026-10-11. Each source was opened with WebFetch or, where the server returned a PDF, saved and extracted with `pdftotext`. Quotes marked **[pdftotext]** are byte-level extractions and are the most reliable. Quotes marked **[WebFetch]** are returned by a summarising model and were not checked byte-for-byte against the page; re-check them before relying on exact wording.

Status key: **Opened** = text read; **Partial** = source opened but the item is not in it; **Not opened** = could not be read.

---

## 1. Knuth, "Big Omicron and Big Omega and Big Theta", SIGACT News, Apr.-June 1976

- URL: https://danluu.com/knuth-big-o.pdf
- Version/date: SIGACT News 18, Apr.-June 1976 (page header "SIGACT News 18 Apr.-June 1976"). Donald E. Knuth, Stanford University. The PDF also contains a short 1976 letter from Dana Angluin, not relevant to the topic.
- Status: **Opened** [pdftotext]. Greek letters Ω, Θ, Ω_L/Ω_R are mis-extracted as `~`, `®`, `Q`, `N` in the text layer; the English is exact. Quotes below keep the English and mark symbol damage with `[sym]`.

Quotes:

1. "Most of us have gotten accustomed to the idea of using the notation O(f(n)) to stand for any function whose magnitude is upper-bounded by a constant times f(n) , for all large n ."
2. "Sometimes we also need a corresponding notation for lower-bounded functions, i.e., those functions which are at least as large as a constant times f(n) for all large n ."
3. "Unfortunately, people have occasionally been using the O-notation for lower bounds, for example when they reject a particular sorting method "because its running time is O(n 2) ""
4. "Hardy and Littlewood introduced Q in their classic 1914 memoir [4, p. 225], calling it a "new" notation." (`Q` = Ω [sym])
5. "Unfortunately, Hardy and Littlewood didn't define ~(f(n)) as I wanted them to; their definition was a negation of o(f(n)) , namely a function whose absolute value exceeds Cf(n) for infinitely many n , when C is a sufficiently small positive constant. For all the applications I have seen so far in computer science, a stronger requirement (replacing "infinitely many n" by "all large n") is much more appropriate."
6. "O(f(n)) denotes the set of all g(n) such that there exist positive constants C and nO with Ig(n)l ~ Cf(n) for all n ~ nO ." (`~` = ≤ [sym])
7. "~(f(n)) denotes the set of all g(n) such that there exist positive constants C and nO with g(n) k Cf(n) for all n k n0 ." (`k` = ≥ [sym])
8. "®(f(n)) denotes the set of all g(n) such that there exist positive constants C, C' , and nO with Cf(n) < g(n) < C'f(n) for all n ~ nO ." (`®` = Θ [sym])
9. "Verbally, O(f(n)) can be read as "order at most f(n) "; ~(f(n)) as "order at least f(n) "; ®(f(n)) as "order exactly f(n) "."
10. "Under this interpretation, when the O-notation and its relatives are used in formulas, we are actually speaking about sets of functions rather than single functions."
11. "...we should continue to use one-way equality together with O-notations, since it has been common practice of thousands of mathematicians for so many years now..." (the "one-way equality" passage; part of the text is mis-extracted, so this is the legible run)
12. "(Hardy's book on divergent series uses 0L and OR v~en a one-sided O-result is needed. Hardy and Littlewood [5] used NL and ~R for functions respectively < -Cf(n) and > Cf(n) infinitely often. Neither of these has become widespread.)" (symbols [sym])

Contents, item by item (from coverage.json):

| Item | Status | Quote |
|---|---|---|
| O, Ω, Θ defined with "all large n", and why Ω is needed for lower bounds | Found | 1, 2, 3, 6, 7, 8 |
| Hardy–Littlewood meaning of Ω (infinitely often) and the one-way equality | Found | 5, 11 (and 12 for Hardy's one-sided variants) |

---

## 2. Har-Peled, UIUC CS 473 Fall 2023, Chapter 9 "Randomized Algorithms II"

- URL: https://courses.grainger.illinois.edu/cs473/fa2023/lec/notes/09_rand_II.pdf (course page: https://courses.grainger.illinois.edu/cs473/fa2023/ , schedule: `.../lec/`, lecture #11 "QuickSort: high probability", notes `notes/09_rand_II.pdf`). Note: the URL `.../cs473/fa2023/notes/09_rand_II.pdf` returned 404.
- Version/date: "By Sariel Har-Peled, September 26, 2023 Version: 0.2"
- Status: **Opened** [pdftotext]. Hyphenation at line breaks was joined.

Quotes:

1. "9.1. QuickSort and Treaps with High Probability"
2. "Namely, QuickSort performs at most 32n ln n comparisons with high probability. It follows, that QuickSort runs in O(n log n) time, with high probability, since the running time of QuickSort is proportional to the number of comparisons it performs."
3. "Theorem 9.1.2. With high probability (i.e., 1 − 1/n2 ) the depth of the recursion of QuickSort is ≤ 32 ln n. Thus, with high probability, the running time of QuickSort is O(n log n)."
4. "More generally, for any constant c, there exist a constant d, such that the probability that QuickSort recursion depth for any element exceeds d ln n is smaller than 1/nc ."
5. "Specifically, for any t ≥ 1, we have that probability that the recursion depth for any element exceeds t · d ln n is smaller than 1/nt·c ."

Note for the fact-check: the source states the w.h.p. result for recursion depth (d ln n, failure ≤ 1/n^c), not literally "d·n·log n fails with probability ≤ n^−c" as the FACT-CHECK row says. Quote 4 is the closest verbatim form; the O(n log n) running time follows from it (quote 2/3).

Contents, item by item:

| Item | Status | Quote |
|---|---|---|
| w.h.p. wording: for every c there is a d such that the bound fails with probability ≤ n^−c | Found (stated for recursion depth, d ln n; running time O(n log n) follows) | 3, 4 |

---

## 3. Rutanen, "O-notation in Algorithm Analysis", arXiv:1309.3210

- URL: https://arxiv.org/abs/1309.3210 (abstract page); https://arxiv.org/pdf/1309.3210 (full text, used)
- Version/date: arXiv:1309.3210v32 [cs.DS] 29 Oct 2016; title page dated November 27, 2024 ("updated"). Kalle Rutanen. Abstract page title: "O-notation in algorithm analysis"; PDF title: "O-notation in Algorithm Analysis (updated)".
- Status: **Opened** [pdftotext]. The abstract page alone did not contain the multivariate passages; the PDF did.

Quotes:

1. "Textbooks on algorithms approach the definition on N2 in two ways. The first way — exemplified in [8, page 312] — is to define the O-notation only in N, and then silently continue using the notation over multiple variables too. That is, with no definition. The second way — exemplified in [1] and [2] — is to define the O-notation in N, and later provide some definition for a generalization to N2 , with the implication that the generalization does not bring anything new."
2. "Among all the books we have looked at, [1] and [2] were the only ones to provide a definition for N2 — although different ones. The former provided asymptotic linear dominance, while the latter provided coasymptotic linear dominance."
3. "The first documented symptom of a non-trivial generalization to N2 was given by Howell [11], who demonstrated a flaw4 in asymptotic linear dominance on N2 . Perhaps it was for this issue, or a similar issue, that [2] changed the definition to coasymptotic linear dominance."
4. "The present paper resolves this question by showing that the only definition which has the desirable properties is linear dominance; the multivariate definition is merely an instance of the definition on Nd ."
5. Appendix B, "Howell's counterexample": "In this section, we consider Howell's counterexample [11], which shows that asymptotic linear dominance O does not satisfy subset-summability."

Contents, item by item:

| Item | Status | Quote |
|---|---|---|
| Multivariate O: most textbooks define one variable only; two that define several differ; Howell found a flaw in one | Found | 1, 2, 3 |

---

## 4. OEIS A013603

- URL: https://oeis.org/A013603
- Version/date: OEIS entry as served on the fetch date (no version or date shown on the page as read). Name as read: "Difference between 2^n and the nearest prime less than or equal to 2^n."
- Status: **Opened** [WebFetch]. Data quoted from the summary.

Quotes:

1. Name: "Difference between 2^n and the nearest prime less than or equal to 2^n."
2. Terms (offset 1): 0, 1, 1, 3, 1, 3, 1, 5, 3, 3, 9, 3, 1, 3, 19, 15, ...
3. Formula: "a(n) = 2^n - prevprime(2^n) = 2^n - prime(primepi(2^n))." (Alonso del Arte, Dec 10 2016)
4. Page reports a(32) = 5 and a(64) = 59 (WebFetch summary; the values 4294967291 and 18446744073709551557 do not appear as text on the page).

Contents, item by item:

| Item | Status | Quote |
|---|---|---|
| 4294967291 = 2^32−5 and 18446744073709551557 = 2^64−59 are the largest primes below 2^32 and 2^64 | Partial: page gives the differences 5 and 59, which imply the primes 2^32−5 and 2^64−59 are the nearest primes ≤ 2^32 and 2^64. "Largest prime below" is not stated. The primality/largest-ness claim rests on the difference values plus computation (FACT-CHECK). | 3, 4 |

---

## 5. libstdc++ `bits/stl_algo.h` (GCC master)

- URL: https://raw.githubusercontent.com/gcc-mirror/gcc/master/libstdc++-v3/include/bits/stl_algo.h
- Version/date: GCC master branch as served on the fetch date; not pinned to a release, and the page has no version line in the text read. Licence: GPL v3 with GCC Runtime Library Exception (as shown on the page).
- Status: **Opened** [WebFetch]. The file is 218,535 characters; only the first 100,000 were read. Line numbers were not visible.

Quotes:

1. `enum { _S_threshold = 16 };` with the comment "This controls some aspect of the sort routines."
2. `__final_insertion_sort`: "This is a helper function for the sort routine." Body: if `__last - __first > __threshold`, call `std::__insertion_sort(__first, __first + __threshold, __comp)` then `std::__unguarded_insertion_sort(__first + __threshold, __last, __comp)`; otherwise `std::__insertion_sort(__first, __last, __comp)`.
3. `_S_threshold` is also used in `__introsort_loop` as `while (__last - __first > int(_S_threshold))`.

Contents, item by item:

| Item | Status | Quote |
|---|---|---|
| Libraries switch to insertion sort for short ranges; libstdc++ threshold 16 | Found | 1, 2, 3 |

---

## 6. CPython `Objects/listsort.txt` (3.12 branch)

- URL: https://github.com/python/cpython/blob/3.12/Objects/listsort.txt
- Version/date: CPython 3.12 branch as served on the fetch date. The FACT-CHECK notes minrun differs between 3.12 and main; this source covers 3.12 only.
- Status: **Opened** [WebFetch].

Quotes:

1. "We pick 32 as a good value in the sweet range"
2. "Instead we pick a minrun in range(32, 65) such that N/minrun is exactly a power of 2"
3. "If N < 64, minrun is N."
4. "IOW, binary insertion sort is used for the whole array then"
5. "A "binary insertion sort" is just like a textbook insertion sort"

Contents, item by item:

| Item | Status | Quote |
|---|---|---|
| Sort libraries switch to insertion sort for short ranges (CPython) | Found for 3.12 only; FACT-CHECK does not state the CPython claim because it differs by version | 1–5 |

---

## 7. Sedgewick and Wayne, *Algorithms*, 4th ed., §1.4 Analysis of Algorithms

- URL: https://algs4.cs.princeton.edu/14analysis/
- Version/date: "Algorithms, 4th edition (Robert Sedgewick and Kevin Wayne). Copyright © 2000–2025 Robert Sedgewick and Kevin Wayne." (as shown on the page)
- Status: **Opened** [WebFetch]. The order-of-growth table is an image and was not readable. No doubling-hypothesis section was found on this page.

Quotes:

1. "so very often the order of growth of the cost is one of just a few functions of the problem size _N_."
2. "[DoublingRatio.java] is similar but also output the ratios in running times from one size to the next." (Observations section; the only doubling text on the page)
3. "To estimate how much memory our program uses, we can count up the number of variables"
4. "we add the amount of memory used by each instance variable to the overhead associated with each object, typically 16 bytes."
5. "An array of primitive-type values typically requires 24 bytes of header information"
6. "A Java 7 string of length _N_ typically uses 32 bytes (for the String object) plus 24 + 2_N_ bytes"

Contents, item by item:

| Item | Status | Quote |
|---|---|---|
| Order-of-growth classifications and what the constants do at real sizes | Partial: the classes are named in the text, but the table (1, log N, N, N log N, N², N³, 2^N) is an image, and constant-factor discussion was not found on the page | 1 |
| Doubling hypothesis for estimating the exponent | **Not found** on this page. Only a DoublingRatio mention (quote 2). The FACT-CHECK does not cite a quote for it either. | 2 |
| Memory use as a second resource | Found | 3–6 |

---

## 8. CLRS, *Introduction to Algorithms*, 4th ed., chapters 3, 2, 7

- URL: https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/
- Status: **Not opened**. The server returned HTTP 403 Forbidden. The FACT-CHECK also records the definitions as not verifiable online.

Contents, item by item:

| Item | Status |
|---|---|
| Θ, O, Ω with c1, c2, n0 and "for all n ≥ n0" | Not opened |
| o and ω with "for every c > 0"; limit characterisation | Not opened |
| Asymptotic notation denotes sets; "=" abuse; anonymous functions | Not opened |
| Standard rules: sums, products, polynomials, log bases, exponentials | Not opened |
| Best, worst and average-case analysis of insertion sort | Not opened |
| Expected running time of randomized quicksort and pivot analysis | Not opened |

---

## 9. Mitzenmacher and Upfal, *Probability and Computing*, 2nd ed.

- URL: not found. A Cambridge catalogue URL returned HTTP 404.
- Status: **Not opened**.

Contents, item by item:

| Item | Status |
|---|---|
| Markov's inequality bounds a tail from an expectation only weakly | Not opened |
| High-probability bound: failure at most 1/n^c | Not opened (Har-Peled covers the w.h.p. wording, see §2) |
| Chernoff and Chebyshev tail bounds | Not opened |

---

## 10. Garey and Johnson (pseudo-polynomial definition)

- Status: **Not opened** (cited in FACT-CHECK as not opened).

---

## 11. Other sources cited in FACT-CHECK but not in coverage.json

- Limit test and n vs n(2+sin n): mathematics, no external source.
- Insertion sort count formulas and quicksort recurrence: verified by `examples.py` (not a web source).
- Duplicate detection trade-off (heapsort permutes input): no external source.
