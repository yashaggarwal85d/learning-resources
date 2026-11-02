<section data-section="outcomes">

## Outcomes

Design a logging schema that captures the served feature vector, model version, request id and
timestamp; join a batch of logged vectors to delayed labels and build a training set from it, and
explain why this set cannot have topic 2's different-code-path skew by construction; distinguish
shadow from canary capture by what each does with its output; size a logging pipeline's storage
cost and name what in the payload needs redaction or a retention limit.

</section>

<section data-section="internals">

## Internals

A log point has to sit on the serving path without becoming part of its latency budget: the usual
shape is an asynchronous side-channel write (the request returns to its caller before the log
write is guaranteed durable), not a synchronous append that blocks the response. Model version has
to be logged explicitly alongside the vector, not inferred later from a deploy timestamp, because a
rollback, a canary at partial traffic, or two model versions briefly live at once all break the
assumption that "what was deployed at time T" is a single, lookup-able fact. Tecton's own
documentation shows the production-platform version of this same mechanism: a `LoggingConfig` on a
Feature Service continuously logs "online requests and feature vector responses" into a dataset,
with an optional sample rate — the identical shape this topic builds by hand, at a dial a team sets
rather than an architecture they invent from scratch.

</section>

<section data-section="lab">

## Lab

This topic hosts no lab of its own. Its logged rows feed directly into topic 4's dataset-
versioning example; `examples.py` here only builds and checks the logging and join mechanism
itself. The log-and-wait join (request id to request id, no recomputation) measured exactly zero
mismatches against every logged value across two thousand simulated requests — the "skew-free by
construction" claim, checked rather than assumed. A storage-cost estimate from a stated million-
request daily rate, a two-kilobyte vector, and a year of retention landed at roughly seven hundred
gibibytes — real multiplication, not a guessed order of magnitude. A cardinality check on the
logged vectors (dropping only the customer id) found every single simulated row still unique
across its remaining fields, confirming that redacting one obvious column does not anonymize a
feature vector built from several ordinary-looking numbers.

</section>

<section data-section="production">

## Production failures this topic warns about

**A logging pipeline's sample rate silently dropping to zero.** Nothing about a feature store or a
log point guarantees logging keeps happening; a config change, a quota, or a silent write failure
can empty the log with no visible symptom until a training job months later complains about an
empty or tiny dataset — by which point the gap in coverage can't be recovered, only explained.

**Treating a log as exempt from the platform's own data rules.** Google's own Rule #29 frames
logging as the fix for training-serving skew, but a log that captures real customer-derived feature
values is still customer data; a pipeline that logs every vector forever, at full sample rate,
with no stated retention limit, has quietly created exactly the kind of unlimited, possibly
re-identifying store the rest of the platform is built to avoid.

</section>

<section data-section="frontier">

## Frontier

AWS's own MLOps checklist names shadow and canary as two of several deployment strategies
("canary, shadow, blue/green, or A/B") and distinguishes them precisely: a canary "sends a small
portion of traffic to the new model initially" and acts on it, while a shadow deployment runs "the
new model alongside the existing model" where "both models receive traffic, but only the earlier
model outputs inference." Both reuse this topic's own logging mechanism; the only difference is
whether the decision box at the end of the lane gets to act on what was logged. Tecton's feature-
logging platform is this topic's hand-built log point at production scale, named here only as the
architecture's real-world shape, not retaught.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A logged vector proves what one request saw. It says nothing about whether this training set,
built from many such logs over many weeks, can be rebuilt byte for byte six months from now when
someone asks which data trained which model. The next topic is exactly that: giving a training set
a version and a lineage.

</section>
