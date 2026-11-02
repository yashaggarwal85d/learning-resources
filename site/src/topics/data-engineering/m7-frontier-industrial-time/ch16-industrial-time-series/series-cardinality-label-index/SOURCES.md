# Sources

## Prometheus: Data model

URL: https://prometheus.io/docs/concepts/data_model/
Version: Prometheus documentation, retrieved 2026-10-31

> Every time series is uniquely identified by its metric name and optional key-value pairs called labels.

> The change of any label's value, including adding or removing labels, will create a new time series.

Contents: the series-identity rule this topic's cardinality math is built on, run directly in `examples.py`: the series count for a label scheme is the product of each label's distinct value count.

## Prometheus: Metric and label naming

URL: https://prometheus.io/docs/practices/naming/
Version: Prometheus documentation, retrieved 2026-10-31

> Remember that every unique combination of key-value label pairs represents a new time series, which can dramatically increase the amount of data stored. Do not use labels to store dimensions with high cardinality (many different label values), such as user IDs, email addresses, or other unbounded sets of values.

Contents: the unbounded-label warning this topic's hook (a `batch_id` label multiplying series count) is built to measure directly.

## Prometheus: TSDB format (postings)

URL: https://raw.githubusercontent.com/prometheus/prometheus/main/tsdb/docs/format/index.md
Version: Prometheus repository, `tsdb/docs/format/index.md`, retrieved 2026-10-31

> Postings sections store monotonically increasing lists of series references that contain a given label pair associated with the list.

> A postings offset table stores a sequence of postings offset entries, sorted by label name and value.

Contents: the postings structure (a sorted series-ID list per label pair, offset-indexed) `examples.py` builds and intersects directly for a multi-label query.

## InfluxData: Introducing InfluxDB 3.0

URL: https://www.influxdata.com/blog/introducing-influxdb-3-0/
Version: InfluxData blog, retrieved 2026-10-31

> InfluxDB 3.0 now supports unlimited cardinality, which expands the use cases for InfluxDB to any time-stamped data.

Contents: named, not run — this is a vendor claim about the scan-based, no-per-series-index architecture (Parquet/Arrow columnar storage), sourced-only since no InfluxDB 3 instance exists in this environment; `examples.py` instead measures the same postings-vs-scan trade-off directly using DuckDB as the stand-in scan engine.

## Chapter 5's sketch and filter ids (named only — not yet built)

URL: (none)
Version: n/a

CHAPTER.md's `uses` line names `hyperloglog-distinct-counting` and `probabilistic-membership-filters` (Chapter 5: estimating the series count cheaply, and a cheap existence test). As of this topic's build time, Chapter 5 (Data Structures & Algorithms foundations for Data Engineering) only extends through §5.5 in `registry.ts`, and neither id exists yet. This topic does not claim those ids; see `OUTLINE.md` for the gap. Same handling as topic 10's identical Chapter 5 gap.

## Chapter 15's per-series-state topic (named only — not yet built)

URL: (none)
Version: n/a

CHAPTER.md's `uses` line names `per-series-state-cold-start-churn` (Chapter 15 topic 25: the per-series state this topic prices). As of this topic's build time, Chapter 15 only extends through §15.3 in `registry.ts`, and topic 25 doesn't exist yet. This topic does not claim that id; see `OUTLINE.md` for the gap.
