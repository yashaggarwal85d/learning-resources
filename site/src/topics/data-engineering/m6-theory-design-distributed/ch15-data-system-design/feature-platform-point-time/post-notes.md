<section data-section="outcomes">

## Outcomes

The shop gets a recommendation feature platform built on one feature definition that feeds both
an offline store (training history) and an online store (low-latency serving); a per-feature
decision between batch and streaming made from each feature's own freshness need; a
point-in-time-correct training-set join; a measured leakage bias from a planted future-leaking
feature, scored against a clean time-split; a continuous online/offline parity check run as an
SLO with its own alert; and a backfill plan that reconstructs a new feature's point-in-time
history rather than only turning it on from today. The next bottleneck at ten times the feature
count is named as the parity check's own sampling and alert volume, not the join itself.

</section>

<section data-section="internals">

## Internals

None claimed independently here. The online serving store and stream engine internals (Chapters
5, 7, 9) are each referenced, not re-taught. The fraud pipeline that is one consumer of this
platform (topic 22) and the as-of-join mechanics in SQL (Chapter 2 §2.2) are named as built on,
not re-derived here. ML modelling, feature engineering, and embeddings are named as a later
chapter's own scope, and model training itself is named as outside this course's scope.

</section>

<section data-section="lab">

## Lab

None of its own as a separate syllabus lab leg. The label-leakage experiment (the point-in-time
join versus the latest-value join, scored against the same planted feature and held-out future)
and the parity-check sampling-cost comparison are this topic's executable evidence.
`examples.py`'s own lab: `point_in_time_count()` and `leaky_count()` compute the same feature two
ways; `accuracy_at_threshold()` measures the leaky join's optimistic score; `parity_mismatch_rate()`
and `sampling_cost()` price the parity check at scale.

</section>

<section data-section="production">

## Production failures this topic warns about

**A feature joined on "now" instead of "then."** Computing a feature from a table's current
state, rather than from the event's own moment, lets every future update of that table leak
straight into a training row that predates it.

**A parity check run once, at launch.** A parity check that only ran the day the feature shipped
catches nothing when an upstream column changes, or a null-handling rule quietly shifts, a month
later.

</section>

<section data-section="frontier">

## Frontier

None claimed. One feature definition feeding both an offline and an online store, point-in-time
joins for training sets, and continuous online/offline parity checks are each established
practice, not an emerging technique.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

That platform serves software. The last two designs in this chapter serve a different place
entirely: a factory floor, where the data is a hundred thousand sensor readings a second from
machines that lose their network and must keep running. The next design is the global
manufacturing telemetry platform.

</section>
