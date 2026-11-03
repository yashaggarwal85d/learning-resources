## CPython — `Objects/listsort.txt`

URL: https://raw.githubusercontent.com/python/cpython/main/Objects/listsort.txt
Version: `main` branch, fetched 2026-11-03

> Merging adjacent runs of lengths A and B in-place, and in linear time, is difficult. Theoretical constructions are known that can do it, but they're too difficult and slow for practical use. But if we have temp memory equal to min(A, B), it's easy.

### Contents (item by item, this topic's scope)

- The file's own statement of why a merge needs spare space at all (true in-place, linear-time merging is a known-but-impractical theoretical construction), directly supporting this topic's "O(n) buffer" clause.
- Timsort's own refinement, named exactly: temp memory equal to min(A, B) — the shorter of the two runs, not the whole input and not always the left half — which this topic's own `examples.py` models directly as `merge_sort_min_copy_buffer`.

## Oracle — "Arrays (Java SE 21 & JDK 21)"

URL: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Arrays.html
Version: Java SE 21, fetched 2026-11-03

> This sort is guaranteed to be stable: equal elements will not be reordered as a result of the sort.

> Implementation note: This implementation is a stable, adaptive, iterative mergesort that requires far fewer than n lg(n) comparisons when the input array is partially sorted, while offering the performance of a traditional mergesort when the input array is randomly ordered.

> Temporary storage requirements vary from a small constant for nearly sorted input arrays to n/2 object references for randomly ordered input arrays.

> The implementation was adapted from Tim Peters's list sort for Python

### Contents (item by item, this topic's scope)

- The official current (Java 21) documentation's own stability guarantee for `Arrays.sort` on object arrays, directly supporting "why stability decides library choices."
- The implementation's own name for itself (a stable, adaptive, iterative mergesort) and its own worst-case temporary-storage figure (n/2 object references) — a second, independent confirmation of the "usual refinement copies only the left half" buffer clause, read here as "up to half the input," consistent with CPython's own min(A, B) refinement being a tighter bound on the identical idea.
- The implementation's own lineage statement, naming Tim Peters's Python list sort directly — supporting this topic's own citation of CPython's `listsort.txt` as the shared ancestor of both real systems' stable object sorts.

## Rust — `std::primitive::slice` documentation

URL: https://doc.rust-lang.org/std/primitive.slice.html
Version: current stable docs, fetched 2026-11-03

> This sort is stable (i.e., does not reorder equal elements) and O(n * log(n)) worst-case.

> When applicable, unstable sorting is preferred because it is generally faster than stable sorting and it doesn’t allocate auxiliary memory.

> The auxiliary memory allocation behavior depends on the input length. Short slices are handled without allocation, medium sized slices allocate self.len() and beyond that it clamps at self.len() / 2.

> It is typically faster than stable sorting, except in a few special cases, e.g., when the slice is partially sorted.

### Contents (item by item, this topic's scope)

- Rust's own explicit distinction between `sort` (stable) and `sort_unstable` — a third real system (alongside Python and Java) whose documentation names the exact same stability split this topic's own merge-tie demonstration shows mechanically.
- Rust's own current stable sort's auxiliary-memory figure, clamping "at self.len() / 2" for longer slices — a third, independent real-system number for the "half the input" buffer refinement, distinct from (and a looser bound than) Timsort's own min(A, B).

### Red team

- CLRS, Knuth (*TAOCP* vol. 3 §5.2.4 and §5.3.1) and Sedgewick & Wayne are citation-only this
  session, per `CHAPTER.md`'s own instruction ("to verify" / "not opened") — the worst-case
  formula and the top-down/bottom-up recurrence are instead verified directly in `examples.py`
  (brute force for small n, and against the information-theoretic bound computed via
  `math.lgamma`), not taken from either book's own stated page.
- Rust's own current stable-sort documentation describes "driftsort," the algorithm named in
  topic 52's own CHAPTER.md scope, not literally "merge sort" by that name — it is cited here
  only for its own stability guarantee and its own auxiliary-memory figure, both of which this
  topic's own buffer clause needs, not for anything about run detection or Powersort (left to
  topic 52).
