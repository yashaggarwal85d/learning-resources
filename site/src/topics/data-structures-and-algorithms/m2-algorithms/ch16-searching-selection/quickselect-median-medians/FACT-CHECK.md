# FACT-CHECK: Quickselect and median-of-medians

## Claims table

| # | Claim | Source | Verified how |
|---|---|---|---|
| 1 | Quickselect partitions around a pivot and recurses into only the side containing the target rank, discarding the other side entirely | Hoare, "Algorithm 65: FIND" (CACM 4(7), 1961) — bibliographic record only, text not opened this session | Independently implemented and verified in `examples.py`: finds the true median of random permutations of size 1,000 and 1,000,000 against Python's own `sorted()` |
| 2 | Quickselect's measured comparison count for finding the median stays a small constant times n, well below a full sort's n·log₂(n) | This topic's own measurement | Computed directly in `examples.py` for n = 1,000 and n = 1,000,000; both counts are under 10n and under the n·log₂(n) estimate |
| 3 | An adversarial or always-unlucky pivot (first element, on already-sorted input) degrades quickselect to Θ(n²) | This topic's own construction, the same fact Chapter 15 topic 50 showed for unguarded quicksort | Measured directly in `examples.py`: a first-element pivot selecting the maximum of 200 already-sorted elements takes more than n²/4 comparisons; a random pivot on the identical input takes under 10n |
| 4 | Median-of-medians (BFPRT, 1973) guarantees a worst-case runtime of O(n) by discarding at least 30% of the array at every round | Wikipedia, "Median of medians" | Word-for-word quoted in SOURCES.md; the discard fraction is independently checked by direct counting in `examples.py` on a constructed 1,000-element input |
| 5 | On the same random input, randomised quickselect's measured comparison count beats median-of-medians' | This topic's own measurement | Computed directly in `examples.py` on a shared 2,000-element input: quickselect's count is lower than median-of-medians' |
| 6 | Musser's introselect (1997) runs quickselect by default and falls back to median-of-medians past a recursion-depth bound proportional to log n | Wikipedia, "Introselect" | Word-for-word quoted in SOURCES.md |
| 7 | Most real C++ standard library implementations do NOT use Musser's median-of-medians fallback at all, but a different quickselect-plus-heapselect hybrid with worst-case O(n log n) | Wikipedia, "Introselect" | Word-for-word quoted in SOURCES.md; independently confirmed by reading this session's own installed GCC 13 libstdc++ header (`/usr/include/c++/13/bits/stl_algo.h`) directly |
| 8 | This machine's own `std::nth_element` (GCC 13) sets its depth limit to `2 * floor(log2(n))` and falls back to `__heap_select`, not median-of-medians, when that budget is exhausted | This session's own installed GCC 13 libstdc++ header, read directly | Read directly from `/usr/include/c++/13/bits/stl_algo.h` lines 1957–1977 and 4784–4790 this session; the formula is computed and asserted in `examples.py` for n = 1,000,000 (38) |

## Currency check

- Both Wikipedia pages were fetched 2026-11-05 as currently published pages.
- Hoare's 1961 paper and the BFPRT 1973 paper are not opened directly this session (the former's bibliographic record only, confirmed via Wikipedia's own citation of it; the latter's own guarantee is quoted via Wikipedia's summary, not the *Journal of Computer and System Sciences* text itself) — recorded honestly, consistent with this project's convention for sources not directly opened.
- The GCC 13 libstdc++ header is a primary source, read directly and in full this session, with its exact version (GCC 13, this session's container) recorded since the implementation detail is not part of the C++ standard and changes across library versions and vendors (libstdc++ vs libc++ differ, per the Introselect page's own note).

## Red team

1. **The quickselect/full-sort comparison gap uses an estimate, not a measured full sort**, for the sort side (`n·log₂(n)`, Chapter 1's own comparison-model bound) rather than running an actual comparison-counted sort — stated as an estimate in `examples.py`'s own naming (`sort_estimate`), not presented as a second measured quantity.
2. **The median-of-medians vs quickselect comparison (claim 5) is a single measured input, not an average over many trials** — the topic's own claim is only that this measured gap exists on this input, matching the chapter's own "why nobody uses it" framing, not a claim about every possible input or a statistically rigorous average.
3. **Hoare's and BFPRT's own primary papers are not opened this session**; every claim attributed to them is sourced through a secondary account (Wikipedia) that itself cites the primary paper, and this is stated plainly rather than implied to be a direct read of either 1961 or 1973 paper's text.
4. **The libstdc++ depth-limit and fallback claims are specific to one compiler version on one machine** (GCC 13, this session's container) — the topic does not claim this is universal across all C++ standard libraries or even all GCC versions, only that it is what this specific, named, inspectable source actually does, which directly confirms the general pattern Wikipedia's own correction describes.
5. **The discard-fraction check (claim 4) uses a clean multiple of five elements** so every group is full-sized; the formula's guarantee technically allows one partial final group in general, which the check's own tolerance (`- 10`) accounts for rather than hides.

## Corrections applied

- The chapter plan's own sources list named libstdc++'s `std::nth_element` as "falling back to median-of-medians past a recursion-depth bound in exactly this way" (`CHAPTER.md`'s own text for topic 58), with a note to verify the version and source location at build time. Reading the actual installed header in this session showed this is specifically false for this standard library implementation: it falls back to a heap-based selection (`__heap_select`), not median-of-medians — matching Wikipedia's own stated correction, not the chapter plan's original assumption. This topic states the corrected, verified fact, not the chapter plan's original premise.
