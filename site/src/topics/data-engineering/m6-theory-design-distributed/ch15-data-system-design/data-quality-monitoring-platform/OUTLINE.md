# OUTLINE: Data-quality monitoring platform (`de.data-quality-monitoring-platform`)

## Learning outcomes
1. Design a check-execution plan combining declarative rules and statistical checks, each with a
   cost estimate and a placement (in-pipeline gate versus post-hoc scan).
2. Route a failing check by lineage-based blast radius to a single owner, grouping consequences
   under their root cause.
3. Design a suppression and feedback design that fights alert fatigue, and measure the platform
   itself by alert precision.
4. Design an incident workflow with a recorded cause that feeds back into the checks.

## Engagement arc
- Hook: step 1 (4,000 checks, 1,900 alerts in week one, the channel muted, a real failure sits
  muted for 26 hours).
- Predict: step 2, within the first four steps (what the design failed to treat as its own
  requirement, and what measurable thing would have caught it in week one).
- Takeaways: step 4 (grouping by root cause), step 6 (suppression needs a feedback loop, not just
  a mute button), step 8 (alert precision is the platform's own SLO).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** 4,000 checks run; in week one they send 1,900 alerts. The team mutes the channel on
  Wednesday. On Friday a real failure — a stale source table feeding the finance close — sits in
  the muted channel for 26 hours. The checks were right every time.
- **On screen:** an alert counter climbing to 1,900, a muted channel icon, then a red "stale"
  flag sitting ignored for a drawn duration.

### 2. Predict
- **fig:** the checks were right. What did the platform's design fail to treat as its own
  requirement, and what measurable thing about the alerts would have told the team in week one
  that it was failing?
- **Options:** (a) run fewer checks, since fewer checks means fewer alerts [wrong — fewer checks
  trades detection for quiet, and still gives the team no way to tell a precise alert from a
  noisy one]; (b) alert precision and the share of alerts actually acted on, as the platform's own
  measured requirement [correct].

### 3. Reveal — two layers of checks, each costed and placed
- **fig:** a declarative rule layer (not-null, accepted values) beside a statistical layer
  (freshness, volume, distribution), each drawn with a cost bar (a full scan versus an
  incremental metric versus a metadata-only check) and a placement tag (in-pipeline gate or
  post-hoc scan).
- **Moves:** a declarative check compiling to a query that returns only its failing rows; a
  statistical check comparing against a learned baseline instead.

### 4. Reveal — lineage-aware routing collapses the blast radius
- **fig:** one root-cause table lighting red, forty downstream tables inheriting its staleness
  along the lineage graph, all forty collapsing into one grouped alert routed to the root table's
  own owner.
- **takeaway:** "A failure's blast radius is who it reaches downstream; the alert belongs to the table that caused it, not to everyone it reached."

### 5. Reveal — the suppression controls
- **fig:** a planned backfill window shaded grey, a schedule-aware threshold that widens
  overnight, a per-owner rate limit, each silencing a specific kind of expected noise rather than
  muting the whole channel.
- **Narrator's line of thought:** she treats each suppression as a named, scoped rule, not a
  blanket mute a tired team reaches for on a Wednesday.

### 6. Reveal — the feedback loop that tunes the checks
- **fig:** an operator marking one alert "this was noise," the marked check's threshold widening
  on its own, a check that caught a real failure late spawning a new, earlier check.
- **takeaway:** "A mute button fights alert fatigue for a week; a feedback loop that tunes the check is the only version of 'quiet' that survives a real failure arriving later."

### 7. Reveal — the incident workflow as a state machine
- **fig:** an alert becoming an incident: detected, triaged, contained, repaired, reviewed — each
  with an owner and a timestamp, the review step writing a recorded cause back into the check
  layer.
- **Moves:** the state machine advancing one stage at a time, a human decision marked at triage
  and at review.

### 8. Reveal — alert precision as the platform's own SLO
- **fig:** a precision gauge (the share of alerts that corresponded to a real, acted-on failure)
  sitting beside the usual data SLOs, with its own error budget and its own burn-rate alert.
- **takeaway:** "Alert precision is the platform's own SLO; a monitoring system with no number for its own usefulness is flying blind about itself."

### 9. Recap
- **fig:** the two check layers with their costs, the lineage-grouped routing, the suppression
  and feedback design, the incident state machine, and the precision gauge, side by side.

### 10. Prove it
- **fig:** the table count grows tenfold overnight (a new domain onboarded). The same root-cause
  failure now reaches four hundred downstream tables instead of forty.
- **predict options:** (a) page every owner of every downstream table, since more tables means
  more people need to know [wrong — this is exactly the ungrouped flood the lineage-based routing
  was built to prevent, now at ten times the scale]; (b) the grouping and routing already collapse
  it to one alert at the root cause's owner; the next bottleneck is whether the lineage graph
  itself can compute blast radius fast enough at this size [correct].

## Post-notes headings
- **Internals:** none claimed independently — the quality-framework mechanics (Chapter 13 topic
  12), the lineage model and impact analysis (Chapter 13 topics 11 and 14), burn-rate alerting
  (Chapter 13 topic 3), and the incident-response process itself (Chapter 11 §11.3) are
  referenced, not re-taught; the skipped anomaly-detection-on-metadata topic and the vendor
  products (dbt, GX Core, Soda, Deequ) are named; machine-learned anomaly models are named as
  outside this course's scope.
- **Lab:** none of its own as a separate syllabus lab leg. The week-of-alerts simulation (alert
  volume and precision per owner, with and without lineage grouping and suppression) and the
  check-cost estimate are this topic's executable evidence.
- **Production:** the hook's own scenario (1,900 alerts, a muted channel, a real failure missed
  for 26 hours) as the concrete shape "a monitor with no precision number trains its users to
  ignore it" takes in practice.
- **Frontier:** none claimed — declarative and statistical data-quality checks, lineage-based
  alert routing, and suppression-and-feedback design are each established practice, not an
  emerging technique.
- **Where this goes next:** everything so far in this section was an analytical system, where
  seconds or minutes of delay are tolerable. The next section is where they are not. The first of
  its designs puts a model's decision on the critical path of a customer's payment, with a budget
  of a hundred milliseconds: the sub-hundred-millisecond fraud-scoring pipeline.

## Concept ledger
- **Introduces:** `dq-platform-design`, `alert-precision-as-platform-slo`, `lineage-grouped-routing`,
  `suppression-and-feedback-loop`.
- **Uses:** the method concepts as in topic 12 (`ask-to-slo-translation`, `capacity-estimate-chain`,
  `littles-law-inflight-sizing`, `data-flow-shape-decision`, `layout-from-dominant-access-path`,
  `engine-choice-by-state-latency-skill`, `correction-window-late-data`,
  `replay-backfill-as-first-class-path`, `failure-table-blast-radius`, `cost-waterfall-dominant-lever`,
  `three-alternatives-with-costs`, `ten-x-next-bottleneck`), plus `multi-window-multi-burn-rate-alert`,
  `schedule-aware-freshness-alert` and `actionable-page-test` — all confirmed live via a Node.js
  script parsing `registry.ts`'s `introduces` arrays.
- **Declared:** `dq-gates-vs-posthoc-scans`, `dq-check-cost-incremental-metrics-sampling`,
  `dq-framework-landscape`, `openlineage-run-job-dataset-events`, `blast-radius-scoring`,
  `stale-propagation-along-lineage`, `owner-notification-deprecation-workflow`,
  `federated-computational-governance`, `self-serve-table-registration-gate`,
  `hyperloglog-distinct-counting`, `quantile-sketches` (all Chapter 13's quality/lineage/governance
  topics or Chapter 5's cheap-approximate-check topics, none of which are live yet; all reuse
  exact placeholder ids already introduced by prior topics for the identical gaps where one
  exists, confirmed by grep).

## Changes from the chapter plan
`CHAPTER.md` lists `Declared: none`, but eleven of the named `uses` ids resolve to chapters that
remain entirely unplanned (Chapter 13's quality-framework, lineage, and governance topics; and
Chapter 5's cardinality/approximate-check topics), so all eleven move to `declared`. Every other
named `uses` id resolved live via the same script. No scope cut — this topic still composes,
rather than re-teaches, the quality-framework mechanics, the lineage model, burn-rate alerting,
and the incident-response process, per `CHAPTER.md`'s own "Leaves out" line.

## Claims list (for fact-check)
1. A dbt data test is an assertion compiled to a query that returns its failing rows, and it
   passes when that query returns zero rows. — SOURCES.md (dbt docs).
2. dbt ships four generic data tests out of the box: unique, not_null, accepted_values, and
   relationships. — SOURCES.md (dbt docs).
3. The Google SRE book states "every page should be actionable" as a pager-philosophy principle.
   — SOURCES.md (Google SRE book).
4. The SRE book defines an alert as a notification read by a human, classified as a ticket, an
   email alert, or a page depending on where it's pushed. — SOURCES.md (Google SRE book).
5. The SRE book states that email alerts are of limited value and tend to become overrun with
   noise. — SOURCES.md (Google SRE book).
