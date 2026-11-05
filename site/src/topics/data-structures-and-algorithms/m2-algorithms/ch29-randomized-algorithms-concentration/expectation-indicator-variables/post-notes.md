---
id: dsa.expectation-indicator-variables
title: Expectation and indicator variables
---

<section data-section="outcomes">

## After this topic you can

- Write a count as a sum of indicator variables and compute its expectation without caring how
  the indicators depend on each other.
- Reproduce the pair argument for randomized quicksort's expected comparisons and the phase
  argument for the coupon collector, and state each result.
- Say what linearity does not give (a tail or a variance), and name the tool that would.

</section>

<section data-section="internals">

## Into the internals

### Why the pair argument needs no independence between pairs

The indicators X_ij (for ranks i < j) that make up the quicksort comparison count are not
independent of each other — whether the pair (1, 5) is compared depends on the same pivot
choices that decide whether (1, 3) is compared, since both pairs can share a pivot drawn from
an overlapping range of ranks. Linearity of expectation does not need them to be: E[ΣX_ij]
= ΣE[X_ij] holds term by term regardless, which is the entire point the chapter's urn example
and the fixed-point example both make before this one needs it.

### The harmonic number's approximation, not its proof

Hₙ = ln n + γ + 1/(2n) + O(1/n²), with γ ≈ 0.5772156649 the Euler–Mascheroni constant. This
topic states and checks the approximation numerically (`examples.py`'s `HN_EXACT_1000` against
`HN_APPROX_1000`, agreeing to better than 0.01 at n = 1,000) without proving the asymptotic
expansion itself, which belongs to a calculus course, not this one.

### The hypergeometric check behind the urn example

Two draws without replacement from an urn of 3 red and 2 blue balls: the number of red balls
drawn follows a hypergeometric distribution. Its mean is `k·(K/N) = 2·(3/5) = 1.2` by the
standard formula, which is exactly what linearity gives by adding two marginal expectations of
3/5 each — a second, independent confirmation beyond the exhaustive enumeration in
`examples.py`.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs every number in this topic directly: the quicksort closed form at three
sizes against a 200-run simulation, the coupon-collector closed form against a 2,000-run
simulation, the fixed-point expectation against a 20,000-shuffle simulation (and Sattolo's
variant against a second 20,000-run simulation), and the urn example's exact linearity check
against an exhaustive enumeration. Change the urn's split (say, 5 red and 1 blue) and verify by
hand that the two expectations by linearity still match an exhaustive enumeration over every
ordered draw sequence — the same check `FACT-CHECK.md` ran on the 3-red-2-blue split.

</section>

<section data-section="production">

## In production

Chapter 3's separate-chaining hash table is the one real-system example this topic leans on
without rebuilding: a chain's expected length, given n items hashed uniformly into m buckets,
is n/m by the same kind of indicator sum (one indicator per item, for the event "this item
lands in this bucket"), and that chapter already states and uses the number — this topic only
names the connection, since the indicator argument behind it is the one just taught.

</section>

<section data-section="frontier">

## The frontier

This chapter's own "concentration" promise is only half delivered: Las Vegas versus Monte
Carlo, and the tail-bound tools (Markov's inequality, Chebyshev's inequality, Chernoff–Hoeffding
bounds, the median-of-means trick) are named here and nowhere built, because the syllabus marks
both as *(skipped)*. The one fact this topic and the live `asymptotic-notation` topic both
state is Markov's own bound: Pr[T ≥ k·E[T]] ≤ 1/k, which says an expectation alone can only
rule out a run being *more than k times* the average, nothing tighter. Chapter 30's streaming
sketches (Count-Min, HyperLogLog) reuse the same indicator-sum style of argument this topic
teaches, extended with the concentration this chapter could not cover. Balls into bins and
Karger's randomized min-cut are named once here as this chapter's other two skipped topics, per
`syllabus/review-notes/dsa-cuts.md`, and are not built in this topic.

</section>

<section data-section="next">

## Where this goes next

Reservoir sampling asks a harder question than "what is the expected count": given a stream
you can only read once, of unknown length, keep k items such that every item seen so far has
exactly the same chance of being among them — proved, again, one item and one draw at a time.

</section>
