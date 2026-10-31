# OUTLINE: Lambda vs Kappa for one pipeline (`de.lambda-vs-kappa-one`)

## Learning outcomes
1. Build both designs for the revenue-by-product pipeline with SLOs, estimates, failure tables
   and costs.
2. Compute the reprocessing-cost crossover from log retention and reprocessing frequency.
3. Run the two paths on one stream and measure the dual-logic discrepancy from a planted
   edge-case difference.
4. State the conditions under which a batch correction layer earns its place, as computable
   thresholds, and produce an ADR choosing one.

## Engagement arc
- Hook: step 1 (the shop's two-year-old Lambda pipeline disagreed by a fraction of a percent on
  one product for days, and nobody could say which number was right, because the batch job
  treated post-midnight refunds differently).
- Predict: step 2, within the first four steps (the conditions under which the batch layer
  should stay, from the shop's late-data tail and reprocessing volume).
- Takeaways: step 4 (Kappa's reprocessing cost and Lambda's are each a computed number, not a
  default choice), step 6 (two code paths that must agree will drift, and a unified engine
  reduces that drift without removing the second path), step 8 (a batch layer earns its place
  by a threshold, not by habit).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** two pipelines computing "revenue by product" disagree by a small fraction on one
  product for several days; the batch job turns out to treat post-midnight refunds differently
  from the streaming job.
- **On screen:** two numbers for the same metric, disagreeing, and nobody sure which is right.

### 2. Predict
- **fig:** a colleague proposes ripping the batch layer out entirely. When is that right, and
  when does it make the next restatement impossible?
- **Options:** (a) always right, since one code path can never drift from itself and is
  therefore strictly simpler [wrong — a pure streaming replay still has a real reprocessing cost
  and a real limit on how far back the retained log reaches]; (b) right exactly when the shop's
  own late-data tail and reprocessing volume fall under computable thresholds, and wrong once a
  restatement needs data the log no longer retains [correct].

### 3. Reveal — the same pipeline, two designs
- **fig:** design A (Kappa) as one streaming program over a retained log, replay as its only
  reprocessing path; design B (Lambda) as a streaming speed layer plus a batch layer, merged at
  serve time — each drawn as a pipeline strip with its own estimate, failure table, and cost.
- **Moves:** the two strips lay out stacked, each gaining its own cost bars.

### 4. Reveal — the reprocessing-cost crossover
- **fig:** Kappa's cost to recompute a year (replaying the retained log through the streaming
  engine) against Lambda's cost (re-running the cheap batch layer over the lake), crossing at a
  retention length and reprocessing frequency computed from the shop's own numbers.
- **takeaway:** "Kappa's reprocessing cost and Lambda's are each a computed number, not a default choice made out of habit."

### 5. Reveal — dual-logic drift, measured
- **fig:** the same synthetic stream run through both paths with one deliberately diverged
  edge-case rule (the post-midnight-refund treatment); the two results plotted diverging exactly
  at that planted case.
- **Narrator's line of thought:** she treats the discrepancy as something to measure on a real
  run, not something to merely warn about in the abstract.

### 6. Reveal — a unified engine reduces drift, doesn't remove it
- **fig:** one program executed in both streaming and batch mode by the same engine, producing
  matching results on bounded input — but still a second mode, still a second path to keep
  correct.
- **takeaway:** "Two code paths that must agree will drift; a unified engine reduces that drift without removing the second path."

### 7. Reveal — when a batch layer still earns its complexity
- **fig:** four named cases lined up against the shop's own numbers: billing-grade counts that
  must absorb very late data, reprocessing too large or slow for streaming replay, a logic
  change needing a join against huge historical dimensions, and a compliance restatement.
- **Narrator's line of thought:** she treats each case as a computable threshold (a late-data
  tail length, a reprocessing volume, an SLO) with its own "what would change our mind," not a
  vague appeal to caution.

### 8. Reveal — the decision, stated as thresholds
- **fig:** a decision card listing the four conditions against the shop's own numbers, each one
  checked or not, settling whether the batch layer stays.
- **takeaway:** "A batch layer earns its place by a threshold computed from the shop's own numbers, not by habit or by caution."

### 9. Recap
- **fig:** the two pipeline strips with their costs, the reprocessing crossover, the measured
  drift, the unified-engine framing, and the four-condition decision card, side by side.

### 10. Prove it
- **fig:** a second pipeline, currently pure Kappa, facing a request to recompute three years of
  history after a logic change that needs a join against a dimension table far larger than the
  retained log's own window.
- **predict options:** (a) extend the log's retention window to cover three years and replay
  through it, since Kappa's reprocessing path is "just" a longer replay [wrong — retention that
  long trades directly against storage cost and streaming throughput limits, and a replay still
  can't join against a dimension the log itself was never built to hold]; (b) check this
  request against the four conditions directly — the huge-historical-dimension join is one of
  them by name [correct].

## Post-notes headings
- **Internals:** none claimed independently — Lambda and Kappa as architectures (Chapter 3
  §3.3) are built on, not re-taught; the engines themselves (Chapters 7 and 9) and the
  correctness mechanisms (topic 6, Chapter 14 topic 13) are each named only as a choice pointing
  to its home chapter; the clickstream design that uses a reconciliation path is topic 12's; the
  choice of shape in general is topic 3's.
- **Lab:** none of its own as a syllabus lab leg; the two-path simulation on a synthetic stream
  with a planted edge-case difference, the reprocessing-cost crossover, and the threshold
  calculations are this topic's executable evidence.
- **Production:** the hook's own two-number-disagreement scenario as the concrete shape
  "dual-logic drift, discovered by a mismatch nobody could explain" takes in practice.
- **Frontier:** none claimed — Lambda, Kappa, and unified batch/stream engines are each
  established practice (Flink ships unified execution), not an emerging technique.
- **Where this goes next:** both designs lived in one region. A platform that must serve two
  continents faces a different set of constraints: where data is allowed to live, what crossing
  a border costs, and what happens to pipelines and catalogs when a region fails. The next
  design is a multi-region analytical platform.

## Concept ledger
- **Introduces:** `lambda-kappa-same-pipeline-comparison`, `dual-logic-drift-measured`,
  `batch-correction-layer-thresholds`.
- **Uses:** the method concepts as in topic 12 (`ask-to-slo-translation`,
  `capacity-estimate-chain`, `littles-law-inflight-sizing`, `data-flow-shape-decision`,
  `layout-from-dominant-access-path`, `engine-choice-by-state-latency-skill`,
  `correction-window-late-data`, `replay-backfill-as-first-class-path`,
  `failure-table-blast-radius`, `cost-waterfall-dominant-lever`, `three-alternatives-with-costs`,
  `ten-x-next-bottleneck`), plus `lambda-architecture` and `kappa-architecture` (Chapter 3),
  `billing-grade-reconciliation-path`, `stream-for-speed-batch-for-record`,
  `deterministic-transform-requirement`, `clickstream-pipeline-design`,
  `medallion-bronze-silver-gold` — all confirmed live via `grep` on `introduces` arrays across
  `registry.ts`.
- **Declared:** none — every named `uses` id resolved live, matching `CHAPTER.md`'s own stated
  `Declared: none`.

## Changes from the chapter plan
`CHAPTER.md` names Chapter 9 §9.1 (retention, compaction, tiered storage) and §9.3 (Flink's
unified batch and stream execution) and Chapter 7 §7.4 (Structured Streaming `availableNow`) as
built-on chapters, alongside Chapter 3's Lambda-and-Kappa ids. Every explicitly listed `uses` id
is confirmed live via `grep` on `introduces` arrays, matching `CHAPTER.md`'s own `Declared:
none` exactly — no placeholder needed this topic, the first since topic 12 with every `uses` id
already live. Chapter 9's and Chapter 7's own named sections are referenced only as the engines
this topic's comparison runs against, per `CHAPTER.md`'s own "Leaves out" line ("the engines
(Chapters 7 and 9)"), not pulled into `uses` as specific ids. No scope cut — this topic still
leaves out Lambda and Kappa as architectures, the engines themselves, the correctness
mechanisms, the clickstream reconciliation design, and the general choice of shape, per
`CHAPTER.md`'s own "Leaves out" line.

## Claims list (for fact-check)
1. Maintaining code that must produce the same result in two complex distributed systems is, in
   Kreps's own stated view, exactly as painful as it sounds, and not a fixable problem. —
   SOURCES.md (Kreps).
2. Kreps's own proposed alternative to Lambda is retaining the full log for as long as
   reprocessing might be needed, and replaying it through a second instance of the same,
   improved code when reprocessing is required. — SOURCES.md (Kreps).
3. Apache Flink documents that a single DataStream program executed over bounded input produces
   the same final result whether run in streaming or batch execution mode. — SOURCES.md (Flink).
4. The reprocessing-cost crossover, the planted-edge-case drift measurement, and the
   four-condition batch-layer decision are this chapter's own established method and this
   topic's own derived design, not an independent citation beyond claims 1–3.
