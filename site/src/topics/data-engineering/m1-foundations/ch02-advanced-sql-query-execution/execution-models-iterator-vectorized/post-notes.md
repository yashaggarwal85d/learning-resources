## After this topic you can

- Explain why the Volcano iterator model's per-row function call becomes measurable interpretation overhead, and why vectorizing (processing an array of rows per call) cuts that cost — with a real, verified-identical-answer measurement behind the claim, not just the idea.
- State the real trade-off compiling a query to machine code introduces: less per-row/per-batch overhead than either the iterator or vectorized model, at the cost of compile latency before the first row and of debuggability.
- Read a plan's own row-count reporting (one count for a whole stage vs. one entry per row) as a signal of whether an engine is pulling tuple-at-a-time or working in batches.
- Recognize morsel-driven parallelism's defining property — elastic, run-time dispatch of small chunks of work — as distinct from a plan-time, fixed thread count.

## Into the internals

### Why the vector-size sweet spot exists

The research paper that introduced vectorized execution ran its own experiment varying the vector size directly: a vector of 1 row performed as poorly as a row-at-a-time interpreter, performance improved sharply as the vector grew, and the best measured size was around 1000 rows, with anything from 128 to 8,000 working well — but beyond that range, performance degraded again as the vectors stopped fitting comfortably in CPU cache. This topic could not re-run that specific sweep on this sandbox (no CPU-cache-level profiling tool was available to confirm the cache-overflow mechanism independently), so the sweet spot itself is reported as the paper's own finding, sourced and quoted, not re-derived here.

### What a compiled engine's generated code actually looks like

The compiling research system's own description is specific: compiling doesn't just translate each operator to machine code separately — it blurs operator boundaries entirely, so a scan, a selection and a hash-table build can become one contiguous code fragment that keeps a tuple's values in CPU registers for as long as possible before the next pipeline breaker forces a materialization. This is a stronger claim than "compiling is also fast" — it's a specific reason vectorizing alone can't fully match it: a vectorized operator still has to write its batch's results into an array between every pipeline stage, where a compiled one can skip that round-trip entirely for a whole chain of operators. No compiled query engine (the paper's own system, or a more recent one like Umbra) is installed on this sandbox, so this remains the paper's own architecture, not independently re-measured.

### The nuance PostgreSQL itself complicates

PostgreSQL's executor is a genuine Volcano-style, pull-based plan, confirmed directly on this topic's own `EXPLAIN (ANALYZE, BUFFERS)` output — but PostgreSQL 16 also has its own, narrower JIT: above a cost threshold, it compiles individual *expressions* (like the `a * b` in this topic's own query) to machine code, while leaving the surrounding plan's row-at-a-time pull structure completely unchanged. That's a real form of compilation, just a much smaller-scoped one than HyPer's whole-pipeline compilation. This topic's "iterator baseline" measurement runs with that JIT explicitly turned off, specifically so the number attributed to "the iterator model's own cost" isn't quietly including a different optimization.

## In production

- DuckDB, ClickHouse and Velox are all named in the literature as vectorized engines; this topic measured DuckDB directly and names the other two once, without claiming they behave identically to it.
- A plan that reports one row count for a whole stage, rather than once per row pulled, is a strong signal an engine is working in batches — the same signal this topic's own "Prove it" step tests.
- Morsel-driven scheduling's real-world payoff is elasticity: this topic's own 1→4 thread measurement (about 3.3× on 4 cores) scales with whatever core count the machine actually has, rather than whatever a query planner guessed when the query started.
- When debugging a slow query on a vectorized or compiled engine, the "what's it doing right now" question is structurally harder to answer than on a row-at-a-time iterator — there is no single current row to point to mid-batch, and a stack trace through generated machine code points at generated code, not the SQL that produced it.

## Next

Morsels split the work across the cores of one machine. The same problem — how to split work, and how to move partial results between the pieces doing it — reappears one level up, across machines: exchange operators, repartitioning and the broadcast-vs-shuffle choice, next.
