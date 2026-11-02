# Outline

## Scope mapped to steps

1. Hook: a one-line label change takes the metrics server's memory from a few gigabytes to being killed.
2. Reveal: a series is a metric name plus its full label set — any label change is a new series.
3. Reveal: worst-case cross product vs. the plant's own actual series count.
4. Predict: does a label matcher with several conditions have to scan every series?
5. Reveal: a postings intersection answers it without touching most series; a regex matcher can't avoid the scan.
6. Reveal: one unbounded label multiplies the series count by its own distinct-value count.
7. Reveal: a columnar, scan-based model has no per-series index to blow up, at the cost of a scan.
8. Recap.
9. ProveIt.

## Why the postings intersection and the blowup needed to be built, not quoted

CHAPTER.md's own instruction is to build and measure the postings intersection in `examples.py`, not just describe it. `examples.py` builds a real postings structure (a sorted series-ID list per label/value pair, matching the TSDB format's own description) over a synthetic but realistic plant label scheme, intersects it for a multi-label query, checks the result against a brute-force scan over the same matchers, and separately measures a regex-style matcher that has no postings entry of its own. The unbounded-label blowup is likewise computed directly: a `batch_id` label added to every sensor series multiplies the series count by the distinct batch count, checked by direct assertion rather than asserted as a round number.

## The two Chapter 5 and Chapter 15 gaps (fourth and fifth of this chapter, same handling each time)

CHAPTER.md's `uses` line names `hyperloglog-distinct-counting` and `probabilistic-membership-filters` (Chapter 5: cheap cardinality estimation and a cheap existence test) and `per-series-state-cold-start-churn` (Chapter 15 topic 25: the per-series state cost this topic prices). As of this topic's build, Chapter 5 only extends through §5.5 and Chapter 15 only through §15.3 in `registry.ts` (verified by grep before writing this file) — none of the three ids exist yet. This topic omits them from its own `uses` list rather than claiming a topic that hasn't shipped, exactly as topics 6, 10 and 11 did for their own gaps. The postings index this topic builds is an exact structure (not a probabilistic estimate), so it doesn't depend on the missing sketch ids to function — only the "cheap estimate of cardinality before building the exact index" framing CHAPTER.md gestures at is left out.

## What this topic leaves out (per CHAPTER.md)

The storage engine's head block, WAL and compaction (topic 13); the choice among engine families — Prometheus vs. TimescaleDB vs. InfluxDB 3 vs. ClickHouse (topic 14); observability metric naming, histograms and SLO design (Chapter 13, pointer only); the inverted index for text search (skipped, §5.5); HyperLogLog internals (Chapter 5, used only as a pointer to cheap estimation, not built here since the id doesn't exist yet — see the gap above).
