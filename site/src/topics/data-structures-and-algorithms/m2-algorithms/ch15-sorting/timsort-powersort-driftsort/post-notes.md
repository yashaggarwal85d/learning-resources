---
id: dsa.timsort-powersort-driftsort
title: Timsort, Powersort and driftsort
---

<section data-section="outcomes">

## After this topic you can

- Run Timsort's first stage: detect runs, extend short ones to minrun, and say which input shapes finish in n − 1 comparisons.
- Explain galloping with a worked comparison count and say when it loses.
- Reproduce the 2015 invariant failure on 120, 80, 25, 20, 30 and say what the fix checks; compute a run's power and say what Powersort's rule guarantees.
- Say what changed in CPython and in Rust's standard library, and in which release, from a primary source.

</section>

<section data-section="internals">

## Into the internals

### Why a local invariant check isn't a global one

The original merge policy's invariant (each pending run longer than the sum of the next two) is a statement about *every* consecutive triple on the stack, but `mergeCollapse` only re-establishes it by checking the top three entries after a merge. A merge that fixes the top of the stack can still leave an older, deeper triple broken, because nothing in the loop ever looks back down. The fix (checking four entries, not three) isn't a bigger version of the same idea by accident — it's the minimum needed to see one level further than the merge that just happened, which is exactly how deep a single merge's effect can reach.

### Why Powersort's "power" is a merge-tree depth, not a size ratio

It's tempting to think a run pair's power measures how different their sizes are, but it measures something more specific: the depth, in an *ideal* binary merge tree built from where the runs sit in the whole array, of the node that would join them. Two tiny, perfectly balanced runs deep inside a much larger array (like the 10-and-10 pair in the lab) get a *high* power — not because they're small, but because an ideal tree would join them early, deep in its structure, long before it reaches the root. Size alone doesn't predict power; position does too.

</section>

<section data-section="lab">

## In the lab

`examples.py` detects runs (ascending, or descending reversed in place) on CPython's own worked example, extends them with a binary insertion sort, and reproduces the pre-2025 minrun-selection scheme on the N=2,112 case the library's own file names. It measures galloping's exact comparison count against linear search across the first several positions, confirming the crossover at i=6 and the two losing cases below it. It transcribes the JDK's own (buggy) `mergeCollapse` loop and reproduces the 2015 paper's exact run-length example, confirming the invariant breaks at the leftmost triple. It computes Powersort's node-power function exactly, via fractions rather than floating point, on both of `CHAPTER.md`'s own planning examples. It reproduces Stefan Pochmann's 2025 minrun scheme on CPython's own 315-element worked example, confirming both the old and new run-length lists. Driftsort's own scratch-memory allocation formula is shown only as a direct computation of its own stated formula, not reimplemented.

</section>

<section data-section="production">

## In production

CPython switched its list sort to the Powersort merge policy in version 3.11 (bpo-34561, dated 2021-09-01 in the changelog, confirmed absent one tag earlier at 3.10.0). As of a 2025 change on CPython's own development branch — not yet in a tagged release — minrun selection itself changed again, from a single fixed value to Stefan Pochmann's scheme allowing at most two run lengths that differ by one. Rust's standard library switched its stable sort to driftsort (Peters and Bergdoll) in Rust 1.81.0 (announced 2024-09-05): the documentation describes it as combining quicksort's fast average case with mergesort's fast worst case and partial run detection, allocating scratch memory as max(n/2, min(n, 8MB)), and falling back to mergesort — not heapsort — past its own introsort-style depth limit.

</section>

<section data-section="frontier">

## The frontier

Driftsort's own design document credits its core structure to glidesort, also by Orson Peters, and this topic does not open glidesort's own writeup pages to verify the more specific mechanism (run creation and a lazy merge strategy) that `CHAPTER.md` names — only the general lineage claim (driftsort's structure derives from glidesort) is sourced directly this session. A fuller account of glidesort's own internals, and of exactly how driftsort's logical runs decide between a detected run and a lazily-quicksorted stretch, is left for a reader who opens that writeup directly.

</section>

<section data-section="questions">

## More questions

- Powersort's rule keeps the stack's stored powers strictly decreasing. What would go wrong — concretely, which stability guarantee would break first — if two adjacent runs with *equal* power were allowed to sit on the stack without merging?
- The 2015 bug's smallest crashing counterexample needed over 67 million elements. Is there a smaller input that merely *breaks the invariant* without actually crashing (i.e., without ever triggering the overflowed stack array), and if so, roughly how much smaller?

</section>

<section data-section="next">

## Where this goes next

Timsort and its descendants get as close to optimal as comparison sorting allows, by noticing the order the data already has. They still compare keys, so the n log n floor still stands over them. The floor belongs to a model, though, and the model has a door in it: if the keys are integers, or can be turned into byte strings, you do not have to compare them at all, you can read them one digit at a time. Counting, radix and bucket sort, next.

</section>
