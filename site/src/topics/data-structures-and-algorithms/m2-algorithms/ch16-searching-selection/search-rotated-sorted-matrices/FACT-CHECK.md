# FACT-CHECK: Search in rotated and sorted matrices

## Claims table

| # | Claim | Source | Verified how |
|---|---|---|---|
| 1 | At every midpoint of a rotated sorted array, at least one of the two halves is itself sorted ascending | Hello Interview, "Search in Rotated Sorted Array" | Word-for-word quoted in SOURCES.md; independently confirmed in `examples.py` by brute force over every rotation of a 7-element base array and every target in it |
| 2 | Searching for 0 in `[4,5,6,7,0,1,2]`: the left half `[4,5,6,7]` is sorted, and since 0 is not within `[4,7)`, the search recurses into the right half, finding 0 at index 4 | This topic's own construction, matching `CHAPTER.md`'s chosen example | Computed directly in `examples.py`; the sortedness of the left half and 0's absence from its range are both asserted, not just the final index |
| 3 | Finding the rotation point (the array's minimum) is the same invariant applied to the predicate `a[mid] > a[hi]` | This topic's own construction | Computed directly in `examples.py`: `find_rotation_index` on `[4,5,6,7,0,1,2]` returns index 4, the array's actual minimum |
| 4 | When `a[lo] == a[mid] == a[hi]`, neither half can be proven sorted from that comparison alone, and the fix is to shrink the range by one element, giving O(n) worst case | NeetCode, "LeetCode 81 Search In Rotated Sorted Array II Solution & Explanation" | Word-for-word quoted in SOURCES.md; independently constructed and measured in `examples.py`: an array of 200 elements, all but one equal, forces 198 comparisons to find the one different value |
| 5 | A matrix sorted ascending along every row and column, but not as one flattened sequence, is searched in O(m + n) by a corner walk starting at the top-right, not by binary search | GeeksforGeeks, "Search in a row wise and column wise sorted matrix" | Word-for-word quoted in SOURCES.md; independently confirmed in `examples.py` against every value actually present in a constructed 5x5 staircase matrix, by brute force |
| 6 | A fully row-major-sorted matrix (every row's last value less than the next row's first value) reduces to ordinary 1-D binary search via a flattened index, in O(log(mn)) | Standard reduction (not a quoted source; the topic's own construction, cross-checked against the staircase case where the reduction is shown to be invalid) | Computed directly in `examples.py`: a 3x4 row-major matrix search for 16 returns the correct cell in 3 comparisons, within the O(log(mn)) bound; the same flattening is shown NOT to be one sorted sequence when applied to the staircase matrix from claim 5 |

## Currency check

- Both web sources (Hello Interview, NeetCode) were fetched 2026-11-05 as currently published pages. GeeksforGeeks' matrix-search page was likewise fetched 2026-11-05.
- Neither Hello Interview nor NeetCode is a peer-reviewed or canonical algorithms text; both are used only for the invariant statements and the standard worked examples they state, with every numeric claim this topic makes independently verified by direct computation in `examples.py`, not taken from either page's own stated numbers.

## Red team

1. **The adversarial duplicate-array construction is this topic's own**, not copied from NeetCode's page, which addresses a related but distinct problem (value lookup with duplicates, not locating one differing value inside a run of identical ones). The specific placement (one spot before the end) was found by direct experimentation in `examples.py`'s development, not asserted from a formula — recorded here so the construction is not mistaken for a citation.
2. **The staircase matrix's O(m+n) bound is an upper bound on the number of steps**, not a claim that every search actually takes exactly m+n steps — `examples.py` asserts the measured step count is at most `rows + cols`, not that it equals it.
3. **The row-major reduction's validity depends entirely on the structural assumption stated in the claim** (every row's last element less than the next row's first): this topic shows directly, by flattening the staircase matrix and checking it is not sorted, that applying the same flattening to a matrix that is only row/column-sorted (not row-major-sorted) would search an unsorted sequence — stated explicitly so a reader does not conflate the two matrix shapes.
4. **No claim is made about the real-world frequency of rotated arrays with adversarial duplicate patterns** — the degradation is presented as a worst-case bound a caller must be aware of, not as a common occurrence.
