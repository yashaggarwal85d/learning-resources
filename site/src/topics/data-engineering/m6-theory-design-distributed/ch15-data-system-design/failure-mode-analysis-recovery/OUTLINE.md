# OUTLINE: Failure-mode analysis and recovery (`de.failure-mode-analysis-recovery`)

## Learning outcomes
1. Build a failure table for a five-box pipeline: failure, blast radius, detection, recovery,
   data lost, time to recover.
2. Find a failure in that table with no recovery path, and say what closes the gap.
3. Set an RPO and an RTO per data class, and price what a tighter number costs.
4. Design two degraded modes for the same pipeline and say what each one gives up.
5. State precisely which piece of this belongs to disaster-recovery mechanics (Chapter 11
   §11.3) instead of to this topic.

## Engagement arc
- Hook: step 1 (a poison record crash-loops one partition at 2am forever while the dashboard
  still reads 100% of orders fine).
- Predict: step 2, within the first four steps (what actually recovers the stuck partition, and
  how long the poison record sits undetected).
- Takeaways: step 4 (blast radius is scoped to what shares a failure domain, not to what shares a
  dashboard), step 6 (RPO and RTO are two different numbers and each has its own price), step 8
  (a degraded mode is a designed trade, not an accident of what happened to keep working).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** one partition of an order-processing pipeline crash-loops on a single malformed
  record at 2am; every other partition keeps processing; the service dashboard, averaged across
  all partitions, reads "100% of orders processing fine."
- **On screen:** a five-partition strip, one partition stuck and restarting, the dashboard number
  unmoved.

### 2. Predict
- **fig:** what actually ends the 2am crash loop?
- **Options:** (a) the pipeline eventually catches the bad record itself and skips past it
  [wrong — a crash loop with no dead-letter path repeats the same crash on retry forever]; (b) a
  human notices the one partition's own, narrower metric (not the averaged dashboard) and
  manually quarantines the record [correct].

### 3. Reveal — the failure table's five columns
- **fig:** the five-partition strip turns into a table: failure, blast radius, detection,
  recovery, data lost, time to recover, filled in row by row for the poison-record failure.
- **Moves:** the stuck partition's row fills left to right; the "detection" cell is the averaged
  dashboard (slow, wrong signal) next to the per-partition lag metric (fast, right signal).

### 4. Reveal — blast radius is a failure domain, not a dashboard
- **fig:** the averaged dashboard's blast radius (one partition's crash buried inside "100%
  fine") next to the real blast radius (one partition's worth of orders, delayed by however long
  the crash loop ran).
- **takeaway:** "Blast radius is scoped to what shares a failure domain, not to what shares a
  dashboard."

### 5. Reveal — the recovery cell with nothing in it
- **fig:** the poison-record row's recovery cell stays empty — there is no dead-letter path, so
  the only recovery is a human who happens to notice. Next to it, a second row with a dead-letter
  queue filled in: same failure, a recovery cell that isn't empty.
- **Narrator's line of thought:** she treats an empty recovery cell as the finding itself, not as
  a detail to fill in on faith; a failure table's job is to surface exactly this gap before 2am.

### 6. Reveal — RPO and RTO are two different numbers, each with a price
- **fig:** a data class (say, the order table) gets an RPO bar ("how much data can this class
  lose") and a separate RTO bar ("how long can this class be down"), each tightened independently,
  each with its own cost curve climbing as the bar tightens.
- **takeaway:** "RPO and RTO are two different numbers and each has its own price — tightening one
  doesn't tighten the other for free."

### 7. Reveal — RPO/RTO set per data class, not once for the whole system
- **fig:** three data classes (orders, clickstream, audit log) on the same pipeline, each with a
  different RPO/RTO bar — the audit log's RPO is near zero while the clickstream's is loose.
- **Narrator's line of thought:** she prices a system-wide "zero data loss, instant recovery"
  target against pricing it once per class, and shows the second costs far less for the same
  actual risk.

### 8. Reveal — two degraded modes, two different trades
- **fig:** the same pipeline under overload offered two degraded modes: a dead-letter queue that
  keeps every record but delays the poisoned ones, and a freshness-flag mode that serves stale
  results rather than none. Each mode's "what it gives up" label sits next to it.
- **takeaway:** "A degraded mode is a designed trade, not an accident of what happened to keep
  working."

### 9. Recap
- **fig:** the failure table (failure, blast radius, detection, recovery, data lost, time to
  recover) as the finding tool, RPO/RTO per data class as the priced target, two degraded modes as
  the designed fallback — and disaster-recovery mechanics and game days named as the next
  chapter's own subject, not retaught here.

### 10. Prove it
- **fig:** a second pipeline loses its entire message broker, not just one partition — does the
  same failure table, applied to this new failure, still find the gap?
- **predict options:** (a) no — a broker loss is a different kind of failure and needs its own
  analysis from scratch [wrong — the table's five columns apply to any failure, not just the
  poison-record case]; (b) yes — the same five columns (failure, blast radius, detection,
  recovery, data lost, time to recover) apply; filling them in for "broker loss" surfaces whatever
  gap exists the same way it did for the poison record [correct].

## Post-notes headings
- **Internals:** none claimed independently — disaster-recovery mechanics and game days
  (Chapter 11 §11.3), replication and consensus mechanics that actually set an achievable RPO
  (Chapter 5 §5.3, Chapter 14), and incident response (Chapter 11/13) are named but not re-derived
  here.
- **Lab:** this topic's own `examples.py` — a failure-table simulation (filling the five columns
  for a stated pipeline and failure) and a poison-record simulation (a crash loop with and without
  a dead-letter path).
- **Production:** the 2am poison-record hook as the concrete shape "an averaged dashboard hides a
  real failure" takes in practice.
- **Frontier:** none claimed — failure-mode enumeration, RPO/RTO budgeting and degraded-mode
  design are established practice, not an emerging technique.
- **Where this goes next:** hands off to the cost model and its single dominant lever (topic 8),
  since a design with a recovery plan for every failure still has a price, and one line of it
  usually dominates.

## Concept ledger
- **Introduces:** `failure-table-blast-radius`, `rpo-rto-per-data-class`, `degraded-mode-design`.
- **Uses:** `system-of-record-vs-derived`, `replay-backfill-as-first-class-path` (this chapter),
  `correctness-as-specification` (this chapter), `resilient-client-patterns` (Chapter 4),
  `replication-ack-modes` (Chapter 5).
- **Declared (chapter-plan ids not yet resolvable in `registry.ts` — Chapters 11, 13, 14 not live
  for these):** `blast-radius-scoring`, `stale-propagation-along-lineage` (Chapter 13 topic 14),
  `actionable-page-test` (named in topic 1's own chapter-plan `uses`, but only ever `declared`
  there — not live), `cap-pacelc` (Chapter 5), `two-phase-commit-blocking-in-doubt`,
  `kafka-isr-non-majority-quorum` (Chapter 14), `data-incident-response-blast-radius`,
  `disaster-recovery-lakehouse-mechanics` (Chapter 11 §11.3).

## Changes from the chapter plan
Same pattern as topics 1-6: chapter-plan `uses` ids from Chapters 11, 13 and 14 moved to
`declared` since those chapters aren't live in `registry.ts` yet. `resilient-client-patterns`
(Chapter 4) and `replication-ack-modes` (Chapter 5) are confirmed live via `grep` on `registry.ts`'s
own `introduces` arrays and kept in `uses`. `actionable-page-test` was checked specifically because
it looked live from topic 1's own concept ledger — it appears only inside topic 1's `declared`
array, never in anyone's `introduces`, so it stays `declared` here too. No scope cut — this topic
still leaves out DR mechanics and game days, incident response, replication/consensus mechanics,
and the cost of each recovery option (topic 8's own subject), per `CHAPTER.md`'s own "Leaves out"
line.

## Claims list (for fact-check)
1. A cascading failure grows over time from positive feedback, and server overload is its most
   common cause. — SOURCES.md (Google SRE book).
2. A full request queue converts into added latency, and small queues relative to thread-pool
   size fail fast rather than piling up. — SOURCES.md (Google SRE book).
3. Randomized exponential backoff, not backoff alone, is what a retrying client needs to avoid
   amplifying a backend's overload into its own prolonged failure. — SOURCES.md (Google SRE book).
4. Jitter on top of exponential backoff, not backoff by itself, is what actually spreads
   contending clients' retries into an approximately constant rate. — SOURCES.md (AWS Architecture
   Blog).
5. The failure-table structure (failure, blast radius, detection, recovery, data lost, time to
   recover) and the RPO/RTO-per-data-class framing are this chapter's own established reasoning
   (per `CHAPTER.md`'s own scope line), not an independent citation.
