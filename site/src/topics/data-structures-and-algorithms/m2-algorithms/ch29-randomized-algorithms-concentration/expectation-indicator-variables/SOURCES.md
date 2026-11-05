# Sources — dsa.expectation-indicator-variables

Fetched at research time (2026-11-05) into `sources/`. Checked with
`node scripts/sources.mjs check expectation-indicator-variables`.

## 1. Wikipedia, "Coupon collector's problem"

URL: https://en.wikipedia.org/wiki/Coupon_collector%27s_problem
Local copy: `sources/wiki-coupon-collector.txt`

> In probability theory, the coupon collector's problem refers to mathematical analysis of
> "collect all coupons and win" contests.

> An alternative statement is: given n coupons, how many coupons do you expect you need to draw
> with replacement before having drawn each coupon at least once?

> The mathematical analysis of the problem reveals that the expected number of trials needed
> grows as

(the growth rate renders as a MathML block in the fetched text, immediately followed by)

> when n = 50 it takes about 225

> trials on average to collect all 50 coupons.

> Let time T be the number of draws needed to collect all n coupons, and let

> be the time to collect the i-th coupon after i − 1 coupons have been collected.

> By the linearity of expectations we have:

> is the n-th harmonic number. Using the asymptotics of the harmonic numbers, we obtain:

Note: the article's own closed form (`E(T) = n·Hn`) matches `examples.py`'s computed
`coupon_collector_expected`, checked against this topic's own simulation, not copied from the
article as fact.

## 2. Wikipedia, "Expected value"

URL: https://en.wikipedia.org/wiki/Expected_value
Local copy: `sources/wiki-expected-value.txt`

> Linearity of expectation:

> The expected value operator (or expectation operator)

> is linear in the sense that, for any random variables

> Non-multiplicativity: In general, the expected value is not multiplicative, i.e.

> are independent, then one can show that

Note: this article's own section headings are the point this topic makes: "linearity" is stated
for **any** random variables (no independence clause anywhere in that property), while the
"non-multiplicativity" property states independence only as the condition for a *product*
`E[XY] = E[X]·E[Y]`, a different property. Topic 95 uses exactly this contrast to justify why
linearity alone is enough for every sum of indicators in this topic, dependent or not.

## 3. Ben Lynn, "Probability — Quicksort" (crypto.stanford.edu/~blynn/pr/qsort.html)

URL: https://crypto.stanford.edu/~blynn/pr/qsort.html
Local copy: `sources/stanford-qsort.txt`

> Let \(a_n\) be the expected number of comparisons when quicksorting \(n\) distinct items.

> Two numbers \(i < j\) are compared if and only if the first of \([i..j]\) to be chosen as a
> pivot is either \(i\) or \(j\), which occurs with probability:

> \[ \frac{2}{j - i + 1} \]

> By linearity of expectation:

> \[
> \begin{align}
> a_n &= 2 \sum \frac{n-k+1}{k} \mid k \in [2..n] \\
>  &= 2 \sum \frac{n+1}{k} - 1 \mid k \in [2..n] \\
>  &= 2 \left( \sum \frac{n+1}{k} - 1 \mid k \in [1..n] \right) - 2 n \\
>  &= 2 (n+1) H_n - 4 n
> \end{align}
> \]

> where \(H_n\) is the \(n\)th harmonic number:

> the expected number of comparisons performed by quicksort is bounded above by
> \(2n \log n = O(n \log n)\).

Note: this is the "second derivation" `CHAPTER.md` asks for, by the pair/indicator argument
rather than the recurrence `dsa.asymptotic-notation` already uses; both give
`2(n+1)Hn − 4n`, confirmed to agree (that live topic's own text states the same closed form and
measures 10,986 at n = 1,000, matching this topic's 10,985.91 to rounding).

## 4. Wikipedia, "Rencontres numbers"

URL: https://en.wikipedia.org/wiki/Rencontres_numbers
Local copy: `sources/wiki-rencontres.txt`

> In combinatorics, the rencontres numbers are a triangular array of integers that enumerate
> permutations of the set { 1, ..., n } with specified numbers of fixed points: in other words,
> partial derangements.

> For n ≥ 1, the expected number of fixed points is 1 (a fact that follows from linearity of
> expectation).

Note: used for the chapter's third worked example (CHAPTER.md §95: "the expected number of
fixed points of a random permutation is exactly 1"), the case the plan singles out because the
n indicator variables that make it up are **not independent** (whether position 1 is fixed and
whether position 2 is fixed depend on each other), yet linearity still adds their probabilities
without caring.

## 5. Wikipedia, "Fisher–Yates shuffle" (Sattolo's algorithm section)

URL: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
Local copy: `sources/wiki-fisher-yates.txt`

> A variant of the Fisher–Yates shuffle, known as Sattolo's algorithm, may be used to generate
> random cyclic permutations of length n instead of random permutations.

> A very similar algorithm was published in 1986 by Sandra Sattolo for generating uniformly
> distributed cycles of (maximal) length n.

> The only difference between Durstenfeld's and Sattolo's algorithms is that in the latter, in
> step 2 above, the random number j is chosen from the range between 1 and i − 1 (rather than
> between 1 and i) inclusive. This simple change modifies the algorithm so that the resulting
> permutation always consists of a single cycle.

> In fact, as described below, it is quite easy to accidentally implement Sattolo's algorithm
> when the ordinary Fisher–Yates shuffle is intended. This will bias the results by causing the
> permutations to be picked from the smaller set of (n − 1)! cycles of length n, instead of from
> the full set of all n! possible permutations.

Note: used only for the one-sentence contrast in this topic's closing step (Sattolo's variant
has zero fixed points, against Fisher–Yates' expectation of exactly 1 — the expected-fixed-point
result is the test that would catch the classic accidental-Sattolo bug); the full algorithm,
its counting argument and its use in `measuring-memory-hierarchy` belong to topic 97, which
cites this same article again for its own scope, not re-fetched here as a separate claim.

**Named, not read** (per `CHAPTER.md`; cited only for attribution, nothing attributed beyond the
title/author/year below):

- Cormen, Leiserson, Rivest and Stein, *Introduction to Algorithms*, 4th ed. — the chapter on
  probabilistic analysis and randomized algorithms (indicator random variables, the hiring
  problem, quicksort's expected comparisons, the coupon collector).
- Mitzenmacher and Upfal, *Probability and Computing*, 2nd ed., chapters 2–3.

**Tried at planning time, not usable at research time:** Sariel Har-Peled's and Erickson's
randomized-algorithms lecture notes (the URLs named in `CHAPTER.md` returned errors again at
research time); the Stanford quicksort page above (source 3) is used in their place for the
pair-indicator proof, since it gives the identical argument and closed form and is directly
fetchable.
