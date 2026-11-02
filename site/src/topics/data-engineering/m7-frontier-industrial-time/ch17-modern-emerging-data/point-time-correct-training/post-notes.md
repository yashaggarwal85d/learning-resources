<section data-section="outcomes">

## Outcomes

Build a training set with a naïve join and with a correct as-of join over the same synthetic
churn data, and measure the leakage-inflated offline AUC the naïve join produces; name a leak as
temporal (fixable by an as-of join) or post-outcome (not fixable by any join); set and justify a
feature TTL and explain its edges; design a backfill for a new feature that reuses its online
transformation logic exactly.

</section>

<section data-section="internals">

## Internals

An as-of join's "scan backward, stop at the first value at or before" is not a special operator —
it's the same mechanism Chapter 2's `as-of-join` already taught on sensor rows, executed as a
sort-merge or an index range scan on `(entity_id, timestamp)`, now applied to a label instead of a
neighbouring row. Feast's own documentation states the TTL's reference frame precisely: "the TTL
time is relative to each timestamp within the entity dataframe. TTL is not relative to the current
point in time (when you run the query)" — getting this backwards (treating the TTL as relative to
today) would silently let every old label "see" a feature value regardless of how long ago that
label actually happened, defeating the whole point of a staleness limit. This topic's own measured
experiment builds both joins directly in SQL against a synthetic dataset in this sandbox's own
Postgres cluster, rather than through Feast itself (not installed here); the join logic reproduced
is the mechanism Feast's documentation describes, not Feast's own code.

A feature's as-of value still has to come from somewhere, and *how* it's computed changes how
fresh it can be. A **batch** feature (this topic's own ticket-count example, recomputed on a
schedule from the orders and tickets tables) is only as fresh as its last run; a **streaming**
feature (recomputed continuously from an event log as events arrive, Chapter 9's own material)
can be fresh to the second, at the cost of a more complex computation path. The choice is a design
trade-off stated once here, not re-derived: this topic's own as-of join works identically either
way, because the join only cares what the feature's value was at a given moment, not how that
value was produced.

</section>

<section data-section="lab">

## Lab

`examples.py` generates a synthetic churn dataset with two deliberately engineered leakage
mechanisms: a feature whose current value absorbs a burst of post-label activity (temporal
leakage) and a column populated only for customers who already churned (post-outcome leakage). A
single hand-rolled logistic regression, trained identically on both the naive and as-of training
sets, measures a real AUC gap between the two — the naive join's AUC came out measurably higher,
confirming the leakage's direction and size rather than assuming it. A second experiment confirms
the post-outcome field is null for every row even when joined as of the label's own moment,
because the field is never populated before the outcome regardless of how far back the join
scans. A third confirms both documented TTL edge cases (too early, too stale) join to null rather
than the nearest available value.

</section>

<section data-section="production">

## Production failures this topic warns about

**A feature pipeline's "current value" query silently becoming a leak.** Google's own Rules of
Machine Learning names this directly (Rule #31): joining to a table whose data changes between
training and serving time means "your model's prediction for the same document may then differ
between training and serving," and a real pipeline can drift into this shape gradually — an
intermediate snapshot table that had been accidentally enforcing an as-of-like delay gets removed
for being "redundant," and every join downstream of it quietly switches from as-of to current
without any code that says so.

**Backfilling a new feature from an approximation instead of the original online logic.** A
feature added after a model is already live needs its history computed with the *exact*
transformation that will run online (Google's Rule #32: reuse code between training and serving
pipelines); approximating it a second time from warehouse tables — plausible-looking, and wrong in
ways that don't show up until skew appears in production — is exactly the failure this topic's
"Prove it" scenario poses.

</section>

<section data-section="frontier">

## Frontier

Feast's own worked example shows a point-in-time join's two failure edges concretely: "the first
row within the entity dataframe was older than the earliest feature rows in the feature view and
could not be joined," and "the last row ... was outside of the TTL window ... and also couldn't be
joined" — both producing a null, not an approximation, which this topic's own TTL experiment
reproduces on a different, synthetic dataset. Hopsworks and Tecton (acquired by Databricks in
2025) implement the same point-in-time correctness guarantee inside their own online/offline
feature-store architectures, named here only as the production-scale version of the join this
topic builds by hand; their own internals are the next topic's subject, not this one's.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Getting this join right once, in one script, proves the idea works. It does not stop the next
engineer, on the next model, from writing the same join wrong, or from computing the "same"
feature a second way for the live service. The next topic is the platform built to make that
impossible: the feature store, and the online/offline consistency it exists to guarantee.

</section>
