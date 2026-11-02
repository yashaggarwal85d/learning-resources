# Outline — Windowing: tumbling, sliding, session, global

1. **Hook: the same stream, four very different shapes.** Switching the toy aggregator's windows
   from tumbling to a 50%-overlap sliding configuration multiplies its live pane count and memory
   footprint, with no change to the input stream at all; two session windows four minutes apart
   merge into one the instant a record lands three minutes into that gap.
2. **Setup: a window is where a watermark's chunk of time actually lives.** A window is the
   concrete chunk of time (or activity) a group of elements is assigned to; this topic is the four
   real shapes that chunk can take.
3. **Predict: does a sliding window cost the same as a tumbling one?** Same stream, same window
   size — does switching from tumbling to a 50%-overlap sliding window change the state cost at
   all? (predict)
4. **Reveal: tumbling is one copy per element; sliding multiplies it.** Tumbling windows are
   fixed-size and non-overlapping, so each element belongs to exactly one window; sliding windows
   overlap by a step smaller than the size, so each element is duplicated into every window it
   falls inside — measured directly on the same 200-event stream.
5. **Reveal: a session window has no fixed shape, and can merge.** A session window has no fixed
   start or end — it extends as long as a gap of inactivity doesn't close it, and two sessions that
   were separate windows merge into one if a late-arriving record closes the gap between them.
6. **Predict: does a global window ever emit anything on its own?** A global window covers the
   entire stream in one window with no boundary at all — left to the system's default trigger
   (fire when the watermark passes the window's end), does it ever produce output? (predict)
7. **Reveal: a global window is inert without a custom trigger.** With the default trigger, a
   global window never fires, since it has no end for a watermark to pass; it is useless without
   an explicit custom trigger deciding when to emit.
8. **Reveal: every pane eventually has to die.** Each window, for each key, holds its own
   accumulator state (a pane); a pane closes and its state is dropped once the watermark (plus any
   allowed lateness) passes the window's end, and once the source goes idle every remaining pane
   must close too — measured as a live-pane count that reaches zero.
9. **Prove it.** Every number comes from this topic's own real run: the tumbling-vs-sliding
   state-cost multiplier, the session merge, the global window's silence and its custom-trigger
   fires, and the live-pane count dropping to zero.
10. **Recap.** Four window shapes, each with its own notion (or lack of one) of "when does it
    end," state cost that scales with overlap, and pane state that must eventually drop to zero.

Predict steps: 3 and 6 (first one within the first four steps). Takeaways planned on steps 4, 7,
and 8 (≥3, none on the step immediately after a predict step).
