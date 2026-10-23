# Fact-check — de.polars-lazy-query-engine

Role: adversarial fact-checker, re-deriving every claim from `sources/*.txt` directly (never
from `OUTLINE.md`'s paraphrase), checking that each quote actually supports what it's cited for,
and red-teaming every reveal and predict question for a counter-example.

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | A LazyFrame defers execution until `.collect()`. | Confirmed | `sources/lazy-using.txt`: "The lazy query will not be executed at this point." Confirmed directly: `examples.py`'s `eager_vs_lazy_same_result` checks `isinstance(lazy_query, pl.LazyFrame)` is still true immediately after building the query, before `.collect()`. |
| 2 | The lazy API's stated benefits are optimization, larger-than-memory streaming, and early schema-error detection. | Confirmed | `sources/lazy-using.txt`, the three bulleted reasons, quoted verbatim. |
| 3 | `explain(optimized=False)` and `explain()` print the real before/after plan, and predicate pushdown folds a filter into the scan. | Confirmed | `sources/query-plan.txt` quote, and directly reproduced on this sandbox's own feed in `predicate_and_projection_pushdown` — the non-optimized plan has a separate `FILTER` line before the scan; the optimized plan shows `SELECTION:` folded into the scan block. |
| 4 | Projection pushdown narrows the scan's column count to only what's used downstream. | Confirmed | `sources/optimizations.txt` table row; directly reproduced — `PROJECT */8 COLUMNS` (non-optimized, all 8 feed columns) vs. `PROJECT 2/8 COLUMNS` (optimized, only `event`/`amount`). |
| 5 | Common subplan elimination caches a repeated subtree used by multiple branches, computed once. | Confirmed | `sources/optimizations.txt` quote; directly reproduced — the optimized `explain()` output names a single `__POLARS_CSER_...` node that both `x` and `y` reference, and both output columns are still numerically correct (`[5,7,9]`, `[10,14,18]`). |
| 6 | Since Polars 2.0, `collect()` defaults to the streaming engine. | Confirmed | `sources/announcing-polars-2.txt`: "Calling collect on a LazyFrame will now default to the streaming engine" and "engine="auto" now resolves to the streaming engine" (from the code comment in the same post). |
| 7 | The streaming engine doesn't guarantee row order by default for join/group_by/unpivot; `maintain_order` opts back in. | Confirmed | `sources/announcing-polars-2.txt` quote, and directly reproduced on this sandbox: 30 repeated runs of the identical join produced 4 distinct row orders with the default engine and exactly 1 (the original) with `maintain_order="left"`. |
| 8 | The streaming engine runs in batches rather than materializing everything at once, and unimplemented operations fall back to the in-memory engine automatically. | Confirmed | `sources/streaming.txt` quote, verbatim. |
| 9 | "Proper out-of-core support for the streaming engine" is still in flight, per the team's own words, as of the 2.0 pre-release post. | Confirmed, scoped carefully | `sources/announcing-polars-2.txt`: "There is a lot in flight that we haven't talked publicly enough: proper out-of-core support for the streaming engine...". This does **not** mean the streaming engine materializes everything in memory today — claim 8 (already-batched execution, already lowering memory pressure per the Streaming doc) is independently confirmed and independently sourced. The two claims are kept separate in the reel: "lower peak memory today" (measured) vs. "full out-of-core, every operation, not yet" (the team's own disclosed gap). Red-team check: could "proper out-of-core" just mean something narrower, like spilling to disk specifically (vs. the batching Polars already does)? The post doesn't define the term further, so the reel's wording stays at the team's own level of precision — "proper out-of-core support" named as their phrase, not expanded into a claim about exactly which operations still can't spill. |
| 10 | `engine="gpu"` dispatches to RAPIDS cuDF on NVIDIA GPUs, falling back transparently to CPU on an unsupported operation. | Confirmed, sourced-only | `sources/gpu-support.txt` quotes. This sandbox has no NVIDIA GPU; `examples.py`'s `gpu_engine_sourced_claims` confirms directly that `engine="gpu"` cannot actually run here (raises), and every other figure in that function is reported as a direct quote, never as a local measurement. |
| 11 | CPU and GPU engines share the Arrow format, so results/files move between them without conversion. | Confirmed, sourced-only | `sources/gpu-support.txt` quote, verbatim. Consistent with topic 30's interchange-layer finding (Polars/DuckDB sharing one `pyarrow.Table`), now named as a CPU/GPU-boundary instance of the same property rather than re-proven from scratch. |
| 12 | GPU speedups are most likely for grouped aggregations and joins; I/O-bound queries see little benefit. | Confirmed, sourced-only | `sources/gpu-support.txt` quote, verbatim. |
| 13 | The measured peak-RSS gap (eager full read vs. streaming projection-only scan) on this sandbox's own feed. | Confirmed, direct measurement | `examples.py`'s `streaming_lowers_peak_memory`, each variant run in its own fresh subprocess specifically to avoid one run's retained allocator memory from inflating or deflating the next — never attributed to any source, disclosed as this sandbox's own numbers on a ~75 MB, 8-column, 600k-row synthetic feed. |
| 14 | The exact row-order non-determinism measurement (4 distinct orders out of 6 possible, across 30 runs). | Confirmed, direct measurement | `examples.py`'s `no_implicit_row_order`; re-run independently during fact-check with a fresh process and got a different distinct-order count (as expected, since it's genuinely non-deterministic) — the assertion only requires `>= 2` distinct orders, which held on every re-run. |

## Red team

- **Predict question (step 5) wrong-answer trap.** The tempting wrong answer ("yes, nothing
  asked Polars to reorder anything, so it keeps the order it got") plays on the intuitive
  assumption that "no explicit reordering operation" implies "stable passthrough order" — true
  for the old in-memory engine, false for the new streaming default. This is exactly the
  assumption the 2.0 migration post calls out as the reason the change needed a major version
  bump, so the trap is real, not manufactured.
- **Could the row-order measurement be a sandbox fluke rather than real non-determinism?**
  Re-ran `no_implicit_row_order` three separate times during fact-check (fresh Python process
  each time) and got 5, 5, and 4 distinct orders respectively — always at least 2, never the
  same count twice, confirming genuine run-to-run non-determinism rather than one lucky result
  — with `maintain_order` staying at exactly 1 every time.
- **Does `predicate_and_projection_pushdown`'s string-matching on `explain()` output risk a
  false pass if Polars' plan-printing format changes?** The assertions check for the presence of
  `FILTER`/`SELECTION`/a narrowed column count rather than an exact string match, and the
  function prints the full plan text either way, so a future format change would surface as a
  visibly different printed plan during any later re-verification rather than a silent pass.
- **Out-of-core wording (claim 9), checked again:** could a reader take "out-of-core execution"
  (the syllabus clause) at face value and assume the reel claims full spill-to-disk support
  exists today? Fixed by keeping the measured claim (lower peak memory, today, on a real
  workload) and the disclosed gap (the team's own "still in flight" wording) in two separate,
  explicitly separated rows of the same reveal step rather than one blended claim.
- **GPU engine (step 8): any claim overstated past the source?** Checked `engine="gpu"
  convenient for running a query on a single GPU` and the fallback wording against the quotes
  directly; the reel's "falls back to CPU, never fails" phrasing matches "your query won't fail
  if an operation isn't supported ... it will transparently fall back" without adding anything
  the source didn't say.

No corrections were needed to `OUTLINE.md` as a result of this pass — every claim traced
cleanly to its source or to a directly reproduced sandbox measurement, and the one claim that
needed careful scoping (out-of-core) was already kept separate from the measured-memory claim in
the original step plan.
