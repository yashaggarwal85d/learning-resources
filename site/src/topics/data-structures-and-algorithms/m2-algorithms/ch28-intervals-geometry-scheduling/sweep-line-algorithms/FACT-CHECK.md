# Fact-check — dsa.sweep-line-algorithms

| # | Claim | Status | Source |
|---|---|---|---|
| 1 | Bentley-Ottmann reports all k crossings among n segments in O((n+k) log n) time, O(n) space | Confirmed | SOURCES.md §1, §3 |
| 2 | The active set is a balanced BST ordered by y at the sweep's current x; two segments can only cross after becoming neighbours in that order | Confirmed | SOURCES.md §1 |
| 3 | Klee considered the 1-D union-of-intervals problem in 1977; Bentley extended it to 2-D (rectangle union area) the same year, by sweeping a vertical line | Confirmed | SOURCES.md §2 |
| 4 | Bentley's algorithm generalizes to d dimensions with running time O(n^(d-1) log n) | Confirmed | SOURCES.md §2 |
| 5 | Shamos and Hoey (FOCS 1976, pp. 208-215) decide only whether any two segments cross, in O(n log n) | Confirmed | SOURCES.md §3 |
| 6 | The O(n log n) part of Bentley-Ottmann's bound is a matching lower bound in algebraic decision-tree models of computation | Confirmed | SOURCES.md §1 |
| 7 | That lower bound reduces from Chapter 1's element distinctness | **Not confirmed — dropped.** The fetched source states the lower bound only in terms of algebraic decision-tree models and cites Clarkson/Mulmuley/Chazelle & Edelsbrunner/Balaban for faster algorithms; it never mentions element distinctness. CHAPTER.md flagged this as needing verification before being said; since it isn't confirmed, the reel and post-notes do not state it. |
| 8 | Faster algorithms exist: Clarkson (1988), Mulmuley (1988) in expected O(n log n + k); Chazelle & Edelsbrunner (1992) deterministically in the same bound; Balaban (1995) in O(n log n + k) time and O(n) space | Confirmed | SOURCES.md §1 |
| 9 | DuckDB's IEJoin sorts both tables on the first condition, merges the sort keys, then sorts the combined positions on the second condition | Confirmed | SOURCES.md §4 |
| 10 | Skyline key points, rectangle union area (29 against a sum of 34), 8-segment crossing count (2 against 28 pairs), and the n=50/200/1000 scaling numbers | Confirmed by direct computation | `examples.py`, run and asserted |

## Red team

- **Tie-breaking direction.** The reel states "ends are processed before starts at the same
  x" for half-open intervals. This matches topic 93's convention (`[s, e)`, derived there and
  reused unchanged per CHAPTER.md) — an interval ending exactly where another starts does not
  overlap it, so the ending interval's active-set removal must be processed first or the two
  would wrongly register as overlapping for an instant. Checked by hand against the skyline
  and union-area sweeps in `examples.py`: both process a rectangle's end as a same-x event
  that does not extend the previous key point or area count past that x. Consistent.

- **Lazy deletion's correctness, not just its cost.** The skyline's max-heap can hold
  buildings whose right edge has already passed; the reel claims the heap is still correct
  because a stale entry is only removed when it would otherwise surface at the top. Verified
  against `skyline()` in `examples.py`: the `while live and live[0][1] <= x` loop pops every
  stale top before reading the current maximum, at every event, so a stale entry can delay a
  pop but never produce a wrong `cur_max`.

- **The union-area number is not a coincidence of the test data.** 29 against a sum of 34
  means 5 units are double-counted between overlapping rectangles. Verified independently of
  the sweep with a direct pairwise-overlap check: rectangles 1 `[0,4]×[0,3]` and 2
  `[2,6]×[1,5]` overlap over `x∈[2,4], y∈[1,3]`, area 4; rectangles 2 and 3 `[5,8]×[0,2]`
  overlap over `x∈[5,6], y∈[1,2]`, area 1; rectangles 1 and 3 do not overlap at all (0). Total
  double-counted: 4+1=5, and 34−5=29 — matches `union_area_sweep`'s output exactly by an
  independent method. The reel states only the computed 29, never this decomposition.

- **The 8-segment anecdote's specificity.** CHAPTER.md names "8 random segments had 2
  crossings against 28 pairs" as a planning-time observation; `examples.py` reproduces it
  exactly with a fixed seed (6) over a 20×20 grid, so the number is not an unverified citation
  but a figure this topic's own code generates and asserts.

- **Predict-distractor plausibility.** Step 2's wrong options ("all 28", "pairs overlapping in
  x", "half at random") are each a rule a learner could plausibly reach for: "all 28" is the
  naive scan; "overlapping in x" sounds sweep-like but over-counts (two segments can overlap
  in x without ever becoming vertical neighbours); "half at random" is a decoy with no
  algorithmic basis. Step 7's distractors (running count, rebuilt sorted array, hash set) each
  fail a real requirement (a count can't say *where* coverage changes; a rebuilt array is
  O(n) per event, not O(log n); a hash set can't answer "total covered length" without a scan).
  Step 11's distractors ("always faster", "only for small n", "always exactly equal") are each
  a plausible but wrong generalization from the n=1000 data point shown one step later.
