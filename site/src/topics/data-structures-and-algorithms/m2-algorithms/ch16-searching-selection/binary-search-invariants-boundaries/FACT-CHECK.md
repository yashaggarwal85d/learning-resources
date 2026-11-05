# FACT-CHECK: Binary search invariants and boundaries

## Claims table

| # | Claim | Source | Verified how |
|---|---|---|---|
| 1 | `lower_bound` is the first element not less than the target; `upper_bound` is the first element greater than the target, or the end of the range if none | cplusplus.com reference pages for `std::lower_bound`/`std::upper_bound` | Word-for-word quoted in SOURCES.md; definitions implemented exactly and checked against present, absent, and larger-than-everything keys in `examples.py` |
| 2 | First/last occurrence and the count of a key reduce to `lower_bound`/`upper_bound` | CHAPTER.md's own planning value | Computed directly in `examples.py` on a 12-element array with a run of three equal keys; count (3), first (index 1), last (index 3) all checked |
| 3 | Bloch's own JDK binary search carried the midpoint-overflow bug for about nine years before it was reported, the same bug as Bentley's *Programming Pearls* listing | Bloch, Google Research blog, 2006 | Word-for-word quoted in SOURCES.md |
| 4 | The naive midpoint `(low + high) / 2` fails once `low + high` exceeds the signed maximum for the integer width in use, wrapping negative | Bloch, 2006 | Word-for-word quoted in SOURCES.md |
| 5 | The bug manifests at array lengths around 2^30 (roughly a billion elements) for a 32-bit int | Bloch, 2006 | Word-for-word quoted in SOURCES.md ("230 or greater (roughly a billion elements)") |
| 6 | The portable fix is `low + ((high - low) / 2)`; the JDK's own shipped fix is the unsigned shift `(low + high) >>> 1` | Bloch, 2006 | Both lines word-for-word quoted in SOURCES.md; kept distinct in the reel (the shift is named once in post-notes as Java-specific, not taught as the general fix) |
| 7 | The overflow can be reproduced on a small fixed-width signed integer, not just claimed at a billion-element scale | This topic's own construction | Reproduced directly in `examples.py` on an 8-bit two's-complement simulation: 70 + 90 = 160 exceeds the 8-bit signed maximum (127), wraps to −96, and the naive midpoint comes out negative (−48) while the safe midpoint is correct (80) |
| 8 | Binary search over an array of n elements terminates in at most ⌈lg(n + 1)⌉ iterations in the worst case | Standard loop-invariant argument (not a quoted source; a derivation this topic proves itself) | Checked exhaustively over every possible target for n up to 1,000 in `examples.py` (the true worst case over all targets, not assumed to be the absent-largest-key case — an error caught and fixed below); checked for n = 1,000,000 via the single slowest path (target 0) |
| 9 | Every iteration of the loop strictly shrinks `hi − lo`, so the loop cannot fail to terminate | Loop-invariant argument, half-open convention | Instrumented directly in `examples.py`: the sequence of range widths at every iteration is checked to be strictly decreasing and to end at exactly 0 |

## Currency check

- Bloch's post was fetched 2026-11-05 from its current URL on research.google (the post itself, including its 17 Feb 2008 update, is unchanged historical content — there is no "current version" to check against).
- cplusplus.com's `lower_bound`/`upper_bound` pages were fetched 2026-11-05; en.cppreference.com returned HTTP 403 to this session's fetcher and was replaced with cplusplus.com per `scripts/sources.mjs`'s own instruction ("A source that can't be fetched is replaced by one that can"); both sites describe the same long-standing C++ standard library contract, unaffected by any recent language version.
- CLRS and the C99 standard text are citation-only this session (the C99 signed-overflow point is read from Bloch's own 2008 update, not opened as a primary standard-text source); no numeric claim rests on either beyond what Bloch's post itself states.

## Red team

1. **The first attempt at claim 8 used the wrong worst-case path.** Testing only the absent key `n` (one past the largest element) as "the slowest search" gave `max_iterations(2) == 1`, not the formula's `2`; brute-forcing every possible target in `[0, n]` found the true worst case (reached via the smallest key, which always takes the `hi = mid` branch) matches the formula exactly. This is recorded here, not smoothed over: an initial version of `examples.py` would have shipped an incorrect connection between "absent key" and "worst case," caught only by testing every target rather than one chosen by intuition.
2. **The 8-bit overflow reproduction is a toy, not the real bug's scale.** A real 32-bit `int` overflows only around a billion elements, which this environment cannot build or hold in memory; the 8-bit simulation is explicitly named as a simulation on screen (the reel's caption says "simulated on a small width," never implying a real billion-element array was built), and the underlying arithmetic (two's-complement wraparound, truncating division) is the same mechanism a real fixed-width language performs, not an approximation of a different mechanism.
3. **Python has no native fixed-width integer overflow**, so `naive_mid` must simulate it by explicit masking (`to_signed`) rather than by relying on Python's own arithmetic; this is stated in the code's own docstring, not left implicit, since a reader checking the implementation against a real C or Java binary search would otherwise be confused by the extra wrapping step.
4. **The unsigned-shift fix `(low + high) >>> 1` is Java-specific** (Java's `>>>` operator; C and C++ have no portable equivalent and the cast-based alternative Bloch originally proposed was later shown not to be guaranteed by C99) — the topic teaches `low + ((high - low) / 2)` as *the* safe form precisely because it needs no language-specific operator, and names the shift only once, as the JDK's own real fix, not as a second general-purpose technique.

## Corrections applied

- `examples.py`'s termination check was rewritten from "the absent key `n` is the worst case" (wrong, see Red team #1) to "the true worst case over every target in `[0, n]`," caught by the assertion failing on its first run (`n=2` gave 1 iteration against the formula's 2) before any claim reached `OUTLINE.md` or the reel.
