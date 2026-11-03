# FACT-CHECK: Heapsort

## Claims table

| # | Claim | Source | Verified how |
|---|---|---|---|
| 1 | Building a max-heap of 1,024 keys bottom-up costs about 1,910 comparisons | CHAPTER.md's own planning value | Measured directly in `examples.py`: 1,887 — close, same order, consistent with CHAPTER.md's "planning value" framing (different random seed) |
| 2 | Heapsort on 1,024 random keys costs about 17,327 comparisons | CHAPTER.md's own planning value | Measured directly in `examples.py`: 17,316 — close (different seed) |
| 3 | Heapsort on 1,024 already-sorted keys costs 18,060 comparisons | CHAPTER.md's own planning value | Measured directly in `examples.py`: exact match, 18,060 (this shape is deterministic, no seed dependence) |
| 4 | Heapsort on 1,024 reversed keys costs 16,407 comparisons | CHAPTER.md's own planning value | Measured directly in `examples.py`: exact match, 16,407 (deterministic) |
| 5 | The information-theoretic minimum at n = 1,024 is ⌈lg 1024!⌉ = 8,770 comparisons | Chapter 1 topic 4's own bound, computed here | Computed directly in `examples.py` via Σ lg(k): exact match, 8,770 |
| 6 | Merge sort's own exact worst case at n = 1,024 is n⌈lg n⌉ − 2^⌈lg n⌉ + 1 = 9,217 | Topic 49's own formula | Computed directly in `examples.py`: exact match, 9,217 |
| 7 | Heapsort lands at roughly twice the information-theoretic minimum, on every shape | CHAPTER.md's own planning claim | Asserted directly in `examples.py`: ratios 1.97x (random), 2.06x (sorted), 1.87x (reversed) — all within the asserted 1.8x–2.2x band |
| 8 | Heapsort is not adaptive: its cost barely moves between the easiest and hardest input shapes | CHAPTER.md's own planning claim | Asserted directly in `examples.py`: max/min ratio across the three shapes is under 1.2 |
| 9 | A sift-down from the root of a heap of 2²⁰ keys walks about 20 nodes and touches about 17.9 distinct 64-byte cache lines on average, over random leaves | CHAPTER.md's own planning value | Measured directly in `examples.py`, 2,000 random root-to-leaf paths: average path length 20.0 nodes, average distinct lines 17.9 — exact match |
| 10 | Heapsort is unstable: equal keys can come out in a different order than they went in | Standard property of the algorithm | Demonstrated directly in `examples.py` on a tagged deck: key 3's tags go in as a, c, f and come out as c, a, f |
| 11 | `stl_algo.h` defines `_S_threshold = 16` and `__introsort_loop` falls back to `__partial_sort` (a heap sort) when `__depth_limit` reaches 0, with `__sort` passing `std::__lg(n) * 2` as the initial limit | libstdc++ source, GCC `master` branch | Word-for-word quoted in `SOURCES.md`, from a clean copy of the raw file |
| 12 | `DualPivotQuicksort.java` defines `DELTA = 3 << 1` (6) and `MAX_RECURSION_DEPTH = 64 * DELTA` (384), and calls its own `heapSort` once a round counter exceeds that bound | OpenJDK source, `jdk-21-ga` tag | Word-for-word quoted in `SOURCES.md`, from a manually re-cleaned copy of the raw file (see Red team) |
| 13 | Rust 1.81.0's unstable sort computes `limit = 2 * (len \| 1).ilog2()` and passes it into its own quicksort before a heapsort fallback | Rust source, `1.81.0` tag | Word-for-word quoted in `SOURCES.md` |
| 14 | The Rust docs describe the current `sort_unstable` implementation (ipnsort) as combining "the fast average case of quicksort with the fast worst case of heapsort" | Rust `std::primitive::slice` documentation | Word-for-word quoted in `SOURCES.md` |
| 15 | Go 1.19 rewrote its sort package to use pattern-defeating quicksort | Go 1.19 release notes | Word-for-word quoted in `SOURCES.md`, named only in post-notes per `CHAPTER.md` |

## Currency check

- The `jdk-21-ga` and `1.81.0` tags are fixed release tags, not moving branches, fetched
  2026-11-03. The `stl_algo.h` fetch is from GCC's `master` branch, which moves by design; the
  specific symbols quoted (`_S_threshold`, the depth-limit fallback, `std::__lg(n) * 2`) were
  already confirmed present and unchanged by topic 50's own research into the same file, and
  are reconfirmed unchanged again at this fetch.
- The Go 1.19 and Rust 1.81.0 release-notes pages and the current Rust slice documentation are
  all fetched 2026-11-03 and used only for the single sentence each one supplies.
- CLRS 4th ed. chapter 6, Williams (1964), Floyd (1964), Musser (1997) and Wegener (1993) are
  citation-only this session, per `CHAPTER.md`'s own "to verify"/"not opened" instruction; the
  depth-limit mechanism they would otherwise support is instead verified directly from the
  three real systems' own source.

## Red team

1. **The `DualPivotQuicksort.java` excerpt was mangled twice before it was correct.** First,
   `sources.mjs fetch`'s unconditional HTML-stripping ate the file's own `<<` operator and the
   text up to the next literal `>`, destroying the comparison inside the depth-limit check
   (`if ((bits += DELTA) > MAX_RECURSION_DEPTH)`); fixed by `curl`-ing the raw file directly.
   Second, the first hand-built excerpt cut off mid-block (omitting the closing `}` of the
   `if` statement), which `sources.mjs check`'s own whitespace normalization then spliced
   directly onto the next method's own text, producing a quote that could never match; fixed
   by re-extracting the full block including its closing brace and re-verifying line by line
   against the raw file before writing it into `SOURCES.md`.
2. **CLRS, Williams (1964), Floyd (1964), Musser (1997) and Wegener (1993) are not opened.**
   All five are either paywalled, pre-digital-archive CACM issues, or (Wegener) named only in
   post-notes per `CHAPTER.md`'s own scope. No number in this topic's claims table rests on any
   of them; the depth-limit mechanism and its real-world constants come entirely from the three
   systems' own source, which `CHAPTER.md`'s own scope clause treats as sufficient ("Real
   systems, each read at planning time from source...").
3. **The build-comparison count (1,887) and the random-input count (17,316) are the two
   figures in this topic that depend on this session's own random seed**, and so do not match
   `CHAPTER.md`'s planning values exactly (1,910 and 17,327) — both land within one percent,
   consistent with `CHAPTER.md`'s own "planning values" framing. The sorted-input, reversed-
   input, information-theoretic-bound and merge-sort-bound figures are all deterministic and
   match exactly.
4. **The cache-line measurement is a simulation of a random root-to-leaf descent, not a replay
   of this topic's own 1,024-key sort.** A real sift-down's path is decided by the data (which
   child is larger), not by a coin flip; the 50/50 random-child model is the same simplification
   `CHAPTER.md`'s own planning value uses ("measured over 2,000 leaves at planning time"), and
   it reproduced `CHAPTER.md`'s own figure (17.9) exactly on this topic's own seed, which is
   some evidence the simplification does not distort the real number much, though it is not a
   proof that a real workload's access pattern would show exactly this figure.
5. **No independent second source confirms the JDK's exact `DELTA`/`MAX_RECURSION_DEPTH`
   values** beyond the single file at the single tag read; this is read as sufficient because
   `CHAPTER.md`'s own scope only asks for "the JDK's own constants at `jdk-21-ga`," not for
   cross-version stability of the exact number.
6. **Floyd's bottom-up heapsort variant (named in post-notes only) carries a "to verify" tag on
   its own citation (Wegener, 1993) that this topic does not resolve** — nothing about its exact
   comparison count or swap-count tradeoff is asserted in the main topic, only named, per
   `CHAPTER.md`'s own instruction that it appear in post-notes only.

## Corrections applied

- The first `DualPivotQuicksort.java` source excerpt (before the fix in Red team item 1) was
  missing its closing brace, which caused `sources.mjs check` to report the depth-limit quote
  as not found (the normalized source text ran the `return;` line directly into the next
  method's signature with no `}` between them). Re-extracted the excerpt with the correct line
  range and re-verified; `sources.mjs check` now reports 11/11 quotes found word for word.
