# OUTLINE: Correctness under replay and late data (`de.correctness-under-replay-late`)

## Learning outcomes
1. For one pipeline, list the duplicate, out-of-order and late paths and the design response to
   each.
2. Show a non-deterministic transform producing a different output on replay, and make it
   deterministic.
3. Size a correction window from a stated late-data rate and say what it costs in state and in
   consumer-visible change.
4. Design versioned outputs that let a consumer pin a version and an auditor reconstruct a
   report.

## Engagement arc
- Hook: step 1 (a bug-fix re-run changes last Tuesday's revenue by a fraction of a percent).
- Predict: step 2, within the first four steps (which hidden non-determinism caused it).
- Takeaways: step 4 (deterministic and idempotent together make a re-run trustworthy), step 6
  (a correction window amends a result instead of dropping or corrupting it), step 8 (a versioned
  output lets a consumer pin a version and an auditor reconstruct what was reported, when).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** the nightly job is re-run to fix a bug; last Tuesday's revenue figure changes by a
  small fraction, even though nobody touched the data and the bug fix itself is correct.
- **On screen:** two runs, same input, same fix, two different revenue numbers.

### 2. Predict
- **fig:** which hidden non-determinism did the run actually depend on?
- **Options:** (a) the bug fix itself must have silently changed some upstream data too [wrong —
  the two runs are confirmed to share identical input]; (b) one of wall-clock time, input
  ordering, or an unseeded sample was baked into the pipeline's logic [correct].

### 3. Reveal — deterministic transforms and idempotent writes
- **fig:** a transform whose output depends only on its input (deterministic) paired with a write
  keyed so repetition has no further effect (idempotent) — together, the two properties that make
  a re-run trustworthy.
- **Moves:** two gears locking together, labeled "same input → same output" and "write twice,
  same result."

### 4. Reveal — the pipeline strip, replayed twice
- **fig:** a deterministic, idempotent pipeline replayed lands two identical output bars; a
  pipeline with a hidden `now()` lands a different bar, the diff counted and shown in red.
- **takeaway:** "Deterministic and idempotent together make a re-run trustworthy — either one
  alone isn't enough."

### 5. Reveal — the watermark and late events
- **fig:** a watermark drawn as a moving line asserting "input is complete up to here"; events
  arriving behind it are late, drawn as dots trailing the line.
- **Narrator's line of thought:** she treats the watermark as a heuristic assertion, not a
  guarantee — late events are the expected cost of that heuristic being wrong sometimes.

### 6. Reveal — the correction window amends, doesn't drop or corrupt
- **fig:** a late event either vanishes (dropped, red) or lands inside a correction window and
  amends the published result with a version tag (v1 → v2, white).
- **takeaway:** "A correction window amends a published result instead of dropping it or silently
  corrupting it."

### 7. Reveal — sizing the correction window from the late-data rate
- **fig:** a stated late-data rate (a known fraction of events, from a measured lab number) sets
  how wide the correction window must be, and that width is a real state and consumer-visible-
  change cost, not a free safety margin.
- **Narrator's line of thought:** she prices the window's width in extra held state and in how
  often a consumer sees a published number change under them.

### 8. Reveal — versioned outputs
- **fig:** every published result carries the version of the logic and the data cut-off that
  produced it; a correction appends a new version rather than overwriting, so a consumer can pin a
  version and an auditor can reconstruct what was reported, and when.
- **takeaway:** "A versioned output lets a consumer pin a version and an auditor reconstruct what
  was reported, and when."

### 9. Recap
- **fig:** deterministic plus idempotent for trustworthy replay, the watermark and correction
  window for late data, and versioned outputs tying both together for a consumer and an auditor.

### 10. Prove it
- **fig:** the same pipeline writes to an external system (sends an email receipt) as a side
  effect — does making the pipeline deterministic and idempotent also make that side effect safe
  to replay?
- **predict options:** (a) no — idempotence at the write layer doesn't make an external side
  effect idempotent on its own; the side effect needs its own dedup key or the replay re-sends the
  email [correct]; (b) yes — if the pipeline's own output is deterministic and idempotent,
  anything downstream of it inherits that safety automatically [wrong, tempting because the
  pipeline did the hard work, but an external system outside the pipeline's own write path isn't
  protected by it].

## Post-notes headings
- **Internals:** none claimed independently — watermark generation, windowing and trigger
  mechanics (Chapter 9 §9.2) and Iceberg's own snapshot mechanics (Chapter 6 §6.3) are named but
  not re-derived here.
- **Lab:** this topic's own `examples.py` — a replay-determinism simulation (a hidden `now()`
  producing different output) and a correction-window simulation (a late event missing a window
  without a correction path).
- **Production:** the shop's own hook (a re-run that silently disagrees with itself) as the
  concrete failure mode "untested non-determinism" takes in practice.
- **Frontier:** none claimed — deterministic/idempotent replay design and watermark-based
  lateness handling are established, Dataflow-Model-era (2015) practice, not an emerging
  technique.
- **Where this goes next:** hands off to failure-mode analysis and recovery (topic 7), since a
  pipeline correct under replay and late data can still simply be down.

## Concept ledger
- **Introduces:** `replay-backfill-as-first-class-path`, `deterministic-transform-requirement`,
  `correction-window-late-data`, `versioned-outputs`.
- **Uses:** `correctness-as-specification`, `data-flow-shape-decision`, `system-of-record-vs-
  derived` (this chapter), `merge-statement`, `upsert-atomicity`, `event-stream-compression`
  (Chapter 2), `idempotent-merge-load`, `bounded-reprocessing-window` (Chapter 3).
- **Declared (chapter-plan ids not yet resolvable in `registry.ts` — Chapters 6, 7, 9, 14 not live
  for these):** `at-least-once-plus-idempotence`, `atomic-offset-output-commit`,
  `exactly-once-boundary-external-effects` (Chapter 14), `watermark-trigger-mechanics`,
  `kafka-delivery-semantics` (Chapter 9 §9.2), `event-time-late-data-semantics` (Chapter 7 §7.4),
  `iceberg-snapshot-branch-mechanics` (Chapter 6 §6.3).

## Changes from the chapter plan
Same pattern as topics 1-5: chapter-plan `uses` ids from Chapters 6, 7, 9 and 14 moved to
`declared` since those chapters aren't live in `registry.ts` yet. `merge-statement`,
`upsert-atomicity`, `event-stream-compression`, `idempotent-merge-load` and
`bounded-reprocessing-window` are all confirmed live (Chapter 2 and Chapter 3) and kept in `uses`.
No scope cut — this topic still leaves out watermark/trigger mechanics, Kafka/Flink delivery
recipes, the exactly-once argument, and table-format snapshot mechanics, per `CHAPTER.md`'s own
"Leaves out" line.

## Claims list (for fact-check)
1. The Dataflow Model's own four questions (what, where in event time, when in processing time,
   how refinements relate). — SOURCES.md.
2. Iceberg's own stated basis for snapshots: a maintained change log underlying reader isolation
   and time-travel queries. — SOURCES.md.
3. Iceberg's own stated use case for tagging: retaining historical snapshots for auditing. —
   SOURCES.md.
4. Deterministic-plus-idempotent as the two properties making a re-run trustworthy is this
   chapter's own established reasoning (per `CHAPTER.md`'s own scope line), not an independent
   citation.
