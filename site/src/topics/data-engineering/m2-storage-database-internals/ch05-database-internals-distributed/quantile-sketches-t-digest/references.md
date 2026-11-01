Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`): a real, mergeable digest built from scratch and measured against a naive average
and the true exact value on a real, partitioned, heavy-tailed dataset.

- Dunning & Ertl, "Computing Extremely Accurate Quantiles Using t-Digests": [arxiv.org](https://arxiv.org/pdf/1902.04023). t-digest's own clustering and buffer-and-merge construction.
- Masson, Rim, Lee, "DDSketch: A Fast and Fully-Mergeable Quantile Sketch with Relative-Error Guarantees": [arxiv.org](https://arxiv.org/pdf/1908.10693). The rank-error-vs-relative-error distinction, and DDSketch's own use by Datadog.
- Karnin, Lang, Liberty, "Optimal Quantile Approximation in Streams": [arxiv.org](https://arxiv.org/pdf/1603.05346). KLL's own rank-error guarantee.
- ClickHouse documentation, "quantileTDigest": [clickhouse.com](https://clickhouse.com/docs/reference/functions/aggregate-functions/quantileTDigest). A real warehouse engine's own t-digest-backed function.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=quantile-sketches-t-digest:%20).
