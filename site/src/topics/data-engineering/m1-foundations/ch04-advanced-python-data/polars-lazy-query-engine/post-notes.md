<section data-section="outcomes">

## Outcomes

The lazy API genuinely defers execution: a query built from `pl.scan_csv` is still a `LazyFrame`
right up until `.collect()` is called, and the rows it eventually returns match an equivalent
eager call chain exactly — measured directly. A lazy plan keeps two forms, as written and as
run; printed directly from a real query, predicate pushdown folds a filter into the scan step
and projection pushdown narrows the scan to only the columns the rest of the query actually
needs. Common subexpression elimination caches one repeated expression used by two different
output columns and computes it exactly once, visible as a single shared node in the printed
plan. Since Polars 2.0, `collect()` with no arguments defaults to the streaming engine, and that
engine's own contract doesn't guarantee row order for operations like joins, group-bys and
unpivots — measured directly across thirty repeated runs of the identical join, which returned
several different row orders with the default engine and exactly one (the original) with
`maintain_order` set. The same streaming engine measurably lowers peak memory for a real
projection-only workload on this sandbox today, while the team that builds it says, in their own
words, that full out-of-core support is still being finished rather than complete. The
cuDF-backed GPU engine is covered honestly as sourced-only throughout, since this sandbox has no
NVIDIA GPU to run it on directly.

</section>

<section data-section="lab">

## Lab

No lab of its own (per `CHAPTER.md`). Every number is a real measurement on this sandbox's own
Polars 2.0.0 (`examples.py`): eager vs. lazy producing identical rows on a synthetic feed;
`explain(optimized=False)` vs. `explain()` on a real scan, showing the filter folded into the
scan and the column count narrowed; a repeated expression's `explain()` output showing one
cached node reused by two output columns, both still numerically correct; the identical join run
thirty times under the default engine and thirty times with `maintain_order` set, each run's row
order recorded; and the peak resident-set size of an eager full read versus a streaming
projection-only scan, each measured in its own fresh subprocess to avoid one run's retained
memory from skewing the next.

</section>

<section data-section="production">

## Production failures this topic warns about

**A nightly job that joins or groups two LazyFrames and writes the result to something read
back by row position** (a report, a positional index, a zipped-together column from a separate
run). Since Polars 2.0, that row order is not guaranteed between runs, and a pipeline built
before the default engine changed can silently start returning a different, wrong answer
without ever raising an error. The fix is naming `maintain_order` on the operation that needs it,
or sorting the result explicitly before anything downstream reads it positionally.

**Assuming "out-of-core" means every operation can already spill past memory.** This topic
measured a real, lower peak-memory result for a streaming projection today, but the team that
builds the streaming engine discloses, in their own words, that full out-of-core support is
still in flight — treating today's batching as the finished story risks a pipeline that still
runs out of memory on an operation that hasn't been made to spill yet.

</section>

<section data-section="frontier">

## Frontier

Polars' own 2.0 pre-release post names several changes still in progress, not yet shipped as of
that post: a cost-based planner, join reordering, a new IO-plugin design, what the team expects
to be the fastest available S3 reader, and the removal of `mmap` to make their pipelines fully
async end to end — disclosed here as the team's own roadmap, never as something this topic
measured.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Arrow, pandas and Polars have all stayed in-process so far. The next topic is where a pipeline
actually leaves the process: a real connection to a database, and the pool that decides how many
of those a service is allowed to hold open at once.

</section>
