# Review: de.micro-batch-incremental-execution

## Content review

`--only build` failed once: step 1's narration echoed its own description nearly word for word
(67% overlap, QUALITY.md #54, the narrator-teaches rule). Rewrote it to open on what to watch
for ("watch what changes here and nowhere before it") rather than restating the hook's own
caption, after which the full `--skip reels,links` suite (locked, docs, sources, build,
narration) passed clean.

All three claims are genuinely measured against real local Structured Streaming queries on
PySpark 4.0.1:

- **Offset log / commit log** uses the `rate` source writing to `noop`, inspects the
  checkpoint directory's own `offsets/` and `commits/` subdirectories directly, and confirms
  both are plain versioned JSON files (`v1\n{...}`) whose content matches the exact field
  names `MicroBatchExecution.scala` names (`batchWatermarkMs`, `nextBatchWatermarkMs`).
- **Latency floor** forces `trigger(processingTime="0 seconds")` with `rowsPerSecond=1` and
  reads `recentProgress`'s own `durationMs.triggerExecution`, explicitly excluding batch 0
  (JIT/driver warmup inflates it to over a second) and asserting the steady-state average stays
  above a hundred milliseconds -- a real floor, not an artifact of warmup.
- **Trigger-interval spacing** sets a three-second `processingTime` trigger and confirms
  consecutive steady-state batch starts (read from `recentProgress`'s own `timestamp` field,
  not timed externally) land close to three seconds apart, while each batch's own execution
  time stays well under one second -- the engine is shown waiting for the clock, not just for
  the batch to finish.

The trigger-type comparison (fixed interval vs. available-now) is sourced and named only;
`FACT-CHECK.md`'s red team explains why the first three claims already establish the
checkpoint and timing mechanics available-now itself relies on, so a dedicated probe wasn't
worth the added complexity of running a query to completion.

## Looks review

`reel.tsx` has 10 steps with predicts at indices 2 and 5 and 3 takeaways, none on the reel
test's own "from" step and none immediately after a predict. One takeaway initially ran to 22
words and was trimmed to exactly 20. An escaped apostrophe inside a single-quoted predict
label (`there's`) broke the raw-text match on first write -- caught before the build check ran,
switched to double quotes per the chapter's own established convention. The Playwright reel
smoke test passed on the first run at both desktop and phone sizes.
