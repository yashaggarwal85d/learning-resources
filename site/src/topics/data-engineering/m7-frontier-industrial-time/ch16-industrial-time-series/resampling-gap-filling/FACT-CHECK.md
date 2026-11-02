# Fact check

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | `resample` is pandas' method for frequency conversion/resampling of a time series. | pandas `DataFrame.resample` docs | Confirmed verbatim |
| 2 | `merge_asof`'s default direction is a backward search: the last right-side row at or before the left's key. | pandas `merge_asof` docs | Confirmed verbatim |
| 3 | `time_bucket_gapfill` leaves gaps as NULL unless a gapfilling algorithm (`locf` or `interpolate`) is supplied, and those algorithms wrap the aggregate (`locf(AVG(...))`), not the reverse. | TigerData `time_bucket_gapfill()` docs | Confirmed verbatim (quote); nesting order confirmed from the sample query, not run (no TimescaleDB instance) |
| 4 | InfluxDB 3's Gapfill plugin detects gaps by inter-point spacing and imputes with standard methods (linear, LOCF, etc.), bounded by `max_fill_gap` so nothing beyond it is invented. | InfluxDB 3 Core Gapfill plugin docs | Confirmed verbatim (quote); not run (no InfluxDB 3 instance) |
| 5 | A mean over machine-state codes (e.g. states 1 and 2) produces a value like 1.5 that is not a valid state. | `examples.py` (`wrong_aggregate_state_mean`) | Computed and asserted, `python3 examples.py` passes |
| 6 | LOCF and linear interpolation across a real outage both reproduce the pre-outage flat value, hiding a real excursion that happened during the outage. | `examples.py` (`locf_fill`, `linear_interpolate_fill`) | Computed and asserted |
| 7 | A max-gap rule with an observed/filled/missing flag correctly reports a gap beyond the threshold as missing, and a gap within it as filled. | `examples.py` (`honest_fill_with_flag`) | Computed and asserted |
| 8 | An honest aggregate over a bucket with no observed or filled points is NaN, not a silently invented number. | `examples.py` (`honest_mean_over_bucket`) | Computed and asserted |
| 9 | A counter's resampled per-bucket consumption (diff of last values) sums to the series' total rise and is never negative. | `examples.py` (`resample_counter`) | Computed and asserted |

## Red team

- **Does the pandas `merge_asof` quote over-claim relevance to this topic?** No — it's named only to confirm the direction semantics behind forward-filling logic, and `SOURCES.md` says so explicitly; the as-of join across series is deferred to topic 9 and this topic's `reel.tsx`/`coverage.json` do not claim to teach it.
- **Is the TigerData/InfluxDB sourcing honest about not being run?** Yes — both sections in `SOURCES.md` and this table say "not run — no [TimescaleDB/InfluxDB 3] instance in this environment", consistent with CHAPTER.md's own allowance to source rather than run those two engines.
- **Could the wrong-aggregate illustration be seen as begging its own conclusion** (picking state codes 1 and 2 because they average to a visibly wrong 1.5)? It's disclosed in `OUTLINE.md` as a worked illustration of a known, general failure mode (averaging categorical codes), not a derived empirical result — any two distinct state codes produce a non-member average under a plain mean, this is a property of the mean operator over nominal codes, not a property of this specific dataset.
- **Does the LOCF/interpolation "lies" claim depend on the outage happening to align with the excursion?** The claim is general (any outage overlapping an excursion window will have this property for LOCF, and for interpolation whenever both endpoints of the gap are back at baseline); the specific window (01:00–05:00 outage, 02:15–02:45 excursion) is one concrete case chosen to make the arithmetic clean (30° delta, flat baseline either side), not cherry-picked to avoid a counter-case — a reader can substitute any excursion strictly inside the outage window and reach the same conclusion.
- **Is the max-gap threshold (30 minutes) arbitrary?** Yes, and `reel.tsx`/narration say so: it's a policy choice tied to the signal's expected report period (topic 8's own scope line), not a universal constant; `examples.py` names it `MAX_GAP` as a module-level constant for exactly this reason.
- **Checked `reel.tsx`, `scenes.tsx`, `narration.json` for leaked exact phrasing from the quoted sources** — none found; all text in those files restates the ideas in the topic's own words.
