# Outline — de.hyperloglog-distinct-counting

## Outcomes (from CHAPTER.md)

Build a real HyperLogLog sketch from leading-zero estimation, registers and a harmonic mean, and
measure its real error vs. memory against an exact count on a Zipf-skewed stream; explain HLL++'s
bias correction and sparse mode as real refinements; merge real sketches across simulated
partitions and confirm the merged estimate matches a single-pass sketch; contrast
`APPROX_COUNT_DISTINCT` against exact `COUNT(DISTINCT)`; name Theta/KMV sketches as the tool
needed once set intersection or difference, not just cardinality, matters.

## 9-step storyboard (full, ~15 min)

1. **Hook.** A handful of small registers, each just counting a run length, estimates how many
   distinct values passed by — without ever storing one of them.
2. **Predict: does merging two of these sketches from two separate partitions give the same
   answer as building one sketch over all the combined data from scratch.** (Correct: yes — taking
   the register-by-register maximum across both sketches gives the identical estimate a single
   pass over the combined stream would have produced.)
3. **Reveal: each register tracks the longest run of leading zeros it has seen.** No takeaway
   (reel test's reference "from" step).
4. **Reveal: averaging registers with a harmonic mean, not an arithmetic one, is what tames the
   outliers.** A single unlucky long run would wreck a plain average; the harmonic mean is far
   less sensitive to it. Takeaway.
5. **Reveal: a real sketch's measured error against an exact count, across more memory.** This
   topic's own real measurement: build sketches with more and more registers over the same
   Zipf-skewed stream, and watch the real error against an exact `COUNT(DISTINCT)` shrink.
   Takeaway.
6. **Reveal: HLL++ adds a measured bias correction and a sparse mode for small counts.** Google's
   own engineering paper names both refinements directly: a table correcting a real small-count
   bias, and a sparse representation that skips storing empty registers until it would cost more
   than just storing them all. Takeaway.
7. **Reveal: a warehouse's own `APPROX_COUNT_DISTINCT` trades exactness for speed on purpose.**
   Named directly from the engine's own documentation, contrasted with exact `COUNT(DISTINCT)`;
   Theta and KMV sketches are named as the tool to reach for once a query needs set intersection
   or difference, not just a count. Takeaway.
8. **Recap.**
9. **Prove it.** A team already merges per-day HyperLogLog sketches into a rolling thirty-day
   estimate. A teammate now also needs the exact number of users who were active on day one but
   never returned. Does the team's existing sketch answer that, or do they need something else?
   (Correct: something else — a HyperLogLog sketch only ever answers "how many," never "which
   ones" or "how many are in both/neither"; a Theta or KMV sketch, built for set operations, is
   what actually answers a difference like this one.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (the register observable, the harmonic mean, mergeability); Production (the
real measured error-vs-memory curve; HLL++'s bias correction and sparse mode; choosing
`APPROX_COUNT_DISTINCT` vs exact `COUNT(DISTINCT)`); Frontier (Count-Min Sketch, built in this
topic's own lab as the chapter's closing comparison); Where this goes next (an entire
distribution approximated at once, not just one number).

## Bridge / handoff

Bridge (answers topic 30's handoff verbatim): "Membership is one question a tiny structure can
answer approximately. This topic is a completely different question answered the same way: how
many distinct values are there, built and measured for real against an exact count on a
Zipf-skewed stream."

Handoff: "Counting distinct values is one single number a sketch can approximate. The next,
closing topic is a sketch for an entire distribution at once: a quantile."

## Concept ledger

Introduces: `hyperloglog-distinct-counting`. Uses: `probabilistic-membership-filters` (the sibling
sketch-family contrast: membership vs. cardinality, same small-fixed-memory idea). Declared: none
beyond topic 30.

## Claims list (for FACT-CHECK.md)

1. The original HyperLogLog paper (Flajolet, Fusy, Gandouet, Meunier): the structure's register
   observable is the position of the leftmost set bit of a hashed value, and its evaluation
   function uses a harmonic rather than geometric mean across registers.
2. Google's own HyperLogLog++ engineering paper (Heule, Nunkesser, Hall): a measured, interpolated
   bias-correction table fixes the raw estimator's real small-cardinality bias; a sparse
   representation stores only non-empty register pairs until that costs more than a dense array.
3. BigQuery's own documentation: `APPROX_COUNT_DISTINCT` returns a statistical estimate, not
   necessarily the exact value, trading accuracy for performance on very large input.
4. Apache DataSketches' own documentation: Theta-sketch set operations (union, intersection,
   difference) obey real, documented accuracy rules, and the result of an intersection or
   difference can genuinely hold anywhere from zero to all of the union's retained values.
5. This course's own measurement (`examples.py`): a real HyperLogLog sketch's error against an
   exact count on a Zipf-skewed stream shrinks as register count grows, and merging two
   partitioned sketches produces the identical estimate a single combined-stream sketch would.
