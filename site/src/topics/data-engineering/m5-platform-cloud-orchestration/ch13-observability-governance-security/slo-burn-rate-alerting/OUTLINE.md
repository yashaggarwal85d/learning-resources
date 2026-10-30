# Outline — de.slo-burn-rate-alerting

**Kind:** full, §13.1. About 15 minutes. Hosts the last leg of the §13.1 chapter lab.

## Scope (full syllabus line, five clauses)

"symptom-based alerts on SLOs, multi-window multi-burn-rate rules, schedule-aware freshness
alerts (no page for an expected gap), deduplication and owner routing, the 'every page must be
actionable' test."

- Clause 1: alert on what the consumer experiences (the SLI itself, e.g. freshness), not on every
  internal cause; the SRE book's own "every page should be actionable" framing of why.
- Clause 2: multi-window multi-burn-rate rules — burn rate as the rate of budget consumption
  relative to the SLO; the documented progression from a fixed threshold through single-window
  burn rate to a long-and-short window pair, and the workbook's own recommended thresholds and
  low-availability caveat.
- Clause 3: schedule-aware freshness alerts — a fixed age threshold pages every night for a
  table that is *supposed* to be old just before its scheduled run; the data-specific fix is to
  measure age against the expected arrival schedule, not an absolute threshold.
- Clause 4: deduplication and owner routing — grouping alerts from one upstream failure into one
  page, routed to the asset's owner (Chapter 11's ownership concept, declared here since Chapter
  11 is unbuilt).
- Clause 5: the "every page must be actionable" test, applied directly to a short list of
  candidate alerts.

## Outcomes

Compute burn rate from an SLO and an observed error rate and the time to exhaustion at that rate;
build a multi-window rule from a long window and a short window and show it firing and then
resetting on a replayed incident; explain why a fixed freshness threshold pages every night and
fix it with a schedule-aware SLI; state, for a given SLO, whether the workbook's recommended
thresholds can fire at all; apply the actionable-page test to a list of alerts.

## Concept ledger

- **Introduces:** `error-budget-burn-rate`, `multi-window-multi-burn-rate-alert`,
  `schedule-aware-freshness-alert`, `actionable-page-test`.
- **Uses:** `pipeline-golden-signals`, `metric-types-counter-gauge-histogram` (topic 1, live in
  this chapter).
- **Declared (gap, logged per CHAPTER.md §"Cross-chapter ids"):** Chapter 11 §11.3 "Data SLIs,
  SLOs and error budgets" and "Data incident response and blast radius" — Chapter 11 is unplanned
  (confirmed: no `ch11` folder under `data-engineering/m5-platform-cloud-orchestration` beyond
  this chapter's own `ch13`, and no `ch11-orchestration-reliability-dataops` topic folder exists
  despite a sibling thread's `CHAPTER.md` having just landed for it — planning only, no topics
  built). `littles-law` is also declared: it is Chapter 1 DSA-linked material per `CHAPTER.md`,
  not resolvable to a single `registry.ts` id without ambiguity, so named in prose only
  (`post-notes.md`) rather than claimed as a resolved `uses` id.

## Storyboard (11 steps)

1. **Hook + Predict.** A nightly table has a freshness SLO of 99% over 30 days. The source goes
   stale for six hours. Does your alert fire in the first five minutes, after the budget is gone,
   or never — and does it also fire at 4 a.m. every night when the table is simply waiting for its
   run? Predict: the simple threshold's behaviour on a six-hour stall against a multi-window
   burn-rate rule.
2. **Reveal: symptom-based, not cause-based.** Alert on what the reader actually experiences — the
   SLI itself — not on every internal cause. The SRE book's own rule: every page must be
   actionable, or it teaches people to ignore the next one.
3. **Reveal: burn rate.** How fast, relative to the SLO, the error budget is actually being spent.
   Burn rate one spends it exactly by the window's own end; faster rates spend it sooner.
4. **Reveal: a fixed threshold's two failures.** A 100% outage and a 0.2% outage both alert after
   the same one hour — no sense of severity — and once it fires, it can keep firing for the rest
   of the window after the problem is already gone.
5. **Reveal: the multi-window fix.** A short window alongside the long one, sized at roughly a
   twelfth of it, so the alert clears soon after the problem does instead of staying lit for the
   rest of the day.
6. **Reveal: the recommended thresholds — and their limit.** Two percent of budget in one hour, five
   percent in six hours, for paging; ten percent in three days for a ticket. Then the honest
   catch: at a low enough availability target, the documented page threshold can never fire at
   all. Takeaway.
7. **Reveal: schedule-aware freshness.** A daily table is *supposed* to look nearly a full day old
   right before its run. A fixed age threshold pages every single night for exactly that reason;
   measuring age against the expected schedule instead doesn't. Takeaway.
8. **Reveal: dedup and owner routing.** One upstream failure can trip signals on every downstream
   asset at once; grouping them into a single page, routed to the one team that owns the failing
   asset, is what keeps a real incident from becoming ten pages for one problem.
9. **Reveal: the actionable-page test, applied.** A short list of candidate alerts, each checked
   against one question: can a human act on this right now? What fails the test becomes a ticket,
   or nothing. Takeaway.
10. **Recap.** Alert on the symptom; a short window next to a long one; a schedule, not a fixed
    age; one page per real incident; and nothing pages unless someone can act on it.
11. **Prove it.** A nightly freshness SLO alert fires correctly for a six-hour outage. The next
    morning, the same alert fires again at the table's normal, expected overnight gap. What's
    actually wrong with the alert, and which single change from this topic fixes it?

Engagement arc: hook + predict on step 1 (within the first four steps); mechanism built through
contrast (steps 2-5); the surprising limit at step 6 (a threshold that can mathematically never
fire); the data-specific twist at step 7; takeaways at steps 6, 7, 9 (all at or after the reel's
own midpoint of step 6); recap at step 10; Prove it at step 11 (applies the schedule-aware fix to
a fresh case, closing the loop the hook opened).

## Examples to execute

`examples.py`, synthetic (reuses the shop's `orders-rollup` → `analytics.daily_revenue` freshness
series from topic 1, replayed here as an alerting problem, not a metrics-collection one):

1. `burn_rate_and_time_to_exhaustion`: given an SLO and an observed constant error rate, compute
   the burn rate and the time to exhaust the budget at that rate; assert burn rate 1 exhausts
   exactly at the SLO's own window length, and burn rate 14.4 exhausts in 1/14.4 of it.
2. `fixed_threshold_poor_reset_time`: replay a one-hour 100% outage against a fixed 30-day-window
   threshold rule; assert the alert fires and then keeps firing for the rest of the 30-day window
   after the outage ends, measuring the exact reset time in hours.
3. `multiwindow_fires_and_resets_fast`: replay the same outage against a long+short window rule
   (short window at 1/12 the long window, per the workbook's own guideline); assert the alert
   fires within minutes and clears within the short window's own duration after recovery, not the
   full 30 days.
4. `low_availability_threshold_never_fires`: for a 90% SLO, compute whether the documented
   2%-in-one-hour page threshold can be crossed by even a complete (100%) one-hour outage; assert
   it cannot, reproducing the workbook's own 1.4%-of-budget figure.
5. `fixed_vs_schedule_aware_freshness_false_alarms`: replay 30 nights of the shop's own freshness
   curve (topic 1's `examples.py` data) with a nightly scheduled run; assert a fixed-threshold
   freshness alert fires every night at the expected pre-run gap (false alarms), while a
   schedule-aware version (age measured against the next expected arrival) fires 0 times on
   healthy nights and still fires on the one genuinely stale night.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 2's handoff verbatim): "Now there is telemetry
  worth reading. A dashboard that nobody watches changes nothing; an alert that fires on every
  blip teaches people to ignore it. This topic is the rule that decides when a symptom is worth
  waking someone: SLO burn-rate alerting."
- **Handoff** (to topic 4, verbatim): "Observability tells you the platform is healthy. It says
  nothing about what the platform holds. Before anything can be protected, masked or deleted,
  someone has to know which columns are personal data. That is classification, and it is where
  the governance half of this chapter starts."

## Claims list

1. Burn rate is how fast, relative to the SLO, the service consumes the error budget; burn rate 1
   exhausts it exactly at the window's end. — Google SRE Workbook.
2. A fixed-duration threshold gives the same detection time to a 100% outage and a 0.2% outage,
   and a 100% outage consumes 140% of a 30-day budget in one hour. — Google SRE Workbook.
3. A good guideline is a short window at 1/12 the long window's duration. — Google SRE Workbook.
4. Recommended starting thresholds: 2% of budget in one hour and 5% in six hours for paging, 10%
   in three days for a ticket. — Google SRE Workbook.
5. At a 90% availability target, a complete one-hour outage consumes only 1.4% of the budget, so
   the 2%-in-one-hour page threshold can never fire. — Google SRE Workbook.
6. "Every page should be actionable." — Google SRE Book.
7. Unfocused SLO-threshold alerting can fire voluminously and still miss real problems, consuming
   unacceptable triage time. — Google SRE Book.
8. The `examples.py` measured experiments (1-5 above), executed and asserted. — `FACT-CHECK.md`.

## Changes from the chapter plan

One gap, logged rather than guessed: `CHAPTER.md` cites Chapter 11 §11.3 ("Data SLIs, SLOs and
error budgets" and "Data incident response and blast radius") as `uses` sources for this topic
(on-call design, asset-level ownership, dedup via the lineage graph). Chapter 11 is unbuilt
(confirmed: only a `CHAPTER.md` plan exists under
`m5-platform-cloud-orchestration/ch11-orchestration-reliability-dataops`, no topic folders), so
`declared`, not `uses`; this topic's step 8 (dedup/owner routing) draws the dependency graph by
hand on the shop's own pipeline strip, exactly as topic 3's entry in `CHAPTER.md` itself already
anticipates ("the dedup example in this topic is drawn on the shop's pipeline strip without
invoking OpenLineage").
