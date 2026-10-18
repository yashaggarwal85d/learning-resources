---
id: de.user-defined-functions-optimizer-opacity
title: User-defined functions and optimizer opacity
---

<section data-section="outcomes">

## After this topic you can

- Classify a user-defined function as scalar, table-returning, or aggregate, and write PostgreSQL's syntax for each.
- Name the three specific things an un-annotated UDF costs the optimizer — constant-folding/reordering, parallelism, and a believable cost estimate — and quote the exact PostgreSQL defaults responsible.
- Explain PostgreSQL's SQL-function inlining and SQL Server's Froid scalar-UDF-to-relational rewriting as two different answers to the same opacity problem.
- Choose a vectorized, Arrow-batch UDF over a row-at-a-time one, and explain the structural reason the gap is often enormous rather than marginal.

</section>

<section data-section="internals">

## Into the internals

Every topic so far concerned built-in operators the optimizer already understands completely. A user-defined function is, by default, a black box: the planner knows its name, its argument and return types, and nothing else about what happens inside.

### Three kinds of UDF

- **Scalar** — one input row (or none), one output value: `CREATE FUNCTION calc_tax(amount numeric) RETURNS numeric AS $$ ... $$ LANGUAGE sql;`.
- **Table-returning** — one call, many output rows: `RETURNS TABLE(...)` or `RETURNS SETOF sometype`, usable directly in `FROM` (and, per topic 6, laterally when it needs an outer row's value as an argument).
- **Aggregate** — many input rows collapse to one value, via `CREATE AGGREGATE`, with a state-transition function run once per input row and a final function producing the result — the same shape as `SUM`/`COUNT`, just user-defined.

### What "opaque" costs you, exactly

PostgreSQL's `CREATE FUNCTION` lets you declare three separate properties the planner otherwise has to guess, and the guesses are conservative in a way that quietly disables entire classes of optimization:

**Volatility.** "If none of these appear, `VOLATILE` is the default assumption" (PostgreSQL 18 docs, `CREATE FUNCTION`). `VOLATILE` means "the function value can change even within a single table scan, so no optimizations can be made" — no constant-folding of a call with all-constant arguments, no assumption that two calls with the same arguments in the same scan return the same thing. `IMMUTABLE` ("always returns the same result when given the same argument values... any call of the function with all-constant arguments can be immediately replaced with the function value") and `STABLE` ("consistently return[s] the same result for the same argument values" within one scan, but may change across statements) are both strictly more useful to the planner — and both require you to say so, truthfully; mislabeling a function that actually depends on database state as `IMMUTABLE` produces silently wrong answers, not just a missed optimization.

**Parallel safety.** "`PARALLEL UNSAFE` indicates that the function can't be executed in parallel mode; the presence of such a function in an SQL statement forces a serial execution plan. **This is the default.**" (same source). A single call to an un-annotated UDF, anywhere in an otherwise perfectly parallelizable query, silently removes every parallel worker from the whole statement's plan — not a local slowdown at the point of the call, a global one. `PARALLEL SAFE` ("safe to run in parallel mode without restriction, including in parallel worker processes") is the one that actually lets the rest of the plan parallelize; `PARALLEL RESTRICTED` sits in between (runs, but only in the leader process).

**Cost and row estimate.** `COST execution_cost` lets you tell the planner the function's real per-call cost "in units of `cpu_operator_cost`" instead of the built-in default guess, and `ROWS result_rows` does the same for how many rows a set-returning function will emit. Without these, an expensive scalar UDF inside a filter can be scheduled *before* a cheap, highly selective ordinary condition — exactly backwards from what a cost-based filter order should do (topic 20 covers filter/join ordering in full) — because the planner has no idea the UDF is the expensive part.

Put together: an un-annotated UDF is not just "a function the optimizer doesn't understand perfectly." It is a function that forces a serial plan, blocks constant-folding and reordering around it, and is costed as if it were cheap — three independent, compounding penalties from three independent defaults, every one of them chosen to be *safe* rather than *fast* in the absence of your explicit say-so.

### Two ways to make the UDF's body visible again

**PostgreSQL SQL-function inlining.** The planner can take a function's body and splice it directly into the calling query, as if you had written the expression yourself — but only under tight conditions. PostgreSQL's planner source states the mechanism and its limits exactly (`src/backend/optimizer/util/clauses.c`, `inline_function()`): "If the function is a sufficiently simple SQL-language function (just 'SELECT expression'), then we can inline it and avoid the rather high per-call overhead of SQL functions. Furthermore, this can expose opportunities for constant-folding within the function expression." The code's own guard clause spells out what disqualifies a function: it must be `LANGUAGE sql` (not `plpgsql`, not any procedural language), not `SECURITY DEFINER`, not set-returning, not returning a bare `RECORD`, and not recursive. A `plpgsql` function — however trivial its body — never qualifies; it stays opaque no matter how it's annotated. This is a genuine, practical reason to write small helper functions as single-expression `LANGUAGE sql` functions when you want the planner to see straight through them.

**SQL Server's Froid: algebrizing imperative UDFs.** PostgreSQL's inlining only reaches trivial SQL functions. Genuinely imperative scalar UDFs — variable declarations, `IF`/`ELSE` branching, loops, multiple `RETURN`s — are a harder problem, and Microsoft's **Froid** framework addresses it directly: "if the entire body of an imperative UDF can be expressed as a single relational expression R, then any query that invokes this UDF can be transformed into a query with R as a nested sub-query in place of the UDF... we term this semantics-preserving transformation as unnesting or inlining" (Ramachandra et al., "Froid: Optimization of Imperative Programs in a Relational Database," PVLDB 11(4), 2017, presented at VLDB 2018). The mechanism Froid uses to build that single relational expression is the same **`APPLY` operator** topic 6 introduced as SQL Server's name for `LATERAL`: "the Apply operator... was originally designed to model correlated execution of sub-queries algebraically... SQL Server's query optimizer has a suite of transformation rules for sub-query decorrelation, which remove the Apply operator and enable the use of set-oriented relational operations" (same paper). Froid turns an imperative UDF's body into a tree of `APPLY`s, substitutes that tree in place of the UDF call, and then lets the *existing* decorrelation machinery — the same general mechanism topic 6 previewed and topic 17 covers in full — fold the whole thing into the surrounding query. The paper's experiments ran on SQL Server 2017 with Froid added "in about 1.5k lines of code," and the technique shipped as scalar UDF inlining in SQL Server 2019 (database compatibility level 150; Microsoft Learn, "Scalar UDF Inlining"). The paper reports "an improvement of one to three orders of magnitude" in CPU time on UDF-heavy workloads. PostgreSQL has no equivalent for `plpgsql`; this is a genuine capability gap between the two engines, not a configuration difference.

### Row-at-a-time vs vectorized, Arrow-batch UDFs

A different flavor of opacity shows up in distributed engines whose UDFs run in a different process or language than the engine itself — classically, a Python UDF called from Spark's JVM. "These user-defined functions operate one-row-at-a-time, and thus suffer from high serialization and invocation overhead" (Databricks engineering blog, "Introducing Pandas UDF for PySpark," 2017-10-30) — every single row crosses the JVM↔Python boundary, gets deserialized, passed to the Python function, and the result gets serialized back, once per row.

Apache Arrow's columnar, cross-language memory format changes the unit of work: a **vectorized (Pandas) UDF** ships a whole *batch* of rows across that boundary as one Arrow buffer, calls the Python function once per batch with a `pandas.Series`/`DataFrame` argument, and ships the batch of results back in one trip. The measured gap is not subtle: "Pandas UDFs perform much better than row-at-a-time UDFs across the board, ranging from 3x to over 100x" (same source). This is the exact structural argument Chapter 1 made for columnar, batch-at-a-time execution over row-at-a-time interpretation (`vectorized-execution`) — here applied specifically to the boundary-crossing cost of a UDF, which a classic row-at-a-time Python UDF pays on every single row and a batch UDF pays once per batch.

</section>

<section data-section="lab">

## Build, break, measure

### Try it · Watch each default lift, one at a time

1. **The parallel-safety default.** Write a trivial scalar UDF (something like a tax or discount calculation over `orders.amount`) with no annotations and run `EXPLAIN` on a query that applies it over the full `orders` table under a workload large enough to otherwise parallelize. Confirm no `Gather`/parallel workers appear. Add `PARALLEL SAFE`, `IMMUTABLE` and a realistic `COST`, and confirm parallel workers appear in the same query, unchanged otherwise (*measure in build* for the actual worker count and speedup, which depend on your hardware and `max_parallel_workers_per_gather`).
2. **The inlining boundary.** Write the same trivial helper twice: once as `LANGUAGE sql` with a single `SELECT` expression body, once as `LANGUAGE plpgsql` with an equivalent (also trivial) body. Run `EXPLAIN` on a query using each and confirm the `sql`-language version's plan shows no separate function-evaluation node (its guts appear directly in the surrounding plan), while the `plpgsql` version's plan still shows a distinct, opaque function call.
3. **Row-at-a-time vs batch, measured.** If you have access to Spark or DuckDB with Python UDF support, write the identical elementwise transform as a row-at-a-time UDF and as a vectorized/Arrow-batch UDF over a large enough slice of `orders`, and report your own measured ratio (*measure in build* — expect it to land somewhere in the Databricks post's reported three-times-to-over-a-hundred-times range, but don't assume their exact number transfers to your data and hardware).

</section>

<section data-section="production">

## In production — a review checklist

- **Annotate every UDF's volatility truthfully.** Don't leave a function `VOLATILE` by default laziness when it's really `IMMUTABLE`/`STABLE` — and never mark something `IMMUTABLE` that secretly depends on database state; that's a correctness bug, not a missed optimization.
- **Mark `PARALLEL SAFE` whenever it's genuinely true**, and remember the default (`UNSAFE`) silently serializes the *entire* statement, not just the call site.
- **Set `COST` (and `ROWS` for set-returning functions) on anything non-trivial**, so an expensive UDF doesn't get scheduled before a cheap, selective ordinary filter.
- **Prefer `LANGUAGE sql` single-expression functions for small helpers you want the planner to see through**; accept that `plpgsql`, however simple, is permanently opaque in PostgreSQL today.
- **Before accepting "UDFs are just slow" as the final word, check whether your engine has an un-opacifying trick**: Froid-style inlining on SQL Server, Arrow-batch UDFs on Spark/DuckDB, or PostgreSQL's own `LANGUAGE sql` inlining — the fix is often "use the engine's escape hatch," not "rewrite in pure SQL."

</section>
