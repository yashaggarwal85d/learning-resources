# Outline: Vectorized versus compiled query execution (`rust.vectorized-versus-compiled-query`)

Chapter 24, topic 64 (third of four, opens section 24.2). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real row-at-a-time filter-then-sum path and a real vectorized, batch-at-a-time path performing the identical operation over the identical columnar data, building directly on topic 62's own column-major layout.
2. Measure that the vectorized path genuinely cuts the per-row dispatch overhead the naive row-at-a-time path pays, on the identical operation and data.
3. Measure that both paths produce the exact identical result on the identical column.
4. Measure that the vectorized path's own dispatch count matches the real batch arithmetic exactly.
5. State, from Apache DataFusion's and Polars's own documentation, how real vectorized, Arrow-based engines name this batch-at-a-time approach directly.

## Changes from the chapter plan

None. All claims are measured directly against a real row-at-a-time loop and a real batch-at-a-time loop built from plain Rust data structures, operating on the identical column; nothing here needs root access, real file I/O, or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"Run the identical filter-then-sum operation two ways over the identical column: once evaluating one row at a time, once processing a whole batch at a time instead. Does the batch-at-a-time version genuinely cut the number of per-row dispatches the row-at-a-time version pays?"** (predict, hook) — `fig`: one row-at-a-time loop, one batch-at-a-time loop, same column. Options: no, both dispatch the same number of times either way / yes, genuinely, far fewer dispatches in the batch-at-a-time version (correct) / only if the batch size happens to equal the column's own length.
2. **"Measured: far fewer dispatches in the batch-at-a-time version, on the identical operation and data"** — `fig`: the real, measured dispatch counts. NO takeaway (this is the reel's own "from" step for the phone swipe test, per `QUALITY.md` #64; the point — one dispatch per batch, instead of one dispatch per row, is exactly where the cut comes from — is stated directly in the step's own body instead).
3. **"Both paths apply the identical filter and the identical sum to the identical column. Does the batch-at-a-time version still produce the exact identical result as the row-at-a-time version?"** (predict) — `fig`: both paths' own final sums, side by side. Options: no, batching changes which rows get summed / yes, genuinely, the exact identical result (correct) / only if the column happens to contain no values near the threshold.
4. **"Measured: the exact identical result, from both the row-at-a-time path and the batch-at-a-time path"** — `fig`: the real, measured identical sums. Takeaway: "Cutting dispatch overhead by working a batch at a time changes nothing about the real answer, only how expensively the engine gets there."
5. **"Does the batch-at-a-time version's own real dispatch count match exactly what the batch size and the column's own length predict, rather than merely coming out close?"** (predict) — `fig`: the predicted dispatch count, the measured one. Options: no, it comes out close but not exact, due to rounding / yes, genuinely, an exact match (correct) / only when the column's own length divides evenly by the batch size.
6. **"Measured: an exact match between the real, measured dispatch count and the real batch arithmetic"** — `fig`: the real, measured exact match. Takeaway: "The dispatch cut a batch-at-a-time engine buys isn't a rough estimate; it follows directly, and exactly, from the batch size chosen."
7. **"Real vectorized, Arrow-based query engines state this exact batch-at-a-time approach directly, in their own words. Does Apache DataFusion's own documentation name itself a vectorized execution engine directly?"** (predict) — `fig`: DataFusion's own words, shown directly. Options: no, it names itself a row-at-a-time engine instead / yes, genuinely; it names itself vectorized directly (correct) / only for queries that use the Apache Arrow in-memory format.
8. **"Measured, in Apache DataFusion's own words: a blazingly fast, vectorized, multithreaded, streaming execution engine"** — `fig`: DataFusion's own words, shown directly. Takeaway: "A real production query engine names vectorized, batch-at-a-time execution as central to its own speed, not as an incidental detail."
9. **"Polars's own documentation names the identical batch-at-a-time idea from a different real engine's own words: does it state that Polars can execute a query in batches, instead of processing all the data at once?"** — `fig`: Polars's own words on batching, shown directly. NO new predict (continues directly from step seven's own question, to a second real engine's own name for the identical batch-at-a-time approach). NO takeaway (a connecting step restating the real system's own words, not a new kind of claim).
10. **Recap** — processing a batch at a time instead of one row at a time cuts the real per-row dispatch overhead by exactly the batch size chosen, without changing the real result at all, and two real, independent vectorized query engines both name this batch-at-a-time approach directly in their own words.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7 (DataFusion's own stated vectorized identity; step 9 continues from it directly, with no new predict, to Polars's own name for the identical batching idea).
- Surprising fact: step 9 (a second real engine's own documentation naming the identical mechanism independently).
- Takeaways: steps 4, 6, 8 (three — step 2 deliberately has none, being the reel's own "from" step for the phone swipe test; step 9 deliberately has none too, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| DataFusion is a query engine built using the Apache Arrow in-memory format | Apache DataFusion Docs: Introduction (quoted) |
| DataFusion names itself a blazingly fast, vectorized, multithreaded, streaming execution engine | Apache DataFusion Docs: Introduction (quoted) |
| DataFusion's own high performance comes from leveraging Rust and Arrow's own memory model | Apache DataFusion Docs: Introduction (quoted) |
| Polars can execute a query in batches, instead of processing all the data at once | Polars User Guide: Streaming (quoted) |
| the vectorized, batch-at-a-time path genuinely cuts the per-row dispatch overhead the row-at-a-time path pays, on the identical operation and data | `examples/runtime-demo/src/vectorized_vs_compiled_execution_tradeoff.rs` (executed, measured) |
| both paths produce the exact identical result on the identical column and operation | `examples/runtime-demo/src/vectorized_vs_compiled_execution_tradeoff.rs` (executed, measured) |
| the vectorized path's own dispatch count matches the real batch arithmetic exactly | `examples/runtime-demo/src/vectorized_vs_compiled_execution_tradeoff.rs` (executed, measured) |

## Concept ledger

- `introduces`: `vectorized-vs-compiled-execution-tradeoff` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `columnar-layout-locality-tradeoff` (topic 62)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused: "Compression changes how many bytes a column takes up on disk or in memory; it says nothing yet about how a query actually works through those bytes once they're back in hand, one row at a time or a whole batch at once."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Vectorized execution already cuts the per-row overhead a naive loop pays by working through a batch at a time; it says nothing yet about how much further a single CPU instruction can push that same batch, by working on several of its values at once."
