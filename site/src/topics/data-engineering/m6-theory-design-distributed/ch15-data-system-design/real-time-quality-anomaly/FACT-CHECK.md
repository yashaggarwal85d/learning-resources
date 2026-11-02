# Fact-check — de.real-time-quality-anomaly

## Claims re-derived against the source

1. **The EWMA is a statistic for monitoring a process that averages the data, giving less and
   less weight to data as it is further removed in time.** SOURCES.md's quote supports this
   directly. Checked step 4's baseline reveal describes the EWMA exactly this way — a running,
   decaying average — not a generic "smoothing" claim.
2. **A Shewhart chart's decision depends solely on the most recent measurement from the
   process.** SOURCES.md's quote supports this directly. Checked step 4 states this as the
   mechanism behind the SPC-rule family's own failure (a fixed control limit assumes a
   stationary process and reacts only to the latest point), matching the source's own wording.
3. **An EWMA's decision depends on an exponentially weighted average of all prior data,
   including the most recent measurement.** SOURCES.md's quote supports this directly. Checked
   step 4 contrasts this directly against claim 2's Shewhart mechanism, not an invented
   distinction.
4. **The EWMA control procedure can be made sensitive to a small or gradual drift, whereas a
   Shewhart control procedure can only react when the last data point is outside a control
   limit.** SOURCES.md's quote supports this directly. Checked step 4's own stated EWMA failure
   (it adapts to a slow drift that is itself the fault) is the same sensitivity this source
   states as the EWMA's own design intent, turned into a failure mode when the drift is the
   fault rather than noise.
5. **Control charts are used to routinely monitor quality.** SOURCES.md's quote supports this
   directly. Checked step 4's SPC-rule family is introduced as exactly this kind of chart, not a
   different mechanism.
6. **Control limits are chosen so that almost all data points fall within them as long as the
   process remains in control.** SOURCES.md's quote supports this directly. Checked step 4's
   stated SPC-rule failure (a fixed control limit assumes stationarity) follows directly from
   this definition — the limits are only valid "as long as the process remains in-control," which
   a genuine shift violates.
7. **A data point outside the control limits means the process is probably out of control.**
   SOURCES.md's quote supports this directly. Checked step 1's hook treats a single out-of-limit
   reading on a normal ramp as exactly this kind of signal, firing correctly by the rule's own
   logic even though the ramp itself was not a fault.
8. **Statistical methods to detect sequences or nonrandom patterns can be applied to the
   interpretation of control charts.** SOURCES.md's quote supports this directly. Checked step
   4's mention of "run rules" alongside fixed control limits traces to this exact mechanism, not
   an invented addition to SPC.
9. **The dashboard-and-detector split, the per-series state sizing, the deduplication and
   grouping design, the alert-precision metric, and the backtest-with-time-split plan are this
   chapter's own established method and this topic's own derived design.** Not an independent
   citation beyond claims 1-8 — `CHAPTER.md`'s own scope line states these as this topic's own
   worked design, not re-derived here.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("the detector's threshold was simply set too tight")
  is a genuine, plausible first instinct — a false alarm often reads as an over-sensitive
  threshold — but it's ruled out directly: a looser threshold on the same baseline either still
  fires on the normal ramp (if the SPC rule itself doesn't know the ramp is normal) or still
  misses the slow drift (if the EWMA keeps adapting into it regardless of where the limit sits).
  The correct option names the real problem: the baseline adapted into a fault it should have
  flagged, and the ramp needed suppression, not a looser number on the same rule.
- **Predict 2 (step 10, "Prove it"):** checked that "the baselines themselves get less accurate"
  is ruled out against claim 1's and claim 3's own mechanism: each series keeps its own
  independent state, computed only from that series' own history, so a higher series count
  doesn't thin out any one series's own data. The correct option (the per-series state's own
  memory footprint and churn-driven cold-start rate) follows from the per-series state-sizing
  design directly — more series means more independent state objects, each full-sized, not
  smaller ones.

## Illustrative numbers (figs for steps 1, 5, 10)

The hook's sigma threshold, the week of repeated false alarms, the slow drift's own duration, the
per-series state size, the churn rate, and the tenfold series-count growth in "Prove it" are
illustrative, stated lab numbers for the storyboard and the simulation in `examples.py`, not
cited real-world figures from any specific manufacturer's quality-monitoring system.

## Outcome

No open findings. Every claim about the EWMA statistic, the Shewhart chart's decision rule, and
control-chart mechanics traces to one of SOURCES.md's eight verbatim quotes across two pages of
the NIST Engineering Statistics Handbook; the dashboard-and-detector split, per-series state
sizing, deduplication-and-grouping design, precision metric, and backtest plan rest on
`CHAPTER.md`'s own stated scope, not an unsourced factual claim; both predicts are checked
against the topic's own cited mechanisms rather than invented reasoning.
