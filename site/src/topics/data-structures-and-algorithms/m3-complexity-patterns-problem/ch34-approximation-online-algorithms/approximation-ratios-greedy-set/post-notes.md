---
id: dsa.approximation-ratios-greedy-set
title: Approximation ratios and greedy set cover
---

<section data-section="outcomes">

## After this topic you can

- State what an approximation ratio promises (a proved multiplicative worst-case bound) and what it does not (nothing about a typical instance).
- Prove and compute greedy set cover's harmonic-number bound, and build an instance that forces the ratio to grow without end.
- Prove and compute the maximal-matching 2-approximation for vertex cover, and name the shared trick: bound your answer against a computable lower bound on OPT, never against OPT itself.
- Tell two "approximation ratio" guarantees apart by their shape — one growing with the input, one a flat constant — even though both are proved the same way.

</section>

<section data-section="internals">

## Into the internals

### Why the harmonic charge telescopes

Charge each element 1 divided by the number of elements its covering set gained when it was covered. Sum those charges over one optimal set S*: at the moment greedy picks a set covering k of S*'s still-uncovered elements, greedy's own pick that round covered at least as many elements as S* itself would have covered of the remainder (greedy always takes the best available gain, and S* is one of the available sets). So the charge on S*'s j-th element to be covered is at most 1/(elements of S* still uncovered at that point), and summing those charges for j = 1 to |S*| gives at most H(|S*|). Summing over every optimal set in the cover bounds greedy's total picks by H(s)·OPT, where s is the largest set's size.

### Why maximality, not maximum size, is enough for vertex cover

The construction only needs that no edge escapes M — exactly what maximality means. Finding a maximum matching (the largest possible) is itself a harder polynomial problem (requiring augmenting-path algorithms); a maximal matching is found by a single greedy scan, in linear time. The proof's second half — |M| ≤ OPT — uses only that M's edges are pairwise disjoint, a property every matching has by definition, maximal or not. Using maximum instead of maximal would not improve the proved bound of 2, since the bound comes from the disjointness of M's edges, not from M's size relative to other matchings.

</section>

<section data-section="lab">

## In the lab

Take the growing-ratio family's construction (`examples.py`'s `growing_ratio_family`) and extend it past k = 12: at what k does greedy's ratio first exceed 10? (The closed form predicts it: ratio = k, optimum = 2, so ratio exceeds 10 once k > 20 — verify this by running the family at k = 21.) Separately, generate 200 random graphs instead of 60, track the exact distribution of observed ratios (not just the worst one), and check whether a sparser or denser random graph model changes how often the ratio actually approaches 2, versus landing closer to 1.

</section>

<section data-section="production">

## In production

Set cover shows up directly in test-suite minimization (pick the fewest tests that together exercise every code path a change touched) and in log-pattern coverage (pick the fewest regex templates that together match every log line seen) — both NP-hard in general, both commonly solved with the identical greedy rule this topic proves a bound for, because the H(n) guarantee is good enough in practice and the algorithm is cheap. Vertex cover's maximal-matching trick appears inside network monitoring (place the fewest probes so that every link is adjacent to one) and in certain constraint-solving preprocessing steps that reduce a larger SAT instance by first covering its "must be true somewhere" clauses cheaply.

</section>

<section data-section="frontier">

## The frontier

A semidefinite-programming-based algorithm (Karakostas, 2009, cited in `SOURCES.md`) improves on the flat factor of 2 for vertex cover by a small amount (2 minus a tiny constant), still short of beating 2 by any fixed margin large enough to contradict the unique games conjecture's inapproximability claim — the gap between "2 is simple and provably correct" and "slightly below 2 is possible with heavier machinery" is itself an active research question, not a closed one. On the set cover side, Feige's threshold is proved, but matching it with a *simpler* algorithm than the PCP-based inapproximability proof's own complexity is still of interest: greedy already matches the threshold up to lower-order terms, and no simpler proof of the matching lower bound is known.

</section>

<section data-section="questions">

## More questions

- The growing-ratio family needs two row sets plus geometrically doubling blocks. Would a family with three row sets instead of two force a *different* ratio formula, or the same one scaled by a constant?
- The maximal-matching cover is at most 2x OPT; it can be exactly OPT (a graph with a perfect matching whose cover happens to be minimum). What is the simplest graph where the cover is strictly between OPT and 2x OPT, neither tight bound?

</section>

<section data-section="next">

## Where this goes next

The same trick — a computable lower bound on OPT, your answer compared against that instead of the optimum itself — reappears with a different proof shape in the next two topics: an *additive* constant alongside a ratio for bin packing and scheduling, and later a *competitive ratio* against a clairvoyant offline algorithm for online paging, where the benchmark isn't even allowed to be computed in advance by the algorithm being measured.

</section>
