# OUTLINE: Point-in-time correct training data (`de.point-time-correct-training`)

## Learning outcomes

1. Build a training set with a naïve join and with a correct as-of join over the same synthetic churn data, and measure the leakage-inflated offline AUC the naïve join produces.
2. Name a leak as temporal (fixable by an as-of join) or post-outcome (not fixable by any join, because the field's existence depends on the outcome).
3. Set and justify a feature TTL, and explain what happens at its edges (a label older than the earliest feature row, a label too far past the feature row to be inside the TTL).
4. Design a backfill for a new feature that reuses its online transformation logic exactly, so a feature added after launch doesn't quietly diverge between its historical and future values.

## Reel steps and storyboards

### 1. Hook
- **fig:** "0.94 AUC offline. Barely a coin flip live. What did the join actually join?"
- **Visual:** the two-clock timeline (chapter figure): a label mark fixed at a point; a feature's "support tickets opened" value changing at several points around it, with the current (rightmost) value highlighted.
- **On screen:** "offline AUC 0.94" vs "live: ~0.52" as two large numbers; the timeline beneath, a Reticle sitting on the rightmost feature point (today), to the right of the label mark.
- **What moves:** the Reticle slides from left to right across several feature-update points before landing on "today," past the label mark — this is the naive join's own motion, shown before it's named as a bug.
- **Final frame:** the Reticle past the label mark, label mark highlighted in isolation, a "?" where the explanation will go.
- **Caption point:** the gap between offline and live performance is real, and the picture already shows where to look.
- **Narrator's line of thought:** she doesn't say "this is a leaky join" yet — she points at the picture and asks what exactly got compared to what. The two numbers are a fact; the explanation is what the next steps earn.

### 2. Predict: naive vs. as-of join
- **fig:** "Join a label to a feature's CURRENT value, or to its value AS OF the label's own time. Which AUC is real?"
- Options: "Both AUCs are equally trustworthy, since it's the same data either way" / "The as-of AUC is the real one — the current-value join lets the future leak backward into training" (correct).
- **Explain:** a feature's current value already reflects everything that happened since the label, including things caused by the outcome itself; the as-of join only sees what was true at the label's own moment, which is the only thing a live model will ever get to see.
- **Visual:** same timeline, now drawn twice side by side: one Reticle locking onto "today" (labelled NAIVE), one locking onto the latest point at-or-before the label mark (labelled AS-OF).

### 3. Reveal: the as-of join, mechanism
- **fig:** "Scan backward from the label's own timestamp. Stop at the first feature value at or before it."
- **Visual:** the AS-OF Reticle from step 2, now animated: starting at the label mark and scanning backward (Decode motion) until it locks onto the first feature point at or before it; a second label mark further right shows the same scan landing on a different, later feature point — the join's output genuinely depends on the label's own time, not a fixed value.
- **Takeaway:** "An as-of join doesn't ask what a feature is now. It asks what a feature was, the moment the label happened."
- **Narrator's line of thought:** reuses Chapter 2's as-of join by name (it already taught the mechanism on sensor rows); the new idea here is nothing about *how* the join works, only that a label is exactly the same kind of right-hand row a sensor reading was.

### 4. Reveal: temporal leakage, measured
- **fig:** real numbers from examples.py: naive-join AUC vs. as-of-join AUC on the same synthetic churn dataset.
- **Visual:** two bars, NAIVE (tall, inflated) and AS-OF (shorter, honest), with the real measured values as on-screen numbers; the timeline from step 1 redrawn small beside each bar, Reticle in the matching position.
- **Takeaway:** "The naive join's AUC was never a lie about the training data. It was the truth about data the live model will never have."
- **Narrator's line of thought:** she names this "temporal leakage" and ties it explicitly to Chapter 2's `temporal-leakage` id — the same failure, now measured at a whole dataset's scale instead of one joined row.

### 5. Reveal: post-outcome field leakage
- **fig:** "A cancellation reason column. Only churned customers have one. No join timing fixes this."
- **Visual:** a single feature column drawn as mostly empty cells, filled only at rows where the label is "churned" — the column's own existence pattern mirrors the label, drawn as a visible correlation between "has a value" and "label = true," with no timeline or Reticle needed, on purpose (this is not a timing bug).
- **Takeaway:** "Temporal leakage is a question of when you looked. This leak is a question of why the field exists at all — and an as-of join can't fix a field that only exists because of the outcome."
- **Narrator's line of thought:** explicitly contrasts with step 4: same word ("leakage"), different mechanism, different fix (drop the field, don't time-shift the join).

### 6. Predict: feature TTL edges
- **fig:** "A label older than any feature data exists. A label 10 days past the last feature update, with a 7-day TTL. What does each join to?"
- Options: "Both join to the nearest value anyway — closer is better than nothing" / "Both join to nothing: too early for one, too stale for the other" (correct).
- **Explain:** a TTL is a stated limit on how old a "latest" feature value is allowed to be before it no longer counts as known; past it, the honest answer is "we don't know," not "the nearest guess."

### 7. Reveal: feature TTL, named and measured
- **fig:** real numbers: how many labels in the synthetic dataset fall outside a stated TTL window, and what happens to them (dropped vs. a stated fallback).
- **Visual:** the timeline again, now with a shaded TTL band trailing each feature point; a label mark inside the band joins normally (Reticle locks, black); a label mark past the band's edge fails to lock (Reticle greys out, no line drawn to any feature point).
- **Takeaway:** "A TTL isn't a performance setting. It's an honest admission that a feature value can get too old to mean anything."
- **Narrator's line of thought:** names Feast's own TTL semantics (relative to each label's own timestamp, never to "now") as the production-grade version of the same rule step 3 already taught; the mechanism is identical to the as-of join, just with a stop condition added.

### 8. Reveal: backfill with the same online logic
- **fig:** "A new feature, added after the model is already live. Compute it for history with the EXACT code that will run online — or training and serving are already different on day one."
- **Visual:** a single transformation box with two arrows out of it, one into a "historical backfill" pipe and one into a "live" pipe — both pipes originating from the same box, in contrast to an earlier, crossed-out version of the figure with two separate boxes (one per pipe) and a small gap between their outputs, drawn and then struck through.
- **Takeaway:** "A backfilled feature isn't 'close enough' to the online version. If it isn't the identical transformation, it's a second feature wearing the first one's name."
- **Narrator's line of thought:** ties back to Google's Rule #32 (reuse code between training and serving) by idea, not by citing the rule number aloud — the narration never reads a citation, it teaches the point the rule makes.

### 9. Recap
- **fig:** "A label has its own moment. A feature has to be read as of that moment, not after it, and not forever."
- **Visual:** the full timeline once more, all three guards drawn together in miniature: the as-of Reticle, the post-outcome column's empty-until-label pattern, the TTL band's trailing edge.

### 10. Prove it
- **fig:** a new feature ("days since last support contact") is added to the churn model nine months after launch, backfilled by a different engineer who didn't have access to the original online code and approximated it from the warehouse tables instead.
- Predict: "The backfilled training values are close enough to the online ones to trust" / "They're probably a second, subtly different feature wearing the same name" (correct).
- **Explain:** without the exact online transformation, a warehouse approximation is a plausible-looking stand-in that can diverge from what the live service actually computes — invisible until skew shows up in production, exactly the failure topic 2 names next.

## Engagement arc

- **Hook (step 1):** the churn model's offline/live gap, shown as two numbers and a picture, no explanation yet.
- **Predicts:** step 2 (within the first four steps) and step 6 — two, as a full topic requires.
- **Surprising number:** the measured gap between the naive and as-of AUCs in step 4 (exact values from examples.py).
- **Takeaways (≥3):** steps 3, 4, 5, 7, 8 each carry one; all ≤20 words, nothing beyond what the step shows.
- **Recap:** step 9, pulling the three guards (as-of join, post-outcome exclusion, TTL) into one picture.

## Post-notes headings (layers 5-8)

- **Internals:** how the as-of join's "scan backward, stop at the first value at or before" is actually executed (a sort-merge or an index range scan on (entity, timestamp); ties to Chapter 2's window-function execution material).
- **Lab:** the full naive-vs-as-of AUC comparison script, with the exact synthetic churn dataset's generation parameters stated so it's reproducible.
- **Production failures:** a real-shaped incident — a feature pipeline's "current value" query silently becomes a leak the day someone removes an intermediate snapshot table that had been accidentally enforcing an as-of-like delay.
- **Frontier:** feature stores (topic 2) as the platform answer to "stop hand-rolling this join per model."
- **Where this goes next:** topic 2's feature store, explicitly as "the same join, reusable."

## Examples to execute and assert

- `examples.py`: generate a synthetic churn dataset (customers, order history, support-ticket feature with a timestamp, churn label with a timestamp) in this sandbox's Postgres; build a naive join (current feature value) and an as-of join (Chapter 2's SQL pattern, LATERAL or window-based) training set; train/evaluate a simple classifier (logistic regression, no external ML framework dependency beyond what's already used elsewhere in the course, or a hand-rolled AUC calc if simpler); assert the naive AUC is measurably higher than the as-of AUC on a held-out set that is itself built with the as-of join (so the held-out evaluation is never the thing that's leaking); assert a stated count of post-outcome-leakage rows (rows where the "cancellation reason" field is populated) correlates almost perfectly with the label, and show dropping it doesn't hurt the honest AUC; assert the TTL edge cases (a label before the earliest feature row, a label past the TTL window) both join to null/fallback, not to the nearest available value.

## Bridge and handoff

- **Bridge:** Chapter 16's own closing sentence, quoted exactly (see CHAPTER.md).
- **Handoff:** "Getting the join right once, in one script, proves the idea. It does not stop the next engineer on the next model from writing the same join wrong, or from computing the 'same' feature a second way for the live service. The next topic is the platform built to make that impossible: the feature store, and the online/offline consistency it exists to guarantee."

## Concept ledger

- **Introduces:** `label-feature-timeline-join`, `post-outcome-field-leakage`, `feature-ttl-staleness`, `backfill-same-online-logic`.
- **Uses:** `as-of-join`, `temporal-leakage`, `window-vs-self-join-cost` (Chapter 2, §2.2, live).
- **Declared:** basic supervised-learning vocabulary (label, feature, training set, AUC).

## Claims list

1. An as-of join reproduces a feature's value as of a past timestamp, not its current value. — Feast docs, "Point-in-time joins."
2. Feast's TTL is relative to each entity row's own timestamp, never to query time. — Feast docs, same page.
3. A row older than the earliest feature data, or further from a feature row than the TTL allows, joins to nothing. — Feast docs, same page.
4. Joining to a table whose data changes between training and serving time causes a model's prediction to differ between the two; snapshotting is a partial, not complete, mitigation. — Google, Rules of ML, Rule #31.
5. Reusing code between training and serving pipelines removes a source of training-serving skew. — Google, Rules of ML, Rule #32.
6. A post-outcome field (e.g., a refund amount populated only after a churn) is leakage because it's only knowable after the outcome, not because of any join timing. — Hex, "Feature leakage in ML."
7. The as-of join mechanism itself (Chapter 2's `as-of-join`) and `temporal-leakage` are this course's own prior material, reused, not re-derived.

## Progress

Research done (SOURCES.md, 3 fetched sources + in-course reuse, all quotes checked); content plan (this file) done. Next: fact-check (section 5), coverage map (section 6), build every file (section 7).
