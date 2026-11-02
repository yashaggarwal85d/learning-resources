# Fact check

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | `merge_asof` matches on nearest key, default direction `'backward'`, both frames pre-sorted. | pandas `merge_asof` docs | Confirmed verbatim; run |
| 2 | `merge_asof`'s `tolerance` parameter bounds how far a match can be from the left key. | pandas `merge_asof` docs | Confirmed verbatim; run |
| 3 | DuckDB's `ASOF JOIN` produces at most one right-side match per left row, so the left side can shrink (not grow) when right-side times are missing. | DuckDB AsOf Join guide | Confirmed verbatim; run (DuckDB 2.0.0) |
| 4 | ClickHouse's `ASOF JOIN` joins sequences with a non-exact match, using any number of equality conditions and exactly one closest-match condition; NaN keys must be filtered on both sides. | ClickHouse JOIN docs | Confirmed verbatim; not run (no ClickHouse instance) |
| 5 | kdb+'s `aj` matches on equality for all but the last column, taking the most recent time for the last column, returning a left-join (nulls for unmatched). | kdb+ `aj` reference | Confirmed verbatim; not run (no kdb+ instance) |
| 6 | DuckDB and pandas produce identical joined rows for the same dense-pressure/sparse-temperature data, with and without a partition key. | `examples.py` | Computed and asserted, `python3 examples.py` passes |
| 7 | A tolerance tighter than the signal's report period produces a nonzero null rate; a tolerance at least as wide as the report period produces zero. | `examples.py` | Computed and asserted |
| 8 | A tolerance set below the known clock-offset uncertainty excludes at least as many matches as one set at the offset itself. | `examples.py` | Computed and asserted |
| 9 | On a continuous ramp, a backward step match and a look-ahead linear interpolation disagree meaningfully; only the interpolated value recovers the true value between samples. | `examples.py` | Computed and asserted |
| 10 | Omitting the per-equipment partition key still returns one row per left row (pandas does not error — it would need `by` to avoid silently matching across equipment in a mixed-key join). | `examples.py` | Computed and asserted |

## Red team

- **Did building the DuckDB/pandas agreement test "cheat" by using data where the answer is obvious?** The two series are at genuinely different rates (10s vs. 60s) with distinct value ranges per equipment, and the check compares every row's joined temperature value between the two engines directly — not a property that would pass trivially if either engine's join logic were wrong.
- **Is the ClickHouse/kdb+ sourcing honest about not being run?** Yes — `SOURCES.md`, this table and `OUTLINE.md` all say so explicitly, consistent with CHAPTER.md's "sourced-only where not run" allowance.
- **Does the clock-offset example assume a specific offset value that happens to make the point work?** `CLOCK_OFFSET_SECONDS = 15` is used only to compare the null rate at `offset` vs. `offset - 1`; the assertion (`rate_below_offset >= rate_at_offset`) holds for any positive offset on a monotonically-increasing null-rate-vs-tolerance curve, which is a structural property of the backward-match/tolerance mechanism, not specific to 15 seconds.
- **Does the "look-ahead cost" framing over-claim what interpolation needs?** No — `interpolated_value` explicitly looks for a sample at or after `left_second`, which a true real-time pipeline (processing events as they arrive) cannot do before that future sample exists; `OUTLINE.md` and `reel.tsx`/narration state this as the cost, not as a reason interpolation is wrong to use in a backward, non-real-time analysis.
- **Checked `reel.tsx`, `scenes.tsx`, `narration.json` for leaked exact phrasing from the quoted sources** — none found.
