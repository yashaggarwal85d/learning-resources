# FACT-CHECK: Timsort, Powersort and driftsort

## Claims table

| # | Claim | Source | Verified how |
|---|---|---|---|
| 1 | CPython's run detection finds an existing ascending or descending stretch, reverses a strictly descending one in place, and the reversed stretch can seamlessly extend into the ascending keys that follow it (worked example `[3, 2, 1, 3, 4, 5, 0]`) | CPython's own worked example, `listsort.txt` | Reproduced directly in `examples.py`'s `count_run`/`next_run_ascending`: the 3-element descending prefix reverses to `[1, 2, 3]` and extends into `[3, 4, 5]` for a 6-element run |
| 2 | CPython's old (pre-2025) minrun-selection scheme picks 33, not 32, at n = 2,112, because 2,112 / 32 leaves an unbalanced split while 2,112 / 33 = 64 exactly | `listsort.txt`'s own worked example | Computed directly in `examples.py`: `merge_compute_minrun_old(2112) == 33`, and `2112 // 33 == 64` exactly |
| 3 | On a fully sorted, fully reversed, or all-equal array of 32,768 elements, run detection finds the whole array as one run in exactly n − 1 comparisons (32,767) | CHAPTER.md's own planning claim | Measured directly in `examples.py` via `count_run_instrumented`: exactly 32,767 on all three shapes |
| 4 | Galloping search first strictly beats linear search at i = 6, and CPython sets `MIN_GALLOP = 7`, just past that crossover | `listsort.txt`'s own stated threshold | Measured directly in `examples.py`: `gallop_compares`/`linear_compares` cross at i = 6; galloping loses at i = 2 and i = 4 ("galloping with a broken leg") |
| 5 | The original Timsort merge-policy invariant (each pending run longer than the sum of the next two) is checked by `mergeCollapse` only on the top three stack entries, which is not enough to guarantee it holds deeper in the stack | de Gouw et al., CAV 2015 | The JDK's own `mergeCollapse` loop transcribed directly into `examples.py` as `merge_collapse`/`invariant_holds` |
| 6 | Run lengths 120, 80, 25, 20, 30 on the stack, after one merge (25 and 20), leave 120, 80, 45, 30, where the invariant 120 > 80 + 45 is false | de Gouw et al., CAV 2015, the paper's own worked example | Reproduced exactly in `examples.py`: `merge_collapse([120, 80, 25, 20, 30])` ends at `[120, 80, 45, 30]`, with `invariant_holds` finding the break at the leftmost triple (`break_at == 0`) |
| 7 | The paper's own smallest crashing counterexample needed just over 67 million elements, and the same bug existed in CPython's own `list.sort`, unfixed since the method's introduction | de Gouw et al., CAV 2015, the paper's own claims | Stated only as the paper's own claim, cited, not independently reproduced (reproducing a 67-million-element crash is out of this topic's scope); cited literally in `examples.py` as `CAV2015_SMALLEST_COUNTEREXAMPLE_MILLIONS = 67` |
| 8 | Powersort's "power" of a run pair is the depth, in an ideal binary merge tree built from the runs' midpoints, of the node joining them; two runs of 40 and 40 (in 80) have power 1; a pair of 10 and 10 (in 10, 10, 60) has power 3, and the pair 10 and 60 has power 1 | CPython's own `listsort.txt` description and `CHAPTER.md`'s own planning values | Computed exactly via `fractions.Fraction` in `examples.py`'s `node_power`: `node_power(0,40,40,80)==1`, `node_power(0,10,10,80)==3`, `node_power(10,10,60,80)==1` — exact matches |
| 9 | CPython's changelog places the Powersort merge-policy switch under the 3.11.0 alpha 1 heading, dated 2021-09-01, confirmed present in the `v3.11.0` tag of `listsort.txt` and absent from the `v3.10.0` tag | CPython's own `Misc/NEWS.d/3.11.0a1.rst` and the two tagged `listsort.txt` files | Direct diff of the two tags: Powersort's description is present in `v3.11.0`, absent in `v3.10.0`; the NEWS entry (bpo-34561) is dated 2021-09-01. Both version strings cited literally in `examples.py` as `CPYTHON_POWERSORT_RELEASE = "3.11"` |
| 10 | Stefan Pochmann's 2025 minrun refinement (unreleased, on CPython's `main` branch) keeps the number of runs at every merge-tree level a power of 2, with at most two run lengths present, differing by at most one; at n = 315, the old scheme's 8 runs include one of length 35 while the new scheme spreads the shortfall | CPython's own `main`-branch `listsort.txt` | Reproduced exactly in `examples.py`'s `old_run_lengths`/`pochmann_run_lengths` on n = 315: old scheme gives `[40,40,40,40,40,40,40,35]`; new scheme gives 8 runs of lengths 39 or 40, differing by at most 1 |
| 11 | The refinement is confirmed absent from the `v3.13.0` and `v3.14.0` tagged releases, i.e. still unreleased as of this fetch | Direct grep of the two tags | Confirmed by grep: neither tag's `listsort.txt` contains the refinement's text |
| 12 | Rust's standard library switched its stable sort to driftsort (Peters & Bergdoll) in Rust 1.81.0, announced 2024-09-05; the documentation describes it as combining quicksort's fast average case with mergesort's fast worst case and partial run detection | The Rust 1.81.0 announcement and the current `std::primitive::slice` documentation | Word-for-word quoted in `SOURCES.md`; version cited literally in `examples.py` as `RUST_DRIFTSORT_RELEASE = "1.81"` |
| 13 | Driftsort's own source allocates scratch memory as `max(n/2, min(n, 8MB))`, and falls back to mergesort, not heapsort, past its own introsort-style depth limit | Rust 1.81.0's `slice/sort/stable/mod.rs` | Word-for-word quoted in `SOURCES.md`; the formula itself computed directly (not reimplemented) in `examples.py`'s `driftsort_alloc_elements`: n = 1,000 scales as n; n = 10,000,000 caps at n/2 |
| 14 | Driftsort's own design document credits its core structure to glidesort, also by Orson Peters | The `sort-research-rs` driftsort introduction writeup | Word-for-word quoted in `SOURCES.md`, using the writeup's own general lineage statement, not the more specific "run creation and lazy merging" phrase `CHAPTER.md` names (see Red team) |

## Currency check

- The `v3.11.0`, `v3.10.0`, `v3.13.0` and `v3.14.0` tags of CPython's `listsort.txt`, and the
  `1.81.0` tag of Rust's `slice/sort/stable/mod.rs`, are fixed release tags, fetched
  2026-11-03, not moving branches.
- CPython's `main`-branch `listsort.txt` (the Pochmann refinement) is explicitly unversioned
  and moving; this topic states plainly that the refinement is unreleased as of this fetch,
  confirmed absent from the two most recent tagged releases checked.
- The CAV 2015 paper, the Munro & Wild ESA 2018 abstract, the Rust 1.81.0 announcement, the
  current Rust slice documentation, and the `sort-research-rs` writeup are all fetched or read
  2026-11-03, each used only for the specific claims `SOURCES.md` quotes.

## Red team

1. **CLRS, Sedgewick & Wayne, and Bentley & Yao's unnamed earlier paper are not opened this
   session** (named only as a "probably dates back to" aside in CPython's own file). No claim
   in this topic's claims table rests on any of them.
2. **McIlroy's 1993 SODA paper is cited by CPython itself but not independently opened** —
   this topic states only what CPython's own file says about it, not any claim from the
   paper's own text.
3. **`CHAPTER.md`'s own phrase "run creation and lazy merging" adapted from glidesort could
   not be located verbatim in the one driftsort writeup page opened this session.** This topic
   instead cites that writeup's own, more general statement that driftsort's "core structure
   is derived from glidesort," and does not assert the more specific two-part mechanism.
4. **The CAV 2015 paper's PDF-extracted text has one rendering artifact** right at the one
   place the run-length example appears (a stray "×" and an odd space merged into "120, 80,
   45, 30"), with no clean second occurrence to quote instead. Worked around by quoting the
   sentences immediately before and after the garbled text as two separate blockquotes, and
   stating the run lengths only in this topic's own prose, verified exactly by running the
   transcribed `mergeCollapse` loop in `examples.py`.
5. **The Pochmann refinement is read from an unreleased development branch**, not a tagged
   release; this topic says so explicitly rather than presenting it as shipped behavior.
6. **No independent benchmark reproduces driftsort's or Powersort's own measured performance
   claims** (entropy near-optimality, wall-clock speed) — this topic names what the authors'
   own papers and writeups say, without re-measuring any of it, consistent with `CHAPTER.md`'s
   own "named, not built" framing for driftsort's exact definition.
7. **The 67-million-element crash and the "same bug in Python" claim are stated only as the
   paper's own assertions**, not independently reproduced; reproducing a 67-million-element
   array crash is out of this topic's scope and `examples.py` only cites the figure, it does
   not rebuild the crash.

## Corrections applied

- `SOURCES.md`'s Red team note on the CAV 2015 rendering artifact originally claimed a "clean
  second occurrence" of the run-length numbers existed to quote from instead; on inspection,
  only one occurrence of those numbers exists in the extracted text at all. Corrected the note
  to describe the actual fix (splitting the quote around the garbled sentence, stating the
  numbers only in prose, verified in `examples.py`).
- Two narration lines (step 7's answer, step 13's first line) were over the 50-word limit on
  first draft; split into shorter lines before any build check.
- `reel.tsx` originally showed the bare numbers 3.11, 1.81 and 67 (CPython's and Rust's
  release versions, and the CAV 2015 paper's counterexample size) with no literal match in
  `examples.py`; the build's own number-literalness check caught this. Fixed by citing all
  three literally in `examples.py` as named constants, since they are real cited facts, not
  computed values, consistent with how topic 51 (heapsort) handled the JDK's
  `MAX_RECURSION_DEPTH`.
- `reel.tsx` originally carried only two takeaways; the build's own check requires at least
  three. Added a third, on the Powersort step, summarizing why a globally computed rule
  replaces a local three-entry check.
- `scenes.tsx`'s `RunDetection` visual had its caption ("reversed, then extended") positioned
  close enough to the run-length bar labels that the phone-viewport smoke test found three
  overlaps (labels "3", "4", "5"). Fixed by moving the caption's y-position from 222 to 240,
  matching the y-position this topic's other scenes already use for the same kind of caption.
