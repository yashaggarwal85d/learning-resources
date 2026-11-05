## Hello Interview — "Search in Rotated Sorted Array"

URL: https://www.hellointerview.com/learn/code/binary-search/search-in-rotated-sorted-array
Version: fetched 2026-11-05, the page as currently published

> The visual below shows the same sorted array rotated at different points, including no rotation at all. If we draw a line down the middle element of each array, this splits the array into two halves. Notice how at least one of the halves is always sorted in ascending order, shown in dark green in the visual.

> In a rotated search array, the middle element mid will sometimes be less than the first element left. This happens when the rotation occurs somewhere between left and mid, meaning the right half of the array is sorted.

### Contents (item by item, this topic's scope)

- The core invariant this topic's first half builds on: at every midpoint of a rotated sorted array, at least one of the two halves is itself sorted ascending — independently confirming this is a recognised technique, not this topic's own claim. Used by the rotated-array search step.
- How to tell which half is sorted (comparing the middle element to the first element of the current range) — the exact test this topic's `examples.py` implements (`nums[lo] <= nums[mid]`). Used by the "determining the sorted half" step.
- The worked example array `[4,5,6,7,0,1,2]`, matching this topic's own chosen example from `CHAPTER.md`, independently confirming it as a standard teaching instance rather than an invented one.

### Red team note on this source

This page is a coding-interview teaching site, not a peer-reviewed or canonical algorithms reference; it is used here only for the invariant's statement and the standard worked example, both of which this topic also verifies independently by brute force over every rotation of a base array in `examples.py`, not taken on the page's authority alone.

## NeetCode — "LeetCode 81 Search In Rotated Sorted Array II Solution & Explanation"

URL: https://neetcode.io/solutions/search-in-rotated-sorted-array-ii
Version: fetched 2026-11-05, the page as currently published

> A rotated sorted array with duplicates still has a useful property: at least one half (left or right of mid) is always sorted. We can determine which half is sorted and check if the target lies within that range. The tricky case is when nums[l] == nums[m], which means we cannot tell which side is sorted. In this case, we simply increment l to skip the duplicate and try again.

> Unlike the non-duplicate version, this problem has O(n) worst-case time complexity when all elements are duplicates except one. Assuming O(log n) performance and not accounting for this edge case in time-sensitive applications can lead to timeout issues.

### Contents (item by item, this topic's scope)

- The duplicate-keys failure mode this topic states honestly rather than hiding: when the ambiguous case (`nums[lo] == nums[mid]`, generalised in this topic's own code to the stricter `nums[lo] == nums[mid] == nums[hi]`) prevents telling which half is sorted, the fix is to shrink the range by one element at a time, which gives the search's worst case as O(n), not O(log n). Used by the duplicate-keys step.
- The explicit statement that this O(n) worst case is a real, nameable risk ("can lead to timeout issues"), not a theoretical curiosity — used to frame why this topic states the degradation honestly instead of only showing the happy path.

### Red team note on this source

This page covers a close relative (LeetCode 81, target lookup with duplicates) rather than this topic's own worst-case construction (locating a single different value at a known position among a run of duplicates); this topic's own `examples.py` constructs and directly measures the comparison count on its own adversarial input, rather than citing a specific count from this source.

## GeeksforGeeks — "Search in a row wise and column wise sorted matrix"

URL: https://www.geeksforgeeks.org/dsa/search-in-row-wise-and-column-wise-sorted-matrix/
Version: fetched 2026-11-05, the page as currently published

> [Expected Approach] Eliminating rows or columns - O(n + m) Time and O(1) Space
> Since the matrix is sorted both row-wise and column-wise, the search space can be reduced after each comparison.
> Start from the top-right corner and compare the current element with x.
> If x > mat[i][j], all elements to the left are smaller than x. So, the current row can be skipped, and move down to the next row.
> If x < mat[i][j], all elements below are greater than x. So, the current column can be skipped, and move left to the previous column.
> If x == mat[i][j], the element is found, so return true.

### Contents (item by item, this topic's scope)

- The staircase search itself: starting at the top-right corner and discarding a whole row or column per comparison, giving O(m + n) time and O(1) space — the exact algorithm this topic's `search_staircase` implements, cross-checked against a from-scratch correctness argument (brute-force confirmation over every value actually in the matrix) rather than taken on trust. Used by the staircase-matrix step.
- The explicit contrast the page itself draws against a slower alternative (binary search on each row, O(n·log m)) and the naive full scan (O(n·m)) — used to frame why the corner walk, not binary search, is the right tool here.

### Red team note on this source

GeeksforGeeks' own article is read directly for its stated algorithm and complexity, not inferred from a title or summary; this topic's own worked matrix and target values are constructed independently and verified in `examples.py`, not copied from the page's example.
