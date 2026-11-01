# Outline: de.pipelined-mpp-staged-batch

1. **Hook.** Twenty-nine topics taught this chapter's one model: cut the job at every shuffle,
   materialise each stage's output, recover by resubmitting a stage. This closing topic steps
   outside that model to name what it chose not to be.
2. **Reveal: Spark's model trades latency for recoverability, by writing every stage's output
   to disk before the next stage starts.** A pipelined engine instead keeps data moving
   in-memory, exchange to exchange, with nothing written in between. [from]
3. **Predict: the same per-row computation, done in large vectorised batches vs one row at a
   time. Which is faster, per row?** [idx2]
4. **Reveal: the batched version is measurably faster, by a wide margin.** Materialising a
   batch is what makes vectorising it possible in the first place.
5. **Elaborate: that speed is exactly what a pipelined, row-at-a-time exchange gives up.**
   Trino's default execution has no stage boundary to retry from -- by default, one failed task
   fails the whole query. [takeaway1]
6. **Predict: a streaming, row-at-a-time pipeline vs one that materialises the whole
   intermediate result. Whose memory footprint grows with the row count?** [idx5]
7. **Reveal: the materialising pipeline's memory grows with the row count; the streaming one
   stays flat, measured directly.** Ray Data's own executor streams block by block through an
   out queue, never holding a whole dataset in memory just to pass it to the next operator.
8. **Elaborate: Trino's fault-tolerant execution is the convergence point.** Its TASK retry
   policy spools exchange data to storage on purpose, buying Spark's own recoverability back
   for a model that otherwise has none. [takeaway2]
9. **Reveal: three real models, three different trades.** Spark materialises for
   recoverability; a pipelined exchange moves fast but risks the whole query on one failure;
   Ray Data streams per operator, bounding memory without ever batching at Spark's scale.
10. **Recap.** [takeaway3]
