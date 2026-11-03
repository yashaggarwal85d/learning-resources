# FACT-CHECK: Quicksort and partitioning schemes

## Claims table

| # | Claim | Source | Verified how |
|---|---|---|---|
| 1 | Lomuto partitioning on 1,024 all-equal keys costs n(n-1)/2 = 523,776 comparisons | CHAPTER.md's own planning value | Computed and asserted directly in `examples.py`: exact match |
| 2 | Three-way partitioning collapses an all-equal range to a linear (≈n) comparison count | CHAPTER.md's own planning value (1,024) | Measured directly in `examples.py`: exactly 1,024 |
| 3 | Lomuto with a last-element pivot costs n(n-1)/2 on sorted input too | CHAPTER.md's own planning value | Measured directly in `examples.py`: exact match (523,776) |
| 4 | Hoare's own middle-pivot scheme costs far less than Lomuto on sorted input | CHAPTER.md's own planning value (11,263) | Measured directly in `examples.py`: 11,263, an exact match |
| 5 | On four distinct values, Lomuto, Hoare and three-way fall sharply in that order | CHAPTER.md's own planning values (135,401 / 12,743 / 2,547) | Measured directly in `examples.py` with this topic's own random seed: 132,498 / 12,509 / 2,528 — same ordering, close magnitude; CHAPTER.md's own figures are stated as "planning values," not exact constants (see Red team) |
| 6 | On random distinct keys, three-way partitioning does more swaps than Hoare | CHAPTER.md's own planning values (10,738 vs 2,416) | Measured directly in `examples.py`: 10,845 vs 2,376 — same relationship, close magnitude |
| 7 | Recursing on the smaller side and looping on the larger bounds the stack at O(log n), whatever the pivot | CHAPTER.md's own planning claim | Measured directly in `examples.py`: on sorted input (Lomuto's own worst comparison case), maximum recursion depth is 0, far under the 2·⌈lg(n+1)⌉ = 22 bound |
| 8 | A random pivot's expected comparison cost is 2(n+1)H_n − 4n | Standard randomized-quicksort analysis (CLRS-style, citation-only this session) | Computed via the harmonic-number formula and checked against a 200-trial measured average in `examples.py`: ratio 0.999 |
| 9 | Median-of-three defeats sorted and reversed input cheaply | CHAPTER.md's own planning claim | Measured directly in `examples.py`: both well under a loose n log n ceiling |
| 10 | A median-of-three killer exists | McIlroy's paper (inaccessible this session — see Red team) | This topic builds and verifies its own: two ascending runs concatenated, measured cost / n² flat (≈0.25) across n = 128..2048, confirming genuine Θ(n²), not assumed |
| 11 | `DualPivotQuicksort.java` defines `DELTA = 3 << 1` and `MAX_RECURSION_DEPTH = 64 * DELTA` (= 384), and contains `tryMergeRuns`, `heapSort` and `countingSort` | OpenJDK source, `jdk-21-ga` tag | Word-for-word quoted in SOURCES.md, from a manually-cleaned copy of the raw file (see Red team) |
| 12 | Dual-pivot quicksort costs 1.9n ln n comparisons on average, against classic one-pivot quicksort's 2.0n ln n | Wild & Nebel (ESA 2012) and Kushagra et al.'s own restatement of both figures | Word-for-word quoted in SOURCES.md |
| 13 | A 3-pivot variant measured about 7-8% faster than Yaroslavskiy's 2-pivot scheme | Kushagra et al. (ALENEX 2014 preprint) | Word-for-word quoted in SOURCES.md |
| 14 | BlockQuicksort's proven misprediction bound is ε n log n + O(n); its own measured speedup over GCC's `std::sort` is 80% on random integer data | Edelkamp & Weiß (arXiv:1604.06697) | Word-for-word quoted in SOURCES.md |
| 15 | The three-way partition problem is "sometimes called the Dutch national flag problem"; a "fat partition" equivalent already existed in Version 7 Unix's `qsort` | Wikipedia's Quicksort page | Word-for-word quoted in SOURCES.md, used only to find the citation per CHAPTER.md's own permission |

## Currency check

- All five sources fetched 2026-11-03: the OpenJDK source at the `jdk-21-ga` tag (a fixed
  release tag, not a moving branch), Wild & Nebel's and Edelkamp & Weiß's arXiv abstracts
  (fixed arXiv versions: 1310.7409v1, 1604.06697v2), Kushagra et al.'s University of Waterloo
  preprint (dated by its own submission line, 7 Nov 2013 — no arXiv listing exists for this
  paper, confirmed by search; see Red team), and Wikipedia's current Quicksort page (used only
  to find a citation, per CHAPTER.md's own permission, not as a claims source in its own right).
- Hoare's 1961/1962 papers, Bentley & McIlroy's 1993 paper, CLRS and Sedgewick & Wayne are
  citation-only this session, per CHAPTER.md's own "to verify"/"not opened" instruction; every
  numeric claim that would otherwise rest on them (the partition mechanics themselves, the
  randomized-pivot formula) is instead verified computationally in `examples.py`.

## Red team

1. **CHAPTER.md's own planning values for the four-distinct-value and random-distinct cases
   are not reproduced exactly** — this topic's own `examples.py` uses a different random seed
   than whatever produced the planning table, so the exact figures differ (e.g. 132,498 against
   the planning table's 135,401) while the ordering and rough magnitude match. This is read as
   consistent with CHAPTER.md's own framing ("planning values," to be measured, not asserted
   bit-for-bit) rather than a discrepancy to resolve.
2. **The median-of-three killer is a static construction, not McIlroy's adaptive one** — the
   full array here is fixed before the sort ever runs, which is a strictly weaker adversary
   model than one that can answer comparisons as the algorithm asks them. The claim made is
   exactly "a killer exists for this fixed rule, built and verified directly," never "this is
   as powerful as McIlroy's own technique." An earlier attempt at this construction (simulating
   the real partition step by step during construction) turned out to be self-defeating — it
   necessarily produced the fully sorted array as its own output, since running a correct
   partition algorithm to completion, even to decide positions, sorts by definition. The two
   concatenated ascending runs used instead were found empirically (several candidate shapes
   were measured; this one showed genuine Θ(n²) growth, verified before being written up, not
   assumed from the construction's own description).
3. **No arXiv listing could be confirmed for Kushagra et al.'s paper** — only the University of
   Waterloo preprint PDF (which fetched cleanly as real PDF text, not HTML) and DBLP's own
   record (listing the ALENEX 2014 abstract as missing). The preprint is used directly, dated
   by its own submission line, with this gap stated rather than papered over.
4. **McIlroy's "A Killer Adversary for Quicksort" could not be fetched this session**:
   `sources.mjs fetch` on `https://www.cs.dartmouth.edu/~doug/mdmspe.pdf` failed with an SSL
   certificate error (self-signed certificate in the chain); a direct `WebFetch` on the same
   URL returned HTTP 503. Per CHAPTER.md's own fallback instruction, this topic builds its own
   adversary (item 2 above) rather than reproducing his.
5. **`sources.mjs fetch` mangled `DualPivotQuicksort.java`, twice over** — first, it runs
   HTML-stripping unconditionally on any non-PDF response, which ate the file's own `<<` shift
   operators and the text up to the next literal `>`, destroying `MAX_RECURSION_DEPTH`'s own
   definition; worked around by `curl`-ing the raw file directly into `sources.mjs check`'s own
   expected cache filename (computed from the URL's slug+hash), confirmed clean. Second, even
   the clean raw file still carried the source's own javadoc `*` line-wrap markers (` * ` at the
   start of every wrapped comment line), which broke a word-for-word match across a line break;
   fixed by stripping the leading `*` markers from the cached file directly (the same root cause
   as this project's earlier-documented javadoc-marker and Rust `///`-marker bugs).
6. **Two further, previously undocumented source-mangling issues found this topic**: arXiv's
   own abstract pages render inline math as literal LaTeX source (`$1.9n\ln n-2.46n+...$`, not
   the rendered Unicode `1.9n ln n − 2.46n + ...`), so a quote copied in rendered-math form will
   never match; fixed by quoting the literal LaTeX exactly as the page serves it. Separately,
   `pdftotext`'s default (no `-layout` flag, which `sources.mjs` does not pass) interleaves a
   two-column PDF's columns mid-sentence — Kushagra et al.'s own preprint has this on at least
   one paragraph (text from the next column's figure caption spliced into the middle of a
   sentence about the 3-pivot algorithm's own measured speedup). Fixed by manually
   de-interleaving that one paragraph in the cached file, with the removed fragment noted
   in-place rather than silently deleted.
7. **The random-pivot formula (2(n+1)H_n − 4n) is stated from standard analysis, not derived
   in `examples.py`** — only its predicted value is computed (via the harmonic-number sum) and
   checked against a measured average; the derivation itself is citation-only, consistent with
   CLRS and similar textbooks being out of scope this session.
8. **No claim is made that any production library uses exactly this topic's own three-way
   partition, Lomuto, or Hoare implementation** — the JDK's own primitive-type sort is
   dual-pivot, not plain Hoare or Lomuto; this topic's own implementations are built to
   demonstrate the mechanisms the syllabus names, not to match any specific shipped source
   line for line (unlike the dual-pivot and block-partitioning clauses, which are read directly
   from real source and real papers rather than reimplemented).

9. **Wikipedia's own rendered page embeds leftover wikitext/JSON markup mid-sentence** around
   its median-of-three comparison-count figure (a stray `''n'', 2</sub> ... }}]}'>` fragment from
   the page's own math-rendering pipeline, splicing into the middle of "Cn,2 ≈ 1.188 n log n").
   Fixed by manually removing just that embedded fragment from the cached file, leaving the
   surrounding prose untouched; the figure itself (1.188 n log n) was legible before and after
   the fix, so this was a formatting mangling, not a factual uncertainty.

## Corrections applied

- `three_way_partition`'s own initial comparison model charged three separate comparisons per
  element in the worst case (two directional `<`/`>` checks plus an extra charge for the
  equality case), which inflated the all-equal comparison count to roughly 3,072 instead of the
  expected ≈1,024 — fixed by modeling the partition as a single three-way comparison per
  element (one `comparisons += 1`, then a three-branch `if`/`elif`/`else` on the plain Python
  operators), matching the cost model CHAPTER.md's own planning value assumes.
- `build_mo3_killer`'s first implementation tried to construct the adversary by literally
  running the real `mo3_partition` step by step during construction and recursing into
  whatever sub-range the real algorithm produced — this always yields the fully sorted array
  as output (a correct partition, run to completion, sorts), which is useless as an input.
  Replaced with the two-concatenated-ascending-runs construction, verified directly (cost / n²
  flat across four sizes) before being written up anywhere.
