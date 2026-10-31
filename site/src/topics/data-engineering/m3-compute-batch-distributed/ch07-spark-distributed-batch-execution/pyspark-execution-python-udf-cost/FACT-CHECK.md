# Fact-check: de.pyspark-execution-python-udf-cost

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Codegen cannot fuse a plain Python function; fusion stops at the opaque boundary | Confirmed | Structural claim, consistent with `WholeStageCodegenExec`'s own `CodegenSupport` interface requirement (topic 6's own expert note); a pickled Python UDF's own exec node (`BatchEvalPythonExec`) does not implement it. |
| 2 | Input rows cross into Python pickled individually, one row at a time | Confirmed | `sources/batch-eval-python-exec.txt`, quoted verbatim in `SOURCES.md`; `scripts/sources.mjs check` passes. |
| 3 | A pandas UDF uses Arrow to transfer data in whole vectorised batches | Confirmed | `sources/pandas-functions.txt`, quoted verbatim. |
| 4 | A built-in expression is measurably the fastest of the three on the identical computation | Confirmed | Measured directly: `examples.py`, `t_builtin < t_arrow`. |
| 5 | The Arrow UDF is measurably faster than the pickled UDF on the identical computation | Confirmed | Measured directly: `examples.py`, `t_arrow < t_pickled`. |
| 6 | The gap from built-in to pickled is large, several times slower, not incidental noise | Confirmed | Measured directly: `examples.py`, `t_pickled / t_builtin > 3` (observed 5.7-8.2x across runs). |
| 7 | Arrow's own speed advantage over pickling comes from batch-at-a-time crossing, not merely a faster encoding | Confirmed, structural inference from sourced facts | Combines claim 2 (pickled: per row) and claim 3 (Arrow: per batch) directly; not an independently sourced single quote naming "the reason," since neither source states the comparison explicitly. |

## Red team

- **Is a wall-clock timing measurement reliable enough to assert a strict ordering, given a
  shared cloud sandbox's CPU noise?** Thresholds are set well inside the margin actually observed
  across several independent runs during drafting (builtin 0.17-0.33s; Arrow 0.57-1.4s; pickled
  1.5-2.1s) — the ordering held in every run, and the chosen ratio thresholds (1.5x, 1.1x, 3x) are
  roughly half the smallest gap actually measured, not a hair's-width pass.
- **Why isn't claim 7 (the "why") backed by one direct quote the way the other claims are?**
  Neither source states the comparison between the two paths explicitly — each documents its own
  mechanism only. Disclosed in this table as a structural inference the two separately-quoted
  facts support together, not a sourced claim in its own right, following the same disclosure
  pattern this chapter's `FACT-CHECK.md` files use for anything not independently measured.
- **Could AQE have changed which UDF path actually ran, undermining the timing measurement?**
  No — `spark.sql.adaptive.enabled` is explicitly set to `false` for the whole session; AQE
  doesn't change which physical operator evaluates a UDF in any case, only shuffle-partition and
  join-strategy decisions this topic doesn't measure.
- **Does the pickled-vs-Arrow gap hold at Spark 4.2+, where Arrow UDFs are the stated default?**
  Named directly in `post-notes.md`'s Frontier section as a version-specific fact this topic's own
  4.0.1-targeted measurement predates on purpose — the pickled path measured here is still the
  default on 4.0.1, so the gap this topic shows is the one a reader on that version actually sees.

No corrections were needed to `OUTLINE.md` beyond settling on wall-clock timing (rather than a
plan-text signal, this chapter's usual methodology) as the only way to measure a runtime speed
gap directly.
