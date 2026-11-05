Last verified: 2026-11-05. Expert sign-off: pending.

- "Median of medians" (Wikipedia) — the BFPRT (1973) algorithm's own stated worst-case guarantee and discard fraction. [source](https://en.wikipedia.org/wiki/Median_of_medians)
- "Introselect" (Wikipedia) — Musser's 1997 fallback strategy and the correction that most real C++ standard libraries use a different one. [source](https://en.wikipedia.org/wiki/Introselect)
- GCC 13's own installed `bits/stl_algo.h` — this session's own container, read directly (not fetched, since it is a local compiler header, not a URL): the exact depth limit `std::nth_element` uses and its real fallback (`__heap_select`, not median-of-medians), confirming Wikipedia's own correction against the actual installed source.

Hoare's 1961 paper ("Algorithm 65: FIND", *Communications of the ACM* 4(7), p. 321) and the BFPRT 1973 paper ("Time Bounds for Selection", *Journal of Computer and System Sciences* 7, 448–461) were not opened directly this session; every claim attributed to them is sourced through Wikipedia's own quoted summary, recorded as such. Every numeric claim this topic makes (the measured comparison counts, the discard fraction, the depth-limit formula) is computed and asserted directly in `examples.py`.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=quickselect-median-medians:%20).
