# Outline: de.stateful-operators-output-modes

1. **Hook.** The watermark bounds how long state waits. This topic is what that state actually
   is -- running totals, buffered rows -- and the three ways Spark will emit it.
2. **Reveal: three output modes, side by side.** Append (new rows only), Update (changed rows
   only), Complete (the whole table, every trigger). [from]
3. **Predict: complete mode, on a stream-stream join. Accepted, or rejected?** [idx2]
4. **Reveal: rejected, before the query even starts.** A real `AnalysisException`, not a runtime
   failure.
5. **Elaborate: why joins only support append.** A join's own output rows can't be revised once
   emitted; complete and update both require revising past output. [takeaway1]
6. **Predict: a stream-stream join with no watermark at all. Accepted, or rejected?** [idx5]
7. **Reveal: accepted -- but the buffered state only grows.** Unsupported combinations are
   rejected; an unbounded buffer is merely allowed.
8. **Elaborate: a join buffers both sides as state.** Without a watermark, neither side's buffer
   ever has a point past which a row is known safe to drop. [takeaway2]
9. **Reveal: add a watermark and a time-range condition, and the buffer stops growing.** Measured
   directly: state size plateaus instead of climbing with every batch.
10. **Recap.** [takeaway3]
