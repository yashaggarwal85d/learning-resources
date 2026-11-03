## CPython — `Objects/listsort.txt`, `v3.11.0` tag (read at research time)

URL: https://raw.githubusercontent.com/python/cpython/v3.11.0/Objects/listsort.txt
Version: fetched 2026-11-03, `v3.11.0` tag

> If a natural run contains less than minrun elements (see next section), the main loop
> artificially boosts it to minrun elements, via a stable binary insertion sort applied to the
> right number of array elements following the short natural run.

> Instead we pick a minrun in range(32, 65) such that N/minrun is exactly a power of 2, or if
> that isn't possible, is close to, but strictly less than, a power of 2.

> The original version of this code used the first thing I made up that didn't obviously
> suck ;-) It was loosely based on invariants involving the Fibonacci sequence.

> I first learned about the galloping strategy in a related context; see:
>
>     "Adaptive Set Intersections, Unions, and Differences" (2000)
>     Erik D. Demaine, Alejandro López-Ortiz, J. Ian Munro
>
> and its followup(s).  An earlier paper called the same strategy
> "exponential search":
>
>    "Optimistic Sorting and Information Theoretic Complexity"
>    Peter McIlroy
>    SODA (Fourth Annual ACM-SIAM Symposium on Discrete Algorithms), pp
>    467-474, Austin, Texas, 25-27 January 1993.

> Galloping with a Broken Leg

> In general, if A[0] belongs at B[i], linear search requires i+1 comparisons to determine
> that, and galloping a total of 2*floor(lg(i))+2 comparisons. The advantage of galloping is
> unbounded as i grows, but it doesn't win at all until i=6.

> MIN_GALLOP is 7, and that's pretty strong evidence.

### Contents (item by item, this topic's scope)

- The run-boosting rule (a short natural run extended to minrun by binary insertion sort) and
  the 1993-era minrun-selection scheme (`range(32, 65)`, chosen so `N/minrun` lands at or just
  under a power of 2) — the baseline this topic contrasts with Pochmann's 2025 refinement
  below.
- CPython's own words for its original merge-policy heuristic: "loosely based on invariants
  involving the Fibonacci sequence" — the policy the 2015 bug (CAV 2015 paper, below) found
  broken.
- The galloping mechanism's own citation trail: Demaine, López-Ortiz & Munro (2000) for the
  name "galloping", and McIlroy's 1993 SODA paper (cited by CPython itself, not opened this
  session — see Red team) for the earlier name "exponential search" and its analysis.
- The exact galloping-versus-linear-search comparison count table and its crossover point
  (i = 6), and `MIN_GALLOP`'s own value (7), both recomputed directly in `examples.py`.

## CPython — `Objects/listsort.txt`, `v3.10.0` tag (read at research time, to confirm absence)

URL: https://raw.githubusercontent.com/python/cpython/v3.10.0/Objects/listsort.txt
Version: fetched 2026-11-03, `v3.10.0` tag

### Contents (item by item, this topic's scope)

- Confirms by its own absence: this file at the `v3.10.0` tag contains no mention of
  "powersort" anywhere (checked directly: `grep -ci powersort` on the raw fetched file
  returns 0), supporting this topic's claim that CPython's switch to the Powersort merge
  policy is new as of 3.11, not present a release earlier.

## CPython — `Objects/listsort.txt`, `main` branch (read at research time; unversioned, moving)

URL: https://raw.githubusercontent.com/python/cpython/main/Objects/listsort.txt
Version: fetched 2026-11-03, `main` branch (not yet in a tagged release; this topic's own
scope note below says so explicitly, since `main` moves)

> In 2025, Stefan Pochmann found a much better approach, based on letting minrun vary a bit
> from one run to the next. Under his scheme, at _all_ levels of the merge tree:
>
> - The number of runs is a power of 2.
> - At most two different run lengths appear.
> - When two do appear, the smaller is one less than the larger.
> - The lengths of run pairs merged never differ by more than one.

> For example, with 315 random elements, the old scheme uses fixed minrun=40 and produces
> runs of length 40, except for the last. The new scheme produces a mix of lengths 39 and 40:
>
> old:  40 40 40 40 40 40 40 35
> new:  39 39 40 39 39 40 39 40

### Contents (item by item, this topic's scope)

- Stefan Pochmann's 2025 refinement to minrun selection, read directly from CPython's own
  current `main` branch (confirmed absent from the `v3.13.0` and `v3.14.0` tags by direct
  grep, so this is pre-release, unreleased work as of this fetch — stated as such, not as a
  shipped version's behavior).
- The 315-element worked example (40/40/.../35 against 39/39/40/.../40), reproduced and
  verified directly in `examples.py`.

## de Gouw, Rot, de Boer, Bubel & Hähnle — "OpenJDK's java.util.Collection.sort() Is Broken: The Good, the Bad and the Worst Case" (CAV 2015)

URL: https://ir.cwi.nl/pub/23709/23709A.pdf
Version: fetched 2026-11-03, CWI's own open-access final-version PDF (394kb, linked from the
institutional repository page at https://ir.cwi.nl/pub/23709)

> consider as an example the situation where runLen consists of 120, 80, 25, 20, 30 on entry
> of mergeCollapse, directly after 30 has been added by pushRun.

> In the second iteration, it is checked that the invariant is satisfied at 80 and 45 (lines
> 13 and 17), which is the case since 80 > 45 + 30 and 45 > 30, and mergeCollapse terminates.
> But notice that the invariant does not hold at 120, since 120 ≤ 80 + 45.

> The method mergeCollapse ensures that the top three elements of the stack satisfy the
> invariant given in the comments above.

> the smallest counterexample is an array of 67+ million elements (with non-primitive type)

> It turns out that the bug is present in Python as well, ever since the method was
> introduced.

### Contents (item by item, this topic's scope)

- The exact run-length example (120, 80, 25, 20, 30 → 120, 80, 45, 30, invariant 120 > 80+45
  false) this topic reproduces directly in `examples.py` by transcribing the JDK's own
  `mergeCollapse` loop.
- The paper's own characterization of the root cause: `mergeCollapse` only re-establishes the
  invariant on the top three stack entries, which is not enough to guarantee it holds deeper
  in the stack.
- The paper's own stated size of the smallest counterexample (67+ million elements, non-
  primitive type) and its own claim that the same bug exists in CPython's `list.sort`,
  unfixed since the method's introduction — both stated only as the paper's own claims, not
  independently reproduced (reproducing a 67-million-element crash is out of this topic's
  scope).
- One rendering artifact in the cached PDF text noted and worked around (a stray "×" character
  and an odd space inserted into "120, 80, 45, 30" — "120× , 80,\n45, 30" — from the PDF's own
  footnote-marker rendering, immediately after the first worked-example sentence): the quote
  above splits around that one sentence rather than quoting through the garbled numbers; the
  resulting run lengths (120, 80, 45, 30) are stated in this topic's own prose and verified
  directly in `examples.py` by transcribing and running the real `mergeCollapse` loop, not
  taken as a literal quote.

## Munro & Wild — "Nearly-Optimal Mergesorts: Fast, Practical Sorting Methods That Optimally Adapt to Existing Runs" (ESA 2018)

URL: https://arxiv.org/abs/1805.04154
Version: fetched 2026-11-03, abstract page (arXiv:1805.04154v1)

> We present two stable mergesort variants, "peeksort" and "powersort", that exploit existing
> runs and find nearly-optimal merging orders with practically negligible overhead.

### Contents (item by item, this topic's scope)

- The paper's own name for its two algorithms (peeksort, powersort) and its own one-sentence
  claim for them, cited as the paper's claim, not independently re-derived (the proof that
  powersort's merge cost is within a constant of the entropy bound is named, not proved, per
  `CHAPTER.md`'s own scope).

## CPython — `Misc/NEWS.d/3.11.0a1.rst`, `v3.11.0` tag (read at research time)

URL: https://raw.githubusercontent.com/python/cpython/v3.11.0/Misc/NEWS.d/3.11.0a1.rst
Version: fetched 2026-11-03, `v3.11.0` tag

> .. bpo: 34561
> .. date: 2021-09-01-19-21-48

> List sorting now uses the merge-ordering strategy from Munro and Wild's
> ``powersort()``. Unlike the former strategy, this is provably near-optimal
> in the entropy of the distribution of run lengths.

### Contents (item by item, this topic's scope)

- Confirms the bpo-34561 changelog entry sits under the `3.11.0a1` heading (dated
  2021-09-01), the exact version this topic cites for "CPython switched to Powersort in 3.11",
  read directly from the NEWS fragment file rather than assumed from the "What's New" page
  (which does not mention it, per `CHAPTER.md`'s own research note).

## Rust 1.81.0 — `library/core/src/slice/sort/stable/mod.rs` (`1.81.0` tag, read at research time)

URL: https://raw.githubusercontent.com/rust-lang/rust/1.81.0/library/core/src/slice/sort/stable/mod.rs
Version: fetched 2026-11-03, `1.81.0` tag

> /// Stable sort called driftsort by Orson Peters and Lukas Bergdoll.
> /// Design document:

> // By allocating n elements of memory we can ensure the entire input can
> // be sorted using stable quicksort, which allows better performance on
> // random and low-cardinality distributions. However, we still want to
> // reduce our memory usage to n / 2 for large inputs. We do this by scaling
> // our allocation as max(n / 2, min(n, 8MB)), ensuring we scale like n for
> // small inputs and n / 2 for large inputs, without a sudden drop off.

### Contents (item by item, this topic's scope)

- The authorship credit (Orson Peters and Lukas Bergdoll) and the design document's own link,
  confirming driftsort is named, not folklore.
- The exact scratch-memory allocation formula, `max(n/2, min(n, 8MB))`, read directly from the
  source's own comment, matching `CHAPTER.md`'s own citation word for word.

## Rust `std::primitive::slice` documentation, "Current implementation" (`sort`, read at research time)

URL: https://doc.rust-lang.org/std/primitive.slice.html
Version: fetched 2026-11-03 (current docs at fetch time)

> The current implementation is based on driftsort by Orson Peters and Lukas Bergdoll, which
> combines the fast average case of quicksort with the fast worst case and partial run
> detection of mergesort, achieving linear time on fully sorted and reversed inputs.

### Contents (item by item, this topic's scope)

- The documentation's own one-line characterization of driftsort (Rust's stable sort), cited
  for the "topic draws driftsort as topic 49's natural merge sort plus topic 50's quicksort"
  framing.

## Rust blog — "Announcing Rust 1.81.0" (read at research time)

URL: https://blog.rust-lang.org/2024/09/05/Rust-1.81.0/
Version: fetched 2026-11-03

> Both the stable and unstable sort implementations in the standard library have been updated
> to new algorithms, improving their runtime performance and compilation time.

> Additionally, both of the new sort algorithms try to detect incorrect implementations of
> Ord that prevent them from being able to produce a meaningfully sorted result, and will now
> panic on such cases rather than returning effectively randomly arranged data.

### Contents (item by item, this topic's scope)

- The announcement itself (both sorts rewritten in this release) and the behavior-change
  warning (a broken `Ord` now panics rather than silently mis-sorting) — the one fact this
  topic says a reader should know before trusting either sort on a custom comparator.

## sort-research-rs — driftsort introduction writeup (Bergdoll & Peters, read at research time)

URL: https://raw.githubusercontent.com/Voultapher/sort-research-rs/main/writeup/driftsort_introduction/text.md
Version: fetched 2026-11-03, `main` branch (unversioned; the authors' own design document,
linked directly from the Rust source comment above)

> This document explains and verifies the design goals for an efficient, generic and robust
> stable sort implementation called driftsort by Orson Peters and Lukas Bergdoll ([source
> code](https://github.com/Voultapher/driftsort)).

> The influences are varied, but the core structure is derived from
> [glidesort](https://github.com/orlp/glidesort) by Orson Peters.

> The same structure as the one found in [introsort](https://en.wikipedia.org/wiki/Introsort)
> is used by driftsort to avoid the well-known O(N^2) worst-case of quicksort. Once a
> recursion depth of 2 * log2(N) is reached, it switches to a different algorithm.

> However, in the case of driftsort the algorithm it switches to is mergesort. This ensures
> it will never call quicksort again, only using the guaranteed O(N * log(N)) mergesort
> routines.

### Contents (item by item, this topic's scope)

- The authors' own framing: driftsort's core structure derives from glidesort (also by Peters),
  and driftsort borrows introsort's depth-limit idea but falls back to mergesort instead of
  heapsort (the detail that distinguishes it from topic 51's own introsort-depth-limit clause).
- `CHAPTER.md`'s own more specific phrase, "run creation and lazy merging" adapted from
  glidesort, is not found verbatim in this particular writeup page (see Red team); this topic
  instead draws the weaker, directly-quoted claim above (driftsort's structure derives from
  glidesort) and does not assert the more specific "lazy merging" mechanism from this source.

### Red team

1. **CLRS, Sedgewick & Wayne, and Bentley & Yao's unnamed earlier paper (mentioned only as
   "probably dates back to" in CPython's own text) are not opened this session.** No claim in
   this topic rests on any of them.
2. **McIlroy's 1993 SODA paper is cited by CPython itself but not independently opened or
   verified this session** — this topic states only what CPython's own file says about it
   (the paper's title, venue and page numbers, and CPython's own characterization "good
   analysis of a mergesort... probably strongly related"), not any claim from the paper's own
   text.
3. **`CHAPTER.md`'s own phrase "run creation and lazy merging" adapted from glidesort could
   not be found verbatim in the driftsort introduction writeup** (the one writeup page linked
   directly from the Rust source's own design-document comment). This topic instead cites the
   writeup's own, more general statement that driftsort's "core structure is derived from
   glidesort", and does not assert the more specific two-part mechanism `CHAPTER.md` names,
   since this session could not locate it in a primary source. A different writeup page in
   the same repository (e.g. a glidesort-specific writeup) may carry that exact phrase, but
   was not opened this session, given the scope and time this refresher-adjacent full topic
   allows.
4. **The CAV 2015 paper's PDF-extracted text has one known rendering artifact** (a stray "×"
   character and an odd space inserted into "120, 80, 45, 30", from a footnote marker in the
   original PDF layout, immediately after the first worked-example sentence) — the only
   occurrence of those numbers in the extracted text; no clean second occurrence exists.
   Worked around by splitting the quote into two blockquotes that bracket the one garbled
   sentence, and stating the run lengths (120, 80, 45, 30) only in this topic's own prose,
   verified separately and exactly by transcribing and running the real `mergeCollapse` loop
   in `examples.py`, not taken as a literal quote.
5. **The Pochmann 2025 minrun refinement is read from CPython's `main` branch, not a tagged
   release** — confirmed absent from the `v3.13.0` and `v3.14.0` release tags by direct grep,
   so this topic states explicitly that it is unreleased, pre-release work as of this fetch,
   not a shipped Python version's behavior.
6. **No independent benchmark reproduces driftsort's or Powersort's own measured performance
   claims** — this topic names what the authors' own papers and writeups say (the entropy
   near-optimality, the N/2 allocation policy, the introsort-style depth limit) without
   re-measuring any of it, consistent with `CHAPTER.md`'s own "named, not built" framing for
   driftsort's exact definition.
