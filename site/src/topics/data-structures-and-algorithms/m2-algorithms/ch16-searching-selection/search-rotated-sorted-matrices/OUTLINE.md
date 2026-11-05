# OUTLINE: Search in rotated and sorted matrices

A full topic, about 14 minutes. Third topic of Chapter 16. No compiled benchmark needed —
every number is a small, exact count, computed and asserted in `examples.py`.

## Storyboard

1. **Hook / bridge.** The handoff from topic 56: every predicate so far has had one
   shape, a single boundary over a line of candidates. A rotated sorted array hides the
   same shape twice, split across an unknown pivot — and the reader's first instinct,
   that rotation breaks binary search, is wrong: it only breaks the naive comparison to
   the two endpoints.
2. **Predict.** In `[4,5,6,7,0,1,2]` searching for 0: is the left half `[4,5,6,7]` or the
   right half `[0,1,2]` guaranteed sorted, and which one does the search recurse into?
3. **The invariant: one half is always sorted.** At every midpoint, comparing `a[lo]` to
   `a[mid]` tells you which of the two halves is itself sorted ascending; once known,
   checking whether the target's value falls within that sorted half's own range is an
   O(1) test, and the search recurses into whichever half can actually contain it.
   *Takeaway:* "Rotation doesn't break binary search — it only breaks comparing the
   target to the two endpoints directly."
4. **The rotation point itself, as the same invariant.** Finding the index of the
   minimum (where the rotation occurred) is binary search for the one boundary where
   `a[mid] > a[hi]` stops holding — the identical halving, a different predicate.
5. **Duplicates break the invariant, honestly.** When `a[lo] == a[mid] == a[hi]`,
   neither half can be proven sorted from that comparison alone, and the only safe move
   is to shrink the range by one element — an adversarial array (all but one element
   equal) forces this on nearly every step, degrading the search to O(n).
   *Takeaway:* "Duplicate keys don't just slow this search down a little — they can
   erase the one invariant it depends on, all the way to a linear scan."
6. **Predict.** A matrix sorted ascending along every row and every column (not sorted
   as one flattened sequence) — does ordinary binary search apply to it directly?
7. **The staircase walk.** No: there is no single monotone predicate over a 1-D range
   for the whole matrix, because rows and columns are two independent sorted orders, not
   one. Starting at the top-right corner, each comparison eliminates an entire row or an
   entire column, giving O(m + n), a linear corner walk, not a binary search.
8. **The contrast case: a fully row-major-sorted matrix.** When every row's last value
   is smaller than the next row's first value, the whole matrix read left-to-right,
   top-to-bottom is one ascending sequence, and a flat index `(mid / cols, mid % cols)`
   reduces it to ordinary 1-D binary search, O(log(mn)) — the one structural assumption
   that buys back the logarithm, shown failing on the staircase matrix from step 7.
   *Takeaway:* "The same two numbers, rows and columns, give either O(m+n) or
   O(log(mn)) — the gap is entirely about which structural assumption actually holds."
9. **Recap and handoff.** Three structures, three invariants to tell apart under
   pressure: which half is sorted, which direction shrinks the search, and whether a
   single flattened order even exists. Every search in this chapter has assumed order
   already exists somewhere to exploit. The next topic has none: finding the k-th
   smallest element without any sorted order at all. Quickselect and median-of-medians,
   next.

## Why no compiled benchmark

Every outcome here — the rotated search's comparison counts, the duplicate-array
degradation, the staircase and row-major search steps — is a small, exact, deterministic
computation, checked directly in Python; no timing claim is made anywhere in this topic.

## Changes from the chapter plan

None: the topic keeps to its `CHAPTER.md` entry.
