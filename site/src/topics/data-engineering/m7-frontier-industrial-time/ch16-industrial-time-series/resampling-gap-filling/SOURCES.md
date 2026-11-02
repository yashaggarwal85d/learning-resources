# Sources

## pandas: `DataFrame.resample`

URL: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.resample.html
Version: pandas 3.1.0 documentation (installed in this environment: pandas 3.0.5; the `resample` API used below is unchanged between the two)

> Resample time-series data.

> Convenience method for frequency conversion and resampling of time series.

Contents: the method signature (`rule`, `closed`, `label`, `convention`, `on`, `level`, `origin`, `offset`, `group_keys`), the default bin edge for Tick-based frequencies, and that an aggregate (`.mean()`, `.sum()`, `.last()`, `.apply()`) is applied to the `Resampler` object it returns.

## pandas: `merge_asof`

URL: https://pandas.pydata.org/docs/reference/api/pandas.merge_asof.html
Version: pandas 3.1.0 documentation (installed in this environment: pandas 3.0.5)

> This is similar to a left-join except that we match on nearest key rather than equal keys. Both DataFrames must be first sorted by the merge key in ascending order before calling this function.

> A "backward" search selects the last row in the right DataFrame whose 'on' key is less than or equal to the left's key.

Named only in this topic (the as-of join across sensor series is topic 9's own subject, `de.as-alignment-unsynchronized-streams`); quoted here only to confirm `merge_asof`'s own definition of its default `direction='backward'` search, which this topic's `resample_step` reasoning depends on (forward-filling means always looking backward from a grid point, never ahead).

## TigerData (TimescaleDB) docs: `time_bucket_gapfill()`

URL: https://docs.tigerdata.com/api/latest/hyperfunctions/gapfilling/time_bucket_gapfill/
Version: retrieved 2026-10-31 (docs for TimescaleDB hyperfunctions, feature present "Since 1.2.0")

> Group data into buckets based on time interval, while filling in gaps of missing data.

> If you don't provide a gapfilling algorithm, such as locf or interpolate, gaps are left as NULL in the returned data.

Contents (not run — no TimescaleDB instance in this environment; **sourced-only**, per CHAPTER.md's own allowance): the sample query nests the aggregate inside the gapfill function (`locf(AVG(temperature))`, `interpolate(AVG(temperature))`), confirming the nesting order this topic's own `locf_fill`/`linear_interpolate_fill` functions mirror (fill after aggregate, never aggregate after fill).

## InfluxDB 3 Core docs: Gapfill plugin

URL: https://docs.influxdata.com/influxdb3/core/plugins/library/official/gapfill/
Version: InfluxDB 3 Core Documentation, retrieved 2026-10-31 (plugin requires InfluxDB 3 Core 8.2+)

> The Gapfill Plugin detects gaps in time series (spacing between consecutive points wider than a threshold) and fills them with imputed values using standard missing-data imputation methods.

> Bounded imputation: gaps longer than max_fill_gap are never invented, only reported

Contents (not run — no InfluxDB 3 instance here; **sourced-only**): the plugin's `max_fill_gap` parameter and `mark_filled` option are the published-system version of this topic's own `MAX_GAP` and per-point fill flag, confirming the max-gap rule is an established pattern in real gap-filling tooling, not an invention of this topic.

## Chapter 2's window functions (in-course, used)

URL: (none — a prior topic in this same site, not an external fetch)
Version: n/a

Named, not quoted. `percentile-cont-disc` and `lag-lead-change-detection` (both introduced earlier in the Data Engineering syllabus) are used by this topic's `uses` list, for the state-change detection reasoning that motivates treating step signals differently from continuous ones. No verbatim text from those topics is reproduced here.
