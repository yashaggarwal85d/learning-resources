## Wikipedia — "Median of medians"

URL: https://en.wikipedia.org/wiki/Median_of_medians
Version: fetched 2026-11-05, the page as currently published

> The median of medians algorithm guarantees a worst-case runtime of O(n) by recursively selecting good pivot elements, discarding at least 30% of elements at each step.

> The median-of-medians algorithm computes an approximate median, namely a point that is guaranteed to be between the 30th and 70th percentiles (in the middle 4 deciles). Thus the search set decreases by at least 30%. The problem is reduced to 70% of the original size, which is a fixed proportion smaller.

> is sometimes called BFPRT after the last names of the authors (Blum, Floyd, Pratt, Rivest, Tarjan). In the original paper, the algorithm was referred to as PICK, referring to quickselect as FIND.

### Contents (item by item, this topic's scope)

- The algorithm's own name, year, and authorship (Blum, Floyd, Pratt, Rivest, Tarjan, 1973, *Journal of Computer and System Sciences* 7, 448–461), and the paper's own names for the two algorithms (PICK for median-of-medians, FIND for quickselect, matching Hoare's own 1961 title). Used throughout the topic.
- The guaranteed discard fraction (at least 30% of the array, since the chosen pivot sits between the 30th and 70th percentiles) — the exact counting argument this topic's `examples.py` verifies directly on a constructed input, not taken on the page's authority alone. Used by the discard-fraction step.
- The worst-case O(n) guarantee itself, contrasted against quickselect's expected-case O(n) and worst-case O(n²). Used by the recurrence/worst-case-fix step.

### Red team note on this source

This page is read directly for the algorithm's own stated guarantee and its attribution, not inferred from a title; the 3/10–7/10 discard fraction is independently re-derived and checked by direct counting in `examples.py` on a constructed array, not assumed from this quote alone.

## Wikipedia — "Introselect"

URL: https://en.wikipedia.org/wiki/Introselect
Version: fetched 2026-11-05, the page as currently published

> Introselect works by optimistically starting out with quickselect and only switching to a worst-case linear-time selection algorithm (the Blum-Floyd-Pratt-Rivest-Tarjan median of medians algorithm) if it recurses too many times without making sufficient progress.

> Both approaches limit the recursion depth to k ⌈log n⌉ = O(log n) and the total running time to O(n).

> However, in most C++ Standard Library implementations, a different "introselect" algorithm is used, which combines quickselect and heapselect, and has a worst-case running time of O(n log n).

### Contents (item by item, this topic's scope)

- Musser's own introselect (1997): quickselect as the default, falling back to median-of-medians when recursion depth exceeds a bound proportional to log n, giving worst-case O(n) with quickselect's good average case intact — exactly the clause this topic's syllabus names. Used by the introselect step.
- The honest correction that most real C++ standard library implementations (including this topic's own machine's libstdc++, confirmed directly against its header below) do NOT use Musser's median-of-medians fallback at all, but a different quickselect-plus-heapselect hybrid with worst-case O(n log n), not O(n) — used so the topic does not overstate what `std::nth_element` actually guarantees in practice.

### Red team note on this source

This page's claim about libstdc++'s actual fallback is cross-checked directly against this session's own installed compiler header, `/usr/include/c++/13/bits/stl_algo.h` (GCC 13) — read directly in this session (not through `sources.mjs`, which only checks fetchable URLs), lines 1957–1977 (`__introselect`) and 4784–4790 (`nth_element`'s call into it). The header's own code confirms both the exact depth limit (`std::__lg(n) * 2`, i.e. `2 * floor(log2(n))`, matching the formula `examples.py` computes and asserts for n = 1,000,000: 38) and the fallback branch itself, which calls `std::__heap_select`, not a median-of-medians routine, when `__depth_limit` reaches zero — independently confirming Wikipedia's own correction above against the real, installed source, not merely repeating it. Recorded as GCC 13, this session's own container, since standard library internals are not part of the C++ standard and change across versions.
