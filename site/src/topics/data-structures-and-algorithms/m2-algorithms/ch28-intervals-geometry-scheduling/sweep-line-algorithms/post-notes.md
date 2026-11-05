---
id: dsa.sweep-line-algorithms
title: Sweep-line algorithms
---

<section data-section="outcomes">

## After this topic you can

- State the sweep skeleton (events, active set, tie rule) and name an event set and active-set
  structure for a new problem.
- Produce a skyline with a lazy-deletion max-heap, and a rectangle union's area with a
  cover-count sweep.
- Explain why Bentley–Ottmann only ever tests neighbours, derive O((n + k) log n), and say
  when the all-pairs scan wins instead.
- Name the one geometric primitive the algorithm needs and what breaks it.

</section>

<section data-section="internals">

## Into the internals

### The lazy-deletion heap's amortized cost

The skyline's max-heap can hold entries for buildings whose right edge has already passed.
Each such entry is pushed exactly once (at its building's left edge) and popped at most once
(either when it is cleaned off the top, or never, if it is still live at the end), so across
the whole sweep the heap does at most `2n` operations at `O(log n)` each — the staleness costs
nothing beyond the one push and one pop every entry gets regardless.

### The segment tree's non-propagating use

The union-area sweep's segment tree stores a cover count and a covered length per node, and an
event only ever adds or subtracts 1 at the O(log n) canonical nodes covering an interval,
recomputing each ancestor's covered length on the way back up. There is nothing to push down
to children, because a node's covered length depends only on its own count and its children's
lengths, never the other way around — the "lazy propagation" Chapter 8 teaches for range
updates is not needed here.

### The correctness invariant, restated

Bentley–Ottmann's one invariant: the search tree's order is always the true vertical order of
the segments at the sweep line's current x-position. Because two segments can only swap
relative order by crossing, and a crossing can only happen between segments that are adjacent
in that order just before it, every crossing is found by testing only newly-adjacent pairs —
never by testing a pair that never becomes neighbours.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs every number in this topic directly: the skyline's seven key points from
five buildings, the rectangle union's 29 against a sum of 34 for three rectangles, the eight
seeded segments' 2 crossings against 28 pairs, and the scaling set (n=50, 200, 1000) where
crossings grow to 3, 5 and 48 while the pairs an all-pairs scan would test grow to 1225, 19900
and 499500. Re-run `union_area_sweep` and `skyline` on a different seeded set of rectangles or
buildings and check the sweep's output against a brute-force pairwise-overlap sum (the same
cross-check `FACT-CHECK.md` used on the running data) — the two must always agree.

</section>

<section data-section="production">

## In production

**DuckDB's IEJoin** (the DuckDB blog, "Range Joins in DuckDB") answers a two-inequality join
the same way this topic sweeps a line: "The way that IEJoin works is to first sort both tables
on the values for the first condition and merge the two sort keys into a combined table that
tracks the two input tables' row numbers. Next, it sorts the positions in the combined table
on the second range condition." The query-plan machinery around this (which join operator a
planner picks, how it compares to a hash join) is Data Engineering's own subject; this topic
only shows that sorting an endpoint order once is the same idea one layer down.

</section>

<section data-section="frontier">

## The frontier

Faster algorithms for segment intersection exist and are named without being built: Clarkson
(1988) and Mulmuley (1988) construct the full arrangement in expected `O(n log n + k)` time;
Chazelle and Edelsbrunner (1992) do the same deterministically; Balaban (1995) lists every
intersection in `O(n log n + k)` time and `O(n)` space, matching Bentley–Ottmann's space bound
while improving its time. The standard textbook treatment of the whole sweep skeleton is de
Berg, Cheong, van Kreveld and Overmars's *Computational Geometry: Algorithms and Applications*,
named here and not opened.

This topic works entirely in **general position** with exact integer coordinates. Real
geometric input is neither: floating-point coordinates make the cross-product sign test
unreliable exactly when it matters most (near-zero results, where rounding error can flip the
sign), and shared endpoints or three segments through one point break the "exactly two
segments become neighbours" assumption the whole algorithm leans on. Repairing this is the
subject of **orientation tests and robust predicates** — Shewchuk's exact and adaptive
geometric predicates (*Discrete & Computational Geometry* 18(3), 1997) are the standard fix,
named here only. Orientation tests, convex hulls, and Voronoi diagrams and Delaunay
triangulation are this chapter's skipped half (`syllabus/review-notes/dsa-cuts.md`) and are
not built in this topic.

</section>

<section data-section="next">

## Where this goes next

Chapter 29 asks what changes once an algorithm is allowed to flip coins: a running time that
is a random variable rather than a fixed promise, and the arithmetic — expectation and
indicator variables — needed to say what that expected cost is.

</section>
