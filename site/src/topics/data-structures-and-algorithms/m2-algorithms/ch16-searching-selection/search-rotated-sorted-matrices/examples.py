"""
dsa.search-rotated-sorted-matrices -- every number this topic puts on screen, computed or
asserted here. Three structures, three different invariants: a rotated sorted array
(one half is always sorted -- O(log n), degrading to O(n) with the right duplicates), a
row/column-sorted (staircase) matrix (a corner walk in O(m + n), no binary search), and a
fully row-major-sorted matrix (a flattened index, O(log(mn))).
"""

import math


# ---------------------------------------------------------------------------
# 1. Rotated sorted array: one half is always sorted.
# ---------------------------------------------------------------------------

ROTATED = [4, 5, 6, 7, 0, 1, 2]


def search_rotated(nums, target):
    """Binary search exploiting the invariant that at least one of [lo, mid] and
    [mid, hi] is sorted at every step, by comparing nums[lo] to nums[mid]."""
    lo, hi = 0, len(nums) - 1
    comparisons = 0
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        comparisons += 1
        if nums[mid] == target:
            return mid, comparisons
        if nums[lo] <= nums[mid]:
            # left half [lo, mid] is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            # right half [mid, hi] is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1, comparisons


# The worked example from the chapter plan: searching for 0 in [4,5,6,7,0,1,2].
# mid = 3 (value 7); nums[lo]=4 <= nums[mid]=7, so the left half [4,5,6,7] is sorted.
# 0 is not in [4, 7), so the search discards the left half and recurses right.
index, cmp_count = search_rotated(ROTATED, 0)
assert index == 4
assert ROTATED[0] <= ROTATED[3]  # left half [4,5,6,7] is the sorted half at the first mid
assert not (ROTATED[0] <= 0 < ROTATED[3])  # 0 is not within the sorted left half's range

# A target genuinely absent still terminates in the same bounded number of steps.
absent_index, absent_cmp = search_rotated(ROTATED, 3)
assert absent_index == -1

# Confirmed against every rotation of the same 7-element sorted base, by brute force:
BASE = [0, 1, 2, 4, 5, 6, 7]
for shift in range(len(BASE)):
    rotated = BASE[shift:] + BASE[:shift]
    for t in BASE:
        got, _ = search_rotated(rotated, t)
        assert rotated[got] == t
    got_absent, _ = search_rotated(rotated, 3)
    assert got_absent == -1  # 3 is not in BASE at all


# ---------------------------------------------------------------------------
# 2. Finding the rotation point (the index of the minimum).
# ---------------------------------------------------------------------------

def find_rotation_index(nums):
    """The special case: search for the one index i where nums[i] > nums[i+1] fails
    everywhere except at the rotation point itself. Equivalently, binary search for the
    boundary where nums[mid] stops being >= nums[lo]."""
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    return lo


rotation_index = find_rotation_index(ROTATED)
assert rotation_index == 4  # value 0, the array's minimum
assert ROTATED[rotation_index] == min(ROTATED)


# ---------------------------------------------------------------------------
# 3. Duplicates degrade the invariant to O(n) in the worst case.
# ---------------------------------------------------------------------------

def search_rotated_with_duplicates(nums, target):
    """The same algorithm, but when nums[lo] == nums[mid] == nums[hi], neither half can
    be proven sorted from that comparison alone, and the search falls back to shrinking
    the range by one element at a time."""
    lo, hi = 0, len(nums) - 1
    comparisons = 0
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        comparisons += 1
        if nums[mid] == target:
            return mid, comparisons
        if nums[lo] == nums[mid] == nums[hi]:
            lo += 1  # cannot tell which half is sorted; shrink by one
            continue
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1, comparisons


# The adversarial case: all but one element equal, with the single different value
# placed one spot before the end, so nums[lo] == nums[mid] == nums[hi] (= 1) fires on
# almost every comparison and the search can only crawl forward one index at a time.
N = 200
ADVERSARIAL = [1] * N
ADVERSARIAL[-2] = 2
target_index, adversarial_comparisons = search_rotated_with_duplicates(ADVERSARIAL, 2)
assert target_index == N - 2
assert adversarial_comparisons >= N - 2  # within one comparison of fully linear

# Confirm the non-duplicate algorithm's comparison count on a clean rotation of the same
# size stays logarithmic, for contrast:
clean_rotated = list(range(N))
clean_rotated = clean_rotated[N // 3:] + clean_rotated[:N // 3]
_, clean_comparisons = search_rotated(clean_rotated, N - 1)
assert clean_comparisons <= math.ceil(math.log2(N)) + 1
assert adversarial_comparisons > clean_comparisons * 10  # linear dwarfs logarithmic here


# ---------------------------------------------------------------------------
# 4. Staircase matrix: rows and columns each sorted, searched in O(m + n).
# ---------------------------------------------------------------------------

STAIRCASE = [
    [1,  4,  7, 11, 15],
    [2,  5,  8, 12, 19],
    [3,  6,  9, 16, 22],
    [10, 13, 14, 17, 24],
    [18, 21, 23, 26, 30],
]


def search_staircase(matrix, target):
    """Start at the top-right corner: moving left decreases, moving down increases.
    Compare and step in the one direction that can still contain the target."""
    rows, cols = len(matrix), len(matrix[0])
    r, c = 0, cols - 1
    steps = 0
    while r < rows and c >= 0:
        steps += 1
        if matrix[r][c] == target:
            return (r, c), steps
        if target < matrix[r][c]:
            c -= 1
        else:
            r += 1
    return None, steps


found, staircase_steps = search_staircase(STAIRCASE, 16)
assert found == (2, 3)
assert staircase_steps <= len(STAIRCASE) + len(STAIRCASE[0])  # bounded by m + n

not_found, miss_steps = search_staircase(STAIRCASE, 20)
assert not_found is None
assert miss_steps <= len(STAIRCASE) + len(STAIRCASE[0])

# Confirmed against every value actually in the matrix, by brute force:
for row in STAIRCASE:
    for value in row:
        pos, _ = search_staircase(STAIRCASE, value)
        assert STAIRCASE[pos[0]][pos[1]] == value


# ---------------------------------------------------------------------------
# 5. A fully row-major-sorted matrix reduces to ordinary 1-D binary search.
# ---------------------------------------------------------------------------

ROW_MAJOR = [
    [1,  3,  5,  7],
    [10, 11, 16, 20],
    [23, 30, 34, 60],
]


def search_row_major(matrix, target):
    """Valid only when matrix[i][j] < matrix[i][j+1] and matrix[i][0] > matrix[i-1][last]
    -- the whole matrix read left-to-right, top-to-bottom is one ascending sequence, so a
    flat index maps to (row, col) by division and modulo."""
    rows, cols = len(matrix), len(matrix[0])
    lo, hi = 0, rows * cols - 1
    comparisons = 0
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        comparisons += 1
        value = matrix[mid // cols][mid % cols]
        if value == target:
            return (mid // cols, mid % cols), comparisons
        if value < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return None, comparisons


row_major_found, row_major_comparisons = search_row_major(ROW_MAJOR, 16)
assert row_major_found == (1, 2)
assert row_major_comparisons <= math.ceil(math.log2(len(ROW_MAJOR) * len(ROW_MAJOR[0]))) + 1

# This reduction is NOT valid on the staircase matrix above: it is sorted by row and by
# column independently, not as one ascending row-major sequence (row 1 starts at 2, which
# is less than row 0's last entry, 15) -- flattening it and binary-searching would be
# searching an unsorted sequence.
flattened_staircase = [v for row in STAIRCASE for v in row]
assert flattened_staircase != sorted(flattened_staircase)  # confirms it is NOT one sorted run


if __name__ == "__main__":
    print(f"Rotated search for 0 in {ROTATED}: index {index} in {cmp_count} comparisons")
    print(f"Rotation point of {ROTATED}: index {rotation_index}, value {ROTATED[rotation_index]}")
    print(f"Adversarial duplicates (n={N}): found at {target_index} in {adversarial_comparisons} comparisons (linear)")
    print(f"Clean rotation (n={N}): {clean_comparisons} comparisons (logarithmic)")
    print(f"Staircase search for 16: found at {found} in {staircase_steps} steps")
    print(f"Row-major search for 16: found at {row_major_found} in {row_major_comparisons} comparisons")
    print("search-rotated-sorted-matrices examples: all checks passed")
