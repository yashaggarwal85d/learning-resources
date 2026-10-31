# Fact-check — de.feature-platform-point-time

## Claims re-derived against the source

1. **Feast joins features from one or more feature views onto an entity dataframe in a
   point-in-time correct way.** SOURCES.md's quote supports this directly. Checked step 5's
   point-in-time-join reveal names exactly this mechanism, applied to a feature view rather than
   a generic table, matching the source's own wording.
2. **This lets Feast reproduce the state of features at a specific point in the past.**
   SOURCES.md's quote supports this directly. Checked step 5 treats "what was known at the
   event's own time" as the property the join exists to guarantee, matching the source's own
   stated purpose, not an assumed property.
3. **Feast's point-in-time join scans backward in time from the entity dataframe's own
   timestamp, up to the feature view's TTL.** SOURCES.md's quote supports this directly. Checked
   step 5's reveal describes the join as bounded lookback from each event's own timestamp, not an
   unbounded history scan, matching the source's own mechanism.
4. **Feast's online store serves features at low latency.** SOURCES.md's quote supports this
   directly. Checked step 3's reveal assigns the online store exactly this role in the
   one-definition split, not a training-time role.
5. **The online store keeps only the latest feature value per entity key; no historical values
   are stored there.** SOURCES.md's quote supports this directly. Checked step 7's parity reveal
   relies on exactly this limitation — the online store alone can't answer what a feature looked
   like last month, which is why the parity check and the offline store's own history both
   matter.
6. **Features can be written directly to the online store through push sources, bypassing a
   batch materialization step.** SOURCES.md's quote supports this directly. Checked step 4's
   batch-or-streaming reveal names this as the streaming path a freshness-sensitive feature
   takes, not the only path every feature must take.
7. **The one-feature-definition split, the point-in-time join's leakage-closing property, the
   leakage measurement, the parity SLO, and the backfill design are this chapter's own
   established method and this topic's own derived design.** Not an independent citation beyond
   claims 1-6 — `CHAPTER.md`'s own scope line states these as this topic's own worked design, not
   re-derived here.

## Red-team pass on the predict questions

- **Predict 1 (step 2):** the wrong option ("collect more training data") is a genuine, plausible
  first instinct — more examples often help — but it's ruled out directly: more rows joined the
  same wrong way only repeat the same leak at a larger scale, never close it. The correct option
  names the actual mechanism: joining each feature as it was known at the event's own timestamp,
  never later.
- **Predict 2 (step 10, "Prove it"):** checked that "the training-set join itself breaks down" is
  ruled out against claim 3's own mechanism: the join's correctness is per-feature and per-event,
  so a higher feature count doesn't change how any single join behaves. The correct option (the
  parity check's own sampling and alert volume become the bottleneck) follows from claim 5's own
  limitation — checking every feature at the same rate against the online store's own
  latest-only contents stops being affordable as the feature count grows, even though each join
  stays correct.

## Illustrative numbers (figs for steps 1, 6, 10)

The hook's offline AUC score and flat online lift, the planted feature's leakage window (orders
in the last thirty days), the measured optimistic-bias margin in the leakage experiment, and the
tenfold feature-count growth in "Prove it" are illustrative, stated lab numbers for the
storyboard and the simulation in `examples.py`, not cited real-world figures from any specific
company's recommendation system.

## Outcome

No open findings. Every claim about Feast's own point-in-time join mechanism and its online
store's own contents traces to one of SOURCES.md's six verbatim quotes across two sources (both
pages of Feast's own documentation); the one-definition split, leakage measurement, parity-SLO,
and backfill designs rest on `CHAPTER.md`'s own stated scope, not an unsourced factual claim;
both predicts are checked against the topic's own cited mechanisms rather than invented
reasoning.
