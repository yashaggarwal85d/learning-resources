# Fact-check: de.event-time-watermarks-late-data

## Claims table

| Claim | Basis | Check |
|---|---|---|
| A hand-computed watermark (running maximum event time minus delay, lagging one trigger) matches Spark's own reported watermark at every batch | Measured (`examples.py`) | `python3 examples.py` assertions, passing |
| A late event is still counted while its window's own state is live | Measured | same |
| The identical lateness, one trigger later and after the watermark passes that window's end, is dropped entirely -- in no window, anywhere | Measured | same |
| The watermark is the maximum observed event time minus a user-specified delay | Sourced, `EventTimeWatermarkExec.scala` | `sources.mjs check`, word for word |
| Once the watermark passes a window, that window's state is cleared and later data for it is ignored | Sourced, Spark streaming docs | same |
| With multiple input streams, the global watermark is the minimum of each stream's own watermark by default, configurable to the maximum | Sourced, Spark streaming docs | same |
| A child node emitting rows older than the global watermark fails the query with an execution error | Sourced, `EventTimeWatermarkExec.scala` | same |

## Red team

- **Could the "cat" event just have been counted because the query hadn't advanced far enough
  to drop anything yet, rather than because its window specifically was still live?** No -- the
  very next probe sends the identical lateness again, after one more trigger has pushed the
  watermark past that window's own end, and that one is dropped. Both events carry the same
  offset from the newest-seen timestamp; only the watermark's own position relative to the
  window's end differs between them.
- **Is the one-trigger lag just an artifact of this probe's own `time.sleep` pacing, rather than
  a real property of how Spark computes the watermark?** No -- the lag is confirmed by matching
  every batch's own reported watermark (read from `recentProgress`, stamped by Spark itself)
  against a running maximum computed from the *previous* batch's own maximum, not the current
  one; if the watermark used the current batch's maximum instead, the hand-computed value would
  mismatch Spark's reported one at every batch, which it does not.
- **Does the claim about window-end eviction, rather than raw event-time comparison, actually
  need its own probe, or does the docs' own illustration already establish it?** The docs'
  illustration shows a single late event being dropped after the window closes, but doesn't
  show the same lateness surviving one trigger earlier -- without that second data point, a
  reader could still conclude (wrongly) that the test is simply "is the event older than the
  current watermark." The two-probe design here specifically rules that reading out.
- **Is the multiple-watermark-policy claim (min by default, configurable to max) measured, or
  only sourced?** Only sourced. This topic's own `examples.py` uses a single input stream, so
  the global-watermark-across-multiple-inputs mechanism is never exercised live; the claim is
  named and quoted from the docs rather than independently reproduced.

## Abandoned approaches

An early probe assumed any event with its own event time older than the currently reported
watermark would be dropped, and sent a `zebra` event at `12:02` once the watermark had already
reached `12:04` expecting it to be rejected -- it was not; Spark counted it, because its window
(`11:55`-`12:05`) hadn't yet been evicted. Re-reading `EventTimeWatermarkExec.scala` and the
docs' own windowed-state illustration together clarified the real rule: eviction keys off the
window's own end against the watermark, not the raw event timestamp against the watermark. The
probe was redesigned to advance the watermark far enough (`12:10`, past the zebra window's own
end at `12:05`) before sending the equally-late event a second time, which did produce a clean,
reproducible drop.
