# FACT-CHECK: Merge sort

## Claims table

| # | Claim | Source | Verified how |
|---|---|---|---|
| 1 | A merge of two sorted ranges costs between min(m, n) and m + n − 1 comparisons | CHAPTER.md's own planning value: merging [1..8] with [9..16] costs 8, a perfect interleaving costs 15 | Recomputed directly in `examples.py`: both exact cases checked, and both equal their respective bound |
| 2 | Top-down and bottom-up merge sort produce identical comparison counts when n is a power of two, and can differ otherwise | CHAPTER.md's own planning value | Checked on n = 4, 8, 16, 32 (always equal, 5 seeds each) and n = 5, 6, 7, 9, 11, 13 (a disagreement found among 20 seeds each) in `examples.py` |
| 3 | The worst-case comparison count is n·⌈lg n⌉ − 2^⌈lg n⌉ + 1, giving 5, 8, 11, 14, 17 for n = 4..8 | CHAPTER.md's own planning table | Computed by formula and confirmed by brute force over every permutation of n = 4..8 in `examples.py` — both match the planning table exactly |
| 4 | At n = 8 the worst case (17) is one comparison above the information-theoretic bound (16); at n = 1,024 the worst case (9,217) is about 5% above the bound (8,770) | CHAPTER.md's own planning value | Computed directly in `examples.py` via `math.lgamma` for the bound (avoiding converting 1,024! to a float); both pairs match exactly |
| 5 | The gap between the worst case and the bound grows only linearly, staying under 0.53n for every n up to 200,000 | CHAPTER.md's own planning value | Checked by formula at a coprime-ish stride up to 200,000 in `examples.py`; the largest ratio found (0.529) matches the planning figure |
| 6 | A merge takes the left key on a tie, which is the whole proof of stability; changing `<=` to `<` breaks it | CHAPTER.md's own planning value, the tagged deck | Demonstrated directly on a tagged two-key-left, three-key-right deck in `examples.py`; the stable merge keeps a, b, c in order, the one-character-changed merge does not |
| 7 | A true in-place, linear-time merge is a known but impractical theoretical construction; with temp memory equal to min(A, B) it becomes easy | CPython `listsort.txt` | Word-for-word quoted in SOURCES.md |
| 8 | `Arrays.sort` on object arrays is guaranteed stable, is a stable/adaptive/iterative mergesort, and needs up to n/2 object references of temporary storage, adapted from Tim Peters's Python list sort | Oracle Java SE 21 Javadoc | Word-for-word quoted in SOURCES.md |
| 9 | Rust's `sort` is stable and O(n log n) worst-case; its current stable sort's own auxiliary memory clamps at self.len() / 2 for longer slices | Rust `std::primitive::slice` documentation | Word-for-word quoted in SOURCES.md |
| 10 | Natural (run-adaptive) merge sort costs n − 1 comparisons on already-sorted input (one run, no merging); a reversed input gives the worst case for an ascending-only run detector (one run per element) | CHAPTER.md's own planning value | Computed directly in `examples.py`: sorted input gives exactly one run and n − 1 total comparisons; reversed input gives exactly n runs |
| 11 | Random input has close to n/2 runs | CHAPTER.md's own planning value ("about n/2 runs of length 2") | Measured directly over 500 trials of a 200-key shuffle in `examples.py`; the average (100.7) falls inside a tolerance band around the expected 100 |

## Currency check

- All three sources were fetched 2026-11-03: CPython's `listsort.txt` from its `main` branch
  (the file has no version header of its own; the branch is recorded as the version read),
  Oracle's own Java SE 21 Javadoc (a stable, dated documentation release), and Rust's current
  stable `std::primitive::slice` documentation (describing driftsort, the algorithm topic 52's
  own CHAPTER.md scope names — cited here only for its stability guarantee and memory figure).
- CLRS, Knuth (*TAOCP* vol. 3 §5.2.4, §5.3.1) and Sedgewick & Wayne §2.2 are citation-only this
  session, per CHAPTER.md's own instruction ("to verify" / "not opened"); every numeric claim
  that would otherwise rest on them is instead verified computationally in `examples.py`.

## Red team

1. **The worst-case formula is verified by brute force only up to n = 8** (40,320
   permutations) — beyond that, only the formula itself (not an exhaustive search) is checked
   against the information-theoretic bound. This is stated as what it is: the formula is
   confirmed exactly at small n, and assumed (not re-derived from Knuth) at larger n, per
   CHAPTER.md's own citation-only instruction for Knuth's own proof of the formula.
2. **Rust's current stable `sort` is driftsort, not a plain merge sort** — its own auxiliary
   memory figure (self.len() / 2) is used here only as a third real-system data point for the
   "copy half the input" buffer refinement, not as evidence about merge sort specifically;
   this is stated explicitly in SOURCES.md's own Red team rather than left implicit.
3. **The average run count on random input (100.7, against an expected 100) is an empirical
   measurement over 500 trials, not a closed-form derivation** — the "close to n/2" claim in
   CHAPTER.md is read as an approximate, not exact, statement, and `examples.py`'s own
   assertion uses a tolerance band (90 to 110) rather than an exact equality for this reason.
4. **No claim is made about which real library "is" merge sort** — Python, Java and Rust's
   own object/stable sorts are all Timsort-family hybrids (run detection, galloping, driftsort),
   named here only for their shared stability guarantee and buffer-size figures, which this
   topic's own scope needs; their run-detection and merge-policy internals are left to topic 52.

## Corrections applied

- `merge_unstable`'s own initial implementation compared full `(key, tag)` tuples instead of
  keys alone, which made Python's own tuple comparison break the tie on the tag character
  before the intended `<=`-to-`<` change could; fixed by comparing only the key component in
  both `merge` and `merge_unstable`, caught by `examples.py`'s own first run.
