import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: the invariant that at least one half of a rotated sorted array is always
// sorted, proven and used, not assumed; the same invariant applied to finding the
// rotation point; duplicate keys erasing that invariant down to a linear scan, shown
// honestly; a second, unrelated shape of monotonicity (a row/column-sorted matrix's
// corner walk, O(m+n), not binary search); the one structural assumption (row-major
// order) that buys back O(log(mn)). Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "Every predicate in this chapter so far has had one shape: a single boundary, false then true, over a line of candidates. A rotated sorted array hides the same shape twice, split across a wraparound point, and the first instinct — that rotation breaks binary search — is wrong: it only breaks the naive comparison to the two endpoints.",
      body: <>A sorted array, cut at some unknown point and the two pieces swapped. Binary search still works on it.</>,
      duration: 3.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "In [4,5,6,7,0,1,2], searching for 0: is the left half [4,5,6,7] or the right half [0,1,2] guaranteed sorted, and which one does the search recurse into?",
      body: <>Draw a line down the middle element. One side of it is always in order.</>,
      duration: 2.5,
      fig: 'PredictRotated',
      predict: {
        options: [
          { label: 'The left half [4,5,6,7] is sorted; since 0 is outside that half, the search recurses right', correct: true },
          { label: 'The right half [0,1,2] is sorted; the search recurses left' },
          { label: 'Neither half is sorted, so binary search cannot be used here' },
          { label: 'Both halves are always sorted in a rotated array' },
        ],
        explain: (
          <>
            Comparing the first element to the middle element tells you which half is sorted: here 4 ≤ 7, so the left
            half is sorted, and since the target 0 falls outside that half's own range [4, 7), the search discards it
            and recurses into the right half, where 0 actually is.
          </>
        ),
      },
      Visual: S.PredictRotated,
    },
    {
      title: "At every midpoint, comparing the range's first element to the middle element tells you which of the two halves is itself sorted ascending; once known, checking whether the target falls within that sorted half's own range is a single comparison, and the search recurses into whichever half can actually contain it.",
      body: <>One half is always sorted. Which one, and whether the target is in it, are both one comparison each.</>,
      duration: 4.5,
      fig: 'SortedHalf',
      takeaway: "Rotation doesn't break binary search — it only breaks comparing the target straight to the two endpoints.",
      Visual: S.SortedHalf,
    },
    {
      title: "Finding the rotation point itself — the index where the array's minimum sits — is the identical halving, aimed at a different predicate: search for the one boundary where a[mid] stops being greater than a[hi]. Same loop, same invariant, a one-line change in what gets compared.",
      body: <>The rotation point is just another boundary. The same search finds it.</>,
      duration: 4,
      fig: 'RotationPoint',
      Visual: S.RotationPoint,
    },
    {
      title: "When a[lo], a[mid] and a[hi] are all equal, that comparison tells you nothing about which half is sorted — both could be, or neither could look it. The only safe move is to shrink the range by one element at a time, and an array built from mostly one repeated value forces exactly that, almost every step, on the way to the single different value.",
      body: <>Two hundred elements, all but one of them identical. Finding the one that differs takes nearly two hundred comparisons.</>,
      duration: 5,
      fig: 'Duplicates',
      takeaway: "Duplicate keys don't just slow this search — they erase the invariant it depends on, down to a linear scan.",
      Visual: S.Duplicates,
    },
    {
      title: "A matrix sorted ascending along every row and every column, but not sorted as one single flattened sequence — does ordinary binary search apply to it directly?",
      body: <>Every row goes up left to right. Every column goes up top to bottom. Is there one boundary to search for?</>,
      duration: 2.5,
      fig: 'PredictStaircase',
      predict: {
        options: [
          { label: 'No — rows and columns are two independent sorted orders, not one monotone predicate', correct: true },
          { label: 'Yes, binary search on the flattened array works directly' },
          { label: 'Yes, but only if the matrix is square' },
          { label: 'No search faster than checking every cell is possible here' },
        ],
        explain: (
          <>
            There is no single monotone predicate over a one-dimensional range for the whole matrix: moving right
            increases, moving down increases, but there is no one order that covers every cell, so binary search has
            nothing to bisect. A different technique is needed.
          </>
        ),
      },
      Visual: S.PredictStaircase,
    },
    {
      title: "Starting from the top-right corner: if the target is smaller than the current cell, every cell below it is also too big, so the whole column can be dropped by stepping left; if the target is larger, every cell to its left is too small, so the whole row can be dropped by stepping down. Each comparison eliminates an entire row or an entire column.",
      body: <>One corner, one step per comparison, a whole row or column discarded each time.</>,
      duration: 4.5,
      fig: 'StaircaseWalk',
      takeaway: 'A row/column-sorted matrix is searched by a linear corner walk, O(m+n), in O(1) space — not by binary search.',
      Visual: S.StaircaseWalk,
    },
    {
      title: "A stronger matrix, where every row's last value is smaller than the next row's first value, is one ascending sequence read left to right, top to bottom — the whole matrix flattened. A midpoint index maps back to a cell by one division and one remainder, and ordinary binary search runs over it directly, in O(log(mn)). The staircase matrix from before has no such order: its second row starts lower than its first row ends.",
      body: <>One extra rule about how rows relate to each other turns a linear walk back into a binary search.</>,
      duration: 4.5,
      fig: 'RowMajorContrast',
      takeaway: 'The same two dimensions give either O(m+n) or O(log(mn)) — the gap is entirely which structural assumption holds.',
      Visual: S.RowMajorContrast,
    },
    {
      title: "Three structures, three invariants to tell apart under pressure: which half is sorted, in a rotated array; which direction a corner walk shrinks, in a staircase matrix; whether a single flattened order even exists at all, between the two. Every search this chapter has built has assumed order already exists somewhere to exploit. The next question has none: finding the k-th smallest element with no sorted order to search at all. Quickselect and median-of-medians, next.",
      body: <>Rotated array, staircase matrix, row-major matrix — three invariants, one chapter.</>,
      duration: 4,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
