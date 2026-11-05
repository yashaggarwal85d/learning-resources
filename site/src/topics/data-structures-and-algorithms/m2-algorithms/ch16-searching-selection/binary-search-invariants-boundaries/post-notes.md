---
id: dsa.binary-search-invariants-boundaries
title: Binary search invariants and boundaries
---

<section data-section="outcomes">

## After this topic you can

- State and keep a loop invariant for a half-open binary search, and say why the half-open convention makes the empty-range and termination cases trivial.
- Implement lower_bound and upper_bound and use them to count occurrences and find first/last occurrence.
- Explain the 2006 midpoint overflow bug from the primary source, write the safe midpoint, and reproduce an overflow failure on a small bound.

</section>

<section data-section="internals">

## Into the internals

### Why half-open, specifically

A closed range `[lo, hi]` still works, but its two edge cases are both sharper corners than the half-open version's: the empty range is `lo > hi` (a strict inequality that must be checked, not simply `lo == hi`), and a search that narrows to a single candidate must still re-examine it rather than simply exiting. Half-open folds both into one condition, `lo == hi`, because `hi` was never itself a candidate to begin with — it was always "one past the end of what remains."

### The language-specific fix, named but not taught as the general one

The JDK's own shipped fix for `Arrays.binarySearch`, `(low + high) >>> 1` (Java's unsigned right shift), is correct in Java specifically because Java defines `>>>` to treat its operand's bits as unsigned regardless of the value's sign. C and C++ have no portable equivalent operator, and Bloch's own first proposal for those languages — a cast to `unsigned int` before the addition — was later shown not to be guaranteed by the C99 standard, since signed integer overflow is undefined behaviour in C. The one fix with no language-specific dependency is `low + ((high - low) / 2)`, which this topic teaches as *the* safe midpoint for exactly that reason.

### Recursion against iteration

A recursive binary search keeps the identical invariant on every call, but each call adds a stack frame, so a recursive implementation costs O(log n) stack space against the iterative loop's O(1). Neither change the comparison count; the choice is purely about memory and, in some languages, function-call overhead.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds `lower_bound` and `upper_bound` from the half-open loop and checks both against a twelve-element array with a run of three equal keys: `lower_bound(3)` lands on the first of the three, `upper_bound(3)` one past the last, their difference gives the exact count (three), and first/last occurrence both come out correct. A key absent entirely from the array is checked separately, confirming `lower_bound` and `upper_bound` agree exactly when nothing equals the target. The overflow is reproduced, not asserted: an eight-bit two's-complement simulation shows `70 + 90 = 160` exceeding the eight-bit signed maximum of 127, wrapping to `−96`, and the naive midpoint line producing a negative "index" (`−48`) where the safe line produces the correct one (`80`). The termination bound is checked exhaustively — not assumed from the "obvious" absent-key case, which the Red team in `FACT-CHECK.md` shows actually understates the true worst case — over every possible target for array sizes up to 1,000, and via the single slowest path for 1,000,000, confirming the formula `⌈log₂(n + 1)⌉` exactly, including the twenty-iteration figure at a million keys.

</section>

<section data-section="production">

## In production

Every mainstream standard library's binary search family (C++'s `std::lower_bound`/`std::upper_bound`, Java's `Arrays.binarySearch`, Rust's `slice::binary_search`) is built from exactly this half-open, overflow-safe loop; the naming convention this topic uses (`lower_bound`/`upper_bound`) is the C++ standard library's own, read directly from its reference documentation. The overflow bug itself is historical — it was fixed in the JDK and is not present in any current mainstream library's shipped binary search — but the *shape* of the mistake (summing two values that are each individually safe, and getting an unsafe result) recurs anywhere a midpoint, an average, or a checksum is computed from two user-controlled or attacker-controlled bounds, which is why the topic teaches the safe form as a habit, not a one-off fix for one bug.

</section>

<section data-section="frontier">

## The frontier

Cache-friendly and branchless binary search (conditional moves instead of branches, the Eytzinger/BFS layout with prefetching, and SIMD-searched static B-tree layouts) and exponential/interpolation search are both named once here and built nowhere in this chapter: `syllabus/review-notes/dsa-cuts.md` marks both as skipped for Chapter 16. Galloping, the exponential-search idea bounding an unbounded range, is taught in full where it already lives, Chapter 15 topic 52's "galloping merges."

</section>

<section data-section="questions">

## More questions

- The half-open convention makes `lo == hi` the one empty-range check. Is there a search or range-manipulation idea elsewhere in this course where the *closed* convention would actually be the simpler one, and if so, what makes it different from this case?
- The overflow bug's fix changes exactly one line and nothing about the algorithm's logic. What does that say about how much of "getting binary search right" is really about the algorithm, versus about the arithmetic underneath it?

</section>

<section data-section="next">

## Where this goes next

Binary search as built here only ever asks one kind of question: is the candidate at this index too small, too big, or the boundary itself. The same loop answers a very different-looking question if the thing being tested is not an array lookup but any yes/no test that flips exactly once as a parameter increases: can this courier finish the route by this hour, is this capacity enough. The loop does not change; only what counts as the predicate does. Binary search on the answer, next.

</section>
