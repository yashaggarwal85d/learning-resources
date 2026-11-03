# OUTLINE: Timsort, Powersort and driftsort

A full topic, about 15 minutes. Fifth topic of Chapter 15. Every count below is computed and
asserted directly in `examples.py`; driftsort's exact definition is named from its own primary
sources (see `SOURCES.md`), not reimplemented.

## Storyboard

1. **Hook.** In 2015, a team trying to formally prove that Java's sort never crashes found
   that it can: a purpose-built input of about sixty-seven million elements makes
   `java.util.Collections.sort` throw an exception, because an invariant the code was supposed
   to keep was silently broken after one particular merge. The algorithm was written by Tim
   Peters for Python and ported to Java — and the same flaw sat in Python too.
2. **Predict.** Run lengths 120, 80, 25, 20 and 30 sit on the stack; the code merges 25 and 20
   and stops. Is the invariant "each run is longer than the sum of the next two" still true for
   120? (No — 120 is not longer than 80 + 45; reproduced directly from the JDK's own
   `mergeCollapse` loop.)
3. **Run detection.** Scan for the next non-decreasing stretch, or a strictly decreasing one,
   reversed in place (stability survives because a strict order has no ties to break). CPython's
   own worked example: a 3-element descending prefix reverses to an ascending run, then extends
   seamlessly into the ascending keys right after it.
4. **Minrun and binary insertion sort.** A run shorter than minrun is boosted up to minrun by a
   stable binary insertion sort. On random data, this makes every run close to minrun long —
   good for balanced merges, and for never making the per-merge overhead worth optimizing away.
5. **Picking minrun, the old way.** CPython's pre-2025 scheme (a value in [32, 65) chosen so
   N/minrun lands at or just under a power of 2) measured directly on N=2,112 — the one case the
   file names as the reason minrun isn't simply "32": picking 33 instead of 32 avoids an
   unbalanced tail merge.
6. **Galloping.** Once one side wins repeatedly, switch from one-pair-at-a-time to searching:
   compare A[0] against B[0], B[1], B[3], B[7]... then binary search the last gap. Measured
   directly: galloping first strictly beats linear search at i=6, loses twice before that (i=2,
   i=4), and MIN_GALLOP is set to 7 — just past the point it starts reliably paying off.
   *Takeaway:* "Galloping only pays off on long winning streaks; CPython sets its own threshold
   just past the point the comparison count actually crosses over."
7. **Predict.** Is there a case where galloping costs *more* comparisons than linear search ever
   would? (Yes — a short winning streak that triggers galloping by chance costs more than
   one-at-a-time search for exactly that streak, which is why CPython calls this case "Galloping
   with a Broken Leg.")
8. **The old merge-policy invariant.** Merging must stay on adjacent runs (stability), so the
   original Timsort kept each pending run bigger than the next two combined — "the first thing
   that didn't obviously suck," by CPython's own words, loosely based on Fibonacci growth.
9. **Why the hook's merge breaks it.** `mergeCollapse` only re-checks the invariant on the top
   three stack entries after a merge — exactly enough to miss what just happened one level
   further down. The paper's own smallest counterexample that actually crashes: an array of
   over 67 million elements, non-primitive type, throwing an array-index error; the same bug
   sat unfixed in Python since the method was introduced.
   *Takeaway:* "A local check (only the top of the stack) is not the same guarantee as a global
   invariant — the 2015 bug is exactly that gap."
10. **CPython 3.11: Powersort.** A run pair's "power" is the depth, in an ideal merge tree, of
    the node joining them — computed directly here from the midpoint fractions, not approximated.
    Measured: runs of 40 and 40 (in a range of 80) have power 1; runs of 10 and 10 have power 3,
    and 10 and 60 have power 1. Runs merge while the stack's stored power exceeds the new one, so
    powers on the stack strictly decrease. Confirmed from source: the CPython changelog entry
    (bpo-34561) sits under the 3.11.0a1 heading, dated 2021-09-01; the same file, one tag earlier
    at 3.10.0, has no mention of Powersort at all.
11. **2025: Pochmann's minrun refinement.** CPython's own current development branch (not yet a
    tagged release) describes a newer scheme: at every level of the merge tree, the number of
    runs is a power of 2, at most two run lengths appear, and they differ by at most one.
    Reproduced on CPython's own 315-element example: the old scheme gives seven runs of 40 and
    one of 35; the new scheme gives a mix of 39s and 40s, still eight runs, still a power of 2.
12. **Driftsort, named.** Rust's stable sort since 1.81 is driftsort (Peters and Bergdoll): the
    standard library's own documentation calls it quicksort's average case with mergesort's fast
    worst case and partial run detection, linear on fully sorted or reversed input. Its own source
    allocates scratch memory as max(n/2, min(n, 8MB)) — scaling like n for small inputs, capped
    near n/2 for large ones — and falls back to mergesort, not heapsort, past its own depth limit.
13. **Recap.** Three things, learned once, keep showing up: detect what's already there before
    doing new work; a merge policy is a promise that needs checking as carefully as the merge
    itself; and "the fast case" and "the worst case" are usually two different algorithms
    stitched together by one counter.
14. **Handoff.** Every comparison sort built so far pays per comparison. The word-RAM model says
    a machine can do more per step than compare two keys — it can read a key as a fixed number of
    bits and act on them directly. Counting, radix and bucket sort, next.

## Why no compiled benchmark

Every count here — run lengths, comparison counts, galloping's crossover, node powers, the
2015 bug's broken invariant, driftsort's own allocation formula — is a small, exact computation
or a direct transcription of a real library's own loop, checked in Python; driftsort's exact
mechanism (run creation, its specific lazy-merge policy) is named only from its own primary
sources, per `CHAPTER.md`'s own scope for this topic, not reimplemented.

## Changes from the chapter plan

- Stefan Pochmann's 2025 minrun refinement is read from CPython's `main` branch, confirmed
  absent from the `v3.13.0` and `v3.14.0` release tags — stated explicitly as pre-release,
  unreleased work as of this fetch, not a shipped Python version's behavior, per `SOURCES.md`'s
  own Red team.
- `CHAPTER.md`'s own more specific phrase for driftsort, "run creation and lazy merging" adapted
  from glidesort, could not be located verbatim in the one design-document writeup page linked
  directly from the Rust source; this topic instead cites that writeup's own, more general
  statement (driftsort's core structure derives from glidesort) and does not assert the more
  specific two-part mechanism, per `SOURCES.md`'s own Red team.
- CLRS, Sedgewick & Wayne, and the paper CPython's own file says the galloping idea "probably
  dates back to" (Bentley and Yao, unnamed) are citation-only this session, consistent with
  `CHAPTER.md`'s own framing; every mechanism this topic claims is instead verified directly
  from a primary source read this session.
