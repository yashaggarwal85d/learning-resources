## Usage (Lazy API)

URL: https://docs.pola.rs/user-guide/lazy/using/
Version: current (fetched 2026-10-23)

> With the lazy API, Polars doesn't run each query line-by-line but instead processes the full query
> end-to-end. To get the most out of Polars it is important that you use the lazy API because:

> the lazy API allows Polars to apply automatic query optimization with the query optimizer

> the lazy API allows you to work with larger than memory datasets using streaming

> the lazy API can catch schema errors before processing the data

> By starting the query with pl.scan_csv we are using the lazy API.

> The lazy query will not be executed at this point.

Contents: using the lazy API from a file (`pl.scan_csv`); using the lazy API from an existing
DataFrame (`.lazy()`); why the lazy API matters (query optimization, larger-than-memory streaming,
early schema-error detection); deferred execution until `.collect()`.

## Query plan

URL: https://docs.pola.rs/user-guide/lazy/query-plan/
Version: current (fetched 2026-10-23)

> For any lazy query Polars has both: a non-optimized plan with the set of steps code as we provided
> it and an optimized plan with changes made by the query optimizer

> In this case the query optimizer has identified that the filter can be applied while the CSV is
> read from disk rather than reading the whole file into memory and then applying the filter. This
> optimization is called Predicate Pushdown.

Contents: `explain(optimized=False)` vs `explain()` on the same query; the non-optimized plan reads
as written (scan all columns, then filter); the optimized plan folds the filter into the scan step
(predicate pushdown); `show_graph` for both plan stages, including the streaming physical plan.

## Optimizations

URL: https://docs.pola.rs/user-guide/lazy/optimizations/
Version: current (fetched 2026-10-23)

> If you use Polars' lazy API, Polars will run several optimizations on your query. Some of them are
> executed up front, others are determined just in time as the materialized data comes in.

Contents: the optimization table — predicate pushdown ("Applies filters as early as possible/ at
scan level", 1 time), projection pushdown ("Select only the columns that are needed at the scan
level", 1 time), slice pushdown (1 time), common subplan elimination ("Cache subtrees/file scans
that are used by multiple subtrees in the query plan", 1 time), simplify expressions (until fixed
point), join ordering (1 time), type coercion (until fixed point), cardinality estimation (query
dependent).

## Streaming

URL: https://docs.pola.rs/user-guide/concepts/streaming/
Version: current (fetched 2026-10-23)

> One additional benefit of the lazy API is that it allows queries to be executed in a streaming
> manner. Instead of processing all the data at once, Polars can execute the query in batches allowing
> you to process datasets that do not fit in memory. Besides memory pressure, the streaming engine
> also is more performant than Polars' in-memory engine.

> Some operations are inherently non-streaming, or are not implemented in a streaming manner (yet).
> In the latter case, Polars will fall back to the in-memory engine for those operations. A user
> doesn't have to know about this, but it can be interesting for debugging memory or performance
> issues.

Contents: `engine="streaming"` passed to `.collect()`; batch-wise execution instead of loading
everything at once; automatic fallback to the in-memory engine for operations not (yet) implemented
in a streaming manner; inspecting the physical streaming plan with `show_graph`.

## Pre-release of Polars 2.0

URL: https://pola.rs/posts/announcing-polars-2/
Version: pre-release post, 2 September 2026 (Ritchie Vink)

> The biggest default change will be that all LazyFrame queries now will run on the streaming engine.
> Casual Polars users can therefore expect huge improvements in memory usage and performance. In
> aggregate we expect the streaming engine to be easily 5x faster.

> Calling collect on a LazyFrame will now default to the streaming engine, leading to massive memory
> and performance improvements on most queries for users. The reason this required a major version
> bump is that the streaming engine doesn't guarantee row-order by default for certain operations
> (join, group_by, unpivot, etc.). If you require observable row-order in those operations, you can
> opt in to that by setting maintain_order=True.

> For users who want to keep using the "in-memory" engine as default, they can do so by setting the
> engine affinity.

> There is a lot in flight that we haven't talked publicly enough: proper out-of-core support for the
> streaming engine, a new IO-plugin design, what we think will be the fastest S3 reader out there,
> major SQL coverage improvements, a cost-based planner, join reordering, and the removal of mmap,
> which will make our pipelines fully async end to end.

Contents: streaming as the new default engine for `.collect()` (`engine="auto"` resolves to
streaming); the row-order caveat for joins/group_by/unpivot and the `maintain_order` opt-in;
`pl.Config.set_engine_affinity("in-memory")` to keep the old default; the team's own disclosure that
*proper* out-of-core support for the streaming engine is still in flight, not yet complete, as of
this pre-release post — the honest-gap boundary this topic's out-of-core claim respects.

## GPU Support [Open Beta]

URL: https://docs.pola.rs/user-guide/gpu-support/
Version: current (fetched 2026-10-23)

> Polars provides a GPU-accelerated execution engine for Python users of the Lazy API on NVIDIA GPUs
> using RAPIDS cuDF. This functionality is available in Open Beta and is undergoing rapid development.

> GPU-enabled execution is requested by passing engine="gpu" to .collect or .sink_* calls.

> Both the CPU and GPU engine use the Apache Arrow columnar memory specification, making it possible
> to quickly move data between the CPU and GPU. Additionally, files written by one engine can be read
> by the other engine.

> When using GPU mode, your query won't fail if an operation isn't supported. When you pass
> engine="gpu", the optimized query plan is inspected to see whether it can be executed on the GPU.
> If it can't, it will transparently fall back to the standard Polars engine and run all query
> operations on the CPU.

> The GPU engine currently passes 99.2% of the Polars unit tests with CPU fallback enabled. Without
> CPU fallback, the GPU engine passes 88.8% of the Polars unit tests.

> Based on our benchmarking, you're most likely to observe speedups using the GPU engine when your
> workflow's profile is dominated by grouped aggregations and joins.

Contents: system requirements (NVIDIA Volta+ GPU, CUDA 12/13); `engine="gpu"` on `.collect()`;
RAPIDS cuDF as the physical execution backend; Arrow as the shared format enabling cheap CPU↔GPU
data movement and cross-engine file compatibility; transparent CPU fallback on unsupported
operations (no hard failure); measured test-pass rates and the workload profile (grouped
aggregations, joins) where GPU speedups are most likely. All GPU-engine claims in this topic are
sourced only from this page — this sandbox has no NVIDIA GPU to run `engine="gpu"` directly.
