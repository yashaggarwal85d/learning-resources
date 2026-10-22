## After this topic you can

- Explain why a full refresh's cost is insensitive to how much of the underlying data actually changed, and why incremental maintenance instead tracks the size of the change itself.
- Use `REFRESH MATERIALIZED VIEW CONCURRENTLY` correctly, name its UNIQUE-index requirement precisely, and explain what it buys in exchange — concurrent reads that are never blocked.
- Recognize that an aggregate's own column type can decide whether it maintains incrementally at all, using the floating-point SUM/AVG case as a concrete, checkable example.
- State what a staleness bound like Snowflake's target lag actually promises — a target the engine tries to keep, not a strict guarantee — and why a slow refresh can still exceed it.

## Into the internals

### DBSP and differential dataflow

The trigger-based incremental update this topic measures directly is a narrow, hand-built version of a much more general idea: a formalism for describing how a query's output should change in response to a small change in its input, for arbitrary relational operators, not just a single aggregate a trigger happens to cover. DBSP is one such formalism, and differential dataflow is a closely related one; both aim to let incremental view maintenance be derived automatically from a query's own definition rather than hand-coded per aggregate, the way this topic's own trigger was. Chapter nine returns to this directly.

### Why floating-point sums break incremental maintenance

A running sum maintained incrementally adds and subtracts individual values as rows arrive and depart. Floating-point addition is not exactly associative — the order values get summed in can change the final result by a tiny rounding amount — so an incrementally updated floating-point total can drift from the value a fresh, from-scratch recomputation would produce. A fixed-precision decimal type doesn't have that same rounding behavior, which is exactly why Databricks's own documentation recommends casting a summed or averaged floating-point column to `DECIMAL` specifically to keep incremental refresh eligible.

## In production

- The UNIQUE-index requirement for `REFRESH MATERIALIZED VIEW CONCURRENTLY`, quoted directly from PostgreSQL's own documentation, is a real design constraint: a materialized view meant to support concurrent refreshes needs that index planned in from the start, not added as an afterthought once blocking reads becomes a problem.
- "Even with this option only one REFRESH at a time may run against any one materialized view" (also from PostgreSQL's own documentation) means CONCURRENTLY solves blocked reads, not overlapping refreshes — two refresh attempts against the same view still serialize.
- A materialized view whose warehouse engine keeps falling back to full recompute is a real, checkable thing to debug: Databricks's own tooling (`EXPLAIN CREATE MATERIALIZED VIEW`) can show which part of a query's shape is forcing that fallback, the floating-point aggregate case being one concrete, fixable example.

## Next

This chapter's own next topic after materialized views and incremental maintenance is confirmed via `node scripts/next-topic.mjs de` once this topic is live.
