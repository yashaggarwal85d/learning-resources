---
id: dsa.merge-sort
title: Merge sort
---

<section data-section="outcomes">

## After this topic you can

- Write a stable merge and say in one line why it is stable, then build top-down and bottom-up merge sort from it and say when their counts differ.
- Give merge sort's worst-case comparison count exactly for small n and say how far it is from ⌈lg n!⌉.
- Explain why a merge needs spare space, what Timsort's min(A, B) refinement saves, and why a natural merge sort adapts to input that already has runs.

</section>

<section data-section="internals">

## Into the internals

### The merge procedure's own bound, restated precisely

A merge of an m-length and an n-length sorted range costs at least min(m, n) comparisons (one list empties out first, with no comparisons spent on the rest) and at most m + n − 1 (every element but the very last is compared at least once before being placed; the last placement needs no comparison because only one element is left). Both bounds are tight, not loose approximations — `examples.py` hits both exactly.

### Top-down and bottom-up are the same merges, in a different order

Both strategies, at bottom, perform the identical set of operations on a power-of-two-sized input: n/2 merges of size 1, n/4 of size 2, and so on, down to one merge of size n/2. The *order* differs (recursive post-order for top-down, iterative sweep for bottom-up), but the multiset of merge sizes is identical, so the comparison counts match exactly. Off a power of two, top-down's recursive midpoint split and bottom-up's fixed doubling can assign a different-sized "odd piece" to some of the smaller merges, which is where the two counts can part ways.

### The stability proof is one line, not an induction

A merge is stable exactly when, on a tie, it takes the left-hand key — because the left-hand range's own elements, among themselves, are already in their original relative order (by induction on the recursion, or trivially by construction in the bottom-up sweep), and never reordering a left-tie against a right-tie preserves that property one level up. The entire argument collapses to the single `<=` in the merge's own comparison.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds the merge procedure, instrumented to count its own comparisons, and checks both of its stated bounds exactly on an eight-and-eight merge. It then builds top-down and bottom-up merge sort, both instrumented identically, and confirms their counts always agree at power-of-two sizes (four, eight, sixteen, thirty-two, five seeds each) and can disagree off a power of two (five, six, seven, nine, eleven, thirteen, twenty seeds each). The worst-case formula is checked two ways: by brute force over every permutation of four through eight keys (40,320 permutations at the largest size), and against the information-theoretic bound computed via `math.lgamma` (to avoid converting a number as large as 1,024-factorial to a float directly) — both confirm the planning table exactly, including the roughly five-percent gap at 1,024 keys and the gap staying under fifty-three hundredths of the input size all the way to 200,000. Stability is shown directly on a tagged three-key tie, and broken by changing one comparison operator. The three buffer strategies are each implemented and their own peak auxiliary-array sizes measured on the chapter's own sixteen-key deck. Natural merge sort is built from a single linear run-finding pass, and its own run count is checked exactly on sorted input (one run), reversed input (one run per key), and measured over five hundred trials of a two-hundred-key random shuffle (about a hundred runs, matching the "close to half" planning claim).

</section>

<section data-section="production">

## In production

No production sort ships the textbook top-down merge sort exactly as built here — every real object/stable sort in wide use (Python's `list.sort`, Java's `Arrays.sort` on objects, Rust's `slice::sort`) is a descendant of Tim Peters's Timsort, which adds real run detection, a smarter merge policy than "always merge the next two," and the min(A, B) buffer refinement this topic names. Run detection, galloping, and the merge-policy choice are left to topic 52 (Timsort, Powersort and driftsort) in full; this topic's own natural merge sort is the simplest version of the identical idea, stripped down to exactly what "find the runs, merge them pairwise" needs to show.

</section>

<section data-section="frontier">

## The frontier

The lock-step parallel merge (merge path, used by DuckDB's own sort) and SIMD-parallel merging are both named here only in passing — this chapter's own syllabus marks the SIMD and parallel sorting topic as skipped (`syllabus/review-notes/dsa-cuts.md`), so neither mechanism is built in this topic or any later one in this chapter.

</section>

<section data-section="questions">

## More questions

- The merge's own worst case (a perfect interleaving) happens to be exactly the input shape that gives the *most* information per comparison in an information-theoretic sense. Is that a coincidence, or is there a reason a merge's hardest case for comparison count is also its most "informative" case?
- Bottom-up merge sort never recurses, so it never needs a call stack — but does it need any other form of bookkeeping top-down doesn't, to know where each width's own runs start and end?

</section>

<section data-section="next">

## Where this goes next

Merge sort guarantees n log n comparisons and keeps equal keys in order, and it pays for both with a second array. There is a second way to divide: do the splitting first, by choosing a key and moving everything smaller to one side and everything larger to the other, and then the two halves never have to be merged at all. That version works in the array it was given, and on random input it is usually the fastest of all, with one weakness that decides how it is built. Quicksort and partitioning schemes, next.

</section>
