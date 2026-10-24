# Sources — Benchmarking discipline and statistics

## Criterion.rs Documentation — Analysis Process
URL: https://bheisler.github.io/criterion.rs/book/analysis.html
Fetched: 2026-10-24, cached at `sources/criterion-analysis.txt`.
> The first step in the process is warmup. In this phase, the routine is executed repeatedly to give the OS, CPU and JIT time to adapt to the new workload. This helps prevent things like cold caches and JIT compilation time from throwing off the measurements later.

> The first step in analysis is outlier classification. Each sample is classified using a modified version of Tukey's Method, which will be summarized here. First, the interquartile range (IQR) is calculated from the difference between the 25th and 75th percentile.

> This process can be extremely sensitive to changes, especially when combined with a small, highly deterministic benchmark routine. In these circumstances even very small changes (eg. differences in the load from background processes) can change the measurements enough that the comparison process detects an optimization or regression.

## HdrHistogram — README (GitHub)
URL: https://raw.githubusercontent.com/HdrHistogram/HdrHistogram/master/README.md
Fetched: 2026-10-24, cached at `sources/hdrhistogram-readme.txt`.
> The raw data histogram collected for such a hypothetical system (over the
> 200 second scenario above) would show ~99.99% of results at 1 msec or below,
> which is obviously "not right".

> When used for response time characterization, the recording with the optional
> expectedIntervalBetweenValueSamples parameter will tend to produce data sets
> that would much more accurately reflect the response time distribution that a
> random, uncoordinated request would have experienced.
