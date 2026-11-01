# Outline: de.event-time-watermarks-late-data

1. **Hook.** Micro-batch says a plan reruns on a schedule. This topic is the bound that keeps
   its state from growing forever.
2. **Reveal: the watermark, computed by hand.** Max event time seen so far, minus the delay --
   and it lags one trigger behind. [from]
3. **Predict: an event arrives late, inside the delay window. Counted, or dropped?** [idx2]
4. **Reveal: counted.** Late, but the window holding it hasn't been evicted yet.
5. **Elaborate: lateness alone isn't the test.** What matters is whether the window's own state
   is still alive. [takeaway1]
6. **Predict: the same lateness, one trigger later, after the watermark has moved past that
   window's own end. Counted this time?** [idx5]
7. **Reveal: dropped.** Never counted, in no window, anywhere in the result.
8. **Elaborate: the watermark bounds state, not just lateness.** A window's state dies exactly
   when the watermark passes its own end -- that's the real clock. [takeaway2]
9. **Reveal: global watermark across multiple inputs** -- the minimum by default, so the
   slowest stream decides; configurable to the maximum, at the cost of dropping its data.
10. **Recap.** [takeaway3]
