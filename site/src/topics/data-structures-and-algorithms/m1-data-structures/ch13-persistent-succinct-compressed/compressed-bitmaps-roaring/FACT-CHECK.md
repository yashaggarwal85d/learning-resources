# FACT-CHECK: Compressed bitmaps: Roaring (`dsa.compressed-bitmaps-roaring`)

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Two-level structure: 65,536 chunks by top 16 bits, each a sorted (key, container) pair, container holds the low 16 bits | Chambi et al. 2016 | Verified — quoted; reproduced in `examples.py`'s `RoaringBitmap` class |
| 2 | Array container ≤4096 values (2 bytes each), bitmap container >4096 (8,192 bytes fixed) | Chambi et al. 2016; RoaringFormatSpec | Verified — quoted both; `examples.py` asserts the exact 4,096 crossover |
| 3 | Run container: 2 + 4r bytes for r runs; only used when smaller than the array/bitmap alternative | Lemire et al. 2016 (run paper); RoaringFormatSpec | Verified — quoted; reproduced in `examples.py`'s `smallest_container` |
| 4 | The four worked chunk-size examples (100 scattered → array 200B; 4,097 in one run → run 6B; 30,000 in 15,000 runs → bitmap 8,192B; full chunk → run 6B) | CHAPTER.md's own planning arithmetic | Verified — `examples.py` reproduces all four exactly |
| 5 | `runOptimize`: scans array/bitmap containers and converts to run containers "if helpful," typically done once before storing as immutable objects to query | Lemire et al. 2016 (run paper) | Verified — quoted exactly, including the function's own name |
| 6 | Array-array union: merge if sum of cardinalities ≤4096, else build as bitmap and convert back only if it falls to ≤4096 | Chambi et al. 2016 | Verified — quoted |
| 7 | Array-array intersection: simple merge when cardinalities differ by less than 64×, else galloping | Chambi et al. 2016 | Verified — quoted; `examples.py` demonstrates the cost crossover (galloping wins decisively once one array dwarfs the other) |
| 8 | Serialization cookies: 12346 (no run containers), 12347 (with run containers) | RoaringFormatSpec | Verified — quoted exactly |
| 9 | Performance claims: "2× smaller," "up to 900× faster for intersections" (2016 paper, its own datasets); "up to two orders of magnitude" (run paper) | Chambi et al. 2016; Lemire et al. 2016 | Verified — quoted exactly, attributed to each paper's own benchmark, not presented as a universal figure |
| 10 | Adoption: Lucene (two separate Roaring-inspired classes, not the library itself), Spark (imports the library directly), Pinot (imports `ImmutableRoaringBitmap` directly), Druid (names Roaring as its default bitmap compression) | Each system's own source/docs, read directly | Verified — each claim checked against the actual file, not just the Roaring papers' own adoption sentence |
| 11 | Lucene's `RoaringDocIdSet`: 2^16-value blocks, array below 2^12 set bits, inverse-array above 2^16−2^12, else a bit set | `RoaringDocIdSet.java` | Verified — quoted, including the inverse-set third case not present in the original Roaring papers |
| 12 | Lucene's `IndexedDISI`: a second, separate class, same 65536-range/4096-threshold shape, three-way ALL/DENSE/SPARSE choice | `IndexedDISI.java` | Verified — quoted; this topic states explicitly that it's a distinct class from `RoaringDocIdSet`, not the same one |
| 13 | Run container attribution: the array/bitmap format is Chambi, Lemire, Kaser and Godin (2016); the run container is a second paper, Lemire, Ssi-Yan-Kai and Kaser (2016) | Both papers read directly | Verified — the syllabus's single citation ("Chambi, Lemire et al., 2016") is imprecise; this topic cites both correctly and says which introduced which |
| 14 | Lemire, Kaser, Kurz et al. 2018 (the implementation paper) | Citation only, per CHAPTER.md | Citation only — title/venue checked, not read, no claim quoted |

## Currency check

All sources read 2026-10-31. Both Roaring papers are arXiv preprints of published journal
articles (SPE 46(5) and 46(11), 2016) and don't change. The format spec, Lucene, Spark and Pinot
sources were read from their current default branches (`master`/`main`); the topic records this
as "as of 2026-10-31," since a library's internals can change — the specific claims checked
(imports, class structure, named constants) are stable implementation choices, not likely to
flip overnight, but post-notes names the branch and date read rather than claiming permanence.

## Red team

1. **The two Lucene classes are not the RoaringBitmap library** — `RoaringDocIdSet` and
   `IndexedDISI` are Lucene's own code, "inspired from"/"inspired of" Roaring, with their own
   independently-chosen variations (an inverse-array third case in `RoaringDocIdSet`; a third
   ALL category in `IndexedDISI` that the original Roaring papers don't have). Stated explicitly
   in SOURCES.md and `post-notes.md`, not glossed over as "Lucene uses Roaring."
2. **Performance numbers are each paper's own benchmark, not a universal claim.** "Up to 900×
   faster" and "up to two orders of magnitude" are both headline best-case figures from each
   paper's own datasets and hardware (Census 1881 data in the first case). The reel and
   post-notes attribute each number to its own paper and dataset, never presenting either as a
   general multiplier a reader should expect on their own data.
3. **The three real predicates in `examples.py` (dense/sparse/clustered) are constructed to have
   the right shape, not real log semantics** — named as a stand-in explicitly in `OUTLINE.md` and
   the reel's own narration, not presented as measuring real `level=ERROR`/`service=auth` data.
4. **The galloping intersection's cost model in `examples.py` is a simplified instructional
   model** (an exponential-search-then-binary-search-back routine), not CRoaring's or the
   RoaringBitmap Java library's actual production implementation — it demonstrates the
   *asymptotic* reason galloping wins once one array dwarfs the other, which is what the topic
   claims; it does not claim to reproduce any specific library's exact instruction count.
5. **`examples.py`'s array/bitmap/run size formulas follow CHAPTER.md's own in-memory
   convention** (array = 2c bytes, no separate cardinality field) rather than the run paper's
   serialized-form convention (array = 2c + 2 bytes, counting a stored cardinality header) —
   both are real conventions used in different parts of the literature; this topic's own worked
   numbers match CHAPTER.md's planning table exactly, and SOURCES.md quotes the run paper's
   serialized-form rule (2c + 2) alongside, so the difference is visible, not hidden.

## Corrections applied

- The first `examples.py` draft constructed the "30,000 values in 15,000 runs" chunk by doubling
  15,000 independently-scattered points into pairs; some pairs landed adjacent to each other by
  chance, collapsing two runs into one and producing only 10,864 runs instead of 15,000 (still
  correctly choosing a bitmap container, but not reproducing CHAPTER.md's exact "run 60,002"
  figure). Fixed by constructing exactly 15,000 evenly-spaced runs of two values each,
  guaranteed not to touch; re-ran and the number matched the plan exactly.
- The two Lucene source quotes (`RoaringDocIdSet.java`, `IndexedDISI.java`) initially failed
  `sources.mjs check` because the javadoc's `" * "` line-continuation prefix is literal source
  text that survives normalization — a quote spanning a line wrap must include it, the same
  gotcha previously hit on a `#`-commented config file. Fixed by either including the `*` marker
  on every wrapped line or quoting only within one physical line.
