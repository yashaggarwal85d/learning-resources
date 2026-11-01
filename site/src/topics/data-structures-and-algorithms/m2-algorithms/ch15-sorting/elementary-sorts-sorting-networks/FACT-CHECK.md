# FACT-CHECK: Elementary sorts and sorting networks

## Claims table

| # | Claim | Source | Verified how |
|---|---|---|---|
| 1 | Insertion sort's cost is exactly n − 1 plus the number of inversions; moves = inversions | CHAPTER.md's own planning value, [5,2,4,6,1,3] has 9 inversions, 12 comparisons, 9 moves | Recomputed by brute-force inversion count and an instrumented insertion sort in `examples.py`; matches exactly |
| 2 | On 8 sorted keys: 7 comparisons, 0 moves; on 8 reversed keys: 28 comparisons, 28 moves | CHAPTER.md's own planning value | Recomputed in `examples.py`; matches exactly |
| 3 | Selection sort is not stable: two equal keys can swap past each other | CHAPTER.md's own planning value, the five tagged records | Recomputed in `examples.py`; the two 3-keys (tags a, c) come out in reversed relative order |
| 4 | Insertion sort is stable | Mechanical property of the algorithm (never moves a key across an equal one) | Checked directly on the same five tagged records in `examples.py`; the two 3-keys keep their input order |
| 5 | Selection sort's comparison count is always n(n−1)/2 | Standard property (two nested loops, no early exit) | Checked on the 16-key deck in `examples.py`: 120 comparisons = 16·15/2 |
| 6 | A four-input sorting network of five compare-exchanges sorts every input | Dobbelaere's page states the size/depth bound (5, 3) for four inputs, citing Knuth vol. 3 | The topic's own network (a different valid wiring, see Red team) brute-force checked against all 24 permutations and all 16 zero-one inputs in `examples.py` — all pass |
| 7 | The optimal network sizes are 5 (four inputs) and 19 (eight inputs) | Dobbelaere's page, summary table, both rows citing `[TAOCPv3]` | Word-for-word quoted in SOURCES.md |
| 8 | At four inputs the optimal network size (5) equals ⌈lg 4!⌉; at eight inputs the optimal size (19) exceeds ⌈lg 8!⌉ (16) | Computed from the information-theoretic bound (Chapter 1 topic 4) | Computed directly with `math.log2`/`math.factorial` in `examples.py`; both comparisons checked |
| 9 | libstdc++'s introsort falls back to insertion sort below a fixed threshold of sixteen elements | `stl_algo.h`, `enum { _S_threshold = 16 };` | Word-for-word quoted in SOURCES.md |
| 10 | Rust's small-sort code uses fixed sorting-network-based helpers (`sort13_optimal`, `sort9_optimal`) above nine elements, with insertion sort below that | `smallsort.rs`, the `region.len() >= 13`/`>= 9` branch | Word-for-word quoted in SOURCES.md (the `>= 13` branch's own guard condition was lost to the fetch pipeline's angle-bracket mangling; the quote starts just after it, from the intact `sort13_optimal` call) |

## Currency check

- Dobbelaere's page and the Rust/libstdc++ sources were all fetched 2026-11-01; Rust is pinned to
  the `1.81.0` tag CHAPTER.md names, libstdc++ to its `master` branch (no specific GCC release
  tag was requested by CHAPTER.md).
- CLRS, Knuth and Sedgewick & Wayne are citation-only, not read this session, per CHAPTER.md's
  own instruction ("chapter and section numbers to verify" / "not opened").

## Red team

1. **This topic's four-input network is not literally Dobbelaere's page's own drawn network**
   for four inputs — both are valid five-compare-exchange, three-layer networks on four inputs,
   and the specific one used here (`CHAPTER.md`'s own planning value) is verified independently
   by brute force rather than copied from the page. Documented in `SOURCES.md`'s Red team.
2. **The zero-one principle is used only as a check, not proved or quoted from Knuth** — Knuth
   vol. 3 §5.3.4 was not opened this session; the informal statement `CHAPTER.md` gives ("a
   network that sorts every 0/1 input sorts everything") is applied computationally to this
   topic's own network, not cited as Knuth's exact theorem.
3. **The Rust fetch's angle-bracket mangling ate the `region.len() >= 13` guard's own text** (an
   earlier, unrelated generic-type span in the same file was left unclosed and swallowed it);
   the quoted span was adjusted to start from the still-intact `sort13_optimal` call onward, and
   this is noted explicitly rather than papered over.
4. **No claim is made about which real standard library's sort is "faster"** — the sources are
   used only for their stated cutoff numbers and named helper functions, not for a performance
   comparison between libstdc++ and Rust.
5. **Larger sorting networks (Batcher's, bitonic) are named in post-notes only**, per
   `CHAPTER.md`'s own instruction, with nothing about their construction beyond the name.

## Corrections applied

- None needed beyond the quote-boundary adjustment in item 10 above (made during sourcing, not
  after a later review pass).
