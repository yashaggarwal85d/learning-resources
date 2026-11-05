# Storyboard — dsa.sweep-line-algorithms

**Learning outcomes** (from CHAPTER.md):
1. State the sweep skeleton (events, active set, tie rule) and name the event set and
   active-set structure for a new problem.
2. Produce a skyline with a heap and lazy deletion, and compute a union area with a
   cover-count segment tree.
3. Explain why Bentley–Ottmann only ever tests neighbours, derive O((n + k) log n), and say
   when the all-pairs scan wins.
4. Say exactly which geometric primitive the algorithm needs and what makes it fail on
   degenerate or floating-point input.

**Running data** (all computed/asserted in `examples.py`):
- Skyline: buildings (2,9,10) (3,7,15) (5,12,12) (15,20,10) (19,24,8) → key points
  (2,10) (3,15) (7,12) (12,0) (15,10) (20,8) (24,0).
- Rectangle union: rectangles (0,0,4,3) (2,1,6,5) (5,0,8,2) → sum of areas 34, union 29.
- Segment crossings: 8 seeded segments, 28 pairs, 2 crossings. Scaling: n=50 → 3 crossings
  against 1225 pairs; n=200 → 5 against 19900; n=1000 → 48 against 499500 (sweep cost proxy
  ≈10444 vs. the 499500-pair scan).

**Engagement arc:** 15 steps, full topic, ~15 min. Three predicts (steps 2, 7, 11 — first
within the first four). Four takeaways (steps 4, 6, 10, 14 — none immediately after a predict
reveal, per the project's phone-caption-swipe constraint). Recap names the sweep-line method
explicitly and hands off to Chapter 29.

## Per-step storyboard

1. **Opening.** A thousand segments could cross in nearly half a million places (499,500
   pairs); a scan tests every pair. Draw the eight seeded segments: 28 pairs, only 2 cross.
2. **Predict.** How many of the 28 pairs does a sweep actually need to test? Options: all 28;
   only pairs overlapping in x; only pairs that become neighbours in the vertical order
   (correct); half, chosen at random.
3. **Reveal — the sweep skeleton.** Events (known or discovered), an active set that only
   changes at an event, "for each event in order: update the active set, record what
   changed." Topic 93's depth sweep was the first, plainest instance (the active set was a
   count).
4. **Tie-breaking.** With half-open intervals, ends are processed before starts at the same
   x — get it backwards and an interval is counted as overlapping a neighbour it never
   touches. Takeaway here.
5. **Skyline setup.** Buildings as (left, right, height). Events: left and right edges.
   Active set: a max-heap of heights, with lazy deletion — a building is only removed once it
   surfaces at the top and its right edge has passed.
6. **Skyline walk.** The seven key points emerge as the heap's maximum changes; contrast with
   Chapter 2's monotonic deque, which handles a window of fixed order, not arbitrary expiry.
   Takeaway here.
7. **Predict.** What holds the active set for the rectangles' union area? Options: a single
   running count; a cover-count segment tree over the compressed y-coordinates (correct); a
   sorted array rebuilt at every event; a hash set of covered rows.
8. **Reveal — union area.** Sweep left/right edges; at each event, the covered length times
   the gap since the last event accumulates the area. Three rectangles sum to 34; their union
   is 29. Named: Klee's measure problem (Klee, 1977, the 1-D case; Bentley, 1977, the 2-D
   sweep); the d-dimensional running time is O(n^(d-1) log n).
9. **Segment intersection setup.** Bentley–Ottmann: events are endpoints (known) and
   crossings (discovered as the sweep proceeds); the active set is the segments crossing the
   line, kept in a balanced search tree ordered by y at the sweep's current x.
10. **Correctness invariant.** The tree's order is always the true vertical order at the
    sweep position, and any crossing is detected before the sweep reaches it — because two
    segments can only cross after becoming neighbours in that order, so only new neighbour
    pairs are ever tested. Takeaway here.
11. **Predict.** At k = Θ(n²) crossings, is the O((n+k) log n) sweep still faster than the
    O(n²) all-pairs scan? Options: yes, always; no — the log factor makes it slower at that
    point (correct); only for small n; always exactly equal.
12. **Reveal — the scaling curve.** n=50, 200, 1000 sparse segment sets: crossings grow to 3,
    5, 48 while the pairs a scan would test grow to 1225, 19900, 499500 — the sweep's
    (n+k) log n stays far below n(n-1)/2 when k is small, and the crossover the predict asked
    about is exactly where k approaches Θ(n²).
13. **The one geometric primitive.** The sign of a cross product decides which side of a
    segment a point falls on, and whether two segments cross — exact on integer coordinates.
    General position (no shared endpoints, no three segments through one point, nothing
    vertical) is assumed; floating-point coordinates and degenerate inputs break the sign
    test, and Shewchuk's exact and adaptive predicates (named only) repair it. Orientation
    tests themselves are the skipped topic's subject, not rebuilt here.
14. **A real system.** DuckDB's IEJoin sorts on two inequality predicates and merges the sort
    keys into a combined table — the same "sort the endpoint orders once" idea this topic
    just swept through, one layer down in a query engine. Takeaway here.
15. **Recap.** One sweep skeleton — events, active set, tie rule — produced a skyline, a
    union's area, and every segment crossing, each with its own active-set structure. Handoff
    to Chapter 29: a sweep's bound is a promise about every input; the next milestone's
    algorithms make promises about a distribution instead, and that needs expectation and
    indicator variables.

**Post-notes headings:** outcomes; internals (the lazy-deletion heap's amortized cost; the
segment tree's non-propagating use; the correctness invariant restated carefully); lab (build
the skyline and the union-area sweep against each other on the running data); production
(DuckDB IEJoin, with the fetched measurement); frontier (named-only: de Berg et al.'s textbook
treatment, Clarkson/Mulmuley/Chazelle & Edelsbrunner/Balaban's faster algorithms, Shewchuk's
robust predicates, the skipped orientation-tests/convex-hull/Voronoi topics); next (Chapter 29,
topic 95).

**Bridge** (word for word, topic 93's handoff): "Every program here sorted the endpoints once
and walked them, keeping only what is open right now: a running count, a heap of end times, a
table over the sorted order. That is not a trick for intervals. It is a method with a name,
and it handles far more than a count: the height of a skyline, the area of a union of
rectangles, every crossing among a thousand segments. The method is the sweep line, next."

**Handoff** (word for word, from CHAPTER.md): "A sweep sorts its events once and spends
O(log n) on each, and the bound is a promise about every input: the same number of steps
whatever the order the data arrives in. But the runtime of many of the best algorithms in this
milestone is a statement about a distribution: a random pivot, a random hash, a random sample,
with an expected cost and a small chance of doing worse. To say what that expectation is, and
to add up the costs of a thousand random events without tracking how they depend on each
other, you need one piece of arithmetic. Expectation and indicator variables, next."

**Concept ledger:** introduces `sweep-line`, `event-queue`, `active-set`, `event-tie-breaking`,
`skyline-sweep`, `union-area-sweep`, `segment-intersection-sweep`, `cross-product-orientation`,
`output-sensitive-bound`. Uses topic 93's `interval-depth`, `interval-overlap-predicate`,
`min-heap-of-end-times`; Chapter 6's `binary-heap`, `sift-up-down`; Chapter 4's
`binary-search-tree`, `red-black-invariant`; Chapter 8's `segment-tree`,
`associative-combine-function`; Chapter 2's `monotonic-deque`; Chapter 1's
`element-distinctness`, `decision-tree-model`; `big-o-theta-omega`. Declares nothing new.

**Changes from the chapter plan:** the "element distinctness" reduction named in CHAPTER.md as
needing verification is dropped — the fetched Bentley-Ottmann source states the O(n log n)
lower bound only in terms of algebraic decision-tree models, with no stated connection to
element distinctness, so the reel and post-notes do not state one either.
