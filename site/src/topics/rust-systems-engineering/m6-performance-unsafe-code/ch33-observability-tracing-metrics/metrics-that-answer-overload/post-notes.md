---
title: "Metrics that answer overload questions"
---

## Outcomes

- Measure that a real counter, read at a real checkpoint while two of five real calls are genuinely still running, cannot tell you that; it only ever counts what has already finished.
- Measure that a real histogram, built from completed latencies the same way, shares the identical blind spot: at that same checkpoint it holds only the finished calls, genuinely blind to the rest.
- Measure that a real gauge, read as a current value at that same checkpoint, correctly answers the question the other two could not, since it is the only one of the three built to go back down.
- State, from Prometheus's own documentation, the real distinction between the three metric shapes this topic's own code measures directly.

## Internals

The syllabus names several further real tools beyond this topic's own three hand-rolled metrics: RED (rate, errors, duration) and USE (utilization, saturation, errors), two real frameworks for choosing which metrics an overload question actually needs; queue depth and in-flight tasks, both real gauge-shaped values this topic's own code measures in miniature with its own in-flight gauge; and Tokio's own runtime, which exposes the identical real property directly through `RuntimeMetrics::num_alive_tasks`, "the current number of alive tasks in the runtime" — a real, built-in gauge over the runtime itself, rather than over this topic's own hand-rolled operation.

## In production

A real Prometheus server would scrape this topic's own three metrics over the network on a real interval, and a real Grafana dashboard would graph them; neither is reachable from this sandboxed container, so this topic measures the identical real metric values locally, by reading the same atomics and the same `Vec` a real exporter would read, rather than faking a scrape this container cannot make. Saturation, in a real production system, is exactly this topic's own gauge question asked about a real resource (a connection pool, a worker queue) instead of this topic's own toy operation; exemplars, a real Prometheus feature linking one specific latency-bucket observation back to the real trace that produced it, tie this chapter's own metrics directly to its own earlier spans and structured fields, closing the loop this chapter's first two topics opened.

## The frontier

Classic histograms, which this topic's own hand-rolled `Vec` of latencies stands in for, are Prometheus's older mechanism; native histograms are a real, newer, more efficient replacement that does not require configuring bucket boundaries ahead of time, and `histogram_quantile()` is the real function used to calculate a real percentile (like a p99) from either kind. This topic's own three completed latencies are far too few to need any of that; the real property it measures (a histogram's blind spot toward unfinished work) holds identically whether the histogram has three buckets or three thousand.

## Where this goes next

The right metric shape tells you that something is overloaded right now; it says nothing yet about what kind of real failure that overload, or anything else, actually produces once it happens.
