# OUTLINE: Feature stores and online/offline consistency (`de.feature-stores-online-offline`)

## Learning outcomes

1. Draw a feature store as one definition feeding two stores (offline for training, online for serving) and say what guarantee that architecture buys.
2. Set and check a freshness SLA against a materialization lag.
3. Reproduce all three named causes of train/serve skew on the shop's churn feature (different code path, different join, stale online value) and say which the architecture prevents and which it does not.
4. Place Feast, Tecton and Hopsworks by what each is for, not by name alone.

## Reel steps and storyboards

### 1. Hook
- **fig:** "Strong in every offline test. Worse the week it goes live. No code changed."
- **Visual:** the chapter's two-parallel-pipes figure, drawn for the first time but not yet explained: one feature definition box at top, two pipes below it (offline, online), both unlabeled, their outputs visibly different at a checkpoint mark (lit a faint red, not yet called a bug).
- **Narrator's line of thought:** the model didn't change; something about how the same feature reaches training versus serving did. She points at the mismatch before naming any of the three causes.

### 2. Predict: which skew cause
- **fig:** "The online pipeline computes 'days since last order' with a different timezone boundary than the offline pipeline. Which of three causes is this?"
- Options: "A materialization lag — the online store's value is just old" / "A different code path computing the 'same' feature differently" (correct).
- **Explain:** nothing is stale here — both pipelines run on time. The bug is that two pieces of code claim to compute the same feature and don't.

### 3. Reveal: one definition, two stores
- **fig:** "One transformation, compiled once. An offline store for training, an online store for serving."
- **Visual:** the two-parallel-pipes figure, now labeled and explained: the single feature-definition box, an arrow into a thick/slow offline pipe (lakehouse tables, full history) and a thin/fast online pipe (low-latency key-value, latest value only); both **Decode** from the same box, matching at the checkpoint.
- **Takeaway:** "A feature store doesn't store a feature's value. It stores one definition and runs it twice, so the two never have the chance to disagree."

### 4. Reveal: skew cause 1, measured — different code path
- **fig:** real numbers: how often a second, subtly different "serving" implementation of the same feature disagrees with the offline definition, on the shop's churn feature.
- **Visual:** the single definition box from step 3, now split into two boxes (a second, smaller one appearing beside the first) — the earlier, before-the-store picture; their two pipe outputs fail to **Decode** to the same value at the checkpoint, several checkpoints lit red.
- **Takeaway:** "The single most commonly cited cause of this skew isn't a timing bug. It's two engineers, two code paths, one name."

### 5. Reveal: skew cause 2, measured — a different join
- **fig:** real numbers: the serving path asks for the feature's current value instead of its value as of the request; measured disagreement rate against topic 1's as-of value.
- **Visual:** the chapter-1 two-clock timeline reappears briefly inside the online pipe: a Reticle locking onto "today" instead of "as of," the same leak as topic 1, now happening at inference time instead of training time.
- **Takeaway:** "A feature store can guarantee one definition and still lose to a different join. The store isn't the whole guarantee."

### 6. Predict: freshness SLA
- **fig:** "Materialization runs every thirty minutes. A request arrives thirty-five minutes after the last run. Is the online value late?"
- Options: "No — thirty-five minutes is close enough to real time to count as current" / "Yes — past the stated SLA, the honest answer is 'unknown,' not 'close enough'" (correct).
- **Explain:** a freshness SLA is a number, not a feeling; the gap between "materialization just ran" and "a request arrived" is a measurable lag, and past the stated limit the value is late by definition, however small the lag looks.

### 7. Reveal: skew cause 3, measured — a stale online value
- **fig:** real numbers: under a stated freshness SLA, what fraction of simulated requests hit an online value older than the SLA allows, and by how much.
- **Visual:** the online pipe from step 3, now with materialization drawn as discrete pulses (not a continuous flow) along its length; a request arriving between pulses reads the previous pulse's value; a shaded SLA band trailing each pulse, like the chapter-1 TTL band, with requests landing outside the band lit red.
- **Takeaway:** "Materialization isn't instant. The gap between the last run and the next request is exactly what a freshness SLA has to name."

### 8. Reveal: the named platforms, placed by what they're for
- **fig:** "Feast. Tecton. Hopsworks. A warehouse's own serving layer. Same shape, different choices."
- **Visual:** four small variants of the two-pipe figure side by side, each pipe pair drawn identically in shape but labeled with its vendor and one distinguishing fact (Feast: open-source reference architecture, pluggable stores; Tecton: commercial, real-time-focused, now part of Databricks as of August 2025; Hopsworks: another open platform, its own offline/online split; cloud-native: no separate system, the warehouse's own low-latency layer).
- **Takeaway:** "Four names for the same two pipes. What's different is who manages them and how real-time the online side needs to be."

### 9. Recap
- **fig:** "One definition. Two stores. Three ways the guarantee still breaks."
- **Visual:** the two-parallel-pipes figure once more, all three skew causes drawn together in miniature: a second box (code path), a wrong-join Reticle (different join), a missed SLA band (stale value).

### 10. Prove it
- **fig:** a team adopts a feature store and keeps a separate, hand-written SQL query in a dashboard that recomputes the same feature definition "for a quick check."
- Predict: "The feature store's single definition still protects both paths, since the dashboard query is read-only" / "The dashboard query is a second code path, and the store's guarantee doesn't reach it" (correct).
- **Explain:** a feature store only guarantees consistency for code that goes through it; anything that recomputes the feature outside the store — a dashboard query, a notebook, a second pipeline — is exactly skew cause 1 again, wearing a different excuse.

## Engagement arc

- **Hook (step 1):** the live/offline gap restated as a picture, no cause named yet.
- **Predicts:** step 2 (within the first four) and step 6 — two.
- **Surprising number:** the measured disagreement rates in steps 4, 5 and 7 (exact values from examples.py).
- **Takeaways (≥3):** steps 3, 4, 5, 7, 8 each carry one.
- **Recap:** step 9, pulling the three skew causes into one picture.

## Post-notes headings

- **Internals:** how materialization is actually scheduled (a batch job on an interval vs. a streaming write, ties to Chapter 9's material, named not retaught) and why the online store is usually a separate low-latency engine rather than the same database.
- **Lab:** the full skew-measurement script: materialize topic 1's churn feature to a simulated online store and measure all three skew causes against the offline (as-of) value.
- **Production failures:** a real-shaped incident — a feature store's materialization job silently falls behind after a schema change in its source table, and nothing pages anyone because no freshness SLA was ever stated as a number.
- **Frontier:** inference logging (topic 3) as the way to catch a skew the store itself didn't prevent, after the fact.
- **Where this goes next:** topic 3, explicitly as "measuring what was actually served, not what the store promised."

## Examples to execute and assert

`examples.py`: regenerate topic 1's synthetic churn dataset (same generation logic, same seed, a topic-local table prefix so this topic stands alone) in this sandbox's Postgres; build the "offline" value as topic 1's as-of join; simulate an "online store" as a Python dict materialized on a stated interval from the same source rows; (1) different-code-path skew: compute a second serving-side feature function with a deliberately different window boundary and measure its disagreement rate against the offline value; (2) different-join skew: compute a serving-side "current value" read (not as-of) and measure its disagreement rate against the offline value; (3) stale-value skew: simulate requests arriving at random offsets after each materialization pulse under a stated freshness SLA and measure the fraction and average magnitude of SLA violations; assert each measured skew rate is nonzero (so the bug is real, not assumed) and assert that removing each cause's root condition (identical code, as-of join at serving, request within the SLA) drives that specific skew rate to zero.

## Bridge and handoff

- **Bridge:** topic 1's handoff, answered (see CHAPTER.md: "Getting the join right once... This topic is the platform built to make that impossible...").
- **Handoff:** "A feature store guarantees the definition is the same. It cannot tell you, after the fact, whether the value a real request actually saw matched what training assumed — that has to be measured, not assumed, and the way to measure it is to log the exact vector the model scored."

## Concept ledger

- **Introduces:** `feature-store-single-definition`, `online-offline-materialization`, `train-serve-skew-causes`, `feature-freshness-sla`.
- **Uses:** `label-feature-timeline-join`, `post-outcome-field-leakage`, `feature-ttl-staleness` (topic 1).
- **Declared:** basic familiarity with a key-value store's read latency. Builds on Chapter 5's Redis/Valkey topic (§5.6, not yet live) and Chapter 9's streaming-ingestion material (§9.3) in prose only.

## Claims list

1. An offline store is an interface over historical, time-series feature values in a data source, used to build training datasets and to materialize into an online store. — Feast docs, "Offline store."
2. Only one offline store is active at a time, and offline stores aren't universally compatible with every data source. — Feast docs, same page.
3. An online store is populated by materialization and keeps only the latest value per entity key, with no history. — Feast docs, "Online store."
4. Hopsworks independently describes the same two-store split: online keeps only latest values (backed by RonDB), offline keeps history for training data and batch scoring. — Hopsworks docs.
5. Databricks announced its acquisition of Tecton on August 22, 2025, stated purpose: unite Tecton's real-time/online data serving with Databricks' Agent Bricks. — Databricks Blog.
6. Tecton describes itself as a real-time enterprise feature store for use cases like fraud detection, risk scoring and personalization. — Databricks Blog (quoting Tecton's own description).
7. Topic 1's as-of join and post-outcome-leakage material is this course's own prior content, reused as the "offline, honest" baseline against which this topic's three skew causes are measured.

## Progress

Research done (SOURCES.md, 3 fetched sources, all quotes checked); content plan (this file) done. Next: fact-check, coverage map, build every file.
