Last verified: 2026-11-05. Expert sign-off: pending.

- "Search in Rotated Sorted Array" (Hello Interview) — the invariant that one half of a rotated sorted array is always sorted, and the standard worked example. [source](https://www.hellointerview.com/learn/code/binary-search/search-in-rotated-sorted-array)
- "LeetCode 81 Search In Rotated Sorted Array II Solution & Explanation" (NeetCode) — why duplicate keys force the search to fall back to a linear shrink, and its O(n) worst case. [source](https://neetcode.io/solutions/search-in-rotated-sorted-array-ii)
- "Search in a row wise and column wise sorted matrix" (GeeksforGeeks) — the top-right corner walk that searches a staircase matrix in O(m + n). [source](https://www.geeksforgeeks.org/dsa/search-in-row-wise-and-column-wise-sorted-matrix/)

The row-major matrix reduction (flattening a fully row-major-sorted matrix to a 1-D binary search) is a standard reduction, not drawn from a quoted source; it is checked directly in `examples.py`, including the contrast case showing the same flattening is invalid on a matrix that is only row/column-sorted, not row-major-sorted.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=search-rotated-sorted-matrices:%20).
