---
id: dsa.quicksort-partitioning-schemes
title: Quicksort and partitioning schemes
---

<section data-section="outcomes">

## After this topic you can

- Write Lomuto, Hoare and three-way partition, and say what each does on an all-equal, a sorted and a four-value input, with the counts.
- Say what a random pivot and a median-of-three pivot each guarantee and what neither does, and why a production quicksort still needs a depth limit.
- Explain why a data-dependent comparison branch costs a quicksort on random input, how block partitioning removes it, and read a measured branch-miss number against its machine.

</section>

<section data-section="internals">

## Into the internals

### Why "recurse on the smaller side" bounds the stack

Each recursive call that actually happens is on a range at most half the size of its parent (if it were more than half, the *other* side would have been the smaller one, and that is the side recursed on instead). A chain of calls that each at least halves the range can be at most ⌈log₂ n⌉ long before the range is empty — the stack depth bound holds regardless of how lopsided any single partition turns out to be, which is why it stays flat even on Lomuto's own worst-case input.

### Why a single sorted run can't fool median-of-three, but two runs can

Median-of-three samples the first, middle and last key of the *current* range. On one ascending or descending run, those three positions are always in the same relative order as their values — the middle position always holds a value between the two ends, so the sample is never fooled into picking an extreme. Stitch two ascending runs together, and the middle index of the combined range can fall inside either run: its value is no longer reliably "between" the first and last keys of the combined range, and the sample can be fooled at every level of the recursion, not just once.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds Lomuto (last-element pivot), Hoare (middle-element pivot) and three-way (Dutch national flag) partitioning, each instrumented to count comparisons and swaps, and measures all three on 1,024-key all-equal, sorted and four-distinct-value inputs, plus swap counts on 1,024 random distinct keys. It confirms the stack-depth bound directly (depth zero on Lomuto's own worst case, against a 2·⌈lg(n+1)⌉ ceiling). A randomized-pivot quicksort's average comparison count over 200 trials is checked against its own closed-form expectation (within a tenth of a percent). Median-of-three is measured on sorted and reversed input, then a from-scratch median-of-three killer — two ascending runs concatenated — is verified to cost a constant fraction of n² across four sizes spanning a 16× range, confirmed quadratic (not just a worse constant) rather than assumed. Dual-pivot quicksort and branchless block partitioning are named only, from their own primary sources, per this topic's own scope.

</section>

<section data-section="production">

## In production

The JDK's own `java.util.Arrays.sort` for primitive arrays is `DualPivotQuicksort`, read directly at the `jdk-21-ga` tag: a depth limit (`MAX_RECURSION_DEPTH = 64 * DELTA`, with `DELTA = 3 << 1`, giving 384) that falls back to heapsort, a pre-check (`tryMergeRuns`) for input that already has long runs, and counting sort for small-range primitive types (`byte`, `char`, `short`). Object arrays use a Timsort descendant instead — the identical stability split named in topic 49. BlockQuicksort's branchless partitioning is cited (not built) as the technique behind Rust's ipnsort and pdqsort-family sorts, a post-notes mention only, not verified against the Rust source this session.

</section>

<section data-section="frontier">

## The frontier

A full McIlroy-style adaptive adversary — one that defeats *any* fixed pivot rule satisfying a stated set of assumptions, not just this topic's own static two-runs construction against this topic's own fixed median-of-three rule — is a harder, published research result (his 1999 paper) that this session could not fetch; this topic's own construction demonstrates the identical underlying mechanism (a fixed sample missing the true median) without claiming to generalize to every possible pivot rule the way his adversary does.

</section>

<section data-section="questions">

## More questions

- The median-of-three killer here needs exactly two runs. Would three or more interleaved runs make the attack *easier* to build, *harder*, or roughly the same difficulty?
- Three-way partitioning does more swaps than Hoare on random distinct keys. Is there a cheap, one-pass way to decide, before partitioning starts, whether a range is duplicate-heavy enough to be worth the extra swaps?

</section>

<section data-section="next">

## Where this goes next

Quicksort is usually the fastest of the comparison sorts, and every one of its improvements, a random pivot, a median of three, a depth counter, exists because of one fact: with an unlucky pivot every time, it takes quadratic time, and an adversary can arrange that. A production sort cannot promise n log n on every input unless something stands behind the quicksort. There is a sort that gives that promise outright, in place, with no spare array: it uses the heap from Chapter six. Heapsort, next.

</section>
