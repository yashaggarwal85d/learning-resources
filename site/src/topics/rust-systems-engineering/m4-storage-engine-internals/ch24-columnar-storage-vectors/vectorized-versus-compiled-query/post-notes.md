---
title: "Vectorized versus compiled query execution"
---

## Outcomes

- Build a real row-at-a-time filter-then-sum path and a real vectorized, batch-at-a-time path performing the identical operation over the identical columnar data.
- Measure that the vectorized path genuinely cuts the per-row dispatch overhead the naive row-at-a-time path pays.
- Measure that both paths produce the exact identical result on the identical column.
- Measure that the vectorized path's own dispatch count matches the real batch arithmetic exactly.
- State, from Apache DataFusion's and Polars's own documentation, how real vectorized, Arrow-based engines name this batch-at-a-time approach directly.

## Internals

Dispatch count here is measured as a real, deterministic structural property, the number of times each path's own dispatch-counting code actually runs, rather than a wall-clock timing measurement that would be noisy in a sandboxed build. The row-at-a-time path dispatches once per row by construction; the batch-at-a-time path dispatches once per batch, building that batch's own selection vector of matching row offsets before a tight, vectorizable inner loop sums only the selected values, with no further dispatch inside the batch. Both paths' own final sums are checked for exact equality, not approximate closeness, and the batch-at-a-time path's own measured dispatch count is checked against an independently computed expected value, the column's own length divided by the batch size and rounded up.

## In production

Apache DataFusion's own documentation names itself directly, in its own words, as a blazingly fast, vectorized, multithreaded, streaming execution engine, built using the Apache Arrow in-memory format; it attributes its own high performance to leveraging Rust and Arrow's own memory model. Polars's own documentation names the identical batch-at-a-time idea from a different real engine's own words, stating that it can execute a query in batches, instead of processing all the data at once. Both are real, independently maintained, vectorized Arrow engines, exactly the two the syllabus names directly.

## The frontier

This topic measures only the vectorized side of the comparison the syllabus names; the alternative, data-centric code generation (HyPer, VLDB 2011), and Kersten et al.'s own direct comparison of the two approaches (VLDB 2018), are named in prose here rather than separately measured, since building a real compiling query executor is beyond this topic's own scope. All of this topic's own measured claims run entirely on plain in-memory Rust structs and vectors, with no file, network, or root access needed.

## Where this goes next

This topic continues directly from topic 62's own column-major batches, measuring how a query actually works through them. The next topic turns to how much further a single CPU instruction can push that same batch, by working on several of its values at once.
