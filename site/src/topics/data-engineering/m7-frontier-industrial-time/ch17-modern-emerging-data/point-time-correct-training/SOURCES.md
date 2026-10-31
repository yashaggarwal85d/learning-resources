## Rules of Machine Learning (Google for Developers)

URL: https://developers.google.com/machine-learning/guides/rules-of-ml
Version: live page, fetched 2026-10-30

> Rule #29: The best way to make sure that you train like you serve is to save the set of features used at serving time, and then pipe those features to a log to use them at training time.

> Rule #31: Beware that if you join data from a table at training and serving time, the data in the table may change.

> Say you join doc ids with a table containing features for those docs (such as
> number of comments or clicks). Between training and serving time, features in
> the table may be changed. Your model's prediction for the same document may
> then differ between training and serving. The easiest way to avoid this sort
> of problem is to log features at serving time (see
> Rule #32
> ). If the table is
> changing only slowly, you can also snapshot the table hourly or daily to get
> reasonably close data. Note that this still doesn’t completely resolve the
> issue.

> Rule #32: Re-use code between your training pipeline and your serving pipeline whenever possible.

> Training-serving skew is a difference between performance during training and
> performance during serving. This skew can be caused by:
>
> A discrepancy between how you handle data in the training and serving pipelines.
>
> A change in the data between when you train and when you serve.

Contents:
- Rule #29: log served features for training (the inference-logging idea, named forward to topic 3)
- Rule #30: importance-weight sampled data (out of scope for this topic)
- Rule #31: a joined table's data can change between training and serving time — the mechanism behind both temporal leakage (within training) and skew (training vs. serving); names "snapshot the table hourly or daily" as a partial mitigation, which this topic reframes as a feature TTL
- Rule #32: reusing code between training and serving pipelines removes a skew source (the "different code path" cause named forward to topic 2)
- The definition of training-serving skew and its three named causes (topic 2's material; used here only for the one clause that is this topic's own: "a change in the data between when you train and when you serve")

## Point-in-time joins (Feast documentation)

URL: https://docs.feast.dev/v0.59-branch/getting-started/concepts/point-in-time-joins
Version: v0.59-branch, "Last updated 9 months ago" per the page, fetched 2026-10-30

> Feast is able to join features from one or more feature views onto an entity dataframe in a point-in-time correct way. This means Feast is able to reproduce the state of features at a specific point in the past.

> For each row within the entity dataframe, Feast will query and join the selected features from the appropriate feature view data source. Feast will scan backward in time from the entity dataframe timestamp up to a maximum of the TTL time specified.

> Please note that the TTL time is relative to each timestamp within the entity dataframe. TTL is not relative to the current point in time (when you run the query).

> The first row in the entity dataframe was older than the earliest feature rows in the feature view and could not be joined. The last row in the entity dataframe was outside of the TTL window (the event happened 11 hours after the feature row) and also couldn't be joined.

Contents:
- the point-in-time join's definition: reproduce the state of features at a specific past timestamp, not their current value
- the mechanism: scan backward from the entity's own timestamp, bounded by the feature's TTL
- the TTL's reference frame: relative to each entity row's own timestamp, never to the time the query runs — the exact clause this topic's "feature TTL" teaches
- what happens at the TTL's edges: a row older than the earliest feature data, or further from a feature row than the TTL allows, joins to nothing (a null, not a guess) — reused in this topic's examples.py as the "feature too old to use, join drops or falls back" case

## Feature leakage in ML: Detect, Prevent, and Fix It (Hex)

URL: https://hex.tech/blog/feature-leakage/
Version: live page, fetched 2026-10-30

> A feature in your dataset contains information that's only knowable after the outcome has occurred. Think of including minutes_late when predicting is_late, or adding refund_amount to a churn model. Refunds happen because the customer already churned.

> Ask a causal question: would this feature's value be known at the exact moment you need to make a prediction in production? Leakage features are different from legitimately predictive ones because they encode the outcome itself, either directly or through a proxy that only exists after the event.

Contents:
- the definition of a post-outcome field: a feature only knowable, or only populated, after the outcome occurred (refund_amount after a churn, minutes_late after an is-late event) — grounds this topic's "post-outcome field" clause, distinct from temporal leakage (which an as-of join fixes) because no join timing can make an unpopulated-until-after field available before the outcome
- the causal test this topic's examples.py reuses in prose (not as a formula): would this feature's value be known at the exact moment of prediction

## Chapter 2's own point-in-time-as-of-joins topic (in-course, already live)

URL: (internal) site/src/topics/data-engineering/m1-foundations/ch02-advanced-sql-query-execution/point-in-time-as-of-joins/
Version: live in this course's registry as of 2026-10-30; registry id `de.point-in-time-as-of-joins`

This topic is the in-course primary citation for the as-of join mechanism itself (`as-of-join`, `temporal-leakage`, both already `introduces`d and live) and is reused, not re-derived, per this chapter's plan. No new quote is taken from it; its registry entry is the authority for what it already teaches.
