Last verified against these sources: 23 October 2026. Real measurements on this sandbox's own
Polars 2.0.0 (`examples.py`).

- The Polars user guide, "Usage" (Lazy API): [docs.pola.rs](https://docs.pola.rs/user-guide/lazy/using/). Deferred execution, why the lazy API matters.
- The Polars user guide, "Query plan": [docs.pola.rs](https://docs.pola.rs/user-guide/lazy/query-plan/). Non-optimized vs. optimized plans, predicate pushdown.
- The Polars user guide, "Optimizations": [docs.pola.rs](https://docs.pola.rs/user-guide/lazy/optimizations/). The optimization table, including common subplan elimination.
- The Polars user guide, "Streaming": [docs.pola.rs](https://docs.pola.rs/user-guide/concepts/streaming/). Batch-wise execution, in-memory fallback for unimplemented operations.
- Ritchie Vink, "Pre-release of Polars 2.0" (2 September 2026): [pola.rs](https://pola.rs/posts/announcing-polars-2/). The streaming default, the no-implicit-row-order rule and `maintain_order`, the "proper out-of-core support ... still in flight" disclosure, the frontier roadmap.
- The Polars user guide, "GPU Support [Open Beta]": [docs.pola.rs](https://docs.pola.rs/user-guide/gpu-support/). The cuDF-backed GPU engine, sourced-only (no GPU on this sandbox).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=polars-lazy-query-engine:%20).
