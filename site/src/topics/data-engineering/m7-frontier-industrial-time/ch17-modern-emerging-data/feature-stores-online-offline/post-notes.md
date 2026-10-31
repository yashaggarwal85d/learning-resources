<section data-section="outcomes">

## Outcomes

Draw a feature store as one definition feeding two stores and say what guarantee that buys; set
and check a freshness SLA against a materialization lag; reproduce all three named causes of
train/serve skew on the shop's churn feature and show which the architecture prevents and which
it does not; place Feast, Tecton and Hopsworks by what each is for, not by name alone.

</section>

<section data-section="internals">

## Internals

Feast's own documentation describes the offline store as "an interface for working with
historical time-series feature values that are stored in data sources," used for two things:
"building training datasets from time-series features" and "materializing (loading) features into
an online store to serve those features at low-latency in a production setting." The online store
is populated the other direction, by a scheduled or triggered materialization job, and keeps only
the latest value per entity key — Feast's own words: "for each entity key, only the latest feature
values are stored. No historical values are stored." This is the architectural reason a feature
store can guarantee *one definition* but not *zero lag*: materialization is a job that runs on an
interval, not an instantaneous mirror, so there is always some window between a source row
changing and the online store reflecting it. Hopsworks' own documentation describes the identical
split independently — an online store "backed by RonDB, a low latency, high throughput, high
availability data store" holding only latest values, and an offline store holding history for
training data and batch scoring — which is why this topic treats the two-pipe shape as the
architecture, not one vendor's design choice.

</section>

<section data-section="lab">

## Lab

`examples.py` reuses topic 1's synthetic churn dataset shape (same generator, same seed, a
topic-local table prefix) to measure all three named skew causes directly. For the different-code-
path cause, a second serving-side implementation of the same feature — built with a deliberately
earlier window boundary — is compared against the honest as-of value across 1,500 simulated
requests; the mismatch rate came out clearly nonzero, and running the identical definition through
both paths instead produced exactly zero mismatches, confirming the cause is the code difference
itself, not noise. For the different-join cause, a serving path that reads the feature's current
value (instead of its value as of the request) produced its own clearly nonzero mismatch rate
against the honest as-of value — the same leak topic 1 measured in training, now reproduced at
serving time. For the stale-value cause, simulated requests landing at random points in a day
measured a real, nonzero rate of freshness-SLA violations under a forty-five-minute materialization
interval against a thirty-minute SLA, and exactly zero violations once the interval was shortened
to fifteen minutes — inside the SLA by construction.

</section>

<section data-section="production">

## Production failures this topic warns about

**A materialization job falling behind after an upstream schema change, with nobody paged.**
Feast's own architecture makes materialization a job like any other job: it can lag, fail, or run
on a stale snapshot after a source table changes shape, and none of that surfaces unless a
freshness SLA was stated as a number and something actually checks it. "Fresh enough" is not a
number a monitor can alert on; "no value older than thirty minutes" is.

**A feature store's guarantee assumed to cover code it never touches.** The architecture
guarantees that code going *through* the store computes one definition. It says nothing about a
dashboard query, a notebook, or a second pipeline that recomputes the "same" feature by hand
outside the store — exactly this topic's own "Prove it" scenario, and exactly skew cause one
again, under a different name.

</section>

<section data-section="frontier">

## Frontier

Databricks' own announcement of acquiring Tecton (August 22, 2025) states the deal's purpose
plainly: "bringing Tecton into Databricks will unite the best in online data serving with
Databricks' Agent Bricks, empowering customers to build, deploy and scale AI agents faster and
more confidently than ever before" — Tecton's own self-description, quoted in the same post, names
it "the leading real-time enterprise feature store" for "fraud detection, risk scoring, and
personalization." Feast remains the open-source reference architecture this topic builds its own
mental model from; Hopsworks runs the identical offline/online split as an independent open
platform; a cloud warehouse's own low-latency serving layer is the "no second system" alternative,
trading a dedicated online store's lower latency for one fewer system to operate. None of these
vendors' materialization engines are taught here beyond the architecture and the guarantee it
buys.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A feature store guarantees the definition is the same. It cannot tell you, after the fact,
whether the value a real request actually saw matched what training assumed — that has to be
measured, not assumed, and the way to measure it is to log the exact vector the model scored. The
next topic is exactly that: inference logging and log-and-wait features.

</section>
