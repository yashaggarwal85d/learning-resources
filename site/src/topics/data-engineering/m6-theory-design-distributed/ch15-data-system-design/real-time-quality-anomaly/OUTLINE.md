# OUTLINE: Real-time quality and anomaly monitoring (`de.real-time-quality-anomaly`)

## Learning outcomes
1. Design a line-quality dashboard and a streaming anomaly detector as two consumers of topic
   24's platform, with different latency and correctness needs.
2. Compare three streaming baseline families (EWMA, seasonal decomposition, SPC rules) and name
   each one's own failure mode.
3. Size per-series state at high cardinality, with a churn and cold-start policy.
4. Design deduplication, grouping and suppression, measured by alert precision, and a backtest
   plan with a time-split.

## Engagement arc
- Hook: step 1 (a detector flags a normal changeover ramp as a false alarm eleven times until
  supervisors stop acting on it, then a slow drift that is the real fault adapts into the
  baseline and never fires).
- Predict: step 2, within the first four steps (what the design got wrong in both directions, and
  what a backtest would have shown before go-live).
- Takeaways: step 4 (each baseline family's own failure mode), step 6 (grouping collapses an
  alert flood to one root cause), step 8 (a backtest is the only way to see a detector's own
  failure before go-live, not after).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** a detector flags a coating-thickness reading far from its baseline on line four; the
  supervisor stops the line. It was the normal ramp after a changeover. Over the next week it
  fires the same way repeatedly and supervisors stop acting on it. Then a slow drift over several
  days, the one fault that mattered, adapts into the baseline and never fires.
- **On screen:** a false-alarm badge on a normal ramp, repeated until a supervisor ignores badge,
  then a slow drift line sliding unflagged under a baseline band that quietly follows it.

### 2. Predict
- **fig:** what did the design get wrong in both directions, and what would a backtest have
  shown before go-live?
- **Options:** (a) the detector's threshold was simply set too tight, so loosening it fixes both
  problems [wrong — a looser threshold still fires on the ramp or still misses the slow drift; the
  real problem is which baseline and which rule apply to which failure shape]; (b) the baseline
  adapted into the slow drift it should have flagged, and the changeover's normal ramp needed
  suppression, not a detector that fires on it at all [correct].

### 3. Reveal — a dashboard and a detector, two different consumers
- **fig:** a line-quality dashboard aggregates over a window, tolerant of seconds to a minute; a
  detector flags a measurement drifting out of spec as it arrives, where the latency and the cost
  of a false alarm versus a missed one are set by what the operator actually does on a flag.
- **Moves:** the same event stream splitting into a windowed aggregate path and a low-latency
  per-event path.

### 4. Reveal — three baseline families, three failure modes
- **fig:** an exponentially weighted moving average discounts old data incrementally; seasonal
  decomposition accounts for shift, day and week patterns; SPC rules apply control limits and run
  rules. Each is cheap enough to update per event, and each fails its own way: the EWMA adapts
  into a slow drift that is itself the fault; a seasonal model needs history a new machine doesn't
  have; a fixed control limit assumes a stationary process.
- **takeaway:** "Each baseline family is cheap to update per event, and each one fails in exactly the way its own assumption breaks."

### 5. Reveal — sizing state at high cardinality
- **fig:** every series needs its own baseline state, sized by topic 2's arithmetic and kept in
  the stream engine's own keyed state; churn (a new series on a new machine, an old one retiring)
  is handled by state TTL, with a cold-start policy of no alarms until a series has enough history,
  or a borrowed baseline from a similar machine.
- **takeaway:** "A series with no history yet can't be trusted to alarm; a cold-start policy is what keeps it quiet until it earns a baseline."

### 6. Reveal — deduplication, grouping and suppression
- **fig:** repeated firings of one condition collapse into one alert with a duration; alerts from
  series that share a cause group under the asset hierarchy's own grouping key; planned
  changeovers and maintenance suppress what would otherwise fire as a false alarm.
- **takeaway:** "Grouping by shared cause is what turns a flood of per-series alerts into one alert an operator can actually act on."

### 7. Reveal — alert precision as the detector's own metric
- **fig:** the detector is measured by its own precision and by the share of its alerts that
  operators actually act on, because a detector nobody trusts anymore is worse than no detector
  at all.
- **Moves:** a precision gauge tracked against a target, alongside a share-acted-on figure.

### 8. Reveal — backtesting on history, with a time-split
- **fig:** before a detector goes live, replay it over history from the lakehouse and score it
  against labelled past incidents — what it would have flagged, how early, how many false alarms
  — tuning thresholds on one period and testing on a later one.
- **takeaway:** "A backtest with a clean time-split is what shows a detector's own failure before go-live, not after a week of ignored alarms."

### 9. Recap
- **fig:** the dashboard-and-detector split, the three baselines with their failure modes, the
  sized per-series state, the deduplication-and-grouping design, the precision metric, and the
  backtest, side by side.

### 10. Prove it
- **fig:** the series count grows tenfold. What's the next bottleneck?
- **predict options:** (a) the baselines themselves get less accurate, since more series means
  less history per series [wrong — each series keeps its own independent state; a tenfold series
  count doesn't thin out any one series's own history]; (b) the per-series state's own total
  memory footprint and the churn-driven cold-start rate both grow with the series count, and that
  is the real next bottleneck [correct].

## Post-notes headings
- **Internals:** none claimed independently — statistical process control and quality data
  modelling, OEE and downtime events, sensor-data quality, time-series storage and compression,
  and the industrial data model are each named as a forward pointer to a later chapter, never
  used as a concept before it; machine-learned anomaly models are named beyond naming only; the
  telemetry platform this topic runs on (topic 24), the monitoring-platform design for
  data-quality checks (topic 21, whose alert-precision and grouping ideas are reused), and
  alert-routing mechanics are named as built on, not re-derived here.
- **Lab:** none of its own as a syllabus lab leg. The three-baseline comparison on a synthetic
  series with a planted slow drift and a planted step, the per-series state estimate, and the
  backtest on a held-out period are this topic's executable evidence.
- **Production:** the hook's own scenario (a detector that fires on a normal ramp until ignored,
  then adapts into the one drift that mattered and never fires) as the concrete shape "the
  baseline and the alarm rule were both wrong, in opposite directions" takes in practice.
- **Frontier:** none claimed — EWMA, seasonal decomposition, SPC rules, alert deduplication and
  grouping, and backtesting with a time-split are each established practice, not an emerging
  technique.
- **Where this goes next:** that closes the chapter, and with it the milestone: a method for
  turning a vague request into a defensible design, and fourteen designs that applied it. Two of
  them borrowed words from a domain they did not stop to teach. The next chapter is that domain,
  opening where those designs started: the ISA-95 hierarchy and the automation pyramid.

## Concept ledger
- **Introduces:** `streaming-anomaly-monitor-design`, `baseline-families-and-failure-modes`,
  `per-series-state-cold-start-churn`, `backtest-with-time-split`.
- **Uses:** the method concepts as in topic 12, plus `manufacturing-telemetry-platform-design`,
  `asset-context-join-early-vs-late` and `edge-buffer-sizing-from-outage`, `dq-platform-design`,
  `alert-precision-as-platform-slo`, `lineage-grouped-routing` and `suppression-and-feedback-loop`,
  `schedule-aware-freshness-alert` and `actionable-page-test`,
  `replay-backfill-as-first-class-path`, `deterministic-transform-requirement`,
  `label-leakage-measured` and `point-in-time-training-join`,
  `engine-choice-by-state-latency-skill`, `capacity-estimate-chain`, `latency-percentiles` — all
  confirmed live via a Node.js script parsing `registry.ts`'s `introduces` arrays.
- **Declared:** `hyperloglog-distinct-counting`, `quantile-sketches` — both Chapter 5 topics
  that remain unplanned; each reuses an exact placeholder id already introduced by prior topics
  for the identical gap, confirmed by grep.

## Changes from the chapter plan
`CHAPTER.md` states `Declared: nothing from Chapter 16`, meaning Chapter 16's own mechanisms are
forward pointers, never declared concepts (unaffected here). Two named `uses` ids from Chapter 5
(`hyperloglog-distinct-counting`, `quantile-sketches`) resolve to a chapter that remains unplanned
on this site and so move to `declared`, consistent with the convention used for topics 21 and 22
this session for the same two ids. No scope cut — this topic still treats every Chapter 16
mechanism strictly as a named forward pointer, per `CHAPTER.md`'s own "Leaves out" line.

## Claims list (for fact-check)
1. The EWMA is a statistic for monitoring a process that averages the data, giving less and less
   weight to data as it is further removed in time. — SOURCES.md (NIST EWMA page).
2. A Shewhart chart's decision depends solely on the most recent measurement from the process.
   — SOURCES.md (NIST EWMA page).
3. An EWMA's decision depends on an exponentially weighted average of all prior data, including
   the most recent measurement. — SOURCES.md (NIST EWMA page).
4. The EWMA control procedure can be made sensitive to a small or gradual drift, whereas a
   Shewhart control procedure can only react when the last data point is outside a control
   limit. — SOURCES.md (NIST EWMA page).
5. Control charts are used to routinely monitor quality. — SOURCES.md (NIST control-charts page).
6. Control limits are chosen so that almost all data points fall within them as long as the
   process remains in control. — SOURCES.md (NIST control-charts page).
7. A data point outside the control limits means the process is probably out of control.
   — SOURCES.md (NIST control-charts page).
8. Statistical methods to detect sequences or nonrandom patterns can be applied to the
   interpretation of control charts. — SOURCES.md (NIST control-charts page).
