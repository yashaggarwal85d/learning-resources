# Sources

## TimescaleDB: Real-time aggregates

URL: https://docs.timescale.com/use-timescale/latest/continuous-aggregates/real-time-aggregates/
Version: Tiger Data Docs, retrieved 2026-10-31

> Real-time aggregates combine pre-aggregated data with the most recent raw data for up-to-date results

> In TimescaleDB v2.13 and later, real-time aggregates are DISABLED by default. In earlier versions, real-time aggregates are ENABLED by default; when you create a continuous aggregate, queries to that view include the results from the most recent raw data.

> If you add new historical data to an already-materialized bucket, it won't be reflected in a real-time aggregate. You should wait for the next scheduled refresh, or manually refresh by calling refresh_continuous_aggregate.

Contents: toggling real-time aggregation with `timescaledb.materialized_only`, and the "eventually consistent for historical changes" framing for late data arriving into an already-materialized bucket.

## Prometheus: Defining recording rules

URL: https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/
Version: current Prometheus documentation, retrieved 2026-10-31

> Recording rules allow you to precompute frequently needed or computationally expensive expressions and save their result as a new set of time series.

Contents: rule groups, the `rule_files` configuration field, and the per-group evaluation interval — the continuous-aggregate idea's counterpart in Prometheus, named in CHAPTER.md and `OUTLINE.md` only, not quoted beyond this one claim since this topic doesn't build or run a Prometheus instance.

## Thanos: Compactor documentation (downsampling and retention)

URL: https://thanos.io/tip/components/compact.md/
Version: Thanos documentation (tip), retrieved 2026-10-31

> Downsampling is a process of rewriting series' to reduce overall resolution of the samples without losing accuracy over longer time ranges.

> the initial goal of downsampling is not saving disk or object storage space. In fact, downsampling doesn't save you any space but instead, it adds 2 more blocks for each raw block which are only slightly smaller or relatively similar size to raw blocks.

> The goal of downsampling is to provide an opportunity to get fast results for range queries of big time intervals like months or years.

Contents (not run — no Thanos/object-storage instance in this environment; **sourced-only**, per CHAPTER.md's own allowance): the two-pass downsampling schedule (5m blocks after 40 hours, 1h blocks after 10 days) and the retention-per-resolution flags (`--retention.resolution-raw`, `-5m`, `-1h`), which this topic's own `route_query` and `retention_tier_storage_bytes` functions mirror in miniature.

## Chapter 3's additivity and incremental-maintenance material (in-course, used)

URL: (none — prior topics in this same site, not an external fetch)
Version: n/a

Named, not quoted. `measure-additivity-classes`, `incremental-view-maintenance`, `staleness-bound-target-lag` and `bounded-reprocessing-window` (all introduced earlier in the Data Engineering syllabus) are used by this topic's `uses` list.

## Chapter 5's sketches (named only — not yet built, see OUTLINE.md)

URL: (none)
Version: n/a

CHAPTER.md's `uses` line names Chapter 5's `quantile-sketches` and `hyperloglog-distinct-counting` as anchors for the mergeable-sketch idea. As of this topic's build time, Chapter 5 (Database Internals and Distributed Storage) only extends through §5.5 in `registry.ts`, and neither id exists yet. This topic does not claim those ids in its own `uses` list; see `OUTLINE.md` for the gap and how it's handled (a deliberately simplified, disclosed stand-in digest, not a claim about any production sketch's internals).
