# Fact-check: de.stateful-operators-output-modes

## Claims table

| Claim | Basis | Check |
|---|---|---|
| Complete output mode on a stream-stream join is rejected at query-start time with a real `AnalysisException` naming the mode | Measured (`examples.py`) | `python3 examples.py` assertions, passing |
| The same join with no watermark on either side is accepted, and its buffered join state grows across the whole run (never plateauing) | Measured | same |
| The same join, given a watermark on both sides plus a time-range join condition, has its buffered state plateau in the run's second half | Measured | same |
| As of Spark 2.4, joins can be used only when the query is in Append output mode | Sourced, Spark streaming docs | `sources.mjs check`, word for word |
| Each join side buffers past input rows as streaming state, as a multi-map from join key to past rows | Sourced, `StreamingSymmetricHashJoinExec.scala` | same |
| A watermark on the join keys or input data is used to determine which buffered rows can no longer match and can be discarded | Sourced, `StreamingSymmetricHashJoinExec.scala` | same |

## Red team

- **Could the "complete mode rejected" claim just be an artifact of using the memory sink,
  rather than a real property of complete mode on joins?** No -- the docs' own compatibility
  matrix states joins support only Append, independent of sink, and the probe's own
  `AnalysisException` is raised by query analysis before any sink-specific code runs; swapping
  the sink wouldn't change which output modes the query itself is permitted to declare.
- **Is "state keeps growing" with no watermark just an artifact of the probe's own short run
  time, before growth would naturally slow down?** The probe compares the first half of the run
  against the second half specifically to rule this out -- state in the measured run is still
  climbing well past its own first-half midpoint, not merely still climbing briefly after
  startup before leveling off.
- **Does the plateau in the watermarked probe actually prove eviction is happening, or could it
  just mean no new state is being added?** New rows are still arriving throughout the run (the
  rate source never stops), so a flat state count under continued input specifically means old
  state is being dropped to offset new state being added -- a true plateau, not merely a pause
  in growth.
- **Is the claim about `dropDuplicatesWithinWatermark` measured, or only sourced?** Only sourced.
  This topic's own `examples.py` measures output-mode rejection and join-state growth/plateau
  directly; deduplication semantics are named and quoted from the docs rather than independently
  reproduced, since the watermark-bounds-state mechanism itself was already measured in detail
  in the previous topic.

## Abandoned approaches

An early version of the state-growth probe used the memory sink for all three scenarios, which
made the unbounded-growth run (left running for over a minute to get enough batches) slow and
collected unbounded output into the driver's own memory -- switched to the `noop` sink for the
two state-growth probes (claims 2 and 3), which still exposes `recentProgress` and its
`stateOperators` metrics without materializing any actual output rows, keeping the probe both
faster and safe to run unattended.
