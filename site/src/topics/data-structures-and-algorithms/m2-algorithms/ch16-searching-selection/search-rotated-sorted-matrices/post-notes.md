---
id: dsa.search-rotated-sorted-matrices
title: Search in rotated and sorted matrices
---

<section data-section="outcomes">

## After this topic you can

- Prove and use the invariant that one half of a rotated sorted array is always sorted, and search it in O(log n); state why duplicate keys can force O(n).
- Search a row/column-sorted (staircase) matrix in O(m + n) and explain why this is not binary search.
- Search a fully row-major-sorted matrix in O(log(mn)) by flattening the index, and say which structural assumption makes that reduction valid.

</section>

<section data-section="internals">

## Into the internals

### Why one half is always sorted

A sorted array, rotated once at some unknown point, has exactly one place where the ascending order breaks (the rotation point). Any midpoint of the array either falls on the same side of that break as both endpoints of one half — in which case that whole half is still ascending — or it falls between the break and one endpoint, in which case the *other* half is the one still ascending. There is only one break, so it can only disrupt one of the two halves at any given split; the other is untouched by it. This is the entire argument, not a special case to memorise for each possible rotation.

### Why duplicates genuinely erase the invariant, not just slow it

With distinct keys, comparing the first element to the middle element always resolves which half is sorted: either they're equal (only possible for a one-element half) or one is strictly less, pinning down the ascending side. With duplicates, `a[lo] == a[mid]` is possible even when the rotation point sits between them — the comparison simply can't distinguish "this half happens to start and end on the same repeated value" from "this half is fully sorted." No cleverer single comparison fixes this; the only sound move left is to shrink by one element and try again, which is why the worst case becomes linear, not merely slower by a constant.

</section>

<section data-section="lab">

## In the lab

`examples.py` implements `search_rotated` and confirms it against every rotation of a 7-element base array and every possible target, by brute force, not just the chapter's own worked example (searching for 0 in `[4,5,6,7,0,1,2]`, found at index 4). A separate `find_rotation_index` locates the array's minimum using the identical halving aimed at a different predicate. The duplicate-key degradation is constructed directly: an array of 200 elements, 199 of them equal, with the one different value placed one position before the end, forces 198 comparisons versus a clean rotation's handful. The staircase matrix search is checked against every value actually present in a constructed 5x5 matrix by brute force, and the row-major reduction is checked against a separate 3x4 matrix, with the staircase matrix explicitly shown (by flattening it and checking the result is not sorted) to be the wrong shape for that same reduction.

</section>

<section data-section="production">

## In production

Rotated-array search shows up directly in systems that treat a circular buffer or a log segment as if it were one logical sorted range (a ring buffer's write pointer rotating through a fixed-size array, a time-series index that wraps). Staircase-matrix search is the shape of any two-dimensional index where two independent sort orders hold simultaneously but no single global order does — a spreadsheet-style grid sorted by row and by column, or a leaderboard table sorted by two criteria at once. The row-major reduction is exactly what a flattened, contiguous 2-D buffer gives you for free, and is why some libraries expose a 2-D array's search as ordinary 1-D binary search under the hood when the storage layout guarantees it.

</section>

<section data-section="frontier">

## The frontier

This topic treats the rotated array as rotated exactly once, with at most one rotation point; a reader curious about arrays rotated by applying the operation repeatedly, or about multi-dimensional generalisations of the staircase search to more than two dimensions, is past what this topic builds. Neither is covered here.

</section>

<section data-section="questions">

## More questions

- The adversarial duplicate-key array in this topic has the one different value placed deliberately. Is there a duplicate-heavy array where the search actually stays fast despite the duplicates — and what would have to be true about where the differing values sit?
- The staircase matrix's corner walk starts at the top-right. Would starting at the bottom-left work just as well, and is there a corner where it would not work at all?

</section>

<section data-section="next">

## Where this goes next

Every search this chapter has built has assumed order already exists somewhere to exploit — in an array, in the answer space, or split across a rotation or a matrix's two axes. The next question has none: finding the k-th smallest element of an unsorted collection, as fast as possible, without paying to sort the rest. Quickselect and median-of-medians, next.

</section>
