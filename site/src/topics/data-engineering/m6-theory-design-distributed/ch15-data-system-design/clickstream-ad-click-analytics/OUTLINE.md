# OUTLINE: Clickstream and ad-click analytics at billions/day (`de.clickstream-ad-click-analytics`)

## Learning outcomes
1. Produce a design for clickstream and ad-click analytics from the shop's constants with an
   SLO set, an estimate sheet, three alternatives per major hop, an ADR for the
   streaming-plus-reconciliation decision, a failure table, and the dominant cost lever.
2. Explain why a billed count needs a batch reconciliation and what the streaming count may be
   used for.
3. State the next bottleneck at ten times the load.
4. Identify what the design leaves to Chapters 7-9.

## Engagement arc
- Hook: step 1 (an ad partner paid per click; the streaming dashboard and finance's reconciled
  batch disagree by 1.7 percent; neither pipeline has a bug; the invoice goes out on the larger).
- Predict: step 2, within the first four steps (the source of the gap, among late events,
  duplicates and bot filtering, and which side is right).
- Takeaways: step 4 (a session is a gap, not a clock), step 6 (the stream is for speed, the
  reconciled batch is the number of record), step 8 (running two paths costs something, and the
  cost is drift, not just compute).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** the ad partner is paid per click; the streaming dashboard says one count for
  yesterday, finance's reconciled batch says a larger count, the gap near two percent; the
  invoice goes out on the larger number. Neither pipeline has a bug.
- **On screen:** two correct counts, one gap, one number used for billing.

### 2. Predict
- **fig:** which of three candidates causes the gap — late events, duplicates, or bot
  filtering — and which side is actually right?
- **Options:** (a) duplicates inflate the streaming count, so the smaller batch number is right
  [wrong — duplicates would make the stream count *too high*, not too low, and the stream count
  here is the smaller one]; (b) events that arrive after the stream's correction window closes
  land in the log but never reach the stream's result, so the batch recount is larger and right
  [correct].

### 3. Reveal — the pipeline strip and its alternatives
- **fig:** client SDK → collector → log → lake → warehouse → dashboards, with a decision card
  at each hop (a managed collector versus self-run, the log's partition key, the lake's table
  format).
- **Moves:** the strip draws left to right, a card flipping open at each hop.

### 4. Reveal — a session is a gap, not a clock
- **fig:** a run of click events grouped into one session by an inactivity gap, not by a fixed
  time boundary; a bot-traffic classifier flagging one run red, with a stated false-positive
  cost.
- **takeaway:** "A session is defined by a gap in activity, not by a fixed clock window."

### 5. Reveal — the correction window and the late-event sliver
- **fig:** the correctness boundary drawn as a dashed line after the log; a red dot (a late
  event) landing in the log after the stream's window has already closed and fired its result.
- **Narrator's line of thought:** she treats "dropped by default, kept only if lateness is
  explicitly allowed" as the mechanical fact the whole billing gap traces back to.

### 6. Reveal — the stream is for speed, the batch is for record
- **fig:** the streaming path's idempotent upserts (keyed by a deterministic id) on one side, the
  batch reconciliation recomputing from the immutable log on the other, overriding the streaming
  figure in the billed column.
- **takeaway:** "The stream is for speed; the reconciled batch is the number of record."

### 7. Reveal — two paths cost something: dual-logic drift
- **fig:** the same transformation written twice — once in the stream engine, once in the batch
  engine — with a drift gap opening between them whenever only one copy gets updated.
- **Narrator's line of thought:** she treats "the problem isn't fixable, only budgeted for" as
  the honest cost this design has to carry, not a bug to eventually eliminate.

### 8. Reveal — the estimate, the cost lever, and the failure table
- **fig:** the estimate sheet (events per second at peak, bytes per day, storage per year with
  replication, consumer count by Little's law) alongside the dominant cost lever (the lake scan
  volume, or the log's cross-AZ replication traffic) and the failure table (collector down, a
  poison event, a duplicate burst after a retry storm, a region loss).
- **takeaway:** none (reveal only; the estimate and failure table are the lab's own executable
  evidence, not a single stated rule).

### 9. Recap
- **fig:** the pipeline strip, the session-gap and bot-filter reveal, the late-event sliver, the
  stream-versus-batch override, the drift cost, and the estimate-plus-failure-table side by
  side.

### 10. Prove it
- **fig:** a second billing dispute at a different ad partner; the same three candidates (late
  events, duplicates, bot filtering), a different cause this time.
- **predict options:** (a) assume the cause is the same as before (late events), since that's
  the design's known failure mode [wrong — the failure mode has to be diagnosed each time, not
  assumed from the last incident; this time a retry storm produced a duplicate burst the
  stream's idempotent keying absorbed but the batch recount, run before the dedup window closed,
  briefly double-counted]; (b) check which of the three actually explains this specific gap,
  since the same symptom can have a different cause [correct].

## Post-notes headings
- **Internals:** none claimed independently — the method steps (topics 1-9) are used only as
  the design's own sections, already taught; Kafka, Flink, Spark streaming, sessionisation SQL,
  bot-detection models and the table format are each named only as a choice with a pointer to
  its home chapter, not re-derived here.
- **Lab:** none of its own as a syllabus lab leg; the late-event simulation (the share of events
  past the correction window, and the gap it produces between the stream and the reconciled
  count) and the estimate sheet are this topic's executable evidence.
- **Production:** the hook's own ad-partner billing dispute as the concrete shape "two correct
  pipelines can still disagree" takes in practice.
- **Frontier:** none claimed — streaming-plus-batch reconciliation is established practice
  (Kreps, 2014), not an emerging technique; the Lambda-versus-Kappa debate as such is left to
  topic 17.
- **Where this goes next:** clicks are an append-only stream with no natural dimensions. Orders
  are different: mutable business entities that must be modelled, loaded incrementally and
  joined to customers and products. The next design is the warehouse that holds them.

## Concept ledger
- **Introduces:** `clickstream-pipeline-design`, `stream-for-speed-batch-for-record`,
  `billing-grade-reconciliation-path`.
- **Uses:** `ask-to-slo-translation`, `capacity-estimate-chain`, `littles-law-inflight-sizing`,
  `data-flow-shape-decision`, `layout-from-dominant-access-path`,
  `engine-choice-by-state-latency-skill`, `correction-window-late-data`,
  `replay-backfill-as-first-class-path`, `failure-table-blast-radius`,
  `cost-waterfall-dominant-lever`, `three-alternatives-with-costs`, `ten-x-next-bottleneck`,
  `row-number-difference-islands`, `running-sum-session-id`, `event-stream-compression`.
- **Declared:** `at-least-once-plus-idempotence`, `atomic-offset-output-commit`,
  `kafka-isr-non-majority-quorum` (Chapter 14, not yet planned or built), `queues-vs-logs`,
  `hyperloglog-distinct-counting` (named by `CHAPTER.md` as "Chapter 5," not yet live under that
  name anywhere in `registry.ts`), plus `kafka-flink-streaming-fundamentals` (Chapter 9
  §9.1-§9.3), `event-serialization-format-choice` (Chapter 7 §7.4), and
  `iceberg-delta-table-format-tradeoffs` (Chapter 6 §6.3) as placeholder ids for the chapters
  `CHAPTER.md` says to "build on" but which are themselves entirely unplanned in `registry.ts`.

## Changes from the chapter plan
`CHAPTER.md` states `Declared: none`, but five explicitly named `uses` ids
(`at-least-once-plus-idempotence`, `atomic-offset-output-commit`, `kafka-isr-non-majority-quorum`,
`queues-vs-logs`, `hyperloglog-distinct-counting`) are confirmed NOT live via `grep` on
`introduces` arrays across all of `registry.ts` — Chapter 14 (data engineering) doesn't exist
yet, and the two ids `CHAPTER.md` labels "Chapter 5" aren't introduced anywhere under that name.
Chapters 6, 7, and 9 (data engineering), which `CHAPTER.md` separately asks this topic to "build
on" and resolve ids from, are themselves entirely unplanned (no topics in `registry.ts` at all),
so three placeholder ids stand in for that material, logged here for whoever plans those
chapters later. No scope cut — this topic still leaves out the named mechanisms (each a choice
pointing to its home chapter), the method steps themselves, the Lambda-versus-Kappa debate, and
advertising attribution/fraud detection, per `CHAPTER.md`'s own "Leaves out" line.

## Claims list (for fact-check)
1. A session window closes on a gap of inactivity, not a fixed clock boundary. — SOURCES.md
   (Flink).
2. A late event is dropped once the watermark has passed the window's end, unless the design
   states an explicit allowed lateness. — SOURCES.md (Flink).
3. Running the same transformation twice, in a stream engine and a batch engine, carries a real,
   unfixable maintenance cost. — SOURCES.md (Kreps).
4. A streaming path's weaker guarantee is a property of today's tooling, not a law of streaming
   itself. — SOURCES.md (Kreps).
5. The clickstream pipeline strip, the three-alternative decision cards at each hop, and the
   stream-for-speed/batch-for-record rule are this chapter's own established method (per
   `CHAPTER.md`'s own scope line), not an independent citation.
