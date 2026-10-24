---
title: "Benchmarking discipline and statistics"
---

## Outcomes

- Build a real, deterministic latency-distribution model: a real, fixed array of samples standing in for a real benchmark's own captured samples, since this sandboxed container has no flaky wall-clock timing to depend on.
- Measure that a distribution's own p50 and p99 are genuinely separate statistics, not the same number read twice.
- Measure that a real "before" and "after" pair of distributions can genuinely improve the median while genuinely regressing the p99 tail, on the identical change.
- Measure that the real average alone genuinely hides this divergence, since it moves with the median's own improvement rather than the tail's own regression.
- State, from Criterion.rs's own documentation and from HdrHistogram's own README, the real rules this topic's own code measures directly.

## Internals

The percentile function sorts the real samples once and indexes directly into the sorted array by rank (the nearest-rank method), rather than interpolating between two samples, so every result this topic reports is one of the real recorded values, never a synthetic point between two of them. This mirrors Criterion.rs's own documented process in miniature: before any comparison is trusted, a real warmup phase runs the routine repeatedly so the OS, CPU, and JIT have already adapted, and a real outlier-classification pass (a modified Tukey's method, using the interquartile range between the twenty-fifth and seventy-fifth percentiles) separates genuine noise from a genuine regression. Background load, frequency scaling under turbo boost, simultaneous multithreading sharing a core's own real execution units, and noisy neighbours on a shared machine are all real sources of exactly that noise, which is why a single run is never enough to trust.

## In production

A real benchmarking session follows a real, repeatable workflow: measure, hypothesize what a change should do, make the change, then measure again against the identical distribution-level statistics, never against a single run. `std::hint::black_box` exists to stop the compiler from proving a benchmarked value is unused and deleting the work being measured entirely. Criterion.rs and Divan are the real Rust crates that automate this whole wall-clock workflow, including the warmup and outlier-classification steps measured directly in this topic's own prototype; `iai-callgrind` (renamed Gungraun) instead counts real CPU instructions under a virtual machine, trading wall-clock noise for a stable, deterministic signal that a continuous-integration pipeline can compare run to run without the coordinated-omission and background-load problems a live timer always carries.

## The frontier

HdrHistogram's own README names the real bias a naive load generator introduces by waiting for one slow response before sending the next: coordinated omission. A raw histogram collected under that bias can show the overwhelming majority of results as fast, which the README calls "obviously not right," because every request that would have arrived during the slow one was never sent and so was never measured as slow either. Correcting for an expected interval between samples restores the real response-time distribution an uncoordinated, independent stream of requests would have actually experienced — the same real divergence this topic's own median-versus-tail measurement demonstrates directly, just introduced by the measurement process itself rather than by the system under test.

## Where this goes next

Knowing that a tail and a median can move in opposite directions decides what a benchmark's own result is even allowed to claim; it says nothing yet about which exact part of the real code that tail's own cost actually lives in.
