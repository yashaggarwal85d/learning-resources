# OUTLINE: Feature platform with point-in-time correctness (`de.feature-platform-point-time`)

## Learning outcomes
1. Design one feature definition that feeds both an offline store (training history) and an
   online store (low-latency serving).
2. Decide, per feature, between a batch and a streaming computation from its freshness need.
3. Build a point-in-time-correct training-set join and show why a join on the latest value leaks
   the future into training.
4. Design an online/offline parity check as an SLO with an alert, and a backfill plan for a new
   feature's history.

## Engagement arc
- Hook: step 1 (the recommendation model scores well offline, nothing online; a feature computed
  from the table's current state counted future orders into a six-month-old training row).
- Predict: step 2, within the first four steps (how to have caught it, and the single join rule
  that prevents it).
- Takeaways: step 5 (a join on the latest value leaks the future), step 6 (the measured optimistic
  bias from leakage), step 7 (parity is an SLO, not a one-time check).
- Recap: step 9. Prove it: step 10.

## Steps (storyboard)

### 1. Hook
- **fig:** the recommendation model scores well offline and drives no measurable lift in
  production. The feature "orders in the last 30 days" was computed from the table's current
  state, so a training row for a click six months ago counted orders placed after that click.
- **On screen:** a strong offline-score bar next to a flat online-lift bar, a single feature's
  value drawn as computed from "now" instead of from the click's own moment.

### 2. Predict
- **fig:** how would you have caught this before launch, and what single join rule prevents it?
- **Options:** (a) collect more training data, since more examples average out the error [wrong
  — more rows of the same wrong join only entrench the same leak]; (b) join each feature as it
  was known at the event's own timestamp, never later [correct].

### 3. Reveal — one feature definition, two computations
- **fig:** one feature definition compiling to a batch computation over history (the offline
  store) and an incremental computation (the online store), closing the gap where a feature
  computed one way for training and another for serving trains a model on something it never
  sees at serving time.
- **Moves:** one definition box splitting into two paths, one landing in a lake table, the other
  in a low-latency store.

### 4. Reveal — batch or streaming, chosen per feature
- **fig:** each feature's own freshness need decides its path — a feature updated daily from
  batch beside one updated per event from a stream — with the same logic running on both paths so
  neither computation silently drifts from the other.
- **On screen:** a freshness-need column matched against a chosen path per feature, no mismatch
  between the two.

### 5. Reveal — the point-in-time join, and the leak it closes
- **fig:** to build a training row for an event at a given time, each feature joins as it was
  known at that time, never later; a join on the latest value instead reaches into the future.
- **takeaway:** "A join on a feature's latest value leaks the future into training; the join has to land on what was known at that event's own time."

### 6. Reveal — the leakage measured
- **fig:** a planted future-leaking feature joined two ways against the same synthetic dataset —
  the point-in-time join and the latest-value join — scored against a held-out future, the
  leaking join's score standing well above its real one.
- **takeaway:** "The leaking join's offline score was optimistic by a measured, specific margin, not a vague risk."

### 7. Reveal — parity as a continuous SLO
- **fig:** a sampled continuous check comparing the online store's value for an entity at a time
  against what the offline computation produces for that same time, run as an SLO with an alert,
  because skew arrives silently from a changed upstream or a different null-handling.
- **takeaway:** "A parity check run once at launch catches nothing a month later; it has to be a standing SLO with its own alert."

### 8. Reveal — backfilling a new feature's history
- **fig:** adding a feature means reconstructing its point-in-time values from raw history for
  the whole training set, not just turning it on from today, with the backfill's own cost and a
  shadow-and-validate rollout before it's trusted.
- **Moves:** a new feature's column filling backward through past training rows from reconstructed
  history, not forward only.

### 9. Recap
- **fig:** the one feature definition splitting into offline and online paths, the per-feature
  freshness choice, the point-in-time join, the leakage measurement, the parity SLO, and the
  backfill plan, side by side.

### 10. Prove it
- **fig:** the feature count grows tenfold. The point-in-time join and the parity check both
  still run correctly, but what's the next bottleneck?
- **predict options:** (a) the training-set join itself breaks down, since more features means a
  bigger join [wrong — the join's own correctness doesn't depend on the feature count]; (b) the
  parity check's own sampling and alert volume become the bottleneck, since checking every
  feature at the same rate stops being affordable [correct].

## Post-notes headings
- **Internals:** none claimed independently — ML modelling, feature engineering and embeddings
  (§17.1, named as "goes deeper later") are out of scope; the online serving store and stream
  engine internals (Chapters 5, 7, 9) are referenced, not re-taught; the fraud pipeline that is
  one consumer (topic 22) and the as-of-join mechanics in SQL (Chapter 2 §2.2) are named as built
  on, not re-derived; model training itself is named as outside this course's scope.
- **Lab:** none of its own as a separate syllabus lab leg. The label-leakage experiment (a
  planted future-leaking feature, the optimistic bias measured against a clean time-split) and
  the parity-check simulation are this topic's executable evidence.
- **Production:** the hook's own scenario (a model that scores well offline and drives no lift in
  production, traced to one feature computed from the table's current state) as the concrete
  shape "the offline metric lied" takes in practice.
- **Frontier:** none claimed — one feature definition feeding both stores, point-in-time joins,
  and continuous parity checks are each established practice, not an emerging technique.
- **Where this goes next:** that platform serves software. The last two designs serve a
  different place entirely: a factory floor, where the data is a hundred thousand sensor readings
  a second from machines that lose their network and must keep running. The first is the global
  manufacturing telemetry platform.

## Concept ledger
- **Introduces:** `feature-platform-one-definition`, `point-in-time-training-join`,
  `label-leakage-measured`, `online-offline-parity-slo`.
- **Uses:** the method concepts as in topic 12, plus `as-of-join`, `point-in-time-join-plans` and
  `temporal-leakage`, `bitemporal-boundary`, `score-time-feature-logging`, `latency-budget-per-hop`,
  `data-flow-shape-decision`, `dual-logic-drift-measured` and `lambda-kappa-same-pipeline-comparison`,
  `backfill-design-protect-production` and `shadow-swap-diff-validation`,
  `serving-store-by-query-shape`, `replay-backfill-as-first-class-path`,
  `deterministic-transform-requirement`, `versioned-outputs`, `semantic-layer-metric-compilation`,
  `pipeline-golden-signals`, `error-budget-burn-rate` — all confirmed live via a Node.js script
  parsing `registry.ts`'s `introduces` arrays.
- **Declared:** none — every named `uses` id resolved live, matching `CHAPTER.md`'s own
  `Declared: none`.

## Changes from the chapter plan
None. Every named `uses` id resolved live via the resolution script; no substitutions needed.

## Claims list (for fact-check)
1. Feast joins features from one or more feature views onto an entity dataframe in a
   point-in-time correct way. — SOURCES.md (Feast docs).
2. This lets Feast reproduce the state of features at a specific point in the past. — SOURCES.md
   (Feast docs).
3. Feast's point-in-time join scans backward in time from the entity dataframe's own timestamp,
   up to the feature view's TTL. — SOURCES.md (Feast docs).
4. Feast's online store serves features at low latency. — SOURCES.md (Feast docs).
5. The online store keeps only the latest feature value per entity key; no historical values are
   stored there. — SOURCES.md (Feast docs).
6. Features can be written directly to the online store through push sources, bypassing a batch
   materialization step. — SOURCES.md (Feast docs).
