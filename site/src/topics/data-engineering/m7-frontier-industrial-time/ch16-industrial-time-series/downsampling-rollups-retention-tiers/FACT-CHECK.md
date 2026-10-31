# Fact check

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | TimescaleDB's real-time aggregates combine pre-aggregated data with the most recent raw data; disabled by default from v2.13, enabled by default in earlier versions. | TimescaleDB Real-time aggregates docs | Confirmed verbatim |
| 2 | Adding historical data to an already-materialized bucket isn't reflected in a real-time aggregate until a refresh. | TimescaleDB Real-time aggregates docs | Confirmed verbatim |
| 3 | Prometheus recording rules precompute expensive expressions and save the result as a new time series. | Prometheus recording rules docs | Confirmed verbatim |
| 4 | Thanos downsampling rewrites series to reduce resolution without losing accuracy over longer time ranges; its goal is faster long-range queries, not saving space — downsampled blocks add roughly 2 more blocks per raw block. | Thanos Compactor docs | Confirmed verbatim; not run (no Thanos/object-storage instance) |
| 5 | A naive average of unequal-count hourly averages disagrees meaningfully with the true count-weighted mean when one hour's sample count differs sharply from the rest. | `examples.py` (`naive_average_of_averages`) | Computed and asserted, `python3 examples.py` passes |
| 6 | Merging hourly min/max/sum/count rollups into one daily rollup reproduces the raw computation's sum, count and mean exactly. | `examples.py` (`merge_rollups`) | Computed and asserted |
| 7 | Merging two mergeable digests and querying a quantile equals building one digest from the union directly. | `examples.py` (`SimpleMergeableDigest`) | Computed and asserted |
| 8 | A late reading added to an already-materialized bucket changes that bucket's max, count and mean. | `examples.py` (`late_data_invalidation`) | Computed and asserted |
| 9 | A minute-level rollup costs less storage per retained day than raw data at a realistic (one-per-second) sampling rate. | `examples.py` (`retention_tier_storage_bytes`) | Computed and asserted |
| 10 | A query routes to raw for a short range, to the minute rollup for a longer one, and stitches minute and hour rollups for a range spanning both tiers. | `examples.py` (`route_query`) | Computed and asserted |
| 11 | A mean rollup over a bucket containing one spike reports a value close to the surrounding baseline; a max rollup over the same bucket reports the spike exactly. | `examples.py` (spike test) | Computed and asserted |
| 12 | The same time range scans far fewer rows from a rollup than from raw data. | `examples.py` (DuckDB row-count check) | Computed and asserted |

## Red team

- **Is the `SimpleMergeableDigest` stand-in misrepresenting what a production sketch does?** No — `OUTLINE.md` and the class's own docstring both say explicitly that it keeps every value (exact at this lab's scale) rather than a bounded approximation, and that sketch internals are out of scope; only the mergeability *property* is being demonstrated, which is the only thing CHAPTER.md asks this topic to show.
- **Does omitting `quantile-sketches`/`hyperloglog-distinct-counting` from `uses` understate what this topic depends on?** The dependency is conceptual (the idea that a quantile needs a mergeable summary, not an average), and `SOURCES.md`/`OUTLINE.md` document the gap explicitly rather than silently dropping the reference or fabricating a Chapter 5 topic id that doesn't exist.
- **Is the restart-hour hook example rigged to produce the desired direction of error?** Any hour with a disproportionately low sample count and a mean far from the rest produces this error in the direction of its own mean, by the definition of an unweighted average vs. a weighted one — the specific restart-hour framing is illustrative, not cherry-picked to avoid a counter-case (a cold-start hour with a low mean would pull the naive average down instead, by the identical mechanism).
- **Does the storage-arithmetic comparison depend on an unrealistic raw sampling rate?** `examples.py` uses one sample per second as the raw rate, a realistic rate for industrial telemetry (this chapter's own topics 1-9 sample at rates from 1Hz to one per several seconds); a slower raw rate would narrow the gap but not reverse it, since a rollup point's fixed per-point cost (min/max/sum/count) only wins when there are enough raw points per rollup bucket to amortize it.
- **Does Thanos's own retention/downsampling documentation over-claim relevance given it isn't run?** `SOURCES.md` and this table both say "not run — no Thanos/object-storage instance," consistent with CHAPTER.md's own "sourced-only" allowance for this engine.
- **Checked `reel.tsx`, `scenes.tsx`, `narration.json` for leaked exact phrasing from the quoted sources** — none found.
