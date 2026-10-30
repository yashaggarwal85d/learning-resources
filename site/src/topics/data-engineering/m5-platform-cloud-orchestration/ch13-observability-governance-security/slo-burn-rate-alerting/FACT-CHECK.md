# Fact-check — de.slo-burn-rate-alerting

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Burn rate 1 exhausts the budget exactly at the window's end. | Confirmed | `sre-workbook-alerting.txt`, quoted verbatim. |
| 2 | A fixed threshold gives equal detection time to a 100% and a 0.2% outage; the 100% case consumes 140% of a 30-day budget in an hour. | Confirmed | `sre-workbook-alerting.txt`, quoted verbatim. |
| 3 | Short window at 1/12 the long window. | Confirmed | `sre-workbook-alerting.txt`, quoted verbatim. |
| 4 | Recommended thresholds: 2%/1hr and 5%/6hr page, 10%/3day ticket. | Confirmed | `sre-workbook-alerting.txt`, quoted verbatim. |
| 5 | 90% SLO: a 100% outage consumes only 1.4% of budget in an hour, so the 2%/1hr threshold can't fire. | Confirmed | `sre-workbook-alerting.txt`, quoted verbatim — this is the exact figure, not an approximation drafted independently. |
| 6 | "Every page should be actionable." | Confirmed | `sre-book-monitoring.txt`, quoted verbatim. |
| 7 | Unfocused alerting burns triage time and still misses real problems. | Confirmed | `sre-book-monitoring.txt`, quoted verbatim (the real incident the book describes). |
| 8 | `examples.py` measured results. | Pending | Verified once `examples.py` is written and run; updated then. |

## Red team: the predict question (step 1)

"Does the alert fire in the first five minutes, after the budget is gone, or never — and does it
also fire every night at 4 a.m.?" Tempting wrong framings:

- A learner might assume a **fixed threshold** is simply "slower" than a burn-rate rule, rather
  than mathematically unable to distinguish a six-hour stall from an expected nightly gap at all.
  The fact-check confirms both failure modes are real and distinct: claim 2 shows a fixed-duration
  rule gives poor detection/reset time on a real incident; the schedule-aware clause (claim is
  this topic's own synthesis, not a quoted one) shows a *separate* failure — false alarms on
  healthy nights — that burn-rate alone does not fix by itself. The reel's own step 7 keeps these
  two problems visually separate (a sawtooth crossing a fixed line every night, independent of the
  stale-night case) so the learner doesn't conflate them.
- A learner might also assume multi-window alerting alone is "the fix," without separately
  handling the schedule-aware case — the workbook's own multiwindow material (claims 1-4) never
  mentions freshness or schedules at all; the schedule-aware fix is this topic's own addition
  (per `CHAPTER.md`: "this is the data-specific twist on the SRE method"), explicitly not
  something to over-claim as sourced from the workbook.

No counter-example found that breaks the thresholds once both fixes (multi-window and
schedule-awareness) are applied together, which is exactly what step 11's "Prove it" tests.

## Currency check

Both SRE sources and the Prometheus alerting-rules page fetched 2026-10-30, against each
project's current published documentation. The workbook's own worked numbers (14.4x, 6x, 3x burn
rates for a 99.9% SLO) are quoted exactly as published, not recomputed independently, to avoid
introducing a transcription error into a figure the reel reproduces on screen.

## Corrections applied to OUTLINE.md

None required — all seven sourced claims confirmed as drafted. The schedule-aware-freshness
material and the dedup/owner-routing material are both flagged in `OUTLINE.md` as this topic's own
synthesis (per `CHAPTER.md`'s own framing), not claimed against a source that doesn't cover them.
